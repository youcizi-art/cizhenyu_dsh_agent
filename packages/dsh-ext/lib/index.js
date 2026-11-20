/**
 * @cizhenyu/dsh-ext — Host half.
 * Extensible product Service: add Remote methods + feature modules without new packages.
 */
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { deleteSessionHard } from "./features/session-delete.js";

/** Must match @deepseek-ai/dsh-typert-protocol internal descriptor key (SRC discovery). */
const REMOTE_METHOD_DESCRIPTOR = "@deepseek-ai/dsh-typert-protocol/remote-methods";

const REMOTE_METHODS = Object.freeze([
  Object.freeze({
    method: "deleteSession",
    invocation: Object.freeze({ kind: "direct" }),
  }),
]);

export const FEATURES = Object.freeze({
  "session-delete": {
    id: "session-delete",
    enabled: true,
    description: "Hard-delete sessions via Deploy bridge (confirm/loading on Deploy)",
  },
});

export class CizhenyuExtService extends TypertRemoteService {
  static inject = ["workspaceRegistry", "sessionPersistence"];

  constructor(ctx) {
    super(ctx, "cizhenyuExt");
  }

  /**
   * Permanently delete a Session via Deploy.
   * Parameter names are required for Gateway SRC wire mapping.
   * @param {string} sessionId
   * @param {string} workspaceId
   * @param {boolean} openNewSession
   * @param {string} displayTitle
   */
  async deleteSession(sessionId, workspaceId, openNewSession, displayTitle) {
    if (!FEATURES["session-delete"]?.enabled) {
      return { ok: false, code: "disabled", message: "session-delete feature is disabled" };
    }
    return deleteSessionHard(this.ctx, sessionId, {
      workspaceId: workspaceId ? String(workspaceId) : undefined,
      openNewSession: openNewSession === true || openNewSession === "true",
      displayTitle: displayTitle ? String(displayTitle) : undefined,
    });
  }
}

Object.defineProperty(CizhenyuExtService.prototype, REMOTE_METHOD_DESCRIPTOR, {
  configurable: true,
  value: Object.freeze({
    version: 1,
    methods: REMOTE_METHODS,
  }),
});

export default CizhenyuExtService;
