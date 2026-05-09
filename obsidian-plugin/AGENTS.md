# TraceMind Obsidian 插件协作入口

@/Users/vincent/.codex/RTK.md

本目录是 TraceMind Obsidian 插件工程根目录。当前阶段优先完善现有 Obsidian 插件功能，不启动探索模式开发。

## 协作文档

- 产品需求：[docs/collaboration/PRD.md](/Users/vincent/Documents/TraceMind/obsidian-plugin/docs/collaboration/PRD.md)
- 技术架构：[docs/collaboration/ARCHITECTURE.md](/Users/vincent/Documents/TraceMind/obsidian-plugin/docs/collaboration/ARCHITECTURE.md)
- 项目计划：[docs/collaboration/PLAN.md](/Users/vincent/Documents/TraceMind/obsidian-plugin/docs/collaboration/PLAN.md)
- Claude Code 当前任务：[docs/collaboration/HANDOFF.md](/Users/vincent/Documents/TraceMind/obsidian-plugin/docs/collaboration/HANDOFF.md)
- Claude Code 实现报告：[docs/collaboration/REPORT.md](/Users/vincent/Documents/TraceMind/obsidian-plugin/docs/collaboration/REPORT.md)

## 角色边界

- Codex：维护协作文档，拆解任务卡，review Claude Code 的报告和 diff。
- Claude Code：只实现 `docs/collaboration/HANDOFF.md` 中的当前任务，并把结果写入 `docs/collaboration/REPORT.md`。
- 用户：决定产品取舍、优先级和是否扩大范围。

## 省 Token 协作模式

默认采用“Codex 定边界 + worker 实现 + Codex 验收”的模式，但按任务大小分流：

- 小任务由 Codex 直接处理：单文件或 1-2 个文件的小修、文案、局部测试补充、明确边界条件。
- 中等任务交给 worker：目标明确、范围窄、验收标准清楚，适合实现、补测试、局部调试。
- 大任务先拆分：涉及 AI、Vault 写入、存储格式、Entity Index、Context Card、Insight、设置迁移或 release 的任务，必须拆成小的垂直切片。

worker 任务卡必须保持窄边界：

- `HANDOFF.md` 只保留一个当前任务。
- 写清 `Execution Mode`、`Goal`、`Scope`、`Non-goals`、`Implementation Notes`、`Acceptance Criteria`、`Verification`、`Report Back`。
- `Scope` 要列出允许修改文件；必要时列出 forbidden paths，尤其是 `main.js`、版本文件、release 产物和真实 Vault。
- 不让 worker 自行扩产品范围；未在任务卡中的新功能一律不做。

worker 调用策略：

- 首次 worker 优先低成本模式：`auto` / `fast_patch` / `scaffold_or_tests`。
- 如果首次失败、checks 失败、diff 偏离任务、报告显示上下文不足，第二次必须升级到 `deepseek-v4-pro[1m]` 对应的 `debug_loop` / `agentic_coding` / `complex_reasoning` / `long_context_codebase`。
- 升级任务必须带上上一轮 `job_id`、终态、失败原因、checks 结果、当前 diff 摘要和新增约束，避免重复探索。
- 同一个任务不要同时启动两个 worker；等上一轮终态后再决定是否升级或接管。
- worker 运行中只看 compact status；不要拉完整日志、events 或大 diff，除非需要诊断失败。

Codex 验收策略：

- `REPORT.md` 是证据，不是结论；Codex 必须 review diff、跑必要 checks，再决定验收。
- 优先看 changed files、diff stat、关键生产路径、定向测试和 checks 结果；避免重复读完整代码库。
- 对小缺口，Codex 可直接补丁收尾；对明显偏离或大范围失败，再开 follow-up worker。
- 验收后由 Codex 更新 `PLAN.md` 状态和决策记录。

## 小 Bug 快速通道

Claude Code 可以直接修复很小、局部、低风险的 bug，例如文案错字、明显按钮状态错误、纯函数边界条件或测试已经精确暴露的问题。

满足任一条件时，必须先由 Codex 诊断并更新 `docs/collaboration/HANDOFF.md`：

- 修改预计超过 2-3 个文件。
- 涉及 Vault 写入、Markdown/JSON 文件格式、设置迁移或 release/安装结构。
- 涉及 AI provider、AI 输出解析、实体抽取、Context Card、Entity Index、Session 或 Insight。
- 预期行为不清楚，需要产品取舍。
- bug 原因不清楚，需要先定位。

走快速通道时，Claude Code 仍需更新 `docs/collaboration/REPORT.md`，写明变更、验证和风险。

## 命令规则

所有 shell 命令必须使用 `rtk` 前缀：

```bash
rtk npm test
rtk npm run build
rtk npm run lint
rtk git diff --check
```

## 变更安全

- 不要回滚无关用户改动。
- 不要无任务卡修改 `TraceMindVault/` 示例数据、release 脚本或包元数据。
- 不要把探索模式、白板或 Agent Action 当作当前默认开发方向。
- 新增逻辑优先补测试；触及共享解析、存储或 AI 输出契约时必须补测试。
