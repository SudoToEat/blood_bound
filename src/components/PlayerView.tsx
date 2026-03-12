import { Player, CharacterType } from '../types/gameTypes'
import { getCharacterName, getCharacterAbilityDescription, getFactionName, getFactionColor, getPreviousPlayerDisplayedFaction } from '../utils/gameUtils'
import { getCharacterCardImage } from '../assets/characters'
import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from './ui/LoadingSpinner'
import RulesModal from './RulesModal'
import { logger } from '../utils/logger'
import { getPlayerRoundKey } from '../utils/gameState'

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [playerName, setPlayerName] = useState(player.name || '');
  const { sendPlayerAction, updatePlayerName, state } = useGame();
  const toast = useToast();
  const playerRoundKey = getPlayerRoundKey(player);

  useEffect(() => {
    setPlayerName(player.name || '');
  }, [player.name]);

  useEffect(() => {
    // 检查玩家对象是否完整
    if (!player || !player.characterType || !player.faction) {
      logger.error('玩家身份信息不完整:', player);
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
      toast.warning('已经展示了3个线索');
      return;
    }
    logger.log(`玩家 ${player.id} 展示线索: ${revealType}`);
    sendPlayerAction('addReveal', { revealType });
  };

  // 处理诅咒卡分配
  const [curseAllocations, setCurseAllocations] = useState<Record<number, 'real' | 'fake' | null>>({});

  useEffect(() => {
    setCurseAllocations({});
  }, [playerRoundKey]);

  // 获取可用的诅咒卡数量
  const getCurseCardCounts = () => {
    const playerCount = allPlayers?.length || 0;
    if (playerCount === 7) return { real: 1, fake: 1 };
    if (playerCount === 9) return { real: 1, fake: 2 };
    if (playerCount === 11) return { real: 1, fake: 3 };
    return { real: 0, fake: 0 };
  };

  // 计算已分配的诅咒卡数量
  const getAllocatedCounts = () => {
    const counts = { real: 0, fake: 0 };
    Object.values(curseAllocations).forEach(curse => {
      if (curse === 'real') counts.real++;
      if (curse === 'fake') counts.fake++;
    });
    return counts;
  };

  const handleCurseAllocation = (targetPlayerId: number, curseType: 'real' | 'fake' | null) => {
    setCurseAllocations(prev => ({
      ...prev,
      [targetPlayerId]: curseType
    }));
  };

  const handleConfirmCurseDistribution = () => {
    const availableCounts = getCurseCardCounts();
    const allocatedCounts = getAllocatedCounts();

    // 验证分配数量
    if (allocatedCounts.real !== availableCounts.real || allocatedCounts.fake !== availableCounts.fake) {
      toast.error(`必须分配完所有诅咒卡！\n真诅咒：${allocatedCounts.real}/${availableCounts.real}\n假诅咒：${allocatedCounts.fake}/${availableCounts.fake}`);
      return;
    }

    toast.confirm(
      '确定要分配这些诅咒卡吗？此操作整局游戏只能执行一次！',
      () => {
        logger.log(`审判官 ${player.id} 分配诅咒卡:`, curseAllocations);
        sendPlayerAction('distributeCurses', { allocations: curseAllocations });
      }
    );
  };

  // 处理姓名保存
  const handleSaveName = () => {
    if (playerName.trim()) {
      updatePlayerName(playerName.trim());
      setIsEditingName(false);
    } else {
      toast.warning('姓名不能为空');
    }
  };

  // 获取显示的玩家名称
  const getPlayerDisplayName = () => {
    return player.name || `玩家 ${player.id}`;
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
        <LoadingSpinner size="lg" message="正在加载身份信息..." />
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

      {/* 房间号显示 */}
      {state.roomId && (
        <div className="mb-4 p-2 bg-blue-900 border border-blue-700 rounded-lg text-center">
          <span className="text-xs text-blue-300">房间号:</span>
          <span className="ml-2 text-lg font-mono font-bold text-blue-100">{state.roomId}</span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="w-8"></div> {/* 占位元素保持标题居中 */}
          <div className="flex-1 flex items-center justify-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="输入姓名"
                  maxLength={10}
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setPlayerName(player.name || '');
                  }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  取消
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{getPlayerDisplayName()} 的身份</h2>
                {isPlayerAccess && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 hover:text-white p-1"
                    title="修改姓名"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
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

      {/* 显示上一个玩家的阵营颜色 - 仅在玩家访问模式下显示 */}
      {isPlayerAccess && previousPlayerInfo && (
        <div className="mb-6 bg-gray-700 p-4 rounded-lg border-2 border-purple-500">
          <h4 className="font-bold mb-2 text-purple-300">前一个玩家信息</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              {previousPlayerInfo.player.name || `玩家 ${previousPlayerInfo.player.id}`} 的阵营:
            </span>
            <span className={`font-bold text-lg ${getFactionColor(previousPlayerInfo.displayedFaction)}`}>
              {getFactionName(previousPlayerInfo.displayedFaction)}
            </span>
          </div>
        </div>
      )}

      <div className="mb-6">
        {/* 角色卡片图片 */}
        <div className="mb-4 flex justify-center">
          <img
            src={getCharacterCardImage(player.characterType)}
            alt={getCharacterName(player.characterType)}
            className="w-full max-w-md rounded-lg shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              // 如果图片加载失败，显示占位符
              target.style.display = 'none'
            }}
          />
        </div>

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
              <li className="text-yellow-400 font-bold">特殊提示：作为调查官，你是中立阵营，不可以攻击已经受伤三点的玩家。受伤时可以拿任意种类的阵营指示物。如果被杀掉或将真诅咒卡给最终获胜的氏族族长，你将单独获胜！</li>
            )}
          </ul>
        </div>

        {/* 调查官专属：显示给下家展示的阵营颜色 */}
        {player.characterType === CharacterType.Inquisitor && player.displayedFactionToNext && (
          <div className="bg-purple-900 border-2 border-purple-500 p-4 rounded-lg mt-4">
            <h4 className="font-bold mb-2 text-purple-300">你向下一位玩家展示的阵营</h4>
            <div className="flex items-center justify-center">
              <span className={`text-2xl font-bold ${
                player.displayedFactionToNext === 'red' ? 'text-red-500' : 'text-blue-500'
              }`}>
                {player.displayedFactionToNext === 'red' ? '🔴 凤凰氏族（红色）' : '🔵 石像鬼氏族（蓝色）'}
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              这个颜色在整局游戏中保持不变
            </p>
          </div>
        )}

        {/* 显示已展示的线索 - 对主机和玩家都显示 */}
        {player.reveals && player.reveals.length > 0 && (
          <div className="bg-gray-700 p-4 rounded-lg mt-4">
            <h4 className="font-bold mb-2">已展示线索 ({player.reveals.length} / 3)</h4>
            <div className="flex flex-wrap gap-2">
              {player.reveals.map((reveal, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    reveal === 'red' ? 'bg-red-600' :
                    reveal === 'blue' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}
                >
                  {reveal === 'red' ? '🔴 红色(凤凰)' :
                   reveal === 'blue' ? '🔵 蓝色(石像鬼)' :
                   '❓ 问号(未知)'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮区域 */}
      {isPlayerAccess ? (
        // 玩家访问模式：显示展示线索按钮
        <div className="space-y-3">
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

          {/* 审判官诅咒卡分配 */}
          {player.characterType === CharacterType.Inquisitor && (
            <div className="mt-6 pt-4 border-t border-gray-600">
              <h4 className="font-bold mb-2 text-yellow-400 text-center">
                诅咒卡分配 {player.curseDistributed ? '(已分配)' : '(可用)'}
              </h4>

              {!player.curseDistributed ? (
                <>
                  <div className="text-xs text-center text-gray-400 mb-3">
                    可用诅咒：真诅咒 {getAllocatedCounts().real}/{getCurseCardCounts().real} | 假诅咒 {getAllocatedCounts().fake}/{getCurseCardCounts().fake}
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allPlayers?.filter(p => p.id !== player.id).map(targetPlayer => (
                      <div key={targetPlayer.id} className="bg-gray-700 p-2 rounded flex items-center justify-between">
                        <span className="text-sm">{targetPlayer.name || `玩家 ${targetPlayer.id}`}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCurseAllocation(targetPlayer.id, null)}
                            className={`px-2 py-1 text-xs rounded ${
                              !curseAllocations[targetPlayer.id]
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            不给
                          </button>
                          <button
                            onClick={() => handleCurseAllocation(targetPlayer.id, 'fake')}
                            disabled={curseAllocations[targetPlayer.id] !== 'fake' && getAllocatedCounts().fake >= getCurseCardCounts().fake}
                            className={`px-2 py-1 text-xs rounded ${
                              curseAllocations[targetPlayer.id] === 'fake'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-purple-600 disabled:opacity-30 disabled:cursor-not-allowed'
                            }`}
                          >
                            假诅咒
                          </button>
                          <button
                            onClick={() => handleCurseAllocation(targetPlayer.id, 'real')}
                            disabled={curseAllocations[targetPlayer.id] !== 'real' && getAllocatedCounts().real >= getCurseCardCounts().real}
                            className={`px-2 py-1 text-xs rounded ${
                              curseAllocations[targetPlayer.id] === 'real'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed'
                            }`}
                          >
                            真诅咒
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleConfirmCurseDistribution}
                    className="w-full mt-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-md"
                  >
                    确认分配诅咒卡
                  </button>
                </>
              ) : (
                <p className="text-center text-sm text-green-400 mt-2">
                  诅咒卡已分配完成
                </p>
              )}

              <p className="text-center text-xs text-gray-500 mt-2">
                整局游戏只能分配一次
              </p>
            </div>
          )}
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
