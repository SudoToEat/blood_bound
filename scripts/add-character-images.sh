#!/bin/bash

# 血契猎杀角色图片添加脚本
# 使用方法: ./scripts/add-character-images.sh

echo "🎮 血契猎杀角色图片添加脚本"
echo "================================"

# 检查目标目录是否存在
CHARACTERS_DIR="src/assets/characters"
if [ ! -d "$CHARACTERS_DIR" ]; then
    echo "❌ 错误: 角色目录不存在: $CHARACTERS_DIR"
    exit 1
fi

echo "📁 目标目录: $CHARACTERS_DIR"
echo ""

# 角色列表
declare -a characters=(
    "elder:长老"
    "assassin:刺客"
    "jester:弄臣"
    "alchemist:煉金術士"
    "mentalist:靈喻師"
    "guardian:衛士"
    "berserker:狂戰士"
    "mage:法師"
    "geisha:舞妓"
    "inquisitor:調查官"
)

echo "📋 需要添加的角色图片:"
echo ""

for char in "${characters[@]}"; do
    IFS=':' read -r filename name <<< "$char"
    echo "  • $name ($filename.png)"
done

echo ""
echo "📋 需要添加的背景图片:"
echo ""

for char in "${characters[@]}"; do
    IFS=':' read -r filename name <<< "$char"
    echo "  • $name ($filename-bg.png)"
done

echo ""
echo "📝 添加说明:"
echo "1. 将角色图片文件重命名为对应的英文名称"
echo "2. 将图片文件复制到 $CHARACTERS_DIR 目录"
echo "3. 支持的格式: PNG, JPG, SVG"
echo "4. 建议尺寸: 200x200 像素或更大"
echo ""
echo "🔗 相关链接:"
echo "• 官方介绍: https://andyventure.com/boardgame-blood-bound/"
echo "• 详细说明: $CHARACTERS_DIR/README.md"
echo ""

# 检查现有图片
echo "🔍 检查现有图片文件:"
echo ""

existing_count=0
total_count=0

for char in "${characters[@]}"; do
    IFS=':' read -r filename name <<< "$char"
    
    # 检查角色图片
    if [ -f "$CHARACTERS_DIR/$filename.png" ]; then
        echo "  ✅ $name.png - 已存在"
        ((existing_count++))
    elif [ -f "$CHARACTERS_DIR/$filename.jpg" ]; then
        echo "  ✅ $name.jpg - 已存在"
        ((existing_count++))
    elif [ -f "$CHARACTERS_DIR/$filename.svg" ]; then
        echo "  ✅ $name.svg - 已存在"
        ((existing_count++))
    else
        echo "  ❌ $name.png - 缺失"
    fi
    ((total_count++))
    
    # 检查背景图片
    if [ -f "$CHARACTERS_DIR/$filename-bg.png" ]; then
        echo "  ✅ $name-bg.png - 已存在"
        ((existing_count++))
    elif [ -f "$CHARACTERS_DIR/$filename-bg.jpg" ]; then
        echo "  ✅ $name-bg.jpg - 已存在"
        ((existing_count++))
    else
        echo "  ❌ $name-bg.png - 缺失"
    fi
    ((total_count++))
done

echo ""
echo "📊 统计信息:"
echo "  已存在: $existing_count 个文件"
echo "  总计: $total_count 个文件"
echo "  缺失: $((total_count - existing_count)) 个文件"

if [ $existing_count -eq $total_count ]; then
    echo ""
    echo "🎉 所有图片文件都已存在！"
    echo "💡 提示: 访问 http://localhost:5173/?demo=true 查看角色演示"
else
    echo ""
    echo "⚠️  请添加缺失的图片文件"
    echo "💡 提示: 添加完成后访问 http://localhost:5173/?demo=true 查看效果"
fi

echo ""
echo "✨ 脚本执行完成" 