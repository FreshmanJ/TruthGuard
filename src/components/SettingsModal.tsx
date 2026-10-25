import React, { useState } from 'react';
import { X, Key, Check, RefreshCw, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEFAULT_SETTINGS, UserSettings } from '../types';
import { searchYuanbao } from '../services/yuanbao';

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
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [savedToast, setSavedToast] = useState(false);
  const [testingSearch, setTestingSearch] = useState(false);
  const [searchTestResult, setSearchTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
    count?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestSearch = async () => {
    if (!formData.yuanbaoApiKey.trim()) {
      setSearchTestResult({ ok: false, message: '请先输入元宝搜索 API Key' });
      return;
    }
    setTestingSearch(true);
    setSearchTestResult(null);
    const start = Date.now();
    try {
      const results = await searchYuanbao({
        query: '腾讯元宝搜索',
        apiKey: formData.yuanbaoApiKey.trim(),
        cnt: 10,
        timeoutMs: 8000,
      });
      const latency = Date.now() - start;
      const topSites = Array.from(new Set(results.map(r => r.site).filter(Boolean))).slice(0, 3).join('、');
      setSearchTestResult({
        ok: true,
        message: `连通正常！成功召回 ${results.length} 篇权威信源${topSites ? ` [${topSites}]` : ''}`,
        latencyMs: latency,
        count: results.length
      });
    } catch (err: any) {
      setSearchTestResult({
        ok: false,
        message: err.message || '搜索接口测试失败'
      });
    } finally {
      setTestingSearch(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-floating border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">API 凭证与模型偏好</h3>
              <p className="text-[11px] text-slate-400">密钥仅加密保存在本地浏览器 LocalStorage，不经任何第三方中转</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Yuanbao API Key */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>腾讯云元宝搜索 (WSA) 服务密钥 API KEY</span>
              <span className="text-[10px] text-yuanbao-600 font-medium">必填 (sk-...)</span>
            </label>
            <input
              type="password"
              value={formData.yuanbaoApiKey}
              onChange={(e) => {
                setFormData({ ...formData, yuanbaoApiKey: e.target.value });
                setSearchTestResult(null);
              }}
              placeholder="例如：sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
              required
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-400">
                在腾讯云元宝搜索控制台开通 API 密钥凭证，享受官方联网检索接口额度
              </p>
              <button
                type="button"
                onClick={handleTestSearch}
                disabled={testingSearch}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-yuanbao-700 hover:text-yuanbao-800 bg-yuanbao-50 hover:bg-yuanbao-100 px-2.5 py-1 rounded-lg border border-yuanbao-200/80 transition disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                {testingSearch ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-yuanbao-600" />
                    <span>测试中...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3 text-yuanbao-600" />
                    <span>测试搜索接口</span>
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

          {/* AI API Key */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>大语言模型 (LLM) API KEY</span>
              <span className="text-[10px] text-slate-400 font-normal">支持商汤日日新 / DeepSeek / OpenAI 等</span>
            </label>
            <input
              type="password"
              value={formData.aiApiKey}
              onChange={(e) => setFormData({ ...formData, aiApiKey: e.target.value })}
              placeholder="例如：sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
              required
            />
          </div>

          {/* AI Base URL & Model Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                AI 接口地址 (Base URL)
              </label>
              <input
                type="text"
                value={formData.aiBaseUrl}
                onChange={(e) => setFormData({ ...formData, aiBaseUrl: e.target.value })}
                placeholder="https://token.sensenova.cn/v1/chat/completions"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                模型名称 (Model)
              </label>
              <input
                type="text"
                value={formData.aiModel}
                onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                placeholder="sensenova-6.8-flash-lite"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Search Cnt Setting */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>元宝搜索单命题信源召回条数 (Cnt)</span>
              <span className="font-mono font-bold text-slate-800">{formData.searchCount || 10} 条</span>
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
              <span className="font-semibold text-yuanbao-700">10 条 (默认推荐)</span>
              <span>20 条 (深度双路探针)</span>
              <span>30 条 (全网穿透交叉)</span>
            </div>
            <p className="mt-1 text-[10.5px] text-slate-400">
              系统默认固定为 10 条，完全符合腾讯云元宝搜索 (WSA) 规范与性能推荐。
            </p>
          </div>

          {/* SenseNova Thinking & Stream Settings */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  大模型流式传输 (Stream)
                </span>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  开启 SSE 流式输出可建立长效持续连接，避免思考模式因长等待而超时
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
                <span>商汤日日新思考强度 (Reasoning Effort)</span>
                <span className="text-[10.5px] font-mono text-purple-700 font-bold">
                  {formData.reasoningEffort === 'none' ? '关闭思考' : formData.reasoningEffort === 'low' ? '敏捷精炼 (推荐)' : formData.reasoningEffort === 'high' ? '增强推理' : '中等推演'}
                </span>
              </label>
              <select
                value={formData.reasoningEffort || 'low'}
                onChange={(e) => setFormData({ ...formData, reasoningEffort: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-800 focus:outline-none transition shadow-2xs"
              >
                <option value="low">low - 敏捷精炼推理 (推荐，约 3~8s，思考精悍不冗余)</option>
                <option value="medium">medium - 中等推演 (约 10~18s，深度因果推演)</option>
                <option value="high">high - 增强推理 (约 25~40s，超长思维链逻辑推演)</option>
                <option value="none">none - 关闭思考模式 (直接输出答案，延迟最低)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition"
            >
              <RefreshCw className="h-3 w-3" />
              恢复默认推荐配置
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200/90 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-elevated hover:bg-slate-800 transition active:scale-[0.98]"
              >
                {savedToast ? <Check className="h-3.5 w-3.5 text-yuanbao-400" /> : null}
                <span>{savedToast ? '已保存！' : '保存配置'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
