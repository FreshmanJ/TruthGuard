import React, { useState, useRef, ChangeEvent } from 'react';
import { 
  Play, Pause, RotateCcw, FileText, Upload, Globe2,
  Image as ImageIcon, AlertCircle, RefreshCw, X, Eye,
  FileCheck, BookMarked, Clock, Sparkles
} from 'lucide-react';
import { getSamplePresets, SamplePreset } from '../data/samples';
import { 
  Claim, SourceInputType, ExtractedMediaItem, 
  SourceInspectionTask, MultimodalExtractionTask 
} from '../types';
import { 
  SAMPLE_DOCUMENT_PRESETS, SAMPLE_URL_PRESETS,
  inspectDocumentFile, extractDocumentContent, inspectAndExtractUrl,
  DocumentSamplePreset, UrlSamplePreset
} from '../services/docExtractor';
import { useI18n } from '../i18n/context';

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
  const { lang, t, interpolate } = useI18n();
  const [urlInput, setUrlInput] = useState<string>(sourceNameOrUrl || '');
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<ExtractedMediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = getSamplePresets(lang);

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
      securitySummary: lang === 'en' 
        ? 'Pre-check passed: Magic bytes matched, no malicious executable macros detected' 
        : '预检通过：魔数结构匹配，未检测到恶意可执行宏',
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
      securitySummary: lang === 'en'
        ? `Connectivity verified: HTTP 200 OK · TLS 1.3 · Origin [${preset.domain}]`
        : `连通性检测通过：HTTP 200 OK · TLS 1.3 · 来源域 [${preset.domain}]`,
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
        throw new Error(inspectRes.error || (lang === 'en' ? 'Document failed format & integrity check' : '文档未通过格式可用性校验'));
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
      setParseError(err.message || (lang === 'en' ? 'Document parsing failed, please check file integrity' : '文档解析失败，请检查文件格式是否受损'));
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
        throw new Error(res.inspection.error || (lang === 'en' ? 'Webpage inaccessible or failed security check' : '网页无法访问或未通过合规性校验'));
      }

      onChange(res.text);
      onExtractedImagesChange(res.extraction.images);
      onExtractionTaskChange(res.extraction);
    } catch (err: any) {
      setParseError(err.message || (lang === 'en' ? 'Webpage crawl failed, please verify the URL' : '网页抓取失败，请检查链接可达性'));
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

  const verifiedCount = claims.filter(c => c.status === 'verified').length;
  const wordCount = content.trim().length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / (lang === 'en' ? 800 : 400)));
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
            {title || t.editor.title}
          </h3>
          <div className="hidden sm:flex items-center gap-1.5 pl-1.5 text-[11px] text-slate-400 font-mono">
            <span>•</span>
            <span className="font-semibold text-slate-600">{wordCount} {t.editor.wordCountSuffix}</span>
            {extractedImages.length > 0 && (
              <>
                <span>•</span>
                <span className="text-teal-700 font-semibold">{extractedImages.length} {t.editor.imageCountSuffix}</span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" /> {t.editor.readTimePrefix} {estimatedReadTime} {t.editor.readTimeSuffix}
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
              title={t.editor.modeTextTitle}
            >
              <FileText className="h-3 w-3" />
              <span>{t.editor.modeText}</span>
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
              title={t.editor.modeDocTitle}
            >
              <Upload className="h-3 w-3" />
              <span>{t.editor.modeDoc}</span>
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
              title={t.editor.modeUrlTitle}
            >
              <Globe2 className="h-3 w-3" />
              <span>{t.editor.modeUrl}</span>
            </button>
          </div>

          <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

          {/* Explicit Clear Manuscript Button */}
          <button
            onClick={handleClear}
            disabled={isLoading || (!content && !uploadedFile && !sourceNameOrUrl && !urlInput)}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200/90 bg-rose-50/70 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition shadow-2xs disabled:opacity-35 disabled:pointer-events-none cursor-pointer active:scale-95"
            title={t.editor.clearDraftTitle}
          >
            <RotateCcw className="h-3 w-3 text-rose-600" />
            <span>{t.editor.clearDraft}</span>
          </button>
        </div>
      </div>

      {/* Area 2: Single-line Context Toolbar */}
      {inputType === 'text' && (
        <div className="border-b border-slate-100 bg-[#FAFAFA]/70 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">{t.editor.quickSamples}</span>
            {samplePresets.map((sample) => (
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
            {t.editor.textModeHint}
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
              <span>{uploadedFile || sourceNameOrUrl ? t.editor.changeDocBtn : t.editor.chooseDocBtn}</span>
            </button>

            {isParsingDoc && (
              <span className="inline-flex items-center gap-1 text-xs text-sky-700 font-medium animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>{t.editor.parsingDocNotice}</span>
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
            <span className="text-[11px] text-slate-400 font-medium">{t.editor.sampleDocLabel}</span>
            {SAMPLE_DOCUMENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectDocumentPreset(preset)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
              >
                {lang === 'en' ? preset.format.toUpperCase() + ' Doc' : preset.tag.split('(')[0].trim()}
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
                placeholder={t.editor.urlPlaceholder}
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
                  <span>{t.editor.fetchingUrlBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-yuanbao-400" />
                  <span>{t.editor.fetchUrlBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* URL Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">{t.editor.sampleUrlLabel}</span>
            {SAMPLE_URL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectUrlPreset(preset)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200/80 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {lang === 'en' ? preset.domain : preset.tag}
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

      {/* Extracted Images Ribbon */}
      {extractedImages.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-100 bg-teal-50/40 flex items-center justify-between gap-2 overflow-x-auto select-none flex-shrink-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-100/90 px-2 py-0.5 text-[11px] font-bold text-teal-800">
              <ImageIcon className="h-3 w-3 text-teal-700" />
              {interpolate(t.editor.extractedMedia, { count: extractedImages.length })}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">{t.editor.clickToViewImg}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {extractedImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedLightboxImage(img)}
                className="group relative flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-2 py-1 hover:border-teal-400 hover:shadow-2xs transition cursor-pointer flex-shrink-0"
                title={img.caption || t.editor.viewHDExtension}
              >
                <img src={img.url} alt={img.caption || 'preview'} className="h-5 w-5 rounded object-cover" />
                <span className="text-[11px] font-medium text-slate-700 max-w-[130px] truncate">
                  {img.caption || `${lang === 'en' ? 'Figure' : '插图'} #${idx + 1}`}
                </span>
                <Eye className="h-3 w-3 text-slate-400 group-hover:text-teal-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative flex-1 min-h-0 p-4 sm:p-5 overflow-hidden flex flex-col bg-white">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            inputType === 'document'
              ? t.editor.placeholderDoc
              : inputType === 'url'
              ? t.editor.placeholderUrl
              : t.editor.placeholderText
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
              title={t.editor.injectCitationsTitle}
            >
              <BookMarked className="h-3.5 w-3.5 text-emerald-600 group-hover:scale-110 transition" />
              <span>{t.editor.injectCitationsBtn}</span>
            </button>
          )}
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
              <span>{t.editor.resumeCheckBtn}</span>
            </>
          ) : isLoading ? (
            <>
              <Sparkles className="h-3.5 w-3.5 animate-spin text-white group-hover:hidden" />
              <Pause className="h-3.5 w-3.5 fill-white text-white hidden group-hover:inline-block" />
              <span className="group-hover:hidden">{t.editor.checkingBtn}</span>
              <span className="hidden group-hover:inline">{t.editor.pauseCheckBtn}</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-white text-white" />
              <span>
                {claims.length > 0 
                  ? t.editor.recheckBtn 
                  : isDocOrUrl 
                  ? t.editor.startCheckWithPrecheckBtn 
                  : t.editor.startCheckBtn}
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
                {selectedLightboxImage.caption || t.editor.lightboxTitle}
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
              <span>{t.editor.lightboxHint}</span>
              <span className="text-slate-400">{t.editor.lightboxCloseHint}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
