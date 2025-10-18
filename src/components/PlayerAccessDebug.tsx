import React, { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { useParams } from 'react-router-dom'

const PlayerAccessDebug = () => {
  const { roomId, playerId } = useParams()
  const { players, joinRoom } = useGame()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    // 收集调试信息
    const collectDebugInfo = () => {
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

      // 收集所有localStorage键
      const allKeys = Object.keys(localStorage)
      const gameKeys = allKeys.filter(key => key.startsWith('bloodbond_'))
      
      setDebugInfo({
        params: { roomId, playerId },
        localStorage: storageData,
        allGameKeys: gameKeys,
        url: window.location.href,
        playersCount: players?.length || 0,
        currentPlayers: players?.map(p => ({ id: p.id, accessCode: p.accessCode })) || [],
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }

    collectDebugInfo()
  }, [roomId, playerId, players])

  const runTests = () => {
    const results: any[] = []
    
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
      status: players.length > 0 ? 'PASS' : 'FAIL',
      details: `当前玩家数: ${players.length}`
    })

    // 测试5: 尝试加入房间
    if (roomId && !isNaN(playerIdNum)) {
      try {
        const success = joinRoom(roomId, playerIdNum)
        results.push({
          test: '加入房间测试',
          status: success ? 'PASS' : 'FAIL',
          details: `joinRoom返回: ${success}`
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
    const playerExists = players.find(p => p.id === playerIdNum)
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">玩家访问调试页面</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 调试信息 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">调试信息</h2>
            <div className="space-y-2 text-sm">
              <p><strong>房间ID:</strong> {roomId || '未提供'}</p>
              <p><strong>玩家ID:</strong> {playerId || '未提供'}</p>
              <p><strong>当前玩家数:</strong> {players?.length || 0}</p>
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>时间戳:</strong> {debugInfo.timestamp}</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">操作</h2>
            <div className="space-y-2">
              <button
                onClick={runTests}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                运行测试
              </button>
              <button
                onClick={clearStorage}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                清除本地存储
              </button>
              <button
                onClick={exportDebugInfo}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                导出调试信息
              </button>
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mt-6">
            <h2 className="text-xl font-bold mb-4">测试结果</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 bg-gray-700 rounded">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    result.status === 'PASS' ? 'bg-green-600' :
                    result.status === 'FAIL' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {result.status}
                  </span>
                  <span className="font-medium">{result.test}</span>
                  <span className="text-gray-400 text-sm">{result.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 详细调试信息 */}
        <div className="bg-gray-800 p-4 rounded-lg mt-6">
          <h2 className="text-xl font-bold mb-4">详细调试信息</h2>
          <details className="text-sm">
            <summary className="cursor-pointer mb-2">点击查看详细信息</summary>
            <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>

        {/* 当前玩家列表 */}
        {players.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mt-6">
            <h2 className="text-xl font-bold mb-4">当前玩家列表</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map(player => (
                <div key={player.id} className="bg-gray-700 p-3 rounded">
                  <p><strong>玩家 {player.id}</strong></p>
                  <p className="text-sm text-gray-400">访问代码: {player.accessCode}</p>
                  <p className="text-sm text-gray-400">阵营: {player.faction}</p>
                  <p className="text-sm text-gray-400">角色: {player.characterType}</p>
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