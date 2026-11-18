# CIZHENYU AGENT 安装仓

1. 本仓是 Deploy 安装源（GitHub → `{workRoot}/agents/dsh_agent`）。
2. 官方内核：`@deepseek-ai/dsh`（`package.json` 钉版本）。
3. 品牌：`packages/dsh-client-ui-brand` + `deploy/cordis.brand.patch.yml`（必须用 `insert:` 挂新插件）。
4. 禁止在 Deploy WebView 做 DOM 品牌刮擦。
5. 禁止 `disabled: deepseek-account`（会卡死 account-controller）；关闭登录 UI 用 `ui-settings-account: disabled: true`。
6. 用户数据只在安装副本 `home/`。
