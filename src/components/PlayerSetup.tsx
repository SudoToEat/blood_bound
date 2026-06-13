import { useState } from 'react'

interface PlayerSetupProps {
  onStartGame: (playerCount: number) => void
  isLoading?: boolean
}

const PlayerSetup = ({ onStartGame, isLoading: externalLoading = false }: PlayerSetupProps) => {
  const [count, setCount] = useState<number>(8)
  const [error, setError] = useState<string>('')
  const [internalLoading, setInternalLoading] = useState<boolean>(false)
  
  // 合并内部和外部的加载状态
  const isLoading = externalLoading || internalLoading

  const handlePlayerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setCount(value)
    
    if (value < 6 || value > 12) {
      setError('玩家数量必须在6到12人之间')
    } else {
      setError('')
    }
  }

  const handleStartGame = async () => {
    if (count < 6 || count > 12) {
      setError('玩家数量必须在6到12人之间')
      return
    }
    
    try {
      setInternalLoading(true)
      // 传递玩家数量给父组件
      await onStartGame(count)
    } catch (error) {
      console.error('创建房间失败:', error)
      setError('创建房间失败，请重试')
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <div className="bb-panel w-full max-w-md p-6 mx-auto">
      <h2 className="bb-title text-2xl mb-6 text-center">游戏设置</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-stone-300 mb-2" htmlFor="playerCount">
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
          className="w-3/4 mx-2 accent-red-700"
          />
          <span className="text-sm">12</span>
        </div>
        
        <div className="text-center text-3xl font-bold text-amber-200">{count} 人</div>
        
        {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
        
        <div className="mt-3 rounded-md border border-stone-700/70 bg-stone-950/40 p-3 text-sm text-stone-400">
          {count % 2 === 0 ? (
            <p>每个阵营将有 {count / 2} 名玩家</p>
          ) : (
            <p>鳳凰氏族 {Math.floor(count / 2)} 人，石像鬼氏族 {Math.floor(count / 2)} 人，调查官 1 人</p>
          )}
        </div>
      </div>
      
      <button
        onClick={handleStartGame}
        disabled={count < 6 || count > 12 || isLoading}
        className={`w-full ${count < 6 || count > 12 || isLoading ? 'bb-button-secondary' : 'bb-button-primary'}`}
      >
        {isLoading ? '创建中...' : '下一步：创建房间'}
      </button>
    </div>
  )
}

export default PlayerSetup
