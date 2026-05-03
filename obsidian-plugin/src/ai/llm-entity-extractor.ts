/**
 * LLM Entity Extractor - Calls LLM for entity extraction from diary text.
 * Complements the rule-based extractor in entity-extractor.ts.
 */

import { CardType } from '../core/context-card';

export interface LLMExtractedEntity {
  name: string;
  type: CardType;
  subtype?: string;
  confidence: number;
}

export interface LLMExtractionResult {
  entities: Array<{
    name: string;
    type: string;
    subtype?: string;
    confidence?: number;
  }>;
}

/**
 * Build a prompt for LLM entity extraction.
 * Returns a system prompt + user message combined as a single string.
 */
export function buildExtractionPrompt(diaryText: string): string {
  return `You are an entity extraction specialist. Extract all named entities from the given diary text.

Return a JSON object with an "entities" array. Each entity must have:
- "name": the entity name (string, required)
- "type": one of "person", "object", or "theme" (required)
- "subtype": for objects, one of: project, task, product, technology, document, location, other (optional)
- "confidence": number between 0.0 and 1.0 (optional, defaults to 0.5)

Rules:
- "person": named individuals (e.g., 张三, John Smith)
- "object": projects, tasks, products, technologies, documents, locations
- "theme": recurring topics, habits, states, domains, decisions

Example output:
{
  "entities": [
    { "name": "张三", "type": "person", "confidence": 0.9 },
    { "name": "Q2计划", "type": "object", "subtype": "project", "confidence": 0.8 },
    { "name": "远程工作", "type": "theme", "confidence": 0.7 }
  ]
}

Return ONLY valid JSON. No markdown, no explanation.

Diary text:
${diaryText}`;
}

/**
 * Parse LLM response JSON into validated LLMExtractedEntity array.
 * Handles markdown code blocks, missing fields, and malformed JSON.
 */
export function parseLLMResponse(rawText: string): LLMExtractedEntity[] {
  const validTypes: CardType[] = ['person', 'object', 'theme'];

  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonText = rawText.trim();
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonText) as LLMExtractionResult;

    if (!parsed.entities || !Array.isArray(parsed.entities)) {
      return [];
    }

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

    return entities;
  } catch {
    return [];
  }
}

/**
 * Call the LLM to extract entities from diary text.
 * Uses the configured AI provider.
 */
export async function extractEntitiesWithLLM(
  diaryText: string,
  options: {
    apiKey: string;
    model: string;
    baseUrl: string;
  },
): Promise<LLMExtractedEntity[]> {
  const prompt = buildExtractionPrompt(diaryText);

  const response = await fetch(options.baseUrl.endsWith('/chat/completions') ? options.baseUrl : `${options.baseUrl}/chat/completions`, {
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

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM extraction failed: HTTP ${response.status} - ${text}`);
  }

  const body = (await response.json()) as Record<string, unknown>;
  const choices = body.choices as Array<{ message: { content: string } }> | undefined;
  const content = choices?.[0]?.message?.content ?? '';

  return parseLLMResponse(content);
}
