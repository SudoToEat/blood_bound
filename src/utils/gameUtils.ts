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

  // 确定是否使用中立角色（调查官）- 奇数人数时使用
  const useInquisitor = count % 2 !== 0

  // 创建角色类型数组
  const characterTypes: CharacterType[] = []

  // 可用的角色等级（1-9，不包括调查官）
  const availableRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  // 计算需要的非调查官角色数量
  const regularRolesNeeded = useInquisitor ? count - 1 : count

  if (regularRolesNeeded <= 9) {
    // 6-9人的非调查官角色：使用唯一的角色
    for (let i = 1; i <= regularRolesNeeded; i++) {
      characterTypes.push(i as CharacterType)
    }
  } else {
    // 10-11人的非调查官角色：需要重复使用角色
    // 首先使用所有1-9的角色
    characterTypes.push(...availableRanks)

    // 然后再添加需要重复的角色数量
    const extraNeeded = regularRolesNeeded - 9
    // 随机选择要重复的角色
    const extraRanks = shuffleArray([...availableRanks]).slice(0, extraNeeded)
    characterTypes.push(...extraRanks as CharacterType[])
  }

  // 如果需要，添加调查官（等级10）
  if (useInquisitor) {
    characterTypes.push(CharacterType.Inquisitor)
  }

  // 打乱角色类型数组
  const shuffledCharacterTypes = shuffleArray(characterTypes)

  // 计算每个阵营的玩家数量
  // 非调查官角色的总数
  const regularRolesCount = useInquisitor ? count - 1 : count

  // 平分到两个阵营
  let phoenixCount = Math.floor(regularRolesCount / 2)
  let gargoyleCount = Math.ceil(regularRolesCount / 2) // 使用ceil确保总数正确

  // 创建阵营数组并打乱（不包括中立，调查官会单独处理）
  const factions: Faction[] = []

  // 添加凤凰氏族
  for (let i = 0; i < phoenixCount; i++) {
    factions.push(Faction.Phoenix)
  }

  // 添加石像鬼氏族
  for (let i = 0; i < gargoyleCount; i++) {
    factions.push(Faction.Gargoyle)
  }

  // 打乱阵营数组
  const shuffledFactions = shuffleArray(factions)

  // 创建玩家数组
  const players: Player[] = []
  let factionIndex = 0 // 用于追踪阵营数组的索引

  for (let i = 0; i < count; i++) {
    const characterType = shuffledCharacterTypes[i]
    let faction: Faction

    // 如果角色是调查官，设置为中立阵营
    if (characterType === CharacterType.Inquisitor) {
      faction = Faction.Neutral
    } else {
      // 其他角色从打乱的阵营数组中获取阵营
      faction = shuffledFactions[factionIndex]
      factionIndex++
    }

    const player: Player = {
      id: i + 1,
      characterType,
      faction,
      rank: characterType,
      wounds: 0,
      abilityCards: [],
      revealedFaction: false,
      revealedRank: false,
      accessCode: generateAccessCode()
    }

    // 如果是中立角色（调查官），随机分配一个向下家展示的阵营颜色
    if (characterType === CharacterType.Inquisitor) {
      player.displayedFactionToNext = Math.random() < 0.5 ? 'red' : 'blue'
    }

    players.push(player)
  }
  
  return players
}

