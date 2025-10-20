#!/bin/bash

# 鲜血盟约 - 生产环境启动脚本

echo "========================================="
echo "  鲜血盟约 (Blood Bound) - 生产环境"
echo "========================================="
echo ""

# 检查 dist 目录是否存在
if [ ! -d "dist" ]; then
  echo "❌ 错误：未找到 dist 目录"
  echo "请先运行构建命令："
  echo "  npm run build:production"
  exit 1
fi

# 设置生产环境变量
export NODE_ENV=production

echo "✓ 环境设置：生产模式"
echo "✓ 前端文件：dist/ 目录"
echo "✓ 后端端口：3000"
echo ""

# 获取本机IP地址
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
  # Linux
  LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
fi

echo "========================================="
echo "  访问地址"
echo "========================================="
echo "本地访问:   http://localhost:3000"
echo "网络访问:   http://${LOCAL_IP}:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================================="
echo ""

# 启动服务器（生产模式下服务器会提供静态文件）
node server/index.js
