import { Player, Faction, CharacterType, AbilityCardType } from '../types/gameTypes'

// 打乱数组的函数
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// 生成6位随机房间ID
export function generateRoomId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 生成8位随机访问代码
export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 10)
}

// 生成玩家数组
export function generatePlayers(count: number): Player[] {
  if (count < 6 || count > 12) {
    throw new Error('玩家数量必须在6到12人之间')
  }

  // 确定是否使用中立角色（调查官）
  const useInquisitor = count % 2 !== 0
  
  // 计算每个阵营的玩家数量
  let phoenixCount = Math.floor(count / 2)
  let gargoyleCount = Math.floor(count / 2)
  
  // 如果有中立角色，则减少一个阵营的人数
  if (useInquisitor) {
    phoenixCount--
  }

  // 创建角色类型数组
  const characterTypes: CharacterType[] = []
  
  // 添加鳳凰氏族角色
  for (let i = 1; i <= phoenixCount; i++) {
    characterTypes.push(i as CharacterType)
  }
  
  // 添加石像鬼氏族角色
  for (let i = 1; i <= gargoyleCount; i++) {
    characterTypes.push(i as CharacterType)
  }
  
  // 如果需要，添加调查官
  if (useInquisitor) {
    characterTypes.push(CharacterType.Inquisitor)
  }
  
  // 打乱角色类型
  const shuffledCharacterTypes = shuffleArray(characterTypes)
  
  // 创建玩家数组
  const players: Player[] = []
  
  for (let i = 0; i < count; i++) {
    const characterType = shuffledCharacterTypes[i]
    let faction: Faction
    
    // 根据角色类型和索引确定阵营
    if (characterType === CharacterType.Inquisitor) {
      faction = Faction.Neutral
    } else if (i < phoenixCount) {
      faction = Faction.Phoenix
    } else {
      faction = Faction.Gargoyle
    }
    
    players.push({
      id: i + 1,
      characterType,
      faction,
      rank: characterType,
      wounds: 0,
      abilityCards: [],
      revealedFaction: false,
      revealedRank: false,
      accessCode: generateAccessCode()
    })
  }
  
  return players
}

// 获取角色能力描述
export function getCharacterAbilityDescription(characterType: CharacterType): string {
  switch (characterType) {
    case CharacterType.Elder: // 长老
      return '可以使用鵝毛筆能力，将数字最大的角色变成氏族族长。'
    case CharacterType.Assassin: // 刺客
      return '让任意一位玩家受两点傷害，然后将匕首交给该玩家。'
    case CharacterType.Jester: // 弄臣
      return '选择两位玩家，私下查看他们的角色陣營身份。弄臣右下角的陣營线索和实际陣營相反。'
    case CharacterType.Alchemist: // 煉金術士
      return '【干涉】一名玩家，并可以选择治癒一点或是傷害一点被干涉的玩家。'
    case CharacterType.Mentalist: // 靈喻師
      return '强制任何一位玩家受到一点傷害，并把匕首交给该玩家。被靈喻師能力傷害的玩家无法发动角色能力。'
    case CharacterType.Guardian: // 衛士
      return '将盾牌卡给予任意玩家，并把长劍卡放在自己桌面上。其他玩家无法攻击或用能力傷害有盾牌卡的玩家。'
    case CharacterType.Berserker: // 狂戰士
      return '强制让刚才攻击他的玩家受一点傷害。'
    case CharacterType.Mage: // 法師
      return '将法杖卡给自己和任意一位玩家。有法杖卡的玩家拿陣營指示物时，只能拿未知陣營指示物。'
    case CharacterType.Geisha: // 舞妓
      return '将折扇卡给任意一位玩家，有折扇卡的玩家，无法让其他玩家进行干涉。'
    case CharacterType.Inquisitor: // 調查官
      return '调查官属于中立角色。调查官不可以攻击已经受傷三点的玩家。调查官受傷时，可以拿任意种类的陣營指示物。'
    default:
      return ''
  }
}

// 获取角色名称
export function getCharacterName(characterType: CharacterType): string {
  switch (characterType) {
    case CharacterType.Elder: return '长老'
    case CharacterType.Assassin: return '刺客'
    case CharacterType.Jester: return '弄臣'
    case CharacterType.Alchemist: return '煉金術士'
    case CharacterType.Mentalist: return '靈喻師'
    case CharacterType.Guardian: return '衛士'
    case CharacterType.Berserker: return '狂戰士'
    case CharacterType.Mage: return '法師'
    case CharacterType.Geisha: return '舞妓'
    case CharacterType.Inquisitor: return '調查官'
    default: return '未知角色'
  }
}

// 获取阵营名称
export function getFactionName(faction: Faction): string {
  switch (faction) {
    case Faction.Phoenix: return '鳳凰氏族'
    case Faction.Gargoyle: return '石像鬼氏族'
    case Faction.Neutral: return '中立'
    default: return '未知阵营'
  }
}

// 获取阵营颜色
export function getFactionColor(faction: Faction): string {
  switch (faction) {
    case Faction.Phoenix: return 'text-red-500'
    case Faction.Gargoyle: return 'text-blue-500'
    case Faction.Neutral: return 'text-yellow-500'
    default: return 'text-gray-500'
  }
}