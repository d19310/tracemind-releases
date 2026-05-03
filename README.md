# TraceMind Release Assets

构建产物仓库，用于 [TraceMind Obsidian 插件](https://github.com/d19310/TraceMind) 的 Release 分发。

## 快速安装

```bash
curl -fsSL -o install.sh "https://raw.githubusercontent.com/d19310/tracemind-releases/main/install.sh"
chmod +x install.sh
./install.sh
```

运行后脚本会引导你输入：
- **Vault 名称**（默认 `TraceMind`）
- **安装目录**（默认 `~/Documents`）

最终 Vault 路径 = 安装目录 + Vault 名称

## 命令行参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-n, --name` | Vault 名称 | `TraceMind` |
| `-p, --parent` | Vault 父目录 | `~/Documents` |
| `-v, --vault` | 直接指定完整路径 | - |
| `-t, --tag` | Release 版本 | `v1.0.0` |
| `--no-open` | 安装后不自动打开 Obsidian | - |
| `-h, --help` | 显示帮助 | - |

### 示例

```bash
# 一键安装，使用默认路径
./install.sh

# 自定义 Vault 名称
./install.sh -n MyTraceMind

# 指定安装目录
./install.sh -p ~/Obsidian

# 完全自定义路径
./install.sh -v ~/MyPath/MyVault

# 不自动打开 Obsidian
./install.sh --no-open
```

## 安装后

1. 打开 Obsidian Vault
2. 设置 → 社区插件 → TraceMind → 启用（如未自动启用）
3. 打开 TraceMind 设置，配置 AI Provider

## 版本

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2026-05-03 | 首次发布，Context Card 模型 |
