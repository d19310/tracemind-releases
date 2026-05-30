# Changelog

All notable changes to TraceMind will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

## [2.1.6] - 2026-05-30

### Fixed
- **AI 聊天 action 容错** — 修复右侧 AI 聊天模式总结周报时，LLM 直接输出 `{"action":"get_diary"}` 裸 JSON 后不会执行且会显示给用户的问题。
- **流式显示清理** — 聊天流式输出过程中隐藏裸 action JSON 和未完成 action JSON，避免工具调用内容闪现到对话中。

### Changed
- **跨日期总结提示** — 周报、月报等跨日期总结时，引导 LLM 一次性输出多个 `get_diary` action，再基于读取结果生成总结。

## [2.1.0] - 2026-05-25

### Added
- **思维导图** — 新增发散思考方法，支持多一级分支、多二级分支的右向树状布局。
- **RISE 战略分析** — 新增 Reality、Insight、Strategy、Execution 分阶段战略推演流程，用户回复可自然长出多条推演路径。
- **成果再沉淀** — 多个 output block 可继续生成更高层 output block，生成总结时会向上追溯完整思考链路。
- **删除撤回** — 支持删除 block / edge 后通过 `Cmd/Ctrl+Z` 撤回。
- **长内容预览** — block 内容被截断或 detail 较长时，悬浮显示详细 Markdown 预览。

### Changed
- **白板性能** — 优化 block 拖拽、edge 渲染、Markdown 解析、白板平移和滚轮缩放，降低大白板场景下的 React 重渲染压力。
- **Action Bar** — 更多菜单按「发散思考 / 战略分析 / 产品分析 / 输出」分组，并保留常用思考方法快捷入口。
- **Block 尺寸** — 统一 AI 生成 thinking block 尺寸，降低思考方法生成大量 block 后的拥挤感。
- **探索布局** — 大型思维导图和重复 run 会避开白板上边界，并按泳道继续向下排列。

### Fixed
- **模式切换** — 修复从选择模式切换到平移模式后仍停留在框选状态的问题。
- **滚轮报错** — 修复 Obsidian 控制台 `Unable to preventDefault inside passive event listener invocation` 刷屏。
- **拖拽状态** — 修复 pointer capture 丢失后 block 可能像跟随鼠标一样延迟移动的问题。
- **Agent JSON 容错** — 兼容思维导图、用户地图、决策树、RISE 中常见的 agent 输出字段偏差。
- **成果生成** — 修复只选择 output block 再点击「沉淀成果」没有反应的问题。

## [2.0.0] - 2026-05-24

### Added
- **思考探索模式** — 从日记 block 进入沉浸式探索白板，支持历史 `.canvas` 文件再次打开。
- **本地 Agent Runtime** — 探索模式接入 Codex、Claude Code、Hermes、OpenCode 等本地 CLI Agent。
- **思考增强方法** — 支持破题拷问、头脑风暴、决策树、用户地图。
- **探索白板操作** — 支持 block 连线、分组、多选移动、材料引用、记忆检索、用户回复、agent 自动回应、output block 成果总结。
- **探索文件目录** — 使用 vault 根目录下的 `explorations/` 保存白板，`outputs/` 保存导出成果。
- **新版品牌标识** — 更新 Obsidian 左侧入口、日记 tab 和 AI 分析 tab 图标。

### Changed
- **安装脚本** — 默认安装版本升级为 `v2.0.0`，并下载 `styles.css` / `main.css`。
- **README** — 新增 2.0.0 安装、功能和探索模式说明。
- **VAULT_GUIDE** — 补充探索白板目录、block 类型和本地 Agent 读写约定。
- **实体发现流程** — AI 分析改为 mention extraction、candidate linking、用户确认和关系推断的分层流程，降低相似实体误匹配。

### Fixed
- **重复运行连线** — 同一 source block 多次运行思考方法时，agent 返回的重复 `b1/b2` id 会按 run 重映射，避免连线错连或丢失。
- **OpenCode 输出读取** — 兼容 OpenCode stdout 为空但写入 JSON 文件的场景。
- **探索布局** — 多次运行结果按泳道纵向排列，降低 block 重叠。

