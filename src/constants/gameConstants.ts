/**
 * 游戏常量配置
 * 集中管理所有魔法数字和字符串，便于维护和修改
 */

// ============ 玩家配置 ============
export const PLAYER_CONFIG = {
  MIN_PLAYERS: 6,
  MAX_PLAYERS: 12,
  DEFAULT_PLAYERS: 10,
} as const

// ============ 网络配置 ============
export const NETWORK_CONFIG = {
  // 端口配置
  BACKEND_PORT: 3000,
  FRONTEND_PORT: 5173,

  // 超时配置（毫秒）
  HEALTH_CHECK_INTERVAL: 30000,  // 30秒
  ROOM_EXPIRY_TIME: 30 * 60 * 1000,  // 30分钟
  API_TIMEOUT: 10000,  // 10秒

  // WebSocket配置
  WEBSOCKET_TIMEOUT: 10000,  // 10秒
  MAX_RECONNECT_ATTEMPTS: 10,
  BASE_RECONNECT_INTERVAL: 1000,  // 1秒
  MAX_RECONNECT_DELAY: 30000,  // 30秒

  // 心跳配置
  HEARTBEAT_CHECK_INTERVAL: 10000,  // 10秒
  HEARTBEAT_TIMEOUT: 60000,  // 60秒
} as const

// ============ 游戏机制配置 ============
export const GAME_CONFIG = {
  // 伤害配置
  MAX_WOUNDS: 3,  // 最大伤害数（展示线索）

  // 诅咒卡分配规则
  CURSE_DISTRIBUTIONS: {
    7: { real: 1, fake: 1 },
    9: { real: 1, fake: 2 },
    11: { real: 1, fake: 3 },
  },

  // Toast提示持续时间（毫秒）
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
} as const

// ============ 能力卡类型 ============
export const ABILITY_CARDS = {
  SWORD: 'sword',      // 长剑
  FAN: 'fan',          // 折扇
  STAFF: 'staff',      // 法杖
  SHIELD: 'shield',    // 盾牌
  CURSE: 'curse',      // 诅咒
  QUILL: 'quill',      // 鹅毛笔
  DAGGER: 'dagger',    // 匕首
} as const

// ============ 能力卡名称映射 ============
export const ABILITY_CARD_NAMES: Record<string, string> = {
  [ABILITY_CARDS.SWORD]: '长剑',
  [ABILITY_CARDS.FAN]: '折扇',
  [ABILITY_CARDS.STAFF]: '法杖',
  [ABILITY_CARDS.SHIELD]: '盾牌',
  [ABILITY_CARDS.CURSE]: '诅咒',
  [ABILITY_CARDS.QUILL]: '鹅毛笔',
  [ABILITY_CARDS.DAGGER]: '匕首',
}

// ============ 角色配置 ============
export const CHARACTER_CONFIG = {
  // 角色类型
  TYPES: {
    ELDER: 1,        // 长老
    ASSASSIN: 2,     // 刺客
    JESTER: 3,       // 弄臣
    ALCHEMIST: 4,    // 炼金术士
    MENTALIST: 5,    // 灵谕师
    GUARDIAN: 6,     // 卫士
    BERSERKER: 7,    // 狂战士
    MAGE: 8,         // 法师
    GEISHA: 9,       // 舞妓
    INQUISITOR: 10,  // 调查官
  },

  // 角色名称
  NAMES: {
    1: '长老',
    2: '刺客',
    3: '弄臣',
    4: '炼金术士',
    5: '灵谕师',
    6: '卫士',
    7: '狂战士',
    8: '法师',
    9: '舞妓',
    10: '调查官',
  },

  // 阵营配置
  FACTIONS: {
    PHOENIX: 'phoenix',     // 凤凰氏族
    GARGOYLE: 'gargoyle',   // 石像鬼氏族
    NEUTRAL: 'neutral',     // 中立
  },

  // 阵营名称
  FACTION_NAMES: {
    phoenix: '凤凰氏族',
    gargoyle: '石像鬼氏族',
    neutral: '中立',
  },

  // 阵营颜色
  FACTION_COLORS: {
    phoenix: 'text-red-500',
    gargoyle: 'text-blue-500',
    neutral: 'text-yellow-500',
  },
} as const

