// Cloudflare Pages Functions: /api/fetch-url
export const onRequestPost: PagesFunction = async (context) => {
  const { request } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body: any = await request.json();
    let targetUrl = (body.url || '').trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return new Response(JSON.stringify({ error: '无效的网页链接格式' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fetchRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 TruthGuard/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    const contentType = fetchRes.headers.get('content-type') || '';
    const html = await fetchRes.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/[\r\n\t]+/g, ' ').trim() : parsedUrl.hostname;

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

      const altMatch = fullTag.match(/alt=["']([^"']+)["']/i);
      const titleAttrMatch = fullTag.match(/title=["']([^"']+)["']/i);
      const caption = altMatch ? altMatch[1] : (titleAttrMatch ? titleAttrMatch[1] : `网页插图 #${imgCount}`);

      images.push({
        id: `url_img_${imgCount++}`,
        url: absoluteSrc,
        caption: caption.trim()
      });
    }

    let cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n');

    let text = cleanHtml.replace(/<[^>]+>/g, ' ');
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

    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !/^(\d+|Copyright|All Rights Reserved|ICP备)/i.test(l));
    
    const cleanText = lines.join('\n\n');

    return new Response(JSON.stringify({
      url: targetUrl,
      title,
      text: cleanText,
      images,
      status: fetchRes.status,
      contentType,
      ssl: parsedUrl.protocol === 'https:',
      domain: parsedUrl.hostname,
      wordCount: cleanText.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Fetch URL failed' }), {
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
