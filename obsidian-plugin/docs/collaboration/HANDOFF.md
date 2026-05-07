# Claude Code 任务交接

## 当前任务

Release Prep Audit 1：版本整理与发布准备审计修复。

## Goal

最近多轮功能修复已经通过 lint、test、build，但工作区进入发布前明显混杂状态：源码/测试/构建产物、本地 Vault、`.DS_Store`、探索设计文档和一次性脚本都出现在 `git status` 中。现在目标不是继续加功能，而是把 TraceMind Obsidian 插件整理到“可以判断是否能发 release”的状态。

本轮目标：

- 固化版本一致性检查，避免 `package.json`、`package-lock.json`、`manifest.json` 再次漂移。
- 修复安装脚本中仍然硬编码旧版本 fallback 的问题。
- 明确 release 产物边界：Obsidian 插件 release 至少应包含 `main.js` 与 `manifest.json`，只有存在 `styles.css` 时才包含它。
- 补齐忽略规则，避免本地 Vault、`.DS_Store`、依赖目录等开发产物继续污染状态。
- 生成一份清晰的发布审计报告，列出哪些文件属于本次功能主线、哪些属于本地/无关/需用户决定。

## Current Audit Findings From Codex

请先阅读并验证这些发现，不要盲改：

1. 版本号当前一致：
   - `package.json`: `1.4.3`
   - `package-lock.json` 顶层与 root package: `1.4.3`
   - `manifest.json`: `1.4.3`
   - `versions.json`: 当前不存在
2. `install.sh` 仍有旧版本 fallback：
   - 读取本地 `manifest.json` 失败时 fallback 是 `1.4.2`
   - 无 `manifest.json` 时 fallback 是 `v1.4.2`
   - 当前应避免旧版本硬编码继续存在；可改成单一 `DEFAULT_VERSION="v1.4.3"`，或更稳妥地允许用户用环境变量/参数覆盖。
3. `main.js` 已存在，大小约 264 KB；`styles.css` 当前不存在。
4. `.gitignore` 当前只有：
   - `node_modules/`
   - `*.js`
   这不足以挡住根目录 `.DS_Store`、`obsidian-plugin/.DS_Store`、`obsidian-plugin/TraceMindVault/`。
5. 根目录没有 `.gitignore`。
6. 当前未跟踪项中有：
   - 应该忽略的本地产物：`.DS_Store`、`obsidian-plugin/.DS_Store`、`obsidian-plugin/TraceMindVault/`
   - 本轮/近期实现可能需要保留的新源码测试：`eslint.config.mjs`、`src/ai/provider-error-message.ts`、`src/settings-provider-utils.ts`、`src/storage/entity-writer.ts`、`src/storage/insight-writer.ts`、`src/views/calendar-utils.ts`、对应测试等
   - 一次性或待决定：`scripts/migrate-theme-subtypes.sh`
   - 项目外探索设计：`tracemind-exploration-design/`，不要擅自删除或忽略，报告给用户决定
7. `manifest.json` 当前 `isDesktopOnly: false`，但本地 agent 模块使用 `child_process`。这些模块是动态 import。此项本轮只做风险记录，不要改本地 agent 架构或 manifest，除非发现构建/运行硬错误。

## Repository / Release Boundary

用户已明确两个 GitHub 仓库的职责：

- `github.com/d19310/TraceMind`：私有仓库，可以放源码、测试、协作文档和构建产物。
- `github.com/d19310/tracemind-releases`：公开仓库，只发布构建产物，供用户公开下载。

本轮整理时必须按这个边界判断：

- `install.sh` 的下载源继续指向公开 release 仓库 `d19310/tracemind-releases`。
- 公开 release 仓库不应包含源码、测试、协作文档、本地 Vault、`.DS_Store`、探索设计文档或迁移脚本。
- 公开 release artifact 清单至少是 `main.js`、`manifest.json`；`styles.css` 仅在存在时作为可选 artifact。
- 私有 `TraceMind` 仓库可以保留 `main.js` 构建产物，所以不要因为 `.gitignore` 有 `*.js` 就假设 `main.js` 必须从私有仓库消失；如果要调整 ignore，需要明确不破坏已跟踪的 `main.js`。
- 本轮不创建跨仓库发布自动化；只把边界写清楚、测试 release artifact，并在 REPORT 中说明人工发布到公开仓库时应复制哪些文件。

## Scope

允许修改：

- 根目录 `.gitignore`（如果需要新增）
- `obsidian-plugin/.gitignore`
- `obsidian-plugin/install.sh`
- `obsidian-plugin/tests/install-structure.test.ts`，或新增很小的 release/version 测试文件
- `obsidian-plugin/docs/install-windows.md`（仅当 release 产物说明需要同步）
- `obsidian-plugin/CHANGELOG.md`（仅补发布整理相关条目，不要重写历史）
- `obsidian-plugin/docs/collaboration/REPORT.md`

可只读参考：

- `package.json`
- `package-lock.json`
- `manifest.json`
- `esbuild.config.mjs`
- `main.js`
- `docs/collaboration/PLAN.md`
- `docs/collaboration/ARCHITECTURE.md`

## Non-goals

