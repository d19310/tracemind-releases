# TraceMind

TraceMind 是一个 Obsidian 插件，用于把日记、实体档案和 AI 辅助思考结合起来。2.1.6 版本继续完善「思考探索」能力，并修复右侧 AI 聊天模式中周报总结可能露出 action JSON 的问题。

## 主要功能

- 日记主视图：以 block 方式记录每日想法、工作线索和待分析内容。
- AI 分析：从日记中提取 Person、Object、Theme 实体，并沉淀为 Obsidian Markdown 档案。
- 实体索引：在 `TraceMind/index/entity-index.json` 中维护实体索引，便于插件和本地 Agent 检索。
- 思考探索：选择一条或多条日记进入思考探索白板，以 block 和连线组织思考过程。
- 本地 Agent：思考探索支持 Codex、Claude Code、Hermes、OpenCode、Pi Agent 等本地 CLI Agent。
- 成果输出：思考探索白板可生成 output block，并将总结导出到 `outputs/`。

## 2.1.6 修复

- AI 聊天 action 容错：当 LLM 省略 `[TRACEMIND_ACTION]` 标签、直接输出 `get_diary` 等 JSON action 时，TraceMind 会自动识别并执行，不再把 JSON 暴露给用户。
- 周报/月报提示优化：跨日期总结时引导 LLM 一次性请求所需日记，提升周报生成的连贯性。

## 2.1.5 新增

- 外部材料上下文：思考探索执行破题拷问、头脑风暴、思维导图、决策树、用户地图、RISE、成果总结和回复分析时，会识别 block 中的网页链接、Obsidian 链接、vault 文件路径和本地文件路径，并提示本地 Agent 主动读取/解析。
- 失败兜底：如果本地 Agent 无法访问或解析网页、附件、本地文件，会被要求在输出中说明失败原因，避免臆造无法读取的材料内容。

## 2.1.0 新增

- 新增思维导图和 RISE 战略分析，扩展发散思考与战略分析场景。
- 优化思考探索白板性能：拖拽 block、平移白板、滚轮缩放在大白板中更流畅。
- 支持多个沉淀成果 block 再次沉淀为更高层成果，并向上追溯完整思考链路。
- 支持删除撤回、长内容悬浮预览、嵌套成果总结等白板操作增强。
- 修复选择/平移模式切换、滚轮 passive listener 控制台报错、block 意外拖动等交互问题。

## 2.0.0 新增

- 从日记视图点击「思考探索」进入白板。
- 支持 `explorations/*.canvas` 思考探索记录。
- 支持破题拷问、头脑风暴、决策树、用户地图四类思考方法。
- 支持 source block、material block、thinking block、reply block、output block 等 block 类型。
- 支持材料引用、记忆检索、分组操作、多 run 泳道布局、block 连线和成果总结。
- 支持 OpenCode 作为思考探索本地 Agent。

## 安装

macOS 用户可以使用公开 release 仓库中的安装脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/d19310/tracemind-releases/main/install.sh | bash
```

安装脚本会下载 `v2.1.6` 的 release 产物，并安装到你指定的 Obsidian vault：

```text
{VAULT}/.obsidian/plugins/tracemind/
```

手动安装时，请从公开 release 下载并复制以下文件：

- `main.js`
- `manifest.json`
- `styles.css`
- `main.css`

## 思考探索准备

在 TraceMind 设置中开启「思考探索」，并检测本地 Agent。第一版建议至少安装一种本地 Agent：

- Codex CLI
- Claude Code
- Hermes
- OpenCode
- Pi Agent

思考探索只用于白板思考工作流；右侧 AI 分析栏仍使用 TraceMind 自己配置的 LLM Provider。

## Vault 目录

TraceMind 会使用以下目录：

```text
Daily/
Person/
Object/
Theme/
TraceMind/
  PROFILE.md
  index/entity-index.json
  sessions/
  insights/
explorations/
outputs/
```

更多外部 Agent 读写 Vault 的约定见 [VAULT_GUIDE.md](./VAULT_GUIDE.md)。

## 开发

```bash
npm install
npm run build
npx tsc --noEmit
npm test
```

构建后生成的 Obsidian 插件文件位于项目根目录：

- `main.js`
- `manifest.json`
- `styles.css`
- `main.css`
