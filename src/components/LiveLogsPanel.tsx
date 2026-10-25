import React, { useRef, useEffect, useState } from 'react';
import { Terminal, ArrowDown, Search, CheckCircle2, Clock, Globe2, AlertCircle, Key, RefreshCw, ZapOff, ShieldAlert, ShieldCheck, Sparkles, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { WorkflowLog, WorkflowStage } from '../types';

interface LiveLogsPanelProps {
  logs: WorkflowLog[];
  stage: WorkflowStage;
  isPaused: boolean;
  elapsedMs: number;
}

export const LiveLogsPanel: React.FC<LiveLogsPanelProps> = ({
  logs,
  stage,
  isPaused,
  elapsedMs,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Set<string>>(new Set());

  const toggleThinking = (id: string) => {
    setExpandedThinkingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getTagBadge = (log: WorkflowLog) => {
    // 1. Explicit Error / Warning Kind Classification
    if (log.errorKind === 'timeout' || log.message.includes('超时')) {
      return (
        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300 flex-shrink-0 flex items-center gap-1 animate-pulse">
          <Clock className="h-2.5 w-2.5 text-amber-600" />
          超时重试
        </span>
      );
    }

    if (log.errorKind === 'auth' || log.message.includes('鉴权')) {
      return (
        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300 flex-shrink-0 flex items-center gap-1">
          <Key className="h-2.5 w-2.5 text-rose-600" />
          鉴权错误
        </span>
      );
    }

    if (log.errorKind === 'rate_limit' || log.message.includes('频控')) {
      return (
        <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-300 flex-shrink-0 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5 text-purple-600" />
          频控超限
        </span>
      );
    }

    if (log.errorKind === 'server' || log.message.includes('服务故障')) {
      return (
        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300 flex-shrink-0 flex items-center gap-1">
          <ZapOff className="h-2.5 w-2.5 text-rose-600" />
          服务故障
        </span>
      );
    }

    if (log.errorKind === 'degraded' || log.message.includes('降级')) {
      return (
        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 border border-indigo-200 flex-shrink-0 flex items-center gap-1">
          <ShieldAlert className="h-2.5 w-2.5 text-indigo-600" />
          规则降级
        </span>
      );
    }

    // 2. Stage standard badges
    switch (log.type) {
      case 'inspect':
        return (
          <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-300 flex-shrink-0 flex items-center gap-1">
            <ShieldCheck className="h-2.5 w-2.5 text-sky-600" />
            来源预检
          </span>
        );
      case 'extract':
        return (
          <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-300 flex-shrink-0 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-teal-600" />
            图文提取
          </span>
        );
      case 'search':
        return (
          <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-bold text-cyan-800 border border-cyan-200/80 flex-shrink-0">
            WSA搜索
          </span>
        );
      case 'success':
        return (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 flex-shrink-0">
            证实通过
          </span>
        );
      case 'warn':
        if (log.message.includes('重试')) {
          return (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300 flex-shrink-0 flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5 text-amber-600 animate-spin" />
              接口重试
            </span>
          );
        }
        return (
          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200/80 flex-shrink-0">
            幻觉拦截
          </span>
        );
      case 'error':
        return (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800 border border-red-200 flex-shrink-0">
            执行异常
          </span>
        );
      case 'thinking':
        return (
          <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 flex-shrink-0 flex items-center gap-1">
            <Brain className="h-2.5 w-2.5 text-purple-600" />
            深度思考
          </span>
        );
      case 'info':
      default:
        return (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60 flex-shrink-0">
            系统事件
          </span>
        );
    }
  };

  const isRunning = stage !== 'idle' && stage !== 'completed' && stage !== 'aborted';

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden font-sans">
      {/* Area 2: Top Header */}
      <div className="border-b border-slate-100 bg-[#FAFAFA] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Terminal className="h-3.5 w-3.5 text-yuanbao-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">
              2. 实时流水日志 (Stream Logs)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 pl-1">
            • 共 {logs.length} 条记录
          </span>
        </div>

        {/* Live Status & Auto-scroll Toggle */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
              <span className={`h-1.5 w-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              {isPaused ? '已暂停' : `穿透中 ${(elapsedMs / 1000).toFixed(1)}s`}
            </span>
          ) : stage === 'completed' ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-500">
              审校已完成
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-400">
              就绪待命
            </span>
          )}

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition flex items-center gap-1 ${
              autoScroll 
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold' 
                : 'border-slate-200 bg-white text-slate-600'
            }`}
            title="是否随新日志自动滚屏"
          >
            <ArrowDown className={`h-2.5 w-2.5 ${autoScroll ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>自动滚屏 {autoScroll ? '开' : '关'}</span>
          </button>
        </div>
      </div>

      {/* Internal Scrollable Logs Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-2 font-mono text-[11.5px] leading-relaxed bg-[#F8FAFC]"
      >
        {logs.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center p-6 text-slate-400 font-sans">
            <Terminal className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">等待事实穿透检测启动</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
              点击「开始检查」，底层与元宝搜索、大模型的每一次具体网络请求与毫秒响应将在此实时展现。
            </p>
          </div>
        ) : (
          logs.map((log) => {
            // Check for Thinking Log Item
            if (log.isThinking || log.type === 'thinking') {
              const isExpanded = expandedThinkingIds.has(log.id);

              if (!isExpanded) {
                return (
                  <div 
                    key={log.id} 
                    onClick={() => toggleThinking(log.id)}
                    className="group flex items-center gap-2.5 rounded-lg border border-purple-200/90 bg-gradient-to-r from-purple-50/70 via-purple-50/30 to-white px-3 py-1.5 text-slate-700 shadow-2xs transition hover:border-purple-300 hover:bg-purple-50/90 cursor-pointer overflow-hidden"
                    title="点击展开完整思考过程 (Chain of Thought)"
                  >
                    {/* Timestamp */}
                    <span className="text-[10px] text-slate-400 font-mono select-none flex-shrink-0">
                      {log.time}
                    </span>

                    {/* Thinking Badge */}
                    {log.isThinkingActive ? (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-300 flex-shrink-0 flex items-center gap-1 animate-pulse">
                        <Brain className="h-2.5 w-2.5 text-purple-600 animate-spin" />
                        深度思考中
                      </span>
                    ) : (
                      <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 flex-shrink-0 flex items-center gap-1">
                        <Brain className="h-2.5 w-2.5 text-purple-600" />
                        深度思考
                      </span>
                    )}

                    {/* Single-line message: strictly 1 line truncated, displaying trailing latest thought */}
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs font-mono text-purple-950/80">
                      <span className="truncate">
                        {log.message || '正在组织深度思维链...'}
                      </span>
                      {log.isThinkingActive && (
                        <span className="inline-block w-1.5 h-3 bg-purple-500 animate-pulse flex-shrink-0" />
                      )}
                    </div>

                    {/* Expand Trigger Button */}
                    <div className="flex items-center gap-1 flex-shrink-0 pl-1 text-[10.5px] font-medium text-purple-600 group-hover:text-purple-800 select-none">
                      {log.fullReasoning && (
                        <span className="font-mono text-[9.5px] text-purple-400">
                          {log.fullReasoning.length}字
                        </span>
                      )}
                      <span className="hidden sm:inline">展开</span>
                      <ChevronDown className="h-3 w-3 transition-transform group-hover:translate-y-0.5" />
                    </div>
                  </div>
                );
              }

              // Expanded state
              return (
                <div 
                  key={log.id} 
                  className="flex flex-col rounded-lg border border-purple-300 bg-purple-50/25 p-2.5 text-slate-700 shadow-2xs transition"
                >
                  {/* Header: Click to collapse */}
                  <div 
                    onClick={() => toggleThinking(log.id)}
                    className="flex items-center justify-between gap-2 cursor-pointer pb-2 border-b border-purple-200/60 select-none"
                    title="点击收起思考过程"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {log.time}
                      </span>
                      {log.isThinkingActive ? (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-300 flex items-center gap-1 animate-pulse flex-shrink-0">
                          <Brain className="h-2.5 w-2.5 text-purple-600 animate-spin" />
                          流式思考中...
                        </span>
                      ) : (
                        <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 flex items-center gap-1 flex-shrink-0">
                          <Brain className="h-2.5 w-2.5 text-purple-600" />
                          SenseNova 深度思维链
                        </span>
                      )}
                      <span className="text-[10.5px] font-mono text-purple-600 truncate hidden sm:inline">
                        共 {log.fullReasoning?.length || 0} 字符 {log.isThinkingActive ? '(流式推理中)' : ''}
                      </span>
                    </div>

                    <button 
                      type="button"
                      className="flex items-center gap-0.5 text-[10.5px] font-medium text-purple-700 hover:text-purple-900 bg-purple-100/70 hover:bg-purple-100 px-2 py-0.5 rounded transition flex-shrink-0"
                    >
                      <span>收起</span>
                      <ChevronUp className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Expanded Content Box */}
                  <div className="mt-2 max-h-72 overflow-y-auto rounded-md bg-white/95 border border-purple-100/80 p-3 font-mono text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap select-text selection:bg-purple-100">
                    {log.fullReasoning || log.message}
                    {log.isThinkingActive && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-purple-600 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              );
            }

            const isTimeout = log.errorKind === 'timeout' || log.message.includes('超时');
            const isAuth = log.errorKind === 'auth' || log.message.includes('鉴权');
            const isRateLimit = log.errorKind === 'rate_limit' || log.message.includes('频控');
            const isDegraded = log.errorKind === 'degraded' || log.message.includes('降级');
            const isRetry = log.message.includes('重试') || isTimeout;

            let rowStyle = 'border-slate-200/60 bg-white hover:border-slate-300';
            if (isAuth) {
              rowStyle = 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-200';
            } else if (isTimeout) {
              rowStyle = 'border-amber-300 bg-amber-50/50 ring-1 ring-amber-200';
            } else if (isRateLimit) {
              rowStyle = 'border-purple-300 bg-purple-50/40 ring-1 ring-purple-200';
            } else if (isDegraded) {
              rowStyle = 'border-indigo-200 bg-indigo-50/30 ring-1 ring-indigo-100';
            } else if (isRetry) {
              rowStyle = 'border-amber-300 bg-amber-50/30 ring-1 ring-amber-200';
            }

            return (
              <div 
                key={log.id} 
                className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-slate-700 shadow-2xs transition ${rowStyle}`}
              >
                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 font-mono select-none flex-shrink-0 pt-0.5">
                  {log.time}
                </span>

                {/* Tag */}
                {getTagBadge(log)}

                {/* Message */}
                <span className="flex-1 break-words text-slate-800 font-sans text-xs leading-snug">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-200/80 bg-white px-4 py-2 text-[10.5px] text-slate-400 font-mono flex items-center justify-between flex-shrink-0">
        <span>腾讯云元宝搜索 WSA · 毫秒级千亿索引</span>
        <span>SenseNova 交叉比对引擎</span>
      </div>
    </div>
  );
};
