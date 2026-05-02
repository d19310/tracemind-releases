#!/bin/bash
# TraceMind Vault Installer
# Creates the Obsidian vault directory structure and plugin setup

set -e

VAULT_NAME="${1:-TraceMindVault}"

echo "=========================================="
echo "  TraceMind Obsidian Vault Installer"
echo "=========================================="
echo ""

# Check if vault already exists
if [ -d "$VAULT_NAME" ]; then
  echo "⚠️  目录 '$VAULT_NAME' 已存在"
  echo "   是否继续？(y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
  fi
fi

# Create vault
echo "📁 创建 Vault 目录: $VAULT_NAME"
mkdir -p "$VAULT_NAME"
cd "$VAULT_NAME"

# Create directory structure
echo "📂 创建目录结构..."
mkdir -p Daily
mkdir -p Person
mkdir -p Object
mkdir -p Theme
mkdir -p TraceMind/sessions
mkdir -p TraceMind/index
mkdir -p TraceMind/agents
mkdir -p TraceMind/skills

# Create .obsidian directory for plugin config
mkdir -p .obsidian

# Create welcome diary file
cat > Daily/$(date +%Y-%m-%d).md << 'DIARY_EOF'
# 今天的记录

### 08:00 #日记
欢迎使用 TraceMind！这是你的第一条日记记录。

使用格式：
- 每块以 `### HH:mm #标签` 开头
- 内容写在下方
- 子项用 `- ` 开头
- 块结束标记为 `<!-- TM:blockId -->`

<!-- TM:welcome01 -->
DIARY_EOF

# Create PROFILE template
cat > TraceMind/PROFILE.md << 'PROFILE_EOF'
# 用户画像

> 完善此文件可帮助 AI 更准确地分析你的日记内容。
> 请根据实际情况填写，留空即可。

## 基本信息

- 姓名：
- 年龄：
- 性别：
- 所在城市：
- 语言偏好：中文

## 职业背景

- 行业：
- 职位：
- 工作年限：
- 主要技能：

## 社交关系

- 常用称呼：
- 重要联系人：

## 工作模式

- 工作时间：
- 常用工具：
- 沟通偏好：

## 兴趣爱好

- 爱好：
- 关注领域：

PROFILE_EOF

# Create placeholder README
cat > README.md << 'README_EOF'
# TraceMindVault

基于 Obsidian 的个人知识管理系统，由 TraceMind 插件驱动。

## 目录结构

```
TraceMindVault/
├── Daily/              # 日记文件（按日期）
├── Person/             # 人物实体卡片
├── Object/             # 对象实体卡片（项目、任务、产品等）
├── Theme/              # 主题实体卡片（领域、习惯、状态等）
├── TraceMind/          # TraceMind 内部数据
│   ├── sessions/       # AI 分析会话
│   ├── index/          # 实体索引
│   ├── agents/         # Agent 配置
│   ├── skills/         # 技能定义
│   └── PROFILE.md      # 用户画像
├── .obsidian/          # Obsidian 配置
└── README.md
```

## 快速开始

1. 在 Obsidian 中打开此 Vault
2. 安装 TraceMind 插件（将插件文件放入 `.obsidian/plugins/tracemind/`）
3. 在设置中配置 AI Provider
4. 开始写日记！
README_EOF

# Create .obsidian community-plugins.json to enable the plugin
cat > .obsidian/community-plugins.json << 'PLUGINS_EOF'
["tracemind"]
PLUGINS_EOF

# Copy plugin files if source exists
PLUGIN_SRC=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check for plugin in common locations
for path in \
  "$SCRIPT_DIR/obsidian-plugin" \
  "$SCRIPT_DIR/../obsidian-plugin" \
  "$HOME/.obsidian/plugins/tracemind"; do
  if [ -f "$path/main.js" ]; then
    PLUGIN_SRC="$path"
    break
  fi
done

if [ -n "$PLUGIN_SRC" ]; then
  echo "📦 复制插件文件..."
  mkdir -p .obsidian/plugins/tracemind
  cp "$PLUGIN_SRC/main.js" .obsidian/plugins/tracemind/
  cp "$PLUGIN_SRC/manifest.json" .obsidian/plugins/tracemind/ 2>/dev/null || true
  echo "✅ 插件已安装"
else
  echo "⚠️  未找到插件文件"
  echo "   请将 main.js 和 manifest.json 放入 .obsidian/plugins/tracemind/"
fi

echo ""
echo "=========================================="
echo "  ✅ TraceMind Vault 安装完成！"
echo "=========================================="
echo ""
echo "📂 Vault 位置: $(pwd)"
echo ""
echo "下一步："
echo "  1. 在 Obsidian 中打开此 Vault"
echo "  2. 补充 TraceMind/PROFILE.md 中的用户信息"
echo "  3. 在插件设置中配置 AI Provider"
echo "  4. 开始写日记！"
echo ""
