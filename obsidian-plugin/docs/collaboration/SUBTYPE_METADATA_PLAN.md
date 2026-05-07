# Entity Subtype Metadata 方案

## 背景

TraceMind 当前把实体分为 `person`、`object`、`theme` 三大类。这个大方向正确，但 `object` 和 `theme` 的 subtype 目前只是标签，不是真正的元数据 schema。

现状问题：

- `src/core/context-card.ts` 和 `src/ai/entity-type-config.ts` 各自维护一套 subtype / attribute priority，已经出现不一致。
- `object` 的所有 subtype 共用 `subtype/status/deadline/description/priority/goals`，无法表达 project、task、company、technology 等不同对象真正需要的信息。
- `theme` 只有 `subtype/occurrenceCount/context`，不足以支持长期洞察。
- `calculateMaturity()` 和 `detectKnowledgeGaps()` 只看 card type，不看 subtype，导致 project 和 document 的成熟度标准一样。
- 测试里仍残留旧 theme subtype：`domain/habit/state/pending_decision`，而运行时代码已经是 `friction/goal/judgment/idea`。

## 设计目标

1. 保留三大类：`person`、`object`、`theme`。
2. 把 subtype 从“普通标签”升级为“可驱动元数据、成熟度、追问和洞察的 schema”。
3. 统一 subtype 和 attribute priority 的唯一来源。
4. 分阶段落地，避免一次性改 AI、存储、UI、测试导致回归失控。
5. 兼容旧卡片：旧 frontmatter 仍可读取；新逻辑逐步使用新 schema。

## 非目标

- 不改变 Vault 目录结构：仍然是 `Person/`、`Object/`、`Theme/`。
- 不迁移旧卡片 frontmatter。
- 不重做 AI Analysis Panel UI。
- 不引入外部 schema 库。
- 不启动探索模式、白板或 Agent Action。

## 核心设计

新增一个纯模型层 schema，建议文件为：

```text
src/core/entity-schema.ts
```

它是唯一事实来源，负责定义：

- card type：`person | object | theme`
- subtype 列表
- 每个 card type 的 common attributes
- 每个 subtype 的 subtype-specific attributes
- attribute label
- attribute priority：P0/P1/P2
- maturity 和 knowledge gap 应该读取的属性列表

`src/ai/entity-type-config.ts` 后续只负责把 schema 转成 LLM prompt guide，不再自己定义另一套 subtype。

### Attribute key 命名约束

Subtype attribute key 不能使用 ContextCard/frontmatter reserved keys。当前 markdown 存储会把 `card.attributes` 平铺进 frontmatter；如果 attribute key 与顶层字段同名，会覆盖顶层字段，解析时又会被 reserved key 过滤，造成属性丢失。

禁止作为 attribute key 使用：

```text
id, name, type, maturity, confidence, status,
aliases, createdAt, lastUpdated, lifecycle, importance,
userId, relatedPeople, relatedObjects, relatedThemes,
evidenceEntryIds
```

命名原则：

- 业务状态不要直接叫 `status`，使用 subtype-specific key：`taskStatus`、`productStatus`、`documentStatus`、`objectStatus`。
- 技术成熟度不要直接叫 `maturity`，使用 `techMaturity`。
- 判断确信度不要直接叫 `confidence`，使用 `judgmentConfidence`。
- 旧字段可作为 alias 兼容读取，但不再作为新 schema 的主字段。

## Schema 形态

建议数据结构：

```ts
export type AttributePriority = 'P0' | 'P1' | 'P2';

export interface AttributeSchema {
  key: string;
  label: string;
  priority: AttributePriority;
  description?: string;
}

export interface SubtypeSchema {
  key: string;
  label: string;
  priority: AttributePriority;
  hints?: string[];
  attributes: AttributeSchema[];
}

export interface EntityTypeSchema {
  type: CardType;
  label: string;
  commonAttributes: AttributeSchema[];
  subtypes?: Record<string, SubtypeSchema>;
}
```

