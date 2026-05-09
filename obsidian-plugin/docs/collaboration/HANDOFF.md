# Claude Code 任务交接

## 当前任务

Web Clipping Context 1：AI 分析日记 block 时，读取已剪藏网页，生成受控摘要，并作为附加上下文传入实体提取。

## Execution Mode

worker

## Goal

当前附件上传和网页剪藏保存已经完成：日记中的 URL 可经确认剪藏到 `Daily/webclippings/`，并替换成 `![[Daily/webclippings/<file>.md]]`。

本轮补齐用户之前明确要求的下一步：AI 分析日记时，如果当前 block 内容里包含剪藏文件 embed，则读取对应剪藏 Markdown，先生成长度受控的摘要，再把摘要作为附加上下文传给实体提取 LLM。不要把完整剪藏正文直接塞进 prompt。

成功后，用户在日记中写：

```md
今天看了这篇文章：![[Daily/webclippings/2026-05-09-H200供货紧张-a1b2c3d4.md]]
```

AI 分析应能利用剪藏摘要理解网页内容，但日记原文、session 展示和 Vault 文件不应被摘要污染。

## Scope

允许修改：

- `src/views/block-editor.ts`
- `src/main.ts`
- `src/ai/analysis-service.ts`
- `src/ai/llm-entity-extractor.ts`
- `src/storage/web-clippings.ts`
- 可新增 `src/storage/web-clipping-context.ts`
- 可新增/修改相关测试：
  - `tests/storage/web-clippings.test.ts`
  - `tests/storage/web-clipping-context.test.ts`
  - `tests/ai/llm-entity-extractor.test.ts`
  - 必要时新增一个轻量 adapter/helper 测试
- `docs/collaboration/REPORT.md`

只读参考：

- `src/storage/diary-attachments.ts`
- `src/utils/web-clipper.ts`
- `src/utils/opencli-web-clipper.ts`
- `src/views/ai-analysis-panel.ts`
- `src/storage/session-store.ts`

## Non-goals

- 不改附件上传功能。
- 不改网页剪藏抓取流程，不重新设计 OpenCLI。
- 不在 AI prompt 里传完整网页正文。
- 不把 `Daily/webclippings/` 加入必需 Vault 结构检查。
- 不改 Daily/Context Card/Insight 的存储格式。
- 不新增 Settings 配置项。
- 不做网页剪藏文件的后台重摘要、缓存或迁移。
- 不改 release/version。

## Implementation Notes

### 1. 新增可测试的剪藏上下文 helper

建议新增 `src/storage/web-clipping-context.ts`，把纯逻辑和 Obsidian vault 读取分开。

建议纯函数：

```ts
export interface WebClippingContextItem {
  path: string;
  title?: string;
  url?: string;
  summary: string;
}

export function extractWebClippingEmbedPaths(content: string): string[] { ... }

export function summarizeWebClippingMarkdown(markdown: string, maxChars?: number): {
  title?: string;
  url?: string;
  summary: string;
} { ... }

export function buildWebClippingContext(items: WebClippingContextItem[], maxTotalChars?: number): string { ... }
```

要求：

- 只识别 `![[Daily/webclippings/<name>.md]]`。
- 兼容 Obsidian alias：`![[Daily/webclippings/x.md|标题]]`。
- 去重同一个 path。
- 忽略普通 URL、普通 wikilink、附件 embed。
- `summarizeWebClippingMarkdown()` 先去掉 YAML frontmatter，再去掉标题重复、`> Source:` 行，压缩空白。
- 摘要是 deterministic 的受控摘要即可，本轮不要新增第二次 LLM 调用。可以保留前 `maxChars` 字符并在截断时加 `...`。
- 默认单篇摘要建议 800 字符以内，总上下文建议 2000 字符以内。
- 输出格式清晰，例如：

```text
网页剪藏摘要：
1. 标题：...
   来源：...
   摘要：...
```

