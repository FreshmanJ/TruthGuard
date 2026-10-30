import { defineConfig, Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

interface UserQuotaRecord {
  id: string;
  ips: Set<string>;
  browserIds: Set<string>;
  searchCount: number;
  aiCount: number;
  lastAccess: number;
}

class DailyQuotaManager {
  private SEARCH_LIMIT = 120;
  private AI_LIMIT = 300;
  private dateStr = '';
  private records = new Map<string, UserQuotaRecord>();
  private ipToRecordId = new Map<string, string>();
  private browserToRecordId = new Map<string, string>();

  private getTodayDate(): string {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cst = new Date(utc + 8 * 3600000);
    return cst.toISOString().slice(0, 10);
  }

  private checkDateReset() {
    const today = this.getTodayDate();
    if (this.dateStr !== today) {
      this.dateStr = today;
      this.records.clear();
      this.ipToRecordId.clear();
      this.browserToRecordId.clear();
    }
  }

  public getOrCreateUser(ip: string, browserId: string): UserQuotaRecord {
    this.checkDateReset();
    const cleanIp = (ip || '127.0.0.1').trim();
    const cleanBrowser = (browserId || 'default_browser').trim();

    let recIdByIp = this.ipToRecordId.get(cleanIp);
    let recIdByBrowser = this.browserToRecordId.get(cleanBrowser);

    // Merge if both exist and differ (IP or browser match -> same user)
    if (recIdByIp && recIdByBrowser && recIdByIp !== recIdByBrowser) {
      const recA = this.records.get(recIdByIp);
      const recB = this.records.get(recIdByBrowser);
      if (recA && recB) {
        recA.searchCount = recA.searchCount + recB.searchCount;
        recA.aiCount = recA.aiCount + recB.aiCount;
        recB.ips.forEach(i => { recA.ips.add(i); this.ipToRecordId.set(i, recA.id); });
        recB.browserIds.forEach(b => { recA.browserIds.add(b); this.browserToRecordId.set(b, recA.id); });
        recA.lastAccess = Date.now();
        this.records.delete(recB.id);
        return recA;
      }
    }

    if (recIdByIp) {
      const rec = this.records.get(recIdByIp);
      if (rec) {
        rec.browserIds.add(cleanBrowser);
        this.browserToRecordId.set(cleanBrowser, rec.id);
        rec.lastAccess = Date.now();
        return rec;
      }
    }

    if (recIdByBrowser) {
      const rec = this.records.get(recIdByBrowser);
      if (rec) {
        rec.ips.add(cleanIp);
        this.ipToRecordId.set(cleanIp, rec.id);
        rec.lastAccess = Date.now();
        return rec;
      }
    }

    const newId = 'u_' + Math.random().toString(36).slice(2, 10);
    const newRec: UserQuotaRecord = {
      id: newId,
      ips: new Set([cleanIp]),
      browserIds: new Set([cleanBrowser]),
      searchCount: 0,
      aiCount: 0,
      lastAccess: Date.now()
    };
    this.records.set(newId, newRec);
    this.ipToRecordId.set(cleanIp, newId);
    this.browserToRecordId.set(cleanBrowser, newId);
    return newRec;
  }

  public getQuota(ip: string, browserId: string) {
    const user = this.getOrCreateUser(ip, browserId);
    return {
      date: this.dateStr || this.getTodayDate(),
      search: {
        used: user.searchCount,
        limit: this.SEARCH_LIMIT,
        remaining: Math.max(0, this.SEARCH_LIMIT - user.searchCount)
      },
      ai: {
        used: user.aiCount,
        limit: this.AI_LIMIT,
        remaining: Math.max(0, this.AI_LIMIT - user.aiCount)
      }
    };
  }

  public checkAndConsumeSearch(ip: string, browserId: string): { allowed: boolean; remaining: number; used: number; limit: number } {
    const user = this.getOrCreateUser(ip, browserId);
    if (user.searchCount >= this.SEARCH_LIMIT) {
      return { allowed: false, remaining: 0, used: user.searchCount, limit: this.SEARCH_LIMIT };
    }
    user.searchCount += 1;
    return { allowed: true, remaining: this.SEARCH_LIMIT - user.searchCount, used: user.searchCount, limit: this.SEARCH_LIMIT };
  }

  public checkAndConsumeAI(ip: string, browserId: string): { allowed: boolean; remaining: number; used: number; limit: number } {
    const user = this.getOrCreateUser(ip, browserId);
    if (user.aiCount >= this.AI_LIMIT) {
      return { allowed: false, remaining: 0, used: user.aiCount, limit: this.AI_LIMIT };
    }
    user.aiCount += 1;
    return { allowed: true, remaining: this.AI_LIMIT - user.aiCount, used: user.aiCount, limit: this.AI_LIMIT };
  }
}

const devQuotaManager = new DailyQuotaManager();

function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  const sock = req.socket?.remoteAddress;
  if (sock) return normalizeIp(sock);
  return '127.0.0.1';
}

