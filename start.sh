#!/bin/bash

# 血契猎杀一键启动脚本

echo "🎮 血契猎杀 - 多浏览器版本启动器"
echo "=================================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未找到npm，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查端口占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  端口 $1 已被占用"
        return 1
    else
        echo "✅ 端口 $1 可用"
        return 0
    fi
}

echo ""
echo "🔍 检查端口状态..."
check_port 3000
check_port 5173

echo ""
echo "🚀 启动服务..."

# 启动后端服务器（开发模式）
echo "📡 启动后端服务器 (端口3000)..."
NODE_ENV=development npm run server &
SERVER_PID=$!

# 等待服务器启动
sleep 3

# 检查服务器是否启动成功
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 后端服务器启动成功"
else
    echo "❌ 后端服务器启动失败"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 启动前端服务器
echo "🌐 启动前端服务器 (端口5173)..."
npm run dev -- --host &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

# 获取本地IP地址
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "未检测到")

# 获取公网IP地址
echo "🌍 正在获取公网IP地址..."
PUBLIC_IP=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || curl -s --max-time 5 https://ifconfig.me 2>/dev/null || echo "未检测到")

echo ""
echo "🎉 启动完成！"
echo ""
echo "📱 访问地址:"
echo "   本地访问: http://localhost:5173"
if [ "$LOCAL_IP" != "未检测到" ]; then
    echo "   局域网访问: http://$LOCAL_IP:5173"
fi
if [ "$PUBLIC_IP" != "未检测到" ]; then
    echo "   公网IP: $PUBLIC_IP (需要端口转发: 5173和3000)"
fi
echo "   后端API:  http://localhost:3000"
echo ""
echo "🧪 运行测试:"
echo "   ./scripts/test-multi-browser.sh"
echo ""
echo "🔍 检查状态:"
echo "   ./scripts/check-status.sh"
echo ""
echo "🛑 停止服务: Ctrl+C"

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; echo "✅ 服务已停止"; exit 0' INT

# 保持脚本运行
wait 