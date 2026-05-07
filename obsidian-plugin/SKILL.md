# Agent Diary Writer

向 TraceMind 日记系统写入日记条目，供后续 AI 分析和知识提取。

## 触发条件

### 命令方式

```
/d 日记内容
```

以 `/d ` 开头的消息，提取后面的内容作为日记正文，直接写入当天日记文件。

**示例：**

```
/d 今天和产品开了个会，讨论了桌面端 MVP 的功能范围
```

### 自然语言方式

当用户通过飞书、微信等渠道说"写日记"、"记录一下"、"帮我记个笔记"等，触发此 skill。

## 日记格式

### 最小格式

```markdown
### HH:mm [AgentName] #待分析
日记正文内容
可以多行
```

后面跟一个空行，或下一个 `### ` header。

### 文件路径

```
Daily/YYYY-MM-DD.md
```

在 Obsidian vault 根目录下。例如 `Daily/2026-05-06.md`。

### 文件不存在时

先创建文件，写入模板头，再追加日记 block：

```markdown
# 2026-05-06

> [!NOTE] 记录，是AI时代的人生复利。

## Flow of Today：

### 08:30 [Claude Code] #待分析
今天早上和产品团队讨论了新功能的设计方案。
```

### Header 格式

```
### HH:mm [来源] #标签1 #标签2
```

| 部分 | 格式 | 说明 |
|------|------|------|
| 时间戳 | `HH:mm` | 24小时制，如 `08:00`、`14:30` |
| 来源 | `[名称]` | agent 名称，如 `[Claude Code]`、`[Hermes]`、`[OpenClaw]` |
| 标签 | `#tag` | 空格分隔，默认用 `#待分析` |

标签可以是多个：`#待分析 #工作` 或 `#待分析 #个人`。agent 可根据内容智能添加领域标签。

### Content 格式

- 紧跟 header 的下一行开始
- 可以多行
- 内部列表用 `- ` 开头（这些是正文的一部分，不是 child block）
- 以空行结束，或以 `### `（下一个 block header）结束

### 多个 Block

每个 block 之间用空行分隔：

```markdown
### 08:30 [Claude Code] #待分析
第一件事的内容

### 10:00 [Claude Code] #待分析
第二件事的内容
```


## 重要规则

1. **不要写 block ID**：不要添加 `<!-- uuid -->` 注释。TraceMind 解析时自动生成 ID，AI 分析完成后会自动补上。
2. **不要覆盖已有 block**：追加新 block 到文件末尾，不要修改已有内容。
3. **时间戳去重**：同一分钟内避免写入多个 block。如果连续记录，时间戳至少间隔 1 分钟。
4. **标签用 `#待分析`**：默认标签，确保用户打开 Obsidian 后能看到待分析状态并触发 AI 分析。
5. **来源用 agent 名**：方便用户区分哪些是手动记录、哪些是 agent 代记。
6. **写入成功后回复**：日记写入成功后，agent 必须回复：`写入TraceMind日记成功，日记文件为 YYYY-MM-DD.md`。

## 完整示例

用户说："帮我记一下，今天和产品开了个会，讨论了桌面端 MVP 的功能范围"

Agent 写入 `Daily/2026-05-06.md`：

```markdown
# 2026-05-06

> [!NOTE] 记录，是AI时代的人生复利。

## Flow of Today：

### 09:00 [Claude Code] #待分析
之前的内容...

### 10:30 [Claude Code] #待分析
和产品团队讨论了桌面端 MVP 的功能范围。
主要结论：
- 第一期聚焦笔记编辑和 AI 分析两个核心功能
- 插件系统放到第二期
- 预计 6 月底上线内测版本
```

## 文件操作伪代码

```python
import os
from datetime import datetime

def write_diary(content: str, source: str = "Claude Code", tags: str = "#待分析"):
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")
    vault_root = "/path/to/vault"  # 替换为实际 vault 路径
    filepath = os.path.join(vault_root, "Daily", f"{date_str}.md")

    header = f"### {time_str} [{source}] {tags}"
    block = f"\n{header}\n{content}\n"

    if os.path.exists(filepath):
        # 追加到文件末尾
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(block)
    else:
        # 创建新文件，先写模板
        template = f"# {date_str}\n\n> [!NOTE] 记录，是AI时代的人生复利。\n\n## Flow of Today：\n"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(template)
            f.write(block)

    print(f"日记已写入: {filepath}")
```
