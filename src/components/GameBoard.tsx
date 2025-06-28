import { useState } from 'react'
import { useGame } from '../context/GameContext'
import PlayerCard from './PlayerCard'
import PlayerView from './PlayerView'
import { Player } from '../types/gameTypes'

interface GameBoardProps {
  onBackToSetup: () => void
}

const GameBoard = ({ onBackToSetup }: GameBoardProps) => {
  const { players, resetGame } = useGame()
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showRules, setShowRules] = useState(false)

  const handleBackToSetup = () => {
    resetGame()
    onBackToSetup()
  }

  return (
    <div className="w-full">
      {selectedPlayer ? (
        <PlayerView 
          player={selectedPlayer} 
          onBack={() => setSelectedPlayer(null)} 
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">玩家列表</h2>
            <div>
              <button 
                onClick={() => setShowRules(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md mr-2"
              >
                查看规则
              </button>
              <button 
                onClick={handleBackToSetup}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
              >
                返回设置
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerCard 
                key={player.id}
                player={player}
                onClick={() => setSelectedPlayer(player)}
              />
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-4">游戏提示</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>点击玩家卡片可以查看该玩家的详细信息</li>
              <li>将设备传递给对应的玩家，让他们查看自己的身份</li>
              <li>玩家只能看到自己的身份，不要让其他玩家看到</li>
              <li>游戏中的所有操作需要在线下进行，本应用仅用于身份分配</li>
              <li>记得在查看完身份后点击「返回」按钮</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default GameBoard