# TraceMind Obsidian 插件计划

## 当前里程碑

完善现有 Obsidian 插件功能，先建立质量基线，再按失败点和用户体验痛点修复。

不启动探索模式开发。

## 当前优先级

1. 修正安装和首次启动初始化边界：安装脚本只安装插件，插件首次启动负责 Vault 业务目录创建和校验。
2. 建立 entity subtype metadata 的统一 schema，解决 object/theme subtype 元数据、成熟度和追问逻辑不一致。
3. 建立当前工程的验证基线：测试、构建、安装结构。
4. 梳理核心功能缺口：日记解析、AI 分析、确认流、Context Card、Entity Index、Insight、设置页。
5. 优先修复会导致构建失败、测试失败、数据损坏或用户无法配置 AI 的问题。
6. 再处理 UI 文案、错误提示和交互 polish。

## 任务队列

| 状态 | 任务 | 负责人 | 备注 |
| --- | --- | --- | --- |
| done | 在 `obsidian-plugin/` 初始化协作文档 | Codex | 当前文档集 |
| done | 修正安装脚本、首次启动初始化和 Windows 安装说明 | Claude Code | Codex 已验收 |
| done | Entity subtype metadata Phase 1：建立 schema 唯一来源 | Claude Code | Codex 已验收；保留 Phase 2 前置整改项 |
| done | Entity subtype metadata Phase 2A：schema 字段安全 + maturity 支持 subtype | Claude Code | Codex 已验收；仅剩 priority seed score 既有失败 |
| done | Entity subtype metadata Phase 2B：knowledge gap 支持 subtype | Claude Code | Codex 已验收；仅剩 priority seed score 既有失败 |
| done | Entity subtype metadata Phase 3：AI prompt/clarification 跟随 schema | Claude Code | Codex 已验收；仅剩 priority seed score 既有失败 |
| done | Entity subtype metadata Phase 4：Markdown 展示和索引增强 | Claude Code | Codex 已验收；REPORT 文案可下轮顺手修 |
| done | Entity subtype metadata Phase 5A：旧字段 alias normalize 兼容层 | Claude Code | Codex 已验收 |
| done | Entity subtype metadata Phase 5B：Priority Score 修复并接入 subtype schema | Claude Code | Codex 已验收；Subtype metadata 主线完成 |
| done | 建立插件验证基线并报告失败项 | Claude Code | Codex 已验收；test/build/version/install 绿，lint 缺 ESLint |
| done | 修复 lint 工具链，让 `npm run lint` 可运行 | Claude Code | Codex 已验收；0 errors / 27 warnings |
| done | 清理当前 27 个 lint warnings | Claude Code | Codex 已验收；lint 0 errors / 0 warnings |
| done | 根据验证报告修复构建或测试失败 | Claude Code | test/build/lint 工具链均可运行 |
| done | Provider 配置和错误提示审计 | Claude Code | Codex 已验收；关键问题是 provider type 硬编码、校验未统一、LLM extractor 绕过抽象 |
| done | Provider Fix 1：显式 providerType 并透传主要调用点 | Claude Code | Codex 已验收；review fix 已清 |
| done | Provider Fix 2：统一 validateConfig 和错误提示脱敏 | Claude Code | Codex 已验收；HTTP error 安全摘要和定向测试已补齐 |
| done | Provider Fix 3：LLM entity extractor 接入 provider 抽象 | Claude Code | Codex 已验收；OpenAI/Anthropic/Ollama 定向测试和全量测试通过 |
| done | Vault Reliability Fix 1：Context Card / Daily Insight 写入可靠性 | Claude Code | Codex 已验收；剩余 adapter existing-file 测试为 P3 后续债务 |
| closed | 旧 theme subtype 一次性迁移脚本 | Codex | 用户确认真实 Vault 无需迁移，不再继续投入 |
| done | Settings、AI Panel、Calendar 体验缺口审计 | Claude Code | Codex 已验收；优先做低风险 UX 快修 |
| done | UX Fix 1：AI Panel 快速反馈 + 设置页测试错误提示 | Claude Code | Codex 已验收；send loading、隐藏 mode select、设置页错误提示均完成 |
| done | UX Fix 2：Settings Provider 编辑能力 | Claude Code | Codex 已验收；已有 provider 可编辑保存，空必填字段保存已阻止 |
| done | Provider Fix 4：接入 enableThinking / reasoningEffort 到真实请求体 | Claude Code | Codex 已验收；request body、streaming、Settings 测试连接和 LLM extraction 透传均完成 |
| done | Calendar UX Fix 1：日历交互反馈、可访问性和渲染性能小修 | Claude Code | Codex 已验收；日期 title/aria/键盘触发、导航提示、批量日记状态和 helper 测试均完成 |
| handoff | Release Prep Audit 1：版本整理与发布准备审计修复 | Claude Code | HANDOFF 已更新；只做版本/安装/release artifact/ignore/报告整理，不改功能逻辑 |

