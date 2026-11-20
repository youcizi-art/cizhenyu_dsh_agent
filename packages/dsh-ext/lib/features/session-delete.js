/**
 * Host: permanently delete one Session (not just archive).
 * Official DSH has archive/unarchive only; this is a productization path.
 */
import { rm } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string} sessionId
 * @returns {Promise<{ ok: true, deletedPath?: string } | { ok: false, code: string, message: string }>}
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

  try {
    await registry.archiveSession(id, { stopActivity: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // Already archived / unknown: continue best-effort cleanup.
    if (!/already|unknown|not found|no such session/i.test(msg)) {
      // Active-session without stopActivity should not happen when stopActivity:true.
      // Still proceed to detach/delete when archive refused for other soft reasons.
      if (!/archiv/i.test(msg)) {
        return { ok: false, code: "archive-failed", message: msg };
      }
    }
  }

  for (const workspace of registry.list()) {
    try {
      if (workspace.sessionIds?.includes(id)) {
        await workspace.detachSession(id);
      }
    } catch {
      // best-effort
    }
  }

  let deletedPath;
  const persistence = ctx.get("sessionPersistence");
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
    if (artifact) {
      deletedPath = dirname(artifact);
      await rm(deletedPath, { recursive: true, force: true });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, code: "fs-failed", message: msg, deletedPath };
  }

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
