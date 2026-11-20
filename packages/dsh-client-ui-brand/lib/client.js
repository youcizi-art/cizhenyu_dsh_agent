window.__ModuleLoader__.load({
	id: "@cizhenyu/dsh-client-ui-brand",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var jsx_runtime = require("react/jsx-runtime");
		var PRODUCT_EN = "CIZHENYU AGENT";
		var PRODUCT_ZH = "磁帧鱼 Agent";
		var HERO_TITLE_EN = "Cizhenyu Agent";
		var HERO_TITLE_ZH = "磁帧鱼 Agent";
		var LOGO = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 11167.54 11167.54\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" aria-hidden=\"true\">\n  <defs>\n    <linearGradient id=\"czb-g0\" gradientUnits=\"userSpaceOnUse\" x1=\"7953.96\" y1=\"6313.19\" x2=\"8570.38\" y2=\"8219.38\">\n      <stop offset=\"0\" stop-color=\"#07C0FF\"/>\n      <stop offset=\"1\" stop-color=\"#077CF0\"/>\n    </linearGradient>\n    <linearGradient id=\"czb-g1\" gradientUnits=\"userSpaceOnUse\" x1=\"5889.13\" y1=\"5821.79\" x2=\"3749.89\" y2=\"1543.28\">\n      <stop offset=\"0\" stop-color=\"#0051DE\"/>\n      <stop offset=\"1\" stop-color=\"#03B5FB\"/>\n    </linearGradient>\n    <linearGradient id=\"czb-g2\" gradientUnits=\"userSpaceOnUse\" x1=\"7328.54\" y1=\"4380.7\" x2=\"8031.04\" y2=\"2333.83\">\n      <stop offset=\"0\" stop-color=\"#DE2A2B\"/>\n      <stop offset=\"1\" stop-color=\"#FF6A42\"/>\n    </linearGradient>\n  </defs>\n  <path fill=\"url(#czb-g1)\" d=\"M729.51 5583.77c0,0 18.61,-181.35 63.95,-303.44 45.33,-122.09 556.84,-1267.26 1784.59,-2336.9 1446.52,-1260.24 3013.83,-1339.7 4762.68,-829.53 1149.34,335.34 2250.47,825.76 2429.42,908.5 216.25,99.96 369.71,202.29 369.71,455.73 0,253.44 0,727.77 0,727.77 0,0 18.63,253.45 -172.03,488.32 -190.68,234.86 -462.75,453.45 -858.04,306.94 -395.29,-146.5 -2020.63,-888.3 -3239.07,-785.98 -1164.65,97.8 -1721.65,877.57 -1788.88,1368.6 67.23,491.03 624.22,1270.8 1788.88,1368.6 1218.44,102.32 2843.78,-639.48 3239.07,-785.98 395.29,-146.5 667.36,72.09 858.04,306.94 190.67,234.87 172.03,488.32 172.03,488.32 0,0 0,474.33 0,727.77 0,253.44 -153.46,355.77 -369.71,455.73 -178.95,82.74 -1280.08,573.15 -2429.42,908.5 -1748.85,510.17 -3316.16,430.71 -4762.68,-829.53 -1227.74,-1069.64 -1739.26,-2214.81 -1784.59,-2336.9 -45.34,-122.09 -63.95,-303.44 -63.95,-303.44z\"/>\n  <path fill=\"url(#czb-g2)\" d=\"M8031.04 2333.83c870.1,298.63 1596.68,622.71 1739.11,688.56 216.25,99.96 369.71,202.29 369.71,455.73 0,253.44 0,727.77 0,727.77 0,0 18.63,253.45 -172.03,488.32 -190.68,234.86 -462.75,453.45 -858.04,306.94 -246.87,-91.51 -973.52,-415.19 -1781.22,-620.43l-0.02 -0.02c1234.71,-678.5 702.49,-2046.87 702.49,-2046.87z\"/>\n  <circle fill=\"#FEFEFE\" cx=\"2487.38\" cy=\"4780.19\" r=\"481.32\"/>\n  <path fill=\"url(#czb-g0)\" d=\"M8031.04 8833.7c870.1,-298.63 1596.68,-622.71 1739.11,-688.56 216.25,-99.96 369.71,-202.29 369.71,-455.73 0,-253.44 0,-727.77 0,-727.77 0,0 18.63,-253.45 -172.03,-488.32 -190.68,-234.86 -462.75,-453.45 -858.04,-306.94 -246.87,91.51 -973.52,415.19 -1781.22,620.43l-0.02 0.02c1234.71,678.5 702.49,2046.87 702.49,2046.87z\"/>\n</svg>\n";
		var CONVERSATION_NS = "conversation";
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
		function productName(locale) {
			return isZhLocale(locale) ? PRODUCT_ZH : PRODUCT_EN;
		}
		function heroTitle(locale) {
			return isZhLocale(locale) ? HERO_TITLE_ZH : HERO_TITLE_EN;
		}
		function setDocumentTitle(locale) {
			try {
				var title = productName(locale);
				if (typeof document !== "undefined" && document.title !== title) {
					document.title = title;
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
			if (locale.__cizhenyuHeroPatched) return;
			locale.__cizhenyuHeroPatched = true;
			var original = locale.translate.bind(locale);
			locale.translate = function (ns, key, params) {
				if (ns === CONVERSATION_NS && key === "hero.headline") return heroTitle(locale);
				if (ns === CONVERSATION_NS && key === "hero.preview") return "";
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
		function CizhenyuBrandName({ locale }) {
			return jsx_runtime.jsx("span", {
				style: {
					fontWeight: 600,
					fontSize: 14,
					letterSpacing: "-0.01em",
					whiteSpace: "nowrap",
					color: "inherit",
				},
				children: productName(locale),
			});
		}
		var inject = ["slots", "locale"];
		function apply(ctx) {
			setDocumentTitle(ctx.locale);
			hideHeroPreviewBadge();
			patchConversationHeroCopy(ctx.locale);
			var BrandNameBound = function () {
				return CizhenyuBrandName({ locale: ctx.locale });
			};
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", function* () {
				yield ctx.slots.register({ name: "sidebar.brand.mark", id: "cizhenyu" }, CizhenyuBrandMark);
				yield ctx.slots.register({ name: "sidebar.brand.name", id: "cizhenyu" }, BrandNameBound);
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
