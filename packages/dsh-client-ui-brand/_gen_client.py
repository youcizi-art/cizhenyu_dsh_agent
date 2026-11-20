import json
from pathlib import Path

root = Path(__file__).resolve().parent
svg = (root / "assets" / "cizhenyu-logo.svg").read_text(encoding="utf-8").replace("cz-logo-g", "czb-g")
logo_js = json.dumps(svg)
product_js = json.dumps("CIZHENYU AGENT")
hero_js = json.dumps("Cizhenyu Agent")
client = """window.__ModuleLoader__.load({
	id: "@cizhenyu/dsh-client-ui-brand",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var jsx_runtime = require("react/jsx-runtime");
		var PRODUCT = %s;
		var HERO_TITLE = %s;
		var LOGO = %s;
		function setDocumentTitle() {
			try {
				if (typeof document !== "undefined" && document.title !== PRODUCT) {
					document.title = PRODUCT;
				}
			} catch (e) {}
		}
		function hideHeroPreviewBadge() {
			try {
				if (typeof document === "undefined") return;
				var id = "cizhenyu-hero-preview-hide";
				if (document.getElementById(id)) return;
				var style = document.createElement("style");
				style.id = id;
				style.textContent = ".pXSMma_previewBadge{display:none!important}";
				(document.head || document.documentElement).appendChild(style);
			} catch (e) {}
		}
		function patchConversationHeroCopy(locale) {
			if (!locale || typeof locale.translate !== "function") return;
			var original = locale.translate.bind(locale);
			locale.translate = function (ns, key, params) {
				if (ns === "ui-conversation" && key === "hero.headline") return HERO_TITLE;
				if (ns === "ui-conversation" && key === "hero.preview") return "";
				return original(ns, key, params);
			};
		}
		function CizhenyuBrandMark({ size }) {
			var s = typeof size === "number" && size > 0 ? size : 24;
			return jsx_runtime.jsx("span", {
				"aria-hidden": "true",
				style: {
					display: "inline-flex",
					width: s,
					height: s,
					flex: "0 0 auto",
					lineHeight: 0,
				},
				dangerouslySetInnerHTML: { __html: LOGO },
			});
		}
		function CizhenyuBrandName() {
			return jsx_runtime.jsx("span", {
				style: {
					fontWeight: 600,
					fontSize: 14,
					letterSpacing: "-0.01em",
					whiteSpace: "nowrap",
					color: "inherit",
				},
				children: PRODUCT,
			});
		}
		var inject = ["slots", "locale"];
		function apply(ctx) {
			setDocumentTitle();
			hideHeroPreviewBadge();
			patchConversationHeroCopy(ctx.locale);
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", function* () {
				yield ctx.slots.register({ name: "sidebar.brand.mark", id: "cizhenyu" }, CizhenyuBrandMark);
				yield ctx.slots.register({ name: "sidebar.brand.name", id: "cizhenyu" }, CizhenyuBrandName);
			}));
			ctx.slots.inject("conversation.hero.brand.mark", function* () {
				yield ctx.slots.register({ name: "conversation.hero.brand.mark", id: "cizhenyu" }, CizhenyuBrandMark);
			});
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
""" % (product_js, hero_js, logo_js)
(root / "lib" / "client.js").write_text(client, encoding="utf-8")
(root / "lib" / "index.js").write_text(
    "export function apply() {}\n",
    encoding="utf-8",
)
print("ok", len(client))
