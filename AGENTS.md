# AGENTS.md — CIZHENYU AGENT 安装仓

## 原则

1. 本仓是 Deploy 安装源（与工具箱一致）：GitHub → `{workRoot}/agents/dsh_agent`。
2. 官方内核：`@deepseek-ai/dsh`（本仓 `package.json` 钉版本）。
3. 品牌等产品化：`packages/*` 插件 + `deploy/*.patch.yml`，禁止在 Deploy WebView 里 DOM 刮擦。
4. 禁止 `disabled: deepseek-account` 等会卡死 boot 的 patch。
5. 用户数据只在安装副本 `home/`；禁止读写本机 `~/.dsh`。

## 改动流程

1. 在本仓改插件 / patch
2. 提交并 `git push origin master`
3. 用户侧 Deploy「安装/更新 Agent」重新拉取本仓并 `npm install`