辅助函数：

```ts
getEntitySchema(cardType: CardType): EntityTypeSchema
getSubtypeSchema(cardType: CardType, subtype?: string): SubtypeSchema | undefined
getEffectiveAttributes(cardType: CardType, subtype?: string): AttributeSchema[]
getAttributesByPriority(cardType: CardType, subtype?: string): { p0: string[]; p1: string[]; p2: string[] }
getSubtypeLabel(cardType: CardType, subtype?: string): string
validateSubtype(cardType: CardType, subtype?: string): boolean
getDefaultSubtype(cardType: CardType): string | undefined
```

## 推荐 subtype 元数据

### Person

Person 暂时不引入 subtype，先保留现有字段，但调整语义。

Common attributes:

| priority | key | label | 说明 |
| --- | --- | --- | --- |
| P0 | `company` | 公司/组织 | 这个人所在或主要关联组织 |
| P0 | `role` | 职位/角色 | 对用户理解此人的关键身份 |
| P0 | `relationship_to_user` | 与我的关系 | 同事、客户、朋友、供应商等 |
| P1 | `responsibility` | 职责 | 负责什么事情 |
| P1 | `workingStyle` | 协作风格 | 比 `communicationStyle` 更贴近日记洞察 |
| P2 | `personality` | 性格 | 可选，不强求 |
| P2 | `preferences` | 偏好 | 可选 |
| P2 | `skills` | 技能 | 可选 |

兼容规则：

- 旧字段 `communicationStyle` 继续读取。
- 新写入优先使用 `workingStyle`。
- 如果两者都存在，展示时优先 `workingStyle`。

### Object

Object 表示“用户行动、工作和生活中被持续追踪的对象”。不同 subtype 有不同 schema。

Common attributes:

| priority | key | label | 说明 |
| --- | --- | --- | --- |
| P0 | `subtype` | 类型 | 必填 |
| P1 | `summary` | 摘要 | 一句话说明 |
| P2 | `tags` | 标签 | 可选 |

Subtype schemas:

| subtype | label | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| `company` | 公司/组织 | `relationship`, `roleInContext` | `industry`, `contactPeople`, `currentStatus` | `notes` |
| `project` | 项目 | `stage`, `owner` | `deadline`, `stakeholders`, `blockers`, `successCriteria` | `priority`, `budget` |
| `task` | 任务 | `taskStatus`, `nextAction` | `dueDate`, `assignee`, `parentProject` | `priority`, `effort` |
| `product` | 产品 | `purpose`, `productStatus` | `users`, `keyFeatures`, `relatedProjects` | `metrics` |
| `technology` | 技术 | `useCase`, `adoptionStatus` | `techMaturity`, `risks`, `relatedProjects` | `alternatives` |
| `document` | 文档 | `purpose`, `documentStatus` | `source`, `linkedProject`, `latestVersion` | `owner` |
| `location` | 地点 | `where`, `whyRelevant` | `associatedPeople`, `associatedEvents` | `notes` |
| `other` | 其他 | `description` | `objectStatus` | `notes` |

兼容规则：

- 旧字段 `status/deadline/description/priority/goals` 保持读取。
- 对 `project`，旧 `deadline` 继续有效。
- 对 `task`，旧 `deadline` 可视为 `dueDate` 的 alias。
- 对 `task/product/document/other`，旧 `status` 可视为对应 subtype status 字段的 alias。
- 对 `technology`，旧 `maturity` 可视为 `techMaturity` 的 alias。
- 对 `other`，旧 `description/status` 继续有效。

### Theme

Theme 表示“反复出现、值得形成洞察的模式、目标、判断或想法”。它不应该像 Object 那样追踪进度，而应追踪模式结构。

Common attributes:

