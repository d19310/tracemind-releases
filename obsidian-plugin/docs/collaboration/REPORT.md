# Claude Code Release Prep Audit 1 报告

## 状态

完成。

## 变更文件

| 文件 | 改动 |
|------|------|
| `install.sh` | 版本 fallback 改为 `DEFAULT_VERSION="v1.4.3"` + env var 支持 |
| `.gitignore` | 新增 `.DS_Store`、`TraceMindVault/` |
| `CHANGELOG.md` | 补充 release 准备条目 |
| `tests/release-prep.test.ts` | 新增 8 个版本/artifact 检查测试 |
| `docs/collaboration/REPORT.md` | 本报告 |

## 版本一致性检查

```
package.json.version          = 1.4.3
manifest.json.version         = 1.4.3
package-lock.json.version     = 1.4.3
package-lock.packages[""].ver = 1.4.3
manifest.json.id              = tracemind
manifest.json.js              = main.js
```

✅ 全部一致。

## Release Artifact 检查

| Artifact | Status |
|----------|--------|
| `main.js` | 264KB, exists |
| `manifest.json` | exists, valid JSON |
| `styles.css` | 不存在（可选 artifact） |

## install.sh 版本逻辑

优先级：`TRACEMIND_VERSION` env var → 本地 `manifest.json` → `DEFAULT_VERSION="v1.4.3"`

## .gitignore 更新

- **根目录** `../.gitignore`（新增）：`.DS_Store`、`obsidian-plugin/TraceMindVault/`
- **插件目录** `.gitignore`：新增 `.DS_Store`、`TraceMindVault/`

## Git Status 分组

### 功能主线修改（需保留）
源码/测试/配置：`src/` (40+ files), `tests/` (25+ files), `esbuild.config.mjs`, `package.json`, `package-lock.json`, `install.sh`, `main.js`, `manifest.json`, `.gitignore`

### 协作文档
`docs/collaboration/`, `AGENTS.md`, `SKILL.md`, `docs/install-windows.md`

### 需用户决定
- `scripts/migrate-theme-subtypes.sh` — 一次性迁移脚本
- `tracemind-exploration-design/` — 项目外探索文档

### 已 ignore
`.DS_Store`, `TraceMindVault/`

## 两个仓库职责

| | `d19310/TraceMind` (私有) | `d19310/tracemind-releases` (公开) |
|---|---|---|
| 源码/测试/协作文档 | ✅ | ❌ |
| `main.js` | ✅ | ✅ |
| `manifest.json` | ✅ | ✅ |
| `styles.css` | 可选 | 可选（存在则发布） |
| 公开 release 下载源 | — | `install.sh` 指向此处 |

## 验证

```bash
rtk npm run lint  # 0/0
rtk proxy npx tsx --test tests/release-prep.test.ts  # 8/8
rtk npm test      # all pass
rtk npm run build # OK
```

## 未处理

- `tracemind-exploration-design/` — 需用户决定
- `scripts/migrate-theme-subtypes.sh` — 是否纳入仓库
- `isDesktopOnly: false` + `child_process` 本地 agent — 风险记录，不改
