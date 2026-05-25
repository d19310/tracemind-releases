# TraceMind

TraceMind 是一个 Obsidian 插件，用于把日记、实体档案和 AI 辅助思考结合起来。2.1.0 版本继续完善「思考探索」模式：用户可以从日记 block 进入探索白板，让本地 Agent 基于选中的内容展开破题拷问、头脑风暴、思维导图、决策树、用户地图、RISE 战略分析等思考增强。

## 主要功能

- 日记主视图：以 block 方式记录每日想法、工作线索和待分析内容。
- AI 分析：从日记中提取 Person、Object、Theme 实体，并沉淀为 Obsidian Markdown 档案。
- 实体索引：在 `TraceMind/index/entity-index.json` 中维护实体索引，便于插件和本地 Agent 检索。
- 思考探索：选择一条或多条日记进入探索白板，以 block 和连线组织思考过程。
- 本地 Agent：探索模式支持 Codex、Claude Code、Hermes、OpenCode 等本地 CLI Agent。
- 成果输出：探索白板可生成 output block，并将总结导出到 `outputs/`。

## 2.1.0 新增

- 新增思维导图和 RISE 战略分析，扩展发散思考与战略分析场景。
- 优化探索白板性能：拖拽 block、平移白板、滚轮缩放在大白板中更流畅。
- 支持多个沉淀成果 block 再次沉淀为更高层成果，并向上追溯完整思考链路。
- 支持删除撤回、长内容悬浮预览、嵌套成果总结等白板操作增强。
- 修复选择/平移模式切换、滚轮 passive listener 控制台报错、block 意外拖动等交互问题。

## 2.0.0 新增

- 从日记视图点击「思考探索」进入白板。
- 支持 `explorations/*.canvas` 历史探索白板。
- 支持破题拷问、头脑风暴、决策树、用户地图四类思考方法。
- 支持 source block、material block、thinking block、reply block、output block 等 block 类型。
- 支持材料引用、记忆检索、分组操作、多 run 泳道布局、block 连线和成果总结。
- 支持 OpenCode 作为探索模式本地 Agent。

## 安装

macOS 用户可以使用公开 release 仓库中的安装脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/d19310/tracemind-releases/main/install.sh | bash
```

安装脚本会下载 `v2.1.0` 的 release 产物，并安装到你指定的 Obsidian vault：

```text
{VAULT}/.obsidian/plugins/tracemind/
```

手动安装时，请从公开 release 下载并复制以下文件：

- `main.js`
- `manifest.json`
- `styles.css`
- `main.css`

## 探索模式准备

在 TraceMind 设置中开启「探索模式」，并检测本地 Agent。第一版建议至少安装一种本地 Agent：

- Codex CLI
- Claude Code
- Hermes
- OpenCode

探索模式只用于白板思考工作流；右侧 AI 分析栏仍使用 TraceMind 自己配置的 LLM Provider。

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
