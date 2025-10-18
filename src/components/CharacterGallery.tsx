import React, { useState } from 'react'
import { CharacterType, Faction } from '../types/gameTypes'
import { getCharacterName, getCharacterAbilityDescription, getFactionName } from '../utils/gameUtils'
import { getCharacterImage } from '../assets/characters'
import CharacterCard from './CharacterCard'

interface CharacterGalleryProps {
  className?: string
}

// 1-9号角色每个阵营都各有一套，10号为中立
const allGalleryCharacters: Array<{ type: CharacterType; faction: Faction }> = [
  // 凤凰氏族 1-9
  ...Array.from({ length: 9 }, (_, i) => ({ type: (i + 1) as CharacterType, faction: Faction.Phoenix })),
  // 石像鬼氏族 1-9
  ...Array.from({ length: 9 }, (_, i) => ({ type: (i + 1) as CharacterType, faction: Faction.Gargoyle })),
  // 中立角色 10
  { type: CharacterType.Inquisitor, faction: Faction.Neutral }
]

export const CharacterGallery: React.FC<CharacterGalleryProps> = ({ className = '' }) => {
  const [selectedFaction, setSelectedFaction] = useState<Faction | 'all'>('all')
  const [selectedCharacter, setSelectedCharacter] = useState<{ type: CharacterType; faction: Faction } | null>(null)

  // 过滤角色
  const filteredCharacters = allGalleryCharacters.filter(char =>
    selectedFaction === 'all' || char.faction === selectedFaction
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">角色图鉴</h2>
        <p className="text-gray-600">了解血契猎杀中的所有角色</p>
      </div>

      {/* 阵营筛选 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setSelectedFaction('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedFaction === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          全部阵营
        </button>
        <button
          onClick={() => setSelectedFaction(Faction.Phoenix)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedFaction === Faction.Phoenix 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          鳳凰氏族
        </button>
        <button
          onClick={() => setSelectedFaction(Faction.Gargoyle)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedFaction === Faction.Gargoyle 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          石像鬼氏族
        </button>
        <button
          onClick={() => setSelectedFaction(Faction.Neutral)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedFaction === Faction.Neutral 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          中立角色
        </button>
      </div>

      {/* 角色网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCharacters.map(({ type, faction }, idx) => {
          const characterName = getCharacterName(type)
          const characterImage = getCharacterImage(type)
          const factionName = getFactionName(faction)

          return (
            <div
              key={faction + '-' + type + '-' + idx}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCharacter({ type, faction })}
            >
              {/* 角色图片 */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={characterImage}
                  alt={characterName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/src/assets/characters/default.svg'
                  }}
                />
                {/* 阵营标识 */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                    faction === Faction.Phoenix ? 'bg-red-500' :
                    faction === Faction.Gargoyle ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}>
                    {factionName}
                  </span>
                </div>
                {/* 等级标识 */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-white">
                    等级 {type}
                  </span>
                </div>
              </div>

              {/* 角色信息 */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{characterName}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {getCharacterAbilityDescription(type).substring(0, 60)}...
                </p>
                <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  查看详情
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 角色详情模态框 */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">角色详情</h3>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <CharacterCard
                characterType={selectedCharacter.type}
                faction={selectedCharacter.faction}
                isRevealed={true}
                showAbility={true}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CharacterGallery 