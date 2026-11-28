# CIZHENYU AGENT 安装仓

1. 本仓是 Deploy 安装源（GitHub → `{systemRoot}/agents/dsh_agent`）。
2. 官方内核：`@deepseek-ai/dsh`（`package.json` 钉版本）。
3. 品牌：`packages/dsh-client-ui-brand` + `deploy/cordis.brand.patch.yml`（必须用 `insert:` 挂新插件）。
4. 产品扩展（会话删除等）：`packages/dsh-ext`（feature 模块化；后续 UI/能力加在此包，勿改安装目录）。
5. 社区插件市场：`deploy/manifest.json` → `market`（`dshmarket`）；Deploy 安装时执行 `dsh plugin --profile web add dshmarket@…` 写入 `home/profiles/web`。目录仍来自 awesome-dsh-plugin。
6. 禁止在 Deploy WebView 做 DOM 品牌刮擦。
7. 禁止 `disabled: deepseek-account`（会卡死 account-controller）；关闭登录 UI 用 `ui-settings-account: disabled: true`。
8. 用户数据只在安装副本 `home/`。
9. 聊天里出现裸 DSML / 工具调用原文、带图任务无法改 logo：通常是 Free Token 网关 Anthropic↔OpenAI 工具往返丢失（修 `scripts/free-token`，不是改 DSH 内核）。接线后确认 `wire.dshWired=true`。
