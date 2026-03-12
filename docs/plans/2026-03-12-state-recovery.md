# State Recovery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复主持人刷新自动开局、统一前后端阶段语义，并清理调查官跨局残留的本地分配状态。

**Architecture:** 提取纯函数统一服务端阶段到客户端阶段的映射，再让 `GameContext` 和服务端 Socket 事件都使用这套语义。玩家端通过 round key 检测新一局并重置诅咒分配 UI。

**Tech Stack:** React 18, TypeScript, Express, Socket.IO, Node `node:test`

---

### Task 1: Add regression helpers and tests

**Files:**
- Create: `src/utils/gameState.ts`
- Create: `src/utils/gameState.test.ts`

**Step 1: Write the failing test**

覆盖 `waiting -> setup`、`playing -> playing`、`ended -> ended`，以及不同局的 round key 变化。

**Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types src/utils/gameState.test.ts`

Expected: fail because helper module does not exist yet.

**Step 3: Write minimal implementation**

实现阶段映射和 round key 生成函数。

**Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types src/utils/gameState.test.ts`

Expected: pass.

### Task 2: Fix host recovery and client phase syncing

**Files:**
- Modify: `src/context/GameContext.tsx`
- Modify: `src/utils/apiService.ts` if typing adjustments are needed
- Modify: `src/types/socketTypes.ts` if phase typing adjustments are needed

**Step 1: Update recovery flow**

把挂载恢复逻辑从 `startGame()` 改成 `getRoomInfo()`，避免刷新改变服务端状态。

**Step 2: Route all phase updates through helper**

`joinRoom`、`roomState`、`gameStateUpdated`、`startGame`、`restartGame`、恢复连接统一按 helper 设置客户端阶段。

**Step 3: Verify**

Run: `node --test --experimental-strip-types src/utils/gameState.test.ts`

Expected: pass.

### Task 3: Fix server roomState phase and inquisitor local reset

**Files:**
- Modify: `server/index.js`
- Modify: `src/components/PlayerView.tsx`
- Modify: `src/components/GameBoard.tsx`

**Step 1: Return the real server phase in roomState**

Socket `joinRoom` 使用 `room.gameState.phase`，不再写死 `playing`。

**Step 2: Reset local curse allocations on new round**

使用 round key 依赖重置 `curseAllocations`。

**Step 3: Fix touched compile issue**

把 `GameBoard` 中错误的 `setSelectedPlayer` 调整为 `setSelectedPlayerId(null)`。

**Step 4: Verify**

Run:
- `node --test --experimental-strip-types src/utils/gameState.test.ts`
- `npx tsc --noEmit src/context/GameContext.tsx src/components/PlayerView.tsx src/components/GameBoard.tsx src/utils/gameState.ts`

Expected:
- test passes
- targeted type-check passes, or report remaining repo-wide blockers
