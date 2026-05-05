# Changelog

All notable changes to TraceMind will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

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