## [1.5.10] - 2026-05-11

### Fixed
- **实体误匹配** — AC prefix 3字→4字，substring 2字→4字，消除"上海电力"误判"上海电信"
- **实体模糊匹配** — `findExistingEntity` 增加 4 字子串 fallback，`"字节跳动910C项目"` 可匹配 `"字节910C项目"`

## [1.5.9] - 2026-05-11

### Fixed
- **会话恢复精准定位** — `clarificationPhase` 和 `currentEntityIndex` 持久化到 session，中断后从上次实体继续，不重复询问

## [1.5.8] - 2026-05-11

### Added
- **VAULT_GUIDE.md** — 外部 agent（Claude Code、Hermes 等）读写 Vault 的完整指南，涵盖日记、实体索引检索和附件

### Fixed
- **中断会话恢复** — 分析中断后重新点击 block 可继续澄清对话，不再卡住
- **#待分析 已有会话** — 不再对已分析过的 block 重新启动分析

### Changed
- **SKILL.md → VAULT_GUIDE.md** — 重命名并重写，覆盖索引持久化后的检索方式

## [1.5.7] - 2026-05-10

### Changed
- **移除网页剪藏** — 网页链接作为普通文本保存，不做检测和处理
- **附件按钮样式优化** — 融入输入框背景色，hover 白色圆形，+ 居中，追加模式按钮右对齐

### Fixed
- **微信剪藏 CORS** — 已移除剪藏功能，不再涉及

## [1.5.6] - 2026-05-09

### Added
- **网页剪藏** — 日记中网页链接可确认后抓取保存到 `Daily/webclippings`，微信优先 OpenCLI
- **剪藏图片** — 微信文章图片随文章一起保存到 `Daily/webclippings/images/`
- **URL 提取修复** — 不再把中文标点/文字连带识别为 URL 的一部分

### Fixed
- **微信剪藏 CORS** — OpenCLI 路径修复（Electron PATH 不含 homebrew）+ 子目录递归查找 + 图片复制

## [1.5.5] - 2026-05-09

### Fixed
- **微信公众号剪藏 CORS** — OpenCLI 失败后不再 fallback 到 Obsidian renderer fetch，避免 `app://obsidian.md` 跨域错误；失败时保留原链接。

## [1.5.4] - 2026-05-09

### Added
- **日记附件** — 输入框左下角新增 `+` 附件按钮，支持新建和追加日记时上传附件到 `Daily/attachments`
- **网页剪藏** — 日记中的网页链接可确认抓取，剪藏内容保存到 `Daily/webclippings` 并替换为 Obsidian embed
- **剪藏上下文摘要** — AI 分析会读取剪藏文件并先压缩摘要，再作为附加上下文参与实体分析

### Changed
- **协作流程** — Codex + worker/Claude 协作方式调整为更省 token 的任务卡/验收模式

## [1.5.3] - 2026-05-09

### Fixed
- **启动超时** — 结构校验改为后台异步执行，不再阻塞 onload

## [1.5.2] - 2026-05-09

### Added
- **启动时 Vault 结构校验** — 每次插件启动校验目录/档案完整性，缺失弹窗确认修正，完整静默继续
- **Typecheck 修复** — `tsc --noEmit` 零错误，旧实体分组引用已清理

### Fixed
- **启动静默** — 结构完整时不再弹"TraceMind 已加载" Notice
- **TRACEMIND_DIRS 不再分叉** — 直接引用 REQUIRED_DIRS

## [1.5.1] - 2026-05-08

### Changed
- **Icon 统一** — 日记视图和 AI 面板 tab 改为脑 icon，与左侧导航栏品牌标识一致
- **文案优化** — "已更新了x个实体的信息" → "已更新 x 个相关档案信息"

## [1.5.0] - 2026-05-07

