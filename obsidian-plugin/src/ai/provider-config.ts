/**
 * AI Provider Configuration - Multi-provider LLM configuration
 */

export type ProviderType = 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface AiProviderConfig {
  provider: ProviderType;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  enableThinking?: boolean;
  reasoningEffort?: '' | 'high' | 'max';
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
    return { valid: false, error: 'AI Provider 类型缺失' };
  }
  // Ollama does not require an API key
  if (config.provider !== 'ollama') {
    if (!config.apiKey || config.apiKey.trim() === '') {
      return { valid: false, error: 'AI Provider API Key 未配置' };
    }
  }
  if (!config.model || config.model.trim() === '') {
    return { valid: false, error: 'AI Provider 模型未配置' };
  }
  return { valid: true };
}

/**
 * Extract a safe, short error message from a provider HTTP response body.
 * Never leaks full response bodies, API keys, or request details.
 */
const MAX_SUMMARY_LENGTH = 200;

function maskSecrets(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9_-]{20,}/g, 'sk-***')
    .replace(/Bearer\s+[a-zA-Z0-9._\-+=]+/gi, 'Bearer ***')
    .replace(/x-api-key:\s*\S+/gi, 'x-api-key: ***');
}

export function summarizeProviderErrorBody(bodyText: string): string {
  // Try JSON with common error formats
  let message: string;
  try {
    const obj = JSON.parse(bodyText);
    message = obj.error?.message
      || obj.message
      || '';
  } catch {
    message = bodyText;
  }

  // Clean and truncate
  const cleaned = String(message).trim().replace(/\n/g, ' ');
  const truncated = cleaned.slice(0, MAX_SUMMARY_LENGTH);
  if (!truncated) return '(empty response)';

  return maskSecrets(truncated);
}

/**
 * Build a safe Error from a non-OK fetch Response.
 * Reads the body once and applies summarizeProviderErrorBody.
 */
export async function createProviderHttpError(res: Response): Promise<Error> {
  const bodyText = await res.text().catch(() => '');
  const summary = summarizeProviderErrorBody(bodyText);
  return new Error(`AI Provider 请求失败 (HTTP ${res.status}): ${summary}`);
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
      const openaiEffort = config.reasoningEffort || (config.enableThinking ? 'high' : undefined);
      const bodyObj: Record<string, unknown> = { model: config.model, messages };
      if (openaiEffort) { bodyObj['reasoning_effort'] = openaiEffort; }
      return {
        url: `${url}${path}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
      };
    }
    case 'anthropic': {
      const bodyObj: Record<string, unknown> = {
        model: config.model,
        system: systemMsg?.content,
        messages: nonSystem.map(m => ({ role: m.role, content: m.content })),
      };
      if (config.enableThinking || config.reasoningEffort) {
        bodyObj['thinking'] = { type: 'adaptive', effort: config.reasoningEffort || 'high' };
      }
      return {
        url: config.baseUrl || 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: { 'x-api-key': config.apiKey!, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
      };
    }
    default: {
      // Ollama and custom use OpenAI-compatible format
      const baseUrl = config.baseUrl || (config.provider === 'ollama'
        ? 'http://localhost:11434'
        : '');
      const url = baseUrl.replace(/\/+$/, '');
      const path = url.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
      const customEffort = config.reasoningEffort || (config.enableThinking ? 'high' : undefined);
      const bodyObj: Record<string, unknown> = { model: config.model, messages };
      if (customEffort) { bodyObj['reasoning_effort'] = customEffort; }
      return {
        url: `${url}${path}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify(bodyObj),
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
  const validation = validateConfig(config);
  if (!validation.valid) {
    throw new Error(validation.error!);
  }

  const req = buildRequest(config, messages);
  const res = await fetch(req.url, {
    method: req.method || 'POST',
    headers: req.headers,
    body: req.body,
  });
  if (!res.ok) {
    throw await createProviderHttpError(res);
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
  const validation = validateConfig(config);
  if (!validation.valid) {
    callbacks.onError(new Error(validation.error!));
    return;
  }

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
      throw await createProviderHttpError(res);
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
