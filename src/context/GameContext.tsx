import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { generatePlayers, generateRoomId, generateAccessCode } from '../utils/gameUtils'
import { Player, Faction, GameRoom } from '../types/gameTypes'
import { ApiService } from '../utils/apiService'
import { socketService } from '../utils/socketService'
import { logger } from '../utils/logger'

// 游戏状态类型
export interface GameState {
  roomId: string | null
  playerId: number | null
  playerCount: number
  players: number[]
  gamePhase: 'setup' | 'playing' | 'ended'
  currentTurn: number | null
  gameData: any
  isConnected: boolean
  error: string | null
}

// 游戏动作类型
type GameAction =
  | { type: 'SET_ROOM'; payload: { roomId: string; playerCount: number } }
  | { type: 'SET_PLAYER'; payload: { playerId: number } }
  | { type: 'UPDATE_PLAYERS'; payload: number[] }
  | { type: 'SET_GAME_PHASE'; payload: 'setup' | 'playing' | 'ended' }
  | { type: 'SET_CURRENT_TURN'; payload: number }
  | { type: 'UPDATE_GAME_DATA'; payload: any }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' }

// 初始状态
const initialState: GameState = {
  roomId: null,
  playerId: null,
  playerCount: 10,
  players: [],
  gamePhase: 'setup',
  currentTurn: null,
  gameData: null,
  isConnected: false,
  error: null,
}

// 游戏状态reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_ROOM':
      return {
        ...state,
        roomId: action.payload.roomId,
        playerCount: action.payload.playerCount,
        error: null,
      }
    case 'SET_PLAYER':
      return {
        ...state,
        playerId: action.payload.playerId,
        error: null,
      }
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.payload,
      }
    case 'SET_GAME_PHASE':
      return {
        ...state,
        gamePhase: action.payload,
      }
    case 'SET_CURRENT_TURN':
      return {
        ...state,
        currentTurn: action.payload,
      }
    case 'UPDATE_GAME_DATA':
      // 创建深层新对象引用，确保 React 能检测到变化
      const newGameData = action.payload ? {
        ...action.payload,
        // 确保 players 数组也是新的引用
        players: action.payload.players ? [...action.payload.players] : []
      } : null

      logger.log('UPDATE_GAME_DATA - 新游戏数据:', newGameData)

      return {
        ...state,
        gameData: newGameData,
      }
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }
    case 'RESET_GAME':
      return initialState
    default:
      return state
  }
}

// 游戏上下文
interface GameContextType {
  state: GameState
  createRoom: (playerCount: number) => Promise<string>
  joinRoom: (roomId: string, playerId: number) => Promise<void>
  startGame: () => Promise<void>
  restartGame: () => Promise<void>
  updateGameState: (gameData: any) => void
  sendPlayerAction: (action: string, data?: any) => void
  updatePlayerName: (name: string) => void
  resetGame: () => void
  checkServerHealth: () => Promise<boolean>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

// 本地存储键
const STORAGE_KEY = 'bloodbond_game_state'
const PLAYER_ACCESS_KEY = 'bloodbond_player_access'

// 从 localStorage 恢复初始状态
function getInitialState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // 只恢复房间号和玩家数量，其他状态重新初始化
      return {
        ...initialState,
        roomId: parsed.roomId || null,
        playerCount: parsed.playerCount || 10,
      }
    }
  } catch (error) {
    logger.error('恢复游戏状态失败:', error)
  }
  return initialState
}