### Added
- **Entity Subtype Metadata** — 完整的 subtype schema 体系（Phase 1-5B），支持 subtype-specific maturity、knowledge gap、AI prompt、Markdown 展示
- **Provider 全链路修复** — providerType 显式配置、validateConfig 统一校验、HTTP 错误安全摘要、LLM extractor 接入、enableThinking/reasoningEffort 透传
- **Vault 写入可靠性** — upsertCard rename 安全顺序、Entity Index 不污染、Insight 保存 helper、parent folder 自动确保
- **Theme Subtype 迁移脚本** — `scripts/migrate-theme-subtypes.sh`
- **UX 增强** — Settings Provider 编辑、Send 按钮 loading、测试连接友好错误、日历可访问性/键盘操作/批量 diary check
- **ESLint 工具链** — 0 errors / 0 warnings 基线
- **Release 准备** — 版本一致性测试、release artifact 检查、ignore 规则、安装脚本版本 fallback

### Changed
- **安装/首次启动边界修正** — `install.sh` 不再创建业务目录
- **版本同步** — manifest.json / package.json / package-lock.json 三处版本统一

## [1.4.3] - 2026-05-06

### Changed
- **安装/首次启动边界修正** — `install.sh` 不再创建业务目录，仅安装插件文件。首次启动向导负责创建并校验完整目录结构
- **版本同步** — manifest.json / package.json / package-lock.json 三处版本统一
- **Windows 手动安装文档** — 补充 `docs/install-windows.md`
- **废弃 AI 测试清理** — 删除 3 个测试已废弃同步路径的文件，修复 2 个 API 变更测试

### Fixed
- **首次启动静默创建目录** — `main.ts` 不再在向导前调用 `ensureVaultStructure()`
- **目录校验逻辑可测试** — 抽成 `getMissingFirstStartItems()` 纯函数，新增 6 个单元测试

### Release
- **版本一致性检查** — 新增 `tests/release-prep.test.ts` 覆盖 version/manifest 同步
- **安装脚本版本 fallback** — `install.sh` 不再硬编码 v1.4.2，支持 env var + manifest.json + DEFAULT_VERSION
- **ignore 规则** — `.gitignore` 补齐 `.DS_Store`、`TraceMindVault/`
- **release artifact 检查** — 明确 `main.js` + `manifest.json` 为必需 artifact

## [1.4.2] - 2026-05-06

### Added
- **日记 Slogan 可自定义** — 日记视图的 slogan 从日记文件 `> [!NOTE]` 行读取，用户可自行编辑

### Fixed
- **今日洞察标题双 `##`** — 修复 insight report 章节标题多余 `##` 前缀

### Changed
- **日记模板 slogan** — 默认改为"记录，是AI时代的人生复利。"

## [1.4.1] - 2026-05-06

### Changed
- **#待分析 block 点击重新分析** — 点击 `#待分析` 标签的日记 block 自动触发 AI 实体提取和澄清流程
- **ID 丢失容错** — block ID 缺失时自动生成新 UUID，分析完成后写回 markdown
- **澄清回复入库** — AI 澄清阶段用户的回复原文以 `user_feedback` 类型记录到实体互动档案

### Fixed
- **#待分析 重复分析死循环** — 修复已有会话的待分析 block 导致 selectBlock 递归崩溃

## [1.4.0] - 2026-05-05

### Added
- **本地 Agent 集成** — 支持连接本地安装的 AI agent CLI（Claude Code / Hermes），替代云端 API
  - 设置中一键开启，自动检测本机已安装的 agent，显示 🟢/🔴 状态
  - 聊天模式输入框左侧 agent 选择器，可切换云端 API / Claude Code / Hermes
  - 本地 agent 通过 `child_process.spawn()` 子进程通信，有权直接读写 vault 文件
  - agent 收到定制 prompt（vault 路径 + 目录结构 + 实体索引 + profile），利用自带文件工具检索
- **Agent Provider 抽象层** — 可扩展架构，新增 agent 只需实现 `AgentProvider` 接口

## [1.3.2] - 2026-05-05

### Fixed
- **TRACEMIND_ACTION 残留** — parser 容错处理孤立标签和裸 JSON，streaming 过滤加强
- **系统 prompt** — 明确标注开闭标签都不可省略，给出具体示例
- **UI** — 日记视图日期前加 📅 emoji，slogan 优化，tab 标签改为 TraceMind 迹忆

