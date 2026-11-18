# @cizhenyu/dsh-client-ui-brand

CIZHENYU AGENT 的 **DSH 客户端品牌插件**（方案 B）。

- 运行时内核仍是官方 [`@deepseek-ai/dsh`](https://www.npmjs.com/package/@deepseek-ai/dsh)
- 本仓只发布可安装的 cordis **client 插件**，注册 `sidebar.brand.mark` / `sidebar.brand.name`
- Deploy 安装官方 dsh 后，再安装本包，并把 `deploy/cordis.brand.patch.yml` 合并进独立 `DSH_HOME`

仓库：[youcizi-art/cizhenyu_dsh_agent](https://github.com/youcizi-art/cizhenyu_dsh_agent.git)

## 本地开发

```bash
# 改 assets/cizhenyu-logo.svg 后重新生成 browser 半包
python _gen_client.py

# 在已安装 dsh 的目录里用 file: 依赖联调
cd D:\cizhenyu\agents\dsh_agent
npm install git+https://github.com/youcizi-art/cizhenyu_dsh_agent.git#master
# 或：npm install F:\cizhenyu\agents\dsh_agent
```

把 `deploy/cordis.brand.patch.yml` 合并到 `home/profiles/web/cordis.patch.yml` 后执行：

```bash
npx dsh web --no-open --port 13880
```

## Deploy 安装约定

| 项 | 值 |
|----|----|
| npm 包名 | `@cizhenyu/dsh-client-ui-brand` |
| 安装源 | `git+https://github.com/youcizi-art/cizhenyu_dsh_agent.git#master` |
| cordis id | `ui-brand-cizhenyu` |
| 关闭官方品牌 | `ui-brand-official: disabled: true` |

后续 CMS / 其它扩展：在本仓增加 `packages/<name>/` 同类插件，Deploy 按 manifest 安装即可（v0.1 先单包根目录）。

## 许可证

MIT。基于 DeepSeek Harness（MIT）槽位扩展；勿冒充官方 DeepSeek Harness。