function normalizeIp(ip: string): string {
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip;
}

function getBrowserId(req: any, body?: any): string {
  const headerId = req.headers['x-client-id'] || req.headers['x-browser-id'];
  if (headerId && typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim();
  }
  if (body?.clientId || body?.browserId) {
    return String(body.clientId || body.browserId).trim();
  }
  return 'default_browser';
}

function apiDevServerPlugin(env: Record<string, string> = {}): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Id, X-Browser-Id');
          res.statusCode = 204;
          return res.end();
        }

        if (req.method === 'GET') {
          const path = (req.url || '').split('?')[0];
          if (path === '/api/quota') {
            const ip = getClientIp(req);
            const browserId = getBrowserId(req);
            const quota = devQuotaManager.getQuota(ip, browserId);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = 200;
            return res.end(JSON.stringify(quota));
          }

          if (path === '/api/search') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.statusCode = 200;
            return res.end(JSON.stringify({
              status: 'online',
              service: 'Yuanbao Search Proxy (/api/search)',
              usage: 'POST JSON with { "Query": "string", "Cnt": 10 }',
              supportedCnt: [10, 20, 30, 40, 50]
            }));
          }
          return next();
        }

        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');

            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              const path = (req.url || '').split('?')[0];

              if (path === '/api/search') {
                let clientKey = (
                  req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
                  body.apiKey ||
                  ''
                ).replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();

                const serverKey = (env.YUANBAO_API_KEY || process.env.YUANBAO_API_KEY || '').trim();
                const isCustomKey = Boolean(clientKey && clientKey !== serverKey);
                const apiKey = isCustomKey ? clientKey : serverKey;

                if (!apiKey) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({
                    Response: {
                      Error: {
                        Code: 'MissingApiKey',
                        Message: '未提供腾讯元宝 API Key，请在设置中配置或在 .env.local 中配置 YUANBAO_API_KEY'
                      }
                    }
                  }));
                }

                // If using free default key, enforce daily quota (120 searches / day)
                if (!isCustomKey) {
                  const ip = getClientIp(req);
                  const browserId = getBrowserId(req, body);
                  const quotaCheck = devQuotaManager.checkAndConsumeSearch(ip, browserId);
                  if (!quotaCheck.allowed) {
                    res.statusCode = 429;
                    return res.end(JSON.stringify({
                      Response: {
                        Error: {
                          Code: 'QuotaExceeded',
                          Message: `今日元宝搜索免费额度已达上限 (${quotaCheck.used}/${quotaCheck.limit}次)。您可以在设置中配置自定义 API Key 继续使用。`
                        }
                      },
                      error: `今日元宝搜索免费额度已达上限 (${quotaCheck.used}/${quotaCheck.limit}次)。您可以在设置中配置自定义 API Key 继续使用。`,
                      code: 'QuotaExceeded',
                      quota: quotaCheck
                    }));
                  }
                }

                const query = (body.Query || body.query || '').trim();
                if (!query) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({
                    Response: {
                      Error: {
                        Code: 'InvalidParameter',
                        Message: 'Query 检索关键词不能为空'
                      }
                    }
                  }));
                }

                // Tencent WSA SearchPro Cnt defaults to standard 10
                const rawCnt = Number(body.Cnt || body.cnt || 10);
                const cnt = [10, 20, 30, 40, 50].includes(rawCnt) ? rawCnt : 10;

                const controller = new AbortController();
                const timeoutTimer = setTimeout(() => controller.abort(), 12000); // 12s timeout

                try {
                  const yuanbaoRes = await fetch('https://api.wsa.cloud.tencent.com/SearchPro', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json; charset=utf-8',
                      'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                      Query: query,
                      Cnt: cnt
                    }),
                    signal: controller.signal
                  });
                  clearTimeout(timeoutTimer);

                  const data = await yuanbaoRes.json();
                  res.statusCode = yuanbaoRes.status;
                  return res.end(JSON.stringify(data));
                } catch (fetchErr: any) {
                  clearTimeout(timeoutTimer);
                  if (fetchErr.name === 'AbortError') {
                    res.statusCode = 504;
                    return res.end(JSON.stringify({ error: '腾讯云元宝搜索接口响应超时 (12s)', isTimeout: true }));
                  }
                  throw fetchErr;
                }
              }

              if (req.url === '/api/ai' || path === '/api/ai') {
                let clientKey = (
                  req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
                  body.apiKey ||
                  ''
                ).replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();

                const serverKey = (env.AI_API_KEY || process.env.AI_API_KEY || '').trim();
                const isCustomKey = Boolean(clientKey && clientKey !== serverKey);
                const apiKey = isCustomKey ? clientKey : serverKey;

                if (!apiKey) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ error: '未提供 AI API Key，请在设置中配置或在 .env.local 中配置 AI_API_KEY' }));
                }

                // If using free default key, enforce daily quota (300 AI calls / day)
                if (!isCustomKey) {
                  const ip = getClientIp(req);
                  const browserId = getBrowserId(req, body);
                  const quotaCheck = devQuotaManager.checkAndConsumeAI(ip, browserId);
                  if (!quotaCheck.allowed) {
                    res.statusCode = 429;
                    return res.end(JSON.stringify({
                      error: `今日 AI 接口免费额度已达上限 (${quotaCheck.used}/${quotaCheck.limit}次)。您可以在设置中配置自定义 API Key 继续使用。`,
                      code: 'QuotaExceeded',
                      quota: quotaCheck
                    }));
                  }
                }

                let targetUrl = (body.baseUrl || env.AI_BASE_URL || 'https://token.sensenova.cn/v1/chat/completions').trim();
                if (!targetUrl.endsWith('/chat/completions') && !targetUrl.includes('/chat/completions')) {
                  targetUrl = targetUrl.replace(/\/+$/, '') + '/chat/completions';
                }

                const isStream = Boolean(body.stream);
                const controller = new AbortController();
                // If stream: initial TTFT connection timeout is 45s (gives ample headroom for reasoning), refreshed on every chunk.
                // If non-stream: allow up to 60s without premature cut!
                let timeoutTimer = setTimeout(() => controller.abort(), isStream ? 45000 : 60000);

                try {
                  const reqPayload: any = {
                    model: (body.model || env.AI_MODEL || 'sensenova-6.8-flash-lite').trim(),
                    messages: body.messages,
                    temperature: body.temperature ?? 0.1,
                    stream: isStream,
                    max_tokens: body.max_tokens || 4096
                  };
                  if (body.reasoning_effort) reqPayload.reasoning_effort = body.reasoning_effort;
                  if (body.thinking) reqPayload.thinking = body.thinking;

                  const aiRes = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${apiKey.trim()}`
                    },
                    body: JSON.stringify(reqPayload),
                    signal: controller.signal
                  });

                  if (isStream && aiRes.ok && aiRes.body) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.setHeader('Connection', 'keep-alive');

                    const reader = aiRes.body.getReader();
                    try {
                      while (true) {
                        clearTimeout(timeoutTimer);
                        timeoutTimer = setTimeout(() => controller.abort(), 30000); // 30s idle timeout between chunks

                        const { done, value } = await reader.read();
                        if (done) break;
                        res.write(value);
                      }
                    } finally {
                      clearTimeout(timeoutTimer);
                      res.end();
                    }
                    return;
                  }

                  clearTimeout(timeoutTimer);
                  const data = await aiRes.json();
                  res.statusCode = aiRes.status;
                  return res.end(JSON.stringify(data));
                } catch (fetchErr: any) {
                  clearTimeout(timeoutTimer);
                  if (fetchErr.name === 'AbortError') {
                    res.statusCode = 504;
                    return res.end(JSON.stringify({ 
                      error: isStream ? 'AI 大模型流式接收中断 (连接无响应)' : 'AI 大模型响应超时 (超过 60s)', 
                      isTimeout: true 
                    }));
                  }
                  throw fetchErr;
                }
              }

              if (req.url === '/api/fetch-url') {
                let targetUrl = (body.url || '').trim();
                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                  targetUrl = 'https://' + targetUrl;
                }

                let parsedUrl: URL;
                try {
                  parsedUrl = new URL(targetUrl);
                } catch {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ error: '无效的网页链接格式，请提供以 http/https 开头的有效 URL' }));
                }

                const controller = new AbortController();
                const timeoutTimer = setTimeout(() => controller.abort(), 12000); // 12s timeout

                try {
                  const fetchRes = await fetch(targetUrl, {
                    method: 'GET',
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 TruthGuard/1.0',
                      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                    },
                    signal: controller.signal
                  });
                  clearTimeout(timeoutTimer);

                  const contentType = fetchRes.headers.get('content-type') || '';
                  const html = await fetchRes.text();

                  // 1. Extract Page Title
                  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
                  const title = titleMatch ? titleMatch[1].replace(/[\r\n\t]+/g, ' ').trim() : parsedUrl.hostname;

                  // 2. Extract Key Images from HTML
                  const images: Array<{ id: string; url: string; caption?: string }> = [];
                  const imgRegex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?>/gi;
                  let match;
                  let imgCount = 1;
                  while ((match = imgRegex.exec(html)) !== null && images.length < 8) {
                    const src = match[1];
                    const fullTag = match[0];
                    if (!src || src.startsWith('data:image/gif') || src.includes('favicon') || src.length < 5) continue;
                    
                    let absoluteSrc = src;
                    try {
                      absoluteSrc = new URL(src, targetUrl).href;
                    } catch {
                      continue;
                    }

                    // Attempt to extract alt or title as caption
                    const altMatch = fullTag.match(/alt=["']([^"']+)["']/i);
                    const titleAttrMatch = fullTag.match(/title=["']([^"']+)["']/i);
                    const caption = altMatch ? altMatch[1] : (titleAttrMatch ? titleAttrMatch[1] : `网页插图 #${imgCount}`);

                    images.push({
                      id: `url_img_${imgCount++}`,
                      url: absoluteSrc,
                      caption: caption.trim()
                    });
                  }

                  // 3. Extract Clean Readable Text (Remove scripts, styles, navigations)
                  let cleanHtml = html
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
                    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
                    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
                    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');

                  // Convert block elements to newlines
                  cleanHtml = cleanHtml
                    .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, '\n')
                    .replace(/<br\s*\/?>/gi, '\n');

                  // Strip all remaining HTML tags
                  let text = cleanHtml.replace(/<[^>]+>/g, ' ');

                  // Decode common HTML entities
                  text = text
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&ldquo;/g, '“')
                    .replace(/&rdquo;/g, '”')
                    .replace(/&mdash;/g, '—');

                  // Normalize whitespace & collapse multiple newlines
                  const lines = text.split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 0 && !/^(\d+|Copyright|All Rights Reserved|ICP备)/i.test(l));
                  
                  const cleanText = lines.join('\n\n');

                  res.statusCode = 200;
                  return res.end(JSON.stringify({
                    url: targetUrl,
                    title,
                    text: cleanText,
                    images,
                    status: fetchRes.status,
                    contentType,
                    ssl: parsedUrl.protocol === 'https:',
                    domain: parsedUrl.hostname,
                    wordCount: cleanText.length
                  }));
                } catch (fetchErr: any) {
                  clearTimeout(timeoutTimer);
                  if (fetchErr.name === 'AbortError') {
                    res.statusCode = 504;
                    return res.end(JSON.stringify({ error: '网页请求响应超时 (12s)', isTimeout: true }));
                  }
                  res.statusCode = 502;
                  return res.end(JSON.stringify({ error: `无法访问该网页链接: ${fetchErr.message || '网络连接异常'}` }));
                }
              }

              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              console.error('API Dev Server error:', err);
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message || 'Dev server error' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), apiDevServerPlugin(env)],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    }
  };
});
