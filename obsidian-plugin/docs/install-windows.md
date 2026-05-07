# TraceMind Windows 安装说明

本文档用于 Windows 用户手动安装 TraceMind Obsidian 插件。

## 前置条件

- 已安装 Windows 版 Obsidian。
- 已有一个 Obsidian Vault。
- 已从 TraceMind release 下载插件产物。

## 手动安装

1. 关闭 Obsidian，或至少关闭当前 Vault。
2. 打开你的 Vault 目录。例如：

```text
C:\Users\<用户名>\Documents\TraceMind
```

3. 显示隐藏文件夹，并进入 `.obsidian`。
4. 创建插件目录：

```text
<Vault>\.obsidian\plugins\tracemind\
```

5. 将 release 里的文件复制到该目录：

```text
main.js
manifest.json
```

如果 release 同时提供 `styles.css`，也复制到同一目录。

6. 打开 Obsidian。
7. 进入 `Settings -> Community plugins`。
8. 关闭 Restricted Mode / 启用 Community plugins。
9. 刷新插件列表，启用 `TraceMind`。
10. 首次启用后，按照 TraceMind 弹窗创建并校验目录结构。

## 首次启动目录

TraceMind 的 Vault 业务目录由插件首次启动弹窗创建，不由安装步骤手工创建。弹窗应创建并校验：

```text
Daily
Person
Object
Theme
TraceMind\sessions
TraceMind\index
TraceMind\insights
TraceMind\PROFILE.md
```

如果弹窗提示目录不完整，请在插件内重新执行初始化，不建议手动随意修改这些目录名。

## 本地 Agent 状态

Windows 下本地 Agent 功能当前视为实验性能力。Claude Code、Hermes 等 CLI 可能受以下因素影响：

- Windows 上命令可能是 `.cmd` shim。
- Obsidian 的 Electron 环境可能无法继承 PowerShell 或终端里的 PATH。
- `child_process.spawn` 对不同 CLI 的参数和 stdin/stdout 行为可能需要单独适配。

核心插件安装、AI Provider 配置、日记分析和知识卡片功能不应依赖 Windows 本地 Agent。

## 常见问题

### 看不到 `.obsidian`

在文件资源管理器中开启隐藏项目显示。

### 插件列表中没有 TraceMind

检查目录是否为：

```text
<Vault>\.obsidian\plugins\tracemind\manifest.json
<Vault>\.obsidian\plugins\tracemind\main.js
```

`manifest.json` 和 `main.js` 必须直接放在 `tracemind` 目录下，不能多套一层压缩包目录。

### 插件启用后没有目录

这是预期行为。安装步骤只安装插件文件，TraceMind 的业务目录由首次启动弹窗创建。请按弹窗完成初始化。