## 推荐修复顺序

1. 先处理安装脚本和首次启动初始化边界，避免新用户安装路径继续分叉。
2. 再处理 entity subtype metadata，因为它直接影响实体分析、成熟度、追问和洞察。
3. 再建立构建、测试、lint、安装结构验证基线。
4. 再处理 AI provider 配置、响应解析和错误提示。
5. 再处理会破坏 Vault 数据或格式的存储问题，包括洞察报告重生成策略。
6. 最后处理 UI polish 和文案。

## 小 Bug 处理规则

- 很小、局部、低风险的 bug 可由 Claude Code 直接修复，并在 `REPORT.md` 记录变更和验证。
- 如果修改超过 2-3 个文件，或涉及 Vault 写入、AI、存储格式、配置迁移、release/安装结构，先由 Codex 写 `HANDOFF.md`。
- 如果 bug 原因不清楚，Codex 先诊断定位，再决定是否交给 Claude Code。
- 如果涉及产品预期或交互取舍，先由用户和 Codex 确认行为。

## 验证基线

```bash
rtk npm test
rtk npm run build
rtk npm run lint
rtk git diff --check
```

如果某个命令由于缺少配置或依赖无法运行，先在 `REPORT.md` 记录，不要自行扩大范围修复。

## 决策记录

