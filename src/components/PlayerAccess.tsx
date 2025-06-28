import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { Player } from '../types/gameTypes'
import PlayerView from './PlayerView'
import { useParams, useNavigate } from 'react-router-dom'

const PlayerAccess = () => {
  const { roomId, playerId } = useParams()
  const { players, joinRoom, currentPlayer } = useGame()
  const [player, setPlayer] = useState<Player | null>(null)
  const [error, setError] = useState<string>('')
  const [joined, setJoined] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{[key: string]: any}>({})
  const navigate = useNavigate()

  useEffect(() => {
    // 收集调试信息
    const storageKeys = ['bloodbond_game_state', 'bloodbond_player_access']
    const storageData: {[key: string]: any} = {}
    
    storageKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        storageData[key] = data ? JSON.parse(data) : null
      } catch (e) {
        storageData[key] = `解析错误: ${e}`
      }
    })
    
    setDebugInfo({
      params: { roomId, playerId },
      localStorage: storageData,
      url: window.location.href,
      playersCount: players?.length || 0
    })
    
    // 尝试加入房间
    if (roomId && playerId) {
      const playerIdNum = parseInt(playerId)
      if (!isNaN(playerIdNum)) {
        try {
          // 先检查玩家是否已经在当前状态中
          const existingPlayer = players.find(p => p.id === playerIdNum)
          
          if (existingPlayer) {
            console.log('在当前状态中找到玩家:', existingPlayer)
            setPlayer(existingPlayer)
            setJoined(true)
            return
          }
          
          // 尝试加入房间
          const success = joinRoom(roomId, playerIdNum)
          if (success) {
            // 重新查找玩家，因为joinRoom可能已经更新了players数组
            const foundPlayer = players.find(p => p.id === playerIdNum)
            if (foundPlayer) {
              setPlayer(foundPlayer)
              setJoined(true)
            } else {
              console.error(`加入房间成功但找不到ID为${playerIdNum}的玩家，当前玩家数:`, players.length)
              setError(`找不到ID为${playerIdNum}的玩家`)
            }
          } else {
            console.error(`无法加入房间${roomId}，当前玩家数:`, players.length)
            setError(`无法加入房间${roomId}，可能是房间不存在或已过期`)
          }
        } catch (e) {
          console.error('加入房间时出错:', e)
          setError(`加入房间时出错: ${e instanceof Error ? e.message : String(e)}`)
        }
      } else {
        setError('玩家ID必须是数字')
      }
    } else {
      setError('缺少必要的房间号或玩家ID参数')
    }
  }, [roomId, playerId, joinRoom, players])

  // 返回主页
  const goToHome = () => {
    navigate('/')
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-500">错误</h2>
        <p className="mb-4">{error}</p>
        <p className="text-sm text-gray-400 mb-4">
          请确认您使用的链接是正确的，或联系游戏主持人获取新的链接
        </p>
        <div className="text-xs text-gray-500 mt-4 border-t border-gray-700 pt-4">
          <p>调试信息:</p>
          <p>房间号: {roomId || '未提供'}</p>
          <p>玩家ID: {playerId || '未提供'}</p>
          <p>当前玩家数: {players?.length || 0}</p>
        </div>
        <button 
          onClick={goToHome}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
        >
          返回主页
        </button>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">加载中...</h2>
        <p className="text-sm text-gray-400">
          正在连接到游戏房间，请稍候...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
        <h2 className="text-xl font-bold mb-2 text-center">玩家 {player.id} 的身份</h2>
        <p className="text-sm text-gray-400 text-center mb-4">
          这是您的秘密身份，请不要让其他玩家看到
        </p>
      </div>
      
      <PlayerView player={player} onBack={() => {}} hideBackButton={true} />
      
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>房间号: {roomId}</p>
        <p className="mt-2">游戏进行中请保持此页面打开</p>
      </div>
    </div>
  )
}

export default PlayerAccess