// TruthGuard Browser Extension Background Service Worker (Manifest V3)

const BUILTIN_YUANBAO_KEY = 'sk-5dc82711e58875020bb0157c75d1456879ae';
const BUILTIN_AI_KEY = 'sk-gJD5vz3wDqYDpTf5NzUyfhBhR9NLObd9';
const BUILTIN_AI_URL = 'https://token.sensenova.cn/v1/chat/completions';
const BUILTIN_AI_MODEL = 'sensenova-6.8-flash-lite';

const DEFAULT_SETTINGS = {
  useCustomYuanbaoKey: false,
  yuanbaoApiKey: '',
  useCustomAiKey: false,
  aiApiKey: '',
  aiBaseUrl: '',
  aiModel: '',
  proxyUrl: 'https://truthguard.freshmanj.com',
  searchCount: 10
};

const DEFAULT_PROD_URL = 'https://truthguard.freshmanj.com';

// Persistent client/browser ID for IP + browser fingerprint rate-limiting
async function getBrowserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['truthguard_browser_id'], (res) => {
      if (res.truthguard_browser_id) {
        resolve(res.truthguard_browser_id);
      } else {
        const newId = 'b_ext_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        chrome.storage.local.set({ truthguard_browser_id: newId }, () => resolve(newId));
      }
    });
  });
}

// Fetch helper with local -> cloud fallback (if localhost:3000 is down, auto-failover to Cloudflare Pages)
async function fetchWithProxyFallback(apiPath, fetchOptions, preferredBaseUrl) {
  let primary = (preferredBaseUrl || DEFAULT_SETTINGS.proxyUrl).replace(/\/+$/, '');
  try {
    const res = await fetch(`${primary}${apiPath}`, fetchOptions);
    return res;
  } catch (err) {
    if (primary.includes('localhost') && DEFAULT_PROD_URL && primary !== DEFAULT_PROD_URL) {
      console.warn(`[TruthGuard Background] Localhost proxy unreachable (${err.message}), auto-routing to Cloudflare Pages: ${DEFAULT_PROD_URL}${apiPath}`);
      try {
        return await fetch(`${DEFAULT_PROD_URL}${apiPath}`, fetchOptions);
      } catch (cloudErr) {
        throw err;
      }
    }
    throw err;
  }
}

// 1. Setup Context Menu & Default Settings on install
function setupContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'truthguard_verify_selection',
      title: '🛡️ 使用 TruthGuard 事实核验',
      contexts: ['selection']
    }, () => {
      if (chrome.runtime.lastError) {
        console.warn('[TruthGuard] Context menu creation notice:', chrome.runtime.lastError.message);
      } else {
        console.log('[TruthGuard Extension] Context menu registered successfully');
      }
    });
  });
}

function sanitizeSettings(s) {
  if (!s) return { ...DEFAULT_SETTINGS };
  const updated = { ...DEFAULT_SETTINGS, ...s };
  if (updated.yuanbaoApiKey && updated.yuanbaoApiKey.startsWith('sk-5dc8')) {
    updated.yuanbaoApiKey = '';
  }
  if (updated.aiApiKey && updated.aiApiKey.startsWith('sk-gJD5')) {
    updated.aiApiKey = '';
  }
  if (updated.aiBaseUrl === 'https://token.sensenova.cn/v1/chat/completions') {
    updated.aiBaseUrl = '';
  }
  if (updated.aiModel === 'sensenova-6.8-flash-lite') {
    updated.aiModel = '';
  }
  if (!updated.yuanbaoApiKey) {
    updated.useCustomYuanbaoKey = false;
  }
  if (!updated.aiApiKey) {
    updated.useCustomAiKey = false;
  }
  if (!updated.proxyUrl || updated.proxyUrl.includes('truthguard-yuanbao.pages.dev')) {
    updated.proxyUrl = DEFAULT_SETTINGS.proxyUrl;
  }
  return updated;
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();

  chrome.storage.local.get(['truthguard_settings'], (result) => {
    const clean = sanitizeSettings(result.truthguard_settings);
    chrome.storage.local.set({ truthguard_settings: clean });
  });

  console.log('[TruthGuard Extension] Installed & Initialized');
});

