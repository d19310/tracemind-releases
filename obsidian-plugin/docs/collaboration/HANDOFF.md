# Claude Code 任务交接

## 当前任务

Release 1.5.5：发布微信剪藏 CORS 热修。

## Execution Mode

worker

## Goal

用户测试 v1.5.4 时发现微信公众号链接剪藏触发 Obsidian renderer CORS：

```text
Access to fetch at 'https://mp.weixin.qq.com/s/TOpMo4OTHuhn7q2bbQqyUw'
from origin 'app://obsidian.md' has been blocked by CORS policy
```

Codex 已经完成热修草稿：微信文章不再 fallback 到 renderer `fetch()`，只允许通过 OpenCLI 路径剪藏；OpenCLI 失败时保留原链接并提示失败。

本轮请 Claude Code 做发布收尾：检查当前改动、补必要版本/发布文件、提交、打 `v1.5.5` tag，推送私有源代码仓库和公开 release 仓库，并创建 GitHub Release。

## Scope

允许修改：

- `src/utils/web-clipper.ts`
- `tests/storage/web-clippings.test.ts`
- `main.js`
- `manifest.json`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`
- `docs/collaboration/REPORT.md`
- 必要的本地 release artifact 目录，例如 `dist/releases/`

允许执行：

- 构建、测试、打包、git commit/tag/push
- GitHub release 创建/更新

## Non-goals

- 不重做网页剪藏整体方案。
- 不新增浏览器端代理、不引入后端服务。
- 不改 OpenCLI 调用协议，除非发现当前命令明显不可用且需要最小修正。
- 不改附件上传、AI 上下文摘要、entity index、settings 等无关模块。
- 不把 `dist/` 整体提交到 git，release artifact 可以本地生成并上传。
- 不发布缺少构建资产的 release。

## Current Diff Context

Codex 已做的热修草稿：

- `clipWebpage()` 遇到 `mp.weixin.qq.com/s/...` 时返回错误，不再调用 `fetchWebpage()`。
- 新增测试确保微信文章不会调用 `globalThis.fetch`。
- 已重新 production build 更新 `main.js`。

当前验证已通过：

```bash
rtk proxy npx tsx --test tests/storage/web-clippings.test.ts tests/utils/opencli-web-clipper.test.ts
rtk proxy npx tsc --noEmit
rtk npm run build
rtk git diff --check
```

请仍然重新运行完整发布前检查，不要只信任这份上下文。

## Implementation Notes

### 1. 版本同步

把插件版本从 `1.5.4` 升到 `1.5.5`：

- `manifest.json`
- `package.json`
- `package-lock.json` 顶层 version
- `package-lock.json.packages[""].version`

### 2. Changelog

在 `CHANGELOG.md` 顶部新增：

```md
## [1.5.5] - 2026-05-09

### Fixed
- **微信公众号剪藏 CORS** — OpenCLI 失败后不再 fallback 到 Obsidian renderer fetch，避免 `app://obsidian.md` 跨域错误；失败时保留原链接。
```

### 3. 构建资产

运行 production build 后，GitHub Release 必须上传：

- `main.js`
- `manifest.json`
- `tracemind-1.5.5.zip`
- 如果仓库存在 `styles.css`，也必须上传；当前没有则报告“无 styles.css”。

zip 内容应至少包含：

- `main.js`
- `manifest.json`
- 可选 `styles.css`

建议本地路径：

```text
dist/releases/tracemind-1.5.5/
dist/releases/tracemind-1.5.5.zip
```

### 4. Git / GitHub

当前仓库有两个远端：

- `origin`：私有源码仓库 `github.com/d19310/TraceMind`
- `public`：公开发布仓库 `github.com/d19310/tracemind-releases`

发布流程：

1. 确认工作区只有本任务相关改动和本地未跟踪 `dist/`。
2. 提交源码和构建产物 `main.js`，但不要提交 `dist/`。
3. 创建 annotated tag `v1.5.5`。
4. 推送 `main` 和 `v1.5.5` 到 `origin`。
5. 推送 `main` 和 `v1.5.5` 到 `public`。
6. 在 `d19310/tracemind-releases` 创建 GitHub Release `v1.5.5`，上传上述 assets。
7. 用 `gh release view v1.5.5 --repo d19310/tracemind-releases --json tagName,url,assets,isDraft,isPrerelease` 或等价命令确认 assets 列表。

如果 release 已存在，请用 `gh release upload --clobber` 补齐资产，不要留下缺 asset 的 release。

## Acceptance Criteria

- 微信公众号链接在 OpenCLI 失败时不会再触发 renderer `fetch`，因此不会出现 CORS 报错。
- OpenCLI 成功时原有微信剪藏路径仍可保存剪藏。
- 非微信普通网页剪藏行为保持不变。
- `manifest.json` / `package.json` / `package-lock.json` 均为 `1.5.5`。
- `main.js` 是 v1.5.5 production build 后的产物。
- GitHub Release `v1.5.5` 存在于公开仓库。
- Release assets 至少包含 `main.js`、`manifest.json`、`tracemind-1.5.5.zip`。
- `gh release view` 输出能证明 assets 已上传。

## Verification

在 `obsidian-plugin/` 下运行：

```bash
rtk proxy npx tsc --noEmit
rtk npm run lint
rtk proxy npx tsx --test tests/storage/web-clippings.test.ts tests/utils/opencli-web-clipper.test.ts tests/release-prep.test.ts
rtk npm test
rtk npm run build
rtk git diff --check
```

发布后在 repo root 运行：

```bash
rtk gh release view v1.5.5 --repo d19310/tracemind-releases --json tagName,url,assets,isDraft,isPrerelease
```

## Report Back

完成后在 `docs/collaboration/REPORT.md` 写：

- 状态：完成/部分完成/阻塞。
- 修改文件列表。
- CORS 根因和修复方式。
- 版本同步结果。
- Verification 命令和结果。
- Git commit hash、tag、push 结果。
- GitHub Release URL。
- Release assets 列表，必须逐项列出 `main.js`、`manifest.json`、zip 是否存在。
- 未做事项或风险。
