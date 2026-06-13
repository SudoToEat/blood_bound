import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { useToast } from '../context/ToastContext'
import PlayerCard from './PlayerCard'
import PlayerView from './PlayerView'
import { Player } from '../types/gameTypes'
import RulesModal from './RulesModal'
import { logger } from '../utils/logger'

interface GameBoardProps {
  onBackToSetup: () => void
}

const isPlayerFullyRevealed = (player: Player) => player.revealedFaction && player.revealedRank

const getRevealClass = (reveal: 'red' | 'blue' | 'unknown') => {
  if (reveal === 'red') return 'bg-red-700 text-red-50 border-red-400/30'
  if (reveal === 'blue') return 'bg-blue-800 text-blue-50 border-blue-400/30'
  return 'bg-stone-700 text-stone-50 border-stone-400/30'
}

const getAbilityCardLabel = (card: string) => (
  card === 'sword' ? '长剑' :
  card === 'fan' ? '折扇' :
  card === 'staff' ? '法杖' :
  card === 'shield' ? '盾牌' :
  card === 'curse' ? '诅咒' :
  card === 'quill' ? '鹅毛笔' : card
)

interface HostSafePlayerDetailProps {
  player: Player
  onBack: () => void
}

const HostSafePlayerDetail = ({ player, onBack }: HostSafePlayerDetailProps) => (
  <div className="bb-panel w-full max-w-lg p-6">
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="bb-title text-2xl">{player.name || `玩家 ${player.id}`}</h2>
        <p className="bb-subtitle mt-1">请不要让其他玩家看到此屏幕</p>
      </div>
      <button onClick={onBack} className="bb-icon-button" aria-label="关闭">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="bb-panel-muted p-4">
        <div className="text-xs text-stone-500">阵营</div>
        <div className="mt-1 font-bold text-stone-300">未揭示</div>
      </div>
      <div className="bb-panel-muted p-4">
        <div className="text-xs text-stone-500">等级</div>
        <div className="mt-1 font-bold text-stone-300">未揭示</div>
      </div>
    </div>

    {player.abilityCards.length > 0 && (
      <div className="mt-4 bb-panel-muted p-4">
        <h4 className="mb-2 font-bold text-stone-200">能力卡:</h4>
        <div className="flex flex-wrap gap-2">
          {player.abilityCards.map((card, index) => (
            <span key={index} className="bb-chip text-stone-200">
              {getAbilityCardLabel(card)}
            </span>
          ))}
        </div>
      </div>
    )}

    {player.hasCurse && (
      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/30 p-4 text-amber-100">
        被诅咒
      </div>
    )}

    <div className="mt-4 bb-panel-muted p-4">
      <h4 className="mb-3 font-bold text-stone-200">已展示线索 ({player.reveals?.length || 0} / 3)</h4>
      <div className="flex flex-wrap gap-2">
        {player.reveals && player.reveals.length > 0 ? (
          player.reveals.map((reveal, index) => (
            <span
              key={`${player.id}-safe-reveal-${index}`}
              className={`rounded-full border px-3 py-1 text-sm font-bold ${getRevealClass(reveal)}`}
            >
              {reveal === 'red' ? '红色' : reveal === 'blue' ? '蓝色' : '问号'}
            </span>
          ))
        ) : (
          Array.from({ length: 3 }).map((_, index) => (
            <span key={`${player.id}-empty-reveal-${index}`} className="bb-token bb-token-empty" />
          ))
        )}
      </div>
    </div>

    <div className="mt-6 flex justify-center">
      <button onClick={onBack} className="bb-button-blue">
        返回
      </button>
    </div>
  </div>
)

