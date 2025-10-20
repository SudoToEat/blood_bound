# Claude AI 开发者指南

> 本文档用于帮助 Claude AI 快速理解项目结构和当前代码状态，便于后续开发工作

**最后更新**: 2025-01-20
**项目版本**: v2.0.0

---

## 📋 项目概述

**项目名称**: 鲜血盟约 (Blood Bound)
**项目类型**: 基于WebSocket的多人在线桌游辅助工具
**技术栈**: React + TypeScript + Vite (前端) + Node.js + Express + Socket.IO (后端)

### 核心功能
1. 多设备实时同步游戏状态
2. 房间管理和玩家身份分配
3. 二维码访问和连接状态监控
4. WebSocket实时通信

---

## 🎯 重要的游戏规则理解

### 角色与阵营系统
**关键规则**: 角色和阵营是独立分配的！

- **角色**: 10个唯一角色（等级1-10）
  - 等级1-9: 长老、刺客、弄臣、炼金术士、灵谕师、卫士、狂战士、法师、舞妓
  - 等级10: 调查官（唯一的中立角色）

- **阵营**: 3种身份
  - 凤凰氏族（红色）
  - 石像鬼氏族（蓝色）
  - 中立（仅调查官）

- **分配逻辑**:
  - 除调查官外，其他9个角色都可以被随机分配到红色或蓝色阵营
  - 调查官永远是中立阵营
  - 奇数人数游戏使用调查官
  - 偶数人数游戏不使用调查官

### ⚠️ 已知问题
- 配置允许12人游戏，但只定义了10个角色
- 需要确认：11-12人局是否允许角色重复？还是应该限制为最多10人？

---

## 📁 项目结构

```
bloodbond/
├── server/                      # 后端服务
│   └── index.js                # Express + Socket.IO 服务器
│
├── src/
│   ├── components/             # React 组件
│   │   ├── GameBoard.tsx      # 主持人游戏面板
│   │   ├── PlayerAccess.tsx   # 玩家访问页面
│   │   ├── PlayerView.tsx     # 玩家身份视图
│   │   ├── PlayerCard.tsx     # 玩家卡片
│   │   ├── RoomSetup.tsx      # 房间设置
│   │   ├── ConnectionStatusBar.tsx  # 连接状态栏
│   │   ├── ErrorBoundary.tsx  # 错误边界
│   │   ├── RulesModal.tsx     # 规则查看弹窗
│   │   └── ui/                # UI 组件库
│   │       ├── Toast.tsx      # Toast 通知
│   │       └── LoadingSpinner.tsx  # 加载动画
│   │
│   ├── context/               # React Context 状态管理
│   │   ├── GameContext.tsx    # 游戏全局状态
│   │   └── ToastContext.tsx   # Toast 通知上下文
│   │
│   ├── utils/                 # 工具函数
│   │   ├── apiService.ts      # REST API 服务（完全类型安全）
│   │   ├── socketService.ts   # WebSocket 服务（完全类型安全）
│   │   ├── gameUtils.ts       # 游戏逻辑工具
│   │   └── logger.ts          # 日志工具
│   │
│   ├── constants/             # 常量配置
│   │   └── gameConstants.ts   # 游戏常量（网络、游戏规则、UI等）
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   ├── gameTypes.ts       # 游戏类型
│   │   ├── socketTypes.ts     # WebSocket 事件类型（完整）
│   │   └── apiTypes.ts        # API 请求/响应类型（完整）
│   │
│   └── hooks/                 # 自定义 React Hooks
│       └── useSocket.ts       # WebSocket Hook
│
├── docs/                      # 文档
│   ├── README.md              # 主文档
│   ├── QUICK_START.md         # 快速开始
│   ├── README_MOBILE.md       # 移动端说明
│   ├── README_MULTI_BROWSER.md # 多浏览器技术文档
│   ├── PLAYER_ACCESS_TROUBLESHOOTING.md # 故障排除
│   ├── CHARACTER_IMAGES_SUMMARY.md # 角色图片系统
│   └── CLAUDE.md              # 本文档
│
└── test-role-assignment.js    # 角色分配逻辑测试脚本
```

---

## 🔧 核心技术实现

### 1. 类型系统（完全类型安全）

所有 `any` 类型已被消除，使用完整的 TypeScript 类型：

#### Socket.IO 类型 (`src/types/socketTypes.ts`)
```typescript
// 连接状态（字符串字面量类型，不是枚举）
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// WebSocket 事件数据
export interface JoinRoomData {
  roomId: string
  playerId: number
}

export interface UpdateGameStateData {
  roomId: string
  gameState: GameStatePayload
}

export type PlayerActionType = 'addReveal' | 'distributeCurses' | 'updateName' | ...

// 回调函数类型
export type ConnectionStatusCallback = (status: ConnectionStatus, message?: string) => void
export type GameStateUpdatedCallback = (gameState: GameStatePayload) => void
```

