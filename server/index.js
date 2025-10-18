import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// 开发模式下允许所有来源（支持多设备访问）
const isDevelopment = process.env.NODE_ENV !== 'production';
const corsOptions = isDevelopment
  ? {
      origin: true, // 开发模式：允许所有来源
      credentials: true
    }
  : {
      origin: ["http://localhost:5173", "http://192.168.5.115:5173"], // 生产模式：指定来源
      methods: ["GET", "POST"],
      credentials: true
    };

const io = new Server(server, {
  cors: corsOptions
});

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 内存存储房间数据
const rooms = new Map();
const playerSessions = new Map();

// 生成房间号
function generateRoomId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 生成访问代码
function generateAccessCode() {
  return Math.random().toString(36).substring(2, 10);
}

// 打乱数组
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 生成玩家身份数组
function generatePlayers(count) {
  if (count < 6 || count > 12) {
    throw new Error('玩家数量必须在6到12人之间');
  }

  // 确定是否使用中立角色（调查官）
  const useInquisitor = count % 2 !== 0;

  // 计算每个阵营的玩家数量
  let phoenixCount = Math.floor(count / 2);
  let gargoyleCount = Math.floor(count / 2);

  // 如果有中立角色，则减少一个阵营的人数
  if (useInquisitor) {
    phoenixCount--;
  }

  // 角色池：1-9 的数字，每个阵营都可以使用
  const characterPool = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // 为每个阵营随机选择角色（可以有重复数字，但阵营不同）
  const shuffledPhoenixPool = shuffleArray([...characterPool]);
  const shuffledGargoylePool = shuffleArray([...characterPool]);

  // 创建每个阵营的角色数组（包含阵营信息）
  const phoenixCharacters = [];
  const gargoyleCharacters = [];

  // 添加鳳凰氏族角色
  for (let i = 0; i < phoenixCount; i++) {
    const characterType = shuffledPhoenixPool[i];
    phoenixCharacters.push({
      characterType,
      faction: 'phoenix',
      rank: characterType
    });
  }

  // 添加石像鬼氏族角色
  for (let i = 0; i < gargoyleCount; i++) {
    const characterType = shuffledGargoylePool[i];
    gargoyleCharacters.push({
      characterType,
      faction: 'gargoyle',
      rank: characterType
    });
  }

  // 合并所有角色
  const allCharacters = [...phoenixCharacters, ...gargoyleCharacters];

  // 如果需要，添加调查官 (10)
  if (useInquisitor) {
    allCharacters.push({
      characterType: 10,
      faction: 'neutral',
      rank: 10
    });
  }

  // 打乱角色顺序
  const shuffledCharacters = shuffleArray(allCharacters);

  // 创建玩家数组
  const players = [];

  for (let i = 0; i < count; i++) {
    const character = shuffledCharacters[i];

    players.push({
      id: i + 1,
      characterType: character.characterType,
      faction: character.faction,
      rank: character.rank,
      wounds: 0,
      abilityCards: [],
      revealedFaction: false,
      revealedRank: false,
      accessCode: generateAccessCode(),
      reveals: [] // 初始化展示数组
    });
  }

  return players;
}

// 房间管理API
app.post('/api/rooms', (req, res) => {
  console.log('收到创建房间请求:', req.body);
  const { playerCount } = req.body;
  const roomId = generateRoomId();

  // 生成所有玩家的身份信息
  const playerIdentities = generatePlayers(parseInt(playerCount) || 10);

  const room = {
    id: roomId,
    playerCount: parseInt(playerCount) || 10,
    players: [], // 已加入的玩家列表
    playerIdentities, // 预先生成的所有玩家身份
    gameState: {
      phase: 'waiting', // waiting, playing, ended
      players: playerIdentities // 完整的玩家数据
    },
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  rooms.set(roomId, room);
  console.log(`房间 ${roomId} 创建成功，玩家数量: ${room.playerCount}`);
  console.log(`已生成 ${playerIdentities.length} 个玩家身份`);

  // 清理过期房间（30分钟无活动）
  setTimeout(() => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (Date.now() - room.lastActivity > 30 * 60 * 1000) {
        rooms.delete(roomId);
        console.log(`房间 ${roomId} 已过期删除`);
      }
    }
  }, 30 * 60 * 1000);

  res.json({ roomId, success: true });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  res.json({
    roomId: room.id,
    playerCount: room.playerCount,
    players: room.players.map(p => p.id),
    gameState: room.gameState
  });
});

