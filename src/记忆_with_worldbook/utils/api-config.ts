// API 端点类型
export type ApiEndpointType = 'direct' | 'cors-proxy' | 'reverse-proxy' | 'local' | 'cloudflare' | 'custom';

// CORS 代理服务列表
export const CORS_PROXIES = [
  {
    name: 'AllOrigins',
    url: 'https://api.allorigins.win/raw?url=',
    description: '免费公共 CORS 代理（推荐）',
    active: true,
    testUrl: 'https://api.allorigins.win/raw?url=https://api.github.com',
  },
  {
    name: 'CORS.sh',
    url: 'https://cors.sh/',
    description: '备用 CORS 代理',
    active: true,
    testUrl: 'https://cors.sh/https://api.github.com',
  },
  {
    name: 'CORS Anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    description: '需要先访问该网站获取临时访问权限',
    active: false,
    testUrl: 'https://cors-anywhere.herokuapp.com/https://api.github.com',
  },
  {
    name: 'Cloudflare Worker',
    url: 'https://your-worker.workers.dev/',
    description: '使用您自己的 Cloudflare Worker 代理',
    active: false,
    customizable: true,
  },
  {
    name: '自定义代理',
    url: '',
    description: '输入您自己的 CORS 代理地址',
    customizable: true,
  },
];

// API 端点配置
export interface ApiEndpointConfig {
  type: ApiEndpointType;
  baseUrl: string;
  corsProxy?: string;
  customHeaders?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  // 新增配置
  port?: number;
  path?: string;
  protocol?: 'http' | 'https';
  autoDetectPath?: boolean;
  skipCorsCheck?: boolean;
}

// 已知的 API 提供商配置
export const KNOWN_PROVIDERS = {
  openai: {
    pattern: /api\.openai\.com/,
    type: 'direct' as ApiEndpointType,
    defaultPath: '/v1/chat/completions',
    supportsCors: true,
  },
  anthropic: {
    pattern: /api\.anthropic\.com/,
    type: 'direct' as ApiEndpointType,
    defaultPath: '/v1/messages',
    supportsCors: true,
  },
  google: {
    pattern: /generativelanguage\.googleapis\.com/,
    type: 'direct' as ApiEndpointType,
    defaultPath: '/v1beta/openai/chat/completions',
    supportsCors: true,
  },
  groq: {
    pattern: /api\.groq\.com/,
    type: 'direct' as ApiEndpointType,
    defaultPath: '/openai/v1/chat/completions',
    supportsCors: true,
  },
  together: {
    pattern: /api\.together\.xyz/,
    type: 'direct' as ApiEndpointType,
    defaultPath: '/v1/chat/completions',
    supportsCors: true,
  },
  deepseek: {
    pattern: /api\.deepseek\.com/,
    type: 'direct' as ApiEndpointType,
    defaultPath: '/chat/completions',
    supportsCors: true,
  },
  local: {
    pattern: /(localhost|127\.0\.0\.1|\.local)/,
    type: 'local' as ApiEndpointType,
    defaultPath: '/v1/chat/completions',
    supportsCors: false,
  },
  lmstudio: {
    pattern: /localhost:1234/,
    type: 'local' as ApiEndpointType,
    defaultPath: '/v1/chat/completions',
    supportsCors: false,
  },
  ollama: {
    pattern: /localhost:11434/,
    type: 'local' as ApiEndpointType,
    defaultPath: '/api/chat',
    supportsCors: false,
  },
  neuralProxy: {
    pattern: /(localhost|127\.0\.0\.1):(8889|9998)/,
    type: 'reverse-proxy' as ApiEndpointType,
    defaultPath: '/v1/chat/completions',
    supportsCors: true,
  },
};

// 判断是否为本地/局域网地址
function isLocalAddress(hostname: string): boolean {
  // localhost 和 127.0.0.1
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }
  // .local 结尾
  if (hostname.endsWith('.local')) {
    return true;
  }
  // 192.168.x.x 局域网
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }
  // 10.x.x.x 内网
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }
  // 172.16-31.x.x 内网
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }
  return false;
}

