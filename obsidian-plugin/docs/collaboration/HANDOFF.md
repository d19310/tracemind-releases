# Claude Code 任务交接

## 当前任务

Vault Structure Startup Check 1：每次启动插件时校验 Vault 业务目录，缺失或结构异常时提示用户确认修正。

## Goal

用户要求：

> 每次启动插件的时候检查 vault 文件目录是否符合要求，是否有变更和缺失，如果有提示用户并让用户确认修正，如果符合要求就静默启动，不用提示用户。

当前非首次启动路径在 `src/main.ts` 中会直接调用 `ensureVaultStructure()`，这会静默创建缺失目录。新行为必须改成：

- 每次插件启动都校验 TraceMind 所需 Vault 结构。
- 如果结构完整：静默继续启动，不弹窗，不 Notice。
- 如果结构缺失或关键路径类型错误：弹窗提示用户，列出问题，让用户确认是否修正。
- 只有用户确认修正后，才创建缺失目录/档案或修复可安全修复的问题。
- 用户取消时，不静默修复；插件可以继续加载，但要明确提示“结构未修正，部分功能可能不可用”。

## Current Code Facts

请先阅读这些文件，不要重写目录规则：

- `src/core/first-start-constants.ts`
  - `REQUIRED_DIRS`
  - `PROFILE_PATH`
  - `getMissingFirstStartItems(vault)`
  - `isFirstStart(vault)`
- `src/core/first-start.ts`
  - `showFirstStartWizard(app, onComplete)`
  - 首次启动向导已经能创建目录和 `TraceMind/PROFILE.md`。
- `src/main.ts`
  - `TRACEMIND_DIRS` 当前是本地重复目录清单。
  - `onload()` 当前在非首次启动分支中静默调用 `ensureVaultStructure()`，这正是本轮要改的行为。
  - `ensureVaultStructure()` 只创建目录，不创建 `PROFILE.md`。
- `src/core/profile-loader.ts`
  - 已有 `PROFILE.md` 读写逻辑。
- `tests/core/first-start.test.ts`
  - 已覆盖首次启动常量和缺失项校验。

## Product / UX Design

### 启动分支

建议启动逻辑调整为：

1. 插件加载 settings/profile/config/views/commands 等轻量初始化。
2. 判断 `isFirstStart(this.app.vault.adapter)`：
   - 如果 `true`：继续使用现有首次启动向导。
   - 向导完成后执行 `ensureVaultStructure()` + `rebuildEntityIndex()`。
3. 如果不是首次启动：
   - 先校验 Vault 结构。
   - 没问题：直接 `initializeEntityIndex()`，无弹窗。
   - 有问题：打开“Vault 结构需要修正”弹窗。
     - 用户点“修正”：执行修正，再重新校验；成功后 `initializeEntityIndex()`。
     - 用户点“暂不修正”：不创建目录；显示一个简短 Notice，随后仍可继续加载，但不要启动会依赖缺失结构的写入型操作。

### 校验范围

必须检查：

- 目录：
  - `Daily`
  - `Person`
  - `Object`
  - `Theme`
  - `TraceMind`
  - `TraceMind/sessions`
  - `TraceMind/index`
  - `TraceMind/insights`
- 文件：
  - `TraceMind/PROFILE.md`

不仅检查“存在”，也要尽量检查类型：

- 必需目录路径如果存在但不是目录，应报告为结构异常。
- `TraceMind/PROFILE.md` 如果存在但不是文件，应报告为结构异常。

不要把额外目录/文件当成异常。用户 Vault 中允许有其他内容。

### 修正规则

可自动修正：

- 缺失目录：创建目录。
- 缺失 `TraceMind/PROFILE.md`：使用现有 profile template 或 helper 创建默认 profile。

不可自动覆盖：

- 必需目录路径已存在但其实是文件。
- `TraceMind/PROFILE.md` 路径已存在但其实是目录。

遇到不可自动修正项时：

- 弹窗中说明“需要用户手动处理”。
- 点击“修正”只能修复可修复项；不可修复项仍应保留在重新校验结果中。
- 不要删除、覆盖或重命名用户现有文件。

## Scope

允许修改：

- `src/core/first-start-constants.ts`
- `src/core/first-start.ts`
- 可新增 `src/core/vault-structure.ts` 或 `src/core/vault-structure-modal.ts`
- `src/main.ts`
- `tests/core/first-start.test.ts`
- 可新增 `tests/core/vault-structure.test.ts`
- `docs/collaboration/REPORT.md`

只读参考：

- `src/core/profile-loader.ts`
- `src/vault/vault.ts`
- `src/storage/entity-index-store.ts`
- `docs/collaboration/ARCHITECTURE.md`

## Non-goals

- 不改安装脚本。
- 不改 release/version。
- 不改 Entity Index 持久化格式。
- 不改 provider、AI Panel、Settings、Calendar。
- 不做真实 Vault 迁移。
- 不删除、覆盖、重命名任何用户已有 Vault 文件。
- 不把额外目录当成异常。
- 不在首次启动向导前创建业务目录。

## Implementation Notes

### 1. 目录规则只保留一个来源

优先复用 `REQUIRED_DIRS` 和 `PROFILE_PATH`。

如果 `src/main.ts` 的 `TRACEMIND_DIRS` 继续存在，必须保证它直接来自 `REQUIRED_DIRS`，不要维护第二份硬编码目录清单。

