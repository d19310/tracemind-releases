# TraceMind Obsidian 插件架构

## 概览

TraceMind 是一个 TypeScript Obsidian 插件。插件读取 Vault 中的 Daily note，解析日记 block，通过 AI provider 进行实体抽取和分析，把结果沉淀为 Context Cards、Entity Index、Session 和 Insight，并通过 Obsidian 视图提供交互。

当前架构重点是稳定现有插件能力，不展开探索模式或白板模块。

## 技术栈

- 语言：TypeScript。
- 平台：Obsidian Plugin API。
- 构建：esbuild。
- 测试：Node test runner + `tsx`。
- 配置/校验：zod、TypeScript 类型。
- Markdown 处理：js-yaml、turndown。
- 存储：Obsidian Vault adapter，Markdown 和 JSON 文件。

## 主要模块

| 模块 | 路径 | 职责 |
| --- | --- | --- |
| 插件入口 | `src/main.ts` | 插件生命周期、目录初始化、视图注册、命令、核心 adapter |
| 设置 | `src/settings.ts`, `src/settings-types.ts` | provider、模型、实体分析等配置 |
| 视图 | `src/views/` | Block Editor、AI Analysis Panel、Calendar、确认弹窗 |
| 核心模型 | `src/core/` | 日记解析、Context Card、用户画像、确认流、知识缺口、首次启动 |
| AI | `src/ai/` | provider 配置、实体抽取、分析编排、daily insight、聊天 action 解析 |
| 存储 | `src/storage/` | card、index、session、insight 的格式化和 IO |
| Vault 工具 | `src/vault/` | Vault 目录和文件辅助 |
| 本地 Agent | `src/agent/` | Claude Code、Hermes provider；当前阶段只维护现有行为 |
| 测试 | `tests/` | core、ai、storage、settings、install structure 测试 |

## 数据和文件

- Daily note：`Daily/YYYY-MM-DD.md`。
- Context Cards：`Person/`、`Object/`、`Theme/`。
- Session：`TraceMind/sessions/`。
- Entity Index：`TraceMind/index/`。
- Insight：`TraceMind/insights/`。
- Profile：`TraceMind/PROFILE.md`。

## 安装和初始化边界

- `install.sh` 面向 macOS release 安装，只负责环境检查、Obsidian 检查或辅助安装、定位已有 Vault、创建 `.obsidian/plugins/tracemind/`、下载 release 产物和提示用户启用插件。
- 发布仓库边界：`github.com/d19310/TraceMind` 是私有源码仓库，可以保留源码、测试、协作文档和构建产物；`github.com/d19310/tracemind-releases` 是公开下载仓库，只放 release artifact。
- 公开 release artifact 至少包含 `main.js` 和 `manifest.json`；`styles.css` 仅在存在时作为可选 artifact。公开 release 仓库不放源码、测试、协作文档、本地 Vault 或 `.DS_Store`。
- `install.sh` 的下载源应指向公开 release 仓库 `d19310/tracemind-releases`。
- `install.sh` 不再创建 `Daily/`、`Person/`、`Object/`、`Theme/`、`TraceMind/` 等业务目录，也不创建 Daily note 或 `PROFILE.md`。这些属于插件首次启动初始化流程。
- 首次启动向导是 Vault 业务目录的唯一默认初始化入口，必须创建并校验完整目录结构：`Daily`、`Person`、`Object`、`Theme`、`TraceMind/sessions`、`TraceMind/index`、`TraceMind/insights`、`TraceMind/PROFILE.md`。
- 如果用户关闭向导或目录创建失败，插件必须清晰提示初始化未完成，并允许用户重新打开或继续完成初始化。
- Windows 安装当前以手动安装文档为准；本地 Agent CLI 在 Windows 下标记为实验性，后续单独验证 `.cmd` shim、PATH 和 `child_process.spawn` 行为。

## 关键流程

1. 插件加载：`TraceMindPlugin.onload` 读取设置、确保 Vault 目录、重建实体索引、加载用户画像、注册视图和命令。
2. 日记解析：`parseDiaryContent` 把 Daily note 拆成 block，`block-id-validator` 保护 id 格式。
3. 分析：`AnalysisService` 和相关 AI 模块调用 provider，生成实体、洞察和确认项。
4. 确认：确认流把候选实体转成可写入的实体或跳过项。
5. 存储：card/index/session/insight 模块负责格式化、解析和写入。
6. UI：视图调用插件 adapter，展示分析、日历和编辑交互。

## 命令和验证

```bash
rtk npm test
rtk npm run build
rtk npm run lint
rtk git diff --check
```

注意：`npm run lint` 依赖 eslint 配置是否完整；如果不可用，任务报告必须说明原因。

## 架构约束

- AI 输出必须经过解析和校验，不直接信任原始文本。
- Vault 写入集中在 storage/core/plugin adapter 层，不从 UI 或 provider 随意写文件。
- 解析和格式化函数应尽量保持纯函数，便于测试。
- 触及 Markdown/JSON 文件格式时必须更新或新增测试。
- 不为未来探索模式提前引入未使用抽象。

## 已知风险

- `src/main.ts` 承担较多 adapter 和业务协调职责，后续可能需要分拆，但当前只在有明确收益时做。
- Obsidian API mock 与真实运行环境可能存在差异。
- provider 配置错误和网络错误需要更细的用户提示。
- `package.json` 和 `manifest.json` 版本可能不同步，需要决定是否纳入检查。

## 决策记录

| 日期 | 决策 | 原因 | 取舍 |
| --- | --- | --- | --- |
| 2026-05-06 | 协作文档放在 `obsidian-plugin/` 内 | 当前开发重心是插件本身 | 根目录文档仅作为仓库级上下文，不作为当前插件任务入口 |
| 2026-05-06 | 当前阶段冻结探索模式开发 | 用户明确要求先完善现有插件功能 | 后续探索模式需要重新更新 PRD/PLAN/HANDOFF |
| 2026-05-06 | Claude Code 任务必须小范围、可验证 | 降低对 Vault 和插件主流程的破坏风险 | 需要 Codex 先做好任务拆分 |
| 2026-05-06 | Vault 业务目录由插件首次启动向导创建，安装脚本不创建 | 初始化状态应由插件内流程校验，避免安装脚本和插件逻辑分叉 | 安装脚本仍需创建 Obsidian 插件目录 |
| 2026-05-06 | Windows 安装先提供手动说明，本地 Agent 标记实验性 | 核心插件应先保证可安装可启用，Agent CLI 跨平台执行后续验证 | Windows 自动安装脚本暂不作为当前任务 |
