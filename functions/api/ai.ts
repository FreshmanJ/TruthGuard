// Cloudflare Pages Functions: /api/ai
interface Env {
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body: any = await request.json();
    const clientKey = request.headers.get('Authorization')?.replace('Bearer ', '') || body.apiKey;
    const apiKey = clientKey || env.AI_API_KEY;
    const baseUrl = body.baseUrl || env.AI_BASE_URL || 'https://token.sensenova.cn/v1/chat/completions';
    const model = body.model || env.AI_MODEL || 'sensenova-6.8-flash-lite';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing AI API Key' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
