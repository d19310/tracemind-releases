/**
 * Entity Extractor - Extract Person/Object/Theme entities from diary text
 */

import { CardType } from '../core/context-card';

export interface ExtractedEntity {
  name: string;
  type: CardType;
  subtype?: string;
  confidence?: number;
}

/**
 * Extract entities from diary text.
 *
 * In production: calls LLM with structured prompt.
 * Returns array of extracted entities.
 */
export function extractEntities(
  diaryText: string,
  _existingEntities: Map<string, { name: string }>,
): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  // Split text into phrases by punctuation for cleaner extraction
  const phrases = diaryText.split(/[，。；！？,\.!\?]+/).filter(s => s.trim());

  for (const phrase of phrases) {
    // Extract person names: 2-3 chars after prefix, before a verb/stop word
    const personRe = /(?:和|与|跟)([\u4e00-\u9fa5]{2,3})(?:了|讨论|开会|见面|吃饭|合作|一起|说|聊|谈|对|交流|沟通|协商|汇报|通知|告诉|给|在|$)/g;
    for (const pm of phrase.matchAll(personRe)) {
      const name = pm[1].trim();
      if (name.length >= 2 && name.length <= 3 && !seen.has(name)) {
        seen.add(name);
        entities.push({ name, type: 'person', confidence: 0.7 });
      }
    }

    // Extract project/object names ending with keywords
    // Use non-greedy match limited to phrase length
    const objectPatterns = [
      /([^\s，。；！？,\.]{2,10}?)(计划|方案|项目|任务|活动|会议|产品|技术)/,
      /(Q[1-4][\u4e00-\u9fa5]{2,10}?(?:计划|方案|项目|会议|活动)?)/,
    ];

    for (const pattern of objectPatterns) {
      const match = phrase.match(pattern);
      if (match) {
        const name = match[1].trim();
        if (name.length >= 2 && !seen.has(name)) {
          seen.add(name);
          entities.push({ name, type: 'object', confidence: 0.6 });
        }
      }
    }
  }

  return entities;
}
