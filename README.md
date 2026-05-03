# TraceMind Release Assets

构建产物仓库，用于 [TraceMind Obsidian 插件](https://github.com/d19310/TraceMind) 的 Release 分发。

## 快速安装

```bash
curl -fsSL -o install.sh "https://raw.githubusercontent.com/d19310/tracemind-releases/main/install.sh"
chmod +x install.sh
./install.sh
```

运行后会依次提示：
1. **Vault 名称**（默认 `TraceMind`）
2. **安装目录**（默认 `~/Documents`）

## 安装后

1. 打开 Obsidian Vault
2. 设置 → 社区插件 → TraceMind → 启用（如未自动启用）
3. 打开 TraceMind 设置，配置 AI Provider

## 版本

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2026-05-03 | 首次发布，Context Card 模型 |
