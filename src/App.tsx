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
import { SAMPLE_PRESETS_ZH, SAMPLE_PRESETS_EN, getSamplePresets } from './data/samples';
import { runInteractiveWorkflowPipeline, PipelineController } from './services/pipeline';
import { useI18n } from './i18n/context';

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
  const { lang, t, interpolate } = useI18n();

  // Content & Verification States
  const [content, setContent] = useState<string>(() => {
    return lang === 'en' ? SAMPLE_PRESETS_EN[0].content : SAMPLE_PRESETS_ZH[0].content;
  });
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
        if (!parsed.reasoningEffort || parsed.reasoningEffort === 'medium' || parsed.reasoningEffort === 'high' || parsed.reasoningEffort === 'max') {
          parsed.reasoningEffort = 'low';
        }
        parsed.searchCount = 10;
        if (parsed.aiBaseUrl === 'https://token.sensenova.cn/v1/chat/completions') {
          parsed.aiBaseUrl = '';
        }
        if (parsed.aiModel === 'sensenova-6.8-flash-lite') {
          parsed.aiModel = '';
        }
        if (parsed.yuanbaoApiKey && parsed.yuanbaoApiKey.startsWith('sk-5dc8')) {
          parsed.yuanbaoApiKey = '';
        }
        if (parsed.aiApiKey && parsed.aiApiKey.startsWith('sk-gJD5')) {
          parsed.aiApiKey = '';
        }
        if (!parsed.yuanbaoApiKey) {
          parsed.useCustomYuanbaoKey = false;
        } else if (parsed.useCustomYuanbaoKey === undefined) {
          parsed.useCustomYuanbaoKey = true;
        }
        if (!parsed.aiApiKey) {
          parsed.useCustomAiKey = false;
        } else if (parsed.useCustomAiKey === undefined) {
          parsed.useCustomAiKey = true;
        }
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

  // Synchronize sample content when switching language if user hasn't edited away from the default preset
  const prevLangRef = useRef<string>(lang);
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      const prevDefault = prevLangRef.current === 'en' ? SAMPLE_PRESETS_EN[0].content : SAMPLE_PRESETS_ZH[0].content;
      const newDefault = lang === 'en' ? SAMPLE_PRESETS_EN[0].content : SAMPLE_PRESETS_ZH[0].content;
      if (content === prevDefault) {
        setContent(newDefault);
      }
      prevLangRef.current = lang;
    }
  }, [lang, content]);

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
    if (state.isPaused) return t.businessProgress.paused;

    switch (state.stage) {
      case 'inspecting':
        return t.businessProgress.inspecting;
      case 'extracting':
        return t.businessProgress.extracting;
      case 'searching': {
        const done = state.searchTasks.filter(t => t.status === 'done' || t.status === 'failed').length;
        const total = state.searchTasks.length;
        return total > 0 
          ? interpolate(t.businessProgress.searching, { done, total })
          : t.businessProgress.searchingInit;
      }
      case 'verifying': {
        const done = state.arbitrationTasks.filter(t => t.status === 'done').length;
        const total = state.arbitrationTasks.length;
        return total > 0 
          ? interpolate(t.businessProgress.verifying, { done, total })
          : t.businessProgress.verifyingInit;
      }
      case 'synthesizing':
        return t.businessProgress.synthesizing;
      case 'completed':
        return t.businessProgress.completed;
      default:
        break;
    }

    const businessLogs = state.logs.filter(l => !l.isThinking && l.type !== 'thinking');
    if (businessLogs.length > 0) {
      return businessLogs[businessLogs.length - 1].message;
    }
    return t.businessProgress.defaultSearching;
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
    setProgressMessage(t.businessProgress.inspecting);

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
      sourceNameOrUrl: sourceNameOrUrl || (inputType === 'url' ? (lang === 'en' ? 'Target URL' : '网页目标') : (lang === 'en' ? 'Source Manuscript' : '原稿文档')),
      inspectionTask: inspectionTask ? { ...inspectionTask, status: 'pending' } : undefined,
      extractionTask: extractionTask ? { ...extractionTask, status: 'pending' } : undefined,
      stage: isDocOrUrl ? 'inspecting' : 'extracting',
      logs: [
        {
          id: 'log_start',
          time: new Date().toTimeString().split(' ')[0],
          stage: isDocOrUrl ? 'inspecting' : 'extracting',
          message: isDocOrUrl
            ? (lang === 'en'
              ? `Started verification pipeline for [${inputType === 'url' ? 'Web URL' : 'Document Import'}] (Pre-check → Multimodal Extraction → Claims → WSA Search)`
              : `用户启动【${inputType === 'url' ? '网页链接' : '文档导入'}】全链路穿透核验（预检 → 图文提取 → 命题拆解 → WSA检索）`)
            : (lang === 'en'
              ? 'User initiated full-pipeline fact-checking workflow'
              : '用户启动全网事实穿透工作流'),
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
          extractionTask,
          lang
        }
      );

      if (result.extractedContent && result.extractedContent !== content) {
        setContent(result.extractedContent);
      }
      setClaims(result.claims);
      setSummary(result.summary);
      setLiveElapsedMs(result.summary.elapsedMs);
    } catch (err: any) {
      alert(`${lang === 'en' ? 'Audit Exception: ' : '审校异常: '}${err.message || (lang === 'en' ? 'Unknown error, please check network or API keys' : '未知错误，请检查网络或 API 密钥')}`);
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
        const confidenceLabel = lang === 'en' ? 'Yuanbao Confidence' : '元宝搜索置信度';

        footnotes.push(`[^${count}]: 《${topSource.site}》- [${topSource.title}](${topSource.url}) (${confidenceLabel} ${c.confidence}%)`);

        if (updatedContent.includes(c.claimText)) {
          updatedContent = updatedContent.replace(c.claimText, `${c.claimText}${tag}`);
          count++;
        }
      }
    });

    if (footnotes.length > 0) {
      const sectionHeading = lang === 'en' ? '## Authoritative Sources & Citations' : '## 权威信源与核验引用';
      if (!updatedContent.includes(sectionHeading)) {
        updatedContent += `\n\n${sectionHeading}\n\n` + footnotes.join('\n');
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
              <span>{t.hero.topPill}</span>
            </div>

            <button
              onClick={() => setIsExtensionOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/90 hover:bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs transition active:scale-[0.98] cursor-pointer"
            >
              <Puzzle className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t.hero.extPill}</span>
            </button>
          </div>

          {/* Major Title */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {t.hero.mainTitle1} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {t.hero.mainTitle2}
            </span>
          </h1>

          {/* Subtitle / Mission */}
          <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Compact Feature Pills Row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>{t.hero.pillLatency}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <Globe className="h-3.5 w-3.5 text-sky-500" />
              <span>{t.hero.pillSources}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t.hero.pillEvidence}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-3 py-1 shadow-2xs">
              <FileText className="h-3.5 w-3.5 text-teal-600" />
              <span>{t.hero.pillMultimodal}</span>
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
            {/* Area 1: Source Draft (Smoothly moves from center to left column) */}
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
                title={t.editor.title}
              />
            </div>

            {/* Area 2: Live Stream Logs (Smoothly slides and fades in from right) */}
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

          {/* Bottom Half: Interactive Fact-Checking Tree Graph */}
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
                {t.hero.capabilitiesCategory}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {t.hero.capabilitiesTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-2xs hover:shadow-subtle hover:border-emerald-300 transition duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3.5">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {t.hero.cap1Title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.hero.cap1Desc}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-2xs hover:shadow-subtle hover:border-teal-300 transition duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-3.5">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {t.hero.cap2Title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.hero.cap2Desc}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-2xs hover:shadow-subtle hover:border-cyan-300 transition duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 mb-3.5">
                  <Scale className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {t.hero.cap3Title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.hero.cap3Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Cards: Traditional LLM vs TruthGuard */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold tracking-widest text-yuanbao-700 font-mono uppercase">
                {t.hero.vsCategory}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {t.hero.vsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Traditional LLM Generation */}
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 border-l-4 border-l-rose-500">
                <h4 className="text-xs font-bold text-rose-900 mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  {t.hero.llmTitle}
                </h4>
                <ul className="space-y-2.5 text-xs text-rose-950/80">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>{t.hero.llm1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>{t.hero.llm2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>{t.hero.llm3}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>{t.hero.llm4}</span>
                  </li>
                </ul>
              </div>

              {/* TruthGuard Veritas Copilot */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 border-l-4 border-l-emerald-600">
                <h4 className="text-xs font-bold text-emerald-900 mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  {t.hero.tgTitle}
                </h4>
                <ul className="space-y-2.5 text-xs text-emerald-950/80">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.hero.tg1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.hero.tg2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.hero.tg3}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.hero.tg4}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECOND SECTION: 4. Complete Audit Report ================= */}
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
              <span>{t.footer.footnoteTitle}</span>
            </div>
            <p>
              <span className="font-mono text-slate-400 font-semibold">{t.footer.fn1Label}</span>
              {t.footer.fn1Text}
            </p>
            <p>
              <span className="font-mono text-slate-400 font-semibold">{t.footer.fn2Label}</span>
              {t.footer.fn2Text}
            </p>
            <p>
              <span className="font-mono text-slate-400 font-semibold">{t.footer.fn3Label}</span>
              {t.footer.fn3Text}
            </p>
          </div>

          {/* Section 2: Creator & Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs text-slate-500">
            {/* Left: Brand & Creator */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">{t.footer.brandName}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yuanbao-50 border border-yuanbao-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-yuanbao-800">
                <span>{t.footer.creatorLabel}</span>
                <span className="font-mono font-bold text-yuanbao-900">freshmanJ</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">{t.footer.brandSlogan}</span>
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
                <span>{t.footer.githubLink}</span>
              </a>
              <span>•</span>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-slate-800 transition cursor-pointer"
              >
                {t.footer.settingsLink}
              </button>
              <span>•</span>
              <span className="font-mono">Powered by Tencent Cloud WSA</span>
              <span>•</span>
              <span>{t.footer.copyright}</span>
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
