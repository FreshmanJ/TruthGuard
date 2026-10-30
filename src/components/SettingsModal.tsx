import React, { useState, useEffect } from 'react';
import { 
  X, Key, Check, RefreshCw, Search, Loader2, CheckCircle2, 
  AlertCircle, Sparkles, Zap, RotateCw
} from 'lucide-react';
import { DEFAULT_SETTINGS, UserSettings } from '../types';
import { searchYuanbao } from '../services/yuanbao';
import { callAI } from '../services/ai';
import { fetchQuotaUsage, QuotaInfo } from '../services/quota';
import { useI18n } from '../i18n/context';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const { lang, t } = useI18n();
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [savedToast, setSavedToast] = useState(false);
  const [testingSearch, setTestingSearch] = useState(false);
  const [searchTestResult, setSearchTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
    count?: number;
  } | null>(null);

  const [testingAI, setTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loadingQuota, setLoadingQuota] = useState(false);

  const loadQuota = async () => {
    setLoadingQuota(true);
    try {
      const q = await fetchQuotaUsage();
      setQuota(q);
    } catch (err) {
      console.warn('Load quota failed:', err);
    } finally {
      setLoadingQuota(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      setSearchTestResult(null);
      setAiTestResult(null);
      loadQuota();
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleTestSearch = async () => {
    if (formData.useCustomYuanbaoKey && !formData.yuanbaoApiKey.trim()) {
      setSearchTestResult({ 
        ok: false, 
        message: lang === 'en' ? 'Please enter your custom Yuanbao Search API Key' : '请先输入自定义元宝搜索 API Key' 
      });
      return;
    }
    setTestingSearch(true);
    setSearchTestResult(null);
    const start = Date.now();
    try {
      const results = await searchYuanbao({
        query: '腾讯元宝搜索',
        apiKey: formData.useCustomYuanbaoKey ? formData.yuanbaoApiKey.trim() : '',
        cnt: 10,
        timeoutMs: 8000,
      });
      const latency = Date.now() - start;
      const topSites = Array.from(new Set(results.map(r => r.site).filter(Boolean))).slice(0, 3).join(', ');
      setSearchTestResult({
        ok: true,
        message: lang === 'en'
          ? `Connection verified! Retrieved ${results.length} sources${topSites ? ` [${topSites}]` : ''}`
          : `${formData.useCustomYuanbaoKey ? '自定义密钥' : '系统默认接口'}连通正常！成功召回 ${results.length} 篇权威信源${topSites ? ` [${topSites}]` : ''}`,
        latencyMs: latency,
        count: results.length
      });
      loadQuota();
    } catch (err: any) {
      setSearchTestResult({
        ok: false,
        message: err.message || (lang === 'en' ? 'Search API test failed' : '搜索接口测试失败')
      });
    } finally {
      setTestingSearch(false);
    }
  };

  const handleTestAI = async () => {
    if (formData.useCustomAiKey) {
      if (!formData.aiApiKey.trim()) {
        setAiTestResult({ 
          ok: false, 
          message: lang === 'en' ? 'Please enter your custom LLM API Key' : '请先输入自定义大语言模型 API Key' 
        });
        return;
      }
      if (!formData.aiBaseUrl.trim()) {
        setAiTestResult({ 
          ok: false, 
          message: lang === 'en' ? 'Please enter AI Base URL' : '请先输入 AI 接口地址 (Base URL)' 
        });
        return;
      }
      if (!formData.aiModel.trim()) {
        setAiTestResult({ 
          ok: false, 
          message: lang === 'en' ? 'Please enter Model Name' : '请先输入模型名称 (Model)' 
        });
        return;
      }
    }

    setTestingAI(true);
    setAiTestResult(null);
    const start = Date.now();
    try {
      const reply = await callAI({
        apiKey: formData.useCustomAiKey ? formData.aiApiKey.trim() : '',
        baseUrl: formData.aiBaseUrl.trim() || 'https://token.sensenova.cn/v1/chat/completions',
        model: formData.aiModel.trim() || 'sensenova-6.8-flash-lite',
        messages: [
          { role: 'user', content: lang === 'en' ? 'Reply with two words: Connection OK.' : '请直接回复四个字：连接成功。无需多余解释。' }
        ],
        temperature: 0.1,
        timeoutMs: 15000,
        maxRetries: 0,
        stream: formData.enableStreaming ?? true,
        reasoningEffort: formData.reasoningEffort === 'none' ? undefined : (formData.reasoningEffort || 'low'),
      });
      const latency = Date.now() - start;
      const cleanReply = (reply || '').replace(/\r?\n+/g, ' ').trim();
      setAiTestResult({
        ok: true,
        message: lang === 'en'
          ? `Connection verified! Model responded: ${cleanReply.length > 35 ? cleanReply.slice(0, 35) + '...' : cleanReply || 'Handshake OK'}`
          : `${formData.useCustomAiKey ? '自定义 API' : '系统默认模型'}握手成功！模型响应：${cleanReply.length > 35 ? cleanReply.slice(0, 35) + '...' : cleanReply || '握手成功'}`,
        latencyMs: latency
      });
      loadQuota();
    } catch (err: any) {
      let errMsg = err.message || (lang === 'en' ? 'AI connection test failed' : 'AI 接口测试失败');
      try {
        const json = JSON.parse(errMsg);
        if (json?.error?.message) errMsg = json.error.message;
        else if (json?.error && typeof json.error === 'string') errMsg = json.error;
        else if (json?.message) errMsg = json.message;
      } catch {}

      setAiTestResult({
        ok: false,
        message: errMsg
      });
    } finally {
      setTestingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.useCustomYuanbaoKey && !formData.yuanbaoApiKey.trim()) {
      setSearchTestResult({
        ok: false,
        message: lang === 'en' ? 'Please provide custom Yuanbao Key or switch to Default' : '已选择自定义元宝搜索，请输入 API Key 或切回系统默认接口'
      });
      return;
    }
    if (formData.useCustomAiKey && !formData.aiApiKey.trim()) {
      setAiTestResult({
        ok: false,
        message: lang === 'en' ? 'Please provide custom AI Key or switch to Default' : '已选择自定义 AI API，请输入 API Key 或切回系统默认服务'
      });
      return;
    }
    onSave(formData);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_SETTINGS);
    setSearchTestResult(null);
    setAiTestResult(null);
    loadQuota();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-floating border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{t.settings.title}</h3>
              <p className="text-[11px] text-slate-400">{t.settings.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">

          {/* Daily Quota Status Panel */}
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-50/60 p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Zap className="h-3 w-3" />
                </span>
                <span className="font-bold text-slate-800 text-[11.5px]">
                  {lang === 'en' ? 'Daily Free Public Quota Usage' : '今日公共接口免费额度使用'}
                </span>
              </div>
              <button
                type="button"
                onClick={loadQuota}
                disabled={loadingQuota}
                className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title={lang === 'en' ? 'Refresh remaining quota' : '刷新实时剩余额度'}
              >
                <RotateCw className={`h-2.5 w-2.5 ${loadingQuota ? 'animate-spin text-slate-700' : ''}`} />
                <span>{lang === 'en' ? 'Refresh' : '刷新额度'}</span>
              </button>
            </div>

            {/* Quota Progress Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Yuanbao Search Quota Card */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Search className="h-3 w-3 text-yuanbao-600" />
                    {lang === 'en' ? 'Yuanbao Search' : '元宝搜索检索'}
                  </span>
                  {formData.useCustomYuanbaoKey ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {lang === 'en' ? 'Custom Key · Unlimited' : '自定义 Key · 无限制'}
                    </span>
                  ) : (
                    <span className="font-mono text-[10.5px] font-bold text-slate-700">
                      {quota ? `${quota.search.used} / ${quota.search.limit}` : '0 / 120'} 次
                    </span>
                  )}
                </div>
                {!formData.useCustomYuanbaoKey && (
                  <>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          (quota?.search.used ?? 0) >= 120 ? 'bg-rose-500' : (quota?.search.used ?? 0) >= 90 ? 'bg-amber-500' : 'bg-yuanbao-600'
                        }`}
                        style={{ width: `${Math.min(100, (((quota?.search.used ?? 0) / 120) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{lang === 'en' ? 'Daily cap: 120' : '单日限额 120 次'}</span>
                      <span className="text-slate-600 font-mono font-medium">
                        {lang === 'en' ? `Left: ${quota ? quota.search.remaining : 120}` : `剩余 ${quota ? quota.search.remaining : 120} 次`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* AI Quota Card */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    {lang === 'en' ? 'AI Inference' : 'AI 大模型调用'}
                  </span>
                  {formData.useCustomAiKey ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {lang === 'en' ? 'Custom Key · Unlimited' : '自定义 Key · 无限制'}
                    </span>
                  ) : (
                    <span className="font-mono text-[10.5px] font-bold text-slate-700">
                      {quota ? `${quota.ai.used} / ${quota.ai.limit}` : '0 / 300'} 次
                    </span>
                  )}
                </div>
                {!formData.useCustomAiKey && (
                  <>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          (quota?.ai.used ?? 0) >= 300 ? 'bg-rose-500' : (quota?.ai.used ?? 0) >= 240 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, (((quota?.ai.used ?? 0) / 300) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{lang === 'en' ? 'Daily cap: 300' : '单日限额 300 次'}</span>
                      <span className="text-slate-600 font-mono font-medium">
                        {lang === 'en' ? `Left: ${quota ? quota.ai.remaining : 300}` : `剩余 ${quota ? quota.ai.remaining : 300} 次`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              {lang === 'en' 
                ? '* Free quota is determined by IP and browser fingerprint and resets daily at 00:00 (UTC+8). Same IP or same browser shares quota. Configure custom API Keys below for unlimited access.'
                : '* 免费额度根据 IP 与浏览器指纹每日 00:00 自动刷新重置。同一 IP 或同一浏览器均视为同一用户。额度耗尽后可随时切换下方自定义 API Key 继续使用。'}
            </p>
          </div>

          {/* Yuanbao Search Configuration Block */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-yuanbao-600" />
                <span>{t.settings.yuanbaoKeyTitle}</span>
              </span>

              {/* Mode Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, useCustomYuanbaoKey: false });
                    setSearchTestResult(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                    !formData.useCustomYuanbaoKey
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lang === 'en' ? 'Default (Free)' : '系统默认接口 (推荐)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, useCustomYuanbaoKey: true });
                    setSearchTestResult(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                    formData.useCustomYuanbaoKey
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lang === 'en' ? 'Custom Key' : '自定义 API Key'}
                </button>
              </div>
            </div>

            {!formData.useCustomYuanbaoKey ? (
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-2.5 text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-950">
                    {lang === 'en' ? 'Using System Managed Official Yuanbao Search' : '已启用系统托管公共接口（无需填写 Key）'}
                  </div>
                  <p className="text-emerald-800/80 text-[10.5px] mt-0.5">
                    {lang === 'en' 
                      ? 'Pre-configured official Tencent Yuanbao WSA endpoint. Enjoy 120 free searches per day without registration.' 
                      : '系统已内置腾讯云官方元宝搜索密钥，享受每日 120 次免密检索配额，开箱即用。'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 text-[11px] flex items-center justify-between">
                  <span>{lang === 'en' ? 'Custom Yuanbao API Key' : '输入您的腾讯云元宝搜索 API Key'}</span>
                  <span className="text-[10px] text-yuanbao-600 font-medium font-mono">sk-...</span>
                </label>
                <input
                  type="password"
                  value={formData.yuanbaoApiKey}
                  onChange={(e) => {
                    setFormData({ ...formData, yuanbaoApiKey: e.target.value });
                    setSearchTestResult(null);
                  }}
                  placeholder="例如：sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
                />
                <p className="text-[10.5px] text-slate-400">
                  {lang === 'en' 
                    ? 'Use your own API Key from Tencent Cloud WSA Console. Bypasses daily public quotas.' 
                    : '使用您在腾讯云元宝搜索控制台申请的 API 凭证，不受每日公共免费额度限制。'}
                </p>
              </div>
            )}

            {/* Test Action */}
            <div className="pt-0.5 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                {formData.useCustomYuanbaoKey 
                  ? (lang === 'en' ? 'Verify custom API key connectivity' : '测试您输入的自定义密钥连通性')
                  : (lang === 'en' ? 'Verify system default Yuanbao endpoint' : '测试系统托管官方检索接口连通性')}
              </span>
              <button
                type="button"
                onClick={handleTestSearch}
                disabled={testingSearch}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-yuanbao-700 hover:text-yuanbao-800 bg-yuanbao-50 hover:bg-yuanbao-100 px-2.5 py-1 rounded-lg border border-yuanbao-200/80 transition disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                {testingSearch ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-yuanbao-600" />
                    <span>{t.settings.testing}</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3 text-yuanbao-600" />
                    <span>{formData.useCustomYuanbaoKey ? (lang === 'en' ? 'Test Custom Key' : '测试自定义 Key') : (lang === 'en' ? 'Test System Search' : '测试系统搜索接口')}</span>
                  </>
                )}
              </button>
            </div>

            {searchTestResult && (
              <div
                className={`mt-2 flex items-start gap-1.5 rounded-xl p-2 text-[11px] transition-all ${
                  searchTestResult.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {searchTestResult.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold">{searchTestResult.message}</span>
                  {searchTestResult.latencyMs && (
                    <span className="ml-1.5 font-mono text-emerald-700">({searchTestResult.latencyMs}ms)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI LLM Configuration Block */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span>{t.settings.aiKeyTitle}</span>
              </span>

              {/* Mode Toggle */}
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, useCustomAiKey: false });
                    setAiTestResult(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                    !formData.useCustomAiKey
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lang === 'en' ? 'Default (Free)' : '系统默认服务 (推荐)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, useCustomAiKey: true });
                    setAiTestResult(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                    formData.useCustomAiKey
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lang === 'en' ? 'Custom AI API' : '自定义 AI API'}
                </button>
              </div>
            </div>

            {!formData.useCustomAiKey ? (
              <div className="rounded-xl bg-purple-50/60 border border-purple-200/80 p-2.5 text-[11px] text-purple-900 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-purple-950">
                    {lang === 'en' ? 'Using System Managed SenseNova 6.8 Model' : '已启用系统托管商汤日日新 (SenseNova 6.8) 服务'}
                  </div>
                  <p className="text-purple-800/80 text-[10.5px] mt-0.5">
                    {lang === 'en' 
                      ? 'Pre-configured LLM endpoint. Enjoy 300 free inference calls per day without API key.' 
                      : '系统已内置商汤日日新推理密钥，享受每日 300 次免费推理调用配额，开箱即用。'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[11px] flex items-center justify-between">
                    <span>{lang === 'en' ? 'Custom LLM API Key' : '输入您的自定义大模型 (LLM) API KEY'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">支持 OpenAI / DeepSeek / SenseNova 等</span>
                  </label>
                  <input
                    type="password"
                    value={formData.aiApiKey}
                    onChange={(e) => {
                      setFormData({ ...formData, aiApiKey: e.target.value });
                      setAiTestResult(null);
                    }}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      {t.settings.baseUrlTitle}
                    </label>
                    <input
                      type="text"
                      value={formData.aiBaseUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, aiBaseUrl: e.target.value });
                        setAiTestResult(null);
                      }}
                      placeholder="https://token.sensenova.cn/v1/chat/completions"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      {t.settings.modelTitle}
                    </label>
                    <input
                      type="text"
                      value={formData.aiModel}
                      onChange={(e) => {
                        setFormData({ ...formData, aiModel: e.target.value });
                        setAiTestResult(null);
                      }}
                      placeholder="sensenova-6.8-flash-lite"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Test Action */}
            <div className="pt-0.5 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                {formData.useCustomAiKey 
                  ? (lang === 'en' ? 'Verify custom model connectivity' : '测试您输入的自定义模型连通性')
                  : (lang === 'en' ? 'Verify system default SenseNova model' : '测试系统托管商汤日日新模型连通性')}
              </span>
              <button
                type="button"
                onClick={handleTestAI}
                disabled={testingAI}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200/80 transition disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                {testingAI ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                    <span>{t.settings.testing}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    <span>{formData.useCustomAiKey ? (lang === 'en' ? 'Test Custom AI' : '测试自定义 API') : (lang === 'en' ? 'Test System AI' : '测试系统 AI 接口')}</span>
                  </>
                )}
              </button>
            </div>

            {aiTestResult && (
              <div
                className={`mt-2 flex items-start gap-1.5 rounded-xl p-2 text-[11px] transition-all ${
                  aiTestResult.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {aiTestResult.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold">{aiTestResult.message}</span>
                  {aiTestResult.latencyMs && (
                    <span className="ml-1.5 font-mono text-emerald-700">({aiTestResult.latencyMs}ms)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Cnt Setting */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>{t.settings.searchCountTitle}</span>
              <span className="font-mono font-bold text-slate-800">{formData.searchCount || 10}</span>
            </label>
            <input
              type="range"
              min="10"
              max="30"
              step="10"
              value={formData.searchCount || 10}
              onChange={(e) => setFormData({ ...formData, searchCount: parseInt(e.target.value) || 10 })}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span className="font-semibold text-yuanbao-700">{lang === 'en' ? '10 (Default)' : '10 条 (默认推荐)'}</span>
              <span>{lang === 'en' ? '20 (Deep Probes)' : '20 条 (深度双路探针)'}</span>
              <span>{lang === 'en' ? '30 (Full Web)' : '30 条 (全网穿透交叉)'}</span>
            </div>
          </div>

          {/* Reasoning & Stream Settings */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t.settings.streamingTitle}
                </span>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  {t.settings.streamingDesc}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableStreaming ?? true}
                  onChange={(e) => setFormData({ ...formData, enableStreaming: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="border-t border-slate-200/60 pt-2.5">
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>{t.settings.reasoningEffortTitle}</span>
                <span className="text-[10.5px] font-mono text-purple-700 font-bold">
                  {formData.reasoningEffort === 'none' 
                    ? t.settings.effortNone 
                    : formData.reasoningEffort === 'low' 
                    ? t.settings.effortLow 
                    : formData.reasoningEffort === 'high' 
                    ? t.settings.effortHigh 
                    : t.settings.effortMedium}
                </span>
              </label>
              <select
                value={formData.reasoningEffort || 'low'}
                onChange={(e) => setFormData({ ...formData, reasoningEffort: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-800 focus:outline-none transition shadow-2xs"
              >
                <option value="low">{lang === 'en' ? 'low - Concise reasoning (~3-8s, recommended)' : 'low - 敏捷精炼推理 (推荐，约 3~8s，思考精悍不冗余)'}</option>
                <option value="medium">{lang === 'en' ? 'medium - Standard reasoning (~10-18s)' : 'medium - 中等推演 (约 10~18s，深度因果推演)'}</option>
                <option value="high">{lang === 'en' ? 'high - Deep reasoning (~25-40s)' : 'high - 增强推理 (约 25~40s，超长思维链逻辑推演)'}</option>
                <option value="none">{lang === 'en' ? 'none - Direct output, lowest latency' : 'none - 关闭思考模式 (直接输出答案，延迟最低)'}</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              {t.settings.resetBtn}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200/90 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                {t.settings.cancelBtn}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-elevated hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer"
              >
                {savedToast ? <Check className="h-3.5 w-3.5 text-yuanbao-400" /> : null}
                <span>{savedToast ? t.settings.savedToast : t.settings.saveBtn}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
