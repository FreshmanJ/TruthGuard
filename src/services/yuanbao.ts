import { YuanbaoSource, CategorizedAPIError } from '../types';

export function classifyYuanbaoError(err: any, statusCode?: number, errorCode?: string): CategorizedAPIError {
  const isTimeout = err?.name === 'AbortError' || err?.message?.includes('超时') || statusCode === 504;
  if (isTimeout) {
    return {
      kind: 'timeout',
      statusCode: 504,
      message: '元宝搜索接口响应超时（未在限定时间内返回，网关无响应）',
      userHint: '腾讯云元宝搜索网关未在限定时间内返回，系统将尝试重新建立请求',
      isRetryable: true
    };
  }

  const rawMsg = String(err?.message || errorCode || err || '');

  if (statusCode === 401 || statusCode === 403 || /401|403|AuthFailure|Unauthorized|InvalidSecretId|SignatureFailure/i.test(rawMsg)) {
    return {
      kind: 'auth',
      statusCode: statusCode || 401,
      message: '元宝搜索鉴权认证失败 (API Key 无效或未授权)',
      userHint: '腾讯云 API Key / SecretId 无效或已欠费冻结，请在设置中检查更新密钥',
      isRetryable: false // 鉴权错误不重试，立即上报避免白等
    };
  }

  if (statusCode === 429 || /429|ResourceInsufficient|LimitExceeded|RequestLimitExceeded|频控|quota/i.test(rawMsg)) {
    return {
      kind: 'rate_limit',
      statusCode: statusCode || 429,
      message: '元宝搜索接口频控超限或配额不足 (429)',
      userHint: '超出腾讯云元宝搜索每秒请求频控，系统将在稍后避退重试',
      isRetryable: true
    };
  }

  if ((statusCode && statusCode >= 500) || /500|502|503|InternalError|服务不可用/i.test(rawMsg)) {
    return {
      kind: 'server',
      statusCode: statusCode || 500,
      message: `元宝搜索服务端异常 [HTTP ${statusCode || 500}]`,
      userHint: '腾讯云元宝搜索网关发生临时服务抖动，系统尝试重连',
      isRetryable: true
    };
  }

  if (statusCode === 400 || /400|InvalidParameter|MissingParameter/i.test(rawMsg)) {
    return {
      kind: 'client',
      statusCode: statusCode || 400,
      message: '元宝搜索参数错误 (400 Bad Request)',
      userHint: '请求参数或关键词格式不符合腾讯云规范',
      isRetryable: false
    };
  }

  return {
    kind: 'network',
    statusCode,
    message: rawMsg || '元宝搜索网络连接异常',
    userHint: '无法与腾讯云元宝搜索服务器建立连接，请检查本地网络',
    isRetryable: true
  };
}

export interface YuanbaoSearchOptions {
  query: string;
  cnt?: number;
  apiKey: string;
  timeoutMs?: number;
  maxRetries?: number;
  onRetry?: (attempt: number, maxRetries: number, error: CategorizedAPIError) => void;
}

export async function searchYuanbao(options: YuanbaoSearchOptions): Promise<YuanbaoSource[]> {
  const { 
    query, 
    cnt = 10, 
    apiKey, 
    timeoutMs = 12000, 
    maxRetries = 2,
    onRetry 
  } = options;

  if (!query || !query.trim()) return [];

  const cleanApiKey = (apiKey || '')
    .replace(/^Bearer\s+/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  // Tencent WSA SearchPro Cnt defaults to standard 10
  const rawCnt = Number(cnt || 10);
  const targetCnt = [10, 20, 30, 40, 50].includes(rawCnt) ? rawCnt : 10;

  let lastError: (Error & { categorized?: CategorizedAPIError }) | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response: Response;

      try {
        // 1. Try local dev proxy endpoint first (avoids CORS)
        response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${cleanApiKey}`
          },
          body: JSON.stringify({
            Query: query.trim(),
            Cnt: targetCnt
          }),
          signal: controller.signal
        });

        if (!response.ok && (response.status === 404 || response.status === 504)) {
          if (response.status === 504) {
            const parsed = classifyYuanbaoError(new Error('超时'), 504);
            const err = new Error(parsed.message);
            (err as any).categorized = parsed;
            throw err;
          }
          throw new Error('Proxy not found, falling back to direct');
        }
      } catch (proxyErr: any) {
        if (proxyErr.categorized?.kind === 'timeout' || proxyErr.name === 'AbortError' || proxyErr.message?.includes('超时')) {
          const parsed = classifyYuanbaoError(proxyErr, 504);
          const err = new Error(parsed.message);
          (err as any).categorized = parsed;
          throw err;
        }

        // 2. Direct fallback
        response = await fetch('https://api.wsa.cloud.tencent.com/SearchPro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${cleanApiKey}`
          },
          body: JSON.stringify({
            Query: query.trim(),
            Cnt: targetCnt
          }),
          signal: controller.signal
        });
      }

      clearTimeout(timeoutTimer);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {}
        const parsed = classifyYuanbaoError(new Error(errorText), response.status);
        const err = new Error(parsed.message);
        (err as any).categorized = parsed;
        throw err;
      }

      const data = await response.json();
      if (data?.Response?.Error) {
        const errorDetail = data.Response.Error.Message || data.Response.Error.Code;
        const parsed = classifyYuanbaoError(
          new Error(`${data.Response.Error.Code}: ${errorDetail}`),
          undefined,
          data.Response.Error.Code
        );
        const err = new Error(`${parsed.message} (${errorDetail})`);
        (err as any).categorized = parsed;
        throw err;
      }

      const pagesRaw = data?.Response?.Pages || [];
      const results: YuanbaoSource[] = [];

      for (const pageStr of pagesRaw) {
        try {
          const p = typeof pageStr === 'string' ? JSON.parse(pageStr) : pageStr;
          results.push({
            title: p.title || '权威信息来源',
            url: p.url || '',
            site: p.site || (p.url ? new URL(p.url).hostname : '权威信源'),
            favicon: p.favicon || undefined,
            date: p.date || undefined,
            score: typeof p.score === 'number' ? p.score : 0.5,
            passage: p.passage || p.content || '',
            pics: p.pics || []
          });
        } catch (e) {
          console.warn('解析元宝搜索单条记录异常:', e);
        }
      }

      return results;
    } catch (err: any) {
      clearTimeout(timeoutTimer);
      const parsedError: CategorizedAPIError = err.categorized || classifyYuanbaoError(err);
      const enhancedError = new Error(parsedError.message);
      (enhancedError as any).categorized = parsedError;
      lastError = enhancedError;

      // Permanent / non-retryable error (e.g. 401 Auth, 400 Bad Request): abort retry loop immediately!
      if (!parsedError.isRetryable) {
        throw enhancedError;
      }

      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, maxRetries, parsedError);
        const backoffMs = parsedError.kind === 'rate_limit' ? 2500 : Math.min(1000 * Math.pow(1.5, attempt), 2500);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  throw lastError || new Error(`元宝搜索接口在 ${maxRetries} 次重试后仍无响应`);
}
