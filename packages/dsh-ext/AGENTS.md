# @cizhenyu/dsh-ext

产品扩展插件（非品牌槽位）。后续 UI / 宿主能力都往这里加 feature，避免再开大量一次性包。

## 原则

1. **只改源码仓** `F:\cizhenyu\agents\dsh_agent`，禁止改用户安装目录业务代码。
2. **feature 模块化**：`lib/features/<name>.js`（host）+ `lib/client.js` 内对应 `registerXxx`（client）。
3. **宿主 Remote**：统一挂在 service `cizhenyuExt` 上；新 RPC 用 SRC marker（`REMOTE_METHODS`），客户端用 `connection.rpc.call('/api', 'cizhenyuExt/<method>', …)`。
4. **不要**把逻辑写进 `@cizhenyu/dsh-client-ui-brand`（品牌专用）。

## 现有 feature

| id | 说明 |
|----|------|
| `session-delete` | ⋯菜单删除 → Deploy bridge 停进程后清盘（真实删除，非归档） |

## 加新 feature 步骤

1. `lib/features/<id>.js` 实现 host 侧（如需）。
2. 在 `lib/index.js` 的 `FEATURES` 注册表挂上。
3. 如需 RPC：在 `CizhenyuExtService` 加方法，并写入 `REMOTE_METHODS`。
4. 在 `lib/client.js` 增加 `register…(ctx)`，于 `apply` 里调用。
5. 更新本文件表格；push 后 Deploy 重装 Agent。
