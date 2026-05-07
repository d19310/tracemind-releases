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
