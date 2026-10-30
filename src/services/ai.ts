import { CategorizedAPIError } from '../types';
import { getBrowserId } from './clientIdentity';
export type { CategorizedAPIError };

export function classifyAIError(err: any, statusCode?: number): CategorizedAPIError {
  const isTimeout = err?.name === 'AbortError' || err?.message?.includes('超时') || statusCode === 504;
  if (isTimeout) {
    return {
      kind: 'timeout',
      statusCode: 504,
      message: '请求响应超时（未在限定时间内返回，连接无响应）',
      userHint: '大模型未能及时返回，多因模型并发推理排队或网络拥塞，系统将尝试重新建立请求',
      isRetryable: true
    };
  }

  let rawMsg = String(err?.message || err || '');
  try {
    const json = JSON.parse(rawMsg);
    if (json?.error?.message) rawMsg = json.error.message;
    else if (json?.error && typeof json.error === 'string') rawMsg = json.error;
    else if (json?.message && typeof json.message === 'string') rawMsg = json.message;
  } catch {}

  if (statusCode === 401 || statusCode === 403 || /401|403|unauthorized|invalid[_\s]api[_\s]key|permission/i.test(rawMsg)) {
    return {
      kind: 'auth',
      statusCode: statusCode || 401,
      message: '鉴权认证失败 (API Key 无效或未授权)',
      userHint: 'API Key 不正确、已过期或无权调用该模型，请在右上角「设置」中检查并更新密钥',
      isRetryable: false // 关键：鉴权错误不盲目重试
    };
  }

  if (/quotaexceeded|额度已达上限|超出每日免费/i.test(rawMsg)) {
    return {
      kind: 'quota_exceeded',
      statusCode: 429,
      message: rawMsg || '今日 AI 接口免费额度已达上限 (300次/日)',
      userHint: '今日公共免费调用额度已用尽，您可以在设置中切换为「自定义 AI API」继续使用',
      isRetryable: false
    };
  }

  if (statusCode === 429 || /429|rate[_\s]limit|quota|concurrency|balance|欠费/i.test(rawMsg)) {
    return {
      kind: 'rate_limit',
      statusCode: statusCode || 429,
      message: '接口调用频控或额度耗尽 (429 Too Many Requests)',
      userHint: '模型触发了并发限制或账户配额不足，系统将在稍后避退重试',
      isRetryable: true
    };
  }

  if ((statusCode && statusCode >= 500) || /500|502|503|bad gateway|internal server/i.test(rawMsg)) {
    return {
      kind: 'server',
      statusCode: statusCode || 500,
      message: `模型服务端内部错误 [HTTP ${statusCode || 500}]`,
      userHint: '大模型服务端发生临时异常，系统尝试重连',
      isRetryable: true
    };
  }

  if (statusCode === 400 || /400|context[_\s]length|token[_\s]limit|bad request/i.test(rawMsg)) {
    return {
      kind: 'client',
      statusCode: statusCode || 400,
      message: rawMsg ? `请求参数错误: ${rawMsg}` : '请求参数或输入文本超长 (400 Bad Request)',
      userHint: '文本超出了当前模型上下文长度限制或模型参数配置有误',
      isRetryable: false
    };
  }

  return {
    kind: 'network',
    statusCode,
    message: rawMsg || '网络连接或 DNS 解析异常',
    userHint: '无法与大模型服务器建立连接，请检查本地网络',
    isRetryable: true
  };
}

export interface AIChatOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  timeoutMs?: number;
  maxRetries?: number;
  stream?: boolean;
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high' | 'max';
  onThinking?: (deltaReasoning: string, accumulatedReasoning: string) => void;
  onProgress?: (deltaContent: string, accumulatedContent: string) => void;
  onRetry?: (attempt: number, maxRetries: number, parsedError: CategorizedAPIError) => void;
}

