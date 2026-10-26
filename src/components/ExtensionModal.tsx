import React, { useState } from 'react';
import { 
  X, Puzzle, Download, CheckCircle2, ArrowRight, 
  ExternalLink, Sparkles, ShieldCheck, FileText, Monitor, Check, Github
} from 'lucide-react';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/truthguard-extension.zip';
    link.download = 'truthguard-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-white shadow-floating border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Puzzle className="h-4.5 w-4.5 text-yuanbao-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  TruthGuard 浏览器事实核验插件
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Chrome & Edge MV3 Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                基于腾讯元宝搜索 · 随时随地选中文本一键核验、全屏工作过程树与 PDF 报告导出
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
            title="关闭窗口 (Esc)"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Hero Banner with Instant Download Button */}
          <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-emerald-200 px-3 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-2xs">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>划选即核验 · 终结阅读与创作中的虚假信息</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                将 TruthGuard 事实外脑装进您的浏览器
              </h2>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                在知乎、微信公众号、知网、新闻门户或任意网页划选文本，轻量工作态浮窗自动展开，支持一键点击小箭头查看全屏事实穿透树，核验完成直接导出 PDF 报告！
              </p>
            </div>

            {/* Download CTA Button */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 text-xs font-bold shadow-elevated transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>已触发下载！</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 text-yuanbao-400" />
                    <span>一键下载插件包 (.zip)</span>
                  </>
                )}
              </button>
              <span className="text-[10px] font-mono text-slate-400">
                truthguard-extension.zip (~35 KB)
              </span>
            </div>
          </div>

          {/* 3 Pillars of Extension */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-2">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                1. 选中文本即检 & 悬浮工作窗
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                在网页内划选任意陈述，出现「🛡️ 事实核验」小按钮。右下角轻量浮窗实时呈现元宝千亿检索与仲裁进度。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 mb-2">
                <Monitor className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                2. 点击小箭头展开全屏工作树
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                在浮窗中点击小箭头，即可平滑展开全屏工作过程拓扑树（与本网页工作树完全一致），支持画布缩放与拖拽。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 mb-2">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                3. 一键展开报告 & 导出 PDF
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                审校完成后小浮窗自动变为「查看报告」按钮，点击弹出详细仲裁与信源证据，可一键下载为高清 PDF 报告。
              </p>
            </div>
          </div>

          {/* 4-Step Installation Guide */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-mono">
                  i
                </span>
                <span>Chrome / Edge 浏览器 30 秒免翻墙极简安装步骤</span>
              </h4>
              <span className="text-[10.5px] font-mono text-slate-400">
                支持 Chrome、Edge、Brave、360极速等所有 Chromium 浏览器
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      第 1 步
                    </span>
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">下载并解压</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    点击上方按钮下载并解压 <code className="bg-slate-100 text-slate-800 px-1 rounded">truthguard-extension.zip</code> 到任意文件夹。
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      第 2 步
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">打开扩展中心</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    地址栏输入：<br />
                    <code className="text-emerald-700 font-mono text-[10px]">chrome://extensions</code><br />
                    或 <code className="text-emerald-700 font-mono text-[10px]">edge://extensions</code>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      第 3 步
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">开启开发者模式</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    打开右上角「开发者模式」，点击左上角「加载已解压的扩展程序」，选择解压后的文件夹即可！
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      第 4 步
                    </span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">在任意网页体验</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                    划选任意网页文本，点击浮现的 TruthGuard 图标或右键菜单，开启全屏工作树与事实核验！
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="text-[11px] text-slate-400">
            <span>技术基座：腾讯云元宝搜索 (WSA API) • 创作者: freshmanJ</span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/FreshmanJ/TruthGuard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold transition cursor-pointer"
            >
              <Github className="h-3.5 w-3.5 text-slate-800" />
              <span>GitHub 源码</span>
            </a>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>下载插件压缩包</span>
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-2 text-xs font-medium transition cursor-pointer"
            >
              <span>我知道了</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