// 获取角色能力描述
export function getCharacterAbilityDescription(characterType: CharacterType): string {
  switch (characterType) {
    case CharacterType.Elder: // 长老
      return '可以使用鹅毛笔能力，将数字最大的角色变成氏族族长。'
    case CharacterType.Assassin: // 刺客
      return '让任意一位玩家受两点伤害，然后将匕首交给该玩家。'
    case CharacterType.Jester: // 弄臣
      return '选择两位玩家，私下查看他们的角色阵营身份。弄臣右下角的阵营线索和实际阵营相反。'
    case CharacterType.Alchemist: // 炼金术士
      return '【干涉】一名玩家，并可以选择治愈一点或是伤害一点被干涉的玩家。'
    case CharacterType.Mentalist: // 灵谕师
      return '强制任何一位玩家受到一点伤害，并把匕首交给该玩家。被灵谕师能力伤害的玩家无法发动角色能力。'
    case CharacterType.Guardian: // 卫士
      return '将盾牌卡给予任意玩家，并把长剑卡放在自己桌面上。其他玩家无法攻击或用能力伤害有盾牌卡的玩家。'
    case CharacterType.Berserker: // 狂战士
      return '强制让刚才攻击他的玩家受一点伤害。'
    case CharacterType.Mage: // 法师
      return '将法杖卡给自己和任意一位玩家。有法杖卡的玩家拿阵营指示物时，只能拿未知阵营指示物。'
    case CharacterType.Geisha: // 舞妓
      return '将折扇卡给任意一位玩家，有折扇卡的玩家，无法让其他玩家进行干涉。'
    case CharacterType.Inquisitor: // 调查官
      return '调查官属于中立角色。调查官不可以攻击已经受伤三点的玩家。调查官受伤时，可以拿任意种类的阵营指示物。如果调查官被杀掉，则调查官单独获得胜利。调查官可以使用诅咒卡，如果将真诅咒卡给最终获胜的氏族族长，调查官单独获得胜利。'
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
    case CharacterType.Alchemist: return '炼金术士'
    case CharacterType.Mentalist: return '灵谕师'
    case CharacterType.Guardian: return '卫士'
    case CharacterType.Berserker: return '狂战士'
    case CharacterType.Mage: return '法师'
    case CharacterType.Geisha: return '舞妓'
    case CharacterType.Inquisitor: return '调查官'
    default: return '未知角色'
  }
}

// 获取阵营名称
export function getFactionName(faction: Faction): string {
  switch (faction) {
    case Faction.Phoenix: return '凤凰氏族'
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

// 获取上一个玩家（考虑循环）
export function getPreviousPlayer(players: Player[], currentPlayerId: number): Player | null {
  if (!players || players.length === 0) {
    return null
  }

  const currentIndex = players.findIndex(p => p.id === currentPlayerId)
  if (currentIndex === -1) {
    return null
  }

  // 如果当前玩家是第一个（索引0），则上一个是最后一个玩家
  const previousIndex = currentIndex === 0 ? players.length - 1 : currentIndex - 1
  return players[previousIndex]
}

// 获取上一个玩家展示给当前玩家的阵营
// 如果上一个玩家是弄臣（Jester），则展示相反的阵营
// 如果上一个玩家是调查官（Inquisitor），则展示随机分配的颜色
export function getPreviousPlayerDisplayedFaction(players: Player[], currentPlayerId: number): { player: Player; displayedFaction: Faction } | null {
  const previousPlayer = getPreviousPlayer(players, currentPlayerId)
  if (!previousPlayer) {
    return null
  }

  let displayedFaction = previousPlayer.faction

  // 如果上一个玩家是调查官（中立），展示随机分配的颜色
  if (previousPlayer.characterType === CharacterType.Inquisitor) {
    if (previousPlayer.displayedFactionToNext === 'red') {
      displayedFaction = Faction.Phoenix
    } else if (previousPlayer.displayedFactionToNext === 'blue') {
      displayedFaction = Faction.Gargoyle
    }
  }
  // 如果上一个玩家是弄臣，展示相反的阵营
  else if (previousPlayer.characterType === CharacterType.Jester) {
    if (previousPlayer.faction === Faction.Phoenix) {
      displayedFaction = Faction.Gargoyle
    } else if (previousPlayer.faction === Faction.Gargoyle) {
      displayedFaction = Faction.Phoenix
    }
    // 中立阵营不改变
  }

  return {
    player: previousPlayer,
    displayedFaction
  }
}