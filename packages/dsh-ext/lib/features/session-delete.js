/**
 * Host: permanently delete one Session via Deploy agent bridge.
 *
 * Why not in-process archive/detach/rm?
 * - detachSession 只会把会话挪到「未分组」
 * - archive 只是注册表隐藏
 * - Agent 进程持有会话文件锁时 rm 会失败，看起来像「删不掉」
 *
 * Deploy 权威链路：停 web → 清 DSH_HOME 会话目录/投影缓存/workspace 注册表 → 再拉起。
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";

/**
 * @returns {Promise<{ baseUrl: string, token: string }>}
 */
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

/**
 * @param {string} sessionId
 * @returns {Promise<{ ok: true, restarted?: boolean, message?: string, removedPaths?: string[] } | { ok: false, code: string, message: string }>}
 */
export async function deleteSessionHard(_ctx, sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) {
    return { ok: false, code: "invalid-id", message: "sessionId is required" };
  }

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

  let response;
  try {
    response = await fetch(`${bridge.baseUrl}/v1/agent/sessions/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridge.token}`,
      },
      body: JSON.stringify({ sessionId: id }),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
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