chrome.runtime.onStartup.addListener(() => {
  setupContextMenu();
  chrome.storage.local.get(['truthguard_settings'], (result) => {
    if (result.truthguard_settings) {
      const clean = sanitizeSettings(result.truthguard_settings);
      chrome.storage.local.set({ truthguard_settings: clean });
    }
  });
});

// 2. Handle Context Menu Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'truthguard_verify_selection' && tab?.id) {
    const text = (info.selectionText || '').trim();

    const sendMessageWithFallback = (retryCount = 0) => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TRUTHGUARD_TRIGGER_VERIFY',
        text: text
      }, (response) => {
        if (chrome.runtime.lastError) {
          if (retryCount === 0 && chrome.scripting) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            }).then(() => {
              setTimeout(() => sendMessageWithFallback(1), 180);
            }).catch(err => {
              console.error('[TruthGuard Background] Script injection failed:', err);
            });
          }
        }
      });
    };

    sendMessageWithFallback();
  }
});

// 3. Message Routing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRUTHGUARD_GET_SETTINGS') {
    chrome.storage.local.get(['truthguard_settings'], (res) => {
      const settings = Object.assign({}, DEFAULT_SETTINGS, res.truthguard_settings || {});
      sendResponse(settings);
    });
    return true;
  }

  if (request.type === 'TRUTHGUARD_SAVE_SETTINGS') {
    chrome.storage.local.set({ truthguard_settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.type === 'TRUTHGUARD_GET_QUOTA') {
    handleGetQuota(request.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === 'TRUTHGUARD_SEARCH_REQUEST') {
    handleSearchRequest(request.payload || {})
      .then(res => sendResponse({ success: true, data: res }))
      .catch(err => {
        console.error('[TruthGuard Background] Search error:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  if (request.type === 'TRUTHGUARD_AI_REQUEST') {
    handleAIRequest(request.payload || {})
      .then(res => sendResponse({ success: true, data: res }))
      .catch(err => {
        console.error('[TruthGuard Background] AI error:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  if (request.type === 'TRUTHGUARD_DOWNLOAD_DATA') {
    const { filename, dataUrl } = request;
    if (chrome.downloads) {
      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        sendResponse({ success: true, downloadId });
      });
      return true;
    }
  }
});

// Helper: Fetch Quota
async function handleGetQuota({ proxyUrl } = {}) {
  const browserId = await getBrowserId();
  try {
    const res = await fetchWithProxyFallback('/api/quota', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Client-Id': browserId,
        'X-Browser-Id': browserId
      }
    }, proxyUrl);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[TruthGuard Background] Fetch quota failed:', err);
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    search: { used: 0, limit: 120, remaining: 120 },
    ai: { used: 0, limit: 300, remaining: 300 }
  };
}

// Helper: Yuanbao Search Request
async function handleSearchRequest({ query, cnt = 10, apiKey, proxyUrl, useCustomYuanbaoKey }) {
  const browserId = await getBrowserId();
  const rawCnt = Number(cnt || 10);
  const targetCnt = [10, 20, 30, 40, 50].includes(rawCnt) ? rawCnt : 10;

  // 1. Custom Key Mode -> Direct to official Tencent WSA SearchPro
  if (useCustomYuanbaoKey && apiKey && apiKey.trim()) {
    const cleanApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');
    return await executeDirectYuanbaoSearch(query, targetCnt, cleanApiKey);
  }

  // 2. Local Proxy Mode if explicitly requested and reachable
  if (proxyUrl && proxyUrl.includes('localhost')) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const proxyRes = await fetch(`${proxyUrl.replace(/\/+$/, '')}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': browserId,
          'X-Browser-Id': browserId
        },
        body: JSON.stringify({ Query: query, Cnt: targetCnt, clientId: browserId }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (proxyRes.ok) {
        const resJson = await proxyRes.json();
        const pages = parseYuanbaoPages(resJson);
        if (pages.length > 0) return pages;
      }
    } catch (e) {
      console.warn('[TruthGuard Background] Local proxy search unreachable, failover to official cloud API:', e.message);
    }
  }

  // 3. Default Direct to Tencent Cloud WSA SearchPro API
  return await executeDirectYuanbaoSearch(query, targetCnt, BUILTIN_YUANBAO_KEY);
}

async function executeDirectYuanbaoSearch(query, cnt, apiKey) {
  const cleanApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');
  const directRes = await fetch('https://api.wsa.cloud.tencent.com/SearchPro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey}`
    },
    body: JSON.stringify({ Query: query, Cnt: cnt })
  });

  if (!directRes.ok) {
    const errText = await directRes.text();
    throw new Error(`元宝搜索调用失败 (${directRes.status}): ${errText.slice(0, 100)}`);
  }

  const directData = await directRes.json();
  if (directData?.Response?.Error) {
    throw new Error(`元宝搜索服务报错: ${directData.Response.Error.Message || directData.Response.Error.Code}`);
  }

  return parseYuanbaoPages(directData);
}

function parseYuanbaoPages(data) {
  const pagesRaw = data?.Response?.Pages || [];
  const results = [];

  for (const pageItem of pagesRaw) {
    try {
      const p = typeof pageItem === 'string' ? JSON.parse(pageItem) : pageItem;
      if (!p) continue;

      let site = (p.site || p.Site || '').trim();
      const url = (p.url || p.Url || '').trim();
      if (!site && url) {
        try {
          site = new URL(url).hostname;
        } catch {}
      }

      results.push({
        title: (p.title || p.Title || '权威信息来源').trim(),
        url: url,
        site: site || '权威信源',
        favicon: p.favicon || p.Icon || undefined,
        date: p.date || p.PublishTime || '',
        score: typeof p.score === 'number' ? p.score : (typeof p.Score === 'number' ? p.Score : 0.5),
        passage: (p.passage || p.Passage || p.content || p.Content || '').trim()
      });
    } catch (e) {
      console.warn('[TruthGuard Background] Failed to parse page item:', e);
    }
  }

  return results;
}

// Helper: AI Request
async function handleAIRequest({ messages, apiKey, baseUrl: aiBaseUrl, model, proxyUrl, useCustomAiKey }) {
  const browserId = await getBrowserId();

  // 1. Custom Key Mode -> Direct to specified custom endpoint
  if (useCustomAiKey && apiKey && apiKey.trim()) {
    const cleanApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');
    let targetUrl = (aiBaseUrl || BUILTIN_AI_URL).trim();
    if (!targetUrl.endsWith('/chat/completions') && !targetUrl.includes('/chat/completions')) {
      targetUrl = targetUrl.replace(/\/+$/, '') + '/chat/completions';
    }
    const targetModel = model || BUILTIN_AI_MODEL;
    return await executeDirectAI(targetUrl, cleanApiKey, targetModel, messages);
  }

  // 2. Local Proxy Mode if explicitly requested and reachable
  if (proxyUrl && proxyUrl.includes('localhost')) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const proxyRes = await fetch(`${proxyUrl.replace(/\/+$/, '')}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': browserId,
          'X-Browser-Id': browserId
        },
        body: JSON.stringify({
          messages,
          stream: false,
          temperature: 0.1,
          clientId: browserId
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (proxyRes.ok) {
        const resJson = await proxyRes.json();
        const content = resJson?.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (e) {
      console.warn('[TruthGuard Background] Local proxy AI unreachable, failover to official cloud AI:', e.message);
    }
  }

  // 3. Default Direct to SenseNova Cloud AI API
  return await executeDirectAI(BUILTIN_AI_URL, BUILTIN_AI_KEY, BUILTIN_AI_MODEL, messages);
}

async function executeDirectAI(url, apiKey, model, messages) {
  const cleanApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');
  const directRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature: 0.1,
      stream: false
    })
  });

  if (!directRes.ok) {
    const errText = await directRes.text();
    throw new Error(`AI 服务响应异常 (${directRes.status}): ${errText.slice(0, 100)}`);
  }

  const directData = await directRes.json();
  const content = directData?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回内容为空');
  }
  return content;
}