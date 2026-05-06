#!/usr/bin/env bash
#
# TraceMind Plugin Installer (macOS only)
# Downloads release artifacts and installs into an existing Obsidian vault.
# Does NOT create TraceMind business directories, Daily notes, or PROFILE.md.
# Those are created by the plugin's first-start wizard on first load.
#

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PLUGIN_ID="tracemind"
PLUGIN_NAME="TraceMind"
GITHUB_REPO="d19310/tracemind-releases"

# Read version from local manifest.json, fall back to default
if [[ -f "manifest.json" ]]; then
  VERSION="v$(node -e "console.log(JSON.parse(require('fs').readFileSync('manifest.json','utf8')).version)" 2>/dev/null || echo "1.4.2")"
else
  # Try to fetch the latest release tag
  VERSION="v1.4.2"
fi

VAULT_PATH=""
PLUGIN_DIR=""
OPEN_AFTER_INSTALL=true

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${BLUE}==>${NC} $1"; }

# --- macOS system checks ---

check_macos() {
  if [[ "$OSTYPE" != "darwin"* ]]; then
    log_error "此安装脚本仅支持 macOS。"
    log_error "Windows 用户请参考手动安装文档: docs/install-windows.md"
    exit 1
  fi
  log_info "macOS 已确认"
}

check_tools() {
  if ! command -v curl >/dev/null 2>&1; then
    log_error "未找到 curl，无法下载安装文件"
    exit 1
  fi
  log_info "必要工具已就绪 (curl)"
}

check_obsidian() {
  if [[ -d "/Applications/Obsidian.app" ]]; then
    log_info "Obsidian 已安装"
    return
  fi

  log_warn "未找到 Obsidian 应用"
  echo ""
  echo "TraceMind 需要 Obsidian。请选择安装方式："
  echo ""
  echo "  1) 使用 Homebrew 安装 (brew install --cask obsidian)"
  echo "  2) 手动从 https://obsidian.md/download 下载安装"
  echo "  3) 跳过 (安装脚本退出)"

  if command -v brew >/dev/null 2>&1; then
    echo ""
    read -r -p "是否使用 brew 安装 Obsidian? (1/2/3): " choice
    case "$choice" in
      1)
        log_step "使用 brew 安装 Obsidian..."
        brew install --cask obsidian
        log_info "Obsidian 安装完成。请先打开 Obsidian 创建或选择一个 Vault，再重新运行本脚本。"
        exit 0
        ;;
      2)
        log_info "请手动下载安装 Obsidian 后重新运行本脚本"
        exit 0
        ;;
      *)
        log_info "安装取消"
        exit 0
        ;;
    esac
  else
    log_warn "未找到 Homebrew。请手动安装:"
    log_warn "  1. 安装 Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    log_warn "  2. 安装 Obsidian: brew install --cask obsidian"
    log_warn "  或直接从 https://obsidian.md/download 下载 Obsidian"
    exit 1
  fi
}

# --- Vault config ---

prompt_vault() {
  echo ""
  echo "请输入已存在的 Obsidian Vault 路径："
  echo "(请先在 Obsidian 中创建或打开一个 Vault)"
  echo ""

  read -r -p "Vault 路径: " input_path
  if [[ -z "$input_path" ]]; then
    log_error "未输入 Vault 路径，安装取消"
    exit 1
  fi

  # Expand tilde
  input_path="${input_path/#\~/$HOME}"

  if [[ ! -d "$input_path" ]]; then
    log_error "目录不存在: $input_path"
    log_error "请先在 Obsidian 中创建或选择已有 Vault，再重新运行本脚本。"
    exit 1
  fi

  if [[ ! -d "${input_path}/.obsidian" ]]; then
    log_warn "该目录下未找到 .obsidian 目录，可能不是有效的 Obsidian Vault"
    read -r -p "是否继续? (y/n): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      log_info "安装取消"
      exit 0
    fi
    mkdir -p "${input_path}/.obsidian"
  fi

  VAULT_PATH="$(cd "$input_path" && pwd)"
  log_info "Vault 路径: $VAULT_PATH"
}

# --- Download & install ---

download_asset() {
  local asset="$1"
  local target="$2"
  local url="https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/${asset}"
  curl -fsSL "$url" -o "$target"
}

install_plugin() {
  log_step "安装 TraceMind 插件"

  PLUGIN_DIR="${VAULT_PATH}/.obsidian/plugins/${PLUGIN_ID}"
  mkdir -p "$PLUGIN_DIR"

  log_info "版本: $VERSION"
  log_info "下载 main.js ..."
  if ! download_asset "main.js" "${PLUGIN_DIR}/main.js"; then
    log_error "main.js 下载失败"
    exit 1
  fi

  log_info "下载 manifest.json ..."
  if ! download_asset "manifest.json" "${PLUGIN_DIR}/manifest.json"; then
    log_error "manifest.json 下载失败"
    exit 1
  fi

  log_info "插件文件已安装到 $PLUGIN_DIR"
}

enable_plugin() {
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
  log_info "TraceMind ${VERSION} 安装完成"
  echo "========================================"
  echo ""
  echo "Vault: $VAULT_PATH"
  echo "插件: $PLUGIN_DIR"
  echo ""
  echo "下一步:"
  echo "1. 打开 Obsidian vault"
  echo "2. 如未自动启用：设置 → 社区插件 → TraceMind → 启用"
  echo "3. 首次启用后按弹窗提示完成初始设置"
  echo ""
}

# --- Main ---

main() {
  echo ""
  echo "========================================"
  echo "       TraceMind 安装向导 (macOS)"
  echo "========================================"

  check_macos
  check_tools
  check_obsidian
  prompt_vault
  install_plugin
  enable_plugin
  show_completion

  if [[ "$OPEN_AFTER_INSTALL" == true ]]; then
    open "$VAULT_PATH" -a Obsidian >/dev/null 2>&1 || true
  fi
}

main "$@"