推荐：

```ts
import { REQUIRED_DIRS, PROFILE_PATH } from './core/first-start';
```

然后 `ensureVaultStructure()` 遍历 `REQUIRED_DIRS`。

### 2. 新增可测试的结构校验 helper

建议新增纯 helper，便于测试：

```ts
export type VaultStructureIssueType = 'missing_dir' | 'missing_file' | 'wrong_type';

export interface VaultStructureIssue {
  type: VaultStructureIssueType;
  path: string;
  expected: 'folder' | 'file';
  actual?: 'folder' | 'file' | 'unknown';
  label: string;
  repairable: boolean;
}
```

校验函数可以是同步抽象：

```ts
export interface VaultStructureAccess {
  getType(path: string): 'folder' | 'file' | null;
}

export function getVaultStructureIssues(vault: VaultStructureAccess): VaultStructureIssue[] { ... }
```

在 Obsidian 实现里，`getType()` 可通过 `app.vault.getAbstractFileByPath(path)` 判断 `TFolder` / `TFile`。如果不想 import `TFolder/TFile`，也可以检查对象的 `children` / `extension`，但更建议使用 Obsidian 类型。

### 3. 启动修正弹窗

建议新增：

```ts
export function showVaultStructureRepairModal(
  app: App,
  issues: VaultStructureIssue[],
  onRepair: () => Promise<VaultStructureIssue[]>,
  onSkip: () => Promise<void> | void,
  onComplete: () => Promise<void>,
): void
```

弹窗内容：

- 标题：`TraceMind Vault 结构需要修正`
- 说明：检测到必要目录或档案缺失/异常。
- 列表：逐条展示 issue label。
- 按钮：
  - `修正`：执行可修复项，重新校验。
  - `暂不修正`：关闭，不修复。

如果修正后无 issue：

- Notice：`TraceMind Vault 结构已修正`
- 关闭弹窗
- 调用 `onComplete()`，继续 `initializeEntityIndex()`

如果仍有不可修复 issue：

- 在弹窗内更新状态，列出仍需手动处理项。
- 不要调用 `onComplete()`。

### 4. main.ts 启动顺序

非首次启动分支从：

```ts
await this.ensureVaultStructure();
await this.initializeEntityIndex();
```

改为类似：

```ts
await this.checkVaultStructureThenContinue();
```

其中：

- 完整：直接 `initializeEntityIndex()`。
- 有缺失：弹窗确认后再修正和初始化。
- 用户跳过：不要静默修正；可以不初始化依赖完整结构的持久化索引，或只尝试 `loadEntityIndex()` 并捕获错误。请在 REPORT 说明选择。

重要：首次启动向导仍然是 `PROFILE.md` 不存在时的默认入口，不能被新弹窗绕过。

## Tests Required

### Pure helper tests

新增或扩展 core 测试：

- 完整结构返回 `[]`。
- 缺失目录返回 `missing_dir` 且 `repairable: true`。
- 缺失 `PROFILE.md` 返回 `missing_file` 且 `repairable: true`。
- 目录路径存在但类型为 file 返回 `wrong_type` 且 `repairable: false`。
- `PROFILE.md` 存在但类型为 folder 返回 `wrong_type` 且 `repairable: false`。
- 额外文件/目录不会报错。

### Startup behavior tests

如果 `TraceMindPlugin` 难以直接实例化，不要大范围重构。可以抽一个小的决策 helper，例如：

```ts
export type StartupStructureDecision =
  | { kind: 'first_start' }
  | { kind: 'continue' }
  | { kind: 'prompt_repair'; issues: VaultStructureIssue[] };
```

测试：

- first start 时仍走 `first_start`。
- 非首次 + 完整结构 → `continue`。
- 非首次 + 缺失目录 → `prompt_repair`。

不要只测常量。

## Acceptance Criteria

- 非首次启动且结构完整：不弹窗，不 Notice，正常初始化 index。
- 非首次启动且缺失目录/PROFILE：弹窗提示用户确认修正，不静默创建。
- 用户确认修正后：创建缺失目录/PROFILE，重新校验，成功后继续初始化 index。
- 用户取消/跳过：不创建目录/PROFILE，并有清晰 Notice。
- 首次启动 `PROFILE.md` 缺失时：仍使用首次启动向导，不被修复弹窗替代。
- 必需路径类型错误时：报告为不可自动修复，不覆盖用户文件。
- `TRACEMIND_DIRS` 不再与 `REQUIRED_DIRS` 分叉。
- 有定向测试覆盖校验 helper 和启动决策。

## Verification

在 `obsidian-plugin/` 下运行：

```bash
rtk proxy npx tsc --noEmit
rtk npm run lint
rtk proxy npx tsx --test tests/core/first-start.test.ts tests/core/vault-structure.test.ts
rtk npm test
rtk npm run build
rtk git diff --check
```

如果测试文件名不同，请在 REPORT 中写实际命令。

## Report Back

完成后在 `docs/collaboration/REPORT.md` 写：

- 修改文件列表。
- 启动分支行为说明：first start / complete structure / missing structure / skipped repair。
- 哪些问题可自动修复，哪些不可自动修复。
- 新增测试覆盖。
- Verification 命令和结果。
- 是否发现现有启动顺序还有其他会提前写 Vault 的路径；只报告，不要扩大范围修。
