import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Zap, Globe, CheckCircle2, 
  FileText, Cpu, Scale, Puzzle, Github 
} from 'lucide-react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { LiveLogsPanel } from './components/LiveLogsPanel';
import { WorkflowTree } from './components/WorkflowTree';
import { VerificationPanel } from './components/VerificationPanel';
import { SettingsModal } from './components/SettingsModal';
import { CertificateModal } from './components/CertificateModal';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { ExtensionModal } from './components/ExtensionModal';
import { 
  Claim, DEFAULT_SETTINGS, UserSettings, VerificationSummary, WorkflowState,
  SourceInputType, ExtractedMediaItem, SourceInspectionTask, MultimodalExtractionTask
} from './types';
import { SAMPLE_PRESETS } from './data/samples';
import { runInteractiveWorkflowPipeline, PipelineController } from './services/pipeline';

const INITIAL_WORKFLOW_STATE: WorkflowState = {
  stage: 'idle',
  currentStepIndex: 0,
  inputType: 'text',
  extractedClaims: [],
  searchTasks: [],
  arbitrationTasks: [],
  logs: [],
  elapsedMs: 0,
  isPaused: false,
};

export const App: React.FC = () => {
  // Content & Verification States
  const [content, setContent] = useState<string>(SAMPLE_PRESETS[0].content);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // Page Morphing State: Hero presentation mode (false) vs Active inspection studio mode (true)
  const [isStudioMode, setIsStudioMode] = useState<boolean>(false);

  // Source Format and Multimodal State
  const [inputType, setInputType] = useState<SourceInputType>('text');
  const [sourceNameOrUrl, setSourceNameOrUrl] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedImages, setExtractedImages] = useState<ExtractedMediaItem[]>([]);
  const [inspectionTask, setInspectionTask] = useState<SourceInspectionTask | undefined>(undefined);
  const [extractionTask, setExtractionTask] = useState<MultimodalExtractionTask | undefined>(undefined);

  // Workflow State for Live Pipeline Display
  const [workflowState, setWorkflowState] = useState<WorkflowState>(INITIAL_WORKFLOW_STATE);
  const controllerRef = useRef<PipelineController | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState<boolean>(false);

  // User Settings with LocalStorage persistence
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('truthguard_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically migrate/default reasoning effort to 'low' to prevent overthinking
        if (!parsed.reasoningEffort || parsed.reasoningEffort === 'medium' || parsed.reasoningEffort === 'high' || parsed.reasoningEffort === 'max') {
          parsed.reasoningEffort = 'low';
        }
        // Ensure searchCount is always standard 10 by default
        parsed.searchCount = 10;
        return { ...DEFAULT_SETTINGS, ...parsed, searchCount: 10 };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('truthguard_settings', JSON.stringify(newSettings));
  };

  // Continuous high-precision live execution timer (100ms smooth ticker)
  const [liveElapsedMs, setLiveElapsedMs] = useState<number>(0);
  const timerRef = useRef<{
    startTime: number;
    pausedAt: number | null;
    totalPausedTime: number;
    intervalId: any;
  }>({
    startTime: 0,
    pausedAt: null,
    totalPausedTime: 0,
    intervalId: null
  });

  useEffect(() => {
    if (!isLoading) {
      if (timerRef.current.intervalId) {
        clearInterval(timerRef.current.intervalId);
        timerRef.current.intervalId = null;
      }
      return;
    }

    if (!workflowState.isPaused) {
      if (timerRef.current.pausedAt) {
        timerRef.current.totalPausedTime += Date.now() - timerRef.current.pausedAt;
        timerRef.current.pausedAt = null;
      }

      timerRef.current.intervalId = setInterval(() => {
        const elapsed = Date.now() - timerRef.current.startTime - timerRef.current.totalPausedTime;
        setLiveElapsedMs(Math.max(0, elapsed));
      }, 100);
    } else {
      if (!timerRef.current.pausedAt) {
        timerRef.current.pausedAt = Date.now();
      }
      if (timerRef.current.intervalId) {
        clearInterval(timerRef.current.intervalId);
        timerRef.current.intervalId = null;
      }
    }

    return () => {
      if (timerRef.current.intervalId) {
        clearInterval(timerRef.current.intervalId);
        timerRef.current.intervalId = null;
      }
    };
  }, [isLoading, workflowState.isPaused]);

  // Clean business progress status calculator (STRICTLY excludes thinking logs)
  const getBusinessProgressMessage = (state: WorkflowState): string => {
    if (state.isPaused) return '检测已挂起';

    switch (state.stage) {
      case 'inspecting':
        return '正在执行来源预检与可用性分析...';
      case 'extracting':
        return '正在深度解析正文并提炼客观事实断言...';
      case 'searching': {
        const done = state.searchTasks.filter(t => t.status === 'done' || t.status === 'failed').length;
        const total = state.searchTasks.length;
        return total > 0 ? `正在穿透元宝搜索 (${done}/${total})...` : '正在调用腾讯云元宝搜索...';
      }
      case 'verifying': {
        const done = state.arbitrationTasks.filter(t => t.status === 'done').length;
        const total = state.arbitrationTasks.length;
        return total > 0 ? `正在多源证据交叉裁决 (${done}/${total})...` : '正在交叉比对证据与因果链...';
      }
      case 'synthesizing':
        return '正在生成审校背书画像与报告...';
      case 'completed':
        return '全链路审校已完成';
      default:
        break;
    }

    // Fallback: pick the latest business log that is strictly NOT thinking
    const businessLogs = state.logs.filter(l => !l.isThinking && l.type !== 'thinking');
    if (businessLogs.length > 0) {
      return businessLogs[businessLogs.length - 1].message;
    }
    return '穿透检索中...';
  };

  // Auto-scroll down to Complete Report when verification finishes!
  useEffect(() => {
    if (workflowState.stage === 'completed' && summary) {
      const timer = setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [workflowState.stage, summary]);

  // Run Fact-Checking Pipeline
  const handleVerify = async () => {
    if (!content.trim() || isLoading) return;

    setIsStudioMode(true);

    const controller = new PipelineController();
    controllerRef.current = controller;

    setIsLoading(true);
    setProgressMessage('正在准备智能体流水线...');

    const now = Date.now();
    timerRef.current = {
      startTime: now,
      pausedAt: null,
      totalPausedTime: 0,
      intervalId: null
    };
    setLiveElapsedMs(0);

    const isDocOrUrl = inputType === 'document' || inputType === 'url';

    setWorkflowState({
      ...INITIAL_WORKFLOW_STATE,
      inputType,
      sourceNameOrUrl: sourceNameOrUrl || (inputType === 'url' ? '网页目标' : '原稿文档'),
      inspectionTask: inspectionTask ? { ...inspectionTask, status: 'pending' } : undefined,
      extractionTask: extractionTask ? { ...extractionTask, status: 'pending' } : undefined,
      stage: isDocOrUrl ? 'inspecting' : 'extracting',
      logs: [
        {
          id: 'log_start',
          time: new Date().toTimeString().split(' ')[0],
          stage: isDocOrUrl ? 'inspecting' : 'extracting',
          message: isDocOrUrl
            ? `用户启动【${inputType === 'url' ? '网页链接' : '文档导入'}】全链路穿透核验（预检 → 图文提取 → 命题拆解 → WSA检索）`
            : '用户启动全网事实穿透工作流',
          type: 'info'
        }
      ]
    });

    try {
      const result = await runInteractiveWorkflowPipeline(
        content,
        settings,
        controller,
        (updatedState) => {
          setWorkflowState(updatedState);
          setProgressMessage(getBusinessProgressMessage(updatedState));
        },
        {
          inputType,
          sourceNameOrUrl,
          file: uploadedFile,
          url: sourceNameOrUrl,
          inspectionTask,
          extractionTask
        }
      );

      if (result.extractedContent && result.extractedContent !== content) {
        setContent(result.extractedContent);
      }
      setClaims(result.claims);
      setSummary(result.summary);
      setLiveElapsedMs(result.summary.elapsedMs);
    } catch (err: any) {
      alert(`审校异常: ${err.message || '未知错误，请检查网络或 API 密钥'}`);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
      controllerRef.current = null;
    }
  };

  // Workflow Controls
  const handlePause = () => {
    if (controllerRef.current && !controllerRef.current.isPaused) {
      controllerRef.current.pause();
      setWorkflowState(prev => ({ ...prev, isPaused: true }));
    }
  };

  const handleResume = () => {
    if (controllerRef.current && controllerRef.current.isPaused) {
      controllerRef.current.resume();
      setWorkflowState(prev => ({ ...prev, isPaused: false }));
    }
  };

  const handleAbort = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setWorkflowState(prev => ({ ...prev, stage: 'aborted', isPaused: false }));
    }
  };

  // 1. One-click inject citations and footnotes
  const handleInjectCitations = () => {
    if (claims.length === 0) return;

    let updatedContent = content;
    const footnotes: string[] = [];
    let count = 1;

    claims.forEach((c) => {
      if (c.status === 'verified' && c.sources.length > 0) {
        const topSource = c.sources[0];
        const tag = `[^${count}]`;

        footnotes.push(`[^${count}]: 《${topSource.site}》- [${topSource.title}](${topSource.url}) (元宝搜索置信度 ${c.confidence}%)`);

        if (updatedContent.includes(c.claimText)) {
          updatedContent = updatedContent.replace(c.claimText, `${c.claimText}${tag}`);
          count++;
        }
      }
    });

    if (footnotes.length > 0) {
      if (!updatedContent.includes('## 权威信源与核验引用')) {
        updatedContent += `\n\n## 权威信源与核验引用\n\n` + footnotes.join('\n');
      }
      setContent(updatedContent);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 2. One-click apply all corrections
  const handleApplyAllCorrections = () => {
    let updatedContent = content;
    claims.forEach((c) => {
      if ((c.status === 'refuted' || c.status === 'disputed') && c.correction) {
        if (updatedContent.includes(c.claimText)) {
          updatedContent = updatedContent.replace(c.claimText, c.correction);
        }
      }
    });
    setContent(updatedContent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Single claim correction
  const handleApplySingleCorrection = (claim: Claim) => {
    if (!claim.correction) return;
    if (content.includes(claim.claimText)) {
      setContent(content.replace(claim.claimText, claim.correction));
    }
  };

  return (
    <div className="min-h-screen bg-canvas-pattern font-sans text-slate-900 selection:bg-yuanbao-100 selection:text-yuanbao-900 flex flex-col relative overflow-x-hidden">
      {/* Studio Header (Equipped with Independent Execution Controls & Subtle Logo Click) */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenExtension={() => setIsExtensionOpen(true)}
        onLogoClick={() => setIsStudioMode(false)}
        hasResults={claims.length > 0 && summary !== null}
        claimsCount={claims.length}
        healthScore={summary?.healthScore}
        isLoading={isLoading}
        isPaused={workflowState.isPaused}
        onPause={handlePause}
        onResume={handleResume}
        onAbort={handleAbort}
        elapsedMs={isLoading ? liveElapsedMs : workflowState.elapsedMs}
        progressMessage={progressMessage}
      />

      {/* Unified Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 space-y-4">
        
        {/* ================= HERO PROMOTION & BACKGROUND SECTION (Morphs away on Start) ================= */}
        <section 
          className={`transition-all duration-700 ease-in-out overflow-hidden text-center flex flex-col items-center ${
            isStudioMode 
              ? 'max-h-0 opacity-0 -translate-y-8 pointer-events-none mb-0 py-0' 
              : 'max-h-[850px] opacity-100 translate-y-0 pt-4 sm:pt-8 pb-5 mb-2'
          }`}
        >
          {/* Top Pill Announcement */}
          <div className="flex items-center gap-2 flex-wrap justify-center mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-yuanbao-300/80 bg-white/90 px-3.5 py-1 text-xs font-medium text-yuanbao-800 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-yuanbao-600 animate-spin" />
              <span>腾讯元宝搜索 · 权威多源事实穿透审校引擎</span>
            </div>

            <button
              onClick={() => setIsExtensionOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/90 hover:bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs transition active:scale-[0.98] cursor-pointer"
            >
              <Puzzle className="h-3.5 w-3.5 text-emerald-600" />
              <span>🧩 浏览器划词核验插件已上线 · 点击体验</span>
            </button>
          </div>

          {/* Major Title */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            AI 时代的事实护盾 <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              TruthGuard 事实检察官
            </span>
          </h1>

          {/* Subtitle / Mission */}
          <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            终结大模型幻觉与不实论述。依托<span className="text-yuanbao-700 font-semibold">腾讯元宝搜索 (WSA)</span> 数千亿级全网与 157+ 垂直行业权威信源，
            毫秒级完成客观命题拆解、深网探针穿透与交叉裁决，一键输出学术引用与数字背书证书。
          </p>

          {/* Compact Feature Pills Row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>毫秒级检索 (<strong>~350ms</strong>)</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <Globe className="h-3.5 w-3.5 text-sky-500" />
              <span>直通 <strong>157+</strong> 垂直权威信源</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span><strong>100%</strong> 可溯源证据链条</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span><strong>3合1</strong> 文本/文档/网页多模态</span>
            </div>
          </div>
        </section>

        {/* ================= CORE FIRST SCREEN CONTAINER (Fluid Morphing) ================= */}
        {/* In Hero mode: Centered elegant Editor card. In Studio mode: Splits into left Editor, right Logs, and bottom Tree! */}
        <div className={`transition-all duration-700 ease-in-out ${
          isStudioMode 
            ? 'h-[calc(100vh-4.25rem)] min-h-[560px] flex flex-col gap-3.5 pb-8' 
            : 'max-w-4xl mx-auto w-full flex flex-col gap-3.5 pb-2'
        }`}>
          {/* Top Half / Main Row */}
          <div className={`transition-all duration-700 ease-in-out ${
            isStudioMode
              ? 'flex-[1.15] min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3.5'
              : 'w-full flex flex-col'
          }`}>
            {/* Area 1: 待检查原稿 (Smoothly moves from center to left column) */}
            <div className={`transition-all duration-700 ease-in-out ${
              isStudioMode
                ? 'h-full min-h-0 flex flex-col'
                : 'h-[490px] sm:h-[510px] w-full flex flex-col'
            }`}>
              <Editor
                content={content}
                onChange={setContent}
                onVerify={handleVerify}
                isLoading={isLoading}
                isPaused={workflowState.isPaused}
                onPause={handlePause}
                onResume={handleResume}
                claims={claims}
                onInjectCitations={handleInjectCitations}
                onApplyAllCorrections={handleApplyAllCorrections}
                inputType={inputType}
                onInputTypeChange={(newType) => {
                  setInputType(newType);
                  setWorkflowState(prev => ({ 
                    ...prev, 
                    inputType: newType,
                    inspectionTask: undefined,
                    extractionTask: undefined
                  }));
                }}
                sourceNameOrUrl={sourceNameOrUrl}
                onSourceNameOrUrlChange={setSourceNameOrUrl}
                uploadedFile={uploadedFile}
                onFileUpload={setUploadedFile}
                extractedImages={extractedImages}
                onExtractedImagesChange={setExtractedImages}
                inspectionTask={inspectionTask}
                onInspectionTaskChange={(task) => {
                  setInspectionTask(task);
                  setWorkflowState(prev => ({ ...prev, inspectionTask: task }));
                }}
                extractionTask={extractionTask}
                onExtractionTaskChange={(task) => {
                  setExtractionTask(task);
                  setWorkflowState(prev => ({ ...prev, extractionTask: task }));
                }}
                title="待检查原稿"
              />
            </div>

            {/* Area 2: 实时流水日志 (Smoothly slides and fades in from right) */}
            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${
              isStudioMode
                ? 'h-full min-h-0 flex flex-col opacity-100 translate-x-0 scale-100'
                : 'h-0 max-h-0 opacity-0 translate-x-8 scale-95 pointer-events-none'
            }`}>
              <LiveLogsPanel
                logs={workflowState.logs}
                stage={workflowState.stage}
                isPaused={workflowState.isPaused}
                elapsedMs={isLoading ? liveElapsedMs : workflowState.elapsedMs}
              />
            </div>
          </div>

          {/* Bottom Half: 事实穿透工作树图谱 (Smoothly unfolds and fades in from bottom) */}
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${
            isStudioMode
              ? 'flex-1 min-h-0 w-full opacity-100 translate-y-0'
              : 'h-0 max-h-0 opacity-0 translate-y-8 pointer-events-none'
          }`}>
            <WorkflowTree
              workflowState={workflowState}
              isLoading={isLoading}
              isPaused={workflowState.isPaused}
              onPause={handlePause}
              onResume={handleResume}
              onAbort={handleAbort}
              elapsedMs={isLoading ? liveElapsedMs : workflowState.elapsedMs}
            />
          </div>
        </div>

        {/* ================= BOTTOM PRESENTATION & COMPARISON SECTION (Morphs away on Start) ================= */}
        <section 
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            isStudioMode 
              ? 'max-h-0 opacity-0 translate-y-8 pointer-events-none mb-0 py-0' 
              : 'max-h-[1600px] opacity-100 translate-y-0 pt-8 pb-14 space-y-10'
          }`}
        >
          {/* 3 Pillars Grid */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold tracking-widest text-yuanbao-700 font-mono uppercase">
                Core Capabilities · 核心三维事实壁垒
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                全链路事实穿透审校体系
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-2xs hover:shadow-subtle hover:border-emerald-300 transition duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3.5">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  1. 命题客观解构与因果剥离
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  深度提炼长篇技术草稿、论文或研报，自动剥除主观修饰，提取客观可证伪的单点事实、数值区间与核心因果前置条件。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-2xs hover:shadow-subtle hover:border-teal-300 transition duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-3.5">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  2. 腾讯元宝自适应搜索探针
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  依托元宝搜索千亿权威网页大底座。针对复杂复合命题自适应分裂 1~3 路垂直检索探针，毫秒级召回官方权威证据。
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-2xs hover:shadow-subtle hover:border-cyan-300 transition duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 mb-3.5">
                  <Scale className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  3. 多源证据交叉仲裁与背书
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  交叉比对多方冲突证据链，输出证实(🟢)、存疑(🟡)、虚假(🔴)红绿灯置信度，自动追加 GB/T 7714 规范引用与防伪背书。
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Cards: Traditional LLM vs TruthGuard */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold tracking-widest text-yuanbao-700 font-mono uppercase">
                Pain Point & Solution · 为什么需要事实检察官？
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                传统大模型生成 vs TruthGuard 事实检察官
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Traditional LLM Generation */}
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 border-l-4 border-l-rose-500">
                <h4 className="text-xs font-bold text-rose-900 mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  传统大模型生成 / 未核验内容
                </h4>
                <ul className="space-y-2.5 text-xs text-rose-950/80">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>严重幻觉困境</strong>：一本正经捏造不存在的科研论文、虚构数据与虚假引用。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>知识库时效滞后</strong>：受限于训练截止时间，无法掌握当月乃至当日最新事实与政策。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>缺乏可查验证据</strong>：输出内容无确凿权威信源支撑，在学术与商业场景中风险极高。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>假因果强行归因</strong>：将两件微弱关联事件强行推导为因果关系。</span>
                  </li>
                </ul>
              </div>

              {/* TruthGuard 事实检察官 */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 border-l-4 border-l-emerald-600">
                <h4 className="text-xs font-bold text-emerald-900 mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  TruthGuard 事实检察官 + 腾讯元宝搜索
                </h4>
                <ul className="space-y-2.5 text-xs text-emerald-950/80">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>直连千亿权威全网</strong>：毫秒级直通腾讯元宝权威索引，召回官方公报与学术智库。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>命题与因果客观解构</strong>：不仅审校单点事实，更严格推敲前置假定与因果链条。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>标准学术引注一键注入</strong>：自动在正文末尾追加 GB/T 7714 规范文献引用列表。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>数字防伪背书证书</strong>：生成带有专属 SHA-256 哈希指纹的事实审计报告。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECOND SECTION: 4. 完整报告 (仅在工作态展现) ================= */}
        {/* Auto-scrolls here when verification completes, or user scrolls down */}
        {isStudioMode && (
          <div ref={reportRef} className="w-full pt-2 pb-6 animate-fade-in">
            <VerificationPanel
              claims={claims}
              summary={summary}
              onApplySingleCorrection={handleApplySingleCorrection}
              isLoading={isLoading}
              workflowState={workflowState}
              onOpenCertificate={() => setIsCertificateOpen(true)}
              onOpenBenchmark={() => setIsBenchmarkOpen(true)}
              onInjectCitations={handleInjectCitations}
              onApplyAllCorrections={handleApplyAllCorrections}
            />
          </div>
        )}
      </main>

      {/* Editorial Footer & Academic Footnotes */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-md transition-all">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 py-6 sm:py-7 space-y-3.5">
          {/* Section 1: Footnotes Block */}
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 text-[11.5px] leading-relaxed text-slate-500 space-y-1.5 font-sans">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
              <span className="font-mono text-yuanbao-700 font-bold">[*]</span>
              <span>系统架构与事实核验标准脚注 (System Footnotes)</span>
            </div>
            <p>
              <span className="font-mono text-slate-400 font-semibold">[1] 检索基座：</span>
              依托腾讯云元宝搜索 (Tencent Yuanbao Search / WSA) 官方 API 构建，直连全网千亿权威网页、政务公开与主流垂直智库，毫秒级召回事实证据。
            </p>
            <p>
              <span className="font-mono text-slate-400 font-semibold">[2] 事实裁决：</span>
              客观命题拆解与多源证据链仲裁由大模型自适应推理完成，审校建议仅作为学术研究或专业内容创作的辅助校对参考。
            </p>
            <p>
              <span className="font-mono text-slate-400 font-semibold">[3] 隐私与安全：</span>
              原稿多模态检测与魔数匹配均于前端沙箱预检，不持久化存储用户的私密稿件。
            </p>
          </div>

          {/* Section 2: Creator & Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-500">
            {/* Left: Brand & Creator */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">TruthGuard 事实检察官</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yuanbao-50 border border-yuanbao-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-yuanbao-800">
                <span>创作者:</span>
                <span className="font-mono font-bold text-yuanbao-900">freshmanJ</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">AI 时代的高保真事实护盾与学术文献溯源副驾驶</span>
            </div>

            {/* Right: Technical Badges & Quick Action */}
            <div className="flex items-center gap-3 text-[11.5px] text-slate-400 flex-wrap">
              <a
                href="https://github.com/FreshmanJ/TruthGuard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-slate-800 transition text-slate-500 font-medium cursor-pointer"
              >
                <Github className="h-3.5 w-3.5 text-slate-600" />
                <span>GitHub 开源</span>
              </a>
              <span>•</span>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-slate-800 transition cursor-pointer"
              >
                配置中心
              </button>
              <span>•</span>
              <span className="font-mono">Powered by Tencent Cloud WSA</span>
              <span>•</span>
              <span>© 2026 freshmanJ. All Rights Reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals (Available Globally) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {summary && (
        <CertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          summary={summary}
          claims={claims}
          originalText={content}
        />
      )}

      <BenchmarkPanel
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        summary={summary}
      />

      <ExtensionModal
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
      />
    </div>
  );
};

export default App;