const GameBoard = ({ onBackToSetup }: GameBoardProps) => {
  const { state, resetGame, restartGame, updateGameState } = useGame()
  const toast = useToast()
  // 优先用完整Player对象数组，确保每次状态更新都重新计算
  const playerObjects: Player[] = Array.isArray(state.gameData?.players)
    ? [...state.gameData.players]
    : []
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [showAllIdentities, setShowAllIdentities] = useState(false)
  const selectedPlayer = selectedPlayerId
    ? playerObjects.find((player) => player.id === selectedPlayerId) || null
    : null

  // 监听 gameData 变化，确保显示最新数据
  useEffect(() => {
    logger.log('GameBoard gameData 更新:', state.gameData)
  }, [state.gameData])

  const handleBackToSetup = () => {
    resetGame()
    onBackToSetup()
  }

  const handleRestartGame = async () => {
    toast.confirm(
      '确定要开始新的一局吗？所有玩家的身份和展示线索将重新分配。',
      async () => {
        setIsRestarting(true)
        try {
          await restartGame()
          setSelectedPlayerId(null) // 关闭任何打开的玩家视图
          setShowAllIdentities(false) // 重置揭示所有身份状态
          toast.success('游戏已重新开始！所有玩家身份已重新分配。')
        } catch (error) {
          logger.error('重新开始游戏失败:', error)
          toast.error('重新开始游戏失败，请重试。')
        } finally {
          setIsRestarting(false)
        }
      }
    )
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

  // 揭示所有玩家身份
  const handleRevealAll = () => {
    if (!state.gameData || !state.gameData.players) {
      return
    }

    if (showAllIdentities) {
      // 隐藏所有身份
      const updatedPlayers = state.gameData.players.map((player: Player) => ({
        ...player,
        revealedFaction: false,
        revealedRank: false,
      }))

      const updatedGameData = {
        ...state.gameData,
        players: updatedPlayers,
      }

      updateGameState(updatedGameData)
      setShowAllIdentities(false)
      toast.info('已隐藏所有玩家身份')
    } else {
      // 揭示所有身份
      const updatedPlayers = state.gameData.players.map((player: Player) => ({
        ...player,
        revealedFaction: true,
        revealedRank: true,
      }))

      const updatedGameData = {
        ...state.gameData,
        players: updatedPlayers,
      }

      updateGameState(updatedGameData)
      setShowAllIdentities(true)
      toast.success('已揭示所有玩家身份')
    }
  }

  // 健壮性：无玩家对象时友好提示
  if (!playerObjects || playerObjects.length === 0) {
    return (
      <div className="bb-panel mx-auto flex min-h-[300px] w-full max-w-lg flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 text-lg text-stone-300">身份未分配，请等待主持人开始游戏或刷新页面。</div>
        <button
          onClick={handleBackToSetup}
          className="bb-button-danger"
        >
          返回设置
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 房间号显示 */}
      {state.roomId && (
        <div className="bb-panel-muted mb-5 p-4 text-center">
          <span className="text-sm text-blue-200">当前房间号:</span>
          <span className="ml-2 text-2xl font-mono font-bold text-blue-100">{state.roomId}</span>
        </div>
      )}

      {/* 玩家列表 */}
      <>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="bb-title text-3xl">玩家列表</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowRules(true)}
                className="bb-button-secondary"
              >
                查看规则
              </button>
              <button
                onClick={handleRevealAll}
                className={`${
                  showAllIdentities
                    ? 'bb-button-secondary'
                    : 'bb-button-gold'
                }`}
              >
                {showAllIdentities ? '🙈 隐藏所有身份' : '👀 揭示所有身份'}
              </button>
              <button
                onClick={handleRestartGame}
                disabled={isRestarting}
                className="bb-button-blue"
              >
                {isRestarting ? '重新分配中...' : '开始新的一局'}
              </button>
              <button
                onClick={handleBackToSetup}
                className="bb-button-danger"
              >
                返回设置
              </button>
            </div>
          </div>

          <div className="bb-table-felt rounded-lg border border-amber-900/30 p-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playerObjects.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => setSelectedPlayerId(player.id)}
                showCharacterImage={false}
                onToggleReveal={() => handleToggleReveal(player.id)}
                onHeal={() => handleHealPlayer(player.id)}
                forceShowCurse={showAllIdentities}
              />
            ))}
            </div>
          </div>

          <div className="bb-panel-muted mt-8 p-4">
            <h3 className="bb-title mb-4 text-xl">游戏提示</h3>
            <ul className="list-disc space-y-2 pl-5 text-stone-300">
              <li>点击玩家卡片可查看该玩家完整身份（阵营、角色、技能）</li>
              <li>点击"揭示身份/隐藏身份"按钮可在玩家卡片上显示或隐藏阵营和等级信息</li>
              <li>如需重新分配身份，点击"开始新的一局"按钮</li>
            </ul>
          </div>
        </>

      {/* 玩家详情模态框 */}
      {selectedPlayer && (
        <div
          className="bb-modal-backdrop"
          onClick={() => setSelectedPlayerId(null)}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isPlayerFullyRevealed(selectedPlayer) ? (
              <PlayerView
                player={selectedPlayer}
                allPlayers={playerObjects}
                onBack={() => setSelectedPlayerId(null)}
                hideBackButton={false}
              />
            ) : (
              <HostSafePlayerDetail
                player={selectedPlayer}
                onBack={() => setSelectedPlayerId(null)}
              />
            )}
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
