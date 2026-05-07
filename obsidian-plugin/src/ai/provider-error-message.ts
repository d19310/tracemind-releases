/**
 * Provider Error Message — translates raw provider errors into
 * user-friendly Chinese messages for settings UI display.
 */

const PATTERNS: Array<{ test: (msg: string) => boolean; prefix: string }> = [
  {
    test: (m) => m.includes('API Key') || m.includes('Invalid API key') || m.includes('invalid x-api-key') || m.includes('Incorrect API key'),
    prefix: 'API Key 无效或未配置，请检查 API Key 是否正确',
  },
  {
    test: (m) => m.includes('401'),
    prefix: '认证失败 (HTTP 401)，请检查 API Key 和权限',
  },
  {
    test: (m) => m.includes('403'),
    prefix: '权限不足 (HTTP 403)，请检查 API Key 是否有访问权限',
  },
  {
    test: (m) => m.includes('429'),
    prefix: '请求频率超限 (HTTP 429)，请稍后重试或检查 API 额度',
  },
  {
    test: (m) => m.includes('model') && (m.includes('not found') || m.includes('does not exist') || m.includes('模型')),
    prefix: '模型名称无效或不可用，请检查模型名称是否正确',
  },
  {
    test: (m) => (m.includes('fetch failed') || m.includes('Failed to fetch') || m.includes('ENOTFOUND') || m.includes('ECONNREFUSED')) && (m.includes('localhost:11434') || m.includes('127.0.0.1:11434')),
    prefix: '无法连接 Ollama，请确认 Ollama 已启动 (localhost:11434)',
  },
  {
    test: (m) => m.includes('fetch failed') || m.includes('Failed to fetch') || m.includes('ENOTFOUND') || m.includes('ECONNREFUSED'),
    prefix: '网络连接失败，请检查 Base URL 和网络连接',
  },
  {
    test: (m) => m.includes('timeout') || m.includes('ETIMEDOUT'),
    prefix: '连接超时，请检查网络或 Base URL 是否正确',
  },
];

export function formatProviderTestError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);

  for (const pattern of PATTERNS) {
    if (pattern.test(raw)) {
      return `${pattern.prefix}\n(${raw.slice(0, 150)})`;
    }
  }

  // Unknown error — show truncated original
  return `连接失败: ${raw.slice(0, 200)}`;
}
