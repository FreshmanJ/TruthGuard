import { defineConfig, Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.statusCode = 204;
          return res.end();
        }

        if (req.method === 'GET') {
          const path = (req.url || '').split('?')[0];
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
                let apiKey = (
                  req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
                  body.apiKey ||
                  env.YUANBAO_API_KEY ||
                  process.env.YUANBAO_API_KEY ||
                  ''
                ).trim();
                apiKey = apiKey.replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '').trim();

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

              if (req.url === '/api/ai') {
                const apiKey = (
                  req.headers.authorization?.replace('Bearer ', '') ||
                  body.apiKey ||
                  env.AI_API_KEY ||
                  process.env.AI_API_KEY ||
                  ''
                ).trim();

                if (!apiKey) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ error: '未提供 AI API Key，请在设置中配置或在 .env.local 中配置 AI_API_KEY' }));
                }
                let targetUrl = (body.baseUrl || 'https://token.sensenova.cn/v1/chat/completions').trim();
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
                    model: (body.model || 'sensenova-6.8-flash-lite').trim(),
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
