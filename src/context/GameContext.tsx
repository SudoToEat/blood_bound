import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { generatePlayers, generateRoomId, generateAccessCode } from '../utils/gameUtils'
import { Player, Faction, GameRoom } from '../types/gameTypes'

interface GameContextType {
  players: Player[]
  currentPlayerIndex: number
  roomId: string | null
  isHost: boolean
  currentPlayerId: number | null
  setPlayers: (players: Player[]) => void
  setPlayerCount: (count: number) => void
  setCurrentPlayerIndex: (index: number) => void
  createRoom: () => string
  joinRoom: (roomId: string, playerId: number) => boolean
  getPlayerByAccessCode: (accessCode: string) => Player | undefined
  resetGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

// 本地存储键
const STORAGE_KEY = 'bloodbond_game_state'
const PLAYER_ACCESS_KEY = 'bloodbond_player_access'

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState<boolean>(false)
  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(null)

  // 初始化时从本地存储加载状态
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const { players, roomId, isHost } = JSON.parse(savedState)
        if (players && Array.isArray(players)) setPlayers(players)
        if (roomId) setRoomId(roomId)
        if (typeof isHost === 'boolean') setIsHost(isHost)
      } catch (e) {
        console.error('Failed to parse saved game state', e)
      }
    }
    
    // 检查是否有访问代码
    const accessCode = localStorage.getItem(PLAYER_ACCESS_KEY)
    if (accessCode && players.length > 0) {
      const player = players.find(p => p.accessCode === accessCode)
      if (player) {
        setCurrentPlayerId(player.id)
      }
    }
  }, [])

  // 当状态变化时保存到本地存储
  useEffect(() => {
    if (roomId || players.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        players,
        roomId,
        isHost
      }))
    }
  }, [players, roomId, isHost])

  const setPlayerCount = (count: number) => {
    const newPlayers = generatePlayers(count)
    
    // 为每个玩家生成访问代码
    const playersWithAccessCodes = newPlayers.map(player => ({
      ...player,
      accessCode: generateAccessCode()
    }))
    
    setPlayers(playersWithAccessCodes)
    setCurrentPlayerIndex(0)
    setIsHost(true)
  }

  const createRoom = () => {
    const newRoomId = generateRoomId()
    setRoomId(newRoomId)
    setIsHost(true)
    return newRoomId
  }

  const joinRoom = (roomId: string, playerId: number) => {
    console.log(`尝试加入房间: ${roomId}, 玩家ID: ${playerId}`)
    
    // 首先检查当前状态中是否已有匹配的玩家
    if (players.length > 0) { // 修复了逻辑错误，只需检查当前是否有玩家
      console.log('检查当前状态中的玩家, 当前玩家数:', players.length)
      const currentPlayer = players.find(p => p.id === playerId)
      
      if (currentPlayer) {
        console.log('在当前状态中找到玩家:', currentPlayer)
        setCurrentPlayerId(playerId)
        setIsHost(false)
        
        // 保存访问代码到本地存储
        if (currentPlayer.accessCode) {
          localStorage.setItem(PLAYER_ACCESS_KEY, currentPlayer.accessCode)
        }
        
        return true
      }
    }
    
    // 检查本地存储中是否有该房间的数据
    const savedState = localStorage.getItem(STORAGE_KEY)
    let foundPlayer = null
    
    // 尝试从本地存储加载
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        console.log('从本地存储加载的状态:', parsedState)
        
        if (parsedState.roomId === roomId && Array.isArray(parsedState.players)) {
          // 如果找到了匹配的房间，更新状态
          const savedPlayers = parsedState.players
          
          // 查找对应ID的玩家
          foundPlayer = savedPlayers.find((p: Player) => p.id === playerId)
          
          if (foundPlayer) {
            console.log('在本地存储中找到玩家:', foundPlayer)
            // 更新状态
            setPlayers(savedPlayers)
            setRoomId(roomId)
            setCurrentPlayerId(playerId)
            setIsHost(false)
            
            // 保存访问代码到本地存储
            if (foundPlayer.accessCode) {
              localStorage.setItem(PLAYER_ACCESS_KEY, foundPlayer.accessCode)
            }
            
            return true
          } else {
            console.log('本地存储中未找到玩家ID:', playerId, '可用玩家IDs:', savedPlayers.map(p => p.id))
          }
        } else {
          console.log('本地存储中的房间ID不匹配或没有玩家数组')
        }
      } catch (e) {
        console.error('解析本地存储数据失败:', e)
      }
    } else {
      console.log('本地存储中没有游戏状态')
    }
    
    // 如果本地存储中没有找到，再次检查当前状态
    if (players.length > 0) {
      console.log('再次尝试在当前状态中查找玩家, 当前玩家数:', players.length, '可用玩家IDs:', players.map(p => p.id))
      foundPlayer = players.find(p => p.id === playerId)
      
      if (foundPlayer) {
        console.log('在当前状态中找到玩家:', foundPlayer)
        setRoomId(roomId)
        setCurrentPlayerId(playerId)
        setIsHost(false)
        
        // 保存访问代码到本地存储
        if (foundPlayer.accessCode) {
          localStorage.setItem(PLAYER_ACCESS_KEY, foundPlayer.accessCode)
        }
        
        return true
      } else {
        console.log('当前状态中未找到玩家ID:', playerId)
      }
    } else {
      console.log('当前状态中没有玩家数据')
    }
    
    console.log('无法加入房间，未找到匹配的玩家')
    return false
  }

  const getPlayerByAccessCode = (accessCode: string) => {
    return players.find(p => p.accessCode === accessCode)
  }

  const resetGame = () => {
    setPlayers([])
    setCurrentPlayerIndex(0)
    setRoomId(null)
    setIsHost(false)
    setCurrentPlayerId(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PLAYER_ACCESS_KEY)
  }

  return (
    <GameContext.Provider
      value={{
        players,
        currentPlayerIndex,
        roomId,
        isHost,
        currentPlayerId,
        setPlayers,
        setPlayerCount,
        setCurrentPlayerIndex,
        createRoom,
        joinRoom,
        getPlayerByAccessCode,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}