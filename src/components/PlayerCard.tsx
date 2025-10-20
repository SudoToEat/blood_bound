import { Player } from '../types/gameTypes'
import { getCharacterImage } from '../assets/characters'
import { getCharacterName, getFactionName, getFactionColor } from '../utils/gameUtils'

interface PlayerCardProps {
  player: Player
  onClick: () => void
  showCharacterImage?: boolean
  onToggleReveal?: () => void // 新增：切换揭示状态的回调
  onHeal?: () => void // 新增：恢复血量的回调
  showOnlineStatus?: boolean // 是否显示在线状态
}

const PlayerCard = ({ player, onClick, showCharacterImage = false, onToggleReveal, onHeal, showOnlineStatus = false }: PlayerCardProps) => {
  const characterImage = getCharacterImage(player.characterType)
  const characterName = getCharacterName(player.characterType)
  const factionName = getFactionName(player.faction)
  const factionColor = getFactionColor(player.faction)

  // 判断是否已揭示身份（阵营或等级任一已揭示）
  const isRevealed = player.revealedFaction || player.revealedRank

  // 调试：输出玩家信息
  console.log(`PlayerCard ${player.id}: name="${player.name}", characterName="${characterName}"`);

  // 处理揭示按钮点击，阻止事件冒泡
  const handleToggleReveal = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleReveal?.()
  }

  // 处理恢复血量按钮点击，阻止事件冒泡
  const handleHeal = (e: React.MouseEvent) => {
    e.stopPropagation()
    onHeal?.()
  }

  // 获取展示指示器的颜色
  const getRevealColor = (reveal: 'red' | 'blue' | 'unknown' | undefined) => {
    if (reveal === 'red') return 'bg-red-500'
    if (reveal === 'blue') return 'bg-blue-500'
    if (reveal === 'unknown') return 'bg-gray-500'
    return 'bg-gray-600 border border-gray-500' // 默认空状态，使用更深的颜色和边框
  }

  // 获取展示指示器的内容
  const getRevealContent = (reveal: 'red' | 'blue' | 'unknown' | undefined) => {
    if (reveal === 'unknown') {
      return <span className="text-white text-xs font-bold">?</span>
    }
    return null
  }

  return (
    <div
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors relative"
      onClick={onClick}
    >
      {/* 在线状态指示器 - 仅在需要时显示 */}
      {showOnlineStatus && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div
            className={`w-3 h-3 rounded-full ${
              player.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`}
            title={player.isOnline ? '在线' : '离线'}
          />
        </div>
      )}

      <div className={`flex justify-between items-center mb-2 ${showOnlineStatus ? 'pr-4' : ''}`}>
        <h3 className="text-lg font-bold">{player.name || `玩家 ${player.id}`}</h3>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, index) => {
            const reveal = player.reveals?.[index]
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full flex items-center justify-center ${getRevealColor(reveal)}`}
                title={reveal ? `展示: ${reveal === 'red' ? '红色' : reveal === 'blue' ? '蓝色' : '问号'}` : '未展示'}
              >
                {getRevealContent(reveal)}
              </div>
            )
          })}
        </div>
      </div>

      {/* 角色图片显示 */}
      {showCharacterImage && (
        <div className="flex justify-center mb-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
              <img
                src={characterImage}
                alt={characterName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/src/assets/characters/default.svg'
                }}
              />
            </div>
            {/* 角色名称标签 */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                {characterName}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-400">
        <div className={`${player.revealedFaction ? factionColor : ''} font-semibold mb-1`}>
          阵营: {player.revealedFaction ? factionName : '未揭示'}
        </div>

        <div className="font-semibold">
          等级: {player.revealedRank ? player.rank : '未揭示'}
        </div>

        {/* 如果阵营或等级已揭示，显示角色 */}
        {(player.revealedFaction || player.revealedRank) && (
          <div className="mt-2 text-xs">
            <div className="text-yellow-400">
              角色: {characterName}
            </div>
          </div>
        )}
      </div>
      
      {player.abilityCards.length > 0 && (
        <div className="mt-2 text-xs">
          <span className="text-gray-400">能力卡:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {player.abilityCards.map((card, index) => (
              <span key={index} className="px-2 py-1 bg-gray-700 rounded-md">
                {card === 'sword' ? '长剑' :
                 card === 'fan' ? '折扇' :
                 card === 'staff' ? '法杖' :
                 card === 'shield' ? '盾牌' :
                 card === 'curse' ? '诅咒' :
                 card === 'quill' ? '鹅毛笔' : card}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 space-y-2">
        {/* 次要操作：揭示/隐藏身份 */}
        {onToggleReveal && (
          <button
            onClick={handleToggleReveal}
            className={`w-full py-1 px-2 rounded text-sm transition-colors ${
              isRevealed
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRevealed ? '🙈 隐藏身份' : '👀 揭示身份'}
          </button>
        )}

        {/* 辅助操作：恢复血量 */}
        {onHeal && player.reveals && player.reveals.length > 0 && (
          <button
            onClick={handleHeal}
            className="w-full py-1 px-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
          >
            💚 恢复血量
          </button>
        )}
      </div>
    </div>
  )
}

export default PlayerCard