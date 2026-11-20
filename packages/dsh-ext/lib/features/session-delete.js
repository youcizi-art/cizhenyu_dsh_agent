/**
 * Host: permanently delete one Session via Deploy agent bridge.
 * Confirm / Loading / hard remount live on Deploy — not in Agent WebView.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";

async function readDeployBridgeConfig() {
  const path = join(resolveDshHome(), ".cizhenyu", "deploy-bridge.json");
  const raw = await readFile(path, "utf8");
  const cfg = JSON.parse(raw);
  const baseUrl = String(cfg.baseUrl || "").replace(/\/$/, "");
  const token = String(cfg.token || "");
  if (!baseUrl || !token) {
    throw new Error("Deploy bridge config missing baseUrl/token（请先打开磁帧鱼 Deploy）");
  }
  return { baseUrl, token };
}

function resolveWorkspaceIdFromRegistry(ctx, sessionId) {
  try {
    const registry = ctx.workspaceRegistry ?? ctx.get?.("workspaceRegistry");
    if (!registry || typeof registry.list !== "function") return "";
    const list = registry.list();
    for (const ws of list || []) {
      const ids = ws?.sessionIds || [];
      if (Array.from(ids).includes(sessionId)) {
        return String(ws.id || "");
      }
    }
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string} sessionId
 * @param {{ workspaceId?: string, openNewSession?: boolean, displayTitle?: string }} [options]
 */
export async function deleteSessionHard(ctx, sessionId, options = {}) {
  const id = String(sessionId || "").trim();
  if (!id) {
    return { ok: false, code: "invalid-id", message: "sessionId is required" };
  }

  let workspaceId = String(options.workspaceId || "").trim();
  if (!workspaceId) {
    workspaceId = resolveWorkspaceIdFromRegistry(ctx, id);
  }
  const openNewSession = Boolean(options.openNewSession);
  const displayTitle = String(options.displayTitle || "").trim();

  let bridge;
  try {
    bridge = await readDeployBridgeConfig();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      code: "bridge-unavailable",
      message: msg || "无法读取 Deploy bridge 配置，请确认 Deploy 已启动",
    };
  }

  const payload = {
    sessionId: id,
    openNewSession,
    displayTitle,
  };
  if (workspaceId) payload.workspaceId = workspaceId;

  let response;
  try {
    response = await fetch(`${bridge.baseUrl}/v1/agent/sessions/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridge.token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (/fetch|network|ECONNRESET|aborted/i.test(msg)) {
      return {
        ok: true,
        restarted: true,
        message: "删除已提交，Agent 正在重启",
      };
    }
    return {
      ok: false,
      code: "bridge-unreachable",
      message: `无法连接 Deploy bridge：${msg}（请确认磁帧鱼 Deploy 正在运行）`,
    };
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (body && body.cancelled) {
    return { ok: true, cancelled: true, message: "cancelled" };
  }

  if (!response.ok || !body || body.ok === false) {
    return {
      ok: false,
      code: "delete-failed",
      message: String(body?.message || `Deploy bridge HTTP ${response.status}`),
    };
  }

  return {
    ok: true,
    restarted: Boolean(body.restarted),
    message: body.message ? String(body.message) : undefined,
    removedPaths: Array.isArray(body.removedPaths) ? body.removedPaths.map(String) : undefined,
  };
}
