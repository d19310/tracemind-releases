/**
 * Chat Action Parser
 *
 * Parses [TRACEMIND_ACTION] blocks from LLM chat responses.
 * These blocks allow the LLM to trigger vault operations (search, create, update, etc.)
 * while maintaining a natural language conversation.
 */

export interface ChatAction {
  action: 'search_entity' | 'get_entity' | 'create_entity' | 'update_entity' | 'list_diary' | 'get_diary';
  type?: string;
  name?: string;
  attributes?: Record<string, string>;
  date?: string;
  dateRange?: string;
  diaryPath?: string;
}

export interface ParsedChatResponse {
  /** Text content without action blocks (for display) */
  text: string;
  /** Parsed actions */
  actions: ChatAction[];
}

/**
 * Parse [TRACEMIND_ACTION] ... [/TRACEMIND_ACTION] blocks from LLM response.
 * Extracts JSON actions and removes blocks from display text.
 */
export function parseChatResponse(raw: string): ParsedChatResponse {
  const actions: ChatAction[] = [];
  // Match [TRACEMIND_ACTION]...[/TRACEMIND_ACTION] with flexible whitespace
  const actionRegex = /\[TRACEMIND_ACTION\]\s*\n?([\s\S]*?)\n?\s*\[\/TRACEMIND_ACTION\]/g;

  let text = raw;
  let match;
  while ((match = actionRegex.exec(raw)) !== null) {
    try {
      const jsonStr = match[1].trim();
      const action = JSON.parse(jsonStr) as ChatAction;
      actions.push(action);
      text = text.replace(match[0], '');
    } catch {
      // Invalid JSON — leave block in text as-is
    }
  }

  // Clean up orphan tags and stray JSON (LLM may forget the opening tag)
  // 1. Strip orphan [/TRACEMIND_ACTION]
  text = text.replace(/\[\/TRACEMIND_ACTION\]/g, '');
  // 2. Strip orphan [TRACEMIND_ACTION]
  text = text.replace(/\[TRACEMIND_ACTION\]/g, '');
  // 3. Strip stray JSON objects that look like actions (between text and end)
  text = text.replace(/\n?\s*\{\s*"action"\s*:\s*"[^"]+"[\s\S]*?\}\s*$/g, '');

  return {
    text: text.trim(),
    actions,
  };
}
