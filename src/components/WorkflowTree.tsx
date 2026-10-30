import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  FileText, Gavel, Award, CheckCircle2, 
  Globe2, Sparkles, AlertTriangle, 
  XCircle, GitFork, Play, Pause, Square, ShieldCheck,
  ZoomIn, ZoomOut
} from 'lucide-react';
import { WorkflowState, ExtractedMediaItem } from '../types';
import { useI18n } from '../i18n/context';

interface WorkflowTreeProps {
  workflowState: WorkflowState;
  onSelectClaim?: (claimId: string) => void;
  isLoading?: boolean;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onAbort?: () => void;
  elapsedMs?: number;
}

export const WorkflowTree: React.FC<WorkflowTreeProps> = ({
  workflowState,
  isLoading = false,
  isPaused = false,
  onPause,
  onResume,
  onAbort,
  elapsedMs = 0,
}) => {
  const { lang, t, interpolate } = useI18n();
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { 
    stage, 
    extractedClaims, 
    searchTasks, 
    arbitrationTasks,
    inputType = 'text',
    sourceNameOrUrl,
    inspectionTask,
    extractionTask
  } = workflowState;

  const isDocOrUrl = inputType === 'document' || inputType === 'url';
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<ExtractedMediaItem | null>(null);

  // Viewport Transform State (Pan & Zoom)
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 1.0,
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startTransformRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  const isIdle = stage === 'idle';
  const isInspecting = stage === 'inspecting';
  const isExtractingMedia = stage === 'extracting_media';
  const isExtracting = stage === 'extracting';
  const hasBranches = extractedClaims.length > 0;

  // Geometric specifications
  const rowGap = 14;
  const rootCardHeight = 152;

  const getProbeQueries = (c: any): string[] => {
    return (c.searchKeywords && c.searchKeywords.length > 0)
      ? c.searchKeywords
      : (c.searchKeyword ? [c.searchKeyword] : []);
  };

  const getRowHeight = (claim: any): number => {
    const probes = getProbeQueries(claim);
    if (probes.length <= 1) return 76;
    if (probes.length === 2) return 144;
    return 60 * probes.length + 12 * (probes.length - 1);
  };

  const rowHeights = extractedClaims.map(c => getRowHeight(c));
  const rowCenterYs: number[] = [];
  let currentY = 0;
  for (let i = 0; i < rowHeights.length; i++) {
    rowCenterYs.push(currentY + rowHeights[i] / 2);
    currentY += rowHeights[i] + rowGap;
  }
  const totalBranchHeight = Math.max(rootCardHeight, currentY > 0 ? currentY - rowGap : rootCardHeight);
  const centerY = totalBranchHeight / 2;

  // 1. Precise Auto-fit logic
  const autoFit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const vpWidth = viewport.clientWidth;
    const vpHeight = viewport.clientHeight;
    if (vpWidth <= 0 || vpHeight <= 0) return;

    let contentW = 280;
    if (isDocOrUrl) contentW += 640;
    if (hasBranches) contentW += 980;

    const contentH = Math.max(160, totalBranchHeight);

    const paddingX = 40;
    const paddingY = 24;

    const scaleX = (vpWidth - paddingX * 2) / contentW;
    const scaleY = (vpHeight - paddingY * 2) / contentH;
    const fitScale = Math.min(1.0, Math.max(0.2, Math.min(scaleX, scaleY)));

    const scaledW = contentW * fitScale;
    const scaledH = contentH * fitScale;

    const offsetX = Math.max(paddingX, (vpWidth - scaledW) / 2);
    const offsetY = Math.max(paddingY, (vpHeight - scaledH) / 2);

    setTransform({
      scale: fitScale,
      x: offsetX,
      y: offsetY,
    });
  }, [isDocOrUrl, hasBranches, totalBranchHeight]);

  useEffect(() => {
    const timer = setTimeout(() => {
      autoFit();
    }, 50);
    return () => clearTimeout(timer);
  }, [extractedClaims.length, isDocOrUrl, autoFit]);

  useEffect(() => {
    const handleResize = () => autoFit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoFit]);

  // 2. Mouse Wheel Zoom at Cursor
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;

      setTransform(prev => {
        const nextScale = Math.min(1.0, Math.max(0.2, prev.scale * zoomFactor));
        if (nextScale === prev.scale) return prev;

        const nextX = mouseX - (mouseX - prev.x) * (nextScale / prev.scale);
        const nextY = mouseY - (mouseY - prev.y) * (nextScale / prev.scale);

        return {
          scale: nextScale,
          x: nextX,
          y: nextY,
        };
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  // 3. Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    e.preventDefault();

    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startTransformRef.current = { x: transform.x, y: transform.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - startPosRef.current.x;
      const dy = moveEvent.clientY - startPosRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }

      setTransform(prev => ({
        ...prev,
        x: startTransformRef.current.x + dx,
        y: startTransformRef.current.y + dy,
      }));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleZoomIn = () => {
    setTransform(prev => {
      const nextScale = Math.min(1.0, prev.scale * 1.15);
      const viewport = viewportRef.current;
      if (!viewport) return { ...prev, scale: nextScale };
      const cx = viewport.clientWidth / 2;
      const cy = viewport.clientHeight / 2;
      const nextX = cx - (cx - prev.x) * (nextScale / prev.scale);
      const nextY = cy - (cy - prev.y) * (nextScale / prev.scale);
      return { scale: nextScale, x: nextX, y: nextY };
    });
  };

  const handleZoomOut = () => {
    setTransform(prev => {
      const nextScale = Math.max(0.2, prev.scale * 0.85);
      const viewport = viewportRef.current;
      if (!viewport) return { ...prev, scale: nextScale };
      const cx = viewport.clientWidth / 2;
      const cy = viewport.clientHeight / 2;
      const nextX = cx - (cx - prev.x) * (nextScale / prev.scale);
      const nextY = cy - (cy - prev.y) * (nextScale / prev.scale);
      return { scale: nextScale, x: nextX, y: nextY };
    });
  };

  const handleResetZoom100 = () => {
    setTransform(prev => {
      const viewport = viewportRef.current;
      if (!viewport) return { ...prev, scale: 1.0 };
      const cx = viewport.clientWidth / 2;
      const cy = viewport.clientHeight / 2;
      const nextX = cx - (cx - prev.x) * (1.0 / prev.scale);
      const nextY = cy - (cy - prev.y) * (1.0 / prev.scale);
      return { scale: 1.0, x: nextX, y: nextY };
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden font-sans">
      {/* Area 3: Top Control Bar */}
      <div className="border-b border-slate-100 bg-[#FAFAFA] px-3.5 py-1.5 flex items-center justify-between gap-2 flex-shrink-0 select-none overflow-x-auto">
        {/* Left: Identity */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yuanbao-50 text-yuanbao-700 shadow-2xs">
            <GitFork className="h-3.5 w-3.5 rotate-90" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight whitespace-nowrap">
              {t.tree.title}
            </h3>
          </div>
          <span className="hidden lg:inline text-[11px] text-slate-400 font-mono pl-1 whitespace-nowrap">
            • {isIdle 
                ? (isDocOrUrl ? t.tree.readyDocStatus : t.tree.readyStatus) 
                : isInspecting 
                ? t.tree.inspectingStatus 
                : isExtractingMedia
                ? t.tree.extractingMediaStatus
                : isExtracting 
                ? t.tree.extractingClaimsStatus 
                : interpolate(t.tree.branchesCount, { count: extractedClaims.length })}
          </span>
        </div>

        {/* Right: Execution Dock & Canvas Zoom Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Execution Controls if Loading */}
          {isLoading && onPause && onResume && onAbort && (
            <div className="flex items-center gap-1.5 rounded-full border border-yuanbao-200 bg-yuanbao-50/90 px-2.5 py-0.5 text-xs shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-yuanbao-500 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-yuanbao-900">
                {(elapsedMs / 1000).toFixed(1)}s
              </span>

              <div className="h-2.5 w-px bg-yuanbao-200 mx-0.5" />

              {isPaused ? (
                <button
                  onClick={onResume}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700 transition"
                  title={t.header.resumeTitle}
                >
                  <Play className="h-2.5 w-2.5 fill-white" />
                  <span>{t.header.resume}</span>
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-amber-600 transition"
                  title={t.header.pauseTitle}
                >
                  <Pause className="h-2.5 w-2.5 fill-white" />
                  <span>{t.header.pause}</span>
                </button>
              )}

              <button
                onClick={onAbort}
                className="inline-flex items-center gap-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-rose-100 hover:text-rose-700 transition"
                title={t.header.abortTitle}
              >
                <Square className="h-2 w-2 fill-slate-700" />
                <span>{t.header.abort}</span>
              </button>
            </div>
          )}

          {/* Interactive Zoom & Pan Control Suite */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-200/50 p-0.5 text-[11px] font-mono">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition cursor-pointer"
              title={t.tree.zoomOut}
            >
              <ZoomOut className="h-3 w-3" />
            </button>

            <span className="px-1.5 font-bold text-slate-700 min-w-[36px] text-center text-[10.5px]">
              {Math.round(transform.scale * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={transform.scale >= 1.0}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title={t.tree.zoomIn}
            >
              <ZoomIn className="h-3 w-3" />
            </button>

            <div className="h-3 w-px bg-slate-300 mx-0.5" />

            <button
              onClick={autoFit}
              className="px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded transition cursor-pointer"
              title={t.tree.fitView}
            >
              {t.tree.fitView}
            </button>

            <button
              onClick={handleResetZoom100}
              className="px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded transition cursor-pointer"
              title={t.tree.resetView}
            >
              100%
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-100/90 px-2 py-0.5 text-[10.5px] font-medium text-slate-600 border border-slate-200/60 shadow-2xs whitespace-nowrap flex-shrink-0">
            <span>{t.tree.panHint}</span>
          </div>
        </div>
      </div>

      {/* Infinite Canvas Viewport */}
      <div 
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        className={`relative flex-1 min-h-0 overflow-hidden select-none bg-canvas-pattern ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div 
          ref={contentRef}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
          }}
          className="absolute top-0 left-0 flex items-center transition-transform duration-75 ease-out select-none"
        >
          {/* ================= 1. EXTRA NODE: Source Pre-check (Document / URL only) ================= */}
          {isDocOrUrl && (
            <>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`relative flex flex-col justify-between w-64 h-[152px] rounded-2xl border bg-white p-3.5 shadow-sm transition-all duration-300 ${
                  isInspecting
                    ? 'border-sky-500 ring-4 ring-sky-100 shadow-md'
                    : inspectionTask?.passed
                    ? 'border-sky-200 ring-1 ring-sky-100'
                    : inspectionTask?.status === 'failed'
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-300 ring-1 ring-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 text-[10px] font-bold">
                        {inputType === 'url' ? <Globe2 className="h-3 w-3 text-sky-600" /> : <ShieldCheck className="h-3 w-3 text-sky-600" />}
                        {t.tree.node1Title}
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        isInspecting
                          ? 'bg-sky-500 animate-ping'
                          : inspectionTask?.passed
                          ? 'bg-emerald-500'
                          : inspectionTask?.status === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-slate-300'
                      }`} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {inputType === 'url' ? t.tree.node1SubtitleUrl : t.tree.node1SubtitleDoc}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 truncate leading-snug" title={sourceNameOrUrl || (lang === 'en' ? 'Source Target' : '原稿目标')}>
                      {inspectionTask?.titleOrName || sourceNameOrUrl || (inputType === 'url' ? (lang === 'en' ? 'Target URL' : '网页目标') : (lang === 'en' ? 'Source Doc' : '原稿文档'))}
                    </p>
                  </div>

                  <div>
                    {inspectionTask ? (
                      <div className="rounded-lg bg-sky-50/70 border border-sky-100 p-1.5 text-[10px] font-mono text-sky-900 leading-tight">
                        <div className="flex items-center justify-between font-bold">
                          <span className="truncate max-w-[130px]">{inspectionTask.format || (inputType === 'url' ? 'HTML5' : 'DOCX')}</span>
                          {inspectionTask.fileSizeFormatted && <span>{inspectionTask.fileSizeFormatted}</span>}
                          {inspectionTask.httpStatus && <span>HTTP {inspectionTask.httpStatus}</span>}
                        </div>
                        <p className="text-[9.5px] text-slate-500 font-sans truncate mt-0.5">
                          {inspectionTask.securitySummary || (lang === 'en' ? 'Magic-Bytes matched, sandbox passed' : 'Magic-Bytes 签名匹配，安全沙箱放行')}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-slate-50 p-1.5 text-[9.5px] text-slate-400 border border-slate-200/60 leading-tight">
                        ✦ {lang === 'en' ? 'Will verify format and network layer on start' : '启动后将检测魔数特征与协议安全'}
                      </div>
                    )}

                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{lang === 'en' ? 'Status' : '状态'}</span>
                      {isInspecting ? (
                        <span className="text-sky-700 font-bold flex items-center gap-1 animate-pulse">
                          <Sparkles className="h-3 w-3 animate-spin text-sky-600" />
                          <span>{lang === 'en' ? 'Inspecting...' : '正在预检...'}</span>
                        </span>
                      ) : inspectionTask?.passed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{lang === 'en' ? 'Verified' : '校验通过'} {inspectionTask.latencyMs ? `(${inspectionTask.latencyMs}ms)` : ''}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">{lang === 'en' ? 'Ready · Pending' : '就绪 · 待预检'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector Line 1 -> 2 */}
              <div className="flex items-center px-1 flex-shrink-0">
                <div className="relative flex items-center">
                  <div className={`h-[2px] w-8 transition-colors duration-300 ${
                    isExtractingMedia || extractionTask?.status === 'done' || hasBranches ? 'bg-emerald-400' : isInspecting ? 'bg-sky-400 animate-pulse' : 'bg-slate-200'
                  }`} />
                  <div className={`absolute left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full border-2 transition-all duration-300 ${
                    extractionTask?.status === 'done' || hasBranches
                      ? 'bg-emerald-500 border-white ring-1 ring-emerald-300'
                      : isExtractingMedia
                      ? 'bg-teal-500 border-white ring-2 ring-teal-200 animate-pulse'
                      : 'bg-white border-slate-300'
                  }`} />
                </div>
              </div>

              {/* ================= 2. EXTRA NODE: Multimodal Media Extraction (Document / URL only) ================= */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`relative flex flex-col justify-between w-64 h-[152px] rounded-2xl border bg-white p-3.5 shadow-sm transition-all duration-300 ${
                  isExtractingMedia
                    ? 'border-teal-500 ring-4 ring-teal-100 shadow-md'
                    : extractionTask?.status === 'done'
                    ? 'border-teal-200 ring-1 ring-teal-100'
                    : 'border-slate-300 ring-1 ring-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 text-[10px] font-bold">
                        <Sparkles className="h-3 w-3 text-teal-600" />
                        {t.tree.node2Title}
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        isExtractingMedia
                          ? 'bg-teal-500 animate-ping'
                          : extractionTask?.status === 'done'
                          ? 'bg-emerald-500'
                          : 'bg-slate-300'
                      }`} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{t.tree.node2Subtitle}</h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                      {isExtractingMedia
                        ? (lang === 'en' ? 'Extracting text and isolating charts...' : '正在解构样式并抽取正文与图表...')
                        : extractionTask?.status === 'done'
                        ? (lang === 'en' ? `Extracted ${extractionTask.textLength || 0} chars · ${extractionTask.paragraphCount || 1} paragraphs` : `已抽取 ${extractionTask.textLength || 0} 字符 · ${extractionTask.paragraphCount || 1} 段落`)
                        : (lang === 'en' ? 'Parses paragraph topology and intercepts figures' : '解析正文段落拓扑，截获高清内嵌图表')}
                    </p>
                  </div>

                  <div>
                    {extractionTask?.images && extractionTask.images.length > 0 ? (
                      <div className="rounded-lg bg-teal-50/70 border border-teal-100 p-1.5 flex items-center justify-between gap-1.5">
                        <div className="text-[9.5px] text-teal-900 font-medium">
                          <span className="font-bold">{extractionTask.images.length}</span> {lang === 'en' ? 'figures:' : '张多模态插图:'}
                        </div>
                        <div className="flex items-center gap-1 overflow-hidden">
                          {extractionTask.images.slice(0, 3).map((img, i) => (
                            <button
                              key={img.id || i}
                              onClick={() => setSelectedPreviewImage(img)}
                              className="relative group h-6 w-6 rounded border border-teal-200 overflow-hidden bg-white hover:scale-110 transition shadow-2xs cursor-pointer flex-shrink-0"
                              title={img.caption || (lang === 'en' ? 'Enlarge' : '查看大图')}
                            >
                              <img src={img.url} alt={img.caption || 'preview'} className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : extractionTask?.status === 'done' ? (
                      <div className="rounded-lg bg-teal-50/60 border border-teal-100 p-1.5 text-[9.5px] text-teal-800">
                        {lang === 'en' ? 'Plain text extracted, no embedded figures' : '纯文本提取完成，无内嵌图表'}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-slate-50 p-1.5 text-[9.5px] text-slate-400 border border-slate-200/60 leading-tight">
                        ✦ {lang === 'en' ? 'Will extract long text and isolate figures' : '将抽取正文长文本并分离内嵌图表'}
                      </div>
                    )}

                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{lang === 'en' ? 'Status' : '状态'}</span>
                      {isExtractingMedia ? (
                        <span className="text-teal-700 font-bold flex items-center gap-1 animate-pulse">
                          <Sparkles className="h-3 w-3 animate-spin text-teal-600" />
                          <span>{lang === 'en' ? 'Extracting...' : '正在提取...'}</span>
                        </span>
                      ) : extractionTask?.status === 'done' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{lang === 'en' ? 'Ready' : '图文就绪'} {extractionTask.latencyMs ? `(${extractionTask.latencyMs}ms)` : ''}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">{lang === 'en' ? 'Waiting for pre-check' : '等待前置预检'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector Line 2 -> 3 */}
              <div className="flex items-center px-1 flex-shrink-0">
                <div className="relative flex items-center">
                  <div className={`h-[2px] w-8 transition-colors duration-300 ${
                    hasBranches ? 'bg-emerald-400' : isExtracting ? 'bg-yuanbao-500 animate-pulse' : 'bg-slate-200'
                  }`} />
                  <div className={`absolute left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full border-2 transition-all duration-300 ${
                    hasBranches
                      ? 'bg-emerald-500 border-white ring-1 ring-emerald-300'
                      : isExtracting
                      ? 'bg-yuanbao-500 border-white ring-2 ring-yuanbao-200 animate-pulse'
                      : 'bg-white border-slate-300'
                  }`} />
                </div>
              </div>
            </>
          )}

          {/* ================= 3. CLAIM EXTRACTION NODE ================= */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`relative flex flex-col justify-between w-64 h-[152px] rounded-2xl border bg-white p-3.5 shadow-sm transition-all duration-300 ${
              isIdle || isInspecting || isExtractingMedia
                ? 'border-slate-300 ring-1 ring-slate-200' 
                : isExtracting
                ? 'border-yuanbao-500 ring-4 ring-yuanbao-100 shadow-md'
                : 'border-slate-900 ring-2 ring-slate-900/10'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    <FileText className="h-3 w-3" />
                    {isDocOrUrl ? (lang === 'en' ? 'Node 3 · Claims' : 'Node 3 · 命题拆解') : (lang === 'en' ? 'Root · Claims' : 'Root · 命题拆解')}
                  </span>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    isIdle || isInspecting || isExtractingMedia
                      ? 'bg-slate-300' 
                      : isExtracting 
                      ? 'bg-yuanbao-500 animate-ping' 
                      : 'bg-emerald-500'
                  }`} />
                </div>

                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {lang === 'en' ? 'Objective Claim Extraction' : '客观命题深度解构'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  {isExtracting
                    ? (lang === 'en' ? 'Decomposing text, isolating falsifiable claims...' : '大模型深度剖析原稿，提取客观事实断言...')
                    : isDocOrUrl
                    ? (lang === 'en' ? 'Extracts falsifiable claims from manuscript' : '基于已提取正文，抽取可客观证伪事实断言')
                    : (lang === 'en' ? 'Parses text into verifiable claims & premises' : '解析原稿长文，抽取可客观证伪事实断言命题')}
                </p>
              </div>

              <div>
                {(isIdle || isInspecting || isExtractingMedia) && (
                  <div className="rounded-lg bg-slate-50 p-1.5 text-[9.5px] text-slate-500 border border-slate-200/60 leading-tight mb-1.5">
                    ✦ {isDocOrUrl 
                      ? (lang === 'en' ? 'Auto-splits claims after pre-check finishes' : '前置图文提取就绪后自动拆解')
                      : (lang === 'en' ? 'Click "Start Audit" to expand branches' : '点击「开始检查」后自动向右延展分支')}
                  </div>
                )}

                {isExtracting && (
                  <div className="rounded-lg bg-yuanbao-50/90 p-1.5 text-[9.5px] text-yuanbao-800 border border-yuanbao-200 leading-tight flex items-center gap-1.5 animate-pulse mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-yuanbao-500 animate-ping flex-shrink-0" />
                    <span className="truncate">{lang === 'en' ? 'Extracting claims & branching...' : '深度拆解中，即将分裂延展拓扑...'}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">{lang === 'en' ? 'Status' : '状态'}</span>
                  {isIdle ? (
                    <span className="text-slate-400 font-medium">{lang === 'en' ? 'Ready · Pending' : '就绪 · 待破局'}</span>
                  ) : isInspecting || isExtractingMedia ? (
                    <span className="text-slate-400 font-medium">{lang === 'en' ? 'Waiting for media' : '等待图文就绪'}</span>
                  ) : isExtracting ? (
                    <span className="text-yuanbao-700 font-bold flex items-center gap-1 animate-pulse">
                      <Sparkles className="h-3 w-3 animate-spin text-yuanbao-600" />
                      <span>{lang === 'en' ? 'Extracting claims...' : '正在拆解命题...'}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      {lang === 'en' ? `Generated ${extractedClaims.length} branches` : `已生成 ${extractedClaims.length} 个分支`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= 4. SVG TREE FORK: ROOT TO BRANCHES ================= */}
          {hasBranches && (
            <>
              <div className="flex-shrink-0" style={{ height: totalBranchHeight }}>
                <svg 
                  width="56" 
                  height={totalBranchHeight} 
                  className="overflow-visible block"
                >
                  {/* Root Junction Dot */}
                  <circle 
                    cx="0" 
                    cy={centerY} 
                    r="4" 
                    className="fill-emerald-500" 
                  />
                  {extractedClaims.map((_, i) => {
                    const yBranch = rowCenterYs[i] ?? (i * 90 + 38);
                    const pathD = `M 0,${centerY} C 28,${centerY} 28,${yBranch} 56,${yBranch}`;
                    const isSearchDone = searchTasks[i]?.status === 'done';

                    return (
                      <g key={i}>
                        {/* Smooth Bézier Tree Branch */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isSearchDone ? '#10b981' : '#cbd5e1'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="transition-colors duration-300"
                        />
                        {/* Branch Junction Dot */}
                        <circle 
                          cx="56" 
                          cy={yBranch} 
                          r="3" 
                          className={`transition-colors duration-300 ${isSearchDone ? 'fill-emerald-500' : 'fill-slate-400'}`} 
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* ================= 4. BRANCH COLUMNS ================= */}
              <div className="flex flex-col flex-shrink-0" style={{ gap: `${rowGap}px` }}>
                {extractedClaims.map((claim, idx) => {
                  const searchTask = searchTasks.find(t => t.claimId === claim.id);
                  const arbitrationTask = arbitrationTasks.find(t => t.claimId === claim.id);

                  const isSearching = searchTask?.status === 'searching';
                  const isSearchDone = searchTask?.status === 'done';
                  const isSearchRetrying = searchTask?.status === 'retrying';
                  const isSearchFailed = searchTask?.status === 'failed';

                  const isArbitrating = arbitrationTask?.status === 'verifying';
                  const isArbitrationDone = arbitrationTask?.status === 'done';
                  const isArbitrationRetrying = arbitrationTask?.status === 'retrying';

                  const probes = getProbeQueries(claim);
                  const isMultiProbe = probes.length > 1;
                  const rowH = rowHeights[idx];

                  return (
                    <div 
                      key={claim.id} 
                      className="flex items-center gap-3 flex-shrink-0 animate-fade-in"
                      style={{ height: `${rowH}px` }}
                    >
                      {/* Node A: Extracted Claim Card */}
                      <div className="relative flex flex-col justify-between w-64 h-[76px] rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-slate-300 transition flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-slate-700">
                            {lang === 'en' ? `Branch #${idx + 1}` : `分支 #${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            {claim.isCausalClaim && (
                              <span 
                                className="rounded bg-purple-50 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 border border-purple-200"
                                title={claim.causalPremise || (lang === 'en' ? 'Includes causal inference' : '包含前后因果归因推导')}
                              >
                                {lang === 'en' ? '🔗 Causal' : '🔗 因果'}
                              </span>
                            )}
                            <span className="rounded bg-slate-50 px-1.5 py-0.2 text-[9px] font-mono text-slate-500 uppercase">
                              {claim.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-snug">
                          “{claim.claimText}”
                        </p>
                      </div>

                      {/* Horizontal Connector */}
                      <div className="relative flex items-center flex-shrink-0">
                        <div className={`h-[2px] w-6 transition-colors duration-300 ${
                          isSearchDone ? 'bg-emerald-400' : isSearching ? 'bg-yuanbao-500 animate-pulse' : 'bg-slate-200'
                        }`} />
                        <div className={`absolute left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border-2 transition-all duration-300 ${
                          isSearchDone 
                            ? 'bg-emerald-500 border-white ring-1 ring-emerald-300' 
                            : isSearching 
                            ? 'bg-yuanbao-500 border-white ring-2 ring-yuanbao-200 animate-pulse' 
                            : 'bg-white border-slate-300'
                        }`} />
                      </div>

                      {/* Node B: Yuanbao Search Probes */}
                      {isMultiProbe ? (
                        <div className="flex flex-col justify-center gap-2 flex-shrink-0" style={{ height: `${rowH}px` }}>
                          {probes.map((queryText, pIdx) => {
                            const probeItem = searchTask?.probes?.find(p => p.index === pIdx + 1);
                            const isPSearching = isSearching || probeItem?.status === 'searching';
                            const isPDone = probeItem?.status === 'done' || isSearchDone;
                            const isPRetrying = probeItem?.status === 'retrying';
                            const isPFailed = probeItem?.status === 'failed';

                            const probeCardHeight = probes.length === 2 ? 64 : 58;

                            return (
                              <div
                                key={pIdx}
                                className={`relative flex flex-col justify-between w-64 rounded-xl border p-2 bg-white shadow-2xs transition-all duration-300 flex-shrink-0 overflow-hidden ${
                                  isPDone
                                    ? 'border-cyan-300 ring-1 ring-cyan-100'
                                    : isPRetrying
                                    ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/25 animate-pulse'
                                    : isPFailed
                                    ? 'border-rose-300 bg-rose-50/20'
                                    : isPSearching
                                    ? 'border-yuanbao-500 ring-2 ring-yuanbao-100 animate-pulse'
                                    : 'border-slate-200 opacity-60'
                                }`}
                                style={{ height: probeCardHeight }}
                              >
                                <div className="flex items-center justify-between leading-none">
                                  <div className="flex items-center gap-1.5">
                                    <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-800 border border-cyan-200">
                                      {lang === 'en' ? `Probe #${pIdx + 1}` : `探针 #${pIdx + 1}`}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-yuanbao-800">
                                      <Globe2 className="h-2.5 w-2.5 text-yuanbao-600" />
                                      {lang === 'en' ? 'Yuanbao' : '元宝搜索'}
                                    </span>
                                  </div>

                                  {isPDone && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-emerald-700 border border-emerald-200">
                                      {searchTask?.latencyMs ? `${searchTask.latencyMs}ms` : (lang === 'en' ? 'Done' : '已召回')}
                                    </span>
                                  )}
                                  {isPRetrying && (
                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-amber-800 border border-amber-300 animate-pulse">
                                      {lang === 'en' ? 'Retrying' : '重试中'}
                                    </span>
                                  )}
                                  {isPSearching && (
                                    <span className="text-[9px] font-medium text-cyan-700 flex items-center gap-1 animate-pulse">
                                      <Sparkles className="h-2.5 w-2.5 animate-spin text-cyan-600" />
                                      <span>{lang === 'en' ? 'Concurrent' : '并发穿透'}</span>
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[11px] font-mono font-semibold text-slate-800 truncate leading-snug" title={queryText}>
                                    "{queryText}"
                                  </p>
                                </div>

                                <div className="flex items-center justify-between text-[9px] text-slate-400 leading-tight">
                                  <span className="truncate max-w-[170px]">
                                    {isPDone
                                      ? (probeItem?.sourcesCount !== undefined 
                                        ? (lang === 'en' ? `Retrieved ${probeItem.sourcesCount} sources` : `召回 ${probeItem.sourcesCount} 篇权威信源`)
                                        : (lang === 'en' ? `Retrieved ${searchTask?.sourcesCount || 10} sources` : `召回 ${searchTask?.sourcesCount || 10} 篇信源`))
                                      : isPSearching
                                      ? (lang === 'en' ? 'Vector index query...' : '千亿向量并发索引...')
                                      : isPFailed
                                      ? (lang === 'en' ? 'Fallback' : '已降级')
                                      : (lang === 'en' ? 'Ready · Pending probe' : '就绪 · 待探针穿透')}
                                  </span>
                                  {isPDone && (probeItem?.topSites?.[0] || searchTask?.topSites?.[0]) && (
                                    <span className="truncate max-w-[95px] text-slate-600 font-medium text-right">
                                      {probeItem?.topSites?.[0] || searchTask?.topSites?.[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div 
                          className={`relative flex flex-col justify-between w-64 h-[76px] rounded-xl border p-2.5 bg-white shadow-2xs transition-all duration-300 flex-shrink-0 overflow-hidden ${
                            isSearchDone
                              ? 'border-cyan-300 ring-1 ring-cyan-100'
                              : isSearchRetrying
                              ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/25 animate-pulse'
                              : isSearchFailed
                              ? 'border-rose-300 bg-rose-50/20'
                              : isSearching
                              ? 'border-yuanbao-500 ring-2 ring-yuanbao-100 animate-pulse'
                              : 'border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yuanbao-800">
                              <Globe2 className="h-3 w-3 text-yuanbao-600" />
                              {lang === 'en' ? 'Tencent Yuanbao (WSA)' : '腾讯元宝搜索 (WSA)'}
                            </span>
                            {isSearchDone && searchTask && (
                              <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-700 border border-emerald-200">
                                {searchTask.latencyMs}ms
                              </span>
                            )}
                            {isSearchRetrying && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-amber-800 border border-amber-300 animate-pulse">
                                {searchTask?.errorKind === 'timeout' 
                                  ? `⏱️ ${lang === 'en' ? 'Timeout Retry' : '超时重试'} ${searchTask?.retryCount || 1}/2` 
                                  : searchTask?.errorKind === 'rate_limit' 
                                  ? `⏳ ${lang === 'en' ? 'Rate Limit Retry' : '频控重试'} ${searchTask?.retryCount || 1}/2`
                                  : `${lang === 'en' ? 'Retry' : '重试'} ${searchTask?.retryCount || 1}/2`}
                              </span>
                            )}
                            {isSearchFailed && (
                              <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-rose-700 border border-rose-200">
                                {searchTask?.errorKind === 'auth' ? (lang === 'en' ? '🔑 Auth Error' : '🔑 鉴权错误') : (lang === 'en' ? 'Fallback' : '已降级')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 my-0.5 min-w-0">
                            <p className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                              {claim.searchKeyword}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[9.5px] text-slate-400">
                            <span>
                              {isSearchDone && searchTask
                                ? (lang === 'en' ? `Retrieved ${searchTask.sourcesCount} sources` : `召回 ${searchTask.sourcesCount} 篇权威信源`)
                                : isSearchRetrying
                                ? (lang === 'en' ? 'Timeout, retrying...' : '接口超时，正在重试...')
                                : isSearchFailed
                                ? (lang === 'en' ? 'Fallback' : '检索降级')
                                : isSearching 
                                ? (lang === 'en' ? 'Searching index...' : '千亿向量检索中...') 
                                : (lang === 'en' ? 'Pending search' : '待检索')}
                            </span>
                            {isSearchDone && searchTask?.topSites?.[0] && (
                              <span className="truncate max-w-[110px] text-slate-600 font-medium">
                                {searchTask.topSites[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Horizontal Connector */}
                      <div className="relative flex items-center flex-shrink-0">
                        <div className={`h-[2px] w-6 transition-colors duration-300 ${
                          isArbitrationDone ? 'bg-emerald-400' : isArbitrating ? 'bg-slate-400 animate-pulse' : 'bg-slate-200'
                        }`} />
                        <div className={`absolute left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border-2 transition-all duration-300 ${
                          isArbitrationDone 
                            ? 'bg-emerald-500 border-white ring-1 ring-emerald-300' 
                            : isArbitrating 
                            ? 'bg-slate-500 border-white ring-2 ring-slate-200 animate-pulse' 
                            : 'bg-white border-slate-300'
                        }`} />
                      </div>

                      {/* Node C: Evidence Cross-Arbitration Card */}
                      <div 
                        className={`relative flex flex-col justify-between w-64 h-[76px] rounded-xl border p-2.5 bg-white shadow-2xs transition-all duration-300 flex-shrink-0 ${
                          isArbitrationDone && arbitrationTask
                            ? arbitrationTask.verdict === 'verified'
                              ? 'border-emerald-300 ring-1 ring-emerald-100'
                              : arbitrationTask.verdict === 'refuted'
                              ? 'border-rose-300 ring-1 ring-rose-100'
                              : 'border-amber-300 ring-1 ring-amber-100'
                            : isArbitrationRetrying
                            ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/25 animate-pulse'
                            : isArbitrating
                            ? 'border-slate-400 ring-2 ring-slate-100 animate-pulse'
                            : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700">
                            <Gavel className="h-3 w-3 text-slate-500" />
                            {lang === 'en' ? 'Arbitration' : '交叉裁决'}
                            {arbitrationTask?.isCausalClaim && (
                              <span className="rounded bg-purple-50 px-1 py-0.2 text-[8.5px] font-bold text-purple-700 border border-purple-200">
                                {lang === 'en' ? 'Causal' : '因果审校'}
                              </span>
                            )}
                          </span>
                          {isArbitrationDone && arbitrationTask?.confidence && (
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              {arbitrationTask.confidence}%
                            </span>
                          )}
                          {isArbitrationRetrying && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-amber-800 border border-amber-300 animate-pulse">
                              {arbitrationTask?.errorKind === 'timeout'
                                ? `⏱️ ${lang === 'en' ? 'Timeout Retry' : '超时重试'} ${arbitrationTask?.retryCount || 1}/2`
                                : arbitrationTask?.errorKind === 'rate_limit'
                                ? `⏳ ${lang === 'en' ? 'Rate Limit Retry' : '频控重试'} ${arbitrationTask?.retryCount || 1}/2`
                                : `${lang === 'en' ? 'Retry' : '重试'} ${arbitrationTask?.retryCount || 1}/2`}
                            </span>
                          )}
                        </div>

                        {isArbitrationDone && arbitrationTask ? (
                          <div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[9.5px] font-bold ${
                              arbitrationTask.verdict === 'verified'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : arbitrationTask.verdict === 'refuted'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {arbitrationTask.verdict === 'verified' && (lang === 'en' ? '🟢 Verified' : '🟢 权威证实')}
                              {arbitrationTask.verdict === 'refuted' && (lang === 'en' ? '🔴 Refuted' : '🔴 事实错误')}
                              {arbitrationTask.verdict === 'disputed' && (lang === 'en' ? '🟡 Disputed' : '🟡 存疑时效')}
                            </span>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-sans">
                              {arbitrationTask.reasoning}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[10.5px] text-slate-400 italic py-1">
                            {isArbitrationRetrying ? (
                              <span className="text-amber-600 font-medium not-italic animate-pulse">
                                {lang === 'en' ? `Timeout, retrying ${arbitrationTask?.retryCount || 1}/2...` : `接口超时，第 ${arbitrationTask?.retryCount || 1}/2 次重试中...`}
                              </span>
                            ) : isArbitrating ? (
                              (lang === 'en' ? 'Comparing evidence chains...' : '证据链比对中...')
                            ) : (
                              (lang === 'en' ? 'Waiting for evidence' : '等待证据注入')
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ================= 4. SVG TREE FORK: BRANCHES TO TERMINAL ================= */}
              <div className="flex-shrink-0" style={{ height: totalBranchHeight }}>
                <svg 
                  width="56" 
                  height={totalBranchHeight} 
                  className="overflow-visible block"
                >
                  {extractedClaims.map((_, i) => {
                    const yBranch = rowCenterYs[i] ?? (i * 90 + 38);
                    const pathD = `M 0,${yBranch} C 28,${yBranch} 28,${centerY} 56,${centerY}`;
                    const isArbitrationDone = arbitrationTasks[i]?.status === 'done';

                    return (
                      <g key={i}>
                        {/* Branch Junction Dot */}
                        <circle 
                          cx="0" 
                          cy={yBranch} 
                          r="3" 
                          className={`transition-colors duration-300 ${isArbitrationDone ? 'fill-emerald-500' : 'fill-slate-400'}`} 
                        />
                        {/* Smooth Bézier Converging Branch */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isArbitrationDone ? '#10b981' : '#cbd5e1'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="transition-colors duration-300"
                        />
                      </g>
                    );
                  })}
                  {/* Terminal Junction Dot */}
                  <circle 
                    cx="56" 
                    cy={centerY} 
                    r="4" 
                    className={`transition-colors duration-300 ${stage === 'completed' ? 'fill-emerald-500' : 'fill-slate-500'}`} 
                  />
                </svg>
              </div>

              {/* ================= 5. TERMINAL NODE ================= */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`relative flex flex-col justify-between w-60 h-[120px] rounded-2xl border bg-white p-3.5 shadow-sm transition-all duration-300 ${
                  stage === 'completed'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                        <Award className="h-3 w-3 text-amber-600" />
                        {lang === 'en' ? 'Terminal Node' : '汇聚终节点'}
                      </span>
                      {stage === 'completed' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{t.tree.node7Subtitle.split('&')[0].trim()}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {lang === 'en' ? 'Aggregates evidence to generate citations & report' : '聚合分支证据，生成学术引注、背书证书与修正'}
                    </p>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{lang === 'en' ? 'Status:' : '状态:'}</span>
                    <span className={stage === 'completed' ? 'font-bold text-emerald-600' : 'text-slate-500'}>
                      {stage === 'completed' 
                        ? (lang === 'en' ? 'Converged' : '已全链路收敛') 
                        : (lang === 'en' ? 'Waiting for branches' : '等待分支汇聚')}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Extracted Image Preview */}
      {selectedPreviewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div 
            className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-4 overflow-hidden border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 truncate">
                {selectedPreviewImage.caption || t.editor.lightboxTitle}
              </h4>
              <button 
                onClick={() => setSelectedPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="py-3 flex items-center justify-center bg-slate-950/5 rounded-xl mt-2 overflow-hidden max-h-[60vh]">
              <img 
                src={selectedPreviewImage.url} 
                alt={selectedPreviewImage.caption || 'preview'} 
                className="max-h-[55vh] max-w-full object-contain rounded-lg" 
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono flex items-center justify-between">
              <span>{t.editor.lightboxHint}</span>
              <span className="text-slate-400">{t.editor.lightboxCloseHint}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
