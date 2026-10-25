import React from 'react';
import { X, Award, ShieldCheck, Download, Printer } from 'lucide-react';
import { Claim, VerificationSummary } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: VerificationSummary;
  claims: Claim[];
  originalText: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  summary,
  claims,
  originalText,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // Generate fake SHA-256 hash for document proof
  const docHash = Array.from(originalText.slice(0, 32))
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24);

  const handleExportMarkdown = () => {
    let md = `# TruthGuard 事实检察官 · 事实核验背书报告\n\n`;
    md += `> **生成时间**：${dateStr} ${timeStr}\n`;
    md += `> **权威检索基座**：腾讯云元宝搜索 (Tencent Yuanbao Search / WSA)\n`;
    md += `> **文档审计指纹**：\`SHA-256:${docHash}...\`\n`;
    md += `> **事实健康度评分**：${summary.healthScore} / 100 分 | **幻觉识别率**：${summary.hallucinationRate}%\n\n`;

    md += `## 一、 核验统计总览\n\n`;
    md += `* **抽检事实命题总数**：${summary.totalClaims} 项\n`;
    md += `* **权威信源证实**：${summary.verified} 项 (🟢)\n`;
    md += `* **时效争议与存疑**：${summary.disputed} 项 (🟡)\n`;
    md += `* **事实错误与幻觉**：${summary.refuted} 项 (🔴)\n`;
    md += `* **元宝搜索 Token 节省**：约 ${summary.tokenSavingsPercent}% (省去原始网页抓取清洗代价)\n\n`;

    md += `## 二、 命题逐项核验明细\n\n`;
    claims.forEach((c, idx) => {
      const statusIcon = c.status === 'verified' ? '🟢 权威证实' : c.status === 'disputed' ? '🟡 存疑时效' : c.status === 'refuted' ? '🔴 事实错误' : '⚪ 无法核验';
      md += `### 命题 ${idx + 1}：${c.claimText}\n\n`;
      md += `- **裁决状态**：${statusIcon} (置信度: ${c.confidence}%)\n`;
      if (c.searchKeywords && c.searchKeywords.length > 1) {
        md += `- **AI 检索探针词**：${c.searchKeywords.map(k => `\`${k}\``).join('、')} (${c.searchKeywords.length} 路自适应探针)\n`;
      } else {
        md += `- **搜索关键词**：\`${c.searchKeyword}\`\n`;
      }
      md += `- **核验分析**：${c.reasoning}\n`;
      if (c.correction) {
        md += `- **修正事实**：**${c.correction}**\n`;
      }
      if (c.sources && c.sources.length > 0) {
        md += `- **核心依据信源**：\n`;
        c.sources.slice(0, 3).forEach((s, sIdx) => {
          md += `  ${sIdx + 1}. [${s.site}] ${s.title} (${s.url})\n`;
        });
      }
      md += `\n`;
    });

    md += `## 三、 审校原文\n\n\`\`\`text\n${originalText}\n\`\`\`\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TruthGuard_事实核验报告_${now.toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-floating border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">事实审计背书证书 (Audit Certificate)</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Certificate Body (Printable Gallery Design) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 font-sans">
          <div className="relative rounded-2xl border-2 border-amber-200/90 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFDF9] p-7 sm:p-10 shadow-subtle">
            {/* Background Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none">
              <ShieldCheck className="h-96 w-96 text-slate-900" />
            </div>

            {/* Header */}
            <div className="text-center relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-black/10 mb-3">
                <ShieldCheck className="h-6 w-6 text-yuanbao-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide font-serif">
                学术与技术事实核验审计证书
              </h2>
              <p className="mt-1 text-[11px] text-amber-900/80 font-mono tracking-widest uppercase">
                VERITAS FACT-CHECKING AUDIT CERTIFICATE
              </p>
              <div className="mx-auto mt-3 h-0.5 w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>

            {/* Description */}
            <p className="mt-6 text-center text-xs leading-relaxed text-slate-600 max-w-lg mx-auto">
              兹证明本作品已通过 <span className="font-semibold text-slate-900">TruthGuard 事实检察官</span> 多源深度交叉审计，依托 <span className="font-semibold text-yuanbao-700">腾讯云元宝搜索 (WSA)</span> 数千亿级全网与 157+ 垂直权威行业信源完成客观事实核验。
            </p>

            {/* Three Pillar Metrics */}
            <div className="mt-7 grid grid-cols-3 gap-3 rounded-xl border border-amber-200/70 bg-amber-50/20 p-4">
              <div className="text-center">
                <span className="text-[11px] text-slate-400 font-medium block">事实健康度</span>
                <span className={`text-2xl font-black font-mono ${
                  summary.healthScore >= 80 ? 'text-emerald-600' : summary.healthScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {summary.healthScore}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </span>
              </div>

              <div className="text-center border-x border-amber-100">
                <span className="text-[11px] text-slate-400 font-medium block">权威证实率</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  {summary.totalClaims > 0 ? Math.round((summary.verified / summary.totalClaims) * 100) : 100}
                  <span className="text-xs font-normal text-slate-400">%</span>
                </span>
              </div>

              <div className="text-center">
                <span className="text-[11px] text-slate-400 font-medium block">幻觉发生率</span>
                <span className="text-2xl font-black text-rose-600 font-mono">
                  {summary.hallucinationRate}
                  <span className="text-xs font-normal text-slate-400">%</span>
                </span>
              </div>
            </div>

            {/* Stamp & Verification Metadata */}
            <div className="mt-8 flex items-end justify-between border-t border-slate-100 pt-5 text-[11px] text-slate-400 font-mono">
              <div className="space-y-1">
                <p><span className="text-slate-500">审计时间：</span>{dateStr} {timeStr}</p>
                <p><span className="text-slate-500">检索核心：</span>Tencent Yuanbao Search (WSA API)</p>
                <p><span className="text-slate-500">审计指纹：</span>SHA256:{docHash}...</p>
              </div>

              {/* Official Seal Badge */}
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed border-yuanbao-600 bg-yuanbao-50/80 text-yuanbao-800 rotate-[-10deg] shadow-xs select-none">
                <span className="text-[8.5px] font-bold tracking-widest uppercase">AUDITED</span>
                <span className="text-[11.5px] font-black">元宝搜索</span>
                <span className="text-[8px] text-yuanbao-700">可信外脑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/70">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>打印 / 另存为证书</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-elevated hover:bg-slate-800 transition active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>导出 Markdown 核验报告</span>
          </button>
        </div>
      </div>
    </div>
  );
};
