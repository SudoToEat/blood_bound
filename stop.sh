#!/bin/bash

# 鲜血盟约 - 停止服务脚本
# 用于停止后端服务器(3000)和前端开发服务器(5173)

echo "正在停止服务器..."

# 停止后端服务器 (端口 3000)
BACKEND_PID=$(lsof -ti:3000)
if [ -n "$BACKEND_PID" ]; then
  echo "发现后端服务 (PID: $BACKEND_PID)，正在停止..."
  kill $BACKEND_PID
  echo "✓ 后端服务已停止"
else
  echo "- 未发现运行中的后端服务 (端口 3000)"
fi

# 停止前端开发服务器 (端口 5173)
FRONTEND_PID=$(lsof -ti:5173)
if [ -n "$FRONTEND_PID" ]; then
  echo "发现前端服务 (PID: $FRONTEND_PID)，正在停止..."
  kill $FRONTEND_PID
  echo "✓ 前端服务已停止"
else
  echo "- 未发现运行中的前端服务 (端口 5173)"
fi

# 停止所有 node server/index.js 进程
NODE_PIDS=$(pgrep -f "node server/index.js")
if [ -n "$NODE_PIDS" ]; then
  echo "发现 node server 进程，正在停止..."
  echo "$NODE_PIDS" | xargs kill
  echo "✓ Node server 进程已停止"
fi

echo ""
echo "所有服务已停止完成！"