## [1.3.1] - 2026-05-05

### Added
- **Object subtype: company** — 公司/组织 subtype，P0 优先级，带 LLM 识别指引
- **AI 聊天日期感知** — 系统 prompt 告知当前日期，`get_diary` action 补全

### Fixed
- **聊天 Markdown 渲染** — AI 回复使用 Obsidian MarkdownRenderer 渲染（表格、标题、列表、引用等）
- **Streaming 闪烁** — streaming 期间用 `<pre>` 标签显示，过滤 TRACEMIND_ACTION 块，结束切换格式化
- **Session 持久化空内容** — `streamChatMessage` 结束时正确持久化完整内容
- **聊天查询策略** — 优先查实体档案（含互动记录），档案不足时才查日记

## [1.3.0] - 2026-05-05

### Changed
- **Theme 重新定义** — 4 个新 subtype 替代旧的定义：friction(摩擦)/goal(目标)/judgment(判断)/idea(想法)，每个带 LLM 识别指引
- **配置简化** — entity-type-config 去掉 vault JSON 文件，纯代码管理，无需用户升级
- **今日洞察"主题动态"强化** — 按 subtype 分类列出新增/强化/消退的主题

### Fixed
- Theme subtype UI 显示中文 label 代替 raw key
- P2 属性不一致修复 (context-card.ts 与 entity-type-config.ts 对齐)

## [1.2.2] - 2026-05-05

### Changed
- **AI 分析对话流式输出** — 澄清对话中所有 assistant 消息改为逐字打字动画，体验更自然
- **澄清问题 subtype 提示** — object/theme 实体的提问中嵌入 subtype 标签（如 "这个**任务**能介绍一下吗？"），用户可纠正 subtype
- **聊天对话 SSE 流式** — chat 模式下 LLM 回复改为真实 SSE streaming，配合 subtype 纠正流程

### Fixed
- AI 分析面板 subtype 纠正支持

## [1.2.1] - 2026-05-05

### Fixed
- **日历历史日记导航** — 修复点击日历日期无法调出历史日记的问题（`navigateToDate` 调用错误的方法名）
- **插件启动崩溃** — 修复 `ensureVaultStructure` 重复调用导致 `Folder already exists` 插件加载失败
- **今日洞察输入框** — 切换到今日洞察 tab 时正确隐藏 AI 输入框
- **`getBlockEditorDate` 类型兼容** — 同时支持 Date 和 string 类型的 `currentDate`

## [1.2.0] - 2026-05-04

### Added
- **今日洞察** — 天级别深度 AI 分析，替换右侧栏"实体索引"tab。点击"今日洞察"tab（当天 ≥ 5 条日记时可用）触发 LLM 生成 6 章节 Markdown 报告：
  - 今日概览 / 注意力分布 / 主线与发散 / 变化与摩擦 / 主题动态 / 与前日对比
- **真实 SSE 流式输出** — `streamChat()` 支持 OpenAI/Anthropic/Custom provider 的 Server-Sent Events streaming，洞察报告渐进生成
- **报告缓存** — `TraceMind/insights/YYYY-MM-DD.md` 存储，YAML frontmatter + Markdown body，日记内容不变时复用缓存
- **历史日记浏览** — 日历跳转历史日期查看已生成的洞察报告，不重新分析

### Changed
- 实体索引功能保留代码但 tab 替换为今日洞察

## [1.1.1] - 2026-05-04

### Added
- **日记领域自动分类** — LLM 分析日记后根据内容自动判定领域标签（工作/生活/学习/运动/其他），结合用户 PROFILE.md 背景信息，分析完成后自动更新日记块的 `#待分析` 标签为对应领域标签

### Changed
- **品牌更新** — 日记视图 tab 标签从 LifeWiki 改为 TraceMind 日记，block source 从 Lifewiki 改为 TraceMind

### Fixed
- **编辑模式布局** — 标签位置与正常状态保持一致（左对齐，在内容下方），textarea 无边框无背景色变化
- **编辑/追加模式冲突** — 双击进入编辑模式时不再同时激活追加模式，单击外部正确退出编辑和追加状态

