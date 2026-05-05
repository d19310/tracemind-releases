#!/usr/bin/env bash
#
# TraceMind v1.2.2 installer
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
VERSION="v1.2.2"
GITHUB_REPO="d19310/tracemind-releases"
VAULT_NAME="TraceMind"
VAULT_PARENT_DIR="$HOME/Documents"
VAULT_PATH=""
OPEN_AFTER_INSTALL=true

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}==>${NC} $1"; }

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

check_system() {
	log_step "检查环境"

	if ! command -v curl >/dev/null 2>&1; then
		log_error "未找到 curl，无法下载安装文件"
		exit 1
	fi

	if [[ "$OSTYPE" == "darwin"* ]] && [[ ! -d "/Applications/Obsidian.app" ]]; then
		log_warn "未在 /Applications 找到 Obsidian。安装仍会继续，你可以之后手动打开 vault。"
	fi

	log_info "环境检查完成"
}

prompt_vault_config() {
	echo ""
	echo "请配置 Vault 路径："
	echo ""

	read -r -p "Vault 名称 (默认: ${VAULT_NAME}): " input_name
	if [[ -n "$input_name" ]]; then
		VAULT_NAME="$input_name"
	fi

	read -r -p "安装目录 (默认: ${VAULT_PARENT_DIR}): " input_parent
	if [[ -n "$input_parent" ]]; then
		input_parent="${input_parent/#\~/$HOME}"
		VAULT_PARENT_DIR="$input_parent"
	fi

	VAULT_PATH="$(expand_path "${VAULT_PARENT_DIR}/${VAULT_NAME}")"
	echo ""
}

confirm_install() {
	echo ""
	echo "========================================"
	echo "       TraceMind v1.2.2 安装确认"
	echo "========================================"
	echo ""
	echo "Vault: ${VAULT_PATH}"
	echo "插件目录: ${PLUGIN_DIR}"
	echo ""
	read -r -p "确认开始安装? (y/n) " reply
	if [[ ! "$reply" =~ ^[Yy]$ ]]; then
		log_info "安装取消"
		exit 0
	fi
}

create_vault_structure() {
	log_step "准备 Vault 目录结构"

	mkdir -p "$VAULT_PATH"
	mkdir -p "$PLUGIN_DIR"
	mkdir -p "${VAULT_PATH}/.obsidian"

	# TraceMind Context Card entity folders
	mkdir -p "${VAULT_PATH}/Daily"
	mkdir -p "${VAULT_PATH}/Person"
	mkdir -p "${VAULT_PATH}/Object"
	mkdir -p "${VAULT_PATH}/Theme"

	# TraceMind sessions & index
	mkdir -p "${VAULT_PATH}/TraceMind/sessions"
	mkdir -p "${VAULT_PATH}/TraceMind/index"

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
	fi

	log_info "Vault 目录结构已准备"
}

download_asset() {
	local asset="$1"
	local target="$2"
	local url="https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/${asset}"
	curl -fsSL "$url" -o "$target"
}

install_plugin_from_release() {
	log_step "从 GitHub Release 安装插件"

	if ! download_asset "main.js" "${PLUGIN_DIR}/main.js"; then
		log_error "main.js 下载失败"; exit 1
	fi
	if ! download_asset "manifest.json" "${PLUGIN_DIR}/manifest.json"; then
		log_error "manifest.json 下载失败"; exit 1
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
		log_warn "检测到已有社区插件配置。为避免破坏配置，请在 Obsidian 中手动启用 TraceMind。"
	fi
}

show_completion() {
	echo ""
	echo "========================================"
	log_info "TraceMind v1.2.2 安装完成"
	echo "========================================"
	echo ""
	echo "Vault: ${VAULT_PATH}"
	echo "插件: ${PLUGIN_DIR}"
	echo ""
	echo "下一步:"
	echo "1. 打开 Obsidian vault"
	echo "2. 如未自动启用：设置 → 社区插件 → TraceMind → 启用"
	echo "3. 打开 TraceMind 设置，配置 AI Provider"
	echo ""
}

main() {
	echo ""
	echo "========================================"
	echo "       TraceMind v1.2.2 安装向导"
	echo "========================================"

	check_system
	prompt_vault_config

	PLUGIN_DIR="${VAULT_PATH}/.obsidian/plugins/${PLUGIN_ID}"

	confirm_install
	create_vault_structure
	install_plugin_from_release

	enable_plugin_if_safe
	show_completion

	if [[ "$OPEN_AFTER_INSTALL" == true && "$OSTYPE" == "darwin"* ]]; then
		open "$VAULT_PATH" -a Obsidian >/dev/null 2>&1 || true
	fi
}

main "$@"
