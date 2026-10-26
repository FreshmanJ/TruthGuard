// TruthGuard Browser Extension Background Service Worker (Manifest V3)

const DEFAULT_SETTINGS = {
  yuanbaoApiKey: '',
  aiApiKey: '',
  aiBaseUrl: 'https://token.sensenova.cn/v1/chat/completions',
  aiModel: 'sensenova-6.8-flash-lite',
  proxyUrl: 'http://localhost:3000',
  useProxy: true,
  searchCount: 10
};

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

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();

  chrome.storage.local.get(['truthguard_settings'], (result) => {
    if (!result.truthguard_settings) {
      chrome.storage.local.set({ truthguard_settings: DEFAULT_SETTINGS });
    }
  });

  console.log('[TruthGuard Extension] Installed & Initialized');
});

// Also ensure context menu exists on startup
chrome.runtime.onStartup.addListener(() => {
  setupContextMenu();
});

// 2. Handle Context Menu Click with Automatic Content Script Injection Fallback
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'truthguard_verify_selection' && tab?.id) {
    const text = (info.selectionText || '').trim();

    const sendMessageWithFallback = (retryCount = 0) => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TRUTHGUARD_TRIGGER_VERIFY',
        text: text
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[TruthGuard Background] Content script not ready on tab, executing auto-injection:', chrome.runtime.lastError.message);
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
        } else {
          console.log('[TruthGuard Background] Verification triggered on tab:', response);
        }
      });
    };

    sendMessageWithFallback();
  }
});

// 3. Message Routing for Content Scripts & Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRUTHGUARD_GET_SETTINGS') {
    chrome.storage.local.get(['truthguard_settings'], (res) => {
      sendResponse(res.truthguard_settings || DEFAULT_SETTINGS);
    });
    return true; // Keep message channel open for async response
  }

  if (request.type === 'TRUTHGUARD_SAVE_SETTINGS') {
    chrome.storage.local.set({ truthguard_settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.type === 'TRUTHGUARD_SEARCH_REQUEST') {
    handleSearchRequest(request.payload)
      .then(res => sendResponse({ success: true, data: res }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === 'TRUTHGUARD_AI_REQUEST') {
    handleAIRequest(request.payload)
      .then(res => sendResponse({ success: true, data: res }))
      .catch(err => sendResponse({ success: false, error: err.message }));
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

// Helper: Yuanbao Search Request
async function handleSearchRequest({ query, cnt = 10, apiKey, proxyUrl, useProxy }) {
  const targetCnt = [10, 20, 30, 40, 50].includes(cnt) ? cnt : 10;
  const cleanApiKey = (apiKey || '').replace(/^Bearer\s+/i, '').trim();

  // Try local proxy first if enabled
  if (useProxy && proxyUrl) {
    try {
      const proxyRes = await fetch(`${proxyUrl.replace(/\/+$/, '')}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanApiKey}`
        },
        body: JSON.stringify({ Query: query, Cnt: targetCnt })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return parseYuanbaoPages(data);
      }
    } catch (e) {
      console.warn('[TruthGuard Background] Proxy search failed, falling back to direct:', e.message);
    }
  }

  // Direct WSA API call
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

function parseYuanbaoPages(data) {
  const pagesRaw = data?.Response?.Pages || [];
  return pagesRaw.map(p => {
    let site = (p.Site || '').trim();
    if (!site && p.Url) {
      try { site = new URL(p.Url).hostname; } catch {}
    }
    return {
      title: p.Title || '权威参考',
      url: p.Url || '',
      site: site || '网络参考',
      favicon: p.Icon || undefined,
      date: p.PublishTime || '',
      score: p.Score,
      passage: p.Passage || p.Content || ''
    };
  });
}

// Helper: AI Request
async function handleAIRequest({ messages, apiKey, baseUrl, model, proxyUrl, useProxy }) {
  const cleanApiKey = (apiKey || '').replace(/^Bearer\s+/i, '').trim();

  if (useProxy && proxyUrl) {
    try {
      const proxyRes = await fetch(`${proxyUrl.replace(/\/+$/, '')}/api/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanApiKey}`
        },
        body: JSON.stringify({
          messages,
          model: model || 'sensenova-6.8-flash-lite',
          stream: false,
          temperature: 0.1
        })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return data?.choices?.[0]?.message?.content || '';
      }
    } catch (e) {
      console.warn('[TruthGuard Background] Proxy AI failed, falling back to direct:', e.message);
    }
  }

  let targetUrl = (baseUrl || 'https://token.sensenova.cn/v1/chat/completions').trim();
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