// 开始游戏 - 返回完整的游戏状态供主持人使用
app.post('/api/rooms/:roomId/start', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  // 更新游戏阶段为playing
  room.gameState.phase = 'playing';
  room.lastActivity = Date.now();

  console.log(`房间 ${roomId} 游戏开始，返回完整游戏状态`);
  console.log(`游戏状态包含 ${room.playerIdentities.length} 个玩家身份`);

  // 返回完整的游戏状态
  res.json({
    success: true,
    roomId: room.id,
    playerCount: room.playerCount,
    players: room.players.map(p => p.id),
    gameState: {
      phase: 'playing',
      players: room.playerIdentities // 返回所有玩家的完整身份数据
    }
  });
});

// 重新开始游戏 - 重新分配所有玩家身份
app.post('/api/rooms/:roomId/restart', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  // 重新生成所有玩家身份
  const newPlayerIdentities = generatePlayers(room.playerCount);
  room.playerIdentities = newPlayerIdentities;
  room.gameState = {
    phase: 'playing',
    players: newPlayerIdentities
  };
  room.lastActivity = Date.now();

  console.log(`房间 ${roomId} 重新开始游戏，重新分配 ${newPlayerIdentities.length} 个玩家身份`);

  // 广播更新后的游戏状态给所有客户端
  io.to(roomId).emit('gameStateUpdated', {
    phase: 'playing',
    players: newPlayerIdentities
  });

  // 返回完整的游戏状态
  res.json({
    success: true,
    roomId: room.id,
    playerCount: room.playerCount,
    players: room.players.map(p => p.id),
    gameState: {
      phase: 'playing',
      players: newPlayerIdentities
    }
  });
});

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);
  
  // 加入房间
  socket.on('joinRoom', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    socket.join(roomId);
    playerSessions.set(socket.id, { roomId, playerId });

    // 如果房间里没有该玩家，添加到已加入列表
    if (!room.players.find(p => p.id === playerId)) {
      room.players.push({ id: playerId, socketId: socket.id });
    } else {
      // 如果已存在但没有socketId，补充
      const p = room.players.find(p => p.id === playerId);
      if (p && !p.socketId) p.socketId = socket.id;
    }

    // 获取该玩家的完整身份信息
    const playerIdentity = room.playerIdentities.find(p => p.id === playerId);

    // 构建房间状态，包含该玩家的完整身份
    const roomStateData = {
      roomId: room.id,
      playerCount: room.playerCount,
      players: room.players.map(p => p.id),
      gameState: {
        phase: 'playing', // 玩家加入即可查看身份，所以设为playing
        players: room.playerIdentities // 发送所有玩家的完整身份数据
      }
    };

    console.log(`=== 发送给玩家 ${playerId} 的房间状态 ===`);
    console.log('roomStateData:', JSON.stringify(roomStateData, null, 2));

    // 发送房间状态（包含所有玩家身份）
    socket.emit('roomState', roomStateData);

    // 通知其他玩家有新玩家加入
    socket.to(roomId).emit('playerJoined', {
      playerId,
      players: room.players.map(p => p.id)
    });

    console.log(`玩家 ${playerId} 加入房间 ${roomId}`);
    console.log(`玩家身份:`, playerIdentity);
    console.log(`当前已加入玩家: ${room.players.map(p => p.id).join(', ')}`);
  });
  
  // 更新游戏状态
  socket.on('updateGameState', ({ roomId, gameState }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    // 同时更新 room.gameState 和 room.playerIdentities
    // 这样可以确保主机设置的 revealedFaction 和 revealedRank 被保留
    room.gameState = gameState;
    if (gameState.players) {
      room.playerIdentities = gameState.players;
    }
    room.lastActivity = Date.now();

    // 广播给房间内所有客户端
    socket.to(roomId).emit('gameStateUpdated', gameState);

    console.log(`房间 ${roomId} 游戏状态已更新`);
  });
  
  // 玩家操作
  socket.on('playerAction', ({ roomId, playerId, action, data }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    // 处理展示线索动作
    if (action === 'addReveal') {
      const playerIdentity = room.playerIdentities.find(p => p.id === playerId);
      if (playerIdentity) {
        if (!playerIdentity.reveals) {
          playerIdentity.reveals = [];
        }
        // 添加新的展示（最多3个）
        if (playerIdentity.reveals.length < 3) {
          playerIdentity.reveals.push(data.revealType); // 'red', 'blue', 或 'unknown'
          room.lastActivity = Date.now();

          console.log(`玩家 ${playerId} 展示线索: ${data.revealType}, 当前展示: ${playerIdentity.reveals.join(', ')}`);

          // 更新 room.gameState.players 以保持同步
          if (room.gameState && room.gameState.players) {
            const gameStatePlayer = room.gameState.players.find(p => p.id === playerId);
            if (gameStatePlayer) {
              gameStatePlayer.reveals = [...playerIdentity.reveals];
            }
          }

          // 广播更新后的游戏状态给所有客户端（包括主持人）
          // 使用完整的 playerIdentities 以保留所有属性（包括 revealedFaction 和 revealedRank）
          io.to(roomId).emit('gameStateUpdated', {
            phase: room.gameState.phase,
            players: room.playerIdentities
          });
        }
      }
    }

    // 广播玩家操作给房间内其他客户端
    socket.to(roomId).emit('playerAction', { playerId, action, data });

    console.log(`房间 ${roomId} 玩家 ${playerId} 执行操作: ${action}`);
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    const session = playerSessions.get(socket.id);
    if (session) {
      const { roomId, playerId } = session;
      const room = rooms.get(roomId);
      
      if (room) {
        // 用socketId精确移除
        const idx = room.players.findIndex(p => p.socketId === socket.id);
        if (idx > -1) {
          room.players.splice(idx, 1);
          room.lastActivity = Date.now();
          
          // 通知其他玩家
          socket.to(roomId).emit('playerLeft', { playerId, players: room.players.map(p => p.id) });
          
          console.log(`玩家 ${playerId} 离开房间 ${roomId}`);
        }
      }
      
      playerSessions.delete(socket.id);
    }
    
    console.log('客户端断开连接:', socket.id);
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    connections: io.engine.clientsCount,
    mode: isDevelopment ? 'development' : 'production'
  });
});

// 开发模式下不提供静态文件
if (!isDevelopment) {
  // 生产模式下提供静态文件
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // 前端路由处理
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  // 开发模式下只提供API服务
  app.get('/', (req, res) => {
    res.json({
      message: '血契猎杀后端API服务',
      mode: 'development',
      frontend: '请访问 http://localhost:5173',
      api: {
        health: '/api/health',
        rooms: '/api/rooms',
        roomInfo: '/api/rooms/:roomId',
        joinRoom: '/api/rooms/:roomId/join'
      }
    });
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`本地访问: http://localhost:${PORT}`);
  console.log(`网络访问: http://192.168.5.115:${PORT}`);
  console.log(`模式: ${isDevelopment ? '开发模式' : '生产模式'}`);
  if (isDevelopment) {
    console.log(`前端开发服务器: http://localhost:5173`);
  }
});

// 定期清理过期房间
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (now - room.lastActivity > 30 * 60 * 1000) { // 30分钟
      rooms.delete(roomId);
      console.log(`清理过期房间: ${roomId}`);
    }
  }
}, 5 * 60 * 1000); // 每5分钟检查一次