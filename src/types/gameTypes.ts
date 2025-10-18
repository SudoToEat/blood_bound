// 阵营类型：鳳凰氏族(Phoenix)、石像鬼氏族(Gargoyle)、中立(Neutral)
export enum Faction {
  Phoenix = 'phoenix',
  Gargoyle = 'gargoyle',
  Neutral = 'neutral'
}

// 角色类型
export enum CharacterType {
  Elder = 1,       // 长老
  Assassin = 2,    // 刺客
  Jester = 3,      // 弄臣
  Alchemist = 4,   // 煉金術士
  Mentalist = 5,   // 靈喻師
  Guardian = 6,    // 衛士
  Berserker = 7,   // 狂戰士
  Mage = 8,        // 法師
  Geisha = 9,      // 舞妓
  Inquisitor = 10  // 調查官（中立角色）
}

// 能力卡类型
export enum AbilityCardType {
  Sword = 'sword',     // 長劍
  Fan = 'fan',         // 折扇
  Staff = 'staff',     // 法杖
  Shield = 'shield',   // 盾牌
  Curse = 'curse',     // 詛咒
  Quill = 'quill'      // 鵝毛筆
}

// 玩家状态
export interface Player {
  id: number
  characterType: CharacterType
  faction: Faction
  rank: number
  wounds: number
  abilityCards: AbilityCardType[]
  revealedFaction: boolean
  revealedRank: boolean
  accessCode?: string // 玩家访问代码，用于手机访问
  reveals?: ('red' | 'blue' | 'unknown')[] // 玩家展示的线索：红色(凤凰)、蓝色(石像鬼)、问号(未知)
}

// 角色能力描述
export interface CharacterAbility {
  characterType: CharacterType
  name: string
  description: string
}

// 游戏房间
export interface GameRoom {
  id: string
  hostId: string
  players: Player[]
  createdAt: number
  status: 'waiting' | 'playing' | 'finished'
}

// 能力卡描述
export interface AbilityCardDescription {
  type: AbilityCardType
  name: string
  description: string
}