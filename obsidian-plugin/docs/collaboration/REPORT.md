# Claude Code Web Clipping Context 1 报告

## 状态

完成。

## 变更文件

| 文件 | 改动 |
|------|------|
| `src/storage/web-clipping-context.ts` | 新增 — extractWebClippingEmbedPaths / summarizeWebClippingMarkdown / buildWebClippingContext 纯函数 |
| `tests/storage/web-clipping-context.test.ts` | 新增 — 23 个测试覆盖 embed 提取、摘要生成、上下文构建 |
| `src/ai/llm-entity-extractor.ts` | `buildExtractionPrompt()` 新增 `extraContext` 参数；`extractEntitiesWithLLM()` options 新增 `extraContext` 透传 |
| `src/ai/analysis-service.ts` | `analyzeBlockAsync()` 新增 `extraContext` 参数，透传给 `extractEntitiesWithLLM` |
| `src/main.ts` | `analyzeBlock()` 新增 `extraContext` 参数，透传给 `AnalysisService.analyzeBlockAsync()` |
| `src/views/block-editor.ts` | `startAIAnalysis()` 调用前构建剪藏摘要上下文，传给 `analyzeBlock()` |
| `tests/ai/llm-entity-extractor.test.ts` | 新增 5 个 extraContext 测试 |
| `docs/collaboration/REPORT.md` | 本报告 |

## 剪藏 embed 提取规则

- 正则 `![[Daily/webclippings/<name>.md]]`，仅匹配 `Daily/webclippings/` 目录下的 `.md` 文件
- 支持 Obsidian alias 语法：`![[Daily/webclippings/x.md|标题]]`
- 自动去重同一路径
- 忽略普通 URL、`[[wikilink]]`、`![[Daily/attachments/*]]` 和其他目录 embed
- 无匹配 embed 时保持旧行为

## 摘要生成和长度限制

- `summarizeWebClippingMarkdown()`: 剥离 YAML frontmatter → 提取 title/url → 去掉 `# Title` 标题重复 → 去掉 `> Source:` 行 → 折叠多余空行 → 截断到 maxChars
- 默认单篇 maxChars = 800，总上下文 maxTotalChars = 2000
- 截断时优先在句末（`。.！？`）或词边界断开，末尾追加 `...`
- 纯 deterministic 算法，不调用 LLM

## AI 接入点

```
block-editor.ts: startAIAnalysis()
  → extractWebClippingEmbedPaths(block.content)
  → vault.read() 每个剪藏文件
  → summarizeWebClippingMarkdown() 每篇
  → buildWebClippingContext() 整并
  → aiProvider.analyzeBlock(content, blockId, extraContext)
    → main.ts: analyzeBlock(content, blockId, extraContext)
      → AnalysisService.analyzeBlockAsync(content, ..., extraContext)
        → extractEntitiesWithLLM(diaryText, { extraContext })
          → buildExtractionPrompt(diaryText, profileContext, extraContext)
```

附加上下文在 prompt 中作为独立 `## 附加网页剪藏摘要` 章节出现，位于 profile context 和日记文本之前，不污染用户档案或日记原文。

## 缺失文件和失败处理

- 剪藏文件不存在 → `console.warn`，跳过该项
- 读取异常 → `console.warn` + error message，跳过该项
- 所有剪藏都读不到 → 按原 block content 正常分析（extraContext = undefined）
- 不弹 Notice，不阻断分析

## 新增测试（28 pass）

### web-clipping-context.test.ts（23 tests）
- embed 提取：单路径、alias、去重、多路径、忽略 URL/wikilink/attachment/其他目录、无 embed、空输入
- 摘要生成：frontmatter 提取 title/url、去除标题重复和 Source 行、超长截断（含 ...）、短文不截断、无 frontmatter、空行折叠、YAML 引号值、空内容
- 上下文构建：格式化、空 items、总长度上限、编号、无标题

### llm-entity-extractor.test.ts（新增 5 tests）
- extraContext 注入、不提供时无影响（向后兼容）、位置在 profileContext 之前、空字符串不影响 prompt 结构

## 验证

```bash
rtk proxy npx tsc --noEmit    # 0 errors
rtk npm run lint               # 0 errors / 0 warnings
rtk npm test                   # all passing (0 failures)
rtk npm run build              # OK
rtk git diff --check           # clean
```

## 未做

- 不做网页剪藏文件的后台重摘要、缓存或迁移（Non-goal）
- 不新增 Settings 配置项（Non-goal）
- 当前默认 maxChars / maxTotalChars 硬编码，后续可考虑在 `wrapConfig` 中暴露
