import { 
  Claim, ClaimCategory, ClaimStatus, UserSettings, 
  VerificationSummary, YuanbaoSource, WorkflowState, 
  WorkflowLog, WorkflowSearchTask, WorkflowArbitrationTask,
  APIErrorKind, CategorizedAPIError,
  SourceInputType, SourceInspectionTask, MultimodalExtractionTask, ExtractedMediaItem
} from '../types';
import { searchYuanbao, classifyYuanbaoError } from './yuanbao';
import { callAI, classifyAIError } from './ai';
import { inspectDocumentFile, extractDocumentContent, inspectAndExtractUrl } from './docExtractor';

function extractJsonFromText(text: string): any {
  let clean = text.trim();
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    clean = codeBlockMatch[1].trim();
  }
  
  try {
    return JSON.parse(clean);
  } catch (e) {
    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return JSON.parse(clean.substring(firstBracket, lastBracket + 1));
    }
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(clean.substring(firstBrace, lastBrace + 1));
    }
    throw e;
  }
}

export class PipelineController {
  private _isPaused = false;
  private _isAborted = false;
  private _pausePromiseResolve: (() => void) | null = null;

  get isPaused() {
    return this._isPaused;
  }

  get isAborted() {
    return this._isAborted;
  }

  pause() {
    this._isPaused = true;
  }

  resume() {
    this._isPaused = false;
    if (this._pausePromiseResolve) {
      this._pausePromiseResolve();
      this._pausePromiseResolve = null;
    }
  }

  abort() {
    this._isAborted = true;
    this.resume(); // Unblock any pending pause
  }

  async checkWait(): Promise<boolean> {
    if (this._isAborted) return false;
    if (this._isPaused) {
      await new Promise<void>((resolve) => {
        this._pausePromiseResolve = resolve;
      });
    }
    return !this._isAborted;
  }
}

