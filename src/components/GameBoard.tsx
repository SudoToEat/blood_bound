import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import PlayerCard from './PlayerCard'
import PlayerView from './PlayerView'
import { Player } from '../types/gameTypes'
import RulesModal from './RulesModal'

interface GameBoardProps {
  onBackToSetup: () => void
}

const GameBoard = ({ onBackToSetup }: GameBoardProps) => {
  const { state, resetGame, restartGame, updateGameState } = useGame()
  // 优先用完整Player对象数组，确保每次状态更新都重新计算
  const playerObjects: Player[] = Array.isArray(state.gameData?.players)
    ? [...state.gameData.players]
    : []
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)

  // 监听 gameData 变化，确保显示最新数据
  useEffect(() => {
    console.log('GameBoard gameData 更新:', state.gameData)
  }, [state.gameData])

  const handleBackToSetup = () => {
    resetGame()
    onBackToSetup()
  }

  const handleRestartGame = async () => {
    if (!confirm('确定要开始新的一局吗？所有玩家的身份和展示线索将重新分配。')) {
      return
    }

    setIsRestarting(true)
    try {
      await restartGame()
      setSelectedPlayer(null) // 关闭任何打开的玩家视图
      alert('游戏已重新开始！所有玩家身份已重新分配。')
    } catch (error) {
      console.error('重新开始游戏失败:', error)
      alert('重新开始游戏失败，请重试。')
    } finally {
      setIsRestarting(false)
    }
  }

  // 切换玩家身份揭示状态
  const handleToggleReveal = (playerId: number) => {
    if (!state.gameData || !state.gameData.players) {
      return
    }

    const updatedPlayers = state.gameData.players.map((player: Player) => {
      if (player.id === playerId) {
        // 如果已经揭示了（阵营或等级任一已揭示），则全部隐藏
        // 如果都未揭示，则全部揭示
        const shouldReveal = !player.revealedFaction && !player.revealedRank
        return {
          ...player,
          revealedFaction: shouldReveal,
          revealedRank: shouldReveal,
        }
      }
      return player
    })

    const updatedGameData = {
      ...state.gameData,
      players: updatedPlayers,
    }

    updateGameState(updatedGameData)
  }

  // 恢复玩家血量（移除最后一个线索）
  const handleHealPlayer = (playerId: number) => {
    if (!state.gameData || !state.gameData.players) {
      return
    }

    const updatedPlayers = state.gameData.players.map((player: Player) => {
      if (player.id === playerId && player.reveals && player.reveals.length > 0) {
        // 移除最后一个线索
        const newReveals = [...player.reveals]
        newReveals.pop()
        return {
          ...player,
          reveals: newReveals
        }
      }
      return player
    })

    const updatedGameData = {
      ...state.gameData,
      players: updatedPlayers,
    }

    updateGameState(updatedGameData)
  }

  // 健壮性：无玩家对象时友好提示
  if (!playerObjects || playerObjects.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-gray-400 text-lg mb-4">身份未分配，请等待主持人开始游戏或刷新页面。</div>
        <button
          onClick={handleBackToSetup}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
        >
          返回设置
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 玩家列表 */}
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
                onClick={handleRestartGame}
                disabled={isRestarting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md mr-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isRestarting ? '重新分配中...' : '开始新的一局'}
              </button>
              <button
                onClick={handleBackToSetup}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
              >
                返回设置
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playerObjects.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => setSelectedPlayer(player)}
                showCharacterImage={false}
                onToggleReveal={() => handleToggleReveal(player.id)}
                onHeal={() => handleHealPlayer(player.id)}
              />
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-4">游戏提示</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>点击玩家卡片可查看该玩家完整身份（阵营、角色、技能）</li>
              <li>点击"揭示身份/隐藏身份"按钮可在玩家卡片上显示或隐藏阵营和等级信息</li>
              <li>如需重新分配身份，点击"开始新的一局"按钮</li>
            </ul>
          </div>
        </>

      {/* 玩家详情模态框 */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <PlayerView
              player={selectedPlayer}
              allPlayers={playerObjects}
              onBack={() => setSelectedPlayer(null)}
              hideBackButton={false}
            />
          </div>
        </div>
      )}

      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}
    </div>
  )
}

export default GameBoard