/**
 * Settings Provider Utils — pure helpers for provider CRUD.
 * Separated from settings UI so the logic is testable.
 */

import type { TraceMindSettings, ProviderConfig } from './settings-types';

export function updateProviderById(
  settings: TraceMindSettings,
  providerId: string,
  patch: Partial<ProviderConfig>,
): TraceMindSettings {
  const providers = settings.providers.map(p =>
    p.id === providerId ? { ...p, ...patch, id: providerId } : p,
  );
  return { ...settings, providers };
}

export function deleteProviderById(
  settings: TraceMindSettings,
  providerId: string,
): TraceMindSettings {
  const providers = settings.providers.filter(p => p.id !== providerId);
  let defaultProviderId = settings.defaultProviderId;
  if (defaultProviderId === providerId) {
    defaultProviderId = providers[0]?.id || '';
  }
  const agentProviderMapping = { ...settings.agentProviderMapping };
  if (agentProviderMapping.analysis === providerId) {
    agentProviderMapping.analysis = '';
  }
  if (agentProviderMapping.chat === providerId) {
    agentProviderMapping.chat = '';
  }
  return { ...settings, providers, defaultProviderId, agentProviderMapping };
}
