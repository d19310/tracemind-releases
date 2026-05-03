/**
 * Provider Registry - Resolves which AI provider to use for different tasks.
 * Wraps TraceMind settings for provider lookup.
 */

import type { TraceMindSettings, ProviderConfig } from '../settings-types';

export interface ProviderRegistry {
  getDefaultProvider(): ProviderConfig | null;
  getProviderById(id: string): ProviderConfig | null;
  isReady(): boolean;
}

/**
 * Create a ProviderRegistry from TraceMindSettings.
 */
export function createProviderRegistry(settings: TraceMindSettings): ProviderRegistry {
  return {
    getDefaultProvider(): ProviderConfig | null {
      if (!settings.defaultProviderId) return null;
      return settings.providers.find(p => p.id === settings.defaultProviderId) || null;
    },

    getProviderById(id: string): ProviderConfig | null {
      return settings.providers.find(p => p.id === id) || null;
    },

    isReady(): boolean {
      const provider = this.getDefaultProvider();
      return !!provider && !!provider.apiKey && !!provider.baseUrl;
    },
  };
}
