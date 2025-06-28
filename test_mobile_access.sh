#!/bin/bash

# 获取本地IP地址
IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

# 如果找不到IP，使用localhost
if [ -z "$IP" ]; then
  IP="localhost"
fi

# 显示访问信息
echo "======================================="
echo "鲜血盟约 - 多设备访问测试"
echo "======================================="
echo ""
echo "本地服务器将在 http://$IP:5173 启动"
echo ""
echo "测试链接：http://$IP:5173/?test=true"
echo ""
echo "其他设备可以通过上面的链接访问测试页面"
echo "按 Ctrl+C 停止服务器"
echo "======================================="

# 启动开发服务器，指定host为本地IP，允许局域网访问
npm run dev -- --host $IP