| priority | key | label | 说明 |
| --- | --- | --- | --- |
| P0 | `subtype` | 类型 | 必填 |
| P1 | `summary` | 摘要 | 一句话说明这个主题 |
| P1 | `relatedEntities` | 相关实体 | 人、对象、其他主题 |
| P2 | `trend` | 趋势 | 升温、缓解、反复、已解决 |

Subtype schemas:

| subtype | label | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| `friction` | 摩擦 | `trigger`, `impact` | `frequency`, `possibleCause`, `relatedEntities` | `candidateResolution` |
| `goal` | 目标 | `desiredOutcome`, `currentState` | `nextStep`, `blockers`, `deadline` | `successMetric` |
| `judgment` | 判断 | `claim`, `judgmentConfidence` | `evidence`, `counterEvidence` | `updatedAt` |
| `idea` | 想法 | `coreIdea`, `useCase` | `nextExperiment`, `relatedObjects` | `openQuestions` |

兼容规则：

- 旧 theme subtype `domain/habit/state/pending_decision` 不再作为默认 schema。
- 对 `judgment`，旧 `confidence` 可视为 `judgmentConfidence` 的 alias。
- 后续如需要迁移：
  - `domain` 可映射到 `idea`
  - `habit` 可映射到 `goal` 或 `friction`，需用户确认
  - `state` 可映射到 `friction`
  - `pending_decision` 可映射到 `judgment`
- 本轮不自动迁移旧卡。

## 分阶段实施

### Phase 1：建立 schema 唯一来源

目标：只新增纯模型层，不改变运行时行为太多。

改动范围：

- 新增 `src/core/entity-schema.ts`
- 修改 `src/core/context-card.ts`，让 subtype 常量和 attribute priority 从 schema 派生
- 修改 `src/ai/entity-type-config.ts`，让 LLM type guide 从 schema 派生
- 更新 subtype / context-card / entity-type-config 测试

验收：

- subtype 测试与新 schema 一致。
- `calculateMaturity('object', { subtype: 'project', status: 'x' })` 的旧调用仍不崩。
- `buildExtractionTypeGuide()` 输出仍包含 object/theme subtype 和 hints。
- 不修改 storage markdown 格式。
- 不修改 UI。

### Phase 2A：schema 字段安全 + maturity 支持 subtype

目标：先清理 reserved key 冲突，再让 `calculateMaturity()` 使用 subtype-specific P0/P1/P2。

改动范围：

- `src/core/entity-schema.ts`
- `src/core/context-card.ts`
- `tests/core/subtype.test.ts`
- `tests/core/context-card.test.ts`
- `tests/core/maturity-calculation.test.ts`

验收：

- 当前 schema 不含 reserved attribute key。
- `getAttributesByPriority(cardType, subtype)` 真正按 subtype 返回属性。
- `calculateMaturity()` 保持旧签名，但内部读取 `attributes.subtype`。
- project/task/friction/judgment 等 subtype 有不同 L1 判断标准。
- legacy alias 可用于成熟度判断，但 schema 主字段使用新 key。

### Phase 2B：knowledge gap 支持 subtype

目标：project、task、company、friction、goal 等使用不同知识缺口标准。

改动范围：

- `src/core/knowledge-gap.ts`
- `src/ai/analysis-service.ts`
- `src/ai/analysis-orchestrator.ts`
- 相关测试

建议 API：

```ts
calculateMaturity(cardType, attributes)
```

保持旧签名，但内部读取：

```ts
const subtype = typeof attributes.subtype === 'string' ? attributes.subtype : undefined;
const priority = getAttributesByPriority(cardType, subtype);
```

这样避免大范围调用点一起改。

验收：

- `detectKnowledgeGaps()` 对不同 subtype 返回不同 missingAttribute。

### Phase 3：AI 提问和属性提取跟随 schema

目标：LLM 不再只问泛化问题，而是按 subtype 的 P0/P1 字段追问和提取。

