window.__ModuleLoader__.load({
	id: "@cizhenyu/dsh-ext",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		var react = require("react");
		var jsx_runtime = require("react/jsx-runtime");
		var primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		var store = require("@deepseek-ai/dsh-client-store");

		/** Stable Remote namespace — keep in sync with host `cizhenyuExt`. */
		var EXT_NS = "cizhenyuExt";

		function isZhLocale(locale) {
			try {
				var code = "";
				if (locale && typeof locale.locale === "string") code = locale.locale;
				else if (locale && typeof locale.lang === "string") code = locale.lang;
				else if (typeof document !== "undefined" && document.documentElement) {
					code = document.documentElement.lang || "";
				}
				return String(code).toLowerCase().startsWith("zh");
			} catch (e) {
				return false;
			}
		}

		function copy(locale) {
			var zh = isZhLocale(locale);
			return {
				deleteLabel: zh ? "删除会话" : "Delete session",
				runningLabel: zh ? "进行中，无法删除" : "Running — cannot delete",
				confirmTitle: zh ? "永久删除会话" : "Permanently delete session",
				confirmDesc: function (title) {
					var name = title || "";
					if (zh) {
						return "确定永久删除会话" + (name ? "「" + name + "」" : "") + "？此操作不可恢复，磁盘上的对话记录也会被删除。";
					}
					return "Permanently delete this session" + (name ? ' "' + name + '"' : "") + "? This cannot be undone; chat logs on disk will be removed.";
				},
				cancel: zh ? "取消" : "Cancel",
				confirmAction: zh ? "删除" : "Delete",
				close: zh ? "关闭" : "Close",
				pending: zh ? "正在删除…" : "Deleting…",
				runningAlert: zh
					? "会话正在进行中，请先停止后再删除。"
					: "This session is still running. Stop it before deleting.",
			};
		}

		/**
		 * Call host SRC Remote without a generated typert.remote-client stub.
		 */
		async function callExt(ctx, method, args) {
			var connection = ctx.get("connection");
			if (!connection || !connection.rpc || typeof connection.rpc.call !== "function") {
				throw new Error("connection.rpc is unavailable");
			}
			var endpoint = EXT_NS + "/" + method;
			var result = await connection.rpc.call("/api", endpoint, { args: args || {} });
			if (!result || result.ok === false) {
				var err = result && result.error;
				var message = err && (err.message || err.code) ? String(err.message || err.code) : "remote call failed";
				throw new Error(message);
			}
			return result.value;
		}

		function isSessionRunning(ctx, sessionId) {
			try {
				var ui = ctx.get("uiSession");
				if (ui && ui.sessionStatus && typeof ui.sessionStatus.getSnapshot === "function") {
					var statuses = ui.sessionStatus.getSnapshot();
					var status = statuses && typeof statuses.get === "function" ? statuses.get(sessionId) : undefined;
					if (status && status.running === true) return true;
					if (status && status.running === false) {
						/* fall through to list row as secondary signal */
					}
				}
			} catch (e) {}
			try {
				var list = ctx.sessions.list.getSnapshot();
				var row = list && list.byId ? list.byId[sessionId] : undefined;
				return !!(row && row.running);
			} catch (e2) {
				return false;
			}
		}

		function isCurrentMainViewSession(ctx, sessionId) {
			try {
				var list = ctx.sessions.list.getSnapshot();
				var row = list && list.byId ? list.byId[sessionId] : undefined;
				return !!row && (row.retainedBy && row.retainedBy.mainView ? row.retainedBy.mainView : 0) > 0;
			} catch (e) {
				return false;
			}
		}

		function findWorkspaceId(ctx, sessionId) {
			try {
				var snap = ctx.workspaces.list.getSnapshot();
				var items = snap && snap.items ? snap.items : [];
				for (var i = 0; i < items.length; i++) {
					var ids = items[i].sessionIds || [];
					if (ids.indexOf(sessionId) >= 0) return String(items[i].workspaceId || "");
				}
			} catch (e) {}
			return "";
		}

		function DeleteConfirmDialog(props) {
			var request = props.useDeleteRequest(function (pending) {
				return pending;
			});
			var locale = props.locale;
			var onSettle = props.settleDelete;
			var onConfirm = props.confirmDelete;
			var texts = copy(locale);
			var state = react.useState(false);
			var deleting = state[0];
			var setDeleting = state[1];
			var errState = react.useState(null);
			var error = errState[0];
			var setError = errState[1];

			if (request === null || request === undefined) return null;

			var close = function () {
				if (deleting) return;
				onSettle();
			};

			var confirm = function () {
				setDeleting(true);
				setError(null);
				Promise.resolve(onConfirm(request))
					.then(function () {
						setDeleting(false);
						onSettle();
					})
					.catch(function (reason) {
						setDeleting(false);
						setError(reason instanceof Error ? reason.message : String(reason));
					});
			};

			return jsx_runtime.jsxs(primitives.Modal, {
				open: true,
				onClose: close,
				closeLabel: texts.close,
				title: texts.confirmTitle,
				description: texts.confirmDesc(request.displayTitle),
				footer: jsx_runtime.jsxs(jsx_runtime.Fragment, {
					children: [
						jsx_runtime.jsx(primitives.Button, {
							variant: "outline",
							disabled: deleting,
							onClick: close,
							children: texts.cancel,
						}),
						jsx_runtime.jsx(primitives.Button, {
							variant: "outline",
							disabled: deleting,
							onClick: confirm,
							style: { color: "var(--dsh-danger, #c62828)" },
							children: texts.confirmAction,
						}),
					],
				}),
				children: [
					deleting
						? jsx_runtime.jsx("div", {
								role: "status",
								style: { marginTop: 8, fontSize: 13, opacity: 0.8 },
								children: texts.pending,
							})
						: null,
					error !== null
						? jsx_runtime.jsx("div", {
								role: "alert",
								style: { marginTop: 8, fontSize: 13, color: "var(--dsh-danger, #c62828)" },
								children: error,
							})
						: null,
				],
			});
		}

		/**
		 * Feature: session-delete
		 * Only via session "⋯" context menu (no hover shortcut — avoid misclicks).
		 * Confirm uses shell.overlay Modal — window.confirm is unreliable in Tauri WebView.
		 */
		function registerSessionDelete(ctx) {
			var deleteRequest = store.createSnapshotStore(null);

			ctx.effect(function () {
				return ctx.contextMenus.register({
					id: "session.cizhenyu.delete",
					target: "session",
					order: 700,
					observe: function () {
						var obs = [ctx.locale, ctx.sessions.list];
						try {
							var ui = ctx.get("uiSession");
							if (ui && ui.sessionStatus) obs.push(ui.sessionStatus);
						} catch (e) {}
						return obs;
					},
					resolve: function (target) {
						var texts = copy(ctx.locale);
						var running = isSessionRunning(ctx, target.sessionId);
						return [
							{
								id: "cizhenyu-delete",
								label: running ? texts.runningLabel : texts.deleteLabel,
								icon: { key: "workspace.delete" },
								danger: true,
								disabled: running,
								separatorBefore: true,
								afterContent: true,
								failureLabel: texts.runningAlert,
								run: function () {
									if (isSessionRunning(ctx, target.sessionId)) {
										window.alert(texts.runningAlert);
										return;
									}
									deleteRequest.set({
										sessionId: target.sessionId,
										displayTitle: target.displayTitle || "",
										workspaceId: findWorkspaceId(ctx, target.sessionId),
										openNewSession: isCurrentMainViewSession(ctx, target.sessionId),
									});
								},
							},
						];
					},
				});
			}, "cizhenyu-ext: session delete menu");

			ctx.slots.inject("shell.overlay", function* () {
				yield ctx.slots.register(
					{
						name: "shell.overlay",
						id: "cizhenyu.session-delete",
						inject: function () {
							return {
								hooks: { deleteRequest: deleteRequest },
								locale: ctx.locale,
								settleDelete: function () {
									deleteRequest.set(null);
								},
								confirmDelete: async function (request) {
									if (!request || !request.sessionId) return;
									if (isSessionRunning(ctx, request.sessionId)) {
										throw new Error(copy(ctx.locale).runningAlert);
									}
									var args = { sessionId: request.sessionId };
									if (request.openNewSession && request.workspaceId) {
										args.workspaceId = request.workspaceId;
										args.openNewSession = true;
									} else if (request.openNewSession) {
										/* current but ungrouped: still flag so Deploy refreshes away from deleted id */
										args.openNewSession = true;
									}
									var value = await callExt(ctx, "deleteSession", args);
									if (value && value.ok === false) {
										throw new Error(value.message || value.code || "delete failed");
									}
									if (value && value.restarted === false && value.message) {
										window.alert(String(value.message));
									}
								},
							};
						},
					},
					DeleteConfirmDialog,
				);
			});
		}

		/**
		 * Client feature registry — add entries without restructuring apply().
		 */
		var CLIENT_FEATURES = [
			{ id: "session-delete", enabled: true, register: registerSessionDelete },
		];

		var inject = ["contextMenus", "locale", "connection", "slots", "sessions", "workspaces"];

		function apply(ctx) {
			for (var i = 0; i < CLIENT_FEATURES.length; i++) {
				var feature = CLIENT_FEATURES[i];
				if (!feature.enabled) continue;
				try {
					feature.register(ctx);
				} catch (error) {
					console.warn("[cizhenyu-ext] feature failed:", feature.id, error);
				}
			}
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.CLIENT_FEATURES = CLIENT_FEATURES;
		return module.exports;
	},
});
