import React from 'react'
import { CharacterType, Faction } from '../types/gameTypes'
import { getCharacterName, getCharacterAbilityDescription, getFactionName, getFactionColor } from '../utils/gameUtils'
import { getCharacterImage, getCharacterBackground } from '../assets/characters'

interface CharacterCardProps {
  characterType: CharacterType
  faction: Faction
  isRevealed?: boolean
  showAbility?: boolean
  className?: string
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  characterType,
  faction,
  isRevealed = false,
  showAbility = false,
  className = ''
}) => {
  const characterName = getCharacterName(characterType)
  const factionName = getFactionName(faction)
  const factionColor = getFactionColor(faction)
  const abilityDescription = getCharacterAbilityDescription(characterType)
  const characterImage = getCharacterImage(characterType)
  const characterBg = getCharacterBackground(characterType)

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg border-2 border-gray-300 ${className}`}>
      {/* 角色背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${characterBg})` }}
      />
      
      {/* 卡片内容 */}
      <div className="relative z-10 p-4 bg-white/90 backdrop-blur-sm">
        {/* 角色图片 */}
        <div className="flex justify-center mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
            <img
              src={characterImage}
              alt={characterName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 如果图片加载失败，显示默认图片
                const target = e.target as HTMLImageElement
                target.src = '/src/assets/characters/default.svg'
              }}
            />
          </div>
        </div>

        {/* 角色信息 */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{characterName}</h3>
          
          {isRevealed && (
            <div className="mb-2">
              <span className={`text-sm font-medium ${factionColor}`}>
                {factionName}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                等级: {characterType}
              </span>
            </div>
          )}

          {/* 角色能力描述 */}
          {showAbility && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
              <p className="font-medium mb-1">角色能力:</p>
              <p className="text-xs leading-relaxed">{abilityDescription}</p>
            </div>
          )}

          {/* 未揭示状态提示 */}
          {!isRevealed && (
            <div className="mt-2 text-xs text-gray-500">
              点击查看角色信息
            </div>
          )}
        </div>
      </div>

      {/* 阵营标识角标 */}
      {isRevealed && (
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full ${factionColor.replace('text-', 'bg-')} flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">
            {faction === Faction.Phoenix ? '鳳' : faction === Faction.Gargoyle ? '石' : '中'}
          </span>
        </div>
      )}
    </div>
  )
}

export default CharacterCard 