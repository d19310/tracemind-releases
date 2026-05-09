# Claude Code Vault Structure Startup Check 1 报告

## 状态

完成。

## 变更文件

| 文件 | 改动 |
|------|------|
| `src/core/first-start-constants.ts` | 新增 `VaultStructureIssue`/`VaultStructureAccess`/`getVaultStructureIssues()`/`decideStartupAction()` |
| `src/core/first-start.ts` | 新增 `showVaultStructureRepairModal()` + `VaultRepairModal` 类 |
| `src/main.ts` | `TRACEMIND_DIRS = REQUIRED_DIRS`；非首次启动改为 `checkVaultStructureThenContinue()` |
| `tests/core/vault-structure.test.ts` | 新增 9 个测试 |
| `docs/collaboration/REPORT.md` | 本报告 |

## 启动分支

| 场景 | 行为 |
|------|------|
| 首次启动（无 PROFILE.md） | 现有首次启动向导（不变） |
| 非首次 + 结构完整 | 静默继续，不弹窗，不 Notice |
| 非首次 + 缺失目录/PROFILE | 弹窗提示，用户确认修正 |
| 用户点"修正" | 创建缺失目录/档案，重新校验，成功 → 初始化 index |
| 用户点"暂不修正" | 不创建，Notice 提示，继续加载 |

## 可/不可自动修复

| 类型 | repairable | 处理 |
|------|-----------|------|
| 目录缺失 | true | 创建目录 |
| PROFILE.md 缺失 | true | 创建默认 profile |
| 目录路径为文件 | false | 弹窗提示需手动处理 |
| PROFILE.md 路径为目录 | false | 弹窗提示需手动处理 |

## 测试 (24 pass)

- `getVaultStructureIssues`: 完整结构、缺失目录、缺失 PROFILE、wrong_type(dir)、wrong_type(profile)、额外文件不报错
- `decideStartupAction`: first_start / continue / prompt_repair

## 验证

```bash
rtk proxy npx tsc --noEmit   # exit 0
rtk npm run lint              # 0/0
rtk proxy npx tsx --test tests/core/first-start.test.ts tests/core/vault-structure.test.ts  # 24/24
rtk npm test                  # all pass
rtk npm run build             # OK
```
