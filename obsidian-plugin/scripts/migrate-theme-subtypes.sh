#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# TraceMind Theme Subtype 一次性迁移工具
#
# 只修改 Theme/*.md frontmatter 中单行 subtype: old_value
# domain          -> idea
# pending_decision -> judgment
# habit           -> goal
# state           -> friction
#
# 已经是 friction/goal/judgment/idea → 跳过
# 没有 subtype / 不认识的 subtype    → 跳过，只报告
# 没有 frontmatter                   → 跳过，只报告
#
# 用法:
#   bash scripts/migrate-theme-subtypes.sh --vault <path>           # dry-run
#   bash scripts/migrate-theme-subtypes.sh --vault <path> --write   # 实际迁移
#   bash scripts/migrate-theme-subtypes.sh --vault <path> --write --no-backup
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

usage() {
  echo "用法: $0 --vault <路径> [--write] [--no-backup]"
  echo ""
  echo "  一次性迁移旧 Theme subtype → 新 schema"
  echo "  映射: domain→idea  pending_decision→judgment  habit→goal  state→friction"
  exit 1
}

VAULT=""
WRITE=false
NO_BACKUP=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vault) VAULT="$2"; shift 2 ;;
    --vault=*) VAULT="${1#*=}"; shift ;;
    --write) WRITE=true; shift ;;
    --no-backup) NO_BACKUP=true; shift ;;
    -h|--help) usage ;;
    *) echo -e "${RED}未知参数: $1${NC}"; usage ;;
  esac
done

if [[ -z "$VAULT" ]]; then
  echo -e "${RED}错误: 缺少 --vault 参数${NC}"
  usage
fi
VAULT="$(cd "$VAULT" 2>/dev/null && pwd)" || { echo -e "${RED}Vault 路径不存在: $VAULT${NC}"; exit 1; }

THEME_DIR="$VAULT/Theme"
if [[ ! -d "$THEME_DIR" ]]; then
  echo -e "${YELLOW}Theme 目录不存在: $THEME_DIR${NC}"
  echo "没有需要迁移的文件。"
  exit 0
fi

# ---- 映射逻辑 ----
map_subtype() {
  case "$1" in
    domain)           echo "idea" ;;
    pending_decision) echo "judgment" ;;
    habit)            echo "goal" ;;
    state)            echo "friction" ;;
    *)                echo "" ;;
  esac
}

echo -e "${GREEN}TraceMind Theme Subtype 迁移${NC}"
echo "Vault: $VAULT"
echo "Mode: $($WRITE && echo 'WRITE' || echo 'DRY-RUN')"
echo ""

changed=0 unchanged=0 missing=0 unknown=0 nofm=0

for md in "$THEME_DIR"/*.md; do
  [[ -f "$md" ]] || continue
  name="$(basename "$md")"

  # Check for frontmatter marker
  if ! head -1 "$md" | grep -q '^---$'; then
    echo -e "  ${YELLOW}${name}: no frontmatter (skip)${NC}"
    ((nofm++))
    continue
  fi

  # Extract subtype line from frontmatter only (between first and second ---)
  subtype_line=$(sed -n '/^---$/,/^---$/ { /^subtype:/p; }' "$md" | head -1)
  if [[ -z "$subtype_line" ]]; then
    echo -e "  ${YELLOW}${name}: missing subtype (skip)${NC}"
    ((missing++))
    continue
  fi

  # Parse: "subtype: value" or "subtype: value   "
  old=$(echo "$subtype_line" | sed 's/^subtype:[[:space:]]*//' | xargs)

  # Already valid?
  case "$old" in
    friction|goal|judgment|idea)
      ((unchanged++))
      continue ;;
  esac

  # Known old subtype?
  new="$(map_subtype "$old")"
  if [[ -z "$new" ]]; then
    echo -e "  ${YELLOW}${name}: unknown subtype \"$old\" (skip)${NC}"
    ((unknown++))
    continue
  fi

  echo -e "  ${GREEN}${name}: $old -> $new${NC}"
  ((changed++))

  if $WRITE; then
    if ! $NO_BACKUP; then
      cp "$md" "$md.bak"
    fi
    # Replace only the subtype line in frontmatter section
    sed -i '' "/^---$/,/^---$/ { s/^subtype:.*/subtype: $new/; }" "$md"
    echo "    written$($NO_BACKUP || echo ' (backup: .bak)')"
  fi
done

echo ""
echo "Summary:"
echo "  changed:         $changed"
echo "  unchanged:       $unchanged"
echo "  missing subtype: $missing"
echo "  unknown subtype: $unknown"
echo "  no frontmatter:  $nofm"

if ! $WRITE && [[ $changed -gt 0 ]]; then
  echo ""
  echo "这是 dry run。使用 --write 执行迁移。"
fi