// 游戏提供者组件
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, getInitialState())

  // 检查服务器健康状态
  const checkServerHealth = async (): Promise<boolean> => {
    try {
      const health = await ApiService.healthCheck()
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: health.status === 'ok' })
      return health.status === 'ok'
    } catch (error) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
      return false
    }
  }

  // 创建房间
  const createRoom = async (playerCount: number): Promise<string> => {
    try {
      const response = await ApiService.createRoom(playerCount)
      const roomId = response.roomId
      dispatch({ type: 'SET_ROOM', payload: { roomId, playerCount } })

      // 保存房间信息到 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ roomId, playerCount }))

      // 主持人也连接到WebSocket以接收玩家加入通知
      // 使用特殊的playerId (0) 表示主持人
      logger.log('主持人连接WebSocket，房间号:', roomId)
      const socket = socketService.connect(roomId, 0)

      // 监听玩家加入事件
      socketService.onPlayerJoined((data) => {
        logger.log('有玩家加入房间:', data)
        dispatch({ type: 'UPDATE_PLAYERS', payload: data.players })
      })

      // 监听房间状态更新
      socketService.onRoomState((roomState) => {
        logger.log('房间状态更新:', roomState)
        dispatch({ type: 'UPDATE_PLAYERS', payload: roomState.players })
      })

      // 监听游戏状态更新（包括玩家展示线索、名字等）
      socketService.onGameStateUpdated((gameState) => {
        logger.log('主持人收到游戏状态更新:', gameState)
        // 确保立即更新 gameData，触发重新渲染
        dispatch({ type: 'UPDATE_GAME_DATA', payload: { ...gameState } })
      })

      // 监听玩家在线状态变化
      socketService.onPlayerStatusChanged((data) => {
        logger.log('主持人收到玩家状态变化:', data);
        // 更新玩家在线状态
        if (response.roomId) {
          // 通过 dispatch 更新本地状态
          dispatch({
            type: 'UPDATE_GAME_DATA',
            payload: {
              ...state.gameData,
              players: state.gameData?.players?.map((p: any) =>
                p.id === data.playerId ? { ...p, isOnline: data.isOnline, lastSeen: Date.now() } : p
              )
            }
          });
        }
      })

      return roomId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建房间失败'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    }
  }

  // 加入房间
  const joinRoom = async (roomId: string, playerId: number): Promise<void> => {
    try {
      logger.log(`尝试加入房间: ${roomId}, 玩家ID: ${playerId}`);
      // 先获取房间信息
      const roomInfo = await ApiService.getRoomInfo(roomId)
      logger.log('获取房间信息成功:', roomInfo);

      dispatch({ type: 'SET_ROOM', payload: { roomId, playerCount: roomInfo.playerCount } })
      dispatch({ type: 'SET_PLAYER', payload: { playerId } })

      // 如果房间信息中已经有 gameState，立即设置
      if (roomInfo.gameState && roomInfo.gameState.players) {
        logger.log('房间已有游戏数据，立即设置');
        dispatch({ type: 'UPDATE_GAME_DATA', payload: roomInfo.gameState })
        dispatch({ type: 'SET_GAME_PHASE', payload: 'playing' })
      }

      // 连接WebSocket（在注册监听器之前先连接）
      const socket = socketService.connect(roomId, playerId)
      logger.log('WebSocket连接初始化完成');

      // 监听socket事件
      socketService.onRoomState((roomState) => {
        logger.log('=== 收到 roomState 事件 ===');
        logger.log('完整 roomState 数据:', JSON.stringify(roomState, null, 2));
        logger.log('roomState.players:', roomState.players);
        logger.log('roomState.gameState:', roomState.gameState);

        dispatch({ type: 'UPDATE_PLAYERS', payload: roomState.players })

        if (roomState.gameState) {
          logger.log('游戏状态存在，phase:', roomState.gameState.phase);
          logger.log('游戏玩家数据:', roomState.gameState.players);
          dispatch({ type: 'UPDATE_GAME_DATA', payload: roomState.gameState })

          // 如果游戏已开始，设置游戏阶段为playing
          if (roomState.gameState.phase === 'playing') {
            logger.log('✅ 设置游戏阶段为 playing');
            dispatch({ type: 'SET_GAME_PHASE', payload: 'playing' })
          } else {
            logger.log('⚠️ 游戏阶段不是 playing，是:', roomState.gameState.phase);
          }
        } else {
          logger.log('⚠️ roomState.gameState 不存在');
        }
      })

      socketService.onPlayerJoined((data) => {
        logger.log('玩家加入:', data);
        dispatch({ type: 'UPDATE_PLAYERS', payload: data.players })
      })

      socketService.onPlayerLeft((data) => {
        logger.log('玩家离开:', data);
        dispatch({ type: 'UPDATE_PLAYERS', payload: data.players })
      })

      socketService.onGameStateUpdated((gameState) => {
        logger.log('游戏状态更新:', gameState);
        dispatch({ type: 'UPDATE_GAME_DATA', payload: gameState })
        // 如果游戏已开始，设置游戏阶段为playing
        if (gameState.phase === 'playing') {
          dispatch({ type: 'SET_GAME_PHASE', payload: 'playing' })
        }
      })

      socketService.onPlayerAction((data) => {
        // 处理其他玩家的操作
        logger.log('收到玩家操作:', data)
      })

      // 监听玩家在线状态变化
      socketService.onPlayerStatusChanged((data) => {
        logger.log('玩家状态变化:', data);
        // 更新玩家在线状态
        if (state.gameData && state.gameData.players) {
          const updatedPlayers = state.gameData.players.map((p: any) =>
            p.id === data.playerId ? { ...p, isOnline: data.isOnline, lastSeen: Date.now() } : p
          );

          // 触发状态更新
          dispatch({
            type: 'UPDATE_GAME_DATA',
            payload: { ...state.gameData, players: updatedPlayers }
          });
        }
      })

      // 设置连接状态
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })

    } catch (error) {
      logger.error('加入房间失败:', error);
      const errorMessage = error instanceof Error ? error.message : '加入房间失败'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
      throw error
    }
  }

  // 开始游戏（主持人调用）
  const startGame = async (): Promise<void> => {
    try {
      if (!state.roomId) {
        throw new Error('房间ID不存在，无法开始游戏');
      }

      logger.log('主持人开始游戏，房间号:', state.roomId);
      const gameData = await ApiService.startGame(state.roomId);
      logger.log('获得游戏状态:', gameData);

      // 更新本地状态
      if (gameData.gameState) {
        dispatch({ type: 'UPDATE_GAME_DATA', payload: gameData.gameState });
        dispatch({ type: 'SET_GAME_PHASE', payload: 'playing' });
      }
    } catch (error) {
      logger.error('开始游戏失败:', error);
      const errorMessage = error instanceof Error ? error.message : '开始游戏失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }

  // 重新开始游戏（主持人调用）
  const restartGame = async (): Promise<void> => {
    try {
      if (!state.roomId) {
        throw new Error('房间ID不存在，无法重新开始游戏');
      }

      logger.log('主持人重新开始游戏，房间号:', state.roomId);
      const gameData = await ApiService.restartGame(state.roomId);
      logger.log('获得新游戏状态:', gameData);

      // 更新本地状态
      if (gameData.gameState) {
        dispatch({ type: 'UPDATE_GAME_DATA', payload: gameData.gameState });
        dispatch({ type: 'SET_GAME_PHASE', payload: 'playing' });
      }
    } catch (error) {
      logger.error('重新开始游戏失败:', error);
      const errorMessage = error instanceof Error ? error.message : '重新开始游戏失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }

  // 更新游戏状态
  const updateGameState = (gameData: any) => {
    dispatch({ type: 'UPDATE_GAME_DATA', payload: gameData })
    
    // 通过WebSocket同步到其他客户端
    if (state.roomId) {
      socketService.updateGameState(state.roomId, gameData)
    }
  }

  // 发送玩家操作
  const sendPlayerAction = (action: string, data?: any) => {
    if (state.roomId && state.playerId) {
      socketService.sendPlayerAction(state.roomId, state.playerId, action, data)
    }
  }

  // 更新玩家姓名
  const updatePlayerName = (name: string) => {
    logger.log('updatePlayerName 被调用, 姓名:', name);
    logger.log('当前 state.roomId:', state.roomId);
    logger.log('当前 state.playerId:', state.playerId);

    if (state.roomId && state.playerId) {
      logger.log(`✅ 发送更新姓名请求: 玩家 ${state.playerId} -> ${name}`);
      socketService.sendPlayerAction(state.roomId, state.playerId, 'updateName', { name });
    } else {
      logger.error('❌ 无法更新姓名: roomId 或 playerId 缺失');
    }
  }

  // 重置游戏
  const resetGame = () => {
    socketService.disconnect()
    localStorage.removeItem(STORAGE_KEY) // 清除保存的房间信息
    dispatch({ type: 'RESET_GAME' })
  }

  // 页面加载时恢复房间连接
  useEffect(() => {
    const reconnectToRoom = async () => {
      if (state.roomId && !state.isConnected) {
        try {
          logger.log('检测到已保存的房间号，尝试重新连接:', state.roomId)

          // 先调用 startGame 获取完整的游戏状态
          const gameData = await ApiService.startGame(state.roomId)
          logger.log('获取到游戏状态:', gameData)

          // 更新游戏数据
          if (gameData.gameState && gameData.gameState.players) {
            dispatch({ type: 'UPDATE_GAME_DATA', payload: gameData.gameState })
            dispatch({ type: 'SET_GAME_PHASE', payload: 'playing' })
          }

          // 重新连接 WebSocket（主持人使用 playerId 0）
          socketService.connect(state.roomId, 0)

          // 重新注册监听器
          socketService.onPlayerJoined((data) => {
            logger.log('有玩家加入房间:', data)
            dispatch({ type: 'UPDATE_PLAYERS', payload: data.players })
          })

          socketService.onRoomState((roomState) => {
            logger.log('房间状态更新:', roomState)
            dispatch({ type: 'UPDATE_PLAYERS', payload: roomState.players })
          })

          socketService.onGameStateUpdated((gameState) => {
            logger.log('主持人收到游戏状态更新:', gameState)
            dispatch({ type: 'UPDATE_GAME_DATA', payload: gameState })
          })

          dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
          logger.log('✅ 房间重新连接成功')
        } catch (error) {
          logger.error('重新连接房间失败:', error)
          // 房间不存在或连接失败，清除保存的状态
          localStorage.removeItem(STORAGE_KEY)
          dispatch({ type: 'RESET_GAME' })
        }
      }
    }

    reconnectToRoom()
  }, []) // 只在组件挂载时执行一次

  // 组件卸载时清理WebSocket连接
  useEffect(() => {
    return () => {
      socketService.disconnect()
    }
  }, [])

  // 定期检查服务器健康状态
  useEffect(() => {
    const checkHealth = async () => {
      await checkServerHealth()
    }
    
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // 每30秒检查一次
    
    return () => clearInterval(interval)
  }, [])

  const value: GameContextType = {
    state,
    createRoom,
    joinRoom,
    startGame,
    restartGame,
    updateGameState,
    sendPlayerAction,
    updatePlayerName,
    resetGame,
    checkServerHealth,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// 使用游戏上下文的Hook
export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}