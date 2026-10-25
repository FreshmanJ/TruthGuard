export type ClaimStatus = 'pending' | 'verified' | 'disputed' | 'refuted' | 'unverifiable';

export type ClaimCategory = 'numeric' | 'version' | 'temporal' | 'policy' | 'scientific' | 'entity' | 'general';

export interface YuanbaoSource {
  title: string;
  url: string;
  site: string;
  favicon?: string;
  date?: string;
  score?: number;
  passage: string;
  pics?: Array<{ caption?: string; origin_url?: string }>;
}

export interface Claim {
  id: string;
  claimText: string;
  category: ClaimCategory;
  searchKeyword: string;
  searchKeywords?: string[];    // AI 判定推演的多路探针搜索词列表 (1~3 组)
  status: ClaimStatus;
  confidence: number;
  reasoning: string;
  correction?: string;
  citationFootnote?: string;
  sources: YuanbaoSource[];
  // 前后因果与上下文感知增强
  contextSnippet?: string;      // 原文前后上下文语境
  causalPremise?: string;       // 蕴含的因果关系 / 前置条件 (如: "因[前置事件A]导致[结果B]")
  isCausalClaim?: boolean;      // 是否包含因果推论或归因断言
}

export interface VerificationSummary {
  totalClaims: number;
  verified: number;
  disputed: number;
  refuted: number;
  unverifiable: number;
  healthScore: number;
  hallucinationRate: number;
  yuanbaoTokensEstimated: number;
  rawWebTokensEstimated: number;
  tokenSavingsPercent: number;
  elapsedMs: number;
}

export interface UserSettings {
  yuanbaoApiKey: string;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  autoCitationFormat: 'gbt7714' | 'ieee' | 'footnote';
  searchCount: number;
  enableStreaming: boolean;
  reasoningEffort: 'none' | 'low' | 'medium' | 'high' | 'max';
}

export const DEFAULT_SETTINGS: UserSettings = {
  yuanbaoApiKey: '',
  aiApiKey: '',
  aiBaseUrl: 'https://token.sensenova.cn/v1/chat/completions',
  aiModel: 'sensenova-6.8-flash-lite',
  autoCitationFormat: 'footnote',
  searchCount: 10,
  enableStreaming: true,
  reasoningEffort: 'low',
};

/* ================= Real-time Agent Workflow Types ================= */

export type SourceInputType = 'text' | 'document' | 'url';

export interface ExtractedMediaItem {
  id: string;
  url: string;
  caption?: string;
  type?: 'image' | 'chart' | 'table';
  sizeFormatted?: string;
}

export interface SourceInspectionTask {
  status: 'pending' | 'inspecting' | 'done' | 'failed';
  passed: boolean;
  sourceType: SourceInputType;
  titleOrName: string;
  format?: string;
  fileSizeFormatted?: string;
  httpStatus?: number;
  sslSecure?: boolean;
  magicBytesValid?: boolean;
  securitySummary?: string;
  latencyMs?: number;
  error?: string;
}

export interface MultimodalExtractionTask {
  status: 'pending' | 'extracting' | 'done' | 'failed';
  textLength?: number;
  paragraphCount?: number;
  images: ExtractedMediaItem[];
  latencyMs?: number;
  documentTitle?: string;
  error?: string;
}

export type WorkflowStage = 
  | 'idle' 
  | 'inspecting'        // 来源与格式预检 (仅文档或链接)
  | 'extracting_media'  // 多模态图文智能提取 (仅文档或链接)
  | 'extracting'        // 命题语义长程拆解
  | 'searching'         // 腾讯元宝搜索穿透
  | 'verifying'         // 多源证据交叉裁决
  | 'synthesizing'      // 报告与证书生成
  | 'completed' 
  | 'paused' 
  | 'aborted' 
  | 'error';

export type APIErrorKind = 'timeout' | 'auth' | 'rate_limit' | 'server' | 'client' | 'network' | 'degraded';

export interface CategorizedAPIError {
  kind: APIErrorKind;
  statusCode?: number;
  message: string;
  userHint: string;
  isRetryable: boolean;
}

export interface WorkflowLog {
  id: string;
  time: string;
  stage: WorkflowStage;
  message: string;
  type: 'info' | 'search' | 'success' | 'warn' | 'error' | 'inspect' | 'extract' | 'thinking';
  errorKind?: APIErrorKind;
  meta?: any;
  isThinking?: boolean;
  fullReasoning?: string;
  isThinkingActive?: boolean;
}

export interface WorkflowSearchProbeItem {
  index: number;
  query: string;
  status: 'pending' | 'searching' | 'retrying' | 'done' | 'failed';
  sourcesCount?: number;
  topSites?: string[];
  latencyMs?: number;
  error?: string;
}

export interface WorkflowSearchTask {
  claimId: string;
  query: string;
  queries?: string[];           // 多路探针检索词列表
  probes?: WorkflowSearchProbeItem[]; // 各路探针分叉执行明细
  status: 'pending' | 'searching' | 'retrying' | 'done' | 'failed';
  sourcesCount: number;
  topSites: string[];
  latencyMs: number;
  retryCount?: number;
  retryReason?: string;
  errorKind?: APIErrorKind;
}

export interface WorkflowArbitrationTask {
  claimId: string;
  claimText: string;
  status: 'pending' | 'verifying' | 'retrying' | 'done';
  verdict?: ClaimStatus;
  confidence?: number;
  reasoning?: string;
  retryCount?: number;
  errorKind?: APIErrorKind;
  contextSnippet?: string;
  causalPremise?: string;
  isCausalClaim?: boolean;
}

export interface WorkflowState {
  stage: WorkflowStage;
  currentStepIndex: number; // 文档/链接模式: 0: 预检, 1: 图文提取, 2: 命题提取, 3: 元宝检索, 4: 证据比对, 5: 报告生成
  inputType: SourceInputType;
  sourceNameOrUrl?: string;
  inspectionTask?: SourceInspectionTask;
  extractionTask?: MultimodalExtractionTask;
  extractedClaims: Array<{ 
    id: string; 
    claimText: string; 
    category: ClaimCategory; 
    searchKeyword: string;
    searchKeywords?: string[];
    contextSnippet?: string;
    causalPremise?: string;
    isCausalClaim?: boolean;
  }>;
  searchTasks: WorkflowSearchTask[];
  arbitrationTasks: WorkflowArbitrationTask[];
  logs: WorkflowLog[];
  elapsedMs: number;
  isPaused: boolean;
}

