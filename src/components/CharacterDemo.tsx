import React, { useState } from 'react'
import { CharacterType, Faction } from '../types/gameTypes'
import CharacterCard from './CharacterCard'
import CharacterSelector from './CharacterSelector'
import CharacterGallery from './CharacterGallery'

const CharacterDemo: React.FC = () => {
  const [selectedCharacters, setSelectedCharacters] = useState<CharacterType[]>([])
  const [activeTab, setActiveTab] = useState<'cards' | 'selector' | 'gallery'>('cards')

  const handleCharacterToggle = (characterType: CharacterType) => {
    setSelectedCharacters(prev => 
      prev.includes(characterType) 
        ? prev.filter(c => c !== characterType)
        : [...prev, characterType]
    )
  }

  // 示例角色数据
  const sampleCharacters = [
    // 凤凰氏族 1-9
    ...Array.from({ length: 9 }, (_, i) => ({ type: (i + 1) as CharacterType, faction: Faction.Phoenix })),
    // 石像鬼氏族 1-9
    ...Array.from({ length: 9 }, (_, i) => ({ type: (i + 1) as CharacterType, faction: Faction.Gargoyle })),
    // 中立角色 10
    { type: CharacterType.Inquisitor, faction: Faction.Neutral }
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">血契猎杀 - 角色图片演示</h1>
          <p className="text-gray-600">展示游戏中的角色图片和卡片功能</p>
        </div>

        {/* 标签页导航 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'cards' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              角色卡片
            </button>
            <button
              onClick={() => setActiveTab('selector')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'selector' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              角色选择器
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'gallery' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              角色图鉴
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'cards' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">角色卡片展示</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sampleCharacters.map(({ type, faction }) => (
                  <CharacterCard
                    key={type}
                    characterType={type}
                    faction={faction}
                    isRevealed={true}
                    showAbility={true}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'selector' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">角色选择器</h2>
              <CharacterSelector
                selectedCharacters={selectedCharacters}
                onCharacterToggle={handleCharacterToggle}
                maxPlayers={8}
              />
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">已选择的角色：</h3>
                <p className="text-gray-600">
                  {selectedCharacters.length > 0 
                    ? selectedCharacters.map(c => c).join(', ')
                    : '暂无选择'
                  }
                </p>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <CharacterGallery />
            </div>
          )}
        </div>

        {/* 功能说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">功能说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">角色卡片</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 显示角色图片、名称和能力</li>
                <li>• 支持揭示/隐藏状态切换</li>
                <li>• 阵营标识和等级显示</li>
                <li>• 响应式设计，适配不同屏幕</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">角色选择器</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 可视化角色选择界面</li>
                <li>• 支持多选和取消选择</li>
                <li>• 角色详情查看功能</li>
                <li>• 选择数量限制</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">角色图鉴</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 完整的角色信息展示</li>
                <li>• 按阵营筛选功能</li>
                <li>• 详细角色能力说明</li>
                <li>• 美观的卡片布局</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">图片系统</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持PNG、JPG、SVG格式</li>
                <li>• 自动错误处理和默认图片</li>
                <li>• 响应式图片加载</li>
                <li>• 背景图片支持</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterDemo 