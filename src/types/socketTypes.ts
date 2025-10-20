/**
 * Socket.IO 相关类型定义
 * 用于替换 any 类型，提供类型安全
 */

import { Player } from './gameTypes'

// ============ Socket 事件数据类型 ============

/**
 * 加入房间事件数据
 */
export interface JoinRoomData {
  roomId: string
  playerId: number
}

/**
 * 更新游戏状态事件数据
 */
export interface UpdateGameStateData {
  roomId: string
  gameState: GameStatePayload
}

/**
 * 玩家操作事件数据
 */
export interface PlayerActionData {
  roomId: string
  playerId: number
  action: PlayerActionType
  data?: PlayerActionDataPayload
}

/**
 * 玩家操作类型
 */
export type PlayerActionType =
  | 'addReveal'
  | 'distributeCurses'
  | 'updateName'
  | 'addAbilityCard'
  | 'removeAbilityCard'

/**
 * 玩家操作数据负载
 */
export type PlayerActionDataPayload =
  | AddRevealPayload
  | DistributeCursesPayload
  | UpdateNamePayload
  | AddAbilityCardPayload
  | RemoveAbilityCardPayload

export interface AddRevealPayload {
  revealType: 'red' | 'blue' | 'unknown'
}

export interface DistributeCursesPayload {
  allocations: Record<number, 'real' | 'fake' | null>
}

export interface UpdateNamePayload {
  name: string
}

export interface AddAbilityCardPayload {
  cardType: string
}

export interface RemoveAbilityCardPayload {
  cardType: string
}

// ============ Socket 回调数据类型 ============

/**
 * 房间状态数据
 */
export interface RoomStateData {
  roomId: string
  playerCount: number
  players: number[]  // 已加入的玩家ID列表
  gameState?: GameStatePayload
}

/**
 * 游戏状态负载
 */
export interface GameStatePayload {
  phase: string
  players: Player[]
  // 可以根据需要添加其他字段
}

/**
 * 玩家加入事件数据
 */
export interface PlayerJoinedData {
  playerId: number
  playerCount?: number
  players: number[]  // 已加入的玩家ID列表
}

/**
 * 玩家离开事件数据
 */
export interface PlayerLeftData {
  playerId: number
  playerCount?: number
  players: number[]  // 剩余的玩家ID列表
}

/**
 * 玩家状态变更事件数据
 */
export interface PlayerStatusChangedData {
  playerId: number
  isOnline: boolean
  lastSeen: number
}

/**
 * 玩家操作事件数据（接收）
 */
export interface PlayerActionEventData {
  playerId: number
  action: PlayerActionType
  data?: PlayerActionDataPayload
}

// ============ Socket 回调函数类型 ============

export type RoomStateCallback = (data: RoomStateData) => void
export type GameStateUpdatedCallback = (gameState: GameStatePayload) => void
export type PlayerJoinedCallback = (data: PlayerJoinedData) => void
export type PlayerLeftCallback = (data: PlayerLeftData) => void
export type PlayerStatusChangedCallback = (data: PlayerStatusChangedData) => void
export type PlayerActionEventCallback = (data: PlayerActionEventData) => void

// ============ 连接状态类型 ============

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export type ConnectionStatusCallback = (status: ConnectionStatus, message?: string) => void