// 检测端点类型
export function detectEndpointType(endpoint: string): ApiEndpointType {
  try {
    const url = new URL(endpoint);

    // 1. 先检查已知的官方 API 提供商（排除本地相关的）
    const officialProviders = ['openai', 'anthropic', 'google', 'groq', 'together', 'deepseek'];
    for (const provider of officialProviders) {
      const config = KNOWN_PROVIDERS[provider as keyof typeof KNOWN_PROVIDERS];
      if (config && config.pattern.test(endpoint)) {
        return config.type;
      }
    }

    // 2. 检查是否是本地/局域网地址
    if (isLocalAddress(url.hostname)) {
      // 检查特定的本地服务（LM Studio, Ollama, Neural Proxy 等）
      if (/:(11434)$/.test(url.host)) {
        return 'local'; // Ollama
      }
      if (/:(1234)$/.test(url.host)) {
        return 'local'; // LM Studio
      }
      // 带非标准端口的本地地址，通常是反向代理
      if (url.port && !['80', '443'].includes(url.port)) {
        return 'reverse-proxy';
      }
      return 'local';
    }

    // 3. Cloudflare Worker
    if (url.hostname.endsWith('.workers.dev') || url.hostname.endsWith('.pages.dev')) {
      return 'cloudflare';
    }

    // 4. 已知的 CORS 代理
    if (CORS_PROXIES.some(proxy => proxy.url && endpoint.includes(proxy.url))) {
      return 'cors-proxy';
    }

    // 5. 反向代理特征（非标准端口）
    if (url.port && url.port !== '80' && url.port !== '443') {
      return 'reverse-proxy';
    }

    // 6. 特殊路径模式（可能是反向代理）
    if (url.pathname.includes('/proxy/') || url.pathname.includes('/api/v1/')) {
      return 'reverse-proxy';
    }

    // 默认为直连
    return 'direct';
  } catch {
    return 'custom';
  }
}

// 检测 API 提供商
export function detectApiProvider(endpoint: string): string | null {
  for (const [provider, config] of Object.entries(KNOWN_PROVIDERS)) {
    if (config.pattern.test(endpoint)) {
      return provider;
    }
  }
  return null;
}

// 测试 CORS 代理可用性
export async function testCorsProxy(proxyUrl: string): Promise<boolean> {
  try {
    const testUrl = proxyUrl + encodeURIComponent('https://api.github.com');
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// 获取可用的 CORS 代理
export async function getAvailableCorsProxies(): Promise<string[]> {
  const available: string[] = [];

  for (const proxy of CORS_PROXIES) {
    if (proxy.active && proxy.testUrl) {
      try {
        const response = await fetch(proxy.testUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          available.push(proxy.url);
        }
      } catch {
        // 忽略错误
      }
    }
  }

  return available;
}

// 构建完整的 API URL
export function buildApiUrl(config: ApiEndpointConfig, path: string = '/chat/completions'): string {
  let baseUrl = config.baseUrl.trim();

  // 移除末尾的斜杠
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // 处理端口
  if (config.port) {
    try {
      const url = new URL(baseUrl);
      url.port = config.port.toString();
      baseUrl = url.toString();
    } catch {
      // 如果不是有效的 URL，尝试添加协议
      const protocol = config.protocol || 'https';
      baseUrl = `${protocol}://${baseUrl}:${config.port}`;
    }
  }

  // 根据类型处理 URL
  switch (config.type) {
    case 'cors-proxy':
      if (config.corsProxy) {
        // 使用 CORS 代理包装原始 URL
        const originalUrl = normalizeEndpoint(baseUrl, config.path || path, config);
        return config.corsProxy + encodeURIComponent(originalUrl);
      }
      break;

    case 'reverse-proxy':
      // 反向代理通常已经包含了完整路径
      if (
        baseUrl.includes('/v1/chat/completions') ||
        baseUrl.includes('/chat/completions') ||
        baseUrl.includes('/api/chat')
      ) {
        return baseUrl;
      }
      // 如果有自定义路径，使用它
      if (config.path) {
        return baseUrl + config.path;
      }
      break;

    case 'local': {
      // 本地 API 可能需要特殊处理
      const provider = detectApiProvider(baseUrl);
      if (provider && KNOWN_PROVIDERS[provider]) {
        return normalizeEndpoint(baseUrl, KNOWN_PROVIDERS[provider].defaultPath, config);
      }
      break;
    }

    case 'cloudflare':
      // Cloudflare Worker 通常有自定义路径
      if (config.path) {
        return baseUrl + config.path;
      }
      break;
  }

  // 默认处理
  return normalizeEndpoint(baseUrl, path, config);
}

// 规范化端点
function normalizeEndpoint(endpoint: string, path: string = '/chat/completions', config?: ApiEndpointConfig): string {
  // 检测 API 提供商
  const provider = detectApiProvider(endpoint);

  // 如果是已知的提供商，使用其默认路径
  if (provider && KNOWN_PROVIDERS[provider]) {
    const providerConfig = KNOWN_PROVIDERS[provider];

    // 如果端点已经包含完整路径，直接返回
    if (endpoint.includes(providerConfig.defaultPath)) {
      return endpoint;
    }

    // 否则添加默认路径
    return endpoint + providerConfig.defaultPath;
  }

  // 如果已经包含完整路径，直接返回
  if (
    endpoint.includes('/chat/completions') ||
    endpoint.includes('/models') ||
    endpoint.includes('/v1/messages') ||
    endpoint.includes('/api/chat')
  ) {
    return endpoint;
  }

  // 自动检测路径（如果启用）
  if (config?.autoDetectPath) {
    // 尝试常见的路径模式
    const commonPaths = [
      '/v1/chat/completions',
      '/chat/completions',
      '/api/v1/chat/completions',
      '/openai/v1/chat/completions',
    ];

    // 这里可以添加异步检测逻辑
    // 暂时使用默认路径
  }

  // 添加 /v1 如果需要
  if (!endpoint.endsWith('/v1') && !endpoint.includes('/v1/')) {
    endpoint = endpoint + '/v1';
  }

  // 添加具体路径
  return endpoint + path;
}

// 创建请求配置
export function createRequestConfig(
  config: ApiEndpointConfig,
  apiKey: string,
  additionalHeaders?: Record<string, string>,
): RequestInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    ...config.customHeaders,
    ...additionalHeaders,
  };

  // 对于 CORS 代理，可能需要特殊处理
  if (config.type === 'cors-proxy') {
    // 某些 CORS 代理需要特定的 headers
    headers['X-Requested-With'] = 'XMLHttpRequest';
  }

  return {
    method: 'POST',
    headers,
    mode: config.type === 'local' ? 'cors' : 'cors',
    credentials: 'same-origin',
  };
}

