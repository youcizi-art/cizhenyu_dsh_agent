# CIZHENYU AGENT

Deploy 按工具箱同一套路安装：GitHub ZIP → `{systemRoot}/agents/dsh_agent` → `npm install` → 预装社区市场。

| 角色 | 路径 |
|------|------|
| 源码 | `F:\cizhenyu\agents\dsh_agent` → `youcizi-art/cizhenyu_dsh_agent` |
| 安装副本 | `{systemRoot}/agents/dsh_agent` |
| 数据面 | 安装副本 `home/`（`DSH_HOME`） |

## 结构

- `package.json`：钉 `@deepseek-ai/dsh` + 本地品牌包 + 扩展包
- `packages/dsh-client-ui-brand`：侧栏 / 对话 hero 品牌槽位
- `packages/dsh-ext`：产品扩展（会话删除等 feature；后续 UI/能力优先加这里）
- `deploy/cordis.brand.patch.yml`：插入品牌/扩展插件、关闭官方品牌与账号登录 UI
- `deploy/manifest.json` → `market`：钉 `dshmarket`；Deploy 写入 `home/profiles/web`（`dsh plugin add`）

打开 Agent 后：`Plugins → Plugin Market`（或 Settings → Plugin Market，视 dsh 版本而定）。

## 改品牌

```bash
cd packages/dsh-client-ui-brand
python _gen_client.py
```

## 改扩展（如会话删除）

编辑 `packages/dsh-ext`（见包内 `AGENTS.md`），提交并 push；用户侧 Deploy 重装/更新 Agent。

## 许可证

MIT。基于 DeepSeek Harness（MIT）扩展。
