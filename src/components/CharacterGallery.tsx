import React, { useState } from 'react'
import { CharacterType, Faction } from '../types/gameTypes'
import { getCharacterName, getCharacterAbilityDescription, getFactionName } from '../utils/gameUtils'
import { fallbackCharacterImage, getCharacterImage } from '../assets/characters'
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
        <h2 className="bb-title mb-2 text-2xl">角色图鉴</h2>
        <p className="text-stone-400">了解血契猎杀中的所有角色</p>
      </div>

      {/* 阵营筛选 */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setSelectedFaction('all')}
          className={`rounded-md border px-4 py-2 font-medium transition-colors ${
            selectedFaction === 'all'
              ? 'border-amber-400/40 bg-amber-800 text-white'
              : 'border-stone-600 bg-stone-900 text-stone-300 hover:bg-stone-800'
          }`}
        >
          全部阵营
        </button>
        <button
          onClick={() => setSelectedFaction(Faction.Phoenix)}
          className={`rounded-md border px-4 py-2 font-medium transition-colors ${
            selectedFaction === Faction.Phoenix
              ? 'border-red-400/40 bg-red-800 text-white'
              : 'border-stone-600 bg-stone-900 text-stone-300 hover:bg-stone-800'
          }`}
        >
          鳳凰氏族
        </button>
        <button
          onClick={() => setSelectedFaction(Faction.Gargoyle)}
          className={`rounded-md border px-4 py-2 font-medium transition-colors ${
            selectedFaction === Faction.Gargoyle
              ? 'border-blue-400/40 bg-blue-800 text-white'
              : 'border-stone-600 bg-stone-900 text-stone-300 hover:bg-stone-800'
          }`}
        >
          石像鬼氏族
        </button>
        <button
          onClick={() => setSelectedFaction(Faction.Neutral)}
          className={`rounded-md border px-4 py-2 font-medium transition-colors ${
            selectedFaction === Faction.Neutral
              ? 'border-amber-400/40 bg-amber-800 text-white'
              : 'border-stone-600 bg-stone-900 text-stone-300 hover:bg-stone-800'
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
              className="bb-panel-muted cursor-pointer overflow-hidden transition-colors hover:border-amber-500/40"
              onClick={() => setSelectedCharacter({ type, faction })}
            >
              {/* 角色图片 */}
              <div className="relative h-48 bg-stone-950">
                <img
                  src={characterImage}
                  alt={characterName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = fallbackCharacterImage
                  }}
                />
                {/* 阵营标识 */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                    faction === Faction.Phoenix ? 'bg-red-700' :
                    faction === Faction.Gargoyle ? 'bg-blue-800' : 'bg-amber-700'
                  }`}>
                    {factionName}
                  </span>
                </div>
                {/* 等级标识 */}
                <div className="absolute top-2 left-2">
                  <span className="rounded-full border border-stone-400/30 bg-stone-950/80 px-2 py-1 text-xs font-medium text-white">
                    等级 {type}
                  </span>
                </div>
              </div>

              {/* 角色信息 */}
              <div className="p-4">
                <h3 className="bb-title mb-2 text-lg">{characterName}</h3>
                <p className="mb-3 text-sm text-stone-400">
                  {getCharacterAbilityDescription(type).substring(0, 60)}...
                </p>
                <button className="bb-button-blue w-full">
                  查看详情
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 角色详情模态框 */}
      {selectedCharacter && (
        <div className="bb-modal-backdrop">
          <div className="bb-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b p-6 bb-divider">
              <h3 className="bb-title text-xl">角色详情</h3>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="bb-icon-button"
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
