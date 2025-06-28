import { Player } from '../types/gameTypes'

interface PlayerCardProps {
  player: Player
  onClick: () => void
}

const PlayerCard = ({ player, onClick }: PlayerCardProps) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">玩家 {player.id}</h3>
        <div className="flex">
          {Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full ml-1 ${index < player.wounds ? 'bg-red-500' : 'bg-gray-600'}`}
              title={`伤害: ${player.wounds}/3`}
            />
          ))}
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        {player.revealedFaction ? (
          <div className={`${player.faction === 'phoenix' ? 'text-red-500' : player.faction === 'gargoyle' ? 'text-blue-500' : 'text-yellow-500'}`}>
            阵营已揭示: {player.faction === 'phoenix' ? '鳳凰氏族' : player.faction === 'gargoyle' ? '石像鬼氏族' : '中立'}
          </div>
        ) : (
          <div>阵营未揭示</div>
        )}
        
        {player.revealedRank ? (
          <div>
            等级已揭示: {player.rank}
          </div>
        ) : (
          <div>等级未揭示</div>
        )}
      </div>
      
      {player.abilityCards.length > 0 && (
        <div className="mt-2 text-xs">
          <span className="text-gray-400">能力卡:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {player.abilityCards.map((card, index) => (
              <span key={index} className="px-2 py-1 bg-gray-700 rounded-md">
                {card === 'sword' ? '長劍' : 
                 card === 'fan' ? '折扇' : 
                 card === 'staff' ? '法杖' : 
                 card === 'shield' ? '盾牌' : 
                 card === 'curse' ? '詛咒' : 
                 card === 'quill' ? '鵝毛筆' : card}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 text-center">
        <button className="w-full py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
          查看身份
        </button>
      </div>
    </div>
  )
}

export default PlayerCard