## [1.1.0] - 2026-05-04

### Plugin Release v1.1.0
- **Chat Mode Vault Assistant** — 对话式助手支持全文搜索和多实体查询
- **Entity Type Configuration** — 支持配置 Entity 类型的名称/颜色/文件夹映射
- **Agent-Provider Mapping** — 基于 Modal 的 Agent 与 AI Provider 设置界面
- **AI Analysis Interaction Refactor** — PRD 引导的澄清流程，自然对话式交互
- **Multiple Fixes** — BlockEditor 主区域打开、URL 规范化、Obsidian SettingTab 兼容性、双链修复
- **安装脚本更新** — 简化为纯交互式提示，支持公共 Release 仓库下载

## [2.0.0] - 2026-05-03

### Major Rewrite
- Fork LifeWiki 2.0 UI (BlockEditor, AI 分析面板, 日历) 并替换 AI 层为 TraceMind 引擎
- 引入 Context Card 模型（Person / Object / Theme 三种实体类型）
- 引入成熟度系统（L0-L3）：L0 候选 → L1 待确认 → L2 观察中 → L3 已归档
- 知识差距检测：自动识别缺失属性并生成澄清问题
- 优先级评分：新实体优先排序，同优先级按分数降序

### New Features
- **AI 分析面板适配** — TraceMind 的 `AnalyzedEntity[]` 通过类型转换器映射为 LifeWiki 的分组格式（person→people, object→things, theme→ideas），现有 UI 无需修改
- **实体确认流程** — L0/L1 实体需要用户确认，L2+ 实体静默更新
- **自动分析** — 编辑器内容变化后防抖触发（默认关闭，手动通过命令触发）
- **最大实体数限制** — 每次分析最多返回 5 个实体，防止信息过载
- **块 ID 格式验证** — 支持 `YYYY-MM-DD`、`YYYY-MM-DD_name`、`block-<hex>` 三种格式
- **首次启动向导** — 检测 `Daily/PROFILE.md` 是否存在，引导创建目录和用户档案
- **实体索引重建命令** — 用户可手动触发全量索引重建
- **LLM 实体提取** — 支持 OpenAI 兼容 API 的 LLM 提取，失败时降级为规则提取
- **共现关系推理** — 基于实体在文本中的共现频率推断关联关系
- **安装脚本** — `install.sh` 自动发现 Obsidian vault，构建并安装插件

### New Files
- `src/core/context-card.ts` — Context Card 数据模型 + 成熟度计算
- `src/core/cooccurrence.ts` — 共现关系推理
- `src/core/knowledge-gap.ts` — 知识差距检测
- `src/core/clarification-session.ts` — 多轮澄清会话管理
- `src/core/confirmation-flow.ts` — L0/L1 确认流程
- `src/core/user-profile.ts` + `profile-loader.ts` — 用户档案加载
- `src/core/diary-parser.ts` — 日记块解析
- `src/core/block-id-validator.ts` — 块 ID 格式验证
- `src/core/first-start.ts` + `first-start-constants.ts` — 首次启动向导
- `src/ai/analysis-service.ts` — 主分析管线（规则 + LLM）
- `src/ai/analysis-orchestrator.ts` — 分析编排器
- `src/ai/analysis-result-adapter.ts` — TraceMind → LifeWiki 类型转换器
- `src/ai/entity-extractor.ts` — 规则实体提取
- `src/ai/llm-entity-extractor.ts` — LLM 实体提取
- `src/ai/provider-config.ts` + `provider-registry.ts` — 多 Provider 配置
- `src/storage/card-writer.ts` — Context Card 写入
- `src/storage/entity-index.ts` — 内存实体索引
- `src/storage/entity-index-io.ts` — 索引持久化
- `src/storage/markdown-card.ts` — Context Card Markdown 序列化
- `src/storage/session-store.ts` + `session-store-io.ts` — 会话存储
- `install.sh` — 安装脚本