改动范围：

- `src/ai/entity-type-config.ts`
- `src/ai/analysis-service.ts`
- `src/views/ai-analysis-panel.ts` 中构造 clarification prompt 的地方
- chat action system prompt 中 Vault 属性说明
- tests/chat 和 tests/ai

验收：

- `buildClarificationAttributeGuide('object', 'project')` 输出 `stage/owner/deadline/stakeholders/blockers`。
- `buildClarificationAttributeGuide('theme', 'judgment')` 输出 `claim/judgmentConfidence/evidence/counterEvidence`。
- AI Panel 追问 project 时不再只问“当前状态、时间节点、背景”，而应能问 owner/stage/blockers 等。

### Phase 4：Markdown 展示和索引增强

目标：卡片正文 `## 基本信息` 按 subtype 展示关键字段，Entity Index 可保留 subtype 和 summary。

改动范围：

- `src/storage/markdown-card.ts`
- `src/storage/entity-index-io.ts`
- `src/views/ai-analysis-panel.ts` 中读取 card 摘要的地方
- storage 测试

验收：

- project card 展示阶段、负责人、截止日期、阻碍。
- friction theme 展示触发条件、影响、频率、可能原因。
- 旧卡仍能 parse。

### Phase 5：数据迁移和旧字段 alias

目标：只做兼容，不强制迁移。

改动范围：

- 新增 alias 工具函数，如 `normalizeEntityAttributes(cardType, subtype, attributes)`
- 对旧字段做只读 alias：
  - object `deadline` -> task `dueDate` 或 project `deadline`
  - person `communicationStyle` -> `workingStyle`
  - theme `context` -> `summary` 或 subtype-specific 字段，不自动覆盖

验收：

- 旧卡不会因为新 schema 降级到不可用状态。
- 新卡使用新字段。

## 给 Claude Code 的执行策略

DeepSeek v4 pro 不适合一次做完整迁移。每次只给一张小任务卡。

推荐顺序：

1. Phase 1：新增 `entity-schema.ts`，统一 subtype/schema 来源，修 subtype 测试。
2. Codex review。
3. Phase 2A：schema 字段安全 + maturity 按 subtype 工作。
4. Codex review。
5. Phase 2B：knowledge gap 按 subtype 工作。
6. Codex review。
7. Phase 3：AI prompt/clarification 跟随 schema。
8. Codex review。
9. Phase 4：Markdown 展示和索引增强。
10. Codex review。

每张任务卡必须要求：

- 不修改无关 UI。
- 不迁移 Vault 文件。
- 不删除测试来让测试通过。
- 每次只更新当前阶段相关测试。
- 如果全量 `npm test` 因预存失败不通过，必须单独跑本阶段测试并记录全量失败摘要。

## Phase 1 推荐任务卡

Phase 1 是下一步最小安全任务。它只建立 schema source of truth，不改变用户可见行为。

Claude Code 应修改：

- `src/core/entity-schema.ts` 新增
- `src/core/context-card.ts` 修改常量和 helper 来源
- `src/ai/entity-type-config.ts` 从 schema 生成 guide
- `tests/core/subtype.test.ts`
- `tests/core/context-card.test.ts` 只更新与 subtype 默认值和列表相关的断言
- `tests/ai/llm-entity-extractor.test.ts` 如果 prompt 文案断言受影响，只改断言，不改业务逻辑
- `docs/collaboration/REPORT.md`

Claude Code 不应修改：

- `src/storage/markdown-card.ts`
- `src/views/`
- `src/main.ts`
- Vault 示例数据
- release/install 文件

Phase 1 验证命令：

```bash
rtk proxy npx tsx --test tests/core/subtype.test.ts tests/core/context-card.test.ts tests/ai/llm-entity-extractor.test.ts
rtk npm run build
rtk git diff --check
```

如果全量测试仍失败，记录失败摘要即可。