#### API 类型 (`src/types/apiTypes.ts`)
```typescript
// Result 模式用于统一错误处理
export type ApiResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  details?: unknown
}

export type CreateRoomResult = ApiResult<CreateRoomResponse>
export type GetRoomResult = ApiResult<GetRoomResponse>
```

### 2. 常量配置 (`src/constants/gameConstants.ts`)

所有魔法数字和字符串都集中管理：

```typescript
export const PLAYER_CONFIG = {
  MIN_PLAYERS: 6,
  MAX_PLAYERS: 12,  // ⚠️ 但只有10个角色！
  DEFAULT_PLAYERS: 10,
} as const

export const NETWORK_CONFIG = {
  BACKEND_PORT: 3000,
  FRONTEND_PORT: 5173,
  API_TIMEOUT: 10000,
  WEBSOCKET_TIMEOUT: 10000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_CHECK_INTERVAL: 10000,
  HEARTBEAT_TIMEOUT: 60000,
} as const

export const GAME_CONFIG = {
  MAX_WOUNDS: 3,
  CURSE_DISTRIBUTIONS: {
    7: { real: 1, fake: 1 },
    9: { real: 1, fake: 2 },
    11: { real: 1, fake: 3 },
  },
} as const

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'joinRoom',
  UPDATE_GAME_STATE: 'updateGameState',
  GAME_STATE_UPDATED: 'gameStateUpdated',
  // ... 更多事件
} as const

export const API_ENDPOINTS = {
  ROOMS: '/rooms',
  GET_ROOM: (id: string) => `/rooms/${id}`,
  JOIN_ROOM: (id: string) => `/rooms/${id}/join`,
  START_GAME: (id: string) => `/rooms/${id}/start`,
  RESTART_GAME: (id: string) => `/rooms/${id}/restart`,
  HEALTH: '/health',
} as const
```

### 3. 角色分配逻辑 (`src/utils/gameUtils.ts`)

**函数**: `generatePlayers(count: number): Player[]`

**核心逻辑**:
1. 创建唯一的角色类型数组（等级1-count或1-count-1+调查官）
2. 打乱角色数组
3. 创建阵营数组（红/蓝），不包括中立
4. 打乱阵营数组
5. 配对时：调查官强制为中立，其他角色从打乱的阵营数组中获取

**重要**:
- 角色和阵营独立打乱和分配
- 奇数人数使用调查官（等级10）
- 偶数人数不使用调查官

**已知bug**:
- 当count > 10时会创建超过10个角色，导致等级11、12等不存在的角色
- 需要决定是限制为10人还是允许角色重复

### 4. WebSocket 服务 (`src/utils/socketService.ts`)

**特点**:
- 单例模式 `socketService`
- 完整的类型安全
- 心跳检测机制
- 指数退避重连策略
- 连接状态管理和回调

**关键方法**:
```typescript
class SocketService {
  connect(roomId: string, playerId: number): Socket
  disconnect(): void
  updateGameState(roomId: string, gameState: GameStatePayload): void
  onGameStateUpdated(callback: GameStateUpdatedCallback): void
  onConnectionStatusChange(callback: ConnectionStatusCallback): () => void
  getConnectionStatus(): ConnectionStatus
}
```

**重要修复**:
- 修复了心跳检测误报问题（移除了interval中的lastHeartbeat更新）
- 使用字符串字面量类型而非枚举，避免类型比较问题

### 5. API 服务 (`src/utils/apiService.ts`)

**特点**:
- 静态类方法
- 完整的错误处理
- Result 模式
- AbortSignal 超时控制

**所有方法**:
```typescript
ApiService.createRoom(playerCount: number): Promise<CreateRoomResult>
ApiService.getRoomInfo(roomId: string): Promise<GetRoomResult>
ApiService.startGame(roomId: string): Promise<GetRoomResult>
ApiService.restartGame(roomId: string): Promise<GetRoomResult>
ApiService.healthCheck(): Promise<HealthCheckResult>
ApiService.joinRoom(roomId: string, playerId: number): Promise<JoinRoomResult>
```

### 6. 连接状态管理 (`src/components/ConnectionStatusBar.tsx`)

**功能**:
- 显示实时连接状态（连接中/已连接/重连中/错误）
- 自动隐藏（连接成功2秒后）
- 提供刷新按钮（错误时）

**样式**:
- 绿色 = 已连接
- 黄色 = 正在连接/重连中
- 红色 = 连接错误

