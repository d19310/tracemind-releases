/**
 * Tests for ChatAction Parser
 * Parses [TRACEMIND_ACTION] blocks from LLM responses.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Types and parser (will move to src/ai/ when implemented)
interface ChatAction {
  action: 'search_entity' | 'get_entity' | 'create_entity' | 'update_entity' | 'list_diary' | 'get_diary';
  type?: string;
  name?: string;
  attributes?: Record<string, string>;
  dateRange?: string;
}

interface ParsedChatResponse {
  /** Text content without action blocks */
  text: string;
  /** Parsed actions */
  actions: ChatAction[];
}

/**
 * Parse [TRACEMIND_ACTION] blocks from LLM response text.
 */
function parseChatResponse(raw: string): ParsedChatResponse {
  const actions: ChatAction[] = [];
  const actionRegex = /\[TRACEMIND_ACTION\]\n([\s\S]*?)\n\[\/TRACEMIND_ACTION\]/g;

  let text = raw;
  let match;
  while ((match = actionRegex.exec(raw)) !== null) {
    try {
      const action = JSON.parse(match[1]) as ChatAction;
      actions.push(action);
      // Remove the action block from display text
      text = text.replace(match[0], '');
    } catch {
      // Invalid JSON in action block — leave as-is
    }
  }

  return {
    text: text.trim(),
    actions,
  };
}

describe('ChatAction Parser', () => {
  describe('parseChatResponse', () => {
    it('returns empty actions for plain text', () => {
      const result = parseChatResponse('你好，有什么可以帮你的？');
      assert.equal(result.actions.length, 0);
      assert.equal(result.text, '你好，有什么可以帮你的？');
    });

    it('parses a single update_entity action', () => {
      const raw = `好的，我来更新张三的公司信息。

[TRACEMIND_ACTION]
{"action":"update_entity","type":"person","name":"张三","attributes":{"company":"字节跳动"}}
[/TRACEMIND_ACTION]

已更新张三的档案。`;

      const result = parseChatResponse(raw);
      assert.equal(result.actions.length, 1);
      assert.equal(result.actions[0].action, 'update_entity');
      assert.equal(result.actions[0].type, 'person');
      assert.equal(result.actions[0].name, '张三');
      assert.deepEqual(result.actions[0].attributes, { company: '字节跳动' });
      // Action block should be removed from display text
      assert.ok(!result.text.includes('TRACEMIND_ACTION'));
      assert.ok(result.text.includes('好的，我来更新'));
      assert.ok(result.text.includes('已更新张三'));
    });

    it('parses a create_entity action', () => {
      const raw = `[TRACEMIND_ACTION]
{"action":"create_entity","type":"object","name":"Q3规划","attributes":{"subtype":"project","status":"规划中"}}
[/TRACEMIND_ACTION]

已创建 Q3规划 的档案。`;

      const result = parseChatResponse(raw);
      assert.equal(result.actions.length, 1);
      assert.equal(result.actions[0].action, 'create_entity');
      assert.equal(result.actions[0].name, 'Q3规划');
      assert.deepEqual(result.actions[0].attributes, { subtype: 'project', status: '规划中' });
    });

    it('parses multiple actions in one response', () => {
      const raw = `我来同时创建两个实体：

[TRACEMIND_ACTION]
{"action":"create_entity","type":"person","name":"李四","attributes":{"company":"腾讯","role":"工程师"}}
[/TRACEMIND_ACTION]

[TRACEMIND_ACTION]
{"action":"update_entity","type":"object","name":"910c项目","attributes":{"status":"已完成"}}
[/TRACEMIND_ACTION]

已完成操作。`;

      const result = parseChatResponse(raw);
      assert.equal(result.actions.length, 2);
      assert.equal(result.actions[0].action, 'create_entity');
      assert.equal(result.actions[1].action, 'update_entity');
      // Both action blocks removed
      assert.ok(!result.text.includes('TRACEMIND_ACTION'));
    });

    it('parses search_entity action', () => {
      const raw = `让我查一下。

[TRACEMIND_ACTION]
{"action":"search_entity","name":"卢晏","type":"person"}
[/TRACEMIND_ACTION]`;

      const result = parseChatResponse(raw);
      assert.equal(result.actions.length, 1);
      assert.equal(result.actions[0].action, 'search_entity');
      assert.equal(result.actions[0].name, '卢晏');
    });

    it('parses get_diary action with date range', () => {
      const raw = `[TRACEMIND_ACTION]
{"action":"list_diary","dateRange":"last_week"}
[/TRACEMIND_ACTION]`;

      const result = parseChatResponse(raw);
      assert.equal(result.actions[0].action, 'list_diary');
      assert.equal(result.actions[0].dateRange, 'last_week');
    });

    it('handles malformed JSON in action block gracefully', () => {
      const raw = `[TRACEMIND_ACTION]
{not valid json}
[/TRACEMIND_ACTION]
一些正常文本。`;

      const result = parseChatResponse(raw);
      assert.equal(result.actions.length, 0);
      // Malformed block stays in text
      assert.ok(result.text.includes('not valid json'));
    });

    it('handles response with no action blocks', () => {
      const result = parseChatResponse('这是一条普通的回复，没有任何操作。');
      assert.equal(result.actions.length, 0);
      assert.equal(result.text, '这是一条普通的回复，没有任何操作。');
    });

    it('handles empty response', () => {
      const result = parseChatResponse('');
      assert.equal(result.actions.length, 0);
      assert.equal(result.text, '');
    });

    it('removes action blocks surrounded by natural text', () => {
      const raw = `我来帮你查看。

[TRACEMIND_ACTION]
{"action":"get_entity","type":"person","name":"王洁"}
[/TRACEMIND_ACTION]

以下是王洁的信息：公司：临港算力，职位：客户经理。`;

      const result = parseChatResponse(raw);
      assert.equal(result.actions.length, 1);
      assert.ok(result.text.startsWith('我来帮你查看'));
      assert.ok(result.text.includes('以下是王洁'));
      assert.ok(!result.text.includes('TRACEMIND_ACTION'));
    });
  });
});
