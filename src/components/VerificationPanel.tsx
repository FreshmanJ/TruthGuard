import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, HelpCircle, 
  ExternalLink, ChevronDown, ChevronUp, Copy, Check, 
  Globe2, ShieldAlert, BookOpen, Search, ArrowUpRight,
  Gavel, Award, BarChart3, Wand2, BookMarked, ShieldCheck,
  CheckCircle, Sparkles, X, Layers, Filter
} from 'lucide-react';
import { Claim, ClaimStatus, VerificationSummary, WorkflowState } from '../types';

interface VerificationPanelProps {
  claims: Claim[];
  summary: VerificationSummary | null;
  onApplySingleCorrection: (claim: Claim) => void;
  isLoading: boolean;
  workflowState: WorkflowState;
  onOpenCertificate: () => void;
  onOpenBenchmark: () => void;
  onInjectCitations: () => void;
  onApplyAllCorrections: () => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  claims,
  summary,
  onApplySingleCorrection,
  isLoading,
  workflowState,
  onOpenCertificate,
  onOpenBenchmark,
  onInjectCitations,
  onApplyAllCorrections,
}) => {
  const [filter, setFilter] = useState<'all' | ClaimStatus>('all');
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedSourcesClaim, setSelectedSourcesClaim] = useState<Claim | null>(null);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSourcesClaim) {
        setSelectedSourcesClaim(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSourcesClaim]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredClaims = claims.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleCopyCitation = (claim: Claim) => {
    if (!claim.citationFootnote && (!claim.sources || claim.sources.length === 0)) return;
    const citation = claim.citationFootnote || `[${claim.sources[0]?.site}] ${claim.sources[0]?.title} ${claim.sources[0]?.url}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(claim.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      numeric: '数据统计',
      version: '版本特性',
      temporal: '时间时效',
      policy: '政策法规',
      scientific: '科学原理',
      entity: '机构动作',
      general: '客观事实',
    };
    return map[cat] || '客观事实';
  };

  const refutedCount = claims.filter(c => c.status === 'refuted' || c.status === 'disputed').length;
  const verifiedCount = claims.filter(c => c.status === 'verified').length;

  return (
    <section className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden font-sans">
      {/* 4. Complete Report Top Header */}
      <div className="border-b border-slate-100 bg-[#FAFAFA] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <ShieldCheck className="h-4.5 w-4.5 text-yuanbao-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                4. 完整事实穿透审计与仲裁总览报告
              </h3>
              <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600 border border-slate-200/60 font-mono">
                Veritas Fact-Check Report
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              基于腾讯云元宝搜索毫秒级千亿信源与 SenseNova 交叉比对引擎自动生成
            </p>
          </div>
        </div>

        {/* Action Suite (Cert, Benchmark, Quick Fix) */}
        {summary && (
          <div className="flex items-center gap-2">
            {verifiedCount > 0 && (
              <button
                onClick={onInjectCitations}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                title="自动将元宝搜索权威信源以学术脚注形式注入原文末尾"
              >
                <BookMarked className="h-3.5 w-3.5 text-emerald-600" />
                <span>一键注入引用</span>
              </button>
            )}

            {/* 一键修正全部幻觉 (暂先隐藏) */}
            {/* {refutedCount > 0 && (
              <button
                onClick={onApplyAllCorrections}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition shadow-2xs"
                title="一键将原文中的事实错误替换为权威信源修正内容"
              >
                <Wand2 className="h-3.5 w-3.5 text-rose-600" />
                <span>一键修正全部幻觉 ({refutedCount})</span>
              </button>
            )} */}

            <button
              onClick={onOpenCertificate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:from-amber-100 hover:to-orange-100 transition"
            >
              <Award className="h-3.5 w-3.5 text-amber-600" />
              <span>导出审计背书证书</span>
            </button>

            <button
              onClick={onOpenBenchmark}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">能效评测</span>
            </button>
          </div>
        )}
      </div>

      {/* Report Content Body */}
      {summary ? (
        <div className="p-5 sm:p-6 space-y-6">
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Health Score */}
            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-500">事实综合健康度</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono tracking-tight ${
                  summary.healthScore >= 80 ? 'text-emerald-600' : summary.healthScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {summary.healthScore}%
                </span>
                <span className={`text-[11px] font-bold ${
                  summary.healthScore >= 80 ? 'text-emerald-700' : summary.healthScore >= 60 ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {summary.healthScore >= 80 ? '可信度极高' : summary.healthScore >= 60 ? '存在时效存疑' : '存在严重幻觉'}
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    summary.healthScore >= 80 ? 'bg-emerald-500' : summary.healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${summary.healthScore}%` }}
                />
              </div>
            </div>

            {/* Card 2: Verified */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-emerald-800">权威证实通过</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-emerald-700 tracking-tight">
                  {summary.verified}
                </span>
                <span className="text-xs text-emerald-600 font-medium">/ {summary.totalClaims} 项</span>
              </div>
              <span className="mt-2 text-[10.5px] text-emerald-600 font-mono">
                由元宝搜索权威多源交叉印证
              </span>
            </div>

            {/* Card 3: Refuted */}
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-rose-800">事实错误 / 幻觉拦截</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-rose-700 tracking-tight">
                  {summary.refuted}
                </span>
                <span className="text-xs text-rose-600 font-medium">项已辟谣</span>
              </div>
              <span className="mt-2 text-[10.5px] text-rose-600 font-mono">
                已生成官方权威修正事实
              </span>
            </div>

            {/* Card 4: Disputed */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-amber-800">存疑 / 时效差异</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-amber-700 tracking-tight">
                  {summary.disputed}
                </span>
                <span className="text-xs text-amber-600 font-medium">项需核对</span>
              </div>
              <span className="mt-2 text-[10.5px] text-amber-600 font-mono">
                各权威媒体报道口径存在出入
              </span>
            </div>
          </div>

          {/* Source Inspection & Multimodal Extraction Banner */}
          {(workflowState.inspectionTask || workflowState.extractionTask) && (
            <div className="rounded-xl border border-sky-200/70 bg-gradient-to-r from-sky-50/60 via-teal-50/40 to-slate-50/60 p-3 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800">
                  来源多模态审计：
                </span>
                <span className="text-xs text-slate-700 font-semibold truncate max-w-xs">
                  {workflowState.sourceNameOrUrl || '原稿来源'}
                </span>
                {workflowState.inspectionTask?.format && (
                  <span className="rounded bg-sky-100/90 px-1.5 py-0.5 text-[10.5px] font-mono font-bold text-sky-800">
                    {workflowState.inspectionTask.format}
                  </span>
                )}
                {workflowState.inspectionTask?.fileSizeFormatted && (
                  <span className="text-[10.5px] font-mono text-slate-500">
                    {workflowState.inspectionTask.fileSizeFormatted}
                  </span>
                )}
                {workflowState.inspectionTask?.securitySummary && (
                  <span className="text-[10.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-sans">
                    {workflowState.inspectionTask.securitySummary}
                  </span>
                )}
              </div>

              {workflowState.extractionTask?.images && workflowState.extractionTask.images.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>已捕获 {workflowState.extractionTask.images.length} 张技术图表/内嵌插图</span>
                </div>
              )}
            </div>
          )}

          {/* Filter Pills Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 p-1 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-3 py-1 text-center text-[11px] font-medium transition ${
                  filter === 'all' 
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部命题 ({summary.totalClaims})
              </button>

              <button
                onClick={() => setFilter('verified')}
                className={`rounded-lg px-3 py-1 text-center text-[11px] font-medium transition flex items-center gap-1.5 ${
                  filter === 'verified' 
                    ? 'bg-white text-emerald-700 shadow-2xs font-semibold' 
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                权威证实 ({summary.verified})
              </button>

              <button
                onClick={() => setFilter('refuted')}
                className={`rounded-lg px-3 py-1 text-center text-[11px] font-medium transition flex items-center gap-1.5 ${
                  filter === 'refuted' 
                    ? 'bg-white text-rose-700 shadow-2xs font-semibold' 
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                事实错误 ({summary.refuted})
              </button>

              <button
                onClick={() => setFilter('disputed')}
                className={`rounded-lg px-3 py-1 text-center text-[11px] font-medium transition flex items-center gap-1.5 ${
                  filter === 'disputed' 
                    ? 'bg-white text-amber-700 shadow-2xs font-semibold' 
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                存疑时效 ({summary.disputed})
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              共筛选展示 {filteredClaims.length} 项审校档案
            </span>
          </div>

          {/* Claim Verdict Cards List */}
          <div className="space-y-3.5">
            {filteredClaims.map((claim, idx) => {
              const isExpanded = expandedClaimId === claim.id || (expandedClaimId === null && idx === 0);
              const isVerified = claim.status === 'verified';
              const isDisputed = claim.status === 'disputed';
              const isRefuted = claim.status === 'refuted';

              return (
                <div
                  key={claim.id}
                  className={`group relative rounded-xl border transition-all duration-200 bg-white overflow-hidden shadow-2xs hover:shadow-subtle ${
                    isVerified 
                      ? 'border-emerald-200/80 hover:border-emerald-300' 
                      : isDisputed 
                      ? 'border-amber-200/80 hover:border-amber-300' 
                      : isRefuted 
                      ? 'border-rose-200/80 hover:border-rose-300' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Left Color Accent Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isVerified ? 'bg-emerald-500' : isDisputed ? 'bg-amber-500' : isRefuted ? 'bg-rose-500' : 'bg-slate-300'
                  }`} />

                  {/* Card Header (Click to Expand) */}
                  <div
                    onClick={() => setExpandedClaimId(isExpanded ? '' : claim.id)}
                    className="flex items-start justify-between p-4 pl-5 cursor-pointer select-none"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Status Pill */}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isDisputed
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isRefuted
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isVerified ? 'bg-emerald-500' : isDisputed ? 'bg-amber-500' : isRefuted ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          {isVerified ? '🟢 权威证实' : isDisputed ? '🟡 存疑 / 时效差异' : isRefuted ? '🔴 事实错误 / 幻觉' : '缺乏信源'}
                        </span>

                        {/* Category */}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {getCategoryName(claim.category)}
                        </span>

                        {/* Causal Tag */}
                        {claim.isCausalClaim && (
                          <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                            🔗 因果逻辑链
                          </span>
                        )}

                        {/* Multi-probe Tag */}
                        {claim.searchKeywords && claim.searchKeywords.length > 1 && (
                          <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700 border border-cyan-200">
                            🔍 {claim.searchKeywords.length}路检索探针
                          </span>
                        )}

                        {/* Confidence */}
                        <span className="text-[11px] font-mono text-slate-400 ml-auto">
                          元宝置信度: <strong className="text-slate-700">{claim.confidence}%</strong>
                        </span>
                      </div>

                      {/* Quoted Statement */}
                      <h4 className="text-[13.5px] font-medium text-slate-900 leading-snug">
                        “{claim.claimText}”
                      </h4>
                    </div>

                    <div className="text-slate-400 group-hover:text-slate-600 transition p-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Card Detail Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 pl-5 space-y-3.5 bg-slate-50/40 text-xs">
                      {/* Context & Causal Box */}
                      {(claim.contextSnippet || claim.causalPremise) && (
                        <div className="rounded-xl bg-purple-50/60 p-3 border border-purple-200/80 text-xs">
                          {claim.causalPremise && (
                            <div className="mb-1 flex items-start gap-1.5 text-purple-950">
                              <span className="font-bold flex-shrink-0 text-purple-800">🔗 因果归因逻辑:</span>
                              <span className="font-medium">{claim.causalPremise}</span>
                            </div>
                          )}
                          {claim.contextSnippet && (
                            <div className="flex items-start gap-1.5 text-slate-600">
                              <span className="font-semibold flex-shrink-0 text-slate-500">📖 原文语境切片:</span>
                              <span className="italic">“...{claim.contextSnippet}...”</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Probe Queries Box */}
                      {claim.searchKeywords && claim.searchKeywords.length > 1 ? (
                        <div className="rounded-xl bg-cyan-50/70 p-3 border border-cyan-200/80 text-xs">
                          <div className="flex items-center gap-1.5 text-cyan-950 font-semibold mb-1.5">
                            <Search className="h-3.5 w-3.5 text-cyan-700" />
                            <span>AI 判定复合事实 · 自适应推进 {claim.searchKeywords.length} 组检索探针:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {claim.searchKeywords.map((kw, kwIdx) => (
                              <span 
                                key={kwIdx}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-[11px] font-mono font-semibold text-cyan-900 border border-cyan-200 shadow-2xs"
                              >
                                <span className="text-[9.5px] text-cyan-600 font-bold bg-cyan-100/70 px-1 rounded">探针 {kwIdx + 1}</span>
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : claim.searchKeyword ? (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200/60">
                          <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-400">AI 检索探针词:</span>
                          <span className="text-slate-800 font-semibold">{claim.searchKeyword}</span>
                        </div>
                      ) : null}

                      {/* Reasoning Box */}
                      <div className="rounded-xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1.5">
                          <Gavel className="h-3.5 w-3.5 text-slate-500" />
                          <span>智能体交叉仲裁理由（含因果有效性检验）</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-sans text-[12px]">
                          {claim.reasoning}
                        </p>
                      </div>

                      {/* Official Correction Box */}
                      {claim.correction && (
                        <div className="rounded-xl bg-rose-50/80 p-3.5 border border-rose-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                              <ShieldAlert className="h-4 w-4 text-rose-600" />
                              官方权威辟谣 / 修正事实建议:
                            </span>
                            {/* 一键替换原文 (暂先隐藏) */}
                            {/* <button
                              onClick={() => onApplySingleCorrection(claim)}
                              className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-700 transition shadow-xs active:scale-[0.98]"
                            >
                              一键替换原文
                            </button> */}
                          </div>
                          <p className="text-rose-950 font-medium leading-relaxed text-[12px]">
                            {claim.correction}
                          </p>
                        </div>
                      )}

                      {/* Yuanbao Search Retrieved Sources */}
                      <div>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                            <Globe2 className="h-3.5 w-3.5 text-yuanbao-600" />
                            元宝搜索权威召回信源证据 ({claim.sources.length} 篇)
                          </span>

                          <div className="flex items-center gap-2">
                            {claim.sources.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSourcesClaim(claim);
                                  setSelectedSiteFilter('all');
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-yuanbao-50 hover:bg-yuanbao-100/80 px-2 py-0.5 text-[11px] font-semibold text-yuanbao-800 border border-yuanbao-200 transition active:scale-[0.98] cursor-pointer"
                                title="点击弹窗查看所有来源网站与证据"
                              >
                                <ExternalLink className="h-3 w-3 text-yuanbao-600" />
                                <span>窗口查看全部 ({claim.sources.length})</span>
                              </button>
                            )}

                            {claim.citationFootnote && (
                              <button
                                onClick={() => handleCopyCitation(claim)}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
                                title="复制规范学术文献引用格式"
                              >
                                {copiedId === claim.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    <span className="text-emerald-700">已复制引用</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>复制引用</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Source Cards Preview (Top 3) */}
                        <div className="space-y-2">
                          {claim.sources.slice(0, 3).map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="rounded-xl border border-slate-200/80 bg-white p-3 transition hover:border-slate-300 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {src.favicon ? (
                                    <img src={src.favicon} alt="" className="h-3.5 w-3.5 rounded flex-shrink-0" />
                                  ) : (
                                    <div className="h-3.5 w-3.5 rounded bg-yuanbao-100 text-yuanbao-700 text-[9px] flex items-center justify-center font-bold">
                                      源
                                    </div>
                                  )}
                                  <span className="font-semibold text-slate-900 truncate text-[12px]">
                                    {src.site}
                                  </span>
                                  {src.date && (
                                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                                      {src.date.split(' ')[0]}
                                    </span>
                                  )}
                                </div>

                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-yuanbao-700 transition flex-shrink-0 font-medium"
                                  >
                                    原文直达 <ArrowUpRight className="h-3 w-3" />
                                  </a>
                                )}
                              </div>

                              <p className="text-[11.5px] text-slate-600 leading-relaxed line-clamp-3 font-sans">
                                {src.passage}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* More Sources Action Button */}
                        {claim.sources.length > 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSourcesClaim(claim);
                              setSelectedSiteFilter('all');
                            }}
                            className="w-full mt-2.5 flex items-center justify-center gap-2 rounded-xl border border-yuanbao-200/90 bg-gradient-to-r from-yuanbao-50/60 via-white to-yuanbao-50/60 hover:from-yuanbao-100/70 hover:to-yuanbao-100/70 p-2.5 text-xs font-semibold text-yuanbao-900 transition shadow-2xs hover:shadow-xs group cursor-pointer active:scale-[0.99]"
                          >
                            <Layers className="h-3.5 w-3.5 text-yuanbao-600 group-hover:scale-110 transition-transform" />
                            <span>查看更多信源 · 弹窗查看全部 {claim.sources.length} 篇权威来源网站与完整段落</span>
                            <span className="rounded-full bg-yuanbao-200/80 px-2 py-0.5 text-[10.5px] font-mono text-yuanbao-900 font-bold">
                              还有 {claim.sources.length - 3} 篇 ▾
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center p-12 text-slate-400">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 border border-slate-200/60">
            <Search className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">等待全网事实穿透完成</p>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm leading-relaxed">
            点击「开始检查」，检测完成后页面将自动平滑滚动至此处，并展开完整事实健康度画像、辟谣仲裁档案与学术引用。
          </p>
        </div>
      )}

      {/* ================= ALL SOURCES POPUP MODAL ================= */}
      {selectedSourcesClaim && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedSourcesClaim(null)}
        >
          <div 
            className="flex flex-col w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#FAFAFA] px-5 py-3.5 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yuanbao-100 text-yuanbao-700 shadow-2xs flex-shrink-0">
                  <Globe2 className="h-4.5 w-4.5 text-yuanbao-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      元宝搜索全量信源证据档案
                    </h3>
                    <span className="rounded-full bg-yuanbao-100 px-2 py-0.5 text-[10.5px] font-bold text-yuanbao-800 font-mono">
                      共 {selectedSourcesClaim.sources.length} 篇权威信源
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    腾讯云元宝搜索 WSA · 千亿级高公信力信源穿透检索
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSourcesClaim(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex-shrink-0 cursor-pointer"
                title="关闭窗口 (Esc)"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Claim Summary Box & Site Filter Chips */}
            <div className="border-b border-slate-100 bg-slate-50/60 p-4 space-y-2.5 flex-shrink-0">
              {/* Claim Context */}
              <div className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5 flex-wrap gap-1.5">
                  <span>核验命题断言</span>
                  {selectedSourcesClaim.searchKeywords && selectedSourcesClaim.searchKeywords.length > 1 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-cyan-800 font-mono text-[10.5px] font-bold">AI {selectedSourcesClaim.searchKeywords.length}路探针:</span>
                      {selectedSourcesClaim.searchKeywords.map((kw, i) => (
                        <span key={i} className="rounded bg-cyan-50 px-1.5 py-0.2 font-mono text-[10px] text-cyan-900 border border-cyan-200 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono text-yuanbao-700">
                      搜索探针: “{selectedSourcesClaim.searchKeyword}”
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed font-sans">
                  {selectedSourcesClaim.claimText}
                </p>
              </div>

              {/* Distinct Sites Filter Pills */}
              {(() => {
                const uniqueSites = Array.from(new Set(selectedSourcesClaim.sources.map(s => s.site))).filter(Boolean);
                if (uniqueSites.length <= 1) return null;

                return (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                    <span className="text-[11px] text-slate-400 font-medium flex-shrink-0 flex items-center gap-1">
                      <Filter className="h-3 w-3" />
                      站点筛选:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSiteFilter('all')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition flex-shrink-0 cursor-pointer ${
                        selectedSiteFilter === 'all'
                          ? 'bg-yuanbao-700 text-white font-semibold shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      全部站点 ({selectedSourcesClaim.sources.length})
                    </button>
                    {uniqueSites.map(site => {
                      const count = selectedSourcesClaim.sources.filter(s => s.site === site).length;
                      return (
                        <button
                          key={site}
                          type="button"
                          onClick={() => setSelectedSiteFilter(site)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition flex-shrink-0 cursor-pointer ${
                            selectedSiteFilter === site
                              ? 'bg-yuanbao-700 text-white font-semibold shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {site} ({count})
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Scrollable Sources List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
              {(() => {
                const displayedSources = selectedSourcesClaim.sources.filter(s => {
                  if (selectedSiteFilter === 'all') return true;
                  return s.site === selectedSiteFilter;
                });

                if (displayedSources.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      该站点暂无筛选结果
                    </div>
                  );
                }

                return displayedSources.map((src, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200/80 bg-white p-3.5 transition hover:border-slate-300 shadow-2xs space-y-2"
                  >
                    {/* Source Top: Number, Site, Date, Actions */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-600 flex-shrink-0">
                          #{idx + 1}
                        </span>

                        {src.favicon ? (
                          <img src={src.favicon} alt="" className="h-4 w-4 rounded flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded bg-yuanbao-100 text-yuanbao-700 text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                            源
                          </div>
                        )}

                        <span className="font-bold text-slate-900 text-xs truncate">
                          {src.site}
                        </span>

                        {src.date && (
                          <span className="text-[10.5px] text-slate-400 font-mono flex-shrink-0">
                            {src.date.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {src.url && (
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(src.url)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-50 hover:bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600 transition cursor-pointer"
                            title="复制来源网页链接"
                          >
                            {copiedUrl === src.url ? (
                              <>
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                                <span className="text-emerald-700">已复制链接</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-2.5 w-2.5" />
                                <span>复制链接</span>
                              </>
                            )}
                          </button>
                        )}

                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-yuanbao-50 hover:bg-yuanbao-100 px-2.5 py-0.5 text-[10.5px] font-bold text-yuanbao-800 transition shadow-2xs hover:shadow-xs active:scale-[0.98]"
                          >
                            <span>原文直达</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Source Title */}
                    {src.title && (
                      <h4 className="text-xs font-semibold text-slate-800 font-sans">
                        {src.title}
                      </h4>
                    )}

                    {/* Passage Quote */}
                    <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100 font-sans text-xs text-slate-600 leading-relaxed">
                      {src.passage}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-white px-5 py-3 flex items-center justify-between flex-shrink-0 text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                腾讯云元宝搜索 WSA · 千亿知识图谱
              </span>
              <button
                type="button"
                onClick={() => setSelectedSourcesClaim(null)}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs active:scale-[0.98] cursor-pointer"
              >
                完成浏览
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
