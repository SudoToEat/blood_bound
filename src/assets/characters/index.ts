import { CharacterType } from '../../types/gameTypes'

import defaultCharacterImage from './default.svg'
import elderImage from './character_1.jpg'
import assassinImage from './character_2.jpg'
import jesterImage from './character_3.jpg'
import alchemistImage from './character_4.jpg'
import mentalistImage from './character_5.jpg'
import guardianImage from './character_6.jpg'
import berserkerImage from './character_7.jpg'
import mageImage from './character_8.jpg'
import geishaImage from './character_9.jpg'
import inquisitorImage from './character_10.jpg'

const characterImageMap: Record<CharacterType, string> = {
  [CharacterType.Elder]: elderImage,
  [CharacterType.Assassin]: assassinImage,
  [CharacterType.Jester]: jesterImage,
  [CharacterType.Alchemist]: alchemistImage,
  [CharacterType.Mentalist]: mentalistImage,
  [CharacterType.Guardian]: guardianImage,
  [CharacterType.Berserker]: berserkerImage,
  [CharacterType.Mage]: mageImage,
  [CharacterType.Geisha]: geishaImage,
  [CharacterType.Inquisitor]: inquisitorImage
}

export const fallbackCharacterImage = defaultCharacterImage

// 角色图片映射
export const characterImages = characterImageMap

// 获取角色图片URL
export function getCharacterImage(characterType: CharacterType): string {
  return characterImages[characterType] || fallbackCharacterImage
}

// 角色背景图片映射（用于卡片背景）
export const characterBackgrounds = characterImageMap

// 获取角色背景图片URL
export function getCharacterBackground(characterType: CharacterType): string {
  return characterBackgrounds[characterType] || fallbackCharacterImage
}

// 角色游戏卡片图片映射（完整的游戏卡片）
// 使用本地存储的角色卡片图片
export const characterCardImages = characterImageMap

// 获取角色游戏卡片图片URL
export function getCharacterCardImage(characterType: CharacterType): string {
  return characterCardImages[characterType] || fallbackCharacterImage
}
