import React, { useState } from 'react';
import { 
  X, Puzzle, Download, CheckCircle2, 
  ExternalLink, Sparkles, ShieldCheck, FileText, Monitor, Check, Github
} from 'lucide-react';
import { useI18n, interpolate } from '../i18n/context';
import { EDGE_STORE_URL } from '../types';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/truthguard-extension.zip';
    link.download = 'truthguard-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-white shadow-floating border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Puzzle className="h-4.5 w-4.5 text-yuanbao-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {t.extension.title}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.extension.mv3Badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t.extension.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
            title={t.common.close}
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Hero Banner with Instant Download Button */}
          <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-emerald-200 px-3 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-2xs">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>{t.extension.heroPill}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {t.extension.heroTitle}
              </h2>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                {t.extension.heroDesc}
              </p>
            </div>

            {/* Direct Microsoft Store CTA Button */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <a
                href={EDGE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs font-bold shadow-elevated transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Puzzle className="h-4 w-4 text-white" />
                <span>{t.extension.downloadBtn}</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/90" />
              </a>
              <span className="text-[10.5px] font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                {t.extension.downloadZipNotice}
              </span>
            </div>
          </div>

          {/* 3 Pillars of Extension */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-2">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {t.extension.pillar1Title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t.extension.pillar1Desc}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 mb-2">
                <Monitor className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {t.extension.pillar2Title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t.extension.pillar2Desc}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 mb-2">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {t.extension.pillar3Title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t.extension.pillar3Desc}
              </p>
            </div>
          </div>

          {/* 4-Step Installation Guide */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-mono">
                  i
                </span>
                <span>{t.extension.stepsTitle}</span>
              </h4>
              <span className="text-[10.5px] font-mono text-slate-400">
                {t.extension.stepsSubtitle}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      {interpolate(t.extension.stepBadge, { step: 1 })}
                    </span>
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{t.extension.step1Title}</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    {t.extension.step1Desc}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      {interpolate(t.extension.stepBadge, { step: 2 })}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{t.extension.step2Title}</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    {t.extension.step2Desc}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      {interpolate(t.extension.stepBadge, { step: 3 })}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{t.extension.step3Title}</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    {t.extension.step3Desc}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      {interpolate(t.extension.stepBadge, { step: 4 })}
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{t.extension.step4Title}</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    {t.extension.step4Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="text-[11px] text-slate-400">
            <span>{t.extension.footerTech}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/FreshmanJ/TruthGuard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold transition cursor-pointer"
            >
              <Github className="h-3.5 w-3.5 text-slate-800" />
              <span className="hidden sm:inline">{t.extension.githubSource}</span>
            </a>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 text-xs font-medium transition cursor-pointer"
              title="下载离线 zip 包，适合开发者或内网环境测试"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>{t.extension.downloadZipBtn}</span>
            </button>
            <a
              href={EDGE_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{t.extension.storeInstallBtn}</span>
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-2 text-xs font-medium transition cursor-pointer"
            >
              <span>{t.extension.gotItBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
