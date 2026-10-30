import React from 'react';
import { X, Zap, Cpu, CheckCircle2, AlertOctagon, TrendingDown } from 'lucide-react';
import { VerificationSummary } from '../types';
import { useI18n, interpolate } from '../i18n/context';

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
  const { t } = useI18n();

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
                {t.benchmark.title}
              </h3>
              <p className="text-[11px] text-slate-400">{t.benchmark.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            title={t.common.close}
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
                  {t.benchmark.contextTokenReduction}
                </span>
                <div className="text-3xl font-black mt-0.5 tracking-tight font-mono">
                  {interpolate(t.benchmark.tokenSavingsTitle, { savings })}
                </div>
                <p className="mt-1 text-[11px] text-slate-300 max-w-md">
                  {t.benchmark.tokenSavingsDesc}
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
                <h4 className="font-bold text-slate-800 text-[12px]">{t.benchmark.cardTraditionalTitle}</h4>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-rose-100 pb-1.5">
                  <span className="text-slate-500">{t.benchmark.cardTraditionalSourceSize}</span>
                  <span className="font-mono font-bold text-rose-700">~60 KB - 250 KB</span>
                </div>
                <div className="flex justify-between border-b border-rose-100 pb-1.5">
                  <span className="text-slate-500">{t.benchmark.cardTraditionalTokenCost}</span>
                  <span className="font-mono font-bold text-rose-700">~{rawTokens.toLocaleString()} Tokens</span>
                </div>
                <div className="flex justify-between border-b border-rose-100 pb-1.5">
                  <span className="text-slate-500">{t.benchmark.cardTraditionalLatency}</span>
                  <span className="font-mono font-bold text-rose-700">2,800ms - 5,500ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.benchmark.cardTraditionalMaintenance}</span>
                  <span className="text-rose-700 font-medium">{t.benchmark.cardTraditionalMaintenanceVal}</span>
                </div>
              </div>
            </div>

            {/* Yuanbao Search */}
            <div className="rounded-2xl border border-yuanbao-200/80 bg-yuanbao-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-yuanbao-600" />
                <h4 className="font-bold text-slate-800 text-[12px]">{t.benchmark.cardYuanbaoTitle}</h4>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-yuanbao-100 pb-1.5">
                  <span className="text-slate-500">{t.benchmark.cardYuanbaoSourceSize}</span>
                  <span className="font-mono font-bold text-yuanbao-700">{t.benchmark.cardYuanbaoSourceSizeVal}</span>
                </div>
                <div className="flex justify-between border-b border-yuanbao-100 pb-1.5">
                  <span className="text-slate-500">{t.benchmark.cardYuanbaoTokenCost}</span>
                  <span className="font-mono font-bold text-yuanbao-700">~{yuanbaoTokens.toLocaleString()} Tokens</span>
                </div>
                <div className="flex justify-between border-b border-yuanbao-100 pb-1.5">
                  <span className="text-slate-500">{t.benchmark.cardYuanbaoLatency}</span>
                  <span className="font-mono font-bold text-yuanbao-700">300ms - 600ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.benchmark.cardYuanbaoAuthority}</span>
                  <span className="text-yuanbao-700 font-medium">{t.benchmark.cardYuanbaoAuthorityVal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Why Box */}
          <div className="rounded-xl bg-[#FAFAFA] p-4 border border-slate-200/70">
            <h5 className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5 text-[11.5px]">
              <Cpu className="h-3.5 w-3.5 text-slate-600" />
              {t.benchmark.whyTitle}
            </h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {t.benchmark.whyDesc}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50/70 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition active:scale-[0.98]"
          >
            {t.benchmark.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