---

## 🚨 重要修复记录

### 最近修复的Bug

1. **连接状态误报问题** (src/utils/socketService.ts:77-87)
   - **问题**: Heart跳检测在interval中更新lastHeartbeat，导致误报连接正常
   - **修复**: 移除interval中的更新，只在收到消息时更新
   - **代码位置**: `startHeartbeat()` 方法

2. **"显示所有身份"按钮不重置** (src/components/GameBoard.tsx:44)
   - **问题**: 开始新游戏后按钮状态未重置
   - **修复**: 在 `handleRestartGame()` 中添加 `setShowAllIdentities(false)`

3. **角色与阵营错误绑定** (src/utils/gameUtils.ts:24-99, 所有文档)
   - **问题**: 文档和理解上认为角色固定属于某个阵营
   - **修复**:
     - 修正所有文档说明
     - 更新角色分配逻辑，独立打乱角色和阵营数组
     - 确保除调查官外其他角色可被分配到任意阵营

---

## 🎨 代码风格和约定

### TypeScript
- ✅ 使用严格类型，避免 `any`
- ✅ 使用字符串字面量类型而非枚举（特别是用于比较的类型）
- ✅ 使用 `as const` 定义常量对象
- ✅ 导出类型时使用 `export type` 而非 `export interface`（对于类型别名）

### 组件
- ✅ 函数组件 + Hooks
- ✅ Props 接口命名：`ComponentNameProps`
- ⏳ 待优化：添加 React.memo, useCallback, useMemo

### 导入顺序
```typescript
// 1. React/第三方库
import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'

// 2. 类型定义
import type { Player, Faction } from '../types/gameTypes'
import type { ConnectionStatus } from '../types/socketTypes'

// 3. 常量
import { NETWORK_CONFIG, SOCKET_EVENTS } from '../constants/gameConstants'

// 4. 工具函数
import { logger } from '../utils/logger'
import { socketService } from '../utils/socketService'
```

### 错误处理
- ✅ API调用使用 Result 模式
- ✅ React组件使用 ErrorBoundary
- ✅ 所有异步操作都有 try-catch
- ✅ 详细的日志记录

---

## 📝 待办事项

### 高优先级
- [ ] **解决角色数量限制问题**
  - 确定是限制为10人还是允许11-12人（需要角色复用机制）
  - 更新 `PLAYER_CONFIG.MAX_PLAYERS` 或实现角色复用逻辑
  - 完善角色分配测试

- [ ] **完成代码优化**
  - 更新 GameContext.tsx 使用新的类型和常量
  - 添加 React 性能优化（memo, useCallback, useMemo）
  - 消除代码重复（诅咒卡计算、角色映射等）

### 中优先级
- [ ] **测试完整性**
  - 添加单元测试
  - 添加集成测试
  - E2E测试

- [ ] **性能优化**
  - 组件性能分析
  - 网络请求优化
  - 打包体积优化

### 低优先级
- [ ] **功能增强**
  - 添加游戏历史记录
  - 添加玩家统计
  - 支持自定义游戏规则

---

## 🔍 调试技巧

### 查看连接状态
```typescript
// 在浏览器控制台
socketService.getConnectionStatus()
```

### 查看服务器健康
```bash
curl http://localhost:3000/api/health
```

### 测试角色分配
```bash
node test-role-assignment.js
```

### 查看WebSocket消息
浏览器开发者工具 > Network > WS > 选择连接 > Messages

### 查看localStorage
浏览器开发者工具 > Application > Local Storage

---

## 🚀 快速启动命令

```bash
# 安装依赖
npm install

# 一键启动（推荐）
npm run dev:full

# 或分别启动
npm run server    # 后端 (端口3000)
npm run dev       # 前端 (端口5173)

# 运行测试
node test-role-assignment.js

# 构建生产版本
npm run build
```

---

## 📞 重要提醒

1. **修改代码前**:
   - 阅读相关类型定义
   - 查看 gameConstants.ts 中的常量
   - 了解游戏规则（角色与阵营独立！）

2. **添加新功能**:
   - 先定义类型
   - 添加到常量配置（如果适用）
   - 实现逻辑
   - 更新文档

3. **修复Bug**:
   - 在本文档中记录
   - 更新测试
   - 提交时注明位置和原因

4. **性能考虑**:
   - 使用 useCallback 包裹回调函数
   - 使用 useMemo 缓存计算结果
   - 使用 React.memo 包裹纯组件

---

## 📚 相关资源

- [Socket.IO 文档](https://socket.io/docs/)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [鲜血盟约官方规则](https://andyventure.com/boardgame-blood-bound/)

---

**Happy Coding! 🎉**
