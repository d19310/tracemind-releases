/**
 * Daily Insight Generator - Prompt construction and utility functions.
 * Builds the 6-section daily insight report via LLM.
 *
 * Pure functions only — no Obsidian dependencies.
 */

import type { ChatMessage } from './provider-config';
import type { IndexEntry } from '../storage/entity-index';

export interface DailyInsightInput {
  todayBlocks: string;
  yesterdayBlocks: string;
  profileContext: string;
  entityIndexSummary: string;
}

export interface InsightStreamCallbacks {
  onDelta: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

const SYSTEM_PROMPT = `你是一位洞察力敏锐的日记分析专家。用户每天记录生活和工作日记，你需要根据当天的日记内容，生成一份结构化的"今日洞察"报告。

## 报告格式要求

严格按照以下 6 个章节输出 Markdown，不要遗漏任何章节：

### ## 今日概览

用一句话概括今天的整体基调。例如："今天是工作驱动的一天，主要围绕 Q2 项目推进展开。"

### ## 注意力分布

列出今天各领域的注意力占比（以百分比呈现），并在占比最高的领域下方加一行简短的投入方向概括。例如：
- **工作** 60% — 主要集中在供应商谈判和团队管理
- **生活** 25%
- **学习** 15%

### ## 主线与发散

分析今天的记录是围绕一个核心方向展开，还是内容比较发散。如果围绕主线，指出主线是什么。如果是发散的，说明发散的特点。

### ## 变化与摩擦

提取今天出现的重要变化（新人、新项目、新情况）、阻力或摩擦（困难、冲突、延迟），以及它们可能带来的影响。如果没有明显变化或摩擦，也要如实说明。

### ## 主题动态

结合已有的实体档案（特别是 Theme 类型的卡片），分析今天的日记中：
- **新增主题**：今天新出现的主题，按 subtype 分类列出（摩擦/目标/判断/想法）。命名要具体，不要用泛词
- **强化主题**：与已有 Theme 卡片呼应、被新证据强化的主题
- **消退主题**：之前活跃但最近未再出现的主题

每个主题标注 subtype 中文名（如"摩擦：方向反复变化"、"目标：提升表达能力"）。

### ## 与前日对比

对比今天和前一天的日记，分析在注意力方向、内容主题、情绪基调等方面的变化。如果前一天没有日记或数据不足，说明即可。

## 输出规则

- 只输出上述 6 个章节的 Markdown，不要添加其他内容
- 每个章节必须有实质内容，不能只写"无"
- 基于提供的日记内容进行分析，不要编造
- 使用中文`;

/**
 * Build the system + user prompt messages for the daily insight LLM call.
 */
export function buildDailyInsightPrompt(input: DailyInsightInput): ChatMessage[] {
  const userPromptParts: string[] = [];

  userPromptParts.push('## 用户背景');
  userPromptParts.push(input.profileContext || '暂无用户背景信息');
  userPromptParts.push('');

  userPromptParts.push('## 实体档案摘要');
  userPromptParts.push(input.entityIndexSummary || '暂无实体档案');
  userPromptParts.push('');

  userPromptParts.push('## 今天的日记');
  userPromptParts.push(input.todayBlocks || '(今天还没有写日记)');
  userPromptParts.push('');

  userPromptParts.push('## 前一天的日记');
  userPromptParts.push(input.yesterdayBlocks || '(前一天没有日记)');

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPromptParts.join('\n') },
  ];
}

/**
 * Compute a SHA-256 content hash for cache invalidation.
 * Hash is computed over (todayBlocks + yesterdayBlocks).
 */
export async function computeContentHash(todayBlocks: string, yesterdayBlocks: string): Promise<string> {
  const input = todayBlocks + '|||' + yesterdayBlocks;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build a human-readable summary string from the entity index entries.
 * Groups by cardType, shows up to 20 most recent per type.
 */
export function buildEntityIndexSummary(entries: IndexEntry[]): string {
  if (entries.length === 0) return '暂无实体档案';

  const byType = new Map<string, IndexEntry[]>();
  for (const entry of entries) {
    const t = entry.cardType || entry.type || 'unknown';
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t)!.push(entry);
  }

  const typeLabels: Record<string, string> = {
    person: '人物',
    object: '客体',
    theme: '主题',
  };

  const parts: string[] = [];
  const order = ['person', 'object', 'theme'];

  for (const type of order) {
    const list = byType.get(type);
    if (!list || list.length === 0) continue;
    const sorted = [...list]
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 20);
    const label = typeLabels[type] || type;
    const items = sorted.map(e => `${e.name}(${e.maturity || 'L0'})`).join(', ');
    parts.push(`${label}(${sorted.length}): ${items}`);
  }

  return parts.join('; ') || '暂无实体档案';
}