### Deleted
- `src/ai/langgraph/` — LifeWiki LangGraph 工作流（已移除）
- `src/ai/agents/` — LifeWiki Agent 系统（已移除）
- `src/ai/providers/` — LifeWiki Provider 实现（已移除）
- `src/ai/capture-analyzer.ts` — 旧分析入口（已替换）
- `src/ai/session-manager.ts` — 旧会话管理（已替换）
- `src/ai/agent-config.ts` — 旧 Agent 配置（已移除）
- `src/skills/` — LifeWiki 技能系统（已移除）
- `src/entities/manager.ts` — 旧实体管理器（已替换为 Context Card）

### Tests
- 总计 235 个测试，82 个测试套件，0 失败
- 新增测试覆盖：类型转换器（8）、最大实体数（3）、块 ID 验证（8）、首次启动（5）

### Migration
- 从 LifeWiki 2.0 升级：需删除旧 `.obsidian/plugins/lifewiki/` 目录后重新安装
- 旧 Entity 数据不会自动迁移，需手动导入

## [2.0.1] - 2026-05-03

### AI 分析交互重构（PRD 引导式渐进澄清）
- **`ai-analysis-panel.ts`** — 自然对话式交互：AI 逐实体提问，用户打字回答，LLM 解析后直接确认保存
- **`ai-analysis-panel.ts`** — 四个阶段：摘要 → 澄清 → 已知实体补充 → 完成
- **`ai-analysis-panel.ts`** — 自然语言命令："跳过"、"结束"、"没有了"
- **`ai-analysis-panel.ts`** — `renderAnalysisStart` 输出自然开场白："这条日记中提到的 **XX** 我不太熟悉...**XX** 我了解"
- **`ai-analysis-panel.ts`** — 结束语："好了，这次先到这里。**XX** 已更新"
- **`ai-analysis-panel.ts`** — `parseClarificationResponse` 用 LLM 提取属性，prompt 含默认值示例引导 LLM 推断

### LLM 实体提取优化
- **`llm-entity-extractor.ts`** — `parseLLMResponse` 直接搜索 `{"entities"` + 大括号配对，绕过 thinking 标签解析
- **`llm-entity-extractor.ts`** — 提取 prompt 增强：明确命名实体定义、禁止提取项（抽象概念/泛泛名词）、宁缺毋滥（confidence < 0.6 不加入）、最多 5 个、theme 谨慎使用
- **`llm-entity-extractor.ts`** — 示例中加入 theme 类型实体（如"H200供货紧张"）
- **`analysis-service.ts`** — `gapToQuestion` 不再问 subtype（LLM 可推断），改问状态/时间节点等更重要的信息
- **`analysis-service.ts`** — 过滤 subtype 缺口，避免无意义提问

### 实体优先级算法
- **`core/context-card.ts`** — `calculatePriorityScore` 新增种子分：新实体 P0 属性越多越先问（person 0.75 > object 0.5 > theme 0.25）

### AC 状态机（Aho-Corasick）
- **`ac-entity-scanner.ts`**（新文件）— 三层匹配：精确 → 别名 → 前缀，预扫描日记发现已知实体
- **`analysis-service.ts`** — 分析前 AC 扫描 + 字符重叠候选（最多 10 个），注入 LLM prompt 避免重复提取
- **`analysis-service.ts`** — AC 命中的已知实体强制加入结果，确保面板显示和后续询问

### PROFILE.md 集成
- **`core/user-profile.ts`** — 改为 YAML frontmatter 格式（`js-yaml` 解析），消除 key 名不匹配问题
- **`core/user-profile.ts`** — 保留 legacy markdown 解析器作为 fallback
- **`main.ts`** — 新增 `getUserProfileContext()` 和 `getUserProfile()` 方法
- **`ai-analysis-panel.ts`** — 澄清解析 prompt 注入用户档案，LLM 可推断"是同事 → 同公司"
- **`ai-analysis-panel.ts`** — 对话助手 system prompt 注入用户档案
- **`llm-entity-extractor.ts`** — 实体提取 prompt 注入用户档案
- **`core/first-start.ts`** — 首次引导 PROFILE.md 模板改为 frontmatter 格式

