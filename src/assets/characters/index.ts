import { CharacterType } from '../../types/gameTypes'

// 角色图片映射
export const characterImages: Record<CharacterType, string> = {
  [CharacterType.Elder]: '/src/assets/characters/elder.png',
  [CharacterType.Assassin]: '/src/assets/characters/assassin.png',
  [CharacterType.Jester]: '/src/assets/characters/jester.png',
  [CharacterType.Alchemist]: '/src/assets/characters/alchemist.png',
  [CharacterType.Mentalist]: '/src/assets/characters/mentalist.png',
  [CharacterType.Guardian]: '/src/assets/characters/guardian.png',
  [CharacterType.Berserker]: '/src/assets/characters/berserker.png',
  [CharacterType.Mage]: '/src/assets/characters/mage.png',
  [CharacterType.Geisha]: '/src/assets/characters/geisha.png',
  [CharacterType.Inquisitor]: '/src/assets/characters/inquisitor.png'
}

// 获取角色图片URL
export function getCharacterImage(characterType: CharacterType): string {
  return characterImages[characterType] || '/src/assets/characters/default.svg'
}

// 角色背景图片映射（用于卡片背景）
export const characterBackgrounds: Record<CharacterType, string> = {
  [CharacterType.Elder]: '/src/assets/characters/elder-bg.png',
  [CharacterType.Assassin]: '/src/assets/characters/assassin-bg.png',
  [CharacterType.Jester]: '/src/assets/characters/jester-bg.png',
  [CharacterType.Alchemist]: '/src/assets/characters/alchemist-bg.png',
  [CharacterType.Mentalist]: '/src/assets/characters/mentalist-bg.png',
  [CharacterType.Guardian]: '/src/assets/characters/guardian-bg.png',
  [CharacterType.Berserker]: '/src/assets/characters/berserker-bg.png',
  [CharacterType.Mage]: '/src/assets/characters/mage-bg.png',
  [CharacterType.Geisha]: '/src/assets/characters/geisha-bg.png',
  [CharacterType.Inquisitor]: '/src/assets/characters/inquisitor-bg.png'
}

// 获取角色背景图片URL
export function getCharacterBackground(characterType: CharacterType): string {
  return characterBackgrounds[characterType] || '/src/assets/characters/default-bg.png'
}

// 角色游戏卡片图片映射（完整的游戏卡片）
// 使用本地存储的角色卡片图片
export const characterCardImages: Record<CharacterType, string> = {
  [CharacterType.Elder]: '/src/assets/characters/character_1.jpg',      // 长老
  [CharacterType.Assassin]: '/src/assets/characters/character_2.jpg',   // 刺客
  [CharacterType.Jester]: '/src/assets/characters/character_3.jpg',     // 弄臣
  [CharacterType.Alchemist]: '/src/assets/characters/character_4.jpg',  // 炼金术士
  [CharacterType.Mentalist]: '/src/assets/characters/character_5.jpg',  // 灵喻师
  [CharacterType.Guardian]: '/src/assets/characters/character_6.jpg',   // 卫士
  [CharacterType.Berserker]: '/src/assets/characters/character_7.jpg',  // 狂战士
  [CharacterType.Mage]: '/src/assets/characters/character_8.jpg',       // 法师
  [CharacterType.Geisha]: '/src/assets/characters/character_9.jpg',     // 舞妓
  [CharacterType.Inquisitor]: '/src/assets/characters/character_10.jpg' // 调查官
}

// 获取角色游戏卡片图片URL
export function getCharacterCardImage(characterType: CharacterType): string {
  return characterCardImages[characterType] || '/src/assets/characters/default.svg'
} 