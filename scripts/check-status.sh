#!/bin/bash

# 血契猎杀服务状态检查脚本

echo "🔍 血契猎杀服务状态检查"
echo "========================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    echo -n "检查 $name (端口 $port)... "
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 运行正常${NC}"
        return 0
    else
        echo -e "${RED}❌ 未运行${NC}"
        return 1
    fi
}

# 检查后端服务器
echo ""
echo "📡 后端服务检查:"
check_service "后端API" "http://localhost:3000/api/health" "3000"

# 检查前端服务
echo ""
echo "🌐 前端服务检查:"
check_service "前端页面" "http://localhost:5173" "5173"

# 检查网络访问
echo ""
echo "🌍 网络访问检查:"
check_service "网络前端" "http://192.168.5.115:5173" "5173"

# 获取服务器详细信息
echo ""
echo "📊 服务器详细信息:"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    HEALTH_INFO=$(curl -s http://localhost:3000/api/health)
    echo "   后端状态: $HEALTH_INFO"
else
    echo "   后端状态: 无法连接"
fi

# 检查端口占用
echo ""
echo "🔌 端口占用检查:"
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "   端口 $port ($service): ${GREEN}✅ 已占用${NC}"
    else
        echo -e "   端口 $port ($service): ${RED}❌ 未占用${NC}"
    fi
}

check_port 3000 "后端API"
check_port 5173 "前端服务"

# 显示访问链接
echo ""
echo "🔗 访问链接:"
echo -e "   本地访问: ${BLUE}http://localhost:5173${NC}"
echo -e "   网络访问: ${BLUE}http://192.168.5.115:5173${NC}"
echo -e "   后端API:  ${BLUE}http://localhost:3000${NC}"

# 显示启动命令
echo ""
echo "🚀 启动命令:"
echo "   一键启动: ./start.sh"
echo "   分别启动:"
echo "     - 后端: npm run server"
echo "     - 前端: npm run dev -- --host"
echo "     - 同时: npm run dev:full"

# 显示测试命令
echo ""
echo "🧪 测试命令:"
echo "   功能测试: ./scripts/test-multi-browser.sh"

echo ""
echo "✅ 检查完成！" 