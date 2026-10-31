// TruthGuard Popup JS (Bilingual Support with Auto-Detection)

const POPUP_I18N = {
  zh: {
    brandSubtitle: '事实检察官',
    brandTagline: '腾讯元宝搜索 · 权威信源实时联网',
    readyBadge: '就绪',
    quotaTitle: '今日公共免费额度状态',
    refreshBtn: '刷新',
    searchQuotaName: '🔍 元宝搜索',
    aiQuotaName: '✨ AI 大模型',
    customTag: '自定义 · 无限额',
    searchDailyLimit: '单日限额 120 次',
    aiDailyLimit: '单日限额 300 次',
    quotaUnit: '次',
    quotaHint: '* IP 或浏览器指纹相同视为同一用户，每日 00:00 自动刷新重置。',
    guideTitle: '💡 网页实时核验使用指南',
    guideStep1: '<strong>选中文本</strong>：在任意网页划选需要核验的内容（>5字）',
    guideStep2: '<strong>触发核验</strong>：点击浮现的 <span class="tag">🛡️ 事实核验</span> 或鼠标右键菜单',
    guideStep3: '<strong>全屏工作树</strong>：点击右下角浮窗的 <strong>小箭头</strong> 展开全屏工作拓扑图',
    guideStep4: '<strong>导出报告</strong>：完成后点击报告按钮，一键导出 <strong>PDF 报告</strong>',
    quickTestLabel: '当前标签页快速核验',
    quickTestPlaceholder: '输入任意需要核验的事实陈述（例如：Python 3.14 官方已于2024年1月正式发布并彻底废除了GIL...）',
    btnQuickVerify: '🚀 发送至当前网页开始事实穿透',
    btnToggleSettings: '⚙️ API 凭证与连接配置',
    langCardTitle: '🌐 界面语言 / Language',
    langCardHint: '自动根据浏览器语言与页面选中文字切换中英文',
    yuanbaoCardTitle: '🔍 腾讯云元宝搜索 (WSA)',
    modeDefault: '默认托管',
    modeCustom: '自定义Key',
    modeCustomApi: '自定义API',
    yuanbaoDefaultHint: '✓ 使用系统托管官方接口，享受每日 120 次免密检索配额。',
    labelYuanbaoKey: '腾讯云元宝搜索 API Key',
    hintYuanbaoKey: '使用您在腾讯云控制台申请的专属 API Key，不消耗每日公共配额',
    btnTestSearchDefault: '测试默认接口',
    btnTestSearchCustom: '测试自定义 Key',
    aiCardTitle: '✨ AI 大语言模型 (LLM)',
    aiDefaultHint: '✓ 使用系统托管商汤日日新 (SenseNova 6.8) 服务，享受每日 300 次免密推理配额。',
    labelAiKey: '自定义模型 API Key',
    labelAiUrl: 'AI API Base URL',
    labelAiModel: 'AI 模型名称',
    btnTestAiDefault: '测试默认服务',
    btnTestAiCustom: '测试自定义 API',
    labelProxyUrl: 'TruthGuard 后端服务地址',
    hintProxyUrl: '系统默认免费接口通过后端代理统一校验每日配额',
    btnSaveSettings: '保存配置',
    saveStatus: '已保存 ✓',
    testingText: '测试中...',
    testSearchSuccess: '✓ 连通正常 ({count} 条信源)',
    testAiSuccess: '✓ 连通成功: {msg}',
    testFailed: '✗ {error}',
    togglePillTitle: '划选文本浮现核验胶囊',
    togglePillHint: '在网页划选文字后自动弹出黑色核验胶囊（关闭后仅通过右键菜单核验）',
    footerLangLabel: '界面语言:',
    footerGithub: 'GitHub 开源',
    footerPowered: 'Powered by Tencent WSA'
  },
  en: {
    brandSubtitle: 'Fact Investigator',
    brandTagline: 'Tencent Yuanbao · Real-time Authoritative Search',
    readyBadge: 'Ready',
    quotaTitle: "Today's Public Free Quota",
    refreshBtn: 'Refresh',
    searchQuotaName: '🔍 Yuanbao Search',
    aiQuotaName: '✨ AI LLM Model',
    customTag: 'Custom · Unlimited',
    searchDailyLimit: 'Daily Limit: 120 calls',
    aiDailyLimit: 'Daily Limit: 300 calls',
    quotaUnit: 'calls',
    quotaHint: '* Shared by IP & browser fingerprint. Resets daily at 00:00 UTC.',
    guideTitle: '💡 Web Fact-Checking Quick Guide',
    guideStep1: '<strong>Highlight Text</strong>: Select any statement on web pages (>5 chars)',
    guideStep2: '<strong>Trigger Audit</strong>: Click the floating <span class="tag">🛡️ Fact Check</span> pill or right-click menu',
    guideStep3: '<strong>Fullscreen Tree</strong>: Click the <strong>arrow icon</strong> on the dock to expand full topology',
    guideStep4: '<strong>Export Report</strong>: Click the report button to export <strong>PDF Report</strong>',
    quickTestLabel: 'Quick Verify on Current Tab',
    quickTestPlaceholder: 'Enter any factual claim to verify (e.g. Python 3.14 was officially released in Jan 2024 and GIL was eliminated...)',
    btnQuickVerify: '🚀 Send to Current Webpage to Verify',
    btnToggleSettings: '⚙️ API Credentials & Connection Settings',
    langCardTitle: '🌐 Language / 界面语言',
    langCardHint: 'Automatically adapts based on browser locale and selected text',
    yuanbaoCardTitle: '🔍 Tencent Yuanbao Search (WSA)',
    modeDefault: 'Default Hosted',
    modeCustom: 'Custom Key',
    modeCustomApi: 'Custom API',
    yuanbaoDefaultHint: '✓ Uses official hosted service with 120 free searches daily.',
    labelYuanbaoKey: 'Tencent Yuanbao Search API Key',
    hintYuanbaoKey: 'Use your own Tencent Cloud API Key to bypass daily public quota limits',
    btnTestSearchDefault: 'Test Default API',
    btnTestSearchCustom: 'Test Custom Key',
    aiCardTitle: '✨ AI Large Language Model (LLM)',
    aiDefaultHint: '✓ Uses hosted SenseNova 6.8 service with 300 free inferences daily.',
    labelAiKey: 'Custom Model API Key',
    labelAiUrl: 'AI API Base URL',
    labelAiModel: 'AI Model Name',
    btnTestAiDefault: 'Test Default API',
    btnTestAiCustom: 'Test Custom API',
    proxyUrlLabel: 'TruthGuard Backend Proxy URL',
    proxyUrlHint: 'Free hosted APIs authenticate and track daily quotas via this proxy',
    btnSaveSettings: 'Save Settings',
    saveStatus: 'Saved ✓',
    testingText: 'Testing...',
    testSearchSuccess: '✓ Connected ({count} sources)',
    testAiSuccess: '✓ Connected: {msg}',
    testFailed: '✗ {error}',
    togglePillTitle: 'Floating Pill on Text Selection',
    togglePillHint: 'Show black verification pill when highlighting text (disable to use right-click menu only)',
    footerLangLabel: 'Language:',
    footerGithub: 'GitHub Open Source',
    footerPowered: 'Powered by Tencent WSA'
  }
};

