/**
 * Host: permanently delete one Session (not just archive).
 * Official DSH has archive/unarchive only; this is a productization path.
 *
 * Ungrouped sessions are often missing from workspace.sessionIds — detach is a
 * no-op for them; archive + durable file/cache removal still applies.
 */
import { rm, readdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";

/**
 * @param {string} path
 */
async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Find session directories under DSH_HOME/sessions when persistence.stat has no location.
 * @param {string} sessionId
 * @returns {Promise<string[]>}
 */
async function findSessionDirs(sessionId) {
  const root = join(resolveDshHome(), "sessions");
  if (!(await pathExists(root))) return [];
  const found = [];
  let projects = [];
  try {
    projects = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const project of projects) {
    if (!project.isDirectory()) continue;
    const projectPath = join(root, project.name);
    let children = [];
    try {
      children = await readdir(projectPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const child of children) {
      if (!child.isDirectory()) continue;
      // JSONL backends use encodeSegment(id); safe UUID ids usually stay literal.
      if (child.name === sessionId || child.name.includes(sessionId)) {
        found.push(join(projectPath, child.name));
      }
    }
  }
  return found;
}

/**
 * @param {string} sessionId
 */
async function removeProjectionCache(sessionId) {
  const cacheFile = join(
    resolveDshHome(),
    "storages",
    "session_projcache",
    "sessions",
    `${sessionId}.json`,
  );
  try {
    await rm(cacheFile, { force: true });
  } catch {
    // ignore
  }
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string} sessionId
 * @returns {Promise<{ ok: true, deletedPath?: string } | { ok: false, code: string, message: string, deletedPath?: string }>}
 */
export async function deleteSessionHard(ctx, sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) {
    return { ok: false, code: "invalid-id", message: "sessionId is required" };
  }

  const registry = ctx.get("workspaceRegistry");
  if (!registry) {
    return { ok: false, code: "unavailable", message: "workspaceRegistry is unavailable" };
  }

  // 1) Stop activity + hide from default sidebar (works for ungrouped too).
  try {
    await registry.archiveSession(id, { stopActivity: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!/already|unknown|not found|no such session/i.test(msg)) {
      // Continue best-effort: ungrouped / cold sessions may still have files to purge.
      ctx.logger?.warn?.(`[cizhenyu-ext] archiveSession(${id}): ${msg}`);
    }
  }

  // 2) Detach from every workspace account (no-op when already ungrouped).
  for (const workspace of registry.list()) {
    try {
      const members = workspace.sessionIds ?? [];
      if (members.some((member) => String(member) === id)) {
        await workspace.detachSession(id);
      }
    } catch {
      // best-effort
    }
  }

  // 3) Remove durable artifacts (+ fallback scan for ungrouped / missing location).
  let deletedPath;
  const persistence = ctx.get("sessionPersistence");
  const dirs = new Set();
  try {
    let artifact;
    if (persistence?.stat) {
      const snap = await persistence.stat(id);
      artifact = snap?.location?.path;
    }
    if (!artifact && persistence?.list) {
      const all = await persistence.list();
      const hit = all.find((row) => String(row?.header?.id || "") === id);
      artifact = hit?.location?.path;
    }
    if (artifact) dirs.add(dirname(artifact));
    for (const dir of await findSessionDirs(id)) dirs.add(dir);

    for (const dir of dirs) {
      await rm(dir, { recursive: true, force: true });
      deletedPath = dir;
    }
    await removeProjectionCache(id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, code: "fs-failed", message: msg, deletedPath };
  }

  // 4) Drop archive tombstone when the live store no longer holds the session.
  //    If still live, keep archived so it stays hidden until process restart.
  const live = ctx.get("sessions")?.get?.(id);
  if (!live) {
    try {
      await registry.unarchiveSession(id);
    } catch {
      // keep archived tombstone if unarchive fails
    }
  }

  return { ok: true, deletedPath };
}
