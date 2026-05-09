export const DIARY_ATTACHMENTS_DIR = 'Daily/attachments';

export function sanitizeAttachmentFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').split('').filter(c => c.charCodeAt(0) > 31 && c.charCodeAt(0) !== 127).join('').trim();
  return cleaned || 'attachment';
}

export function makeUniqueAttachmentPath(
  originalName: string,
  exists: (path: string) => boolean,
): string {
  const safe = sanitizeAttachmentFileName(originalName);
  const extIndex = safe.lastIndexOf('.');
  const baseName = extIndex > 0 ? safe.slice(0, extIndex) : safe;
  const ext = extIndex > 0 ? safe.slice(extIndex) : '';

  let path = `${DIARY_ATTACHMENTS_DIR}/${baseName}${ext}`;
  if (!exists(path)) return path;

  for (let i = 1; i < 100; i++) {
    path = `${DIARY_ATTACHMENTS_DIR}/${baseName}-${i}${ext}`;
    if (!exists(path)) return path;
  }

  // Fallback with timestamp
  return `${DIARY_ATTACHMENTS_DIR}/${baseName}-${Date.now()}${ext}`;
}

export function attachmentEmbed(path: string): string {
  return `![[${path}]]`;
}

export function insertAtCursorValue(
  value: string,
  insertText: string,
  selectionStart: number,
  selectionEnd: number,
): { value: string; cursor: number } {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const prefix = before.length > 0 && before[before.length - 1] !== '\n' ? '\n' : '';
  const suffix = after.length > 0 && after[0] !== '\n' ? '\n' : '';
  const newValue = before + prefix + insertText + suffix + after;
  const cursor = before.length + prefix.length + insertText.length;
  return { value: newValue, cursor };
}
