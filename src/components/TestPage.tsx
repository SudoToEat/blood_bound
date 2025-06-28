import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'

const TestPage = () => {
  const { players, roomId, createRoom, setPlayerCount, resetGame } = useGame()
  const [baseUrl, setBaseUrl] = useState('')
  const [debugInfo, setDebugInfo] = useState<{[key: string]: any}>({})
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({})
  
  useEffect(() => {
    // 获取当前页面的基础URL
    const url = window.location.origin
    setBaseUrl(url)
    
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
      localStorage: storageData,
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }, [])
  
  // 初始化测试数据
  const initTestData = () => {
    resetGame()
    setPlayerCount(6)
    createRoom()
  }

  // 生成玩家访问链接
  const generatePlayerLink = (playerId: number) => {
    if (!roomId) return ''
    return `${baseUrl}?room=${roomId}&player=${playerId}`
  }

  // 测试链接是否可访问
  const testPlayerLink = async (playerId: number) => {
    const link = generatePlayerLink(playerId)
    setTestResults(prev => ({ ...prev, [playerId]: false }))
    
    try {
      // 打开链接
      const newWindow = window.open(link, `_blank_${playerId}`)
      
      // 标记为已测试
      setTestResults(prev => ({ ...prev, [playerId]: true }))
      
      return true
    } catch (e) {
      console.error(`测试玩家${playerId}链接失败:`, e)
      return false
    }
  }
  
  // 清除本地存储
  const clearStorage = () => {
    localStorage.removeItem('bloodbond_game_state')
    localStorage.removeItem('bloodbond_player_access')
    setDebugInfo(prev => ({
      ...prev,
      localStorage: {
        bloodbond_game_state: null,
        bloodbond_player_access: null
      }
    }))
    alert('本地存储已清除')
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">测试页面 - 多设备访问</h2>
      
      <div className="mb-6 flex justify-center space-x-4">
        <button
          onClick={initTestData}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
        >
          初始化测试数据
        </button>
        
        <button
          onClick={clearStorage}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
        >
          清除本地存储
        </button>
      </div>
      
      {roomId ? (
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">房间号: {roomId}</h3>
            <p className="text-sm text-gray-400 mb-4">
              以下是每个玩家的访问链接，点击可以在新窗口打开
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => (
              <div key={player.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">玩家 {player.id}</h4>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => testPlayerLink(player.id)}
                      className={`text-xs px-2 py-1 ${testResults[player.id] ? 'bg-green-600' : 'bg-blue-600'} hover:bg-blue-700 rounded`}
                    >
                      {testResults[player.id] ? '已测试' : '测试链接'}
                    </button>
                  </div>
                </div>
                <a 
                  href={generatePlayerLink(player.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-2 bg-blue-600 hover:bg-blue-700 rounded text-center"
                >
                  打开玩家 {player.id} 的视图
                </a>
                <p className="text-xs mt-2 text-gray-400">
                  链接: {generatePlayerLink(player.id)}
                </p>
                <p className="text-xs mt-1 text-gray-500">
                  访问代码: {player.accessCode}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-bold mb-2">调试信息</h3>
            <pre className="text-xs text-gray-400 overflow-auto max-h-60">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">尚未创建房间，请点击"初始化测试数据"按钮</p>
        </div>
      )}
    </div>
  )
}

export default TestPage