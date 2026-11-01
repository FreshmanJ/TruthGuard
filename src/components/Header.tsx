import React from 'react';
import { 
  ShieldCheck, Settings, Play, Pause, Square, Puzzle, Github, Languages, ExternalLink 
} from 'lucide-react';
import { useI18n } from '../i18n/context';
import { EDGE_STORE_URL } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenCertificate: () => void;
  onOpenBenchmark: () => void;
  onOpenExtension?: () => void;
  onLogoClick?: () => void;
  hasResults: boolean;
  claimsCount: number;
  healthScore?: number;
  isLoading: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onAbort: () => void;
  elapsedMs: number;
  progressMessage: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenExtension,
  onLogoClick,
  hasResults,
  claimsCount,
  healthScore,
  isLoading,
  isPaused,
  onPause,
  onResume,
  onAbort,
  elapsedMs,
  progressMessage,
}) => {
  const { lang, toggleLang, t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand Identity */}
        <div 
          className={`flex items-center gap-3 ${onLogoClick ? 'cursor-pointer group' : ''}`}
          onClick={onLogoClick}
          title={onLogoClick ? t.header.backToHeroTitle : undefined}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-black/5 flex-shrink-0 group-hover:scale-105 transition">
            <ShieldCheck className="h-5 w-5 text-yuanbao-400" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-yuanbao-500" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight text-slate-900 font-sans group-hover:text-yuanbao-700 transition">
                {t.header.brandName} <span className="font-semibold text-yuanbao-600 text-xs">{t.header.brandTagline}</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-yuanbao-500 animate-pulse" />
                {t.header.onlineBadge}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              {t.header.studioSubtitle}
            </span>
          </div>
        </div>

        {/* Center: Independent Live Execution Control Dock */}
        {isLoading ? (
          <div className="flex items-center gap-2.5 rounded-full border border-yuanbao-200 bg-yuanbao-50/90 px-3.5 py-1 shadow-xs animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs text-yuanbao-900 font-medium">
              <span className="h-2 w-2 rounded-full bg-yuanbao-500 animate-pulse" />
              <span className="hidden md:inline font-mono text-[11px] text-yuanbao-700 max-w-[180px] truncate">
                {isPaused ? t.header.statusPaused : progressMessage || t.header.statusSearching}
              </span>
              <span className="font-mono text-xs font-bold text-yuanbao-800 ml-1">
                {(elapsedMs / 1000).toFixed(1)}s
              </span>
            </div>

            <div className="h-3 w-px bg-yuanbao-200 mx-0.5" />

            {/* Pause / Resume Button */}
            {isPaused ? (
              <button
                onClick={onResume}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition shadow-xs active:scale-[0.98] cursor-pointer"
                title={t.header.resumeTitle}
              >
                <Play className="h-3 w-3 fill-white" />
                <span>{t.header.resume}</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-amber-600 transition shadow-xs active:scale-[0.98] cursor-pointer"
                title={t.header.pauseTitle}
              >
                <Pause className="h-3 w-3 fill-white" />
                <span>{t.header.pause}</span>
              </button>
            )}

            {/* Abort Button */}
            <button
              onClick={onAbort}
              className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-rose-100 hover:text-rose-700 transition shadow-2xs active:scale-[0.98] cursor-pointer"
              title={t.header.abortTitle}
            >
              <Square className="h-2.5 w-2.5 fill-slate-700" />
              <span>{t.header.abort}</span>
            </button>
          </div>
        ) : hasResults && healthScore !== undefined ? (
          /* Finished State Badge */
          <div className="hidden md:flex items-center gap-3 rounded-full border border-slate-200/70 bg-slate-50/70 px-3.5 py-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-mono">{t.header.claimsCount}</span>
              <span className="font-semibold text-slate-800">{claimsCount} {t.header.items}</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-mono">{t.header.healthScore}</span>
              <span className={`font-bold font-mono ${
                healthScore >= 80 ? 'text-emerald-600' : healthScore >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {healthScore}%
              </span>
            </div>
          </div>
        ) : null}

        {/* Right Action Suite */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Pill */}
          <button
            onClick={toggleLang}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] cursor-pointer"
            title={t.header.langSwitchTitle}
          >
            <Languages className="h-3.5 w-3.5 text-yuanbao-600 group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-medium">{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>

          {/* Browser Extension Button - Directly Jumps to Microsoft Edge Add-ons */}
          <a
            href={EDGE_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/90 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs transition hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-400 active:scale-[0.98] cursor-pointer"
            title={t.header.extensionTitle}
          >
            <Puzzle className="h-3.5 w-3.5 text-emerald-600 group-hover:rotate-12 transition-transform duration-200" />
            <span>{t.header.extensionBtn}</span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-200/80 px-1.5 py-0.2 text-[9.5px] font-mono text-emerald-950 font-extrabold">
              {t.header.extensionBadge}
            </span>
            <ExternalLink className="h-3 w-3 text-emerald-700/80 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          {/* GitHub Open Source Link */}
          <a
            href="https://github.com/FreshmanJ/TruthGuard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98]"
            title={t.header.githubTitle}
          >
            <Github className="h-3.5 w-3.5 text-slate-800" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] cursor-pointer"
            title={t.header.settingsTitle}
          >
            <Settings className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">{t.header.settingsBtn}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
