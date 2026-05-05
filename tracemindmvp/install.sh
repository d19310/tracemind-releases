#!/usr/bin/env bash
#
# TraceMind v1.0 installer
# Creates or updates an Obsidian vault and installs the TraceMind plugin.
#

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PLUGIN_ID="tracemind"
PLUGIN_NAME="TraceMind"
VERSION="v1.0.0"
GITHUB_REPO=""  # 待定
DEFAULT_VAULT_NAME="TraceMindVault"
VAULT_PARENT_DIR="$HOME/Documents"
VAULT_NAME="$DEFAULT_VAULT_NAME"
VAULT_PATH=""
USE_LOCAL=false
OPEN_AFTER_INSTALL=true
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}==>${NC} $1"; }

usage() {
	cat <<EOF
TraceMind v1.0 安装脚本

用法:
  ./install.sh [选项]

选项:
  -n, --name <名称>       Vault 名称，默认: ${DEFAULT_VAULT_NAME}
  -p, --parent <路径>     Vault 父目录，默认: ${VAULT_PARENT_DIR}
  -v, --vault <路径>      直接指定 Vault 完整路径
  -l, --local             使用当前目录本地构建产物安装
  --no-open               安装完成后不自动打开 Obsidian
  -h, --help              显示帮助

示例:
  ./install.sh
  ./install.sh -n "MyVault"
  ./install.sh -v "\$HOME/Obsidian/TraceMindVault"
  ./install.sh -l -v "\$HOME/test-tracemind-vault"

说明:
  默认从 GitHub Release 下载 main.js、manifest.json、styles.css。
  插件安装目录为 .obsidian/plugins/${PLUGIN_ID}。
EOF
}