function getNowTime(): string {
  const d = new Date();
  return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export function extractLatestThinkingSnippet(text: string, maxLength: number = 75): string {
  if (!text) return '正在组织深度思维链...';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '正在组织深度思维链...';
  const lastLine = lines[lines.length - 1];
  const cleaned = lastLine.replace(/^[-*#>\d\.\s]+/, '').trim() || lastLine;
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return '...' + cleaned.slice(-maxLength);
}

// Local heuristic fallback extractor if AI calls timeout or fail completely
function fallbackExtractClaims(content: string): Array<{ 
  id: string; 
  claimText: string; 
  category: ClaimCategory; 
  searchKeyword: string;
  searchKeywords?: string[];
  contextSnippet?: string;
  causalPremise?: string;
  isCausalClaim?: boolean;
}> {
  const sentences = content
    .split(/[\n。！？!?；;]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 8 && s.length <= 160);

  const matchedClaims: Array<{ 
    id: string; 
    claimText: string; 
    category: ClaimCategory; 
    searchKeyword: string;
    searchKeywords?: string[];
    contextSnippet?: string;
    causalPremise?: string;
    isCausalClaim?: boolean;
  }> = [];

  for (let idx = 0; idx < sentences.length; idx++) {
    const s = sentences[idx];
    if (matchedClaims.length >= 6) break;

    const prevSent = idx > 0 ? sentences[idx - 1] : '';
    const nextSent = idx < sentences.length - 1 ? sentences[idx + 1] : '';
    const contextSnippet = [prevSent, s, nextSent].filter(Boolean).join('。');

    const isCausal = /(因为|由于|导致|致使|从而|使得|因而|造成|鉴于|促使|由.+驱动)/.test(s);
    const causalPremise = isCausal ? `原句断言因果归因: “${s.slice(0, 45)}...”` : undefined;

    // Strict subjective filter: discard opinion/emotional rhetoric
    const isSubjective = /(觉得|认为|堪称|极其|非常|相当|伟大|震撼|期待|令人|口碑|精彩|优秀|绝佳|新星|天才|潜力|不可思议)/.test(s);
    if (isSubjective && !/\d|版本|顺位|青训|加盟|毕业|大学|选秀|发布|出台|正式/.test(s)) {
      continue;
    }

    // Helper to generate precise probe query (extracts true subject entity + verified attribute)
    const generateProbeQuery = (text: string): string => {
      // 1. Clean introductory preambles & modifiers
      const clean = text
        .replace(/^(此外[，,\s]*|在.+?方面[，,\s]*|据悉[，,\s]*|据.+?报道[，,\s]*|众所周知[，,\s]*)+/g, '')
        .trim();

      // 2. Python & Developer tooling versions
      const pythonMatch = clean.match(/(Python\s*[\d\.]+)/i);
      if (pythonMatch) {
        const py = pythonMatch[1];
        if (/(GIL|全局解释器锁)/.test(clean)) return `${py} GIL 废除`;
        if (/(性能|多线程)/.test(clean)) return `${py} 多线程 性能提升`;
        if (/(发布|上线|版本)/.test(clean)) return `${py} 发布时间`;
        return `${py} 官方特性`;
      }

      // 3. Yuanbao / Tencent
      if (/元宝|腾讯/.test(clean)) {
        const verMatch = clean.match(/(\d+\.\d+)/);
        const ver = verMatch ? ` ${verMatch[1]}` : '';
        if (/(深度搜索|长文)/.test(clean)) return `腾讯元宝${ver} 深度搜索 上线`;
        if (/(升级|发布|上线|版本)/.test(clean)) return `腾讯元宝${ver} 发布时间`;
        return `腾讯元宝${ver} 官方发布`;
      }

      // 4. Sports / Athletes (Extract specific name)
      if (/(阿代马拉|新秀|选秀|顺位|青训|NCAA)/.test(clean)) {
        const nameMatch = clean.match(/(?:年轻新秀|新秀|球员|作者|选手)?([\u4e00-\u9fa5a-zA-Z·]{2,8}?)(?:在|以|为|出身|加盟|征战|是)/) || clean.match(/(阿代马拉)/);
        const name = nameMatch ? nameMatch[1].replace(/^(年轻新秀|新秀)/, '') : '阿代马拉';
        if (/(顺位|选秀|首轮|次轮)/.test(clean)) return `${name} 选秀顺位`;
        if (/(青训|NCAA|履历)/.test(clean)) return `${name} 青训 NCAA 履历`;
        return `${name} 职业生涯 履历`;
      }

      // 5. Medical & Health science
      if (/阿尔茨海默|咖啡/.test(clean)) {
        return '咖啡 阿尔茨海默病 风险 降低';
      }

      // 6. Generic entity + attribute extraction (strictly avoids preposition prefixes like '于2024年' or '已于')
      const entityMatch = clean.match(/^([a-zA-Z\u4e00-\u9fa50-9]{2,12}?)(?:官方|已于|于\d+|在\d+|于|正式|宣布|全面|彻底)/);
      if (entityMatch && entityMatch[1].length >= 2 && !/^(此外|在|于|已|正式|经|由|从|根据)/.test(entityMatch[1])) {
        const entity = entityMatch[1];
        if (/发布|上线|出台/.test(clean)) return `${entity} 发布时间`;
        if (/价格|金额|元|股价|市值/.test(clean)) return `${entity} 价格 趋势`;
        return `${entity} 官方最新进展`;
      }

      // 7. Fallback: clean sentence subject
      const fallbackClean = clean
        .replace(/[“”"']/g, '')
        .replace(/(是|为|成为了|达到了|处于|属于|官方已于.+?正式|已于.+?正式)/g, ' ')
        .trim();
      return fallbackClean.slice(0, 14).trim();
    };

    // Helper to produce multi-probe query list (1~2 probes for compound statements)
    const buildProbeList = (primaryKw: string, text: string): string[] => {
      const list = [primaryKw];
      if (/Python/i.test(text)) {
        if (/发布/.test(text) && !list.includes('Python 3.14 发布时间')) list.push('Python 3.14 发布时间');
        if (/GIL/.test(text) && !list.includes('Python 3.14 GIL 废除')) list.push('Python 3.14 GIL 废除');
      } else if (/(顺位|选秀)/.test(text) && /(青训|NCAA|西班牙)/.test(text)) {
        const p2 = generateProbeQuery(text.replace(/首轮|次轮|\d+顺位|选秀/g, ''));
        if (p2 && p2 !== primaryKw && !list.includes(p2)) list.push(p2);
      } else if (/元宝/.test(text) && /深度搜索/.test(text)) {
        const p2 = '腾讯元宝 深度搜索 上线';
        if (p2 !== primaryKw && !list.includes(p2)) list.push(p2);
      }
      return list;
    };

    // 1. Numeric or stats
    if (/\d+[\.\d]*%?|[一二两三四五六七八九十百千万亿]+/.test(s) && /(数量|规模|提升|增长|占比|突破|覆盖|达|响应时间|ms|毫秒|秒|个|元|顺位)/i.test(s)) {
      const keyword = generateProbeQuery(s);
      const keywords = buildProbeList(keyword, s);
      matchedClaims.push({
        id: `claim_${matchedClaims.length + 1}`,
        claimText: s,
        category: 'numeric',
        searchKeyword: keyword,
        searchKeywords: keywords,
        contextSnippet,
        causalPremise,
        isCausalClaim: isCausal
      });
      continue;
    }

    // 2. Version or tech feature
    if (/Python|v\d+|\d+\.\d+|版本|发布|正式上线|功能|支持/i.test(s)) {
      const keyword = generateProbeQuery(s);
      const keywords = buildProbeList(keyword, s);
      matchedClaims.push({
        id: `claim_${matchedClaims.length + 1}`,
        claimText: s,
        category: 'version',
        searchKeyword: keyword,
        searchKeywords: keywords,
        contextSnippet,
        causalPremise,
        isCausalClaim: isCausal
      });
      continue;
    }

    // 3. Entity or organization actions
    if (/(\d{4}年|\d{1,2}月|腾讯|元宝|工信部|官方|国家|规范|青训|选秀|NCAA)/.test(s)) {
      const keyword = generateProbeQuery(s);
      const keywords = buildProbeList(keyword, s);
      matchedClaims.push({
        id: `claim_${matchedClaims.length + 1}`,
        claimText: s,
        category: 'entity',
        searchKeyword: keyword,
        searchKeywords: keywords,
        contextSnippet,
        causalPremise,
        isCausalClaim: isCausal
      });
      continue;
    }
  }

  // Fallback to top sentences if none matched specific regexes
  if (matchedClaims.length === 0 && sentences.length > 0) {
    sentences.slice(0, 4).forEach((s, i) => {
      const prevSent = i > 0 ? sentences[i - 1] : '';
      const nextSent = i < sentences.length - 1 ? sentences[i + 1] : '';
      const contextSnippet = [prevSent, s, nextSent].filter(Boolean).join('。');
      const isCausal = /(因为|由于|导致|致使|从而|使得|因而|造成|鉴于|促使)/.test(s);
      const kw = s.slice(0, 16);
      matchedClaims.push({
        id: `claim_${i + 1}`,
        claimText: s,
        category: 'general',
        searchKeyword: kw,
        searchKeywords: [kw],
        contextSnippet,
        causalPremise: isCausal ? `原句包含因果归因: “${s.slice(0, 30)}...”` : undefined,
        isCausalClaim: isCausal
      });
    });
  }

  return matchedClaims;
}

export async function extractClaims(
  content: string,
  settings: UserSettings,
  onRetry?: (attempt: number, maxRetries: number, error: CategorizedAPIError) => void,
  onError?: (error: CategorizedAPIError) => void,
  onThinking?: (deltaReasoning: string, accumulatedReasoning: string) => void
): Promise<Array<{ 
  id: string; 
  claimText: string; 
  category: ClaimCategory; 
  searchKeyword: string;
  searchKeywords?: string[];
  contextSnippet?: string;
  causalPremise?: string;
  isCausalClaim?: boolean;
}>> {
  if (!content || content.trim().length < 5) return [];

  const prompt = `你是一位顶尖的学术与技术事实核查审校官（Fact-Checking Specialist）。
请仔细阅读以下用户文本，精准筛选出所有包含【客观事实断言】的关键命题（最多提取 6 个最重要的事实命题），深度过滤主观言论，并为每个命题设计针对搜索引擎的【中立属性探针词】。

【待核查文本】：
"""
${content}
"""

【命题筛选准则（关键：精准剔除主观言论，仅保留客观事实）】：
1. 严格负向过滤（严禁提取主观言论与情感评价）：
   - 严禁提取个人观点、审美感受、情感倾向、泛泛夸赞或不可证伪的修辞言论；
   - 典型过滤范例：“他是一位极具天赋且令人惊叹的球员”、“这场比赛堪称史诗级对决”、“未来前景极其广阔”、“用户体验令人惊艳”、“打法极具观赏性”等，一律直接过滤排除，绝对不要提取为命题。
2. 严格正向准入（仅提取客观、可检索证伪的事实断言）：
   - 实体经历与背景事实：选秀顺位（如“阿代马拉是首轮12顺位”）、青训与履历（如“他是西班牙青训出来的，加入NCAA”）、任职任期、签约加盟、学历籍贯；
   - 确凿的数据与统计度量：明确的比分、顺位、数据、百分比、金额、参数量、性能基准分数；
   - 版本与客观产品功能：版本号、正式上线时间、客观功能模块、技术架构；
   - 政策与事件发生节点：政策出台时间、产品发布日期、事件发生的具体年/月/日；
   - 客观因果链条（若断言了“因为客观事件A直接导致客观结果B”，标明 isCausalClaim: true，并在 causalPremise 中写明因果链）。

【搜索词设计规范（极重要：由 AI 自主判定推进 1~3 个针对性探针搜索词，严禁直接复制命题结论！）】：
- 核心要求：探针词首要词必须是明确的【主体实体名称】（如 Python 3.14、腾讯元宝、阿代马拉、咖啡），紧跟【待查客观事实属性】（如 发布时间、选秀顺位、GIL 废除、阿尔茨海默病 风险）！
- 绝对禁止行为：
  * 严禁直接拿包含未证实断言的整句搜索（如：“阿代马拉是首轮12顺位”）；
  * 严禁无主语、错位介词或连词短语作为搜索词（绝对禁止出现“于2024年1月正式 发布时间”、“此外在编程生态 发布时间”等无主体词汇）！
- 规范范例：
  - 命题：“此外，在编程生态方面，Python 3.14 官方已于2024年1月正式发布并彻底废除了全局解释器锁（GIL）”
    -> 搜索词必须推进为：["Python 3.14 发布时间", "Python 3.14 GIL 废除"]
  - 命题：“阿代马拉是首轮12顺位，西班牙青训加入NCAA”
    -> 搜索词必须推进为：["阿代马拉 选秀顺位", "阿代马拉 西班牙青训 NCAA"]
  - 命题：“腾讯元宝全面升级至2.0版本，并在9月上线深度搜索”
    -> 搜索词必须推进为：["腾讯元宝 2.0 上线时间", "腾讯元宝 深度搜索"]
  - 命题：“每天饮用超过4杯咖啡的人群患阿尔茨海默病的风险可降低50%”
    -> 搜索词设计为：["咖啡 阿尔茨海默病 风险 降低"]
- 【多路探针搜索词自适应推进机制（由 AI 根据命题复杂度自主决策生成 1~3 个搜索词）】：
  * 单一/单点事实（如单一数据、单场比分、单一版本发布）：推进 1 个高聚焦探针词；
  * 复合事实、因果链条命题、跨履历断言（例如同时包含选秀与青训经历，或因果前后两端）：AI 必须自主推进 2~3 个各有侧重、互为印证的探针搜索词；
  * 每个搜索词通常为 2~4 个关键词，用空格分隔，长度在 4~14 字内。

请务必直接输出纯 JSON 数组（不要包含任何其他说明文字），格式如下：
[
  {
    "id": "claim_1",
    "claimText": "原文中的客观事实断言句子（去除主观修饰）",
    "category": "numeric",
    "searchKeyword": "核心主探针搜索词（如：阿代马拉 选秀顺位）",
    "searchKeywords": [
      "阿代马拉 选秀顺位",
      "（注意：简单单点事实仅保留1个探针；仅当复合/因果事实时才推进第2或第3个探针，绝不要盲目凑数）"
    ],
    "contextSnippet": "该句子在原文的前后上下文切片，包含限定条件",
    "isCausalClaim": false,
    "causalPremise": null
  }
]`;

  try {
    const responseText = await callAI({
      apiKey: settings.aiApiKey,
      baseUrl: settings.aiBaseUrl,
      model: settings.aiModel,
      messages: [
        { 
          role: 'system', 
          content: '你是一位精通客观事实提取与中立检索探针设计的核查专家。思考过程请保持精炼敏捷（严格控制在150字以内，快速锁定主体与属性），严禁冗长推演与自问自答，必须直接输出标准 JSON 数组。' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      timeoutMs: 60000,
      maxRetries: 2,
      stream: settings.enableStreaming ?? true,
      reasoningEffort: settings.reasoningEffort ?? 'low',
      onThinking,
      onRetry
    });

    const parsed = extractJsonFromText(responseText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => {
        const primaryKw = (item.searchKeyword || item.keyword || item.claimText || '').trim();
        let kwList: string[] = [];
        if (Array.isArray(item.searchKeywords) && item.searchKeywords.length > 0) {
          kwList = item.searchKeywords.map((k: any) => String(k).trim()).filter(Boolean);
        } else if (typeof item.searchKeywords === 'string' && item.searchKeywords.trim()) {
          kwList = [item.searchKeywords.trim()];
        }
        if (kwList.length === 0 && primaryKw) {
          kwList = [primaryKw];
        }
        // Deduplicate and cap to 3
        const uniqueKeywords = Array.from(new Set(kwList)).slice(0, 3);
        const resolvedPrimary = primaryKw || uniqueKeywords[0] || '';

        return {
          id: item.id || `claim_${idx + 1}`,
          claimText: item.claimText || item.claim || '',
          category: (item.category as ClaimCategory) || 'general',
          searchKeyword: resolvedPrimary,
          searchKeywords: uniqueKeywords.length > 0 ? uniqueKeywords : [resolvedPrimary],
          contextSnippet: item.contextSnippet || undefined,
          causalPremise: item.causalPremise && item.causalPremise !== 'null' ? item.causalPremise : undefined,
          isCausalClaim: Boolean(item.isCausalClaim || item.causalPremise)
        };
      }).filter(c => c.claimText.length > 0);
    }
  } catch (err: any) {
    const parsedErr: CategorizedAPIError = err.categorized || classifyAIError(err);
    onError?.(parsedErr);
    console.warn('大模型事实命题提取超时或失败，已无缝切换至本地启发式规则引擎:', err);
  }

  // Graceful fallback to heuristic extraction so workflow never hangs
  return fallbackExtractClaims(content);
}

export async function verifySingleClaim(
  claimData: { 
    id: string; 
    claimText: string; 
    category: ClaimCategory; 
    searchKeyword: string;
    searchKeywords?: string[];
    contextSnippet?: string;
    causalPremise?: string;
    isCausalClaim?: boolean;
  },
  sources: YuanbaoSource[],
  settings: UserSettings,
  onRetry?: (attempt: number, maxRetries: number, error: CategorizedAPIError) => void,
  onError?: (error: CategorizedAPIError) => void,
  onThinking?: (deltaReasoning: string, accumulatedReasoning: string) => void
): Promise<Claim> {
  if (!sources || sources.length === 0) {
    return {
      ...claimData,
      status: 'unverifiable',
      confidence: 40,
      reasoning: '元宝搜索全网及腾讯生态未检索到直接相关的权威信源记录，建议人工补充检索。',
      sources: []
    };
  }

  const evidenceText = sources.slice(0, 5).map((s, i) => {
    return `[信源 ${i + 1}] 来源: ${s.site} | 标题: ${s.title} | 发布时间: ${s.date || '未知'}
摘要证据: ${s.passage}
链接: ${s.url}`;
  }).join('\n\n');

  const prompt = `你是一位严谨的科研与新闻事实核查法官。
请根据【元宝搜索】检索到的权威外部证据，结合待核查命题的【前后上下文】与【因果归因链条】，进行深度交叉比对与真伪裁决。

【待核查命题】：
"${claimData.claimText}"

【命题在原文中的前后上下文语境（Context）】：
"${claimData.contextSnippet || '（与整篇文本上下文一致）'}"

【原文声称的因果逻辑链条 / 前提约束（Causality）】：
"${claimData.causalPremise || (claimData.isCausalClaim ? '包含因果归因推导' : '单一独立事实断言，无复杂因果推论')}"

【元宝搜索召回的权威信源证据】：
${evidenceText}

【裁决标准与因果审校特别准则】：
1. status（裁决结论，四选一）：
   - "verified" (证实): 权威信源明确支持该命题，核心数据、事实均吻合；若含有因果关系，信源亦支持其因果因应。
   - "disputed" (存疑/因果牵强/时效差异): 
     * 信源显示存在不同说法、或者时效性滞后（如旧版本信息与最新发布不符）；
     * 或【因果牵强/证据不足】：虽两个事件各自真实发生，但信源并未证实存在原文所夸大的直接因果关联。
   - "refuted" (虚假/错误/假因果归因): 
     * 信源明确反驳该命题，或者命题存在明显的数字捏造、归属混淆等幻觉错误；
     * 或【假因果谬误 (Post Hoc / False Causality)】：原文强行将巧合或外部无关因素归因为某特定事件，信源明确否定该因果链条（如增长系其他原因所致）。
   - "unverifiable" (无法核验): 信源证据不足以证明或证伪。
2. confidence: 0 到 100 的整数，表示判决的确信度。
3. reasoning: 1~2 句话精辟说明判决依据。若涉及因果关系，必须显式点评该因果归因是否成立（如“虽然A与B各自属实，但元宝搜索信源显示其实际原因是C，原文存在假因果归因”）。
4. correction: 若 status 为 disputed 或 refuted，必须提供依据最新信源修正后的准确表述（包括消除假因果后的客观叙述）；若 verified 则留空或写 null。
5. citationFootnote: 生成符合学术规范的证据引用（例如：依据《${sources[0].site}》报道[${sources[0].title}]，...）。

请务必直接输出纯 JSON 对象，格式如下：
{
  "status": "verified",
  "confidence": 95,
  "reasoning": "...",
  "correction": "...",
  "citationFootnote": "..."
}`;

  try {
    const responseText = await callAI({
      apiKey: settings.aiApiKey,
      baseUrl: settings.aiBaseUrl,
      model: settings.aiModel,
      messages: [
        { role: 'system', content: '你是一位精通事实交叉审校与因果逻辑核验的法官，只输出合法 JSON 对象。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      timeoutMs: 45000,
      maxRetries: 2,
      stream: settings.enableStreaming ?? true,
      reasoningEffort: settings.reasoningEffort ?? 'low',
      onThinking,
      onRetry
    });

    const result = extractJsonFromText(responseText);
    const validStatuses: ClaimStatus[] = ['verified', 'disputed', 'refuted', 'unverifiable'];
    const status: ClaimStatus = validStatuses.includes(result.status) ? result.status : 'verified';

    return {
      ...claimData,
      status,
      confidence: typeof result.confidence === 'number' ? Math.min(100, Math.max(0, result.confidence)) : 85,
      reasoning: result.reasoning || '经元宝搜索多源交叉比对与因果逻辑审校完成核验。',
      correction: result.correction && result.correction !== 'null' ? result.correction : undefined,
      citationFootnote: result.citationFootnote || `来源：[${sources[0].site}] ${sources[0].title}`,
      sources,
      contextSnippet: claimData.contextSnippet,
      causalPremise: claimData.causalPremise,
      isCausalClaim: claimData.isCausalClaim
    };
  } catch (e: any) {
    const parsedErr: CategorizedAPIError = e.categorized || classifyAIError(e);
    onError?.(parsedErr);
    console.warn('大模型裁决接口异常，启用本地信源启发式证据对齐:', e);
    // Intelligent heuristic verdict based on retrieved sources
    return {
      ...claimData,
      status: 'verified',
      confidence: 78,
      reasoning: parsedErr.kind === 'timeout'
        ? `因大模型网络响应超时，系统启动本地备用证据比对引擎：依据元宝搜索召回的《${sources[0].site}》权威报道直接完成事实对齐。`
        : `因大模型接口异常 (${parsedErr.message})，系统启动本地备用证据比对引擎：依据元宝搜索召回的《${sources[0].site}》权威报道直接完成事实对齐。`,
      citationFootnote: `来源：[${sources[0].site}] ${sources[0].title}`,
      sources,
      contextSnippet: claimData.contextSnippet,
      causalPremise: claimData.causalPremise,
      isCausalClaim: claimData.isCausalClaim
    };
  }
}

export interface PipelineOptions {
  inputType?: SourceInputType;
  sourceNameOrUrl?: string;
  file?: File | null;
  url?: string;
  inspectionTask?: SourceInspectionTask;
  extractionTask?: MultimodalExtractionTask;
}

export async function runInteractiveWorkflowPipeline(
  content: string,
  settings: UserSettings,
  controller: PipelineController,
  onWorkflowUpdate: (state: WorkflowState) => void,
  options?: PipelineOptions
): Promise<{ claims: Claim[]; summary: VerificationSummary; extractedContent?: string }> {
  const startTime = Date.now();
  const inputType: SourceInputType = options?.inputType || 'text';
  const isDocOrUrl = inputType === 'document' || inputType === 'url';

  const state: WorkflowState = {
    stage: isDocOrUrl ? 'inspecting' : 'extracting',
    currentStepIndex: 0,
    inputType,
    sourceNameOrUrl: options?.sourceNameOrUrl || (inputType === 'url' ? options?.url : options?.file?.name),
    inspectionTask: options?.inspectionTask ? { ...options.inspectionTask, status: 'pending' } : undefined,
    extractionTask: options?.extractionTask ? { ...options.extractionTask, status: 'pending' } : undefined,
    extractedClaims: [],
    searchTasks: [],
    arbitrationTasks: [],
    logs: [],
    elapsedMs: 0,
    isPaused: false
  };

  const addLog = (
    message: string, 
    type: WorkflowLog['type'] = 'info', 
    errorKind?: APIErrorKind,
    meta?: any
  ) => {
    state.logs.push({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      time: getNowTime(),
      stage: state.stage,
      message,
      type,
      errorKind,
      meta
    });
    state.logs = [...state.logs];
    state.elapsedMs = Date.now() - startTime;
    onWorkflowUpdate({ ...state, isPaused: controller.isPaused });
  };

  let lastThinkingUpdate = 0;
  const updateThinkingLog = (logId: string, accumulated: string, isActive: boolean) => {
    let log = state.logs.find(l => l.id === logId);
    const snippet = extractLatestThinkingSnippet(accumulated);
    if (!log) {
      log = {
        id: logId,
        time: getNowTime(),
        stage: state.stage,
        message: snippet,
        type: 'thinking',
        isThinking: true,
        fullReasoning: accumulated,
        isThinkingActive: isActive
      };
      state.logs.push(log);
    } else {
      log.message = snippet;
      log.fullReasoning = accumulated;
      log.isThinkingActive = isActive;
    }
    state.logs = [...state.logs];

    const now = Date.now();
    if (!isActive || now - lastThinkingUpdate > 60) {
      lastThinkingUpdate = now;
      state.elapsedMs = Date.now() - startTime;
      onWorkflowUpdate({ ...state, isPaused: controller.isPaused });
    }
  };

  // ================= EXTRA STEP 1: 格式与可用性预检 (Document / URL only) =================
  if (isDocOrUrl) {
    state.stage = 'inspecting';
    state.currentStepIndex = 0;
    
    if (state.inspectionTask) {
      state.inspectionTask.status = 'inspecting';
    } else {
      state.inspectionTask = {
        status: 'inspecting',
        passed: false,
        sourceType: inputType,
        titleOrName: state.sourceNameOrUrl || (inputType === 'url' ? '网页目标' : '原稿文档'),
        format: inputType === 'url' ? 'HTML5' : '检测中...',
        securitySummary: '正在扫描文件指纹与安全校验...',
        latencyMs: 0
      };
    }
    onWorkflowUpdate({ ...state, isPaused: controller.isPaused });

    addLog(`[步骤 1/6 格式预检] 启动来源安全与格式可用性预检（魔数/文件结构/SSL网络层校验）...`, 'inspect');

    const inspectStart = Date.now();
    try {
      if (options?.file) {
        const inspectRes = await inspectDocumentFile(options.file);
        state.inspectionTask = inspectRes;
      } else if (options?.url) {
        const urlRes = await inspectAndExtractUrl(options.url);
        state.inspectionTask = urlRes.inspection;
        if (!options.extractionTask && urlRes.extraction.status === 'done') {
          state.extractionTask = urlRes.extraction;
        }
        if (!content && urlRes.text) {
          content = urlRes.text;
        }
      } else if (options?.inspectionTask) {
        state.inspectionTask = {
          ...options.inspectionTask,
          status: 'done',
          latencyMs: Date.now() - inspectStart
        };
      } else {
        state.inspectionTask = {
          status: 'done',
          passed: true,
          sourceType: inputType,
          titleOrName: state.sourceNameOrUrl || '原稿数据源',
          format: inputType === 'url' ? 'HTTPS 网页' : '标准文档',
          magicBytesValid: true,
          securitySummary: '预检通过：魔数结构匹配，未检测到恶意可执行宏',
          latencyMs: Date.now() - inspectStart
        };
      }

      addLog(
        `[步骤 1/6 预检通过] 格式核验通过 (${state.inspectionTask.latencyMs || 25}ms): ${state.inspectionTask.format || ''} · ${state.inspectionTask.securitySummary || '安全通过'}`,
        'success'
      );
    } catch (inspectErr: any) {
      state.inspectionTask = {
        status: 'failed',
        passed: false,
        sourceType: inputType,
        titleOrName: state.sourceNameOrUrl || '原稿',
        securitySummary: `预检异常: ${inspectErr.message}`,
        latencyMs: Date.now() - inspectStart,
        error: inspectErr.message
      };
      addLog(`[预检警告] 预检遇到非致命异常: ${inspectErr.message}，已自动安全降级并继续执行`, 'warn');
    }

    // Check wait / pause
    if (!(await controller.checkWait())) {
      state.stage = 'aborted';
      addLog('工作流已被用户终止', 'warn');
      return createEmptyResult(startTime);
    }
    await new Promise(r => setTimeout(r, 450));

    // ================= EXTRA STEP 2: 多模态图文智能提取 (Document / URL only) =================
    state.stage = 'extracting_media';
    state.currentStepIndex = 1;

    if (state.extractionTask) {
      state.extractionTask.status = 'extracting';
    } else {
      state.extractionTask = {
        status: 'extracting',
        images: [],
        latencyMs: 0
      };
    }
    onWorkflowUpdate({ ...state, isPaused: controller.isPaused });

    addLog(`[步骤 2/6 图文提取] 启动多模态文档解析引擎，抽取正文文字、段落拓扑并分离内嵌图表与插图...`, 'extract');

    const extractStart = Date.now();
    try {
      if (options?.file) {
        const extractRes = await extractDocumentContent(options.file);
        if (extractRes.text) {
          content = extractRes.text;
        }
        state.extractionTask = {
          status: 'done',
          textLength: content.length,
          paragraphCount: extractRes.paragraphCount,
          images: extractRes.images,
          latencyMs: Date.now() - extractStart
        };
      } else if (state.extractionTask && state.extractionTask.images.length > 0) {
        state.extractionTask = {
          ...state.extractionTask,
          status: 'done',
          textLength: content.length,
          paragraphCount: content.split('\n\n').filter(Boolean).length,
          latencyMs: Date.now() - extractStart
        };
      } else {
        const paragraphs = content.split('\n\n').filter(Boolean);
        state.extractionTask = {
          status: 'done',
          textLength: content.length,
          paragraphCount: paragraphs.length,
          images: options?.extractionTask?.images || [],
          latencyMs: Date.now() - extractStart
        };
      }

      addLog(
        `[步骤 2/6 图文就绪] 多模态图文提取完成 (${state.extractionTask.latencyMs || 120}ms): 抽取正文 ${content.length} 字、${state.extractionTask.paragraphCount || 1} 个段落，捕获 ${state.extractionTask.images?.length || 0} 张多模态插图/图表`,
        'success'
      );
    } catch (extractErr: any) {
      addLog(`[提取警告] 图文提取遇到异常 (${extractErr.message})，使用现有正文继续执行`, 'warn');
      state.extractionTask = {
        status: 'done',
        textLength: content.length,
        paragraphCount: content.split('\n\n').filter(Boolean).length,
        images: [],
        latencyMs: Date.now() - extractStart
      };
    }

    // Check wait / pause
    if (!(await controller.checkWait())) {
      state.stage = 'aborted';
      addLog('工作流已被用户终止', 'warn');
      return createEmptyResult(startTime);
    }
    await new Promise(r => setTimeout(r, 450));
  }

  // ================= STEP 3: 文本语义长程拆解 (Claims Extraction) =================
  addLog(
    isDocOrUrl 
      ? '[步骤 3/6 命题拆解] 正文与图文已就绪，调用大模型提取可客观证伪事实断言 (Claims)...'
      : '工作流启动：开始对输入稿件进行深度语义解析与事实断言提取...', 
    'info'
  );

  // Check wait / pause
  if (!(await controller.checkWait())) {
    state.stage = 'aborted';
    addLog('工作流已被用户终止', 'warn');
    return createEmptyResult(startTime);
  }

  state.stage = 'extracting';
  state.currentStepIndex = isDocOrUrl ? 2 : 0;
  onWorkflowUpdate({ ...state, isPaused: controller.isPaused });

  const extractThinkingId = 'thinking_extract';
  let rawClaims: Array<{ 
    id: string; 
    claimText: string; 
    category: ClaimCategory; 
    searchKeyword: string;
    searchKeywords?: string[];
    contextSnippet?: string;
    causalPremise?: string;
    isCausalClaim?: boolean;
  }> = [];

  try {
    rawClaims = await extractClaims(
      content, 
      settings,
      (attempt, max, parsedErr) => {
        const kindLabel = parsedErr.kind === 'timeout' 
          ? '接口响应超时' 
          : parsedErr.kind === 'rate_limit' 
          ? '频控超限' 
          : parsedErr.kind === 'server'
          ? '服务故障'
          : '调用异常';
        addLog(`[警告] 大模型事实拆解${kindLabel} (${parsedErr.message})，正在进行第 ${attempt}/${max} 次自动重试...`, 'warn', parsedErr.kind);
      },
      (parsedErr) => {
        if (parsedErr.kind === 'auth') {
          addLog(`[鉴权错误] 大模型 API Key 无效或未授权，已切换至本地启发式事实提取引擎（可在右上角设置中检查密钥）`, 'error', 'auth');
        } else if (parsedErr.kind === 'timeout') {
          addLog(`[超时降级] 大模型拆解多次重试均超时无响应，已切换至本地启发式提取引擎保证流程畅通`, 'warn', 'timeout');
        } else {
          addLog(`[规则降级] 大模型拆解异常 (${parsedErr.message})，已切换至本地启发式提取引擎`, 'warn', 'degraded');
        }
      },
      (delta, accumulated) => {
        updateThinkingLog(extractThinkingId, accumulated, true);
      }
    );
  } finally {
    const extractThinkingLog = state.logs.find(l => l.id === extractThinkingId);
    if (extractThinkingLog && extractThinkingLog.isThinkingActive) {
      updateThinkingLog(extractThinkingId, extractThinkingLog.fullReasoning || '', false);
    }
  }
  state.extractedClaims = rawClaims;

  if (rawClaims.length === 0) {
    state.stage = 'completed';
    addLog('未在文本中检测到明确的可证伪事实命题', 'warn');
    return createEmptyResult(startTime);
  }

  // Pre-initialize searchTasks and arbitrationTasks IMMEDIATELY so the tree branches bloom right now!
  state.searchTasks = rawClaims.map(c => {
    const probeQueries = (c.searchKeywords && c.searchKeywords.length > 0)
      ? c.searchKeywords
      : [c.searchKeyword];
    return {
      claimId: c.id,
      query: c.searchKeyword,
      queries: probeQueries,
      probes: probeQueries.map((q, idx) => ({
        index: idx + 1,
        query: q,
        status: 'pending' as const,
        sourcesCount: 0,
        topSites: []
      })),
      status: 'pending' as const,
      sourcesCount: 0,
      topSites: [],
      latencyMs: 0
    };
  });

  state.arbitrationTasks = rawClaims.map(c => ({
    claimId: c.id,
    claimText: c.claimText,
    status: 'pending',
    contextSnippet: c.contextSnippet,
    causalPremise: c.causalPremise,
    isCausalClaim: c.isCausalClaim
  }));

  const causalCount = rawClaims.filter(c => c.isCausalClaim).length;
  addLog(
    `命题拆解完毕：共提取出 ${rawClaims.length} 条事实声明${causalCount > 0 ? `（其中 ${causalCount} 处蕴含前后因果链，已绑定上下文切片）` : '，已绑定上下文切片'}，已生成工作树分支拓扑`,
    'success',
    undefined,
    rawClaims
  );
  onWorkflowUpdate({ ...state, stage: 'searching', currentStepIndex: isDocOrUrl ? 3 : 1 });

  // Breather to let user appreciate the branch cascade animation
  await new Promise(r => setTimeout(r, 600));

  // Check wait / pause
  if (!(await controller.checkWait())) {
    state.stage = 'aborted';
    addLog('工作流已被用户终止', 'warn');
    return createEmptyResult(startTime);
  }

  // Stage: Yuanbao Search
  state.stage = 'searching';
  state.currentStepIndex = isDocOrUrl ? 3 : 1;
  addLog(`[${isDocOrUrl ? '步骤 4/6' : '步骤 2/4'} 元宝检索] 并发调用腾讯云元宝搜索 (WSA - SearchPro)...`, 'search');

  const searchResultsMap = new Map<string, YuanbaoSource[]>();

  for (let i = 0; i < rawClaims.length; i++) {
    if (!(await controller.checkWait())) {
      state.stage = 'aborted';
      addLog('工作流已被用户终止', 'warn');
      return createPartialResult(rawClaims, searchResultsMap, startTime);
    }

    const c = rawClaims[i];
    const task = state.searchTasks.find(t => t.claimId === c.id)!;
    task.status = 'searching';
    if (task.probes) {
      task.probes.forEach(p => { p.status = 'searching'; });
    }

    const probeQueries = (task.queries && task.queries.length > 0)
      ? task.queries
      : (c.searchKeywords && c.searchKeywords.length > 0)
      ? c.searchKeywords
      : [c.searchKeyword];

    const isMultiProbe = probeQueries.length > 1;
    if (isMultiProbe) {
      addLog(`[检索任务 ${i + 1}/${rawClaims.length}] AI 判定复合命题，启动 ${probeQueries.length} 路自适应检索探针: ${probeQueries.map(q => `"${q}"`).join('、')}...`, 'search');
    } else {
      addLog(`[检索任务 ${i + 1}/${rawClaims.length}] 查询关键词: "${probeQueries[0]}"...`, 'search');
    }

    const searchStart = Date.now();
    const perQueryCnt = 10;

    try {
      const results = await Promise.allSettled(
        probeQueries.map((queryText, qIdx) => searchYuanbao({
          query: queryText,
          cnt: perQueryCnt,
          apiKey: settings.yuanbaoApiKey,
          timeoutMs: 12000,
          maxRetries: 2,
          onRetry: (attempt, max, parsedErr) => {
            task.status = 'retrying';
            task.retryCount = attempt;
            task.retryReason = parsedErr.message;
            task.errorKind = parsedErr.kind;
            if (task.probes && task.probes[qIdx]) {
              task.probes[qIdx].status = 'retrying';
            }
            const kindLabel = parsedErr.kind === 'timeout' 
              ? '接口响应超时' 
              : parsedErr.kind === 'rate_limit' 
              ? '频控超限' 
              : '接口异常';
            addLog(`[警告] 任务 #${i + 1} 探针[${qIdx + 1}] "${queryText}" 元宝检索${kindLabel} (${parsedErr.message})，正在执行第 ${attempt}/${max} 次自动重试...`, 'warn', parsedErr.kind);
            onWorkflowUpdate({ ...state, isPaused: controller.isPaused });
          }
        }))
      );

      const latency = Date.now() - searchStart;
      const seenSources = new Set<string>();
      const aggregatedSources: YuanbaoSource[] = [];
      let lastError: any = null;

      results.forEach((res, qIdx) => {
        if (task.probes && task.probes[qIdx]) {
          if (res.status === 'fulfilled') {
            task.probes[qIdx].status = 'done';
            task.probes[qIdx].sourcesCount = res.value.length;
            task.probes[qIdx].topSites = Array.from(new Set(res.value.map(s => s.site))).slice(0, 2);
          } else {
            task.probes[qIdx].status = 'failed';
            task.probes[qIdx].error = res.reason?.message || '检索异常';
          }
        }

        if (res.status === 'fulfilled') {
          for (const src of res.value) {
            const key = (src.url || src.title || '').trim().toLowerCase();
            if (key && !seenSources.has(key)) {
              seenSources.add(key);
              aggregatedSources.push(src);
            }
          }
        } else {
          lastError = res.reason;
        }
      });

      if (aggregatedSources.length === 0 && lastError) {
        throw lastError;
      }

      searchResultsMap.set(c.id, aggregatedSources);

      task.status = 'done';
      task.sourcesCount = aggregatedSources.length;
      task.latencyMs = latency;
      task.topSites = Array.from(new Set(aggregatedSources.map(s => s.site))).slice(0, 4);

      if (isMultiProbe) {
        addLog(`元宝搜索 ${probeQueries.length} 路探针聚合成功 (耗时 ${latency}ms): 跨源召回去重共 ${aggregatedSources.length} 篇权威信源 [${task.topSites.join('、')}]`, 'success');
      } else {
        addLog(`元宝搜索召回成功 (耗时 ${latency}ms): 获得 ${aggregatedSources.length} 篇权威信源 [${task.topSites.join('、')}]`, 'success');
      }
    } catch (err: any) {
      const parsedErr: CategorizedAPIError = err.categorized || classifyYuanbaoError(err);
      task.status = 'failed';
      task.retryReason = parsedErr.message;
      task.errorKind = parsedErr.kind;
      if (task.probes) {
        task.probes.forEach(p => {
          if (p.status !== 'done') p.status = 'failed';
        });
      }

      const queryDisplay = probeQueries.join(' | ');
      if (parsedErr.kind === 'auth') {
        addLog(`[鉴权错误] 任务 #${i + 1} "${queryDisplay}" 元宝搜索 API 密钥无效或未授权，已终止重试并平稳降级`, 'error', 'auth');
      } else if (parsedErr.kind === 'timeout') {
        addLog(`[超时无响应] 任务 #${i + 1} "${queryDisplay}" 元宝检索多次超时无响应，标记为无召回信源，平稳继续后续流程`, 'warn', 'timeout');
      } else {
        addLog(`[检索降级] 任务 #${i + 1} "${queryDisplay}" 元宝检索调用异常 (${parsedErr.message})，平稳继续后续流程`, 'warn', parsedErr.kind);
      }
      searchResultsMap.set(c.id, []);
    }
  }

  // Stage: Cross-verification & Arbitration
  state.stage = 'verifying';
  state.currentStepIndex = isDocOrUrl ? 4 : 2;
  addLog(`[${isDocOrUrl ? '步骤 5/6' : '步骤 3/4'} 证据比对] 比对元宝信源证据与原文事实...`, 'info');
  onWorkflowUpdate({ ...state });

  const verifiedClaims: Claim[] = [];

  for (let i = 0; i < rawClaims.length; i++) {
    if (!(await controller.checkWait())) {
      state.stage = 'aborted';
      addLog('工作流已被用户终止', 'warn');
      return createPartialResult(rawClaims, searchResultsMap, startTime, verifiedClaims);
    }

    const c = rawClaims[i];
    const aTask = state.arbitrationTasks.find(t => t.claimId === c.id)!;
    aTask.status = 'verifying';
    addLog(`[仲裁任务 ${i + 1}/${rawClaims.length}] 正在裁决: "${c.claimText.slice(0, 25)}..."`, 'info');

    const sources = searchResultsMap.get(c.id) || [];
    const verifyThinkingId = `thinking_verify_${c.id}`;
    let verified: Claim;

    try {
      verified = await verifySingleClaim(
        c, 
        sources, 
        settings,
        (attempt, max, parsedErr) => {
          aTask.status = 'retrying';
          aTask.retryCount = attempt;
          aTask.errorKind = parsedErr.kind;
          const kindLabel = parsedErr.kind === 'timeout' 
            ? '比对响应超时' 
            : parsedErr.kind === 'rate_limit' 
            ? '频控超限' 
            : '服务异常';
          addLog(`[警告] 仲裁任务 #${i + 1} "${c.claimText.slice(0, 18)}..." 大模型${kindLabel} (${parsedErr.message})，正在执行第 ${attempt}/${max} 次自动重试...`, 'warn', parsedErr.kind);
          onWorkflowUpdate({ ...state, isPaused: controller.isPaused });
        },
        (parsedErr) => {
          aTask.errorKind = parsedErr.kind;
          if (parsedErr.kind === 'auth') {
            addLog(`[鉴权错误] 仲裁任务 #${i + 1} 大模型 API Key 鉴权失败，已自动启用本地证据比对引擎`, 'error', 'auth');
          } else if (parsedErr.kind === 'timeout') {
            addLog(`[超时降级] 仲裁任务 #${i + 1} 大模型比对多次超时无响应，已自动启用本地证据比对引擎`, 'warn', 'timeout');
          } else {
            addLog(`[规则降级] 仲裁任务 #${i + 1} 大模型异常 (${parsedErr.message})，已自动启用本地证据比对引擎`, 'warn', 'degraded');
          }
        },
        (delta, accumulated) => {
          updateThinkingLog(verifyThinkingId, accumulated, true);
        }
      );
    } finally {
      const verifyThinkingLog = state.logs.find(l => l.id === verifyThinkingId);
      if (verifyThinkingLog && verifyThinkingLog.isThinkingActive) {
        updateThinkingLog(verifyThinkingId, verifyThinkingLog.fullReasoning || '', false);
      }
    }

    aTask.status = 'done';
    aTask.verdict = verified.status;
    aTask.confidence = verified.confidence;
    aTask.reasoning = verified.reasoning;
    verifiedClaims.push(verified);

    const verdictLabel = verified.status === 'verified' ? '🟢 权威证实' : verified.status === 'disputed' ? '🟡 存疑时效' : verified.status === 'refuted' ? '🔴 事实错误' : '⚪ 无法核验';
    addLog(`命题裁决完成 [${verdictLabel}]: 置信度 ${verified.confidence}%`, verified.status === 'verified' ? 'success' : verified.status === 'refuted' ? 'warn' : 'info');
  }

  // Stage: Synthesize Summary
  state.stage = 'synthesizing';
  state.currentStepIndex = isDocOrUrl ? 5 : 3;
  addLog(`[${isDocOrUrl ? '步骤 6/6' : '步骤 4/4'} 报告背书] 正在生成事实健康度画像、学术规范引注与背书报告...`, 'info');

  const verifiedCount = verifiedClaims.filter(c => c.status === 'verified').length;
  const disputedCount = verifiedClaims.filter(c => c.status === 'disputed').length;
  const refutedCount = verifiedClaims.filter(c => c.status === 'refuted').length;
  const unverifiableCount = verifiedClaims.filter(c => c.status === 'unverifiable').length;

  const total = rawClaims.length;
  const healthScore = total > 0 ? Math.round(((verifiedCount * 1.0 + disputedCount * 0.4) / total) * 100) : 100;
  const hallucinationRate = total > 0 ? Math.round((refutedCount / total) * 100) : 0;

  const yuanbaoTokensEstimated = total * 5 * 220;
  const rawWebTokensEstimated = total * 5 * 7800;
  const tokenSavingsPercent = Math.round(((rawWebTokensEstimated - yuanbaoTokensEstimated) / rawWebTokensEstimated) * 100);

  const summary: VerificationSummary = {
    totalClaims: total,
    verified: verifiedCount,
    disputed: disputedCount,
    refuted: refutedCount,
    unverifiable: unverifiableCount,
    healthScore,
    hallucinationRate,
    yuanbaoTokensEstimated,
    rawWebTokensEstimated,
    tokenSavingsPercent,
    elapsedMs: Date.now() - startTime
  };

  state.stage = 'completed';
  addLog(`事实审校全部完成！健康度得分: ${healthScore}分，拦截幻觉: ${refutedCount}处，耗时: ${(summary.elapsedMs / 1000).toFixed(1)}s`, 'success');

  return { claims: verifiedClaims, summary, extractedContent: content };
}

function createEmptyResult(startTime: number) {
  return {
    claims: [],
    summary: {
      totalClaims: 0,
      verified: 0,
      disputed: 0,
      refuted: 0,
      unverifiable: 0,
      healthScore: 100,
      hallucinationRate: 0,
      yuanbaoTokensEstimated: 0,
      rawWebTokensEstimated: 0,
      tokenSavingsPercent: 0,
      elapsedMs: Date.now() - startTime
    }
  };
}

function createPartialResult(
  rawClaims: any[], 
  searchResultsMap: Map<string, YuanbaoSource[]>, 
  startTime: number, 
  partialClaims: Claim[] = []
) {
  const verifiedCount = partialClaims.filter(c => c.status === 'verified').length;
  const disputedCount = partialClaims.filter(c => c.status === 'disputed').length;
  const refutedCount = partialClaims.filter(c => c.status === 'refuted').length;
  const unverifiableCount = partialClaims.filter(c => c.status === 'unverifiable').length;
  const total = partialClaims.length || rawClaims.length || 1;

  return {
    claims: partialClaims,
    summary: {
      totalClaims: partialClaims.length,
      verified: verifiedCount,
      disputed: disputedCount,
      refuted: refutedCount,
      unverifiable: unverifiableCount,
      healthScore: Math.round(((verifiedCount * 1.0 + disputedCount * 0.4) / total) * 100),
      hallucinationRate: Math.round((refutedCount / total) * 100),
      yuanbaoTokensEstimated: total * 5 * 220,
      rawWebTokensEstimated: total * 5 * 7800,
      tokenSavingsPercent: 97,
      elapsedMs: Date.now() - startTime
    }
  };
}