// ============ UI 配置 ============
export const UI_CONFIG = {
  // 动画持续时间（毫秒）
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // 加载状态
  LOADING_MESSAGES: {
    DEFAULT: '加载中...',
    CREATING_ROOM: '正在创建房间...',
    JOINING_ROOM: '正在加入房间...',
    LOADING_IDENTITY: '正在加载身份信息...',
    CONNECTING: '正在连接服务器...',
  },

  // Toast 图标
  TOAST_ICONS: {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
  },
} as const

// ============ 本地存储键名 ============
export const STORAGE_KEYS = {
  GAME_STATE: 'bloodbond_game_state',
  ROOM_ID: 'bloodbond_room_id',
  PLAYER_ID: 'bloodbond_player_id',
} as const

// ============ API 端点 ============
export const API_ENDPOINTS = {
  HEALTH: '/health',
  ROOMS: '/rooms',
  JOIN_ROOM: (roomId: string) => `/rooms/${roomId}/join`,
  GET_ROOM: (roomId: string) => `/rooms/${roomId}`,
} as const

// ============ WebSocket 事件 ============
export const SOCKET_EVENTS = {
  // 客户端发送
  JOIN_ROOM: 'joinRoom',
  UPDATE_GAME_STATE: 'updateGameState',
  PLAYER_ACTION: 'playerAction',

  // 客户端接收
  ROOM_STATE: 'roomState',
  GAME_STATE_UPDATED: 'gameStateUpdated',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  PLAYER_ACTION_EVENT: 'playerAction',
  PLAYER_STATUS_CHANGED: 'playerStatusChanged',

  // 连接事件
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_FAILED: 'reconnect_failed',
  ERROR: 'error',
} as const

// ============ 游戏阶段 ============
export const GAME_PHASES = {
  SETUP: 'setup',        // 设置阶段
  ROOM_SETUP: 'room',    // 房间设置
  PLAYING: 'playing',    // 游戏进行中
  FINISHED: 'finished',  // 游戏结束
} as const

// ============ 连接状态 ============
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
} as const

// ============ 玩家操作类型 ============
export const PLAYER_ACTIONS = {
  ADD_REVEAL: 'addReveal',
  DISTRIBUTE_CURSES: 'distributeCurses',
  UPDATE_NAME: 'updateName',
  ADD_ABILITY_CARD: 'addAbilityCard',
  REMOVE_ABILITY_CARD: 'removeAbilityCard',
} as const

// ============ 导出工具函数 ============

/**
 * 获取诅咒卡分配规则
 */
export function getCurseDistribution(playerCount: number): { real: number; fake: number } {
  return GAME_CONFIG.CURSE_DISTRIBUTIONS[playerCount as keyof typeof GAME_CONFIG.CURSE_DISTRIBUTIONS] || { real: 0, fake: 0 }
}

/**
 * 获取能力卡名称
 */
export function getAbilityCardName(cardType: string): string {
  return ABILITY_CARD_NAMES[cardType] || cardType
}

/**
 * 获取角色名称
 */
export function getCharacterNameById(id: number): string {
  return CHARACTER_CONFIG.NAMES[id as keyof typeof CHARACTER_CONFIG.NAMES] || '未知角色'
}

/**
 * 获取阵营名称
 */
export function getFactionNameByKey(faction: string): string {
  return CHARACTER_CONFIG.FACTION_NAMES[faction as keyof typeof CHARACTER_CONFIG.FACTION_NAMES] || '未知阵营'
}

/**
 * 获取阵营颜色
 */
export function getFactionColorByKey(faction: string): string {
  return CHARACTER_CONFIG.FACTION_COLORS[faction as keyof typeof CHARACTER_CONFIG.FACTION_COLORS] || 'text-gray-500'
}

/**
 * 验证玩家数量是否有效
 */
export function isValidPlayerCount(count: number): boolean {
  return count >= PLAYER_CONFIG.MIN_PLAYERS && count <= PLAYER_CONFIG.MAX_PLAYERS
}

/**
 * 生成服务器URL
 */
export function getServerUrl(hostname: string = window.location.hostname): string {
  return `http://${hostname}:${NETWORK_CONFIG.BACKEND_PORT}`
}
