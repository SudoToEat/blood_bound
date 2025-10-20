# 鲜血盟约 - 生产环境部署指南

## 快速开始

### 1. 构建生产版本

```bash
npm run build:production
```

这将会：
- 编译 TypeScript 代码
- 打包前端资源到 `dist/` 目录
- 优化代码大小和性能

### 2. 启动生产服务器

```bash
npm run start:production
# 或直接运行
./start-production.sh
```

服务器将在生产模式下运行：
- **本地访问**: http://localhost:3000
- **网络访问**: http://你的IP:3000 (脚本会自动显示)

### 3. 停止服务器

按 `Ctrl+C` 或使用停止脚本：

```bash
./stop.sh
```

---

## 详细说明

### 开发模式 vs 生产模式

| 特性 | 开发模式 | 生产模式 |
|------|---------|---------|
| 启动命令 | `npm run dev:full` | `npm run start:production` |
| 前端服务器 | Vite 开发服务器 (5173) | Express 静态文件服务 (3000) |
| 后端服务器 | Node.js (3000) | Node.js (3000) |
| 热重载 | ✅ 支持 | ❌ 不支持 |
| 代码优化 | ❌ 未优化 | ✅ 已优化压缩 |
| 适用场景 | 本地开发调试 | 生产部署运行 |

### 生产环境特点

1. **单端口运行** - 只需开放 3000 端口
2. **静态文件服务** - Express 直接提供前端静态文件
3. **优化性能** - 代码已压缩和优化
4. **稳定可靠** - 适合长期运行

### 目录结构

```
bloodbond/
├── dist/                    # 生产构建输出（git已忽略）
│   ├── index.html          # 入口HTML
│   └── assets/             # 静态资源（CSS, JS, 图片）
├── server/
│   └── index.js            # 后端服务器（处理生产和开发模式）
├── start-production.sh     # 生产启动脚本
└── stop.sh                 # 停止脚本
```

---

## 部署步骤

### 本地运行（已完成）

1. 安装依赖：`npm install`
2. 构建：`npm run build:production`
3. 启动：`npm run start:production`

### 服务器部署（示例）

#### 使用 PM2 守护进程

1. 安装 PM2：
```bash
npm install -g pm2
```

2. 构建项目：
```bash
npm run build:production
```

3. 使用 PM2 启动：
```bash
pm2 start server/index.js --name "bloodbond" --env production
```

4. 查看状态：
```bash
pm2 status
pm2 logs bloodbond
```

5. 设置开机自启：
```bash
pm2 startup
pm2 save
```

#### 使用 Docker（可选）

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build:production

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
```

构建和运行：
```bash
docker build -t bloodbond .
docker run -d -p 3000:3000 --name bloodbond bloodbond
```

---

## 网络配置

### 局域网访问

确保防火墙允许 3000 端口：

**macOS:**
```bash
# 系统偏好设置 > 安全性与隐私 > 防火墙选项
# 添加 Node 到允许列表
```

**Linux (Ubuntu):**
```bash
sudo ufw allow 3000
```

### 获取本机IP

**macOS:**
```bash
ipconfig getifaddr en0
```

**Linux:**
```bash
hostname -I
```

---

## 常见问题

### Q: 构建失败怎么办？

A: 尝试清理缓存重新构建：
```bash
rm -rf node_modules dist
npm install
npm run build:production
```

### Q: 无法访问服务器？

A: 检查以下项：
1. 服务器是否正在运行：`lsof -ti:3000`
2. 防火墙是否开放 3000 端口
3. 确认使用正确的IP地址

### Q: 如何查看日志？

A: 生产模式的日志会输出到控制台。使用 PM2 时：
```bash
pm2 logs bloodbond
```

### Q: 如何更新代码？

A:
```bash
git pull
npm install              # 如果有新依赖
npm run build:production # 重新构建
./stop.sh                # 停止旧服务
npm run start:production # 启动新版本
```

---

## 性能优化建议

1. **使用反向代理**（Nginx）
   - 更好的静态文件服务
   - SSL/TLS 支持
   - 负载均衡

2. **CDN 加速**
   - 将静态资源托管到 CDN
   - 减少服务器压力

3. **数据库持久化**
   - 目前使用内存存储
   - 可考虑迁移到 Redis/MongoDB

---

## 安全建议

1. 不要在公网直接暴露 3000 端口
2. 使用 Nginx 作为反向代理
3. 启用 HTTPS (SSL/TLS)
4. 定期更新依赖包：`npm audit fix`
5. 设置合理的 CORS 策略

---

## 支持与反馈

如有问题，请查看：
- 项目文档：`docs/` 目录
- 开发文档：`CLAUDE.md`
- 提交 Issue：https://github.com/SudoToEat/blood_bound/issues

---

**祝游戏愉快！** 🎮
