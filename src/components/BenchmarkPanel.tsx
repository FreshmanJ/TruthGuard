import React from 'react';
import { X, Zap, Cpu, CheckCircle2, AlertOctagon, TrendingDown, Layers, Clock } from 'lucide-react';
import { VerificationSummary } from '../types';

interface BenchmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  summary: VerificationSummary | null;
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  if (!isOpen) return null;

  const totalQueries = summary?.totalClaims || 4;
  const yuanbaoTokens = summary?.yuanbaoTokensEstimated || totalQueries * 5 * 220;
  const rawTokens = summary?.rawWebTokensEstimated || totalQueries * 5 * 7800;
  const savings = summary?.tokenSavingsPercent || 97;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-floating border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yuanbao-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 tracking-tight">
                元宝搜索 vs 传统网络爬虫能效评测 (Benchmark)
              </h3>
              <p className="text-[11px] text-slate-400">大模型输入信息去噪率与上下文 Token 成本对比</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Key Metric Banner - Sleek Dark Slate */}
          <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-yuanbao-400 uppercase tracking-widest font-mono font-semibold">
                  CONTEXT TOKEN REDUCTION
                </span>
                <div className="text-3xl font-black mt-0.5 tracking-tight font-mono">
                  Token 消耗直降 <span className="text-yuanbao-400">{savings}%</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300 max-w-md">
                  元宝搜索在云端完成千亿向量实时索引与 Gist Token 压缩去噪，无需输入冗余 HTML 网页代码。
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md flex-shrink-0">
                <TrendingDown className="h-7 w-7 text-yuanbao-400" />
              </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-yuanbao-500/20 blur-2xl pointer-events-none" />
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Raw Scraping */}
            <div className="rounded-2xl border border-rose-200/70 bg-rose-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-rose-600" />
                <h4 className="font-bold text-slate-800 text-[12px]">传统网页抓取 + 粗清洗</h4>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-rose-100 pb-1.5">
                  <span className="text-slate-500">单信源原始大小</span>
                  <span className="font-mono font-bold text-rose-700">~60 KB - 250 KB</span>
                </div>
                <div className="flex justify-between border-b border-rose-100 pb-1.5">
                  <span className="text-slate-500">单轮核验消耗 Token</span>
                  <span className="font-mono font-bold text-rose-700">~{rawTokens.toLocaleString()} Tokens</span>
                </div>
                <div className="flex justify-between border-b border-rose-100 pb-1.5">
                  <span className="text-slate-500">平均检索时延</span>
                  <span className="font-mono font-bold text-rose-700">2,800ms - 5,500ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">维护成本</span>
                  <span className="text-rose-700 font-medium">高（代理池、反爬对抗）</span>
                </div>
              </div>
            </div>

            {/* Yuanbao Search */}
            <div className="rounded-2xl border border-yuanbao-200/80 bg-yuanbao-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-yuanbao-600" />
                <h4 className="font-bold text-slate-800 text-[12px]">腾讯云元宝搜索 (WSA)</h4>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-yuanbao-100 pb-1.5">
                  <span className="text-slate-500">精排事实摘要大小</span>
                  <span className="font-mono font-bold text-yuanbao-700">~1.2 KB (纯事实段落)</span>
                </div>
                <div className="flex justify-between border-b border-yuanbao-100 pb-1.5">
                  <span className="text-slate-500">单轮核验消耗 Token</span>
                  <span className="font-mono font-bold text-yuanbao-700">~{yuanbaoTokens.toLocaleString()} Tokens</span>
                </div>
                <div className="flex justify-between border-b border-yuanbao-100 pb-1.5">
                  <span className="text-slate-500">平均检索时延</span>
                  <span className="font-mono font-bold text-yuanbao-700">300ms - 600ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">信源权威度</span>
                  <span className="text-yuanbao-700 font-medium">157+ 头部权威行业信源</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Why Box */}
          <div className="rounded-xl bg-[#FAFAFA] p-4 border border-slate-200/70">
            <h5 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5 text-[11.5px]">
              <Cpu className="h-3.5 w-3.5 text-slate-600" />
              为什么元宝搜索能让事实核查快又省？
            </h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              元宝搜索在云端完成分层聚类与去噪精排，直接向大模型输送高相关度的 `passage` 结构化摘要，省去了繁杂的爬虫、清洗与重排工程。结合高时效信源召回，构建起真正可信、低延迟的事实审校副驾驶。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50/70 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition active:scale-[0.98]"
          >
            关闭评测面板
          </button>
        </div>
      </div>
    </div>
  );
};
