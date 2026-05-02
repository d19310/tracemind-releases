/**
 * AI Provider Configuration - Multi-provider LLM configuration
 */

export type ProviderType = 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface AiProviderConfig {
  provider: ProviderType;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface RequestInit {
  method: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * Validate AI provider configuration
 */
export function validateConfig(config: AiProviderConfig): ValidationResult {
  if (!config.provider) {
    return { valid: false, error: 'provider is required' };
  }
  if (!config.apiKey || config.apiKey.trim() === '') {
    return { valid: false, error: 'apiKey is required' };
  }
  if (!config.model || config.model.trim() === '') {
    return { valid: false, error: 'model is required' };
  }
  return { valid: true };
}

/**
 * Build HTTP request for the given provider and messages
 */
export function buildRequest(
  config: AiProviderConfig,
  messages: ChatMessage[],
): { url: string; headers?: Record<string, string>; body?: string; method?: string } {
  const systemMsg = messages.find(m => m.role === 'system');
  const nonSystem = messages.filter(m => m.role !== 'system');

  switch (config.provider) {
    case 'openai': {
      return {
        url: config.baseUrl || 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
        }),
      };
    }
    case 'anthropic': {
      return {
        url: config.baseUrl || 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey!,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          system: systemMsg?.content,
          messages: nonSystem.map(m => ({ role: m.role, content: m.content })),
        }),
      };
    }
    default: {
      // Ollama and custom use OpenAI-compatible format
      const baseUrl = config.baseUrl || (config.provider === 'ollama'
        ? 'http://localhost:11434'
        : '');
      return {
        url: `${baseUrl}/v1/chat/completions`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
        }),
      };
    }
  }
}

/**
 * Parse AI response from the given provider into a ChatMessage
 */
export function parseResponse(
  provider: ProviderType,
  body: Record<string, unknown>,
): ChatMessage {
  switch (provider) {
    case 'openai': {
      const choices = body.choices as Array<{ message: { role: string; content: string } }> | undefined;
      if (!choices || choices.length === 0) {
        throw new Error('Empty response from OpenAI');
      }
      return { role: 'assistant', content: choices[0].message.content };
    }
    case 'anthropic': {
      const content = body.content as Array<{ type: string; text: string }> | undefined;
      if (!content || content.length === 0) {
        throw new Error('Empty response from Anthropic');
      }
      return { role: 'assistant', content: content[0].text };
    }
    default: {
      // Ollama and custom use OpenAI-compatible format
      const choices = body.choices as Array<{ message: { role: string; content: string } }> | undefined;
      if (!choices || choices.length === 0) {
        throw new Error('Empty response from AI provider');
      }
      return { role: 'assistant', content: choices[0].message.content };
    }
  }
}
