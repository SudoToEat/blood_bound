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