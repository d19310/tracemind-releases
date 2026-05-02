/**
 * TraceMind Plugin Settings - Types and defaults
 */

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  enableThinking?: boolean;
  reasoningEffort?: '' | 'high' | 'max';
}

export interface TraceMindSettings {
  providers: ProviderConfig[];
  vaultRoot: string;
  defaultProviderId: string;
}

export const DEFAULT_SETTINGS: TraceMindSettings = {
  providers: [],
  vaultRoot: 'TraceMindVault',
  defaultProviderId: '',
};
