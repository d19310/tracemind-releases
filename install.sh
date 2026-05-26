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

DEFAULT_VERSION="v2.1.3"

# Resolve version: env var > local manifest.json > DEFAULT_VERSION
if [[ -n "${TRACEMIND_VERSION:-}" ]]; then
  VERSION="$TRACEMIND_VERSION"
elif [[ -f "manifest.json" ]]; then
  VERSION="v$(node -e "console.log(JSON.parse(require('fs').readFileSync('manifest.json','utf8')).version)" 2>/dev/null || echo "$DEFAULT_VERSION" | sed 's/^v//')"
else
  VERSION="$DEFAULT_VERSION"
fi

VAULT_PATH=""
PLUGIN_DIR=""
DOWNLOAD_DIR=""
CURRENT_VERSION=""
BACKUP_DIR=""
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

read_manifest_version() {
  local manifest_path="$1"
  if [[ ! -f "$manifest_path" ]]; then
    return 1
  fi
  node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')).version)" "$manifest_path" 2>/dev/null
}

detect_installed_plugin() {
  PLUGIN_DIR="${VAULT_PATH}/.obsidian/plugins/${PLUGIN_ID}"
  if [[ -d "$PLUGIN_DIR" ]]; then
    CURRENT_VERSION="$(read_manifest_version "${PLUGIN_DIR}/manifest.json" || true)"
    if [[ -n "$CURRENT_VERSION" ]]; then
      log_info "已安装版本: v${CURRENT_VERSION}"
    else
      log_warn "检测到已有 TraceMind 插件目录，但无法读取版本"
    fi
  fi
}

download_plugin_assets() {
  DOWNLOAD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/tracemind-install.XXXXXX")"
  trap '[[ -n "${DOWNLOAD_DIR:-}" && -d "$DOWNLOAD_DIR" ]] && rm -rf "$DOWNLOAD_DIR"' EXIT

  log_info "版本: $VERSION"
  log_info "下载到临时目录: $DOWNLOAD_DIR"

  log_info "下载 main.js ..."
  if ! download_asset "main.js" "${DOWNLOAD_DIR}/main.js"; then
    log_error "main.js 下载失败"
    exit 1
  fi

  log_info "下载 manifest.json ..."
  if ! download_asset "manifest.json" "${DOWNLOAD_DIR}/manifest.json"; then
    log_error "manifest.json 下载失败"
    exit 1
  fi

  log_info "下载 styles.css ..."
  if ! download_asset "styles.css" "${DOWNLOAD_DIR}/styles.css"; then
    log_warn "styles.css 下载失败，插件仍会继续安装，但界面样式可能不完整"
  fi

  log_info "下载 main.css ..."
  if ! download_asset "main.css" "${DOWNLOAD_DIR}/main.css"; then
    log_warn "main.css 下载失败，已忽略"
  fi
}

validate_downloaded_version() {
  local target_version="${VERSION#v}"
  local downloaded_version
  downloaded_version="$(read_manifest_version "${DOWNLOAD_DIR}/manifest.json" || true)"

  if [[ -z "$downloaded_version" ]]; then
    log_error "下载的 manifest.json 无法读取版本"
    exit 1
  fi

  if [[ "$downloaded_version" != "$target_version" ]]; then
    log_error "下载版本不匹配: 期望 ${target_version}, 实际 ${downloaded_version}"
    exit 1
  fi

  if [[ ! -s "${DOWNLOAD_DIR}/main.js" ]]; then
    log_error "下载的 main.js 为空"
    exit 1
  fi

  log_info "下载校验通过: v${downloaded_version}"
}

backup_existing_plugin() {
  if [[ ! -d "$PLUGIN_DIR" ]]; then
    return
  fi

  BACKUP_DIR="${VAULT_PATH}/.obsidian/plugins/tracemind.backup-$(date +'%Y%m%d-%H%M%S')"
  log_info "备份当前插件到: $BACKUP_DIR"
  cp -R "$PLUGIN_DIR" "$BACKUP_DIR"
}

install_downloaded_plugin() {
  mkdir -p "$PLUGIN_DIR"
  install -m 0644 "${DOWNLOAD_DIR}/main.js" "${PLUGIN_DIR}/main.js"
  install -m 0644 "${DOWNLOAD_DIR}/manifest.json" "${PLUGIN_DIR}/manifest.json"

  if [[ -f "${DOWNLOAD_DIR}/styles.css" ]]; then
    install -m 0644 "${DOWNLOAD_DIR}/styles.css" "${PLUGIN_DIR}/styles.css"
  fi

  if [[ -f "${DOWNLOAD_DIR}/main.css" ]]; then
    install -m 0644 "${DOWNLOAD_DIR}/main.css" "${PLUGIN_DIR}/main.css"
  fi

  log_info "插件文件已安装到 $PLUGIN_DIR"
}

install_plugin() {
  detect_installed_plugin
  if [[ -n "$CURRENT_VERSION" ]]; then
    log_step "升级 TraceMind 插件: v${CURRENT_VERSION} → ${VERSION}"
  elif [[ -d "$PLUGIN_DIR" ]]; then
    log_step "覆盖安装 TraceMind 插件: ${VERSION}"
  else
    log_step "安装 TraceMind 插件: ${VERSION}"
  fi

  download_plugin_assets
  validate_downloaded_version
  backup_existing_plugin
  install_downloaded_plugin
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
  if [[ -n "$BACKUP_DIR" ]]; then
    echo "备份: $BACKUP_DIR"
  fi
  echo ""
  echo "下一步:"
  echo "1. 打开或回到 Obsidian vault"
  echo "2. 如已打开 Obsidian，请重新加载 TraceMind 插件或重启 Obsidian"
  echo "3. 如未自动启用：设置 → 社区插件 → TraceMind → 启用"
  echo "4. 首次启用后按弹窗提示完成初始设置"
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
