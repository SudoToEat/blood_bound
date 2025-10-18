# 血契猎杀 (Blood Bond)

一个基于网页的"血契猎杀"游戏，支持多浏览器/设备同时访问。

## 🎮 游戏简介

"血契猎杀"是一款社交推理游戏，玩家分为不同阵营，通过策略和推理来获得胜利。

## ✨ 功能特性

### 多浏览器版本 (v2.0)
- ✅ **多设备同时访问** - 支持不同浏览器/设备同时参与游戏
- ✅ **实时同步** - WebSocket实时同步游戏状态
- ✅ **房间管理** - 自动房间创建和玩家管理
- ✅ **连接监控** - 实时显示连接状态和玩家在线情况
- ✅ **自动清理** - 自动清理过期房间和断线玩家

### 基础功能
- ✅ **角色系统** - 10个独特角色，每个角色都有专属图片
- ✅ **阵营分配** - 红蓝阵营对抗，中立角色平衡
- ✅ **角色图鉴** - 完整的角色介绍和技能说明
- ✅ **响应式设计** - 支持手机和桌面设备
- ✅ **二维码访问** - 玩家可通过扫描二维码快速加入

## 🚀 快速开始

### 开发环境

```bash
# 1. 安装依赖
npm install

# 2. 一键启动 (推荐)
./start.sh

# 或者分别启动
npm run server        # 后端服务 (端口3000)
npm run dev -- --host # 前端服务 (端口5173)
```

### 生产环境

```bash
# 1. 构建生产版本
./scripts/build-production.sh

# 2. 启动生产服务器
./start-production.sh
```

### 访问地址

- **开发环境**:
  - 前端: http://localhost:5173
  - 后端API: http://localhost:3000
- **生产环境**:
  - 统一访问: http://localhost:3000
  - 网络访问: http://192.168.5.115:3000

### 使用流程

1. **主持人创建房间**
   - 访问主页
   - 选择玩家数量 (6-12人)
   - 点击"创建房间"
   - 获得房间号和二维码

2. **玩家加入游戏**
   - 扫描二维码或访问链接
   - 自动连接到房间
   - 查看个人身份和游戏状态

3. **开始游戏**
   - 主持人监控玩家加入情况
   - 所有玩家就绪后开始游戏
   - 实时同步游戏进程

## 📱 单浏览器版本 (v1.0)

如果你只需要单浏览器版本（本地存储），可以使用：

```bash
# 仅启动前端
npm run dev
```

访问 http://localhost:5173 即可使用。

## 🧪 测试

### 多浏览器功能测试

```bash
# 运行自动化测试
./scripts/test-multi-browser.sh

# 检查服务状态
./scripts/check-status.sh
```

### 手动测试

1. 启动服务器后，运行测试脚本
2. 在不同浏览器中访问生成的链接
3. 验证玩家能够正常加入和同步

## 📁 项目结构

```
bloodbond/
├── server/                 # 后端服务
│   └── index.js           # Express + Socket.IO 服务器
├── src/
│   ├── components/        # React 组件
│   │   ├── CharacterCard.tsx      # 角色卡片
│   │   ├── CharacterGallery.tsx   # 角色图鉴
│   │   ├── CharacterSelector.tsx  # 角色选择器
│   │   ├── GameBoard.tsx          # 游戏面板
│   │   ├── PlayerAccess.tsx       # 玩家访问
│   │   ├── RoomSetup.tsx          # 房间设置
│   │   └── QRCodeDisplay.tsx      # 二维码显示
│   ├── context/           # 状态管理
│   │   └── GameContext.tsx        # 游戏上下文
│   ├── utils/             # 工具函数
│   │   ├── apiService.ts          # API 服务
│   │   ├── socketService.ts       # WebSocket 服务
│   │   └── gameUtils.ts           # 游戏工具
│   ├── types/             # TypeScript 类型
│   │   └── gameTypes.ts           # 游戏类型定义
│   └── assets/            # 静态资源
│       └── characters/            # 角色图片
├── scripts/               # 脚本文件
│   ├── test-multi-browser.sh     # 多浏览器测试
│   ├── check-status.sh           # 状态检查
│   ├── build-production.sh       # 生产构建
│   └── add-character-images.sh   # 角色图片添加
├── dist/                  # 生产构建文件 (构建后生成)
└── docs/                  # 文档
    ├── README_MOBILE.md           # 移动端说明
    └── README_MULTI_BROWSER.md    # 多浏览器说明
```

## 🎯 角色系统

### 阵营分配
- **红方阵营**: 角色 1, 3, 5, 7, 9
- **蓝方阵营**: 角色 2, 4, 6, 8
- **中立角色**: 角色 10

### 角色列表
1. **血族长老** - 红方领袖
2. **猎魔人** - 蓝方领袖  
3. **血族战士** - 红方战斗单位
4. **圣骑士** - 蓝方战斗单位
5. **血族法师** - 红方法术单位
6. **牧师** - 蓝方治疗单位
7. **血族刺客** - 红方隐秘单位
8. **游侠** - 蓝方侦查单位
9. **血族守卫** - 红方防御单位
10. **神秘商人** - 中立角色

## 🔧 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Socket.IO Client** - 实时通信
- **React Router** - 路由管理

### 后端
- **Node.js** - 运行环境
- **Express** - Web 框架
- **Socket.IO** - WebSocket 服务
- **CORS** - 跨域支持

## 🌐 网络要求

### 局域网访问
- 所有设备在同一网络
- 开放端口 3000 和 5173 (开发) / 3000 (生产)
- 使用服务器局域网 IP

### 外网访问 (可选)
- 配置端口转发
- 使用公网 IP 或域名
- 配置 HTTPS (推荐)

## 🐛 故障排除

### 常见问题

1. **无法连接服务器**
   ```bash
   # 检查服务器状态
   ./scripts/check-status.sh
   ```

2. **玩家无法加入房间**
   - 确认房间号正确
   - 检查网络连接
   - 查看浏览器控制台

3. **实时同步不工作**
   - 检查 WebSocket 连接
   - 确认浏览器支持 WebSocket
   - 查看网络面板

### 调试工具

- **服务器状态**: http://localhost:3000/api/health
- **浏览器控制台**: 查看连接状态
- **网络面板**: 检查 API 和 WebSocket

## 📚 文档

- [快速使用指南](QUICK_START.md) - 简单上手
- [多浏览器版本说明](README_MULTI_BROWSER.md) - 详细的多浏览器功能说明
- [移动端使用指南](README_MOBILE.md) - 手机端使用说明
- [角色图片说明](CHARACTER_IMAGES_SUMMARY.md) - 角色图片系统说明
- [玩家访问问题排查](PLAYER_ACCESS_TROUBLESHOOTING.md) - 常见问题解决方案

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License