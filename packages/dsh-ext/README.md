# @cizhenyu/dsh-ext

磁帧鱼 / Cizhenyu 对 DeepSeek Harness 的产品扩展层。

- **Host**：`lib/index.js`（cordis Service `cizhenyuExt`）
- **Client**：`lib/client.js`（侧栏菜单等 UI）
- **Features**：`lib/features/*`

首个能力：会话硬删除（官方仅提供归档）。

安装根 `package.json` 依赖 `file:./packages/dsh-ext`，并由 `deploy/cordis.brand.patch.yml` `insert` 挂载。
