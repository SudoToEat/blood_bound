# State Recovery Design

**Date:** 2026-03-12

## Goal

修复主持人刷新自动开局、`gamePhase` 语义混乱，以及调查官在新一局后本地诅咒分配残留的问题，同时保持玩家自定义姓名跨局保留。

## Chosen Approach

采用“读取状态”和“改变状态”分离的方案：

- 主持人恢复连接时改为读取房间信息，不再调用会改变服务端房间阶段的 `/start`。
- 前后端统一按服务端 `gameState.phase` 映射客户端阶段，移除 `joinRoom` 直接推进到 `playing` 的行为。
- 玩家端把调查官诅咒分配 UI 的本地状态和“局”绑定，在新一局对象切换后自动清空。

## Alternatives Considered

### Option A: Split read and write semantics

保留现有房间模型，只修正恢复连接和阶段同步逻辑。优点是改动小、风险低，并且直接解决当前缺陷。缺点是仍然依赖较宽松的 `phase: string` 类型。

### Option B: Frontend-only guards around `/start`

只在前端避免某些路径调用 `/start`。优点是改动更少；缺点是服务端/Socket 语义仍混乱，后续仍容易回归。

### Option C: Full state-machine refactor

将房间和游戏改成更严格的状态机。优点是最干净；缺点是超出本次修复范围。

## Design Details

### Host recovery

- `GameContext` 挂载恢复流程改用 `ApiService.getRoomInfo(roomId)`。
- 只在服务端明确返回 `phase === 'playing'` 时把客户端切到 `playing`。
- 无论 `waiting` 还是 `playing`，主持人都恢复 socket 连接和玩家列表，但 UI 阶段由真实 `phase` 决定。

### Phase mapping

- 新增一个纯函数工具，把服务端 `phase` 映射到客户端 `setup | playing | ended`。
- `joinRoom`、`roomState`、`gameStateUpdated`、`startGame`、`restartGame` 和恢复连接都统一走这套映射。
- 服务端 `joinRoom` 返回的 `roomState.gameState.phase` 不再写死为 `playing`，而是返回 `room.gameState.phase`。

### Inquisitor local UI reset

- 调查官诅咒分配的本地状态以“本局玩家对象标识”作为依赖重置。
- 使用服务端每局重新生成的 `accessCode` 作为 round key 的一部分，确保同一座位再次成为调查官时也能清空旧选择。

## Testing Strategy

- 新增 `node:test` 回归测试，覆盖：
  - `waiting` 不应映射成客户端 `playing`
  - `playing` / `ended` 的映射正确
  - 新一局玩家 round key 变化时，本地状态应视为新局
- 手动验证路径：
  - 主持人创建房间但未进入游戏面板时刷新，仍停留在房间准备页
  - 玩家扫码加入后仍能看身份，但不会让主持人自动进入游戏面板
  - 开始新一局后，调查官旧的诅咒分配选择不会残留
