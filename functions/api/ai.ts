// Cloudflare Pages Functions: /api/ai
import { globalQuotaManager } from './quotaManager';

interface Env {
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
  QUOTA_KV?: any;
  KV?: any;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id, X-Browser-Id',
  };

  try {
    const body: any = await request.json().catch(() => ({}));
    const clientKey = (request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || body.apiKey || '').replace(/^["']|["']$/g, '').trim();
    const serverKey = (env.AI_API_KEY || '').trim();
    const isCustomKey = Boolean(clientKey && clientKey !== serverKey);
    const apiKey = isCustomKey ? clientKey : serverKey;
    const baseUrl = body.baseUrl || env.AI_BASE_URL || 'https://token.sensenova.cn/v1/chat/completions';
    const model = body.model || env.AI_MODEL || 'sensenova-6.8-flash-lite';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing AI API Key' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isCustomKey) {
      const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      const browserId = request.headers.get('x-client-id') || request.headers.get('x-browser-id') || body.clientId || 'default_browser';
      const kv = env.QUOTA_KV || env.KV;
      const quotaCheck = await globalQuotaManager.checkAndConsumeAI(clientIp, browserId, kv);
      if (!quotaCheck.allowed) {
        return new Response(JSON.stringify({
          error: `今日 AI 接口免费额度已达上限 (${quotaCheck.used}/${quotaCheck.limit}次)。您可以在设置中配置自定义 API Key 继续使用。`,
          code: 'QuotaExceeded',
          quota: quotaCheck
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
    }

    let targetUrl = baseUrl.trim();
    if (!targetUrl.endsWith('/chat/completions') && !targetUrl.includes('/chat/completions')) {
      targetUrl = targetUrl.replace(/\/+$/, '') + '/chat/completions';
    }

    const aiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model.trim(),
        messages: body.messages,
        temperature: body.temperature ?? 0.1,
      }),
    });

    const data = await aiRes.json();
    return new Response(JSON.stringify(data), {
      status: aiRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id, X-Browser-Id',
    },
  });
};
