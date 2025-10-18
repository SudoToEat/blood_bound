#!/bin/bash

# 血契猎杀生产环境构建脚本

echo "🏗️  血契猎杀 - 生产环境构建"
echo "============================"

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

# 清理旧的构建文件
echo "🧹 清理旧的构建文件..."
rm -rf dist

# 构建前端
echo "🔨 构建前端应用..."
npm run build

# 检查构建是否成功
if [ ! -f "dist/index.html" ]; then
    echo "❌ 前端构建失败，未找到 dist/index.html"
    exit 1
fi

echo "✅ 前端构建成功"

# 创建生产环境启动脚本
echo "📝 创建生产环境启动脚本..."
cat > start-production.sh << 'EOF'
#!/bin/bash

# 血契猎杀生产环境启动脚本

echo "🚀 血契猎杀 - 生产环境启动"
echo "=========================="

# 检查构建文件
if [ ! -f "dist/index.html" ]; then
    echo "❌ 未找到构建文件，请先运行: ./scripts/build-production.sh"
    exit 1
fi

# 启动生产服务器
echo "📡 启动生产服务器..."
NODE_ENV=production npm run server

EOF

chmod +x start-production.sh

echo ""
echo "🎉 构建完成！"
echo ""
echo "📁 构建文件位置: dist/"
echo "🚀 启动生产环境: ./start-production.sh"
echo ""
echo "📊 构建信息:"
echo "   前端文件: $(find dist -name "*.js" | wc -l) 个JS文件"
echo "   前端文件: $(find dist -name "*.css" | wc -l) 个CSS文件"
echo "   总大小: $(du -sh dist | cut -f1)"
echo ""
echo "🌐 生产环境访问:"
echo "   本地: http://localhost:3000"
echo "   网络: http://192.168.5.115:3000" 