// 错误处理增强
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = `API 请求失败: ${response.status} ${response.statusText}`;
  let errorDetails = '';

  try {
    const errorData = await response.json();
    errorMessage = errorData.error?.message || errorData.message || errorMessage;
    errorDetails = JSON.stringify(errorData, null, 2);
  } catch {
    try {
      errorDetails = await response.text();
    } catch {
      // 忽略
    }
  }

  // 根据状态码提供更详细的错误信息
  switch (response.status) {
    case 401:
      throw new Error('认证失败：请检查 API Key 是否正确');
    case 403:
      if (errorMessage.toLowerCase().includes('leaked')) {
        throw new Error('API Key 已被标记为泄露，请在 API 提供商网站生成新的 Key');
      }
      throw new Error('权限不足：API Key 可能没有相应的权限');
    case 429:
      throw new Error('请求频率限制：请稍后再试');
    case 500:
    case 502:
    case 503:
      throw new Error(`服务器错误 (${response.status})：API 服务暂时不可用，请稍后重试`);
    case 0:
      throw new Error('网络错误：可能是 CORS 问题，建议使用 CORS 代理或配置服务器允许跨域');
    default:
      throw new Error(errorMessage);
  }
}

// 测试 API 连接
export async function testApiConnection(
  config: ApiEndpointConfig,
  apiKey: string,
  model: string,
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const url = buildApiUrl(config);
    const requestConfig = createRequestConfig(config, apiKey);

    const response = await fetch(url, {
      ...requestConfig,
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return {
      success: true,
      message: '连接成功',
      details: {
        model: data.model,
        response: data.choices?.[0]?.message?.content,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
      details: error,
    };
  }
}

// 自动配置建议
export function getEndpointSuggestions(endpoint: string): string[] {
  const suggestions: string[] = [];
  const type = detectEndpointType(endpoint);
  const provider = detectApiProvider(endpoint);

  // 提供商特定建议
  if (provider) {
    suggestions.push(`检测到 ${provider.toUpperCase()} API`);
    const providerConfig = KNOWN_PROVIDERS[provider];
    if (!providerConfig.supportsCors) {
      suggestions.push('⚠️ 该 API 不原生支持 CORS，建议使用 CORS 代理');
    }
  }

  switch (type) {
    case 'local':
      suggestions.push('本地 API 可能遇到 CORS 问题，建议：');
      suggestions.push('1. 在 API 服务器启用 CORS（推荐）');
      suggestions.push('2. 使用 CORS 代理服务');
      suggestions.push('3. 通过反向代理访问');
      if (endpoint.includes('localhost:1234')) {
        suggestions.push('💡 检测到 LM Studio，请在设置中启用 CORS');
      }
      if (endpoint.includes('localhost:11434')) {
        suggestions.push('💡 检测到 Ollama，请使用 --cors 参数启动');
      }
      break;

    case 'direct':
      if (!endpoint.includes('https://')) {
        suggestions.push('⚠️ 建议使用 HTTPS 以提高安全性');
      }
      suggestions.push('如遇到 CORS 错误，可尝试使用 CORS 代理');
      break;

    case 'reverse-proxy':
      suggestions.push('检测到反向代理配置');
      suggestions.push('确保代理服务器正常运行');
      suggestions.push('检查端口号是否正确');
      if (endpoint.includes(':8889') || endpoint.includes(':9998')) {
        suggestions.push('💡 检测到 Neural Proxy，请确保反代服务已启动');
      }
      break;

    case 'cloudflare':
      suggestions.push('检测到 Cloudflare Worker');
      suggestions.push('确保 Worker 已正确部署');
      suggestions.push('检查 Worker 的 CORS 配置');
      break;

    case 'cors-proxy':
      suggestions.push('使用 CORS 代理中');
      suggestions.push('如果速度较慢，可尝试其他代理服务');
      break;
  }

  return suggestions;
}

// 智能配置推荐
export async function getSmartConfig(endpoint: string): Promise<ApiEndpointConfig> {
  const type = detectEndpointType(endpoint);
  const provider = detectApiProvider(endpoint);

  const config: ApiEndpointConfig = {
    type,
    baseUrl: endpoint,
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  };

  // 根据类型设置默认配置
  switch (type) {
    case 'local': {
      // 本地 API 需要 CORS 代理
      const availableProxies = await getAvailableCorsProxies();
      if (availableProxies.length > 0) {
        config.type = 'cors-proxy';
        config.corsProxy = availableProxies[0];
      }
      break;
    }

    case 'reverse-proxy':
      // 反向代理可能需要自定义路径
      if (!endpoint.includes('/chat/completions')) {
        config.autoDetectPath = true;
      }
      break;

    case 'cloudflare':
      // Cloudflare Worker 通常有自定义配置
      config.customHeaders = {
        'CF-Access-Client-Id': '',
        'CF-Access-Client-Secret': '',
      };
      break;
  }

  // 提供商特定配置
  if (provider && KNOWN_PROVIDERS[provider]) {
    const providerConfig = KNOWN_PROVIDERS[provider];
    if (!providerConfig.supportsCors && type !== 'cors-proxy') {
      // 自动启用 CORS 代理
      const availableProxies = await getAvailableCorsProxies();
      if (availableProxies.length > 0) {
        config.type = 'cors-proxy';
        config.corsProxy = availableProxies[0];
      }
    }
  }

  return config;
}

/**
 * 检查是否是本地端点（本地端点不需要 API Key）
 * @param endpoint API 端点 URL
 * @param apiProvider API 提供商（可选）
 * @returns 是否是本地端点
 */
export function isLocalEndpoint(endpoint: string, apiProvider?: string): boolean {
  // 如果选择了本地反代提供商，直接返回 true
  if (apiProvider === 'local-proxy') return true;
  if (!endpoint) return false;
  return endpoint.includes('localhost') || endpoint.includes('127.0.0.1');
}

/**
 * 检查 API 配置是否有效（本地端点不需要 API Key）
 * @param endpoint API 端点
 * @param apiKey API Key
 * @param apiProvider API 提供商（可选）
 * @returns 配置是否有效
 */
export function isApiConfigValid(endpoint: string, apiKey: string, apiProvider?: string): boolean {
  if (!endpoint) return false;
  if (isLocalEndpoint(endpoint, apiProvider)) return true;
  return !!apiKey;
}

/**
 * 获取 API 配置错误信息
 * @param endpoint API 端点
 * @param apiProvider API 提供商（可选）
 * @returns 错误信息
 */
export function getApiConfigError(endpoint: string, apiProvider?: string): string {
  if (!endpoint) return '请先配置 API 端点';
  if (isLocalEndpoint(endpoint, apiProvider)) return '请先配置 API 端点';
  return '请先配置 API 端点和 API Key';
}
