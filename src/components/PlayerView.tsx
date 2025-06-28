import { Player, CharacterType } from '../types/gameTypes'
import { getCharacterName, getCharacterAbilityDescription, getFactionName, getFactionColor } from '../utils/gameUtils'

interface PlayerViewProps {
  player: Player
  onBack: () => void
  hideBackButton?: boolean
}

const PlayerView = ({ player, onBack, hideBackButton = false }: PlayerViewProps) => {
  const factionColorClass = getFactionColor(player.faction)

  return (
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">玩家 {player.id} 的身份</h2>
        <p className="text-sm text-gray-400">请不要让其他玩家看到此屏幕</p>
      </div>

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
              <li className="text-yellow-400 font-bold">特殊提示：作为弄臣，你向左边玩家展示的阵营线索与你的实际阵营相反！</li>
            )}
            {player.characterType === CharacterType.Inquisitor && (
              <li className="text-yellow-400 font-bold">特殊提示：作为调查官，你是中立阵营，如果被杀或成功使用诅咒卡，你将单独获胜！</li>
            )}
          </ul>
        </div>
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
  )
}

export default PlayerView