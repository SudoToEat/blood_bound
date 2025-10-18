#!/bin/bash

# 血契猎杀玩家访问测试脚本
# 使用方法: ./scripts/test-player-access.sh [房间号] [玩家ID]

echo "🎮 血契猎杀玩家访问测试脚本"
echo "================================"

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 错误: 请提供房间号和玩家ID"
    echo "使用方法: $0 [房间号] [玩家ID]"
    echo "示例: $0 167057 1"
    exit 1
fi

ROOM_ID=$1
PLAYER_ID=$2

if [ -z "$ROOM_ID" ] || [ -z "$PLAYER_ID" ]; then
    echo "❌ 错误: 房间号和玩家ID不能为空"
    exit 1
fi

echo "📋 测试参数:"
echo "  房间号: $ROOM_ID"
echo "  玩家ID: $PLAYER_ID"
echo ""

# 检查开发服务器是否运行
echo "🔍 检查开发服务器状态..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 开发服务器正在运行"
else
    echo "❌ 开发服务器未运行，请先启动: npm run dev"
    exit 1
fi

# 生成测试链接
BASE_URL="http://localhost:5173"
ACCESS_URL="$BASE_URL/access/$ROOM_ID/$PLAYER_ID"
DEBUG_URL="$BASE_URL/debug/$ROOM_ID/$PLAYER_ID"

echo "🔗 测试链接:"
echo "  访问链接: $ACCESS_URL"
echo "  调试链接: $DEBUG_URL"
echo ""

# 提供测试选项
echo "📝 测试选项:"
echo "1. 在浏览器中打开访问链接"
echo "2. 在浏览器中打开调试链接"
echo "3. 同时打开两个链接"
echo "4. 复制链接到剪贴板"
echo "5. 退出"
echo ""

read -p "请选择操作 (1-5): " choice

case $choice in
    1)
        echo "🌐 打开访问链接..."
        open "$ACCESS_URL" 2>/dev/null || xdg-open "$ACCESS_URL" 2>/dev/null || echo "无法自动打开浏览器，请手动访问: $ACCESS_URL"
        ;;
    2)
        echo "🔧 打开调试链接..."
        open "$DEBUG_URL" 2>/dev/null || xdg-open "$DEBUG_URL" 2>/dev/null || echo "无法自动打开浏览器，请手动访问: $DEBUG_URL"
        ;;
    3)
        echo "🌐 同时打开两个链接..."
        open "$ACCESS_URL" 2>/dev/null || xdg-open "$ACCESS_URL" 2>/dev/null
        sleep 1
        open "$DEBUG_URL" 2>/dev/null || xdg-open "$DEBUG_URL" 2>/dev/null
        ;;
    4)
        echo "📋 复制链接到剪贴板..."
        if command -v pbcopy > /dev/null; then
            echo "$ACCESS_URL" | pbcopy
            echo "✅ 访问链接已复制到剪贴板"
        elif command -v xclip > /dev/null; then
            echo "$ACCESS_URL" | xclip -selection clipboard
            echo "✅ 访问链接已复制到剪贴板"
        else
            echo "❌ 无法复制到剪贴板，请手动复制:"
            echo "$ACCESS_URL"
        fi
        ;;
    5)
        echo "👋 退出测试"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "💡 调试提示:"
echo "• 如果出现'找不到玩家'错误，请确保游戏主持人已经创建了房间"
echo "• 使用调试链接可以查看详细的错误信息"
echo "• 检查浏览器控制台是否有错误信息"
echo "• 确保房间号和玩家ID正确"
echo ""
echo "✨ 测试完成" 