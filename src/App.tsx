import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom'
import PlayerSetup from './components/PlayerSetup'
import GameBoard from './components/GameBoard'
import RulesModal from './components/RulesModal'
import RoomSetup from './components/RoomSetup'
import PlayerAccess from './components/PlayerAccess'
import TestPage from './components/TestPage'
import { GameProvider } from './context/GameContext'

// 主路由组件
function AppRoutes() {
  const [searchParams] = useSearchParams()
  const testMode = searchParams.get('test') === 'true'
  
  // 如果是测试模式，显示测试页面
  if (testMode) {
    return <TestPage />
  }
  
  return <MainApp />
}

// 主应用组件
function MainApp() {
  const [gameStage, setGameStage] = useState<'setup' | 'room' | 'game'>('setup')
  const [showRules, setShowRules] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-red-600">鲜血盟约</h1>
        <h2 className="text-xl text-red-400">Blood Bound</h2>
      </header>

      <main className="w-full max-w-4xl">
        {gameStage === 'setup' && (
          <div className="flex flex-col items-center">
            <PlayerSetup onStartGame={() => setGameStage('room')} />
            <button 
              onClick={() => setShowRules(true)}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              查看游戏规则
            </button>
          </div>
        )}
        
        {gameStage === 'room' && (
          <RoomSetup onRoomReady={() => setGameStage('game')} />
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
          <Route path="/game" element={<GameBoard onBackToSetup={() => {}} />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<AppRoutes />} />
        </Routes>
      </Router>
    </GameProvider>
  )
}

export default App