export async function callAI(options: AIChatOptions): Promise<string> {
  const { 
    apiKey, 
    baseUrl, 
    model, 
    messages, 
    temperature = 0.1,
    timeoutMs = 45000,
    maxRetries = 2,
    stream = true,
    reasoningEffort,
    onThinking,
    onProgress,
    onRetry
  } = options;

  let lastError: (Error & { categorized?: CategorizedAPIError }) | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    let timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response: Response;
      let usedProxy = true;

      try {
        const browserId = getBrowserId();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Client-Id': browserId,
          'X-Browser-Id': browserId,
        };
        if (apiKey && apiKey.trim()) {
          headers['Authorization'] = `Bearer ${apiKey.trim()}`;
        }

        // 1. Try local dev proxy endpoint first (avoids CORS)
        response = await fetch('/api/ai', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            apiKey: apiKey.trim() || undefined,
            model: model.trim(),
            baseUrl: baseUrl.trim(),
            messages,
            temperature,
            stream,
            max_tokens: 4096,
            reasoning_effort: reasoningEffort,
            clientId: browserId
          }),
          signal: controller.signal
        });

        if (!response.ok && (response.status === 404 || response.status === 504)) {
          if (response.status === 504) {
            const parsed = classifyAIError(new Error('超时'), 504);
            const err = new Error(parsed.message);
            (err as any).categorized = parsed;
            throw err;
          }
          throw new Error('Proxy not found, falling back to direct');
        }
      } catch (proxyErr: any) {
        if (proxyErr.categorized?.kind === 'timeout' || proxyErr.name === 'AbortError' || proxyErr.message?.includes('超时')) {
          const parsed = classifyAIError(proxyErr, 504);
          const err = new Error(parsed.message);
          (err as any).categorized = parsed;
          throw err;
        }

        usedProxy = false;
        // 2. Direct fallback
        let url = baseUrl.trim();
        if (!url.endsWith('/chat/completions') && !url.includes('/chat/completions')) {
          url = url.replace(/\/+$/, '') + '/chat/completions';
        }

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model: model.trim(),
            messages,
            temperature,
            stream,
            max_tokens: 4096,
            reasoning_effort: reasoningEffort
          }),
          signal: controller.signal
        });
      }

      if (!response.ok) {
        clearTimeout(timeoutTimer);
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch {}
        const parsed = classifyAIError(new Error(errorBody), response.status);
        const err = new Error(parsed.message);
        (err as any).categorized = parsed;
        throw err;
      }

      // Check for streaming SSE response
      const isEventStream = response.headers.get('content-type')?.includes('text/event-stream') || (stream && response.body);
      if (isEventStream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let accumulatedReasoning = '';
        let accumulatedContent = '';

        try {
          while (true) {
            // Reset chunk idle timeout on every chunk arrived
            clearTimeout(timeoutTimer);
            timeoutTimer = setTimeout(() => controller.abort(), 30000);

            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const jsonStr = trimmed.slice(5).trim();
              if (jsonStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed?.choices?.[0]?.delta;
                if (!delta) continue;

                if (delta.reasoning || delta.reasoning_content) {
                  const rText = delta.reasoning || delta.reasoning_content;
                  accumulatedReasoning += rText;
                  onThinking?.(rText, accumulatedReasoning);
                }

                if (delta.content) {
                  accumulatedContent += delta.content;
                  onProgress?.(delta.content, accumulatedContent);
                }
              } catch {}
            }
          }
        } finally {
          clearTimeout(timeoutTimer);
        }

        return accumulatedContent.trim();
      }

      clearTimeout(timeoutTimer);

      const data = await response.json();
      const choice = data?.choices?.[0];
      const content = choice?.message?.content || '';
      if (choice?.message?.reasoning) {
        onThinking?.(choice.message.reasoning, choice.message.reasoning);
      }

      return content.trim();
    } catch (err: any) {
      clearTimeout(timeoutTimer);

      const parsedError: CategorizedAPIError = err.categorized || classifyAIError(err);
      const enhancedError = new Error(parsedError.message);
      (enhancedError as any).categorized = parsedError;
      lastError = enhancedError;

      // Non-retryable error (e.g. 401 Invalid Key, 400 Context Limit): terminate immediately!
      if (!parsedError.isRetryable) {
        throw enhancedError;
      }

      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, maxRetries, parsedError);
        // Exponential backoff delay
        const backoffMs = parsedError.kind === 'rate_limit' ? 2500 : Math.min(1000 * Math.pow(1.5, attempt), 3000);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  throw lastError || new Error(`AI 大模型在 ${maxRetries} 次重试后仍无响应`);
}
