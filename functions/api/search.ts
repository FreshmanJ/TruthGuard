// Cloudflare Pages Functions: /api/search
interface Env {
  YUANBAO_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body: any = await request.json().catch(() => ({}));
    const query = (body.Query || body.query || '').trim();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query 检索关键词不能为空' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Tencent WSA SearchPro Cnt defaults to standard 10
    const rawCnt = Number(body.Cnt || body.cnt || 10);
    const cnt = [10, 20, 30, 40, 50].includes(rawCnt) ? rawCnt : 10;

    let clientKey = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || body.apiKey;
    if (clientKey) clientKey = clientKey.replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();
    const apiKey = clientKey || env.YUANBAO_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing Yuanbao API Key' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const yuanbaoRes = await fetch('https://api.wsa.cloud.tencent.com/SearchPro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        Query: query,
        Cnt: cnt,
      }),
    });

    const data = await yuanbaoRes.json();
    return new Response(JSON.stringify(data), {
      status: yuanbaoRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({
    status: 'online',
    service: 'Yuanbao Search Proxy API (Cloudflare Pages)',
    endpoint: '/api/search',
    usage: 'POST JSON with { "Query": "string", "Cnt": 10 }',
    supportedCnt: [10, 20, 30, 40, 50]
  }), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