### 2. 接入 AI 分析入口

当前 `BlockEditorView.startAIAnalysis()` 调用：

```ts
result = await aiProvider.analyzeBlock(block.content, block.id);
```

本轮需要在分析前：

1. 从 `block.content` 提取剪藏 embed path。
2. 用 Obsidian Vault 读取剪藏 Markdown。
3. 对每个剪藏生成摘要。
4. 构建附加上下文。
5. 传给 `aiProvider.analyzeBlock()` 或下游 `AnalysisService.analyzeBlockAsync()`。

建议不要把 `block.content` 改成带摘要的内容，因为：

- UI/session 展示应保持用户真实日记内容。
- `buildAnalysisResultImpl()` 里实体 context snippet 最好仍基于真实日记。
- Daily 文件不能被摘要污染。

可以选择新增参数：

```ts
aiProvider.analyzeBlock(content, blockId, { webClippingContext })
```

并一路传到 `AnalysisService.analyzeBlockAsync()` / `extractEntitiesWithLLM()`。

### 3. Prompt 注入方式

当前 `buildExtractionPrompt(diaryText, profileContext)` 会把 `profileContext` 拼进 prompt。不要把网页摘要伪装成用户档案。

建议扩展为：

```ts
buildExtractionPrompt(diaryText, profileContext?, extraContext?)
```

在“日记文本”之前加入独立章节：

```text
## 附加网页剪藏摘要

以下内容来自用户在日记中引用的网页剪藏，已做摘要。可作为理解日记背景的辅助信息，但实体提取仍以日记文本和用户真实表达为主。

...
```

注意：

- 不要改变 JSON 输出格式要求。
- 不要要求 LLM 提取网页中所有实体；只把网页摘要作为上下文。
- 附加上下文为空时 prompt 应与旧行为基本一致。

### 4. 缺失/读取失败处理

- 如果 embed 指向的剪藏文件不存在或读取失败：跳过该项，不阻断日记保存或 AI 分析。
- 可以 `console.warn`，不要弹大量 Notice。
- 如果所有剪藏都读不到：按原 block content 正常分析。

### 5. REPORT/PLAN 状态

完成后请在 `REPORT.md` 写清：

- 读取哪些 embed。
- 摘要长度控制策略。
- 传入 AI 的位置。
- 缺失文件处理。
- 新增测试与验证结果。

不要修改 `PLAN.md`，Codex 验收后再更新。

## Acceptance Criteria

- 普通父 block 中包含 `![[Daily/webclippings/x.md]]` 时，AI 分析会读取该剪藏并把受控摘要作为附加上下文传入 LLM。
- append mode 子 block 中包含剪藏 embed 时，同样支持。
- 缺失剪藏文件不会阻断 AI 分析。
- 摘要有单篇和总长度上限，不会把完整网页正文传给 LLM。
- 日记正文、block.content、session 展示内容保持原始 embed，不被替换成摘要。
- Prompt 中附加网页摘要是独立章节，不污染用户档案 profile context。
- 没有剪藏 embed 时，旧 prompt/分析行为保持兼容。

## Verification

在 `obsidian-plugin/` 下运行：

```bash
rtk proxy npx tsc --noEmit
rtk npm run lint
rtk proxy npx tsx --test tests/storage/web-clipping-context.test.ts tests/ai/llm-entity-extractor.test.ts
rtk npm test
rtk npm run build
rtk git diff --check
```

如果没有新增 `tests/storage/web-clipping-context.test.ts`，请说明原因，并用等价定向测试覆盖上述 helper 行为。

## Report Back

完成后在 `docs/collaboration/REPORT.md` 写：

- 状态：完成/部分完成/阻塞。
- 修改文件列表。
- 剪藏 embed 提取规则。
- 摘要生成和长度限制。
- AI prompt/analysis 接入点。
- 缺失文件和失败处理。
- Verification 命令和结果。
- 未做事项或后续建议。
