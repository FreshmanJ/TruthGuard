// TruthGuard Browser Extension Background Service Worker (Manifest V3)

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

  // 1. Custom Key Mode -> Bypass daily public limit
  if (useCustomYuanbaoKey && apiKey && apiKey.trim()) {
    const cleanApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');

    // Attempt proxy first
    try {
      const proxyRes = await fetchWithProxyFallback('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanApiKey}`,
          'X-Browser-Id': browserId
        },
        body: JSON.stringify({ Query: query, Cnt: targetCnt, apiKey: cleanApiKey })
      }, proxyUrl);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return parseYuanbaoPages(data);
      }
    } catch (e) {
      console.warn('[TruthGuard Background] Proxy custom search failed, using direct cloud API:', e.message);
    }

    // Direct Cloud API fallback
    const directRes = await fetch('https://api.wsa.cloud.tencent.com/SearchPro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanApiKey}`
      },
      body: JSON.stringify({ Query: query, Cnt: targetCnt })
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

  // 2. Default Public Service -> Enforce 120 daily limit via Backend Proxy
  const proxyRes = await fetchWithProxyFallback('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': browserId,
      'X-Browser-Id': browserId
    },
    body: JSON.stringify({ Query: query, Cnt: targetCnt, clientId: browserId })
  }, proxyUrl);

  const resText = await proxyRes.text();
  let resJson = {};
  try { resJson = JSON.parse(resText); } catch {}

  if (!proxyRes.ok) {
    if (proxyRes.status === 429) {
      throw new Error(resJson.error || '今日元宝搜索免费额度已达上限 (120次/日)。请在插件设置中配置自定义 API Key。');
    }
    throw new Error(resJson.error || resJson.Response?.Error?.Message || `元宝搜索调用失败 (${proxyRes.status})`);
  }

  return parseYuanbaoPages(resJson);
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

  // 1. Custom Key Mode -> Bypass daily public limit
  if (useCustomAiKey && apiKey && apiKey.trim()) {
    const cleanApiKey = apiKey.trim().replace(/^Bearer\s+/i, '');
    let targetUrl = (aiBaseUrl || 'https://token.sensenova.cn/v1/chat/completions').trim();
    if (!targetUrl.endsWith('/chat/completions') && !targetUrl.includes('/chat/completions')) {
      targetUrl = targetUrl.replace(/\/+$/, '') + '/chat/completions';
    }

    const directRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanApiKey}`
      },
      body: JSON.stringify({
        model: model || 'sensenova-6.8-flash-lite',
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
    return directData?.choices?.[0]?.message?.content || '';
  }

  // 2. Default Public Service -> Enforce 300 daily limit via Backend Proxy
  const proxyRes = await fetchWithProxyFallback('/api/ai', {
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
    })
  }, proxyUrl);

  const resText = await proxyRes.text();
  let resJson = {};
  try { resJson = JSON.parse(resText); } catch {}

  if (!proxyRes.ok) {
    if (proxyRes.status === 429) {
      throw new Error(resJson.error || '今日 AI 接口免费额度已达上限 (300次/日)。请在插件设置中配置自定义 API Key。');
    }
    throw new Error(resJson.error || `AI 服务调用失败 (${proxyRes.status})`);
  }

  return resJson?.choices?.[0]?.message?.content || '';
}