- 不修改 `src/` 下功能逻辑。
- 不修改 AI provider、entity subtype、Calendar、本地 agent、Vault 写入逻辑。
- 不 bump 新版本号；当前继续使用 `1.4.3`，除非用户明确要求。
- 不删除用户文件，不运行 `git clean`，不移动 `tracemind-exploration-design/`。
- 不提交、不 stage、不重置工作区。
- 不把真实 Vault 路径 `/Users/vincent/OneDrive/TraceMindVault` 写进发布脚本或 release 文档。
- 不把 `node_modules/`、本地测试 Vault、`.DS_Store` 纳入 release。
- 不把源码、测试、协作文档或探索设计文档纳入公开 `tracemind-releases` 仓库。
- 不实现推送到 `github.com/d19310/tracemind-releases` 的自动化。

## Required Work

### 1. 版本一致性测试

补一个真实读取生产文件的测试，至少断言：

- `package.json.version === manifest.json.version`
- `package-lock.json.version === package.json.version`
- `package-lock.json.packages[""].version === package.json.version`
- `manifest.json.id === "tracemind"`
- `manifest.json.js === "main.js"`

不要在测试里复制版本字符串；测试应读取文件。

### 2. Release 产物边界测试

补测试或增强 `tests/install-structure.test.ts`：

- `main.js` 存在且非空。
- `manifest.json` 存在且 JSON 可解析。
- 如果 `styles.css` 不存在，测试不失败；如果存在，报告/测试把它视为可选 release artifact。
- release artifact 清单应明确至少为 `main.js`、`manifest.json`。
- 测试或报告中要区分“私有仓库可保留的构建产物”和“公开 release 仓库应只发布的产物”。

可以新建 `tests/release-prep.test.ts`，比塞进旧的 Vault structure 测试更清楚。

### 3. 修复 `install.sh` 版本 fallback

处理当前 `v1.4.2` 旧 fallback。

建议方式：

- 定义一个单一默认值，例如 `DEFAULT_VERSION="v1.4.3"`。
- 优先使用环境变量 `TRACEMIND_VERSION`（可选但推荐），其次读本地 `manifest.json`，最后使用 `DEFAULT_VERSION`。
- 保持下载 URL 仍使用 GitHub release asset：
  `https://github.com/d19310/tracemind-releases/releases/download/${VERSION}/...`
- 不改变“安装脚本不创建业务目录”的原则。
- 不重新引入未使用工具检查，比如 `unzip`。

### 4. 补齐 ignore 规则

请谨慎处理：

- 如果根目录没有 `.gitignore`，新增根目录 `.gitignore`，至少忽略：
  - `.DS_Store`
  - `obsidian-plugin/TraceMindVault/`
- `obsidian-plugin/.gitignore` 至少忽略：
  - `node_modules/`
  - `.DS_Store`
  - `TraceMindVault/`
  - 可选：`*.js.map`
- 不要简单忽略整个 `scripts/`，因为一次性迁移脚本可能需要用户决定。
- 不要简单忽略 `tracemind-exploration-design/`，先在 REPORT 里列为“项目外探索文档，需用户决定是否纳入仓库或另行忽略”。

### 5. Changelog / docs 最小同步

检查 `CHANGELOG.md` 顶部 `1.4.3` 是否已经覆盖近期发布准备相关变化。

可以追加简短条目，例如：

- release 准备检查：版本一致性测试、release artifact 检查、ignore 规则整理、安装脚本版本 fallback 修复。

不要把所有历史功能重写成大段总结。

### 6. Git 状态归类报告

在 `docs/collaboration/REPORT.md` 中报告完整但分组后的状态：

- 发布必须包含或需要保留的源码/测试/配置文件。
- 构建产物：`main.js`。
- 本地开发产物：`.DS_Store`、`TraceMindVault/`，说明已通过 ignore 规则处理。
- 需用户决定：`tracemind-exploration-design/`、`scripts/migrate-theme-subtypes.sh`（如果仍未跟踪）。
- 明确没有清理/删除任何用户文件。

## Acceptance Criteria

- 版本一致性测试覆盖 `package.json`、`package-lock.json`、`manifest.json`。
- Release artifact 检查覆盖 `main.js`、`manifest.json`，`styles.css` 作为可选项处理。
- `install.sh` 不再含 `1.4.2` 旧 fallback。
- `.gitignore` 能让 `.DS_Store` 和 `obsidian-plugin/TraceMindVault/` 不再出现在普通 `git status --short` 的未跟踪项中。
- 不改 `src/` 功能逻辑。
- `CHANGELOG.md` 只做发布准备相关最小补充。
- `REPORT.md` 有清晰 git 状态分类和验证结果。
- `REPORT.md` 明确两个仓库职责，以及公开发布时应复制到 `tracemind-releases` 的文件清单。
- `rtk npm run lint` 通过。
- 新增/修改的 release/version 定向测试通过。
- `rtk npm test` 通过。
- `rtk npm run build` 通过。
- `rtk git diff --check` 通过。

## Verification

请按顺序运行并记录：

```bash
rtk npm run lint
rtk proxy npx tsx --test tests/release-prep.test.ts
rtk npm test
rtk npm run build
rtk git diff --check
rtk git status --short
```

如果你没有新建 `tests/release-prep.test.ts`，请把第二条换成实际定向测试文件，并在 REPORT 写清楚。

## Report Back

完成后更新 `docs/collaboration/REPORT.md`，必须包含：

- 状态：完成、部分完成或阻塞。
- 变更文件列表。
- 版本一致性检查结果。
- release artifacts 检查结果。
- `install.sh` 版本选择逻辑说明。
- ignore 规则变更说明。
- `rtk git status --short` 的分组摘要。
- 验证命令和结果。
- 未处理项和需要用户决定的项。