function resolveLang(lang) {
  if (lang === 'zh' || lang === 'en') return lang;
  const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
  return nav.startsWith('zh') ? 'zh' : 'en';
}

document.addEventListener('DOMContentLoaded', () => {
  const selectLangEl = document.getElementById('select-lang');
  const settingsSelectLangEl = document.getElementById('settings-select-lang');
  const toggleSelectionPillEl = document.getElementById('toggle-selection-pill');
  const testTextEl = document.getElementById('test-text');
  const btnQuickVerify = document.getElementById('btn-quick-verify');
  const btnToggleSettings = document.getElementById('btn-toggle-settings');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsArrow = document.getElementById('settings-arrow');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const saveStatus = document.getElementById('save-status');

  // Quota elements
  const btnRefreshQuota = document.getElementById('btn-refresh-quota');
  const quotaSpin = document.getElementById('quota-spin');
  const quotaSearchText = document.getElementById('quota-search-text');
  const quotaSearchBar = document.getElementById('quota-search-bar');
  const badgeSearchCustom = document.getElementById('badge-search-custom');
  const quotaAiText = document.getElementById('quota-ai-text');
  const quotaAiBar = document.getElementById('quota-ai-bar');
  const badgeAiCustom = document.getElementById('badge-ai-custom');

  // Mode toggles
  const btnYuanbaoModeDefault = document.getElementById('btn-yuanbao-mode-default');
  const btnYuanbaoModeCustom = document.getElementById('btn-yuanbao-mode-custom');
  const yuanbaoDefaultHint = document.getElementById('yuanbao-default-hint');
  const yuanbaoCustomFields = document.getElementById('yuanbao-custom-fields');
  const inputYuanbaoKey = document.getElementById('input-yuanbao-key');
  const btnTestSearch = document.getElementById('btn-test-search');
  const testSearchResult = document.getElementById('test-search-result');

  const btnAiModeDefault = document.getElementById('btn-ai-mode-default');
  const btnAiModeCustom = document.getElementById('btn-ai-mode-custom');
  const aiDefaultHint = document.getElementById('ai-default-hint');
  const aiCustomFields = document.getElementById('ai-custom-fields');
  const inputAiKey = document.getElementById('input-ai-key');
  const inputAiUrl = document.getElementById('input-ai-url');
  const inputAiModel = document.getElementById('input-ai-model');
  const btnTestAi = document.getElementById('btn-test-ai');
  const testAiResult = document.getElementById('test-ai-result');

  const inputProxyUrl = document.getElementById('input-proxy-url');

  let currentSettings = {
    useCustomYuanbaoKey: false,
    yuanbaoApiKey: '',
    useCustomAiKey: false,
    aiApiKey: '',
    aiBaseUrl: 'https://token.sensenova.cn/v1/chat/completions',
    aiModel: 'sensenova-6.8-flash-lite',
    proxyUrl: 'https://truthguard.freshmanj.com',
    searchCount: 10,
    lang: 'auto',
    enableSelectionPill: true
  };

  let lastQuotaData = null;

  function applyTranslations(activeLang) {
    const t = POPUP_I18N[activeLang] || POPUP_I18N.zh;

    document.getElementById('brand-sub').textContent = t.brandSubtitle;
    document.getElementById('brand-tagline').textContent = t.brandTagline;
    document.getElementById('ready-badge').textContent = t.readyBadge;

    document.getElementById('quota-title-text').textContent = t.quotaTitle;
    document.getElementById('btn-refresh-text').textContent = t.refreshBtn;
    document.getElementById('quota-search-name').textContent = t.searchQuotaName;
    document.getElementById('quota-ai-name').textContent = t.aiQuotaName;
    document.getElementById('badge-search-custom').textContent = t.customTag;
    document.getElementById('badge-ai-custom').textContent = t.customTag;
    document.getElementById('quota-search-sub').textContent = t.searchDailyLimit;
    document.getElementById('quota-ai-sub').textContent = t.aiDailyLimit;
    document.getElementById('quota-hint-text').textContent = t.quotaHint;

    document.getElementById('guide-title-text').textContent = t.guideTitle;
    document.getElementById('guide-step-1').innerHTML = t.guideStep1;
    document.getElementById('guide-step-2').innerHTML = t.guideStep2;
    document.getElementById('guide-step-3').innerHTML = t.guideStep3;
    document.getElementById('guide-step-4').innerHTML = t.guideStep4;

    const togglePillTitleEl = document.getElementById('toggle-pill-title');
    if (togglePillTitleEl) togglePillTitleEl.textContent = t.togglePillTitle;
    const togglePillHintEl = document.getElementById('toggle-pill-hint');
    if (togglePillHintEl) togglePillHintEl.textContent = t.togglePillHint;
    const footerLangLabelEl = document.getElementById('footer-lang-label');
    if (footerLangLabelEl) footerLangLabelEl.textContent = t.footerLangLabel;

    document.getElementById('quick-test-label').textContent = t.quickTestLabel;
    testTextEl.placeholder = t.quickTestPlaceholder;
    document.getElementById('btn-quick-verify-text').textContent = t.btnQuickVerify;

    document.getElementById('btn-toggle-settings-text').textContent = t.btnToggleSettings;
    document.getElementById('lang-card-title').textContent = t.langCardTitle;
    document.getElementById('lang-card-hint').textContent = t.langCardHint;

    document.getElementById('yuanbao-title-text').textContent = t.yuanbaoCardTitle;
    btnYuanbaoModeDefault.textContent = t.modeDefault;
    btnYuanbaoModeCustom.textContent = t.modeCustom;
    yuanbaoDefaultHint.textContent = t.yuanbaoDefaultHint;
    document.getElementById('label-yuanbao-key').textContent = t.labelYuanbaoKey;
    document.getElementById('hint-yuanbao-key').textContent = t.hintYuanbaoKey;
    btnTestSearch.textContent = currentSettings.useCustomYuanbaoKey ? t.btnTestSearchCustom : t.btnTestSearchDefault;

    document.getElementById('ai-title-text').textContent = t.aiCardTitle;
    btnAiModeDefault.textContent = t.modeDefault;
    btnAiModeCustom.textContent = t.modeCustomApi;
    aiDefaultHint.textContent = t.aiDefaultHint;
    document.getElementById('label-ai-key').textContent = t.labelAiKey;
    document.getElementById('label-ai-url').textContent = t.labelAiUrl;
    document.getElementById('label-ai-model').textContent = t.labelAiModel;
    btnTestAi.textContent = currentSettings.useCustomAiKey ? t.btnTestAiCustom : t.btnTestAiDefault;

    document.getElementById('label-proxy-url').textContent = t.labelProxyUrl;
    document.getElementById('hint-proxy-url').textContent = t.hintProxyUrl;
    btnSaveSettings.textContent = t.btnSaveSettings;
    saveStatus.textContent = t.saveStatus;

    document.getElementById('footer-github-text').textContent = t.footerGithub;
    document.getElementById('footer-powered-text').textContent = t.footerPowered;

    if (lastQuotaData) {
      updateQuotaUI(lastQuotaData);
    }
  }

  // 1. Fetch & Display Quota
  async function loadQuota() {
    quotaSpin.classList.add('spinning');
    chrome.runtime.sendMessage({
      type: 'TRUTHGUARD_GET_QUOTA',
      payload: { proxyUrl: inputProxyUrl.value.trim() || currentSettings.proxyUrl }
    }, (res) => {
      quotaSpin.classList.remove('spinning');
      if (res && res.success && res.data) {
        lastQuotaData = res.data;
        updateQuotaUI(lastQuotaData);
      }
    });
  }

  function updateQuotaUI(q) {
    if (!q) return;
    const activeLang = resolveLang(currentSettings.lang);
    const t = POPUP_I18N[activeLang] || POPUP_I18N.zh;

    // Search Quota
    if (currentSettings.useCustomYuanbaoKey) {
      badgeSearchCustom.classList.remove('hidden');
      quotaSearchText.classList.add('hidden');
      document.getElementById('quota-search-bar-wrap').classList.add('hidden');
      document.getElementById('quota-search-sub').classList.add('hidden');
    } else {
      badgeSearchCustom.classList.add('hidden');
      quotaSearchText.classList.remove('hidden');
      document.getElementById('quota-search-bar-wrap').classList.remove('hidden');
      document.getElementById('quota-search-sub').classList.remove('hidden');

      const used = q.search?.used ?? 0;
      const limit = q.search?.limit ?? 120;
      quotaSearchText.textContent = `${used} / ${limit} ${t.quotaUnit}`;
      const pct = Math.min(100, (used / limit) * 100);
      quotaSearchBar.style.width = `${pct}%`;
      if (used >= limit) quotaSearchBar.style.backgroundColor = '#f43f5e';
      else if (used >= limit * 0.8) quotaSearchBar.style.backgroundColor = '#f59e0b';
      else quotaSearchBar.style.backgroundColor = '#0284c7';
    }

    // AI Quota
    if (currentSettings.useCustomAiKey) {
      badgeAiCustom.classList.remove('hidden');
      quotaAiText.classList.add('hidden');
      document.getElementById('quota-ai-bar-wrap').classList.add('hidden');
      document.getElementById('quota-ai-sub').classList.add('hidden');
    } else {
      badgeAiCustom.classList.add('hidden');
      quotaAiText.classList.remove('hidden');
      document.getElementById('quota-ai-bar-wrap').classList.remove('hidden');
      document.getElementById('quota-ai-sub').classList.remove('hidden');

      const used = q.ai?.used ?? 0;
      const limit = q.ai?.limit ?? 300;
      quotaAiText.textContent = `${used} / ${limit} ${t.quotaUnit}`;
      const pct = Math.min(100, (used / limit) * 100);
      quotaAiBar.style.width = `${pct}%`;
      if (used >= limit) quotaAiBar.style.backgroundColor = '#f43f5e';
      else if (used >= limit * 0.8) quotaAiBar.style.backgroundColor = '#f59e0b';
      else quotaAiBar.style.backgroundColor = '#8b5cf6';
    }
  }

  btnRefreshQuota.addEventListener('click', loadQuota);

  // 2. Load Settings from Storage
  chrome.storage.local.get(['truthguard_settings'], (result) => {
    const s = result.truthguard_settings || {};
    if (s.proxyUrl === 'https://truthguard-yuanbao.pages.dev') {
      s.proxyUrl = 'https://truthguard.freshmanj.com';
      chrome.storage.local.set({ truthguard_settings: { ...s } });
    }
    currentSettings = { ...currentSettings, ...s };
    if (typeof currentSettings.enableSelectionPill !== 'boolean') {
      currentSettings.enableSelectionPill = true;
    }

    if (toggleSelectionPillEl) {
      toggleSelectionPillEl.checked = currentSettings.enableSelectionPill;
    }

    selectLangEl.value = currentSettings.lang || 'auto';
    settingsSelectLangEl.value = currentSettings.lang || 'auto';

    inputYuanbaoKey.value = currentSettings.yuanbaoApiKey || '';
    inputAiKey.value = currentSettings.aiApiKey || '';
    inputAiUrl.value = currentSettings.aiBaseUrl || 'https://token.sensenova.cn/v1/chat/completions';
    inputAiModel.value = currentSettings.aiModel || 'sensenova-6.8-flash-lite';
    inputProxyUrl.value = currentSettings.proxyUrl || 'https://truthguard.freshmanj.com';

    applyTranslations(resolveLang(currentSettings.lang));

    setYuanbaoMode(Boolean(currentSettings.useCustomYuanbaoKey));
    setAiMode(Boolean(currentSettings.useCustomAiKey));

    loadQuota();
  });

  // Toggle Selection Pill Switch Listener
  if (toggleSelectionPillEl) {
    toggleSelectionPillEl.addEventListener('change', (e) => {
      currentSettings.enableSelectionPill = e.target.checked;
      chrome.storage.local.set({ truthguard_settings: currentSettings });
      chrome.runtime.sendMessage({
        type: 'TRUTHGUARD_SAVE_SETTINGS',
        settings: currentSettings
      });
    });
  }

  // Language Switching Handler
  function handleLangChange(newLang) {
    currentSettings.lang = newLang;
    selectLangEl.value = newLang;
    settingsSelectLangEl.value = newLang;

    const resolved = resolveLang(newLang);
    applyTranslations(resolved);

    // Save preference and inform background to update context menu
    chrome.storage.local.set({ truthguard_settings: currentSettings });
    chrome.runtime.sendMessage({
      type: 'TRUTHGUARD_SAVE_SETTINGS',
      settings: currentSettings
    });
  }

  selectLangEl.addEventListener('change', (e) => handleLangChange(e.target.value));
  settingsSelectLangEl.addEventListener('change', (e) => handleLangChange(e.target.value));

  // Mode Switching
  function setYuanbaoMode(isCustom) {
    currentSettings.useCustomYuanbaoKey = isCustom;
    const t = POPUP_I18N[resolveLang(currentSettings.lang)] || POPUP_I18N.zh;
    if (isCustom) {
      btnYuanbaoModeCustom.classList.add('active');
      btnYuanbaoModeDefault.classList.remove('active');
      yuanbaoDefaultHint.classList.add('hidden');
      yuanbaoCustomFields.classList.remove('hidden');
      btnTestSearch.textContent = t.btnTestSearchCustom;
    } else {
      btnYuanbaoModeDefault.classList.add('active');
      btnYuanbaoModeCustom.classList.remove('active');
      yuanbaoDefaultHint.classList.remove('hidden');
      yuanbaoCustomFields.classList.add('hidden');
      btnTestSearch.textContent = t.btnTestSearchDefault;
    }
    loadQuota();
  }

  btnYuanbaoModeDefault.addEventListener('click', () => setYuanbaoMode(false));
  btnYuanbaoModeCustom.addEventListener('click', () => setYuanbaoMode(true));

  function setAiMode(isCustom) {
    currentSettings.useCustomAiKey = isCustom;
    const t = POPUP_I18N[resolveLang(currentSettings.lang)] || POPUP_I18N.zh;
    if (isCustom) {
      btnAiModeCustom.classList.add('active');
      btnAiModeDefault.classList.remove('active');
      aiDefaultHint.classList.add('hidden');
      aiCustomFields.classList.remove('hidden');
      btnTestAi.textContent = t.btnTestAiCustom;
    } else {
      btnAiModeDefault.classList.add('active');
      btnAiModeCustom.classList.remove('active');
      aiDefaultHint.classList.remove('hidden');
      aiCustomFields.classList.add('hidden');
      btnTestAi.textContent = t.btnTestAiDefault;
    }
    loadQuota();
  }

  btnAiModeDefault.addEventListener('click', () => setAiMode(false));
  btnAiModeCustom.addEventListener('click', () => setAiMode(true));

  // Toggle Settings Panel
  btnToggleSettings.addEventListener('click', () => {
    const isHidden = settingsPanel.classList.toggle('hidden');
    settingsArrow.textContent = isHidden ? '▾' : '▴';
  });

  // 3. Test Search Button
  btnTestSearch.addEventListener('click', () => {
    const t = POPUP_I18N[resolveLang(currentSettings.lang)] || POPUP_I18N.zh;
    testSearchResult.classList.remove('hidden', 'success', 'error');
    testSearchResult.textContent = t.testingText;

    const payload = {
      query: '腾讯元宝搜索',
      cnt: 10,
      apiKey: currentSettings.useCustomYuanbaoKey ? inputYuanbaoKey.value.trim() : '',
      proxyUrl: inputProxyUrl.value.trim() || currentSettings.proxyUrl,
      useCustomYuanbaoKey: currentSettings.useCustomYuanbaoKey
    };

    chrome.runtime.sendMessage({
      type: 'TRUTHGUARD_SEARCH_REQUEST',
      payload
    }, (res) => {
      if (res && res.success && Array.isArray(res.data)) {
        testSearchResult.className = 'test-result success';
        testSearchResult.textContent = t.testSearchSuccess.replace('{count}', res.data.length);
        loadQuota();
      } else {
        testSearchResult.className = 'test-result error';
        testSearchResult.textContent = t.testFailed.replace('{error}', res?.error || '请求失败');
      }
    });
  });

  // 4. Test AI Button
  btnTestAi.addEventListener('click', () => {
    const t = POPUP_I18N[resolveLang(currentSettings.lang)] || POPUP_I18N.zh;
    testAiResult.classList.remove('hidden', 'success', 'error');
    testAiResult.textContent = t.testingText;

    const payload = {
      messages: [{ role: 'user', content: '请回复两个字：成功。' }],
      apiKey: currentSettings.useCustomAiKey ? inputAiKey.value.trim() : '',
      baseUrl: inputAiUrl.value.trim() || currentSettings.aiBaseUrl,
      model: inputAiModel.value.trim() || currentSettings.aiModel,
      proxyUrl: inputProxyUrl.value.trim() || currentSettings.proxyUrl,
      useCustomAiKey: currentSettings.useCustomAiKey
    };

    chrome.runtime.sendMessage({
      type: 'TRUTHGUARD_AI_REQUEST',
      payload
    }, (res) => {
      if (res && res.success && res.data) {
        testAiResult.className = 'test-result success';
        testAiResult.textContent = t.testAiSuccess.replace('{msg}', res.data.slice(0, 15));
        loadQuota();
      } else {
        testAiResult.className = 'test-result error';
        testAiResult.textContent = t.testFailed.replace('{error}', res?.error || '请求失败');
      }
    });
  });

  // 5. Save Settings
  btnSaveSettings.addEventListener('click', () => {
    const newSettings = {
      useCustomYuanbaoKey: currentSettings.useCustomYuanbaoKey,
      yuanbaoApiKey: inputYuanbaoKey.value.trim(),
      useCustomAiKey: currentSettings.useCustomAiKey,
      aiApiKey: inputAiKey.value.trim(),
      aiBaseUrl: inputAiUrl.value.trim() || 'https://token.sensenova.cn/v1/chat/completions',
      aiModel: inputAiModel.value.trim() || 'sensenova-6.8-flash-lite',
      proxyUrl: inputProxyUrl.value.trim() || 'https://truthguard.freshmanj.com',
      searchCount: 10,
      lang: selectLangEl.value || 'auto',
      enableSelectionPill: toggleSelectionPillEl ? toggleSelectionPillEl.checked : true
    };

    chrome.storage.local.set({ truthguard_settings: newSettings }, () => {
      currentSettings = newSettings;
      saveStatus.classList.remove('hidden');
      setTimeout(() => {
        saveStatus.classList.add('hidden');
      }, 2000);
      loadQuota();
      chrome.runtime.sendMessage({
        type: 'TRUTHGUARD_SAVE_SETTINGS',
        settings: currentSettings
      });
    });
  });

  // 6. Quick Verify Button -> Send text to Active Tab
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
