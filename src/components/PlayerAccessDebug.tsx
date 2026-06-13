import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { useParams } from 'react-router-dom'
import type { Player } from '../types/gameTypes'

const EMPTY_PLAYERS: Player[] = []

interface DebugInfo {
  params: {
    roomId?: string
    playerId?: string
  }
  localStorage: Record<string, unknown>
  allGameKeys: string[]
  url: string
  playersCount: number
  currentPlayers: Array<{ id: number; accessCode?: string }>
  userAgent: string
  timestamp: string
}

interface DebugTestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'ERROR'
  details: string
}

const PlayerAccessDebug = () => {
  const { roomId, playerId } = useParams()
  const { state, joinRoom } = useGame()
  const playerDetails = state.gameData?.players ?? EMPTY_PLAYERS
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [testResults, setTestResults] = useState<DebugTestResult[]>([])

  useEffect(() => {
    // 收集调试信息
    const collectDebugInfo = () => {
      const storageKeys = ['bloodbond_game_state', 'bloodbond_player_access']
      const storageData: Record<string, unknown> = {}
      
      storageKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key)
          storageData[key] = data ? JSON.parse(data) : null
        } catch (e) {
          storageData[key] = `解析错误: ${e}`
        }
      })

      // 收集所有localStorage键
      const allKeys = Object.keys(localStorage)
      const gameKeys = allKeys.filter(key => key.startsWith('bloodbond_'))
      
      setDebugInfo({
        params: { roomId, playerId },
        localStorage: storageData,
        allGameKeys: gameKeys,
        url: window.location.href,
        playersCount: playerDetails.length,
        currentPlayers: playerDetails.map((player: Player) => ({ id: player.id, accessCode: player.accessCode })),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }

    collectDebugInfo()
  }, [roomId, playerId, playerDetails])

  const runTests = async () => {
    const results: DebugTestResult[] = []
    
    // 测试1: 检查参数
    results.push({
      test: '参数检查',
      status: roomId && playerId ? 'PASS' : 'FAIL',
      details: `房间ID: ${roomId || '缺失'}, 玩家ID: ${playerId || '缺失'}`
    })

    // 测试2: 检查玩家ID是否为数字
    const playerIdNum = parseInt(playerId || '')
    results.push({
      test: '玩家ID格式',
      status: !isNaN(playerIdNum) ? 'PASS' : 'FAIL',
      details: `玩家ID: ${playerId}, 解析结果: ${playerIdNum}`
    })

    // 测试3: 检查本地存储
    const gameState = localStorage.getItem('bloodbond_game_state')
    results.push({
      test: '本地存储状态',
      status: gameState ? 'PASS' : 'FAIL',
      details: gameState ? '存在游戏状态' : '无游戏状态'
    })

    // 测试4: 检查当前玩家状态
    results.push({
      test: '当前玩家状态',
      status: playerDetails.length > 0 ? 'PASS' : 'FAIL',
      details: `当前玩家数: ${playerDetails.length}`
    })

    // 测试5: 尝试加入房间
    if (roomId && !isNaN(playerIdNum)) {
      try {
        await joinRoom(roomId, playerIdNum)
        results.push({
          test: '加入房间测试',
          status: 'PASS',
          details: 'joinRoom 成功执行'
        })
      } catch (e) {
        results.push({
          test: '加入房间测试',
          status: 'ERROR',
          details: `异常: ${e}`
        })
      }
    }

    // 测试6: 检查玩家是否存在
    const playerExists = playerDetails.find((player: Player) => player.id === playerIdNum)
    results.push({
      test: '玩家存在性',
      status: playerExists ? 'PASS' : 'FAIL',
      details: playerExists ? `找到玩家: ${playerExists.id}` : `未找到玩家ID: ${playerIdNum}`
    })

    setTestResults(results)
  }

  const clearStorage = () => {
    localStorage.removeItem('bloodbond_game_state')
    localStorage.removeItem('bloodbond_player_access')
    alert('本地存储已清除，请刷新页面')
  }

  const exportDebugInfo = () => {
    const data = {
      debugInfo,
      testResults,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bloodbond-debug-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bb-page min-h-screen p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="bb-title mb-6 text-3xl">玩家访问调试页面</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 调试信息 */}
          <div className="bb-panel-muted p-4">
            <h2 className="text-xl font-bold mb-4">调试信息</h2>
            <div className="space-y-2 text-sm">
              <p><strong>房间ID:</strong> {roomId || '未提供'}</p>
              <p><strong>玩家ID:</strong> {playerId || '未提供'}</p>
              <p><strong>当前玩家数:</strong> {playerDetails.length}</p>
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>时间戳:</strong> {debugInfo?.timestamp}</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="bb-panel-muted p-4">
            <h2 className="text-xl font-bold mb-4">操作</h2>
            <div className="space-y-2">
              <button
                onClick={() => void runTests()}
                className="bb-button-blue w-full"
              >
                运行测试
              </button>
              <button
                onClick={clearStorage}
                className="bb-button-danger w-full"
              >
                清除本地存储
              </button>
              <button
                onClick={exportDebugInfo}
                className="bb-button-gold w-full"
              >
                导出调试信息
              </button>
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="bb-panel-muted mt-6 p-4">
            <h2 className="text-xl font-bold mb-4">测试结果</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="bb-panel-muted flex items-center space-x-4 p-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    result.status === 'PASS' ? 'bg-emerald-700' :
                    result.status === 'FAIL' ? 'bg-red-800' : 'bg-amber-800'
                  }`}>
                    {result.status}
                  </span>
                  <span className="font-medium">{result.test}</span>
                  <span className="text-sm text-stone-400">{result.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 详细调试信息 */}
        <div className="bb-panel-muted mt-6 p-4">
          <h2 className="text-xl font-bold mb-4">详细调试信息</h2>
          <details className="text-sm">
            <summary className="cursor-pointer mb-2">点击查看详细信息</summary>
            <pre className="max-h-96 overflow-auto rounded border border-stone-700 bg-stone-950 p-4">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>

        {/* 当前玩家列表 */}
        {playerDetails.length > 0 && (
          <div className="bb-panel-muted mt-6 p-4">
            <h2 className="text-xl font-bold mb-4">当前玩家列表</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerDetails.map((player: Player) => (
                <div key={player.id} className="bb-panel-muted p-3">
                  <p><strong>玩家 {player.id}</strong></p>
                  <p className="text-sm text-stone-400">访问代码: {player.accessCode}</p>
                  <p className="text-sm text-stone-400">阵营: {player.faction}</p>
                  <p className="text-sm text-stone-400">角色: {player.characterType}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerAccessDebug 
