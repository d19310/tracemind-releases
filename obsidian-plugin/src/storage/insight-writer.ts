/**
 * Insight Report Writer
 * Handles saving daily insight reports to the vault.
 */

import type { App } from 'obsidian';
import { ensureParentFolder } from '../vault/vault';
import { insightFilePath, formatInsightMarkdown, type InsightReport } from './insight-store';

/**
 * Save an insight report to TraceMind/insights/{date}.md.
 * Overwrites same-date file, does not touch other dates.
 * Ensures the parent directory exists before writing.
 */
export async function saveInsightReport(app: App, report: InsightReport): Promise<string> {
  const path = insightFilePath(report.date);
  await ensureParentFolder(app, path);

  const markdown = formatInsightMarkdown(report);
  const existingFile = app.vault.getFileByPath(path);
  if (existingFile) {
    await app.vault.modify(existingFile, markdown);
  } else {
    await app.vault.create(path, markdown);
  }

  return path;
}