expand_path() {
	local input="$1"
	input="${input/#\~/$HOME}"
	if [[ "$input" != /* ]]; then
		input="$(pwd)/$input"
	fi
	local dir
	dir="$(dirname "$input")"
	mkdir -p "$dir"
	echo "$(cd "$dir" && pwd)/$(basename "$input")"
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		-n|--name)
			VAULT_NAME="$2"
			shift 2
			;;
		-p|--parent)
			VAULT_PARENT_DIR="${2/#\~/$HOME}"
			shift 2
			;;
		-v|--vault)
			VAULT_PATH="$(expand_path "$2")"
			shift 2
			;;
		-l|--local)
			USE_LOCAL=true
			shift
			;;
		--no-open)
			OPEN_AFTER_INSTALL=false
			shift
			;;
		-h|--help)
			usage
			exit 0
			;;
		*)
			log_error "未知参数: $1"
			usage
			exit 1
			;;
	esac
done

if [[ -z "$VAULT_PATH" ]]; then
	VAULT_PATH="$(expand_path "${VAULT_PARENT_DIR}/${VAULT_NAME}")"
fi

PLUGIN_DIR="${VAULT_PATH}/.obsidian/plugins/${PLUGIN_ID}"

check_system() {
	log_step "检查环境"

	if ! command -v curl >/dev/null 2>&1; then
		log_error "未找到 curl，无法下载安装文件"
		exit 1
	fi

	if [[ "$OSTYPE" == "darwin"* ]] && [[ ! -d "/Applications/Obsidian.app" ]]; then
		log_warn "未找到 Obsidian。你可以之后手动打开 vault。"
	fi

	log_info "环境检查完成"
}

confirm_install() {
	echo ""
	echo "========================================"
	echo "       TraceMind v1.0 安装确认"
	echo "========================================"
	echo ""
	echo "Vault: ${VAULT_PATH}"
	echo "插件目录: ${PLUGIN_DIR}"
	echo "安装来源: $([[ "$USE_LOCAL" == true ]] && echo "本地构建产物" || echo "GitHub Release")"
	echo ""
	if [[ -t 0 ]]; then
		read -r -p "确认开始安装? (y/n) " reply
		if [[ ! "$reply" =~ ^[Yy]$ ]]; then
			log_info "安装取消"
			exit 0
		fi
	fi
}

create_vault_structure() {
	log_step "准备 Vault 目录结构"

	mkdir -p "$VAULT_PATH"
	mkdir -p "$PLUGIN_DIR"
	mkdir -p "${VAULT_PATH}/.obsidian"

	mkdir -p "${VAULT_PATH}/Daily"
	mkdir -p "${VAULT_PATH}/Person"
	mkdir -p "${VAULT_PATH}/Object"
	mkdir -p "${VAULT_PATH}/Theme"
	mkdir -p "${VAULT_PATH}/TraceMind/sessions"
	mkdir -p "${VAULT_PATH}/TraceMind/index"
	mkdir -p "${VAULT_PATH}/TraceMind/agents"
	mkdir -p "${VAULT_PATH}/TraceMind/skills"

	local today
	today="$(date +%Y-%m-%d)"
	if [[ ! -f "${VAULT_PATH}/Daily/${today}.md" ]]; then
		cat > "${VAULT_PATH}/Daily/${today}.md" <<EOF
---
date: ${today}
tags:
  - tracemind/daily
---

# ${today}

## 日记

EOF
		log_info "创建今日日记: Daily/${today}.md"
	fi

	# PROFILE.md 模板
	if [[ ! -f "${VAULT_PATH}/TraceMind/PROFILE.md" ]]; then
		cat > "${VAULT_PATH}/TraceMind/PROFILE.md" <<'EOF'
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

EOF
		log_info "创建 PROFILE.md 模板"
	fi

	log_info "Vault 目录结构已准备"
}

copy_local_defaults() {
	if [[ -d "${SCRIPT_DIR}/.lifewiki" ]]; then
		cp -R "${SCRIPT_DIR}/.lifewiki/." "${VAULT_PATH}/TraceMind/"
		log_info "已复制默认 Agent/Skill 配置"
	fi
}

install_plugin_local() {
	log_step "安装本地插件文件"

	# 从脚本所在目录的 obsidian-plugin/ 查找构建产物
	local build_dir=""
	for path in \
		"${SCRIPT_DIR}/obsidian-plugin" \
		"${SCRIPT_DIR}"; do
		if [[ -f "${path}/main.js" && -f "${path}/manifest.json" ]]; then
			build_dir="$path"
			break
		fi
	done

	[[ -n "$build_dir" ]] || { log_error "未找到构建产物，请先运行 npm run build"; exit 1; }

	cp "${build_dir}/main.js" "${PLUGIN_DIR}/main.js"
	cp "${build_dir}/manifest.json" "${PLUGIN_DIR}/manifest.json"

	if [[ -f "${build_dir}/styles.css" ]]; then
		cp "${build_dir}/styles.css" "${PLUGIN_DIR}/styles.css"
	elif [[ -f "${build_dir}/main.css" ]]; then
		cp "${build_dir}/main.css" "${PLUGIN_DIR}/styles.css"
	fi

	copy_local_defaults

	log_info "本地插件文件安装完成"
}

download_asset() {
	local asset="$1"
	local target="$2"
	local url="https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/${asset}"
	curl -fsSL "$url" -o "$target"
}

install_plugin_from_release() {
	if [[ -z "$GITHUB_REPO" ]]; then
		log_warn "GitHub Release 地址未配置，回退到本地安装"
		install_plugin_local
		return
	fi

	log_step "从 GitHub Release 安装插件"

	download_asset "main.js" "${PLUGIN_DIR}/main.js" || { log_error "main.js 下载失败"; exit 1; }
	download_asset "manifest.json" "${PLUGIN_DIR}/manifest.json" || { log_error "manifest.json 下载失败"; exit 1; }

	if ! download_asset "styles.css" "${PLUGIN_DIR}/styles.css"; then
		log_warn "styles.css 下载失败，继续安装无样式版本"
	fi
}

enable_plugin_if_safe() {
	local plugins_file="${VAULT_PATH}/.obsidian/community-plugins.json"

	if [[ ! -f "$plugins_file" ]]; then
		printf '[\n  "%s"\n]\n' "$PLUGIN_ID" > "$plugins_file"
		log_info "已在新 vault 中预启用 TraceMind"
		return
	fi

	if grep -q "\"${PLUGIN_ID}\"" "$plugins_file"; then
		log_info "TraceMind 已在社区插件列表中"
	else
		log_warn "检测到已有社区插件配置。请在 Obsidian 中手动启用 TraceMind。"
	fi
}

show_completion() {
	echo ""
	echo "========================================"
	log_info "TraceMind v1.0 安装完成"
	echo "========================================"
	echo ""
	echo "Vault: ${VAULT_PATH}"
	echo "插件: ${PLUGIN_DIR}"
	echo ""
	echo "目录结构:"
	echo "  Daily/      - 日记文件（按日期）"
	echo "  Person/     - 人物实体卡片"
	echo "  Object/     - 对象实体卡片（项目、任务、产品等）"
	echo "  Theme/      - 主题实体卡片（领域、习惯、状态等）"
	echo "  TraceMind/  - TraceMind 内部数据（sessions、index、agents、skills）"
	echo ""
	echo "下一步:"
	echo "1. 打开 Obsidian vault"
	echo "2. 如未自动启用：设置 → 社区插件 → TraceMind → 启用"
	echo "3. 打开 TraceMind 设置，配置 AI Provider"
	echo "4. 补充 TraceMind/PROFILE.md 中的用户信息"
	echo ""
}

main() {
	echo ""
	echo "========================================"
	echo "       TraceMind v1.0 安装向导"
	echo "========================================"

	check_system
	confirm_install
	create_vault_structure

	if [[ "$USE_LOCAL" == true ]]; then
		install_plugin_local
	else
		install_plugin_from_release
	fi

	enable_plugin_if_safe
	show_completion

	if [[ "$OPEN_AFTER_INSTALL" == true && "$OSTYPE" == "darwin"* ]]; then
		open "$VAULT_PATH" -a Obsidian >/dev/null 2>&1 || true
	fi
}

main "$@"
