/**
 * API 相关类型定义
 * 用于 API 请求和响应的类型安全
 */

import { GameStatePayload } from './socketTypes'

// ============ API 请求类型 ============

/**
 * 创建房间请求
 */
export interface CreateRoomRequest {
  playerCount: number
}

/**
 * 加入房间请求
 */
export interface JoinRoomRequest {
  playerId: number
}

// ============ API 响应类型 ============

/**
 * 创建房间响应
 */
export interface CreateRoomResponse {
  roomId: string
  playerCount: number
  gameState: GameStatePayload
}

/**
 * 获取房间响应
 */
export interface GetRoomResponse {
  roomId: string
  playerCount: number
  players: number[]
  gameState?: GameStatePayload
}

/**
 * 加入房间响应
 */
export interface JoinRoomResponse {
  success: boolean
  roomId: string
  playerId: number
  gameState?: GameStatePayload
}

/**
 * 健康检查响应
 */
export interface HealthCheckResponse {
  status: 'ok'
  message: string
  rooms: number
  connections: number
}

/**
 * API 错误响应
 */
export interface ApiErrorResponse {
  error: string
  message?: string
  details?: unknown
}

// ============ API 返回类型 ============

/**
 * API 调用结果类型（泛型）
 */
export type ApiResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  details?: unknown
}

// ============ 常用 API 结果类型别名 ============

export type CreateRoomResult = ApiResult<CreateRoomResponse>
export type GetRoomResult = ApiResult<GetRoomResponse>
export type JoinRoomResult = ApiResult<JoinRoomResponse>
export type HealthCheckResult = ApiResult<HealthCheckResponse>
