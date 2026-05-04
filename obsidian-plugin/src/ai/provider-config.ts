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

export interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
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
      const url = (config.baseUrl || 'https://api.openai.com').replace(/\/+$/, '');
      const path = url.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
      return {
        url: `${url}${path}`,
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
      const url = baseUrl.replace(/\/+$/, '');
      const path = url.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
      return {
        url: `${url}${path}`,
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
 * Send chat messages to the given AI provider config (non-streaming).
 */
export async function chat(
  messages: ChatMessage[],
  config: AiProviderConfig,
): Promise<{ content: string }> {
  const req = buildRequest(config, messages);
  const res = await fetch(req.url, {
    method: req.method || 'POST',
    headers: req.headers,
    body: req.body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const body = (await res.json()) as Record<string, unknown>;
  const msg = parseResponse(config.provider, body);
  return { content: msg.content };
}

/**
 * Extract a single SSE data line into a text delta for the given provider.
 * Returns empty string for non-delta events, [DONE] sentinels, or parse errors.
 */
export function extractStreamDelta(provider: ProviderType, line: string): string {
  if (!line.startsWith('data: ')) return '';
  const data = line.slice(6).trim();
  if (!data || data === '[DONE]') return '';

  try {
    const parsed = JSON.parse(data);

    if (provider === 'anthropic') {
      // Anthropic SSE: { type: "content_block_delta", delta: { type: "text_delta", text: "..." } }
      if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
        return parsed.delta.text;
      }
      return '';
    }

    // OpenAI / Ollama / Custom: { choices: [{ delta: { content: "..." } }] }
    const choices = parsed.choices as Array<{ delta?: { content?: string } }> | undefined;
    if (choices && choices.length > 0 && choices[0].delta?.content) {
      return choices[0].delta.content;
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Stream chat messages with Server-Sent Events (SSE).
 * Calls callbacks.onDelta for each text chunk, then callbacks.onDone when complete.
 * The request body is built via buildRequest with "stream": true added.
 */
export async function streamChat(
  messages: ChatMessage[],
  config: AiProviderConfig,
  callbacks: StreamCallbacks,
): Promise<void> {
  try {
    const req = buildRequest(config, messages);
    const bodyObj = JSON.parse(req.body || '{}');
    bodyObj.stream = true;

    // Anthropic requires a different streaming header
    const headers: Record<string, string> = {
      ...req.headers,
      'Accept': 'text/event-stream',
    };

    const res = await fetch(req.url, {
      method: req.method || 'POST',
      headers,
      body: JSON.stringify(bodyObj),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    if (!res.body) {
      throw new Error('Response body is null — streaming not supported');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last partial line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const delta = extractStreamDelta(config.provider, trimmed);
        if (delta) {
          fullText += delta;
          callbacks.onDelta(delta);
        }
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      const delta = extractStreamDelta(config.provider, buffer.trim());
      if (delta) {
        fullText += delta;
        callbacks.onDelta(delta);
      }
    }

    callbacks.onDone(fullText);
  } catch (e) {
    callbacks.onError(e as Error);
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
