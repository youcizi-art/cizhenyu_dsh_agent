# @cizhenyu/dsh-ext

磁帧鱼 / Cizhenyu 对 DeepSeek Harness 的产品扩展层。

- **Host**：`lib/index.js`（cordis Service `cizhenyuExt`）
- **Client**：`lib/client.js`（侧栏菜单等 UI）
- **Features**：`lib/features/*`

首个能力：会话硬删除（官方仅提供归档）。

删除链路依赖 **磁帧鱼 Deploy** 本机 bridge（`127.0.0.1:13991`，配置写入 `{DSH_HOME}/.cizhenyu/deploy-bridge.json`）：停 Agent web → 清会话目录/注册表 → 再拉起。请保持 Deploy 运行。

安装根 `package.json` 依赖 `file:./packages/dsh-ext`，并由 `deploy/cordis.brand.patch.yml` `insert` 挂载。
