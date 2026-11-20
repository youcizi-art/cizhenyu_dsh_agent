window.__ModuleLoader__.load({
	id: "@cizhenyu/dsh-ext",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

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

		function labelDelete(locale) {
			return isZhLocale(locale) ? "删除会话" : "Delete session";
		}

		function confirmDelete(locale, title) {
			var name = title || "";
			if (isZhLocale(locale)) {
				return window.confirm(
					"确定永久删除会话" + (name ? "「" + name + "」" : "") + "？\n此操作不可恢复，磁盘上的对话记录也会被删除。",
				);
			}
			return window.confirm(
				"Permanently delete this session" + (name ? ' "' + name + '"' : "") + "?\nThis cannot be undone; chat logs on disk will be removed.",
			);
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

		async function runDelete(ctx, sessionId, displayTitle) {
			if (!confirmDelete(ctx.locale, displayTitle)) return;
			try {
				var value = await callExt(ctx, "deleteSession", { sessionId: sessionId });
				if (value && value.ok === false) {
					window.alert(value.message || value.code || "delete failed");
				}
			} catch (error) {
				window.alert(error instanceof Error ? error.message : String(error));
			}
		}

		/**
		 * Feature: session-delete
		 * Only via session "⋯" context menu (no hover shortcut — avoid misclicks).
		 * Icon reuses workspace.delete → IconTrashOutlineRegular (same as workspace delete).
		 */
		function registerSessionDelete(ctx) {
			ctx.effect(function () {
				return ctx.contextMenus.register({
					id: "session.cizhenyu.delete",
					target: "session",
					order: 700,
					observe: function () {
						return [ctx.locale];
					},
					resolve: function (target) {
						return [{
							id: "cizhenyu-delete",
							label: labelDelete(ctx.locale),
							icon: { key: "workspace.delete" },
							danger: true,
							separatorBefore: true,
							afterContent: true,
							run: function () {
								void runDelete(ctx, target.sessionId, target.displayTitle);
							},
						}];
					},
				});
			}, "cizhenyu-ext: session delete menu");
		}

		/**
		 * Client feature registry — add entries without restructuring apply().
		 */
		var CLIENT_FEATURES = [
			{ id: "session-delete", enabled: true, register: registerSessionDelete },
		];

		var inject = ["contextMenus", "locale", "connection"];

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
