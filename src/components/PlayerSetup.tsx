import { useState } from 'react'
import { useGame } from '../context/GameContext'

interface PlayerSetupProps {
  onStartGame: () => void
}

const PlayerSetup = ({ onStartGame }: PlayerSetupProps) => {
  const { setPlayerCount } = useGame()
  const [count, setCount] = useState<number>(8)
  const [error, setError] = useState<string>('')

  const handlePlayerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setCount(value)
    
    if (value < 6 || value > 12) {
      setError('玩家数量必须在6到12人之间')
    } else {
      setError('')
    }
  }

  const handleStartGame = () => {
    if (count < 6 || count > 12) {
      setError('玩家数量必须在6到12人之间')
      return
    }
    
    setPlayerCount(count)
    onStartGame()
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">游戏设置</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" htmlFor="playerCount">
          选择玩家人数 (6-12人)
        </label>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">6</span>
          <input
            type="range"
            id="playerCount"
            min="6"
            max="12"
            value={count}
            onChange={handlePlayerCountChange}
            className="w-3/4 mx-2"
          />
          <span className="text-sm">12</span>
        </div>
        
        <div className="text-center text-xl font-bold">{count} 人</div>
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        
        <div className="mt-2 text-sm text-gray-400">
          {count % 2 === 0 ? (
            <p>每个阵营将有 {count / 2} 名玩家</p>
          ) : (
            <p>鳳凰氏族 {Math.floor(count / 2)} 人，石像鬼氏族 {Math.floor(count / 2)} 人，调查官 1 人</p>
          )}
        </div>
      </div>
      
      <button
        onClick={handleStartGame}
        disabled={count < 6 || count > 12}
        className={`w-full py-2 px-4 rounded-md ${count < 6 || count > 12 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
      >
        下一步：创建房间
      </button>
    </div>
  )
}

export default PlayerSetup