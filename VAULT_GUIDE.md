# TraceMind Vault 读写指南

本文档告诉外部 agent（Codex、Claude Code、Hermes、OpenCode、Pi Agent 等）如何读写 TraceMind Vault，包括日记、实体档案、索引检索、附件和思考探索白板。

## 1. Vault 目录结构

```
{VAULT_ROOT}/
├── Daily/                        # 每日日记
│   ├── YYYY-MM-DD.md
│   ├── attachments/              # 日记附件（图片、PDF 等）
│   └── webclippings/             # 网页剪藏
├── Person/                       # 人物实体档案
├── Object/                       # 客体实体档案
├── Theme/                        # 主题实体档案
├── explorations/                 # TraceMind 思考探索白板 (.canvas)
├── outputs/                      # 思考探索导出的 Markdown 成果
└── TraceMind/
    ├── PROFILE.md                # 用户档案
    ├── index/
    │   └── entity-index.json     # 实体索引（持久化 JSON，可直接读取）
    ├── sessions/                 # AI 会话记录
    └── insights/                 # 每日洞察报告 (YYYY-MM-DD.md)
```

---

## 2. 日记写入

### 文件路径

```
Daily/YYYY-MM-DD.md
```

### 文件模板

新文件不存在时，先写入模板头：

```markdown
# YYYY-MM-DD

> [!NOTE] 记录，是AI时代的人生复利。

## Flow of Today：
```

### Block 格式

```markdown
### HH:mm [来源] #标签
日记内容，可以多行

### HH:mm [来源] #标签
另一个 block
```

| 部分 | 格式 | 说明 |
|------|------|------|
| 时间戳 | `HH:mm` | 24 小时制 |
| 来源 | `[AgentName]` | 如 `[Claude Code]`、`[Hermes]` |
| 标签 | `#标签` | 默认 `#待分析`，可附加 `#工作` `#学习` `#个人` |

### 规则

1. **追加**到文件末尾，不覆盖已有内容
2. **不写 block ID**（`<!-- uuid -->`），TraceMind 自动管理
3. 同一分钟只写一条，间隔至少 1 分钟
4. 成功后回复：`写入TraceMind日记成功，日记文件为 YYYY-MM-DD.md`

### 触发方式

- **命令**：`/d 内容`
- **自然语言**："写日记"、"记录一下"、"帮我记个笔记"

---

## 3. 实体检索

### 首选举读索引

**路径**：`TraceMind/index/entity-index.json`

持久化 JSON，可直接读取，包含所有实体概览：

```json
{
  "entries": [{
    "id": "abc123",
    "name": "张三",
    "cardType": "person",
    "subtype": null,
    "summary": "XX科技技术总监",
    "maturity": "L1",
    "filePath": "Person/张三.md",
    "aliases": ["张总"],
    "relationCount": 3,
    "lastUpdated": "2026-05-10T..."
  }],
  "lastRebuild": "2026-05-10T..."
}
```

### 检索流程

1. **读索引** → 按 `name`/`cardType`/`subtype`/`aliases` 快速定位实体
2. **读档案** → 按 `filePath` 打开 `.md` 获取完整属性和互动记录
3. **模糊搜索** → `name` + `aliases` case-insensitive 包含匹配

---

## 4. 实体属性速查

### Person

`company`、`role`、`relationship_to_user`、`responsibility`、`workingStyle`、`personality`

### Object (按 subtype)

| subtype | 含义 | 关键属性 |
|---------|------|---------|
| `project` | 项目：长期目标容器，有目标、边界、阶段或里程碑，可承载多个事项和行动任务 | stage, owner, deadline, stakeholders, blockers |
| `matter` | 事项：需要长期记忆追踪的具体事务，比项目小，但不是短期待办 | taskStatus, nextAction, dueDate, assignee, parentProject |
| `task` | 旧 subtype，仅用于兼容历史档案；新实体应使用 `matter` | taskStatus, nextAction, dueDate, assignee |
| `company` | 公司、客户、供应商、合作伙伴、机构等组织 | relationship, roleInContext, industry |
| `technology` | 技术、框架、模型、平台或方法 | useCase, adoptionStatus, techMaturity |
| `other` | 其他客体 | description, objectStatus |

`project`、`matter` 和行动看板任务的边界：

- `project` 是长期目标容器，例如“TraceMind 2.0 发布”“临港算力商业化”。
- `matter` 是需要沉淀到实体档案的长期事项，例如“行动看板任务生命周期优化”“910C 项目报价确认”。
- 行动看板任务是短期可执行动作，例如“整理行动看板测试反馈”“让 agent 生成周报初稿”，存储在 `TraceMind/tasks/tasks.json`，不作为实体档案。

### Theme (按 subtype)

| subtype | 关键属性 |
|---------|---------|
| `friction` | trigger, impact, frequency, possibleCause |
| `goal` | desiredOutcome, currentState, nextStep |
| `judgment` | claim, judgmentConfidence, evidence |
| `idea` | coreIdea, useCase, nextExperiment |

