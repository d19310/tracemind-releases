import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDiaryContent, formatDiaryContent, Block } from '../../src/core/diary-parser';

describe('Diary Parser - Parse Blocks', () => {
  it('parses a single block with timestamp and tags', () => {
    const content = `### 08:00 #工作
今天和张三讨论了Q2营销计划的技术方案。
<!-- TM:b7e3f2a1 -->
`;

    const blocks = parseDiaryContent(content);

    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].timestamp, '08:00');
    assert.equal(blocks[0].content, '今天和张三讨论了Q2营销计划的技术方案。');
    assert.deepEqual(blocks[0].tags, ['工作']);
    assert.equal(blocks[0].blockId, 'b7e3f2a1');
  });

  it('parses multiple blocks', () => {
    const content = `### 08:00 #工作
早上开会。
<!-- TM:aaa11111 -->

### 12:00 #生活
中午和同事吃饭。
<!-- TM:bbb22222 -->
`;

    const blocks = parseDiaryContent(content);

    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].timestamp, '08:00');
    assert.equal(blocks[1].timestamp, '12:00');
  });

  it('parses block with multiple tags', () => {
    const content = `### 09:00 #工作 #项目
项目进度更新。
<!-- TM:ccc33333 -->
`;

    const blocks = parseDiaryContent(content);

    assert.equal(blocks.length, 1);
    assert.deepEqual(blocks[0].tags, ['工作', '项目']);
  });

  it('parses block with child bullets', () => {
    const content = `### 10:00 #工作
主要讨论内容。
- 技术方案确定
- 分工明确
<!-- TM:ddd44444 -->
`;

    const blocks = parseDiaryContent(content);

    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].content, '主要讨论内容。');
    assert.deepEqual(blocks[0].children, ['技术方案确定', '分工明确']);
  });

  it('returns empty array for empty content', () => {
    const blocks = parseDiaryContent('');
    assert.equal(blocks.length, 0);
  });
});

describe('Diary Parser - Format Blocks', () => {
  it('formats blocks back to markdown', () => {
    const blocks: Block[] = [
      {
        timestamp: '08:00',
        content: '早上开会。',
        tags: ['工作'],
        blockId: 'aaa11111',
        children: [],
      },
    ];

    const md = formatDiaryContent(blocks);

    assert.ok(md.includes('### 08:00 #工作'));
    assert.ok(md.includes('早上开会。'));
    assert.ok(md.includes('<!-- TM:aaa11111 -->'));
  });

  it('formats blocks with children', () => {
    const blocks: Block[] = [
      {
        timestamp: '10:00',
        content: '主要讨论内容。',
        tags: ['工作'],
        blockId: 'bbb22222',
        children: ['子项1', '子项2'],
      },
    ];

    const md = formatDiaryContent(blocks);

    assert.ok(md.includes('- 子项1'));
    assert.ok(md.includes('- 子项2'));
  });

  it('roundtrip: parse -> format -> parse produces same blocks', () => {
    const original: Block[] = [
      {
        timestamp: '09:00',
        content: '测试内容',
        tags: ['工作', '项目'],
        blockId: 'test1234',
        children: ['子项A'],
      },
      {
        timestamp: '14:00',
        content: '下午的内容',
        tags: ['生活'],
        blockId: 'test5678',
        children: [],
      },
    ];

    const md = formatDiaryContent(original);
    const parsed = parseDiaryContent(md);

    assert.equal(parsed.length, original.length);
    assert.equal(parsed[0].timestamp, original[0].timestamp);
    assert.equal(parsed[0].content, original[0].content);
    assert.deepEqual(parsed[0].tags, original[0].tags);
    assert.equal(parsed[0].blockId, original[0].blockId);
    assert.deepEqual(parsed[0].children, original[0].children);
  });
});
