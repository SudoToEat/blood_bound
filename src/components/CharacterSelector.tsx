import React, { useState } from 'react'
import { CharacterType, Faction } from '../types/gameTypes'
import { getCharacterName, getFactionName } from '../utils/gameUtils'
import { getCharacterImage } from '../assets/characters'
import CharacterCard from './CharacterCard'

interface CharacterSelectorProps {
  selectedCharacters: CharacterType[]
  onCharacterToggle: (characterType: CharacterType) => void
  maxPlayers: number
  className?: string
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedCharacters,
  onCharacterToggle,
  maxPlayers,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState<CharacterType | null>(null)
  // 角色详情弹窗支持阵营切换（仅演示/选择时）
  const [detailFaction, setDetailFaction] = useState<Faction>(Faction.Phoenix)

  // 所有可用角色（排除调查官，除非是奇数玩家）
  const availableCharacters: CharacterType[] = [
    CharacterType.Elder,
    CharacterType.Assassin,
    CharacterType.Jester,
    CharacterType.Alchemist,
    CharacterType.Mentalist,
    CharacterType.Guardian,
    CharacterType.Berserker,
    CharacterType.Mage,
    CharacterType.Geisha,
    ...(maxPlayers % 2 !== 0 ? [CharacterType.Inquisitor] : [])
  ]

  const handleCharacterClick = (characterType: CharacterType) => {
    if (selectedCharacters.includes(characterType)) {
      onCharacterToggle(characterType)
    } else if (selectedCharacters.length < maxPlayers) {
      onCharacterToggle(characterType)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">选择角色</h3>
        <p className="text-sm text-gray-600">
          已选择 {selectedCharacters.length}/{maxPlayers} 个角色
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {availableCharacters.map((characterType) => {
          const isSelected = selectedCharacters.includes(characterType)
          const isDisabled = !isSelected && selectedCharacters.length >= maxPlayers
          const characterName = getCharacterName(characterType)
          const characterImage = getCharacterImage(characterType)

          return (
            <div
              key={characterType}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 scale-105' 
                  : isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105 hover:shadow-lg'
              }`}
              onClick={() => !isDisabled && handleCharacterClick(characterType)}
            >
              {/* 角色缩略图 */}
              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-gray-300">
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
                
                {/* 选择状态指示器 */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              {/* 角色名称 */}
              <div className="text-center mt-2">
                <p className="text-xs font-medium text-gray-800">{characterName}</p>
                <p className="text-xs text-gray-500">等级 {characterType}</p>
              </div>

              {/* 详细信息按钮 */}
              <button
                className="absolute top-0 left-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(showDetails === characterType ? null : characterType)
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">详情</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* 详细信息模态框 */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">角色详情</h3>
              <button
                onClick={() => setShowDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {/* 阵营切换按钮，仅1-9号角色可切换 */}
            {showDetails !== CharacterType.Inquisitor && (
              <div className="flex justify-center mb-4 space-x-2">
                <button
                  className={`px-3 py-1 rounded ${detailFaction === Faction.Phoenix ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setDetailFaction(Faction.Phoenix)}
                >
                  鳳凰氏族
                </button>
                <button
                  className={`px-3 py-1 rounded ${detailFaction === Faction.Gargoyle ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setDetailFaction(Faction.Gargoyle)}
                >
                  石像鬼氏族
                </button>
              </div>
            )}
            <CharacterCard
              characterType={showDetails}
              faction={showDetails === CharacterType.Inquisitor ? Faction.Neutral : detailFaction}
              isRevealed={true}
              showAbility={true}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CharacterSelector 