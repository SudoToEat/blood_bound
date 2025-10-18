import { Player, CharacterType } from '../types/gameTypes'
import { getCharacterName, getCharacterAbilityDescription, getFactionName, getFactionColor, getPreviousPlayerDisplayedFaction } from '../utils/gameUtils'
import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import RulesModal from './RulesModal'

interface PlayerViewProps {
  player: Player
  allPlayers?: Player[]
  onBack: () => void
  hideBackButton?: boolean
  isPlayerAccess?: boolean // 新增：标识是否是玩家访问模式
}

const PlayerView = ({ player, allPlayers, onBack, hideBackButton = false, isPlayerAccess = false }: PlayerViewProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const { sendPlayerAction } = useGame();

  useEffect(() => {
    // 检查玩家对象是否完整
    if (!player || !player.characterType || !player.faction) {
      console.error('玩家身份信息不完整:', player);
      setError('身份未分配，请等待主持人开始游戏或刷新页面');
      return;
    }
    setIsLoaded(true);
  }, [player]);

  // 处理展示线索
  const handleReveal = (revealType: 'red' | 'blue' | 'unknown') => {
    if (!player.reveals) {
      player.reveals = [];
    }
    if (player.reveals.length >= 3) {
      alert('已经展示了3个线索');
      return;
    }
    console.log(`玩家 ${player.id} 展示线索: ${revealType}`);
    sendPlayerAction('addReveal', { revealType });
  };

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400">{error}</h2>
          <p className="text-sm text-gray-400 mt-2">请稍后再试或联系主持人</p>
        </div>
        {!hideBackButton && (
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              返回
            </button>
          </div>
        )}
      </div>
    );
  }

  // 如果正在加载，显示加载状态
  if (!isLoaded) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">正在加载身份信息...</h2>
        </div>
      </div>
    );
  }

  const factionColorClass = getFactionColor(player.faction)

  // 获取上一个玩家的信息（如果有所有玩家数据）
  const previousPlayerInfo = allPlayers ? getPreviousPlayerDisplayedFaction(allPlayers, player.id) : null

  return (
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-auto">
      {/* 规则弹窗 */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <div className="text-center mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="w-8"></div> {/* 占位元素保持标题居中 */}
          <h2 className="text-2xl font-bold flex-1">玩家 {player.id} 的身份</h2>
          <button
            onClick={() => setShowRules(true)}
            className="text-gray-400 hover:text-white p-1"
            title="查看规则"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-400">请不要让其他玩家看到此屏幕</p>
      </div>

      {/* 显示上一个玩家的阵营颜色 */}
      {previousPlayerInfo && (
        <div className="mb-6 bg-gray-700 p-4 rounded-lg border-2 border-purple-500">
          <h4 className="font-bold mb-2 text-purple-300">右边玩家信息</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">玩家 {previousPlayerInfo.player.id} 的阵营:</span>
            <span className={`font-bold text-lg ${getFactionColor(previousPlayerInfo.displayedFaction)}`}>
              {getFactionName(previousPlayerInfo.displayedFaction)}
            </span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">{getCharacterName(player.characterType)}</h3>
            <p className={`${factionColorClass} font-bold`}>{getFactionName(player.faction)}</p>
          </div>
          <div className="text-3xl font-bold bg-gray-700 w-12 h-12 flex items-center justify-center rounded-full">
            {player.rank}
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h4 className="font-bold mb-2">角色能力</h4>
          <p>{getCharacterAbilityDescription(player.characterType)}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-bold mb-2">游戏提示</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>你的目标是找出并杀掉对方阵营的族长（等级为1的角色）</li>
            <li>被攻击时，你需要展示一个线索（阵营或等级）</li>
            <li>展示线索后，你可以发动自己的角色能力</li>
            {player.characterType === CharacterType.Jester && (
              <li className="text-yellow-400 font-bold">特殊提示：作为弄臣，你向右边玩家展示的阵营线索与你的实际阵营相反！</li>
            )}
            {player.characterType === CharacterType.Inquisitor && (
              <li className="text-yellow-400 font-bold">特殊提示：作为调查官，你是中立阵营，如果被杀或成功使用诅咒卡，你将单独获胜！</li>
            )}
          </ul>
        </div>
      </div>

      {/* 底部按钮区域 */}
      {isPlayerAccess ? (
        // 玩家访问模式：显示展示线索按钮
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-400 mb-3">
            已展示线索: {player.reveals?.length || 0} / 3
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleReveal('red')}
              disabled={player.reveals && player.reveals.length >= 3}
              className="py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              显示红色
            </button>
            <button
              onClick={() => handleReveal('blue')}
              disabled={player.reveals && player.reveals.length >= 3}
              className="py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              显示蓝色
            </button>
            <button
              onClick={() => handleReveal('unknown')}
              disabled={player.reveals && player.reveals.length >= 3}
              className="py-3 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              显示问号
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            点击按钮向主持人展示线索
          </p>
        </div>
      ) : (
        // 主持人查看模式：显示返回按钮
        !hideBackButton && (
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              返回
            </button>
          </div>
        )
      )}
    </div>
  )
}

export default PlayerView