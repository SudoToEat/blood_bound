import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom'
import PlayerSetup from './components/PlayerSetup'
import GameBoard from './components/GameBoard'
import RulesModal from './components/RulesModal'
import { RoomSetup } from './components/RoomSetup'
import { PlayerAccess } from './components/PlayerAccess'
import TestPage from './components/TestPage'
import CharacterDemo from './components/CharacterDemo'
import PlayerAccessDebug from './components/PlayerAccessDebug'
import { GameProvider, useGame } from './context/GameContext'

// 主路由组件
function AppRoutes() {
  const [searchParams] = useSearchParams()
  const testMode = searchParams.get('test') === 'true'
  const demoMode = searchParams.get('demo') === 'true'
  
  // 如果是测试模式，显示测试页面
  if (testMode) {
    return <TestPage />
  }
  
  // 如果是演示模式，显示角色演示页面
  if (demoMode) {
    return <CharacterDemo />
  }
  
  return <MainApp />
}

// 主应用组件
function MainApp() {
  const { state, createRoom } = useGame();
  const [gameStage, setGameStage] = useState<'setup' | 'room' | 'game'>('setup')
  const [showRules, setShowRules] = useState(false)
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 页面加载时检查是否有已保存的游戏状态
  useEffect(() => {
    if (state.roomId && state.gamePhase === 'playing') {
      console.log('检测到已保存的游戏，直接进入游戏阶段')
      setGameStage('game')
      setSelectedPlayerCount(state.playerCount)
    }
  }, [state.roomId, state.gamePhase, state.playerCount])

  // 监听 gamePhase 变化，自动切换到游戏阶段
  useEffect(() => {
    if (state.gamePhase === 'playing' && gameStage !== 'game') {
      console.log('游戏已开始，切换到游戏阶段')
      setGameStage('game')
    }
  }, [state.gamePhase, gameStage])

  // 新的房间创建流程
  const handleStartGame = async (playerCount: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedPlayerCount(playerCount);

      // 等待房间创建成功，使用API返回值而不是检查state（避免闭包陷阱）
      const roomId = await createRoom(playerCount);
      console.log('房间创建成功:', roomId);

      // 验证roomId有效性（使用返回值，而不是闭包中的state）
      if (!roomId || roomId.trim() === '') {
        console.error('服务器未返回有效的房间ID');
        setError('服务器未返回有效的房间ID，请重试');
        throw new Error('服务器未返回有效的房间ID');
      }

      // 房间创建成功，转换到房间阶段
      // dispatch已在createRoom内部执行，state会在下次渲染时更新
      console.log('GameContext已更新房间ID，切换到房间阶段');
      setGameStage('room');
    } catch (error) {
      console.error('创建房间失败:', error);
      setError(error instanceof Error ? error.message : '创建房间失败，请重试');
      throw error; // 将错误传递给调用者
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-red-600">鲜血盟约</h1>
        <h2 className="text-xl text-red-400">Blood Bound</h2>
      </header>

      <main className="w-full max-w-4xl">
        {gameStage === 'setup' && (
          <div className="flex flex-col items-center">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <PlayerSetup 
              onStartGame={handleStartGame}
              isLoading={isLoading}
            />
            <button 
              onClick={() => setShowRules(true)}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              disabled={isLoading}
            >
              查看游戏规则
            </button>
          </div>
        )}
        
        {gameStage === 'room' && (
          <RoomSetup 
            playerCount={selectedPlayerCount}
            onRoomReady={() => setGameStage('game')} 
          />
        )}
        
        {gameStage === 'game' && (
          <GameBoard onBackToSetup={() => setGameStage('setup')} />
        )}
      </main>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <footer className="mt-8 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} 鲜血盟约 - 本地网页版
      </footer>
    </div>
  )
}

// 应用入口
function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppRoutes />} />
          <Route path="/access/:roomId/:playerId" element={<PlayerAccess />} />
          <Route path="/debug/:roomId/:playerId" element={<PlayerAccessDebug />} />
          <Route path="/game" element={<GameBoard onBackToSetup={() => {}} />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/demo" element={<CharacterDemo />} />
          <Route path="*" element={<AppRoutes />} />
        </Routes>
      </Router>
    </GameProvider>
  )
}

export default App