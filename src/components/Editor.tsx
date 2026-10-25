import React, { useState, useRef, ChangeEvent } from 'react';
import { 
  Play, Pause, RotateCcw, FileText, CheckCircle2, Wand2, 
  Sparkles, BookMarked, Clock, Check, Upload, Globe2,
  Image as ImageIcon, AlertCircle, RefreshCw, X, Eye,
  FileCheck
} from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '../data/samples';
import { 
  Claim, SourceInputType, ExtractedMediaItem, 
  SourceInspectionTask, MultimodalExtractionTask 
} from '../types';
import { 
  SAMPLE_DOCUMENT_PRESETS, SAMPLE_URL_PRESETS,
  inspectDocumentFile, extractDocumentContent, inspectAndExtractUrl,
  DocumentSamplePreset, UrlSamplePreset
} from '../services/docExtractor';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  onVerify: () => void;
  isLoading: boolean;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  claims: Claim[];
  onInjectCitations: () => void;
  onApplyAllCorrections: () => void;
  // Multimodal source extensions
  inputType: SourceInputType;
  onInputTypeChange: (type: SourceInputType) => void;
  sourceNameOrUrl: string;
  onSourceNameOrUrlChange: (nameOrUrl: string) => void;
  uploadedFile: File | null;
  onFileUpload: (file: File | null) => void;
  extractedImages: ExtractedMediaItem[];
  onExtractedImagesChange: (images: ExtractedMediaItem[]) => void;
  inspectionTask?: SourceInspectionTask;
  onInspectionTaskChange: (task: SourceInspectionTask | undefined) => void;
  extractionTask?: MultimodalExtractionTask;
  onExtractionTaskChange: (task: MultimodalExtractionTask | undefined) => void;
  title?: string;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  onVerify,
  isLoading,
  isPaused = false,
  onPause,
  onResume,
  claims,
  onInjectCitations,
  onApplyAllCorrections,
  inputType,
  onInputTypeChange,
  sourceNameOrUrl,
  onSourceNameOrUrlChange,
  uploadedFile,
  onFileUpload,
  extractedImages,
  onExtractedImagesChange,
  inspectionTask,
  onInspectionTaskChange,
  extractionTask,
  onExtractionTaskChange,
  title,
}) => {
  const [urlInput, setUrlInput] = useState<string>(sourceNameOrUrl || '');
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<ExtractedMediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Text Preset selection
  const handleSelectSampleText = (sample: SamplePreset) => {
    onInputTypeChange('text');
    onChange(sample.content);
    onSourceNameOrUrlChange('');
    onFileUpload(null);
    onExtractedImagesChange([]);
    onInspectionTaskChange(undefined);
    onExtractionTaskChange(undefined);
    setParseError(null);
  };

  // 2. Document Preset selection
  const handleSelectDocumentPreset = (preset: DocumentSamplePreset) => {
    onInputTypeChange('document');
    onSourceNameOrUrlChange(preset.name);
    onChange(preset.content);
    onFileUpload(null);
    onExtractedImagesChange(preset.images);
    onInspectionTaskChange({
      status: 'done',
      passed: true,
      sourceType: 'document',
      titleOrName: preset.name,
      format: preset.format.toUpperCase(),
      fileSizeFormatted: preset.sizeFormatted,
      magicBytesValid: true,
      securitySummary: '预检通过：魔数结构匹配，未检测到恶意可执行宏',
      latencyMs: 35
    });
    onExtractionTaskChange({
      status: 'done',
      textLength: preset.content.length,
      paragraphCount: preset.content.split('\n\n').filter(Boolean).length,
      images: preset.images,
      latencyMs: 120
    });
    setParseError(null);
  };

  // 3. URL Preset selection
  const handleSelectUrlPreset = (preset: UrlSamplePreset) => {
    onInputTypeChange('url');
    setUrlInput(preset.url);
    onSourceNameOrUrlChange(preset.url);
    onChange(preset.content);
    onFileUpload(null);
    onExtractedImagesChange(preset.images);
    onInspectionTaskChange({
      status: 'done',
      passed: true,
      sourceType: 'url',
      titleOrName: preset.title,
      format: 'HTML5 (text/html)',
      httpStatus: 200,
      sslSecure: true,
      magicBytesValid: true,
      securitySummary: `连通性检测通过：HTTP 200 OK · TLS 1.3 · 来源域 [${preset.domain}]`,
      latencyMs: 48
    });
    onExtractionTaskChange({
      status: 'done',
      documentTitle: preset.title,
      textLength: preset.content.length,
      paragraphCount: preset.content.split('\n\n').filter(Boolean).length,
      images: preset.images,
      latencyMs: 180
    });
    setParseError(null);
  };

  // 4. Local File Upload & Real-time Inspection & Extraction
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    setParseError(null);
    onFileUpload(file);
    onSourceNameOrUrlChange(file.name);

    try {
      const inspectRes = await inspectDocumentFile(file);
      onInspectionTaskChange(inspectRes);

      if (!inspectRes.passed) {
        throw new Error(inspectRes.error || '文档未通过格式可用性校验');
      }

      const extractRes = await extractDocumentContent(file);
      onChange(extractRes.text);
      onExtractedImagesChange(extractRes.images);
      onExtractionTaskChange({
        status: 'done',
        textLength: extractRes.text.length,
        paragraphCount: extractRes.paragraphCount,
        images: extractRes.images,
        latencyMs: extractRes.latencyMs
      });
    } catch (err: any) {
      setParseError(err.message || '文档解析失败，请检查文件格式是否受损');
    } finally {
      setIsParsingDoc(false);
    }
  };

  // 5. URL Fetch & Real-time Inspection & Extraction
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;

    setIsFetchingUrl(true);
    setParseError(null);
    onSourceNameOrUrlChange(urlInput.trim());

    try {
      const res = await inspectAndExtractUrl(urlInput.trim());
      onInspectionTaskChange(res.inspection);

      if (!res.inspection.passed) {
        throw new Error(res.inspection.error || '网页无法访问或未通过合规性校验');
      }

      onChange(res.text);
      onExtractedImagesChange(res.extraction.images);
      onExtractionTaskChange(res.extraction);
    } catch (err: any) {
      setParseError(err.message || '网页抓取失败，请检查链接可达性');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // 6. Explicit Clear Manuscript action
  const handleClear = () => {
    onChange('');
    onFileUpload(null);
    onSourceNameOrUrlChange('');
    onExtractedImagesChange([]);
    onInspectionTaskChange(undefined);
    onExtractionTaskChange(undefined);
    setUrlInput('');
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const refutedCount = claims.filter(c => c.status === 'refuted' || c.status === 'disputed').length;
  const verifiedCount = claims.filter(c => c.status === 'verified').length;
  const wordCount = content.trim().length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 400));
  const isDocOrUrl = inputType === 'document' || inputType === 'url';

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white shadow-subtle overflow-hidden font-sans">
      {/* Area 1: Top Bar with Mode Buttons & Prominent Clear Button */}
      <div className="border-b border-slate-100 bg-[#FAFAFA] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
        {/* Left: Section Identity & Live Word Count */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white shadow-2xs">
            <FileText className="h-3.5 w-3.5 text-yuanbao-400" />
          </div>
          <h3 className="text-xs font-bold text-slate-800 tracking-tight whitespace-nowrap">
            {title || '待检查原稿'}
          </h3>
          <div className="hidden sm:flex items-center gap-1.5 pl-1.5 text-[11px] text-slate-400 font-mono">
            <span>•</span>
            <span className="font-semibold text-slate-600">{wordCount} 字</span>
            {extractedImages.length > 0 && (
              <>
                <span>•</span>
                <span className="text-teal-700 font-semibold">{extractedImages.length} 图</span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" /> 约 {estimatedReadTime} 分钟
            </span>
          </div>
        </div>

        {/* Right: Three Mode Selection Buttons + Explicit Clear Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Three Mode Selection Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onInputTypeChange('text');
                setParseError(null);
              }}
              disabled={isLoading}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                inputType === 'text'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="切换为文字录入模式，支持直接键盘键入或粘贴文章长文"
            >
              <FileText className="h-3 w-3" />
              <span>文字录入</span>
            </button>

            <button
              onClick={() => {
                onInputTypeChange('document');
                setParseError(null);
              }}
              disabled={isLoading}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                inputType === 'document'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="切换为文档导入模式，支持 Word (.docx)、PDF (.pdf)、TXT 文档"
            >
              <Upload className="h-3 w-3" />
              <span>文档导入</span>
            </button>

            <button
              onClick={() => {
                onInputTypeChange('url');
                setParseError(null);
              }}
              disabled={isLoading}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                inputType === 'url'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="切换为网页链接模式，输入 URL 自动穿透抓取网页正文与配图"
            >
              <Globe2 className="h-3 w-3" />
              <span>网页链接</span>
            </button>
          </div>

          <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

          {/* Explicit Clear Manuscript Button */}
          <button
            onClick={handleClear}
            disabled={isLoading || (!content && !uploadedFile && !sourceNameOrUrl && !urlInput)}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200/90 bg-rose-50/70 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition shadow-2xs disabled:opacity-35 disabled:pointer-events-none cursor-pointer active:scale-95"
            title="一键清空原稿文本、重置导入文档或网页链接"
          >
            <RotateCcw className="h-3 w-3 text-rose-600" />
            <span>清空原稿</span>
          </button>
        </div>
      </div>

      {/* Area 2: Single-line Context Toolbar (Adapts to Active Mode cleanly without tab-switching) */}
      {inputType === 'text' && (
        <div className="border-b border-slate-100 bg-[#FAFAFA]/70 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">快捷样例:</span>
            {SAMPLE_PRESETS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSampleText(sample)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
              >
                {sample.tag.split('/')[0].trim()}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            直接在下方编辑区键入或粘贴待核验草稿
          </span>
        </div>
      )}

      {inputType === 'document' && (
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* File Picker & Upload trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".docx,.doc,.pdf,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isParsingDoc}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="h-3 w-3 text-slate-600" />
              <span>{uploadedFile || sourceNameOrUrl ? '更换本地文档' : '选择本地 Word / PDF / TXT'}</span>
            </button>

            {isParsingDoc && (
              <span className="inline-flex items-center gap-1 text-xs text-sky-700 font-medium animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>正在校验魔数并提取图文...</span>
              </span>
            )}

            {(sourceNameOrUrl || uploadedFile) && !isParsingDoc && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 text-xs font-medium text-sky-900 truncate max-w-xs">
                <FileCheck className="h-3.5 w-3.5 text-sky-600 flex-shrink-0" />
                <span className="truncate font-semibold">{uploadedFile?.name || sourceNameOrUrl}</span>
                {inspectionTask?.fileSizeFormatted && (
                  <span className="text-[10.5px] text-sky-600 font-mono flex-shrink-0">({inspectionTask.fileSizeFormatted})</span>
                )}
              </div>
            )}
          </div>

          {/* Document Sample Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">样例文档:</span>
            {SAMPLE_DOCUMENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectDocumentPreset(preset)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
              >
                {preset.tag.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>
      )}

      {inputType === 'url' && (
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* URL Input Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-xl">
            <div className="relative flex-1 flex items-center">
              <Globe2 className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                placeholder="键入待审校的公网文章或论文 URL，如 https://..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-yuanbao-500 focus:outline-none focus:ring-1 focus:ring-yuanbao-500 font-mono shadow-2xs"
              />
              {urlInput && (
                <button
                  onClick={() => setUrlInput('')}
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <button
              onClick={handleFetchUrl}
              disabled={isFetchingUrl || !urlInput.trim()}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-95 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              {isFetchingUrl ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>抓取中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-yuanbao-400" />
                  <span>提取网页</span>
                </>
              )}
            </button>
          </div>

          {/* URL Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">样例链接:</span>
            {SAMPLE_URL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectUrlPreset(preset)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {preset.tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parse Error Notice */}
      {parseError && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-1.5 flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Extracted Images Ribbon (Seamlessly visible alongside text, no tab switching!) */}
      {extractedImages.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-100 bg-teal-50/40 flex items-center justify-between gap-2 overflow-x-auto select-none flex-shrink-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-100/90 px-2 py-0.5 text-[11px] font-bold text-teal-800">
              <ImageIcon className="h-3 w-3 text-teal-700" />
              提取图文 ({extractedImages.length} 张)
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">点击插图可放大查看:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {extractedImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedLightboxImage(img)}
                className="group relative flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-2 py-1 hover:border-teal-400 hover:shadow-2xs transition cursor-pointer flex-shrink-0"
                title={img.caption || '查看高清插图'}
              >
                <img src={img.url} alt={img.caption || 'preview'} className="h-5 w-5 rounded object-cover" />
                <span className="text-[11px] font-medium text-slate-700 max-w-[130px] truncate">
                  {img.caption || `插图 #${idx + 1}`}
                </span>
                <Eye className="h-3 w-3 text-slate-400 group-hover:text-teal-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Content Area (Clean, single-focused textarea always visible) */}
      <div className="relative flex-1 min-h-0 p-4 sm:p-5 overflow-hidden flex flex-col bg-white">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            inputType === 'document'
              ? "在此直接查看或修改从 Word/PDF/TXT 文档中解析出的正文...&#10;&#10;✦ 系统将先执行：1. 格式与可用性预检 → 2. 多模态图文提取 → 3. 命题智能拆解&#10;✦ 随后毫秒级调用腾讯元宝搜索千亿信源进行事实交叉审校"
              : inputType === 'url'
              ? "在此直接查看或修改从网页链接中抓取出的文章正文...&#10;&#10;✦ 系统将先执行：1. 协议与可用性预检 → 2. 多模态图文提取 → 3. 命题智能拆解&#10;✦ 随后毫秒级调用腾讯元宝搜索千亿信源进行事实交叉审校"
              : "在此键入或粘贴需进行事实核验的技术博客、论文草稿、商业分析或大模型初稿...&#10;&#10;✦ 系统将自动提取可客观证伪命题&#10;✦ 调用腾讯云元宝搜索千亿信源进行毫秒级交叉审校&#10;✦ 自动给出红绿灯置信度裁决并生成规范引用"
          }
          className="flex-1 min-h-0 w-full resize-none border-0 bg-transparent text-[13.5px] leading-relaxed text-slate-800 placeholder-slate-400/90 focus:outline-none focus:ring-0 font-sans selection:bg-yuanbao-100 selection:text-yuanbao-900 overflow-y-auto"
        />
      </div>

      {/* Editor Bottom Action Bar */}
      <div className="border-t border-slate-100 bg-[#FAFAFA]/90 backdrop-blur-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
        {/* Post-Audit Quick Actions */}
        <div className="flex items-center gap-2">
          {claims.length > 0 && verifiedCount > 0 && (
            <button
              onClick={onInjectCitations}
              disabled={isLoading}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/90 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-xs active:scale-[0.98] cursor-pointer"
              title="根据元宝搜索核验信源，在原文末尾自动追加学术引用角标与信源清单"
            >
              <BookMarked className="h-3.5 w-3.5 text-emerald-600 group-hover:scale-110 transition" />
              <span>注入引用角标</span>
            </button>
          )}

          {/* 一键修正全部幻觉 (暂先隐藏) */}
          {/* {claims.length > 0 && refutedCount > 0 && (
            <button
              onClick={onApplyAllCorrections}
              disabled={isLoading}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-rose-200/90 bg-rose-50/80 px-2.5 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition shadow-xs active:scale-[0.98] cursor-pointer"
              title="根据权威信源证据，一键将文中有争议或虚假陈述替换为官方修正事实"
            >
              <Wand2 className="h-3.5 w-3.5 text-rose-600 group-hover:rotate-12 transition" />
              <span>一键修正全部幻觉 ({refutedCount})</span>
            </button>
          )} */}
        </div>

        {/* Primary Audit Action CTA */}
        <button
          onClick={() => {
            if (isPaused) {
              onResume?.();
            } else if (isLoading) {
              onPause?.();
            } else {
              onVerify();
            }
          }}
          disabled={!isLoading && !content.trim()}
          className={`group ml-auto inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md ring-1 ring-white/20 transition-all duration-200 active:scale-[0.98] ${
            isPaused
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 shadow-emerald-600/30 hover:shadow-lg hover:shadow-cyan-500/40 ring-2 ring-emerald-400/60 hover:scale-[1.02] cursor-pointer'
              : isLoading
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-amber-600 hover:via-amber-500 hover:to-rose-500 shadow-emerald-600/25 hover:shadow-amber-500/35 hover:scale-[1.02] cursor-pointer'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 shadow-emerald-600/25 hover:shadow-lg hover:shadow-cyan-500/35 hover:scale-[1.02] disabled:opacity-40 disabled:shadow-none disabled:pointer-events-none disabled:scale-100 cursor-pointer'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5 fill-white text-white" />
              <span>继续检查</span>
            </>
          ) : isLoading ? (
            <>
              <Sparkles className="h-3.5 w-3.5 animate-spin text-white group-hover:hidden" />
              <Pause className="h-3.5 w-3.5 fill-white text-white hidden group-hover:inline-block" />
              <span className="group-hover:hidden">正在检查中...</span>
              <span className="hidden group-hover:inline">暂停检查</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-white text-white" />
              <span>
                {claims.length > 0 
                  ? '重新检查' 
                  : isDocOrUrl 
                  ? '开始检查 (预检 → 提取 → 审校)' 
                  : '开始检查'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Lightbox Modal for Extracted Image */}
      {selectedLightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div 
            className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-4 overflow-hidden border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 truncate">
                {selectedLightboxImage.caption || '抽取的多模态插图预览'}
              </h4>
              <button 
                onClick={() => setSelectedLightboxImage(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-3 flex items-center justify-center bg-slate-950/5 rounded-xl mt-2 overflow-hidden max-h-[60vh]">
              <img 
                src={selectedLightboxImage.url} 
                alt={selectedLightboxImage.caption || 'preview'} 
                className="max-h-[55vh] max-w-full object-contain rounded-lg" 
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono flex items-center justify-between">
              <span>信源多模态图表 · 支持原稿事实与图表核验</span>
              <span className="text-slate-400">点击任意空白处关闭</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
