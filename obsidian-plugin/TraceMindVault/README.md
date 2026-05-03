# TraceMindVault

基于 Obsidian 的个人知识管理系统，由 TraceMind 插件驱动。

## 目录结构

```
TraceMindVault/
├── Daily/              # 日记文件（按日期）
├── Person/             # 人物实体卡片
├── Object/             # 对象实体卡片（项目、任务、产品等）
├── Theme/              # 主题实体卡片（领域、习惯、状态等）
├── TraceMind/          # TraceMind 内部数据
│   ├── sessions/       # AI 分析会话
│   ├── index/          # 实体索引
│   ├── agents/         # Agent 配置
│   ├── skills/         # 技能定义
│   └── PROFILE.md      # 用户画像
├── .obsidian/          # Obsidian 配置
└── README.md
```

## 快速开始

1. 在 Obsidian 中打开此 Vault
2. 安装 TraceMind 插件（将插件文件放入 `.obsidian/plugins/tracemind/`）
3. 在设置中配置 AI Provider
4. 开始写日记！
