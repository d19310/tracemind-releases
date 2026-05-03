/**
 * TraceMind Settings types - pure module with no Obsidian dependency.
 * Settings UI imports from here; tests import from here.
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
  defaultProviderId: string;
  agentProviderMapping: {
    analysis: string;
    chat: string;
  };
}

export const DEFAULT_SETTINGS: TraceMindSettings = {
  providers: [],
  defaultProviderId: '',
  agentProviderMapping: {
    analysis: '',
    chat: '',
  },
};
