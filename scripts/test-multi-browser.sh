#!/bin/bash

# 血契猎杀多浏览器测试脚本

echo "🧪 血契猎杀多浏览器功能测试"
echo "================================"

# 检查服务器状态
echo "1. 检查服务器状态..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 后端服务器运行正常"
else
    echo "❌ 后端服务器未运行，请先启动: npm run server"
    exit 1
fi

# 检查前端服务
echo "2. 检查前端服务..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 前端服务运行正常"
else
    echo "❌ 前端服务未运行，请先启动: npm run dev -- --host"
    exit 1
fi

# 测试创建房间
echo "3. 测试创建房间..."
ROOM_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"playerCount": 10}')

if echo "$ROOM_RESPONSE" | grep -q "roomId"; then
    ROOM_ID=$(echo "$ROOM_RESPONSE" | grep -o '"roomId":"[^"]*"' | cut -d'"' -f4)
    echo "✅ 房间创建成功，房间号: $ROOM_ID"
else
    echo "❌ 房间创建失败: $ROOM_RESPONSE"
    exit 1
fi

# 测试获取房间信息
echo "4. 测试获取房间信息..."
ROOM_INFO=$(curl -s http://localhost:3000/api/rooms/$ROOM_ID)
if echo "$ROOM_INFO" | grep -q "playerCount"; then
    echo "✅ 房间信息获取成功"
    echo "   房间号: $ROOM_ID"
    echo "   玩家数: $(echo "$ROOM_INFO" | grep -o '"playerCount":[0-9]*' | cut -d':' -f2)"
else
    echo "❌ 房间信息获取失败: $ROOM_INFO"
fi

# 测试玩家加入
echo "5. 测试玩家加入..."
JOIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/join \
  -H "Content-Type: application/json" \
  -d '{"playerId": 1}')

if echo "$JOIN_RESPONSE" | grep -q "success"; then
    echo "✅ 玩家1加入成功"
else
    echo "❌ 玩家1加入失败: $JOIN_RESPONSE"
fi

# 测试第二个玩家加入
JOIN_RESPONSE2=$(curl -s -X POST http://localhost:3000/api/rooms/$ROOM_ID/join \
  -H "Content-Type: application/json" \
  -d '{"playerId": 2}')

if echo "$JOIN_RESPONSE2" | grep -q "success"; then
    echo "✅ 玩家2加入成功"
else
    echo "❌ 玩家2加入失败: $JOIN_RESPONSE2"
fi

# 显示访问链接
echo ""
echo "🌐 测试访问链接:"
echo "   主持人页面: http://localhost:5173"
echo "   玩家1访问: http://localhost:5173/access/$ROOM_ID/1"
echo "   玩家2访问: http://localhost:5173/access/$ROOM_ID/2"
echo "   网络访问: http://192.168.5.115:5173/access/$ROOM_ID/1"

# 显示最终状态
echo ""
echo "📊 最终状态:"
FINAL_STATUS=$(curl -s http://localhost:3000/api/health)
echo "   服务器状态: $FINAL_STATUS"

echo ""
echo "🎉 测试完成！"
echo "   现在可以在不同浏览器中访问上述链接进行测试"
echo "   确保所有设备都在同一网络环境下" 