### 已知实体识别与处理
- **`main.ts`** — `analyzeBlock` 从 `entityIndex.entries` 加载已有卡片，修复 `existingCards` 永远为空的 bug
- **`main.ts`** — `entry.cardType` 使用 `entry.type`(Wiki type) fallback
- **`ai-analysis-panel.ts`** — 全部已知实体时进入 `review_known` 询问"有新的信息要补充吗？"
- **`ai-analysis-panel.ts`** — `allSessionEntities` 保存全量实体列表，避免队列清空后丢失

### 元数据与属性
- **`ai-analysis-panel.ts`** — `parseClarificationResponse` prompt 修正 Person 属性名：`title` → `role`，`relationship` → `relationship_to_user`
- **`ai-analysis-panel.ts`** — `normalizeAttributes()` 映射 12 种常见 LLM 变体（title/position/job → role，organization → company 等）
- **`ai-analysis-panel.ts`** — `flattenAttributes()` 兜底处理 LLM 嵌套属性（`{person: {company: ...}}` → `{company: ...}`）
- **`ai-analysis-panel.ts`** — 别名处理：LLM 提取别名后自动写入 frontmatter `aliases` 字段，合并去重
- **`main.ts`** — `updateEntity` 增加 `aliases` 字段处理

### 互动记录与双链
- **`main.ts`** — `wikifyContent()` 自动将互动记录中的已知实体名转为 `[[Person/name|name]]` 双链
- **`ai-analysis-panel.ts`** — 互动记录内容 = 完整日记原文（体现共现关系），澄清回答 ≠ 互动记录
- **`storage/markdown-card.ts`** — 删除独立的 `## 关联实体` section，双链改为内联在互动记录中

### 会话持久化与历史回放
- **`ai-analysis-panel.ts`** — `addChatMessage` 自动持久化所有消息（user 和 assistant）到 session JSON
- **`ai-analysis-panel.ts`** — `renderSession` 检查 `session.messages`：有历史 → 回放对话，无历史 → 新分析
- **`ai-analysis-panel.ts`** — `replayingHistory` 标记防止回放时重复写入
- **`ai-analysis-panel.ts`** — `showAgentSession` 新分析时清空 `messages` 数组

### Bug 修复
- **`main.ts`** — `buildAnalysisResultImpl` + `buildAiResponseImpl` 提取为独立函数，修复 `AIProviderAdapter` 调用不存在的 `this.buildAnalysisResult`
- **`main.ts`** — `analyzeBlock` 增加 `blockId` 参数，`analyzeCurrentBlock` 改为调用 `this.aiProvider.analyzeBlock()`
- **`ai-analysis-panel.ts`** — 修复 `'帮'` → `'帞'` 错别字（Unicode 码差 1 位）
- **`ai-analysis-panel.ts`** — 修复"继纭补充" → "继续补充"
- **`ai-analysis-panel.ts`** — 修复全部已知时实体名空白（使用 `allSessionEntities`）
- **`ai-analysis-panel.ts`** — 修复澄清后不创建卡片（去除 `Object.keys().length > 0` 条件）
- **`ai-analysis-panel.ts`** — 修复 `finishClarification` 中 `knownEntities` 被提前清空
- **`storage/markdown-card.ts`** — 修复 `cardTypeToWikiType` 映射 object → `project`

### 近期修复
- **`ai-analysis-panel.ts`** — `parseClarificationResponse` prompt 示例改为具体值，修复 LLM 照抄占位文字 "对用户回答的确认和总结..."
- **`ai-analysis-panel.ts`** — `parseMultiEntityResponse` 新增方法，review_known 多实体合并为一次 LLM 请求
- **`ai-analysis-panel.ts`** — 互动记录内容改为完整日记原文（`currentSessionContent()`）
- **`main.ts`** — `createEntity` 修复：interactions 数组正确存入 `card.attributes`（之前只存了 count）
- **`main.ts`** — `wikifyContent` 双链修复：`(?<!\[\[)` 负向前瞻防嵌套，增加已有嵌套链接清理正则
- **`main.ts`** — `refreshWikilinks` 新增方法，在对话结束时对所有实体一次性回扫建立双链
- **`ai-analysis-panel.ts`** — 已知实体在 `finishClarification` 中写入日记互动记录 + 回扫双链
