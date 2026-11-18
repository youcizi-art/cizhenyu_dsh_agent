# CIZHENYU AGENT（DSH 安装仓）

Deploy 与工具箱同一套路：本仓是**源码**，推到 GitHub 后由软件 ZIP/Git 拉取并安装到 `{workRoot}/agents/dsh_agent`。

| 角色 | 路径 |
|------|------|
| 源码 | `F:\cizhenyu\agents\dsh_agent` → GitHub `youcizi-art/cizhenyu_dsh_agent` |
| 安装副本 | `{workRoot}/agents/dsh_agent`（如 `D:\cizhenyu\agents\dsh_agent`） |
| 数据面 | 安装副本下 `home/`（`DSH_HOME`，与 `~/.dsh` 隔离） |

## 结构

```
package.json                          # 安装根：钉 @deepseek-ai/dsh + 本地品牌包
packages/dsh-client-ui-brand/         # @cizhenyu/dsh-client-ui-brand（sidebar slots）
deploy/cordis.brand.patch.yml         # 合并进 DSH_HOME/profiles/web/cordis.patch.yml
deploy/manifest.json
```

## 本地改品牌

```bash
cd packages/dsh-client-ui-brand
# 改 assets/cizhenyu-logo.svg 后
python _gen_client.py
cd ../..
npm install
npx dsh web --no-open --port 13880
```

## 许可证

MIT。基于 DeepSeek Harness（MIT）扩展；勿冒充官方 DeepSeek Harness。