| 日期 | 决策 | 原因 | 来源 |
| --- | --- | --- | --- |
| 2026-05-06 | 当前阶段不启动探索模式开发 | 用户明确要求继续完善现有插件 | 用户消息 |
| 2026-05-06 | 协作文档建立在 `obsidian-plugin/` 目录内 | 插件工程是当前开发主体 | 用户消息 |
| 2026-05-06 | 第一张 Claude Code 任务卡只做验证基线 | 先知道当前工程真实状态，再决定修复顺序 | Codex |
| 2026-05-06 | 安装脚本不再创建 TraceMind 业务目录 | 首次启动插件已有初始化向导，应在插件内强化并校验 | 用户消息 |
| 2026-05-06 | macOS 安装脚本需要更强环境检查并可辅助安装 Obsidian | 降低非技术用户安装门槛 | 用户消息 |
| 2026-05-06 | Windows 先提供安装说明，本地 Agent 标记实验性 | Windows 核心插件安装优先，Agent CLI 跨平台后续验证 | 用户消息 |
| 2026-05-06 | subtype metadata 分阶段实施，先统一 schema 来源 | object/theme 的 subtype 已影响分析和洞察，且一次性修改风险过大 | 用户消息 + Codex 评估 |
| 2026-05-07 | Entity subtype metadata Phase 1 验收通过 | schema 唯一来源已建立，定向测试和 build 通过；字段命名冲突作为 Phase 2A 前置整改 | Codex review |
| 2026-05-07 | Phase 2 拆成 2A maturity 和 2B knowledge gap | 降低单轮改动风险，避免 maturity、gap、AI prompt、storage 同时扩散 | Codex |
| 2026-05-07 | Entity subtype metadata Phase 2A 验收通过 | reserved key guard、字段 alias、subtype-aware maturity 已完成；`ATTRIBUTE_PRIORITY` 兼容出口已修复 | Codex review |
| 2026-05-07 | Entity subtype metadata Phase 2B 验收通过 | knowledge gap 已按 subtype schema 和 alias 工作；未改 priority score、AI prompt、storage | Codex review |
| 2026-05-07 | Entity subtype metadata Phase 3 验收通过 | AI extraction/clarification/chat/local agent prompt 已跟随 schema，subtype 已传到 clarification parser | Codex review |
| 2026-05-07 | Entity subtype metadata Phase 4 验收通过 | Markdown 基本信息和 Entity Index 已按 subtype 增强；旧 `status` roundtrip 和 metadata 丢失问题已修复 | Codex review |
| 2026-05-07 | Entity subtype metadata Phase 5A 验收通过 | 旧字段 alias normalize 兼容层已建立；storage reserved alias 污染问题已修复 | Codex review |
| 2026-05-07 | Entity subtype metadata Phase 5B 验收通过 | priority score 已移除空属性 seed score，并接入 subtype schema 与 normalize；定向回归通过 | Codex review |
| 2026-05-07 | 验证基线通过，除 lint 工具链外 | `npm test` 314/314、build、版本同步、安装结构均通过；lint 因未安装 ESLint 失败 | Claude REPORT + Codex review |
| 2026-05-07 | ESLint 工具链验收通过 | `npm run lint` 已可运行且 exit code 为 0；剩余 27 个 warning 作为独立小任务清理 | Codex review |
| 2026-05-07 | ESLint warning 清理验收通过 | `npm run lint` 已达到 0 errors / 0 warnings，test/build/diff check 均通过 | Codex review |
| 2026-05-07 | 旧 theme subtype 不再作为长期兼容目标 | 产品尚未对外提供服务，Vault 中只有少量历史档案，可用一次性脚本修复旧 subtype | 用户决策 |
| 2026-05-07 | 本地 Agent provider 维持 experimental | 先不纳入主线稳定性修复，只确保不干扰常规 AI provider 流程；Windows 本地 agent 继续实验性 | 用户决策 |
| 2026-05-07 | Provider 配置和错误提示进入下一优先级 | 用户确认 provider 可以处理，先做审计再拆修复任务 | 用户决策 |
| 2026-05-07 | 写入可靠性必须处理，并纳入 Insight 报告覆盖策略 | 用户确认可靠性要做，并要求确认当天多次生成洞察报告时新报告是否覆盖旧报告 | 用户决策 |
| 2026-05-07 | AI 洞察报告同日重生成维持覆盖策略 | 用户明确选择新报告覆盖旧报告，不保留历史版本、不自动备份 | 用户决策 |
| 2026-05-07 | Provider 审计验收通过 | 确认 provider type 多处硬编码为 `openai`、`validateConfig()` 未统一调用、`llm-entity-extractor` 绕过 provider 抽象、错误体未脱敏 | Codex review |
| 2026-05-07 | Provider Fix 1 验收通过 | `providerType` 已进入 settings，设置页和主要调用点已透传真实 provider type；定向测试、lint、build、diff check 通过 | Codex review |
| 2026-05-07 | Provider Fix 2 验收通过 | `chat()`/`streamChat()` 已统一校验配置，Ollama 可无 API key，HTTP error 已做截断和 secret 掩码；provider-config 定向测试、lint、build、diff check 通过 | Codex review |
| 2026-05-07 | Provider Fix 3 验收通过 | LLM entity extractor 已复用 `buildRequest()`、`parseResponse()`、`createProviderHttpError()` 和 `validateConfig()`；Ollama 无 API key 不再被分析入口跳过，Anthropic/Ollama 回归测试已补齐 | Codex review |
| 2026-05-07 | Vault Reliability Fix 1 验收通过 | Context Card rename 已改为先写新文件再删旧文件，Insight 保存抽出生产 helper 并保持同日覆盖；Entity Index 持久化仅审计不实现 | Codex review |
| 2026-05-07 | 旧 theme subtype 迁移任务关闭 | 真实 Vault dry-run 显示无旧 subtype 需要迁移，用户要求不再在一次性迁移脚本上投入时间 | 用户决策 + Codex review |
| 2026-05-07 | UX Audit 1 验收通过 | Settings、AI Panel、Calendar 已完成只读审计；后续先做低风险反馈类修复，再处理 provider 编辑和 enableThinking 接入 | Codex review |
| 2026-05-07 | UX Fix 1 验收通过 | AI Panel 发送按钮已补加载/禁用反馈，隐藏模式选择已移除，设置页测试连接错误提示已抽 helper 并覆盖测试 | Codex review |
| 2026-05-07 | UX Fix 2 进入交接 | Settings 当前能添加/删除/测试 provider，但不能编辑已有 provider；先补配置闭环，`enableThinking` 请求体接入继续独立处理 | Codex |
| 2026-05-07 | UX Fix 2 验收通过 | Provider 编辑已支持 draft 保存/取消，default/mapping 删除行为保持，空 name/model/baseUrl 保存已被阻止；lint、定向测试、全量测试、build、diff check 均通过 | Codex review |
| 2026-05-07 | Provider Fix 4 进入交接 | Settings 已暴露 `enableThinking` 和 `reasoningEffort`，但真实 AI 请求体尚未使用；本轮补齐 request body 和调用点透传 | Codex |
| 2026-05-07 | Provider Fix 4 验收通过 | OpenAI-compatible `reasoning_effort`、Anthropic `thinking`、streaming 保留字段、Settings 测试连接和 LLM extraction 透传均完成；lint、定向测试、全量测试、build、diff check 通过 | Codex review |
| 2026-05-07 | Calendar UX Fix 1 进入交接 | Calendar 当前能显示月历和日记标记，但缺少 title/aria/键盘操作，且日期渲染逐格查询日记状态；本轮做低风险 UX 和 helper 测试 | Codex |
| 2026-05-07 | Calendar UX Fix 1 验收通过 | 日期格 title/aria/键盘触发、导航提示、批量 diary date state 和 helper 测试已完成；根 class/style 已对齐 | Codex review |
| 2026-05-07 | Release Prep Audit 1 进入交接 | 当前版本号一致且 lint/test/build 通过，但 install fallback 仍有旧 `1.4.2`，ignore 规则未覆盖本地产物，release artifact/版本一致性需要测试固化 | Codex |
| 2026-05-07 | 发布仓库边界确认 | 私有 `github.com/d19310/TraceMind` 可放源码和构建产物；公开 `github.com/d19310/tracemind-releases` 只放构建产物供用户下载 | 用户决策 |

## 开放问题

- 下一步先完成 Release Prep Audit 1；之后再处理 local agent 稳定化或正式发布打包。
