import React from 'react';
import { 
  ShieldCheck, Settings, Award, BarChart3, 
  Play, Pause, Square, Clock, Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenCertificate: () => void;
  onOpenBenchmark: () => void;
  onLogoClick?: () => void;
  hasResults: boolean;
  claimsCount: number;
  healthScore?: number;
  // Execution Control Props (Independent from editor content)
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
  onOpenCertificate,
  onOpenBenchmark,
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
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand Identity */}
        <div 
          className={`flex items-center gap-3 ${onLogoClick ? 'cursor-pointer group' : ''}`}
          onClick={onLogoClick}
          title={onLogoClick ? "返回产品介绍形态" : undefined}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-black/5 flex-shrink-0 group-hover:scale-105 transition">
            <ShieldCheck className="h-5 w-5 text-yuanbao-400" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-yuanbao-500" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight text-slate-900 font-sans group-hover:text-yuanbao-700 transition">
                TruthGuard <span className="font-semibold text-yuanbao-600 text-xs">事实检察官</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-yuanbao-500 animate-pulse" />
                腾讯元宝搜索 · 权威信源实时联网
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Veritas AI Fact-Checking & Academic Citation Studio
            </span>
          </div>
        </div>

        {/* Center: Independent Live Execution Control Dock */}
        {isLoading ? (
          <div className="flex items-center gap-2.5 rounded-full border border-yuanbao-200 bg-yuanbao-50/90 px-3.5 py-1 shadow-xs animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs text-yuanbao-900 font-medium">
              <span className="h-2 w-2 rounded-full bg-yuanbao-500 animate-pulse" />
              <span className="hidden md:inline font-mono text-[11px] text-yuanbao-700 max-w-[180px] truncate">
                {isPaused ? '检测已挂起' : progressMessage || '穿透检索中...'}
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
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition shadow-xs active:scale-[0.98]"
                title="恢复继续执行"
              >
                <Play className="h-3 w-3 fill-white" />
                <span>继续</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-amber-600 transition shadow-xs active:scale-[0.98]"
                title="暂停当前检测"
              >
                <Pause className="h-3 w-3 fill-white" />
                <span>暂停</span>
              </button>
            )}

            {/* Abort Button */}
            <button
              onClick={onAbort}
              className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-rose-100 hover:text-rose-700 transition shadow-2xs active:scale-[0.98]"
              title="终止后续流程"
            >
              <Square className="h-2.5 w-2.5 fill-slate-700" />
              <span>终止</span>
            </button>
          </div>
        ) : hasResults && healthScore !== undefined ? (
          /* Finished State Badge */
          <div className="hidden md:flex items-center gap-3 rounded-full border border-slate-200/70 bg-slate-50/70 px-3.5 py-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-mono">核验命题:</span>
              <span className="font-semibold text-slate-800">{claimsCount} 项</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-mono">健康度得分:</span>
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
          {/* Benchmark Button (暂先隐藏) */}
          {/* <button
            onClick={onOpenBenchmark}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
            title="元宝搜索 Token 压缩率与时延评测"
          >
            <BarChart3 className="h-3.5 w-3.5 text-slate-500 group-hover:text-yuanbao-600 transition" />
            <span className="hidden sm:inline">能效评测</span>
          </button> */}

          {/* Certificate Button (暂先隐藏) */}
          {/* {hasResults && (
            <button
              onClick={onOpenCertificate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/80 bg-gradient-to-r from-amber-50 to-orange-50/60 px-3 py-1.5 text-xs font-medium text-amber-900 shadow-xs transition hover:from-amber-100 hover:to-orange-100 active:scale-[0.98]"
              title="查看与导出事实审计认证证书"
            >
              <Award className="h-3.5 w-3.5 text-amber-600" />
              <span>审计背书证书</span>
            </button>
          )} */}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
            title="API 凭证与模型配置"
          >
            <Settings className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">设置</span>
          </button>
        </div>
      </div>
    </header>
  );
};
