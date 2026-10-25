import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, CheckCircle2, Clock, Globe2, 
  Gavel, Layers, Terminal, ChevronRight, AlertTriangle, 
  XCircle, Sparkles, Search, ArrowUpRight
} from 'lucide-react';
import { WorkflowState, WorkflowStage, ClaimStatus } from '../types';

interface WorkflowMonitorProps {
  workflowState: WorkflowState;
  onPause: () => void;
  onResume: () => void;
  onAbort: () => void;
  isRunning: boolean;
}

export const WorkflowMonitor: React.FC<WorkflowMonitorProps> = ({
  workflowState,
  onPause,
  onResume,
  onAbort,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'logs'>('graph');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [workflowState.logs, activeTab]);

  const { stage, isPaused, searchTasks, arbitrationTasks, extractedClaims, logs, elapsedMs, currentStepIndex } = workflowState;

  const seconds = (elapsedMs / 1000).toFixed(1);

  const getStageBadge = (st: WorkflowStage) => {
    if (isPaused) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
          <Pause className="h-3 w-3 text-amber-600 fill-amber-600" />
          工作流已暂停
        </span>
      );
    }
    switch (st) {
      case 'extracting':
      case 'searching':
      case 'verifying':
      case 'synthesizing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            正在执行实时穿透...
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            审校流程已完成
          </span>
        );
      case 'aborted':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            <Square className="h-3 w-3 text-slate-500 fill-slate-500" />
            检测已终止
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            就绪
          </span>
        );
    }
  };

  const isDocOrUrl = workflowState.inputType === 'document' || workflowState.inputType === 'url';
  const steps = isDocOrUrl ? [
    { name: '来源可用性预检', desc: '魔数/协议特征检查' },
    { name: '多模态图文提取', desc: '长文与内嵌图表抽取' },
    { name: '命题智能抽取', desc: '提取客观可证伪事实' },
    { name: '元宝搜索穿透', desc: '千亿索引并发检索' },
    { name: '多源证据仲裁', desc: '事实交叉比对裁决' },
    { name: '健康度与报告', desc: '生成引注与背书' }
  ] : [
    { name: '命题智能抽取', desc: '提取客观可证伪事实' },
    { name: '元宝搜索穿透', desc: '千亿索引并发检索' },
    { name: '多源证据仲裁', desc: '事实交叉比对裁决' },
    { name: '健康度与报告', desc: '生成引注与背书' }
  ];

  return (
    <div className="flex h-full flex-col bg-white rounded-2xl overflow-hidden font-sans">
      {/* Workflow Control Bar */}
      <div className="border-b border-slate-100 bg-[#FAFAFA] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {getStageBadge(stage)}
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {seconds}s
          </span>
        </div>

        {/* Live Controls: Pause / Resume / Stop */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <>
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs active:scale-[0.98]"
                  title="恢复继续执行检测"
                >
                  <Play className="h-3 w-3 fill-emerald-700 text-emerald-700" />
                  <span>继续执行</span>
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition shadow-2xs active:scale-[0.98]"
                  title="暂停当前检测流程"
                >
                  <Pause className="h-3 w-3 fill-amber-700 text-amber-700" />
                  <span>暂停检测</span>
                </button>
              )}

              <button
                onClick={onAbort}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition shadow-2xs active:scale-[0.98]"
                title="终止后续流程并保留当前结果"
              >
                <Square className="h-3 w-3 fill-slate-400 text-slate-400" />
                <span>终止</span>
              </button>
            </>
          )}

          {/* View Tab Switcher: Graph vs Terminal Logs */}
          <div className="flex items-center rounded-lg bg-slate-200/50 p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('graph')}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                activeTab === 'graph' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              工作流图谱
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`rounded-md px-2.5 py-1 font-medium transition flex items-center gap-1 ${
                activeTab === 'logs' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="h-3 w-3" />
              实时日志 ({logs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Visual Stepper Nodes Bar */}
      <div className="border-b border-slate-100 bg-white px-5 py-3">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((st, idx) => {
            const isPassed = currentStepIndex > idx || stage === 'completed';
            const isCurrent = currentStepIndex === idx && stage !== 'completed' && stage !== 'aborted';

            return (
              <div key={idx} className="relative flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isPassed 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent 
                      ? 'bg-slate-900 text-white ring-2 ring-emerald-400/50' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[11.5px] font-semibold truncate ${
                    isCurrent ? 'text-slate-900 font-bold' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {st.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate hidden sm:block">
                  {st.desc}
                </span>

                {/* Connecting bar */}
                {idx < 3 && (
                  <div className={`hidden sm:block absolute right-0 top-2.5 h-0.5 w-6 -mr-4 ${
                    isPassed ? 'bg-emerald-400' : 'bg-slate-100'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workflow View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === 'graph' ? (
          <div className="space-y-4">
            {/* Stage 1: Extracted Claims Section */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                  阶段一 · 命题抽取 ({extractedClaims.length} 项)
                </span>
                {extractedClaims.length > 0 && (
                  <span className="text-[10px] text-emerald-600 font-semibold">提取完毕 ✓</span>
                )}
              </div>

              {extractedClaims.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">正在大模型语义分析中...</p>
              ) : (
                <div className="space-y-1.5">
                  {extractedClaims.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-white p-2.5 border border-slate-200/60 shadow-2xs text-xs">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 flex-shrink-0">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">“{c.claimText}”</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {c.searchKeywords && c.searchKeywords.length > 1 ? (
                            <>
                              AI 自适应推进 <strong className="text-cyan-700">{c.searchKeywords.length}</strong> 路探针: <strong className="text-slate-600">{c.searchKeywords.join(' | ')}</strong>
                            </>
                          ) : (
                            <>
                              元宝优化检索词: <strong className="text-slate-600">{c.searchKeyword}</strong>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stage 2: Yuanbao Search Tasks Grid */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-yuanbao-600" />
                  阶段二 · 腾讯元宝搜索并发检索 (WSA API)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {searchTasks.filter(t => t.status === 'done').length}/{searchTasks.length} 完成
                </span>
              </div>

              {searchTasks.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">等待命题就绪后启动检索...</p>
              ) : (
                <div className="space-y-2">
                  {searchTasks.map((t, idx) => {
                    const isDone = t.status === 'done';
                    const isSearching = t.status === 'searching';

                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3 bg-white transition shadow-2xs ${
                          isDone 
                            ? 'border-emerald-200' 
                            : isSearching 
                            ? 'border-yuanbao-300 ring-2 ring-yuanbao-100' 
                            : 'border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <Search className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 truncate font-mono">
                              {t.query}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isSearching && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-yuanbao-700 animate-pulse">
                                检索中...
                              </span>
                            )}
                            {isDone && (
                              <div className="flex items-center gap-1.5">
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
                                  {t.sourcesCount} 篇信源
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {t.latencyMs}ms
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recalled Top Sites */}
                        {isDone && t.topSites.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px]">
                            <span className="text-slate-400">权威信源:</span>
                            {t.topSites.map((site, sI) => (
                              <span key={sI} className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-medium">
                                {site}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stage 3: Real-time Arbitration Feed */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Gavel className="h-3.5 w-3.5 text-slate-600" />
                  阶段三 · 证据链交叉裁决
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {arbitrationTasks.filter(t => t.status === 'done').length}/{arbitrationTasks.length} 判定
                </span>
              </div>

              {arbitrationTasks.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">等待检索证据注入后启动仲裁...</p>
              ) : (
                <div className="space-y-2">
                  {arbitrationTasks.map((at, aIdx) => {
                    const isDone = at.status === 'done';
                    const isVerifying = at.status === 'verifying';

                    return (
                      <div
                        key={aIdx}
                        className={`rounded-xl border p-3 bg-white transition shadow-2xs ${
                          isDone && at.verdict === 'verified'
                            ? 'border-emerald-200'
                            : isDone && at.verdict === 'refuted'
                            ? 'border-rose-200'
                            : isDone && at.verdict === 'disputed'
                            ? 'border-amber-200'
                            : isVerifying
                            ? 'border-slate-300 ring-2 ring-slate-100'
                            : 'border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <p className="font-medium text-slate-800 truncate text-[12px] flex-1">
                            “{at.claimText}”
                          </p>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isVerifying && (
                              <span className="text-[11px] text-slate-500 font-medium animate-pulse">
                                证据比对中...
                              </span>
                            )}
                            {isDone && (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                at.verdict === 'verified'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : at.verdict === 'refuted'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : at.verdict === 'disputed'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}>
                                {at.verdict === 'verified' && '🟢 权威证实'}
                                {at.verdict === 'refuted' && '🔴 事实错误'}
                                {at.verdict === 'disputed' && '🟡 存疑时效'}
                                {at.verdict === 'unverifiable' && '⚪ 缺乏信源'}
                                {at.confidence && ` (${at.confidence}%)`}
                              </span>
                            )}
                          </div>
                        </div>

                        {isDone && at.reasoning && (
                          <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {at.reasoning}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Live Terminal Log Stream */
          <div className="h-full rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 overflow-y-auto leading-relaxed shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-500">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-yuanbao-400" />
                TruthGuard Live Stream Console
              </span>
              <span>{logs.length} 条事件记录</span>
            </div>

            <div className="space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-500 select-none flex-shrink-0">[{log.time}]</span>
                  <span className={`flex-1 ${
                    log.type === 'success' 
                      ? 'text-emerald-400' 
                      : log.type === 'error' 
                      ? 'text-rose-400' 
                      : log.type === 'warn' 
                      ? 'text-amber-400' 
                      : log.type === 'search' 
                      ? 'text-cyan-300' 
                      : 'text-slate-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
