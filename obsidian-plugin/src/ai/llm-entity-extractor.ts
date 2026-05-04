/**
 * LLM Entity Extractor - Calls LLM for entity extraction from diary text.
 * Complements the rule-based extractor in entity-extractor.ts.
 */

import { CardType } from '../core/context-card';
import { buildExtractionTypeGuide } from './entity-type-config';

export interface LLMExtractedEntity {
  name: string;
  type: CardType;
  subtype?: string;
  confidence: number;
}

export type DomainCategory = '工作' | '生活' | '学习' | '运动' | '其他';

export interface LLMExtractionResult {
  domain?: DomainCategory;
  entities: Array<{
    name: string;
    type: string;
    subtype?: string;
    confidence?: number;
  }>;
}

/**
 * Build a prompt for LLM entity extraction.
 */
export function buildExtractionPrompt(diaryText: string, profileContext?: string): string {
  let prompt = `你是一个精准的实体提取和日记分类专家。请对以下日记文本进行分析。

## 任务 1：领域分类

判断这条日记属于哪个领域。"domain" 必须是以下之一：
- "工作"：与职业、公司、项目、业务相关的内容
- "生活"：与个人生活、家庭、社交、日常事务相关的内容
- "学习"：与学习新知识、技能提升、阅读、培训相关的内容
- "运动"：与体育锻炼、健身、户外活动相关的内容
- "其他"：无法归入以上类别的内容

分类时请结合用户背景信息。如果提供了用户背景（职业、公司、关注领域等），请参考：
- 与用户职业/公司相关的话题 → "工作"
- 与用户关注领域相关但偏个人成长的内容 → "学习"
- 纯个人、家庭、朋友聚会 → "生活"
- 锻炼、跑步、健身 → "运动"

## 任务 2：实体提取

从日记中提取命名实体。

什么是命名实体（必须同时满足）：
1. 有明确的专有名称：如人名"卢晏"、产品型号"H200"、项目名"临港实验室算力租赁项目"
2. 是一个具体的事物或人，不是抽象概念或泛泛的描述
3. 脱离当前上下文也能独立存在为一个知识条目

什么不是命名实体（禁止提取）：
- 抽象概念：备份方案、解决方案、计划、讨论、意见等
- 泛泛的名词：公司、项目、电脑、文档等（没有具体名称的）
- 动词或动作：讨论、开会、写了等
- 个人想法或推测中未命名的东西
- 日记中仅仅提及但没有任何具体信息的词语

重要规则：
- **宁缺毋滥**：如果拿不准，就不要提取。confidence 低于 0.6 的不要加入。
- **最多提取 5 个实体**：优先提取最具体、最重要的。
- **theme 谨慎但不要遗漏**：命名要像一个"主题标签"而非事件描述：如"H200供货紧张" ✅
- **object 必须有具体名称**：如产品型号、项目名称、文档标题等

每个实体必须有：
- "name": 实体名称（字符串，必填）
- "type": 以下之一："person"（人物）、"object"（客体）、"theme"（主题）（必填）
- "subtype": 客体和主题的细分类型（可选，见下方规则）
- "confidence": 0.0 到 1.0 之间的数字（可选，默认 0.5）

${buildExtractionTypeGuide()}`;

  if (profileContext) {
    const isKnownEntities = profileContext.includes('已知实体');
    prompt += '\n\n' + profileContext;
    if (isKnownEntities) {
      prompt += '\n\n注意：已知实体已建档，不要重复提取，只提取新出现的实体。';
    }
  }

  prompt += `\n\n## 输出格式

返回一个 JSON 对象，包含 "domain"（字符串）和 "entities"（数组）：
{
  "domain": "工作",
  "entities": [
    { "name": "张三", "type": "person", "confidence": 0.9 },
    { "name": "Q2计划", "type": "object", "subtype": "project", "confidence": 0.8 },
    { "name": "H200供货紧张", "type": "theme", "confidence": 0.65 }
  ]
}

只返回合法的 JSON。不要 markdown，不要解释，不要思考过程。

日记文本：
${diaryText}`;

  return prompt;
}

export interface LLMExtractionOutput {
  domain?: DomainCategory;
  entities: LLMExtractedEntity[];
}

/**
 * Parse LLM response JSON into validated output with domain and entities.
 * Handles reasoning model thinking blocks, code blocks, and malformed JSON.
 *
 * Primary strategy: find {"entities" pattern directly in the raw text.
 * This bypasses all thinking-tag parsing issues regardless of tag format.
 */
