# Changelog

All notable changes to TraceMind will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

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
