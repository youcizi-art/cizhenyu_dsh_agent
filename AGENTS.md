# AGENTS.md — Cizhenyu DSH 插件仓

本仓只做 **DSH 插件包**，不维护官方 Harness 全量源码。

## 原则

1. 官方内核：`@deepseek-ai/dsh`（Deploy 钉版本安装）。
2. 我们的改动：本仓插件（品牌、后续 CMS 对接等），通过 cordis 槽位 / patch 接入。
3. 禁止在 Deploy WebView 里 DOM 刮擦品牌当主路径。
4. 禁止 `disabled: deepseek-account` 等会卡死 boot 的 patch。
5. 简单优先：一个插件一个包；先能用再抽象。

## 改品牌流程

1. 改 `assets/cizhenyu-logo.svg` 或 `lib/` 生成脚本
2. `python _gen_client.py`
3. 本地挂到已装 dsh 的 `node_modules` 验证
4. 提交并 `git push origin master`
5. 用户侧 Deploy「安装/更新 Agent」拉取

## 文件

- `lib/client.js` — browser 半包（ModuleLoader）
- `lib/index.js` — host 空 apply
- `deploy/cordis.patch.yml` — Deploy 合并进 `DSH_HOME`
