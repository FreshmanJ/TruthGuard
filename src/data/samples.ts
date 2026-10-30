import { Language } from '../i18n/translations';

export interface SamplePreset {
  id: string;
  title: string;
  tag: string;
  content: string;
}

export const SAMPLE_PRESETS_ZH: SamplePreset[] = [
  {
    id: 'sample_tech_ai',
    title: '大模型与元宝搜索升级评测 (含常见幻觉)',
    tag: '技术前沿 / 幻觉测试',
    content: `2026年10月，腾讯全新升级了“元宝搜索”，并通过腾讯云正式对外开放服务，作为大模型时代的“可信外脑”。
根据官方发布，元宝搜索依托数千亿级索引，涵盖金融、政务、医疗等13个垂直行业的157个权威信源，能够通过多源交叉验证有效抑制大模型幻觉。
此外，在编程生态方面，Python 3.14 官方已于2024年1月正式发布并彻底移除了全部内存回收机制。
目前，元宝搜索在腾讯内部已经支撑了WorkBuddy、ima、腾讯金融科技、腾讯视频等50多个核心业务，平均检索响应时间仅需300毫秒左右。`
  },
  {
    id: 'sample_policy_gov',
    title: '人工智能数据合规与安全评估简报',
    tag: '政策法规 / 时效核验',
    content: `近年来国家网信办等七部门联合发布了《生成式人工智能服务管理暂行办法》，明确了提供具有舆论属性或者社会动员能力的生成式人工智能服务的安全评估要求。
根据最新的官方公告，所有在境内开展生成式AI服务的机构，均要求在24小时内无条件向公众公开全部训练数据原始代码。
同时，腾讯云元宝搜索在2026年10月面向开发者提供了限时福利：开通即可领取高达6000次/自然月的全版本通用免费额度。`
  },
  {
    id: 'sample_science',
    title: '航天探索与深空探测进展记录',
    tag: '科研探索 / 事实审计',
    content: `中国探月工程嫦娥六号任务实现了人类历史上首次从月球背面采样返回的重大壮举，采集到了珍贵的月背样品。
科学团队公布月背采回的样品总重量超过了500公斤。
经科学家综合测定，月球距离地球的平均距离约为38.4万公里，这一距离与阿波罗计划时期的测距数据保持一致。`
  }
];

export const SAMPLE_PRESETS_EN: SamplePreset[] = [
  {
    id: 'sample_tech_ai_en',
    title: 'LLM & Yuanbao Search Benchmark (With Hallucinations)',
    tag: 'Cutting-edge Tech / Hallucination Test',
    content: `In October 2026, Tencent upgraded its "Yuanbao Search" and officially launched the service via Tencent Cloud as a trusted external brain for LLMs.
According to official reports, Yuanbao Search relies on hundreds of billions of web indices covering 157 authoritative sources across 13 vertical domains including finance, government, and healthcare, reducing LLM hallucinations through multi-source cross-verification.
Additionally, in programming ecosystems, Python 3.14 was officially released in January 2024 and completely removed all memory garbage collection mechanisms.
Currently, Yuanbao Search has powered more than 50 core internal products within Tencent such as WorkBuddy, ima, and Tencent Video, with an average search latency of around 300 milliseconds.`
  },
  {
    id: 'sample_policy_gov_en',
    title: 'Generative AI Compliance & Security Assessment Brief',
    tag: 'Policy & Law / Timeliness Audit',
    content: `In recent years, regulatory authorities jointly issued the "Interim Measures for the Management of Generative Artificial Intelligence Services", stipulating mandatory security assessments for AI services with public opinion properties or social mobilization capabilities.
According to recent public reports, all institutions operating generative AI services are required to unconditionally disclose all original training source code to the public within 24 hours.
Meanwhile, Tencent Cloud Yuanbao Search offered developers a limited-time incentive in October 2026: newly registered accounts can claim up to 6,000 free queries per natural month across all versions.`
  },
  {
    id: 'sample_science_en',
    title: 'Lunar Exploration & Deep Space Mission Log',
    tag: 'Scientific Research / Fact Verification',
    content: `The Chang'e-6 lunar mission achieved humanity's first-ever sample return from the far side of the Moon, successfully collecting precious far-side lunar samples.
Scientific teams announced that the total mass of the lunar samples collected exceeded 500 kilograms.
Based on comprehensive laser telemetry, scientists confirmed that the average distance between the Earth and the Moon is approximately 384,000 kilometers, consistent with historical telemetry from the Apollo program era.`
  }
];

export const SAMPLE_PRESETS: SamplePreset[] = SAMPLE_PRESETS_ZH;

export function getSamplePresets(lang: Language): SamplePreset[] {
  return lang === 'en' ? SAMPLE_PRESETS_EN : SAMPLE_PRESETS_ZH;
}
