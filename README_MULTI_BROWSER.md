# 血契猎杀 - 多浏览器访问版本

## 概述

这个版本支持多个浏览器/设备同时访问游戏，通过WebSocket实时同步游戏状态。

## 功能特性

- ✅ 多浏览器/设备同时访问
- ✅ 实时游戏状态同步
- ✅ 房间管理和玩家加入
- ✅ 自动清理过期房间
- ✅ 连接状态监控

## 快速开始

### 1. 启动服务器

```bash
# 安装依赖
npm install

# 启动后端服务器（端口3000）
npm run server

# 启动前端开发服务器（端口5173）
npm run dev -- --host
```

### 2. 访问地址

- **本地访问**: http://localhost:5173
- **网络访问**: http://192.168.5.115:5173
- **后端API**: http://localhost:3000

### 3. 创建房间

1. 访问主页
2. 点击"创建房间"
3. 选择玩家数量（6-12人）
4. 点击"创建房间"按钮
5. 系统会生成房间号和二维码

### 4. 玩家加入

玩家可以通过以下方式加入：

1. **扫描二维码**: 使用手机扫描主持人提供的二维码
2. **直接访问链接**: 访问 `/access/[房间号]/[玩家ID]`
   - 例如: `http://192.168.5.115:5173/access/123456/1`

## 使用流程

### 主持人端

1. **创建房间**
   - 选择玩家数量
   - 系统生成房间号
   - 显示二维码和访问链接

2. **管理游戏**
   - 监控玩家加入状态
   - 开始游戏
   - 管理游戏进程

### 玩家端

1. **加入房间**
   - 扫描二维码或访问链接
   - 自动连接到房间
   - 查看连接状态

2. **参与游戏**
   - 查看个人身份
   - 实时接收游戏更新
   - 执行游戏操作

## 技术架构

### 后端服务 (Node.js + Express + Socket.IO)

- **端口**: 3000
- **功能**:
  - 房间管理API
  - WebSocket实时通信
  - 玩家会话管理
  - 自动清理机制

### 前端应用 (React + TypeScript + Vite)

- **端口**: 5173
- **功能**:
  - 房间创建界面
  - 玩家访问界面
  - 实时状态同步
  - 响应式设计

## API接口

### 房间管理

```bash
# 创建房间
POST /api/rooms
Body: { "playerCount": 10 }

# 获取房间信息
GET /api/rooms/:roomId

# 加入房间
POST /api/rooms/:roomId/join
Body: { "playerId": 1 }

# 健康检查
GET /api/health
```

### WebSocket事件

```javascript
// 客户端发送
socket.emit('joinRoom', { roomId, playerId })
socket.emit('updateGameState', { roomId, gameState })
socket.emit('playerAction', { roomId, playerId, action, data })

// 客户端接收
socket.on('roomState', (data) => {})
socket.on('gameStateUpdated', (gameState) => {})
socket.on('playerJoined', (data) => {})
socket.on('playerLeft', (data) => {})
socket.on('playerAction', (data) => {})
```

## 网络要求

### 局域网访问

1. **确保所有设备在同一网络**
2. **防火墙设置**: 开放端口3000和5173
3. **IP地址**: 使用服务器的局域网IP地址

### 外网访问（可选）

如需外网访问，需要：
1. 配置端口转发
2. 使用公网IP或域名
3. 配置HTTPS（推荐）

## 故障排除

### 常见问题

1. **无法连接服务器**
   - 检查服务器是否启动
   - 确认端口3000未被占用
   - 检查防火墙设置

2. **玩家无法加入房间**
   - 确认房间号正确
   - 检查网络连接
   - 查看服务器日志

3. **实时同步不工作**
   - 检查WebSocket连接
   - 确认浏览器支持WebSocket
   - 查看控制台错误

### 调试工具

1. **服务器状态**: 访问 `http://localhost:3000/api/health`
2. **浏览器控制台**: 查看WebSocket连接状态
3. **网络面板**: 检查API请求和WebSocket消息

## 开发说明

### 项目结构

```
bloodbond/
├── server/           # 后端服务
│   └── index.js     # 服务器入口
├── src/             # 前端源码
│   ├── components/  # React组件
│   ├── context/     # 状态管理
│   ├── utils/       # 工具函数
│   └── types/       # TypeScript类型
└── package.json     # 项目配置
```

### 开发命令

```bash
# 同时启动前后端
npm run dev:full

# 仅启动后端
npm run server

# 仅启动前端
npm run dev

# 构建生产版本
npm run build
```

## 部署说明

### 生产环境

1. **构建前端**
   ```bash
   npm run build
   ```

2. **配置服务器**
   - 复制 `dist/` 到服务器
   - 启动后端服务
   - 配置反向代理（推荐Nginx）

3. **环境变量**
   ```bash
   PORT=3000          # 服务器端口
   NODE_ENV=production
   ```

### Docker部署（可选）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "server"]
```

## 更新日志

### v2.0.0 - 多浏览器支持
- ✅ 添加WebSocket实时同步
- ✅ 实现房间管理API
- ✅ 支持多设备同时访问
- ✅ 添加连接状态监控
- ✅ 优化用户体验

### v1.0.0 - 基础版本
- ✅ 本地存储版本
- ✅ 单浏览器访问
- ✅ 基础游戏功能

## 许可证

MIT License 