import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeAttachmentFileName, makeUniqueAttachmentPath, attachmentEmbed, insertAtCursorValue, DIARY_ATTACHMENTS_DIR,
} from '../../src/storage/diary-attachments';

describe('sanitizeAttachmentFileName', () => {
  it('keeps valid names unchanged', () => {
    assert.equal(sanitizeAttachmentFileName('报告.pdf'), '报告.pdf');
  });

  it('replaces slash with underscore', () => {
    assert.equal(sanitizeAttachmentFileName('a/b.pdf'), 'a_b.pdf');
  });

  it('replaces backslash colon star question quote angle pipe', () => {
    assert.equal(sanitizeAttachmentFileName('a\\:*?"<>|.pdf'), 'a________.pdf');
  });

  it('falls back to "attachment" for empty name', () => {
    assert.equal(sanitizeAttachmentFileName(''), 'attachment');
    assert.equal(sanitizeAttachmentFileName('   '), 'attachment');
  });

  it('trims whitespace', () => {
    assert.equal(sanitizeAttachmentFileName('  hello.pdf  '), 'hello.pdf');
  });
});

describe('makeUniqueAttachmentPath', () => {
  it('returns base path when no conflict', () => {
    const s = new Set<string>();
    assert.equal(makeUniqueAttachmentPath('报告.pdf', p => s.has(p)), `${DIARY_ATTACHMENTS_DIR}/报告.pdf`);
  });

  it('generates name-1.ext on conflict', () => {
    const s = new Set<string>([`${DIARY_ATTACHMENTS_DIR}/报告.pdf`]);
    assert.equal(makeUniqueAttachmentPath('报告.pdf', p => s.has(p)), `${DIARY_ATTACHMENTS_DIR}/报告-1.pdf`);
  });

  it('increments number on multiple conflicts', () => {
    const s = new Set<string>([`${DIARY_ATTACHMENTS_DIR}/报告.pdf`, `${DIARY_ATTACHMENTS_DIR}/报告-1.pdf`]);
    assert.equal(makeUniqueAttachmentPath('报告.pdf', p => s.has(p)), `${DIARY_ATTACHMENTS_DIR}/报告-2.pdf`);
  });

  it('handles name without extension', () => {
    assert.equal(makeUniqueAttachmentPath('README', () => false), `${DIARY_ATTACHMENTS_DIR}/README`);
  });
});

describe('attachmentEmbed', () => {
  it('wraps path in embed syntax', () => {
    assert.equal(attachmentEmbed('Daily/attachments/a.pdf'), '![[Daily/attachments/a.pdf]]');
  });
});

describe('insertAtCursorValue', () => {
  it('inserts at cursor position', () => {
    const result = insertAtCursorValue('hello world', 'X', 5, 5);
    assert.equal(result.value, 'hello\nX\n world');
  });

  it('replaces selection', () => {
    const result = insertAtCursorValue('hello world', 'X', 0, 5);
    assert.equal(result.value, 'X\n world');
  });

  it('returns correct cursor position', () => {
    const result = insertAtCursorValue('hello world', 'X', 5, 5);
    // "hello\nX" = 7 chars
    assert.equal(result.cursor, 7);
  });

  it('handles empty text', () => {
    const result = insertAtCursorValue('', 'X', 0, 0);
    assert.equal(result.value, 'X');
    assert.equal(result.cursor, 1);
  });
});