旧 subtype 映射：`domain→idea` `pending_decision→judgment` `habit→goal` `state→friction`

---

## 5. 用户档案

**路径**：`TraceMind/PROFILE.md`

```yaml
---
name: ""
occupation: ""
company: ""
city: ""
skills: []
focusAreas: []
---
```

推断实体关系时参考（如同公司推断、角色映射）。

---

## 6. 附件与剪藏

| 类型 | 路径 | 日记中引用格式 |
|------|------|---------------|
| 附件 | `Daily/attachments/` | `![[Daily/attachments/file.pdf]]` |
| 剪藏 | `Daily/webclippings/YYYY-MM-DD-标题-hash.md` | `[[Daily/webclippings/...md\|name.md]]` |

agent 可通过路径直接读取附件和剪藏内容。

---

## 7. 思考探索白板

### 文件路径

```
explorations/YYYY-MM-DD-时间戳.canvas
```

TraceMind 思考探索白板使用 Obsidian 兼容的 `.canvas` JSON 文件，并在文件中写入 `tracemind` 自定义元数据。外部 agent 可以读取这些文件理解探索过程，但不建议直接覆盖写入，除非明确遵守 TraceMind 的 block 与 edge schema。

### 主要 block 类型

| 类型 | 说明 |
|------|------|
| `diary_source` | 从日记进入思考探索的来源 block |
| `entity_source` | 从实体档案进入思考探索的来源 block |
| `material_source` | 用户在白板中添加的材料、Vault 文件或网页链接引用 |
| `frame_question` | 破题拷问生成的问题 block |
| `insight` | 头脑风暴、用户地图、思维导图、RISE 等生成的洞察 block |
| `decision` | 决策树、RISE 中的决策问题、战略判断或方案 block |
| `risk` | 决策树、用户地图中的风险或痛点 block |
| `experiment` | 最小验证、下一步实验或 RISE execution block |
| `user_reply` | 用户对白板 block 的回复 |
| `agent_reply` | agent 对用户回复的回应 |
| `output` | 成果总结 block |

### 思考方法标记

TraceMind 会在 block 的 `data.method`、`data.stage`、`data.level`、`data.role` 等自定义字段中记录思考方法上下文。常见值包括：

| 方法 | 典型字段 |
|------|----------|
| `frame_problem` | `type=frame_question` |
| `brainstorming` | `data.method=brainstorming` |
| `mind_map` | `data.method=mind_map`, `data.level=1/2`, `data.role=branch/leaf` |
| `decision_tree` | `data.method=decision_tree`, `data.role=decision_question/option/risk/assumption/validation` |
| `user_map` | `data.method=user_map`, `data.role=target_user/scenario/job/pain/value` |
| `rise` | `data.method=rise`, `data.stage=reality/insight/strategy/execution` |

多个 `output` block 可以继续连接到新的 `output` block，用于更高层成果总结。读取成果链路时，应沿 `leads_to` 等边向上追溯，直到 source、material、thinking、reply 等上游 block。

### 思考探索目录

| 路径 | 说明 |
|------|------|
| `explorations/` | 思考探索记录，用户可从 Obsidian 文件列表再次打开 |
| `outputs/` | 用户导出的 Markdown 成果文档 |

### 记忆检索

思考探索白板中的「检索记忆」开关启用后，TraceMind 会优先基于实体索引和 Vault 内容为思考方法补充上下文。外部 agent 在执行任务时也可以优先读取：

1. `TraceMind/index/entity-index.json`
2. 相关 `Person/`、`Object/`、`Theme/` 档案
3. 相关 `Daily/YYYY-MM-DD.md`
4. 白板中显式连接的 `material_source`

---

## 8. Python 操作示例

```python
import json, os
from datetime import datetime

def get_entities(vault):
    """读取实体索引"""
    idx = os.path.join(vault, "TraceMind/index/entity-index.json")
    if os.path.exists(idx):
        with open(idx) as f:
            return json.load(f).get("entries", [])
    return []

def find_entity(vault, name):
    """按名称查找实体档案"""
    for e in get_entities(vault):
        if name in [e["name"]] + e.get("aliases", []):
            path = os.path.join(vault, e["filePath"])
            if os.path.exists(path):
                with open(path) as f: return f.read()
    return None

def write_diary(vault, content, source="Claude Code", tags="#待分析"):
    now = datetime.now()
    ds = now.strftime("%Y-%m-%d")
    fp = os.path.join(vault, "Daily", f"{ds}.md")
    hdr = f"### {now.strftime('%H:%M')} [{source}] {tags}"
    block = f"\n{hdr}\n{content}\n"
    if os.path.exists(fp):
        with open(fp, "a") as f: f.write(block)
    else:
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        tmpl = f"# {ds}\n\n> [!NOTE] 记录，是AI时代的人生复利。\n\n## Flow of Today：\n"
        with open(fp, "w") as f: f.write(tmpl + block)
    print(f"写入TraceMind日记成功，日记文件为 {ds}.md")
```
