// TruthGuard Popup JS

document.addEventListener('DOMContentLoaded', () => {
  const testTextEl = document.getElementById('test-text');
  const btnQuickVerify = document.getElementById('btn-quick-verify');
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsArrow = document.getElementById('settings-arrow');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const saveStatus = document.getElementById('save-status');

  const inputYuanbaoKey = document.getElementById('input-yuanbao-key');
  const inputAiKey = document.getElementById('input-ai-key');
  const inputAiUrl = document.getElementById('input-ai-url');
  const inputAiModel = document.getElementById('input-ai-model');
  const inputProxyUrl = document.getElementById('input-proxy-url');

  // 1. Load Settings
  chrome.storage.local.get(['truthguard_settings'], (result) => {
    const s = result.truthguard_settings || {};
    inputYuanbaoKey.value = s.yuanbaoApiKey || '';
    inputAiKey.value = s.aiApiKey || '';
    inputAiUrl.value = s.aiBaseUrl || 'https://token.sensenova.cn/v1/chat/completions';
    inputAiModel.value = s.aiModel || 'sensenova-6.8-flash-lite';
    inputProxyUrl.value = s.proxyUrl || 'http://localhost:3000';
  });

  // 2. Toggle Settings Panel
  btnToggleSettings.addEventListener('click', () => {
    const isHidden = settingsPanel.classList.toggle('hidden');
    settingsArrow.textContent = isHidden ? '▾' : '▴';
  });

  // 3. Save Settings
  btnSaveSettings.addEventListener('click', () => {
    const newSettings = {
      yuanbaoApiKey: inputYuanbaoKey.value.trim(),
      aiApiKey: inputAiKey.value.trim(),
      aiBaseUrl: inputAiUrl.value.trim() || 'https://token.sensenova.cn/v1/chat/completions',
      aiModel: inputAiModel.value.trim() || 'sensenova-6.8-flash-lite',
      proxyUrl: inputProxyUrl.value.trim() || 'http://localhost:3000',
      useProxy: true,
      searchCount: 10
    };

    chrome.storage.local.set({ truthguard_settings: newSettings }, () => {
      saveStatus.classList.remove('hidden');
      setTimeout(() => {
        saveStatus.classList.add('hidden');
      }, 2000);
    });
  });

  // 4. Quick Verify Button -> Send text to Active Tab
  btnQuickVerify.addEventListener('click', async () => {
    const text = testTextEl.value.trim();
    if (!text) {
      testTextEl.focus();
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      const sendMsg = () => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TRUTHGUARD_TRIGGER_VERIFY',
          text: text
        }, () => {
          if (chrome.runtime.lastError) {
            console.warn('[TruthGuard Popup] Tab message failed, injecting content.js:', chrome.runtime.lastError.message);
            if (chrome.scripting) {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
              }).then(() => {
                setTimeout(() => {
                  chrome.tabs.sendMessage(tab.id, {
                    type: 'TRUTHGUARD_TRIGGER_VERIFY',
                    text: text
                  });
                  window.close();
                }, 150);
              }).catch(() => window.close());
            } else {
              window.close();
            }
          } else {
            window.close();
          }
        });
      };
      sendMsg();
    }
  });
});
