// Cloudflare Pages Functions: /api/quota
import { globalQuotaManager } from './quotaManager';

interface Env {
  YUANBAO_API_KEY?: string;
  AI_API_KEY?: string;
  QUOTA_KV?: any;
  KV?: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id, X-Browser-Id',
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const browserId = request.headers.get('x-client-id') || request.headers.get('x-browser-id') || 'default_browser';

  const kv = env.QUOTA_KV || env.KV;
  const quota = await globalQuotaManager.getQuota(clientIp, browserId, kv);

  return new Response(JSON.stringify(quota), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};