export function parseLLMResponse(rawText: string): LLMExtractionOutput {
  const validTypes: CardType[] = ['person', 'object', 'theme'];

  try {
    let jsonText = rawText.trim();

    // Strategy 1: Find {"entities" directly — bypasses thinking tag issues entirely
    const entitiesStart = jsonText.indexOf('{"entities"');
    if (entitiesStart >= 0) {
      // Count braces to find the matching closing brace
      let depth = 0;
      let end = entitiesStart;
      for (let i = entitiesStart; i < jsonText.length; i++) {
        if (jsonText[i] === '{') depth++;
        else if (jsonText[i] === '}') {
          depth--;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
      jsonText = jsonText.slice(entitiesStart, end);
      console.log('[TraceMind] parseLLM: extracted JSON via {"entities"} pattern:', jsonText.substring(0, 200));
    } else {
      // Strategy 2: Find JSON after removing any thinking/reasoning text
      // Look for the last '>' in the text (likely closes a thinking tag),
      // then take everything from the first '{' after it
      const lastGt = jsonText.lastIndexOf('>');
      if (lastGt >= 0 && lastGt > jsonText.length * 0.3) {
        const afterTag = jsonText.slice(lastGt + 1).trim();
        if (afterTag.startsWith('{')) {
          jsonText = afterTag;
        }
      }
      console.log('[TraceMind] parseLLM: after tag removal (first 200):', jsonText.substring(0, 200));

      // Extract JSON from code blocks if present
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }

      // Fallback: find first { to last }
      if (!jsonText.startsWith('{')) {
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonText = jsonText.slice(firstBrace, lastBrace + 1);
        }
      }
      console.log('[TraceMind] parseLLM: final JSON (first 200):', jsonText.substring(0, 200));
    }

    const parsed = JSON.parse(jsonText) as LLMExtractionResult;
    console.log('[TraceMind] parseLLM: parsed JSON:', JSON.stringify(parsed).substring(0, 200));

    if (!parsed.entities || !Array.isArray(parsed.entities)) {
      return { entities: [] };
    }

    // Validate domain
    const validDomains: DomainCategory[] = ['工作', '生活', '学习', '运动', '其他'];
    const domain = typeof parsed.domain === 'string' && validDomains.includes(parsed.domain as DomainCategory)
      ? (parsed.domain as DomainCategory)
      : undefined;

    const entities: LLMExtractedEntity[] = [];

    for (const item of parsed.entities) {
      // Validate required fields
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        continue;
      }
      if (!validTypes.includes(item.type as CardType)) {
        continue;
      }

      entities.push({
        name: item.name.trim(),
        type: item.type as CardType,
        subtype: item.subtype,
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.5,
      });
    }

    return { domain, entities };
  } catch {
    return { entities: [] };
  }
}

/**
 * Call the LLM to extract entities and domain from diary text.
 * Uses the configured AI provider.
 */
export async function extractEntitiesWithLLM(
  diaryText: string,
  options: {
    apiKey: string;
    model: string;
    baseUrl: string;
    profileContext?: string;
  },
): Promise<LLMExtractionOutput> {
  console.log('[TraceMind] LLM extract called, baseUrl:', options.baseUrl, 'model:', options.model);
  const prompt = buildExtractionPrompt(diaryText, options.profileContext);
  // Handle /v1 suffix same as provider-config.ts buildRequest
  const cleanUrl = options.baseUrl.replace(/\/+$/, '');
  const url = cleanUrl.endsWith('/v1') || cleanUrl.endsWith('/chat/completions')
    ? (cleanUrl.endsWith('/chat/completions') ? cleanUrl : `${cleanUrl}/chat/completions`)
    : `${cleanUrl}/v1/chat/completions`;
  console.log('[TraceMind] LLM URL:', url);
  console.log('[TraceMind] LLM prompt:', prompt.substring(0, 200));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 2000,
    }),
  });

  console.log('[TraceMind] LLM response status:', response.status);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM extraction failed: HTTP ${response.status} - ${text}`);
  }

  const body = (await response.json()) as Record<string, unknown>;
  const choices = body.choices as Array<{ message: { content: string } }> | undefined;
  const content = choices?.[0]?.message?.content ?? '';
  console.log('[TraceMind] LLM raw response:', content);

  const output = parseLLMResponse(content);
  console.log('[TraceMind] LLM parsed: domain=', output.domain, 'entities=', output.entities.length, output.entities);
  return output;
}
