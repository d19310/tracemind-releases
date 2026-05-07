# TraceMind Obsidian 插件 PRD

## 问题

用户在 Obsidian 中持续记录日记，但其中的人、事、项目、主题和反复出现的问题容易散落在每日笔记里。TraceMind 的目标是把这些日记 block 转换成可分析、可确认、可沉淀的个人知识结构。

## 目标用户

- 主要用户：在 Obsidian 中写日记、复盘和项目记录，并希望长期追踪关系与主题的人。
- 次要用户：希望用 AI 辅助整理个人 Vault，但仍要求写入行为可控、可追溯的人。

## 当前产品目标

完善现有 Obsidian 插件能力，使用户可以稳定完成：

1. 在 Daily note 中记录日记 block。
2. 让 TraceMind 解析 block 并生成稳定 id。
3. 通过 AI provider 提取实体和洞察。
4. 对待确认实体进行确认或跳过。
5. 生成和更新 Person/Object/Theme Context Cards。
6. 维护 Entity Index、Session 和 Daily Insight。
7. 在 Block Editor、AI Analysis Panel、Calendar 和 Settings 中完成核心操作。

## 暂不做

- 不启动探索模式或白板开发。
- 不新增多 Agent 协作功能。
- 不让 AI provider 或本地 Agent 直接自由修改 Vault 文件。
- 不做独立桌面 app。

## 用户故事

- 作为日记用户，我希望插件能识别当天记录中的人、物和主题，从而减少手工整理。
- 作为复盘用户，我希望看到实体 Context Card 的成熟度和历史关联，从而理解某个对象为什么重要。
- 作为 Obsidian 用户，我希望 AI 结果需要确认后再写入关键知识结构，从而保持 Vault 可信。
- 作为插件用户，我希望设置页能清楚配置 provider、模型和分析偏好，从而避免分析失败时无从排查。

## 必须有

- 稳定的日记 block 解析、格式化和 block id 校验。
- AI provider 配置校验、请求构造、响应解析和流式输出处理。
- 实体抽取、实体数量限制、实体类型和 subtype 规则。
- Context Card markdown 读写。
- Entity Index 构建、搜索、更新和解析。
- Session/Insight 存储。
- Settings、Block Editor、AI Analysis Panel、Calendar 的基础可用性。
- 自动化测试覆盖核心解析、存储、AI 配置和确认流。

## 应该有

- 更清晰的错误提示和 Notice 文案。
- 构建和安装结构的一致性检查。
- 首次启动向导必须引导用户创建并校验 TraceMind 所需 Vault 目录，用户不能在目录结构缺失时误以为插件已完成初始化。
- macOS 安装脚本应只负责安装插件文件、检查运行环境和辅助安装 Obsidian，不再创建 TraceMind Vault 内容目录。
- Windows 用户应有明确的手动安装说明；Windows 本地 Agent 集成可先标记为实验性。
- 对 Obsidian mock 与真实插件环境差异的测试补强。
- 更稳健的 provider registry 和模型配置 UX。
- 更好的 daily insight 重算、缓存和失败恢复。

## 以后再说

- 探索白板。
- Agent Action 协议。
- 复杂外部调研。
- 多 Agent 工作流。
- 独立 app。

## 成功标准

- `rtk npm test` 和 `rtk npm run build` 可稳定通过。
- 用户能完成从日记 block 到实体卡片的核心闭环。
- AI 分析失败时有可理解的错误提示，不破坏已有 Vault 数据。
- 关键存储文件格式有测试保护。
- release 安装结构与 `manifest.json`、`package.json` 保持一致。
- 新用户首次启用插件时，必须能通过插件内向导创建并校验完整目录结构。
- macOS 和 Windows 用户都能根据文档把 release 产物安装到 Obsidian Vault 的插件目录。

## 开放问题

- `package.json` version 与 `manifest.json` version 是否需要在构建或测试中强制一致？
- 当前自动分析是禁用状态，是否需要设置项明确展示这个行为？
- 本地 Agent provider 在现有聊天面板中是否属于当前完善范围，还是先冻结？
