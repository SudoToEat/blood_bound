import { useState } from 'react'
import { CharacterType, AbilityCardType } from '../types/gameTypes'
import { getCharacterName, getCharacterAbilityDescription } from '../utils/gameUtils'

interface RulesModalProps {
  onClose: () => void
}

const RulesModal = ({ onClose }: RulesModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'abilities' | 'reference'>('overview')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-red-500">游戏规则</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 ${activeTab === 'overview' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('overview')}
          >
            游戏概述
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'characters' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('characters')}
          >
            角色能力
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'abilities' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('abilities')}
          >
            能力卡
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reference' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('reference')}
          >
            参考卡
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-bold mb-4">游戏简介</h3>
              <p className="mb-4">
                血契獵殺(Blood Bound)是一款陣營推理類桌遊。玩家会分成两大陣營(也有第三个陣營)，目标是找出并殺掉对方陣營的族长(等级数字最小的角色是族长)。
              </p>
              <p className="mb-4">
                在游戏过程中，玩家的身份是秘密，只能透过攻击彼此，来揭露对方的陣營和等级线索。线索出来后就要尽快推理找出目标，然后殺掉对手的族长。
              </p>
              
              <h3 className="text-xl font-bold mb-4 mt-6">游戏流程</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>玩家会被随机分配角色和阵营，每人只能看到自己的身份。</li>
                <li>游戏开始时，随机选择一名玩家获得匕首。</li>
                <li>持有匕首的玩家必须攻击另一名玩家，被攻击的玩家受到一点伤害。</li>
                <li>被攻击的玩家需要展示一个线索（阵营或等级），然后可以发动自己的角色能力。</li>
                <li>攻击完成后，匕首传递给被攻击的玩家，由他继续攻击下一名玩家。</li>
                <li>当一名玩家认为已经找到对方阵营的族长时，可以宣布「血契」并指认一名玩家。</li>
                <li>如果指认正确（指认的玩家是对方阵营的族长），则指认者所在阵营获胜；如果指认错误，则对方阵营获胜。</li>
              </ol>
              
              <h3 className="text-xl font-bold mb-4 mt-6">干涉规则</h3>
              <p className="mb-4">
                当一名玩家被攻击时，其他玩家可以选择「干涉」，替被攻击的玩家承受伤害。干涉的玩家会受到一点伤害并获得匕首，然后可以发动自己的角色能力。
              </p>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 凤凰氏族1-9 */}
              {Array.from({ length: 9 }, (_, i) => i + 1).map((characterId) => {
                const characterType = characterId as CharacterType
                return (
                  <div key={'phoenix-' + characterId} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold">
                        {getCharacterName(characterType)}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-sm bg-red-800 text-red-200">
                        鳳凰氏族
                      </span>
                    </div>
                    <p className="text-sm">{getCharacterAbilityDescription(characterType)}</p>
                  </div>
                )
              })}
              {/* 石像鬼氏族1-9 */}
              {Array.from({ length: 9 }, (_, i) => i + 1).map((characterId) => {
                const characterType = characterId as CharacterType
                return (
                  <div key={'gargoyle-' + characterId} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold">
                        {getCharacterName(characterType)}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-sm bg-blue-800 text-blue-200">
                        石像鬼氏族
                      </span>
                    </div>
                    <p className="text-sm">{getCharacterAbilityDescription(characterType)}</p>
                  </div>
                )
              })}
              {/* 中立角色10 */}
              <div key={'neutral-10'} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold">
                    {getCharacterName(10 as CharacterType)}
                  </h3>
                  <span className="px-2 py-1 rounded-full text-sm bg-yellow-800 text-yellow-200">
                    中立
                  </span>
                </div>
                <p className="text-sm">{getCharacterAbilityDescription(10 as CharacterType)}</p>
              </div>
            </div>
          )}

          {activeTab === 'abilities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">長劍</h3>
                <p className="text-sm">衛士角色能力会获得长劍卡。</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">折扇</h3>
                <p className="text-sm">舞妓角色能力会给予一名玩家折扇卡。有折扇卡的玩家，无法让其他玩家进行干涉。</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">法杖</h3>
                <p className="text-sm">法師角色能力会给予自己和一名玩家法杖卡。有法杖卡的玩家拿陣營指示物时，只能拿未知陣營指示物。</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">盾牌</h3>
                <p className="text-sm">衛士角色能力会给予一名玩家盾牌卡。其他玩家无法攻击或用能力傷害有盾牌卡的玩家。</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">詛咒</h3>
                <p className="text-sm">調查官角色能力会使用詛咒卡。調查官将真詛咒卡给最终获胜的氏族族长时，变成調查官单独获得胜利。</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">鵝毛筆</h3>
                <p className="text-sm">长老角色能力会使用鵝毛筆能力，将数字最大的角色变成氏族族长。</p>
              </div>
            </div>
          )}

          {activeTab === 'reference' && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4">角色和技能等级参考卡</h3>
              <p className="text-sm text-gray-400 mb-4">角色在游戏开始时向左边玩家展示的是该对象族的标记</p>
              <div className="w-full max-w-2xl">
                <img
                  src="/src/assets/rules/reference-card.jpg"
                  alt="角色和技能等级参考卡"
                  className="w-full h-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const errorMsg = document.createElement('div');
                      errorMsg.className = 'bg-gray-700 p-8 rounded-lg text-center';
                      errorMsg.innerHTML = '<p class="text-gray-400">图片加载失败</p><p class="text-sm text-gray-500 mt-2">请将参考卡图片保存到 src/assets/rules/reference-card.jpg</p>';
                      parent.appendChild(errorMsg);
                    }
                  }}
                />
              </div>
              <div className="mt-6 bg-gray-700 p-4 rounded-lg w-full">
                <h4 className="font-bold mb-2">说明：</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>该角色在游戏开始时向左边玩家展示的是该对象族的标记。</li>
                  <li>* 标记：该角色只能在进行干涉时使用技能。</li>
                  <li>** 标记：该角色只能在被你干涉的玩家受到或治愈1点伤害时使用。</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default RulesModal