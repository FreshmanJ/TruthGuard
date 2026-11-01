export type Language = 'zh' | 'en';

export interface Translations {
  common: {
    close: string;
    cancel: string;
    confirm: string;
    save: string;
    copy: string;
    copied: string;
    retry: string;
    success: string;
    warning: string;
    error: string;
    unknown: string;
    preview: string;
  };
  header: {
    brandName: string;
    brandTagline: string;
    onlineBadge: string;
    studioSubtitle: string;
    claimsCount: string;
    items: string;
    healthScore: string;
    statusPaused: string;
    statusSearching: string;
    resume: string;
    pause: string;
    abort: string;
    resumeTitle: string;
    pauseTitle: string;
    abortTitle: string;
    extensionBtn: string;
    extensionTitle: string;
    extensionBadge: string;
    settingsBtn: string;
    settingsTitle: string;
    githubTitle: string;
    langSwitchTitle: string;
    backToHeroTitle: string;
  };
  hero: {
    topPill: string;
    extPill: string;
    mainTitle1: string;
    mainTitle2: string;
    subtitle: string;
    pillLatency: string;
    pillSources: string;
    pillEvidence: string;
    pillMultimodal: string;
    capabilitiesCategory: string;
    capabilitiesTitle: string;
    cap1Title: string;
    cap1Desc: string;
    cap2Title: string;
    cap2Desc: string;
    cap3Title: string;
    cap3Desc: string;
    vsCategory: string;
    vsTitle: string;
    llmTitle: string;
    llm1: string;
    llm2: string;
    llm3: string;
    llm4: string;
    tgTitle: string;
    tg1: string;
    tg2: string;
    tg3: string;
    tg4: string;
  };
  editor: {
    title: string;
    wordCountSuffix: string;
    imageCountSuffix: string;
    readTimePrefix: string;
    readTimeSuffix: string;
    modeText: string;
    modeTextTitle: string;
    modeDoc: string;
    modeDocTitle: string;
    modeUrl: string;
    modeUrlTitle: string;
    clearDraft: string;
    clearDraftTitle: string;
    quickSamples: string;
    sampleDocLabel: string;
    sampleUrlLabel: string;
    textModeHint: string;
    chooseDocBtn: string;
    changeDocBtn: string;
    parsingDocNotice: string;
    urlPlaceholder: string;
    fetchUrlBtn: string;
    fetchingUrlBtn: string;
    extractedMedia: string;
    clickToViewImg: string;
    viewHDExtension: string;
    placeholderText: string;
    placeholderDoc: string;
    placeholderUrl: string;
    injectCitationsBtn: string;
    injectCitationsTitle: string;
    startCheckBtn: string;
    startCheckWithPrecheckBtn: string;
    recheckBtn: string;
    checkingBtn: string;
    pauseCheckBtn: string;
    resumeCheckBtn: string;
    lightboxTitle: string;
    lightboxHint: string;
    lightboxCloseHint: string;
  };
  logs: {
    title: string;
    countPrefix: string;
    countSuffix: string;
    statusReady: string;
    statusCompleted: string;
    statusPaused: string;
    statusRunning: string;
    autoScroll: string;
    on: string;
    off: string;
    emptyTitle: string;
    emptyDesc: string;
    tagTimeout: string;
    tagAuth: string;
    tagRateLimit: string;
    tagServer: string;
    tagDegraded: string;
    tagInspect: string;
    tagExtract: string;
    tagSearch: string;
    tagSuccess: string;
    tagWarn: string;
    tagError: string;
    tagThinking: string;
    tagInfo: string;
    tagRetry: string;
    thinkingActive: string;
    thinkingStreaming: string;
    thinkingSenseNova: string;
    thinkingCharCount: string;
    thinkingStreamingNotice: string;
    expand: string;
    collapse: string;
    organizingThoughts: string;
    footerLeft: string;
    footerRight: string;
  };
  tree: {
    title: string;
    branchesCount: string;
    inspectingStatus: string;
    extractingMediaStatus: string;
    extractingClaimsStatus: string;
    readyStatus: string;
    readyDocStatus: string;
    node1Title: string;
    node1SubtitleDoc: string;
    node1SubtitleUrl: string;
    node2Title: string;
    node2Subtitle: string;
    node3Title: string;
    node3Subtitle: string;
    node4Title: string;
    node4Subtitle: string;
    node5Title: string;
    node5Subtitle: string;
    node6Title: string;
    node6Subtitle: string;
    node7Title: string;
    node7Subtitle: string;
    zoomIn: string;
    zoomOut: string;
    fitView: string;
    resetView: string;
    panHint: string;
    probeCount: string;
    sourcesCount: string;
    latency: string;
    statusSuccess: string;
    statusWarning: string;
    statusDanger: string;
    statusPending: string;
    closeView: string;
  };
  report: {
    title: string;
    subtitle: string;
    healthScoreTitle: string;
    healthScoreDesc: string;
    totalClaims: string;
    verified: string;
    disputed: string;
    refuted: string;
    unverifiable: string;
    tokenSavings: string;
    tokenSavingsDesc: string;
    tabAll: string;
    tabVerified: string;
    tabDisputed: string;
    tabRefuted: string;
    tabUnverifiable: string;
    viewCertificate: string;
    viewBenchmark: string;
    injectCitations: string;
    applyAllCorrections: string;
    verdictVerified: string;
    verdictDisputed: string;
    verdictRefuted: string;
    verdictUnverifiable: string;
    confidenceLabel: string;
    causalBadge: string;
    contextBadge: string;
    causalPremiseLabel: string;
    contextSnippetLabel: string;
    searchKeywordsLabel: string;
    evidenceSourcesTitle: string;
    viewAllSources: string;
    correctionTitle: string;
    applyCorrectionBtn: string;
    citationFootnoteTitle: string;
    copyCitationBtn: string;
    copied: string;
    modalSourcesTitle: string;
    filterBySite: string;
    allSites: string;
    visitSource: string;
    copyLink: string;
    itemCount: string;
    noPassage: string;
    noClaimsFound: string;
    categoryNumeric: string;
    categoryVersion: string;
    categoryTemporal: string;
    categoryPolicy: string;
    categoryScientific: string;
    categoryEntity: string;
    categoryGeneral: string;
  };
  settings: {
    title: string;
    subtitle: string;
    yuanbaoKeyTitle: string;
    yuanbaoKeyDesc: string;
    yuanbaoKeyPlaceholder: string;
    testYuanbaoBtn: string;
    testing: string;
    aiKeyTitle: string;
    aiKeyDesc: string;
    aiKeyPlaceholder: string;
    testAiBtn: string;
    baseUrlTitle: string;
    modelTitle: string;
    citationFormatTitle: string;
    citationFootnote: string;
    citationGbt7714: string;
    citationIeee: string;
    searchCountTitle: string;
    reasoningEffortTitle: string;
    effortNone: string;
    effortLow: string;
    effortMedium: string;
    effortHigh: string;
    effortMax: string;
    streamingTitle: string;
    streamingDesc: string;
    resetBtn: string;
    cancelBtn: string;
    saveBtn: string;
    savedToast: string;
    securityNotice: string;
    testSuccess: string;
    testFailed: string;
  };
  certificate: {
    modalTitle: string;
    certTitle: string;
    certSubtitle: string;
    sealText: string;
    timeLabel: string;
    engineLabel: string;
    engineValue: string;
    hashLabel: string;
    scoreLabel: string;
    hallucinationRateLabel: string;
    sectionStats: string;
    sectionClaims: string;
    exportMd: string;
    printPdf: string;
    verifiedText: string;
    disputedText: string;
    refutedText: string;
    unverifiableText: string;
    tokenSavingsText: string;
  };
  benchmark: {
    title: string;
    subtitle: string;
    contextTokenReduction: string;
    tokenSavingsTitle: string;
    tokenSavingsDesc: string;
    latencyTitle: string;
    latencyYuanbao: string;
    latencyTraditional: string;
    metricComparison: string;
    cleanRateTitle: string;
    cleanRateDesc: string;
    apiSpeedTitle: string;
    apiSpeedDesc: string;
    cardTraditionalTitle: string;
    cardTraditionalSourceSize: string;
    cardTraditionalTokenCost: string;
    cardTraditionalLatency: string;
    cardTraditionalMaintenance: string;
    cardTraditionalMaintenanceVal: string;
    cardYuanbaoTitle: string;
    cardYuanbaoSourceSize: string;
    cardYuanbaoSourceSizeVal: string;
    cardYuanbaoTokenCost: string;
    cardYuanbaoLatency: string;
    cardYuanbaoAuthority: string;
    cardYuanbaoAuthorityVal: string;
    whyTitle: string;
    whyDesc: string;
    closeBtn: string;
  };
  extension: {
    title: string;
    subtitle: string;
    mv3Badge: string;
    heroPill: string;
    heroTitle: string;
    heroDesc: string;
    downloadBtn: string;
    downloadedNotice: string;
    downloadZipNotice: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    stepsTitle: string;
    stepsSubtitle: string;
    stepBadge: string;
    step1Title: string;
    step1: string;
    step1Desc: string;
    step2Title: string;
    step2: string;
    step2Desc: string;
    step3Title: string;
    step3: string;
    step3Desc: string;
    step4Title: string;
    step4: string;
    step4Desc: string;
    footerTech: string;
    githubSource: string;
    downloadZipBtn: string;
    gotItBtn: string;
    storeInstallBtn: string;
    guideBtn: string;
    guideBtnTooltip: string;
  };
  footer: {
    footnoteTitle: string;
    fn1Label: string;
    fn1Text: string;
    fn2Label: string;
    fn2Text: string;
    fn3Label: string;
    fn3Text: string;
    brandName: string;
    creatorLabel: string;
    brandSlogan: string;
    githubLink: string;
    settingsLink: string;
    copyright: string;
  };
  businessProgress: {
    paused: string;
    inspecting: string;
    extracting: string;
    searching: string;
    searchingInit: string;
    verifying: string;
    verifyingInit: string;
    synthesizing: string;
    completed: string;
    defaultSearching: string;
  };
}

export const translations: Record<Language, Translations> = {
  zh: {
    common: {
      close: '关闭',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      copy: '复制',
      copied: '已复制!',
      retry: '重试',
      success: '成功',
      warning: '警告',
      error: '错误',
      unknown: '未知',
      preview: '预览',
    },
    header: {
      brandName: 'TruthGuard',
      brandTagline: '事实检察官',
      onlineBadge: '腾讯元宝搜索 · 权威信源实时联网',
      studioSubtitle: 'Veritas AI Fact-Checking & Academic Citation Studio',
      claimsCount: '核验命题:',
      items: '项',
      healthScore: '健康度得分:',
      statusPaused: '检测已挂起',
      statusSearching: '穿透检索中...',
      resume: '继续',
      pause: '暂停',
      abort: '终止',
      resumeTitle: '恢复继续执行',
      pauseTitle: '暂停当前检测',
      abortTitle: '终止后续流程',
      extensionBtn: '浏览器插件',
      extensionTitle: '前往微软官方商店一键安装 TruthGuard 浏览器划词事实核验插件',
      extensionBadge: '微软商店',
      settingsBtn: '设置',
      settingsTitle: 'API 凭证与模型配置',
      githubTitle: '在 GitHub 上查看开源源码与 Star',
      langSwitchTitle: '切换界面语言 (中文 / English)',
      backToHeroTitle: '返回产品介绍形态',
    },
    hero: {
      topPill: '腾讯元宝搜索 · 权威多源事实穿透审校引擎',
      extPill: '🧩 浏览器插件已上架微软商店 · 点击一键安装',
      mainTitle1: 'AI 时代的事实护盾',
      mainTitle2: 'TruthGuard 事实检察官',
      subtitle: '终结大模型幻觉与不实论述。依托腾讯元宝搜索 (WSA) 数千亿级全网与 157+ 垂直行业权威信源，毫秒级完成客观命题拆解、深网探针穿透与交叉裁决，一键输出学术引用与数字背书证书。',
      pillLatency: '毫秒级检索 (~350ms)',
      pillSources: '直通 157+ 垂直权威信源',
      pillEvidence: '100% 可溯源证据链条',
      pillMultimodal: '3合1 文本/文档/网页多模态',
      capabilitiesCategory: 'Core Capabilities · 核心三维事实壁垒',
      capabilitiesTitle: '全链路事实穿透审校体系',
      cap1Title: '1. 命题客观解构与因果剥离',
      cap1Desc: '深度提炼长篇技术草稿、论文或研报，自动剥除主观修饰，提取客观可证伪的单点事实、数值区间与核心因果前置条件。',
      cap2Title: '2. 腾讯元宝自适应搜索探针',
      cap2Desc: '依托元宝搜索千亿权威网页大底座。针对复杂复合命题自适应分裂 1~3 路垂直检索探针，毫秒级召回官方权威证据。',
      cap3Title: '3. 多源证据交叉仲裁与背书',
      cap3Desc: '交叉比对多方冲突证据链，输出证实(🟢)、存疑(🟡)、虚假(🔴)红绿灯置信度，自动追加 GB/T 7714 规范引用与防伪背书。',
      vsCategory: 'Pain Point & Solution · 为什么需要事实检察官？',
      vsTitle: '传统大模型生成 vs TruthGuard 事实检察官',
      llmTitle: '传统大模型生成 / 未核验内容',
      llm1: '严重幻觉困境：一本正经捏造不存在的科研论文、虚构数据与虚假引用。',
      llm2: '知识库时效滞后：受限于训练截止时间，无法掌握当月乃至当日最新事实与政策。',
      llm3: '缺乏可查验证据：输出内容无确凿权威信源支撑，在学术与商业场景中风险极高。',
      llm4: '假因果强行归因：将两件微弱关联事件强行推导为因果关系。',
      tgTitle: 'TruthGuard 事实检察官 + 腾讯元宝搜索',
      tg1: '直连千亿权威全网：毫秒级直通腾讯元宝权威索引，召回官方公报与学术智库。',
      tg2: '命题与因果客观解构：不仅审校单点事实，更严格推敲前置假定与因果链条。',
      tg3: '标准学术引注一键注入：自动在正文末尾追加 GB/T 7714 规范文献引用列表。',
      tg4: '数字防伪背书证书：生成带有专属 SHA-256 哈希指纹的事实审计报告。',
    },
    editor: {
      title: '待检查原稿',
      wordCountSuffix: '字',
      imageCountSuffix: '图',
      readTimePrefix: '约',
      readTimeSuffix: '分钟',
      modeText: '文字录入',
      modeTextTitle: '切换为文字录入模式，支持直接键盘键入或粘贴文章长文',
      modeDoc: '文档导入',
      modeDocTitle: '切换为文档导入模式，支持 Word (.docx)、PDF (.pdf)、TXT 文档',
      modeUrl: '网页链接',
      modeUrlTitle: '切换为网页链接模式，输入 URL 自动穿透抓取网页正文与配图',
      clearDraft: '清空原稿',
      clearDraftTitle: '一键清空原稿文本、重置导入文档或网页链接',
      quickSamples: '快捷样例:',
      sampleDocLabel: '样例文档:',
      sampleUrlLabel: '样例链接:',
      textModeHint: '直接在下方编辑区键入或粘贴待核验草稿',
      chooseDocBtn: '选择本地 Word / PDF / TXT',
      changeDocBtn: '更换本地文档',
      parsingDocNotice: '正在校验魔数并提取图文...',
      urlPlaceholder: '键入待审校的公网文章或论文 URL，如 https://...',
      fetchUrlBtn: '提取网页',
      fetchingUrlBtn: '抓取中...',
      extractedMedia: '提取图文 ({count} 张)',
      clickToViewImg: '点击插图可放大查看:',
      viewHDExtension: '查看高清插图',
      placeholderText: '在此键入或粘贴需进行事实核验的技术博客、论文草稿、商业分析或大模型初稿...\n\n✦ 系统将自动提取可客观证伪命题\n✦ 调用腾讯云元宝搜索千亿信源进行毫秒级交叉审校\n✦ 自动给出红绿灯置信度裁决并生成规范引用',
      placeholderDoc: '在此直接查看或修改从 Word/PDF/TXT 文档中解析出的正文...\n\n✦ 系统将先执行：1. 格式与可用性预检 → 2. 多模态图文提取 → 3. 命题智能拆解\n✦ 随后毫秒级调用腾讯元宝搜索千亿信源进行事实交叉审校',
      placeholderUrl: '在此直接查看或修改从网页链接中抓取出的文章正文...\n\n✦ 系统将先执行：1. 协议与可用性预检 → 2. 多模态图文提取 → 3. 命题智能拆解\n✦ 随后毫秒级调用腾讯元宝搜索千亿信源进行事实交叉审校',
      injectCitationsBtn: '注入引用角标',
      injectCitationsTitle: '根据元宝搜索核验信源，在原文末尾自动追加学术引用角标与信源清单',
      startCheckBtn: '开始检查',
      startCheckWithPrecheckBtn: '开始检查 (预检 → 提取 → 审校)',
      recheckBtn: '重新检查',
      checkingBtn: '正在检查中...',
      pauseCheckBtn: '暂停检查',
      resumeCheckBtn: '继续检查',
      lightboxTitle: '抽取的多模态插图预览',
      lightboxHint: '信源多模态图表 · 支持原稿事实与图表核验',
      lightboxCloseHint: '点击任意空白处关闭',
    },
    logs: {
      title: '2. 实时流水日志 (Stream Logs)',
      countPrefix: '• 共',
      countSuffix: '条记录',
      statusReady: '就绪待命',
      statusCompleted: '审校已完成',
      statusPaused: '已暂停',
      statusRunning: '穿透中',
      autoScroll: '自动滚屏',
      on: '开',
      off: '关',
      emptyTitle: '等待事实穿透检测启动',
      emptyDesc: '点击「开始检查」，底层与元宝搜索、大模型的每一次具体网络请求与毫秒响应将在此实时展现。',
      tagTimeout: '超时重试',
      tagAuth: '鉴权错误',
      tagRateLimit: '频控超限',
      tagServer: '服务故障',
      tagDegraded: '规则降级',
      tagInspect: '来源预检',
      tagExtract: '图文提取',
      tagSearch: 'WSA搜索',
      tagSuccess: '证实通过',
      tagWarn: '幻觉拦截',
      tagError: '执行异常',
      tagThinking: '深度思考',
      tagInfo: '系统事件',
      tagRetry: '接口重试',
      thinkingActive: '深度思考中',
      thinkingStreaming: '流式思考中...',
      thinkingSenseNova: 'SenseNova 深度思维链',
      thinkingCharCount: '共 {count} 字符',
      thinkingStreamingNotice: '(流式推理中)',
      expand: '展开',
      collapse: '收起',
      organizingThoughts: '正在组织深度思维链...',
      footerLeft: '腾讯云元宝搜索 WSA · 毫秒级千亿索引',
      footerRight: 'SenseNova 交叉比对引擎',
    },
    tree: {
      title: '3. 事实穿透工作树图谱 (Interactive Tree Graph)',
      branchesCount: '已展开 {count} 个分支树',
      inspectingStatus: '正在进行来源格式预检...',
      extractingMediaStatus: '正在抽取多模态图文...',
      extractingClaimsStatus: '正在语义拆解事实命题...',
      readyStatus: '就绪 (1个根节点)',
      readyDocStatus: '就绪 (预检与图文提取前置节点已就绪)',
      node1Title: 'Node 1 · 来源预检',
      node1SubtitleDoc: '文件架构与安全魔数校验',
      node1SubtitleUrl: '网络协议与连通性校验',
      node2Title: 'Node 2 · 多模态图文',
      node2Subtitle: '正文拓扑与图表抽取',
      node3Title: 'Node 3 · 待核验原稿',
      node3Subtitle: '长程语义上下文',
      node4Title: 'Node 4 · 命题客观解构',
      node4Subtitle: '因果约束与前置剥离',
      node5Title: 'Node 5 · 腾讯元宝搜索探针',
      node5Subtitle: 'WSA 权威千亿索引',
      node6Title: 'Node 6 · 证据交叉仲裁',
      node6Subtitle: '红绿灯三维可信裁决',
      node7Title: 'Node 7 · 审校背书与报告',
      node7Subtitle: 'GB/T 7714 规范引用 & 防伪证书',
      zoomIn: '放大视图 (最高 100%)',
      zoomOut: '缩小视图',
      fitView: '自适应画布 (全景展示)',
      resetView: '还原至 100% 原始大小',
      panHint: '💡 滚轮缩放 (最高100%) · 按住拖拽平移',
      probeCount: '{count} 路探针',
      sourcesCount: '{count} 篇证据',
      latency: '{ms}ms',
      statusSuccess: '证实',
      statusWarning: '存疑',
      statusDanger: '虚假',
      statusPending: '待定',
      closeView: '关闭',
    },
    report: {
      title: '4. 事实穿透审校总览与明细报告',
      subtitle: '基于腾讯元宝搜索千亿权威索引与大模型深度比对交叉仲裁',
      healthScoreTitle: '事实健康度评分',
      healthScoreDesc: '基于权威信源证实率与因果严谨性综合计算',
      totalClaims: '事实断言总数',
      verified: '权威证实',
      disputed: '存疑/时效差异',
      refuted: '事实错误/幻觉',
      unverifiable: '无法核验',
      tokenSavings: 'Token 节省率',
      tokenSavingsDesc: '元宝搜索精炼证据 vs 原始网页抓取',
      tabAll: '全部命题',
      tabVerified: '🟢 权威证实',
      tabDisputed: '🟡 存疑/时效',
      tabRefuted: '🔴 事实错误',
      tabUnverifiable: '⚪ 无法核验',
      viewCertificate: '审计背书证书',
      viewBenchmark: '能效评测',
      injectCitations: '注入引用角标',
      applyAllCorrections: '一键修正全部幻觉',
      verdictVerified: '权威证实',
      verdictDisputed: '时效存疑 / 争议',
      verdictRefuted: '事实错误 / 幻觉',
      verdictUnverifiable: '无法核验',
      confidenceLabel: '置信度',
      causalBadge: '因果归因',
      contextBadge: '原文语境',
      causalPremiseLabel: '蕴含的前置因果链:',
      contextSnippetLabel: '原文前后语境上下文:',
      searchKeywordsLabel: '元宝检索探针:',
      evidenceSourcesTitle: '元宝搜索权威外部证据',
      viewAllSources: '查看全部信源',
      correctionTitle: '💡 官方事实纠错建议',
      applyCorrectionBtn: '应用此项修正',
      citationFootnoteTitle: '📖 学术标准文献引用',
      copyCitationBtn: '复制引用',
      copied: '已复制!',
      modalSourcesTitle: '元宝搜索权威召回信源全库',
      filterBySite: '按权威站点过滤:',
      allSites: '全部权威信源',
      visitSource: '查看原文',
      copyLink: '复制链接',
      itemCount: '项',
      noPassage: '暂无摘要证据段落',
      noClaimsFound: '暂未发现对应状态的事实命题',
      categoryNumeric: '数值事实',
      categoryVersion: '版本事实',
      categoryTemporal: '时效/历史',
      categoryPolicy: '政策法规',
      categoryScientific: '科学事实',
      categoryEntity: '实体关系',
      categoryGeneral: '综合事实',
    },
    settings: {
      title: 'TruthGuard 系统设置与 API 密钥',
      subtitle: '配置腾讯云元宝搜索 (WSA) 凭证与 SenseNova / 大模型推理引擎',
      yuanbaoKeyTitle: '腾讯云元宝搜索 API Key (WSA - SearchPro)',
      yuanbaoKeyDesc: '用于调用元宝搜索千亿权威网页索引与垂直信源。支持直接在腾讯云官网开通免费体验额度。',
      yuanbaoKeyPlaceholder: 'sk-...',
      testYuanbaoBtn: '测试元宝搜索连通性',
      testing: '测试中...',
      aiKeyTitle: 'SenseNova / OpenAI 兼容大模型 API Key',
      aiKeyDesc: '用于事实命题语义长程提取、上下文因果审校与交叉仲裁裁决。',
      aiKeyPlaceholder: 'sk-...',
      testAiBtn: '测试大模型连通性',
      baseUrlTitle: '大模型 API 请求端点 (Base URL)',
      modelTitle: '模型型号 (Model Name)',
      citationFormatTitle: '自动引用角标格式',
      citationFootnote: '脚注形式 [^1]',
      citationGbt7714: 'GB/T 7714 规范',
      citationIeee: 'IEEE 国际规范',
      searchCountTitle: '元宝搜索每次召回结果数 (Search Count)',
      reasoningEffortTitle: '思维链推理深度 (Reasoning Effort)',
      effortNone: '无 (极速响应)',
      effortLow: '低 (敏捷思考，推荐)',
      effortMedium: '中 (标准推演)',
      effortHigh: '高 (深度推演)',
      effortMax: '极高 (最大深度)',
      streamingTitle: '流式输出响应 (Server-Sent Events)',
      streamingDesc: '实时展示大模型思考过程与推理片段',
      resetBtn: '恢复默认配置',
      cancelBtn: '取消',
      saveBtn: '保存配置',
      savedToast: '配置已保存至本地沙箱!',
      securityNotice: '本地沙箱存储：API Key 仅安全存储于您浏览器的 localStorage 中，绝不会上传至第三方服务器。',
      testSuccess: '连通性测试通过',
      testFailed: '测试失败',
    },
    certificate: {
      modalTitle: '事实审计健康度背书证书',
      certTitle: 'FACT-CHECKING ENDORSEMENT CERTIFICATE',
      certSubtitle: '事实审计健康度与文献溯源背书证书',
      sealText: '腾讯云元宝搜索 · 权威防伪认证',
      timeLabel: '生成时间:',
      engineLabel: '权威检索基座:',
      engineValue: '腾讯云元宝搜索 (Tencent Yuanbao Search / WSA)',
      hashLabel: '文档审计指纹:',
      scoreLabel: '事实健康度评分:',
      hallucinationRateLabel: '幻觉识别率:',
      sectionStats: '一、核验统计总览',
      sectionClaims: '二、命题逐项核验明细',
      exportMd: '导出 Markdown 报告',
      printPdf: '打印 / 存为 PDF',
      verifiedText: '权威信源证实',
      disputedText: '时效争议与存疑',
      refutedText: '事实错误与幻觉',
      unverifiableText: '无法核验',
      tokenSavingsText: '元宝搜索 Token 节省',
    },
    benchmark: {
      title: '元宝搜索 vs 传统网络爬虫能效评测 (Benchmark)',
      subtitle: '大模型输入信息去噪率与上下文 Token 成本对比',
      contextTokenReduction: 'CONTEXT TOKEN REDUCTION',
      tokenSavingsTitle: 'Token 消耗直降 {savings}%',
      tokenSavingsDesc: '元宝搜索在云端完成千亿向量实时索引与 Gist Token 压缩去噪，无需输入冗余 HTML 网页代码。',
      latencyTitle: '端到端检索耗时',
      latencyYuanbao: '元宝搜索: ~350ms (精炼段落直出)',
      latencyTraditional: '传统抓取: ~2800ms (HTML解析+清洗)',
      metricComparison: '核心评测指标比对',
      cleanRateTitle: '证据信息密度',
      cleanRateDesc: '元宝搜索提供经权威认证的事实切片，滤除 99% 的前端脚手架与广告噪声。',
      apiSpeedTitle: '多路并发吞吐',
      apiSpeedDesc: '毫秒级支撑 1~3 路垂直探针并发召回，保障学术与商业事实核验的极致时效。',
      cardTraditionalTitle: '传统网页抓取 + 粗清洗',
      cardTraditionalSourceSize: '单信源原始大小',
      cardTraditionalTokenCost: '单轮核验消耗 Token',
      cardTraditionalLatency: '平均检索时延',
      cardTraditionalMaintenance: '维护成本',
      cardTraditionalMaintenanceVal: '高（代理池、反爬对抗）',
      cardYuanbaoTitle: '腾讯云元宝搜索 (WSA)',
      cardYuanbaoSourceSize: '精排事实摘要大小',
      cardYuanbaoSourceSizeVal: '~1.2 KB (纯事实段落)',
      cardYuanbaoTokenCost: '单轮核验消耗 Token',
      cardYuanbaoLatency: '平均检索时延',
      cardYuanbaoAuthority: '信源权威度',
      cardYuanbaoAuthorityVal: '157+ 头部权威行业信源',
      whyTitle: '为什么元宝搜索能让事实核查快又省？',
      whyDesc: '元宝搜索在云端完成分层聚类与去噪精排，直接向大模型输送高相关度的 passage 结构化摘要，省去了繁杂的爬虫、清洗与重排工程。结合高时效信源召回，构建起真正可信、低延迟的事实审校副驾驶。',
      closeBtn: '关闭评测面板',
    },
    extension: {
      title: 'TruthGuard 浏览器事实核验插件',
      subtitle: '微软 Edge 官方商店安全认证 · 随时随地选中文本一键核验、全屏工作过程树与 PDF 报告导出',
      mv3Badge: '已上架微软 Edge 官方商店',
      heroPill: '微软官方商店认证 · 一键极速安装',
      heroTitle: '将 TruthGuard 事实外脑装进您的浏览器',
      heroDesc: '已正式通过微软 Edge 官方应用商店安全认证审核！支持在知乎、微信公众号、知网、新闻门户等任意网页划选文本即时核验，展开全屏拓扑过程树，导出权威 PDF 审计报告。',
      downloadBtn: '前往微软官方商店一键安装',
      downloadedNotice: '正在跳转微软商店...',
      downloadZipNotice: '官方安全认证 · 免开发者模式 · 一键获取',
      pillar1Title: '1. 选中文本即检 & 悬浮工作窗',
      pillar1Desc: '在网页内划选任意陈述，出现「🛡️ 事实核验」小按钮。右下角轻量浮窗实时呈现元宝千亿检索与仲裁进度。',
      pillar2Title: '2. 点击小箭头展开全屏工作树',
      pillar2Desc: '在浮窗中点击小箭头，即可平滑展开全屏工作过程拓扑树（与本网页工作树完全一致），支持画布缩放与拖拽。',
      pillar3Title: '3. 一键展开报告 & 导出 PDF',
      pillar3Desc: '审校完成后小浮窗自动变为「查看报告」按钮，点击弹出详细仲裁与信源证据，可一键下载为高清 PDF 报告。',
      stepsTitle: '微软官方商店 1 秒极速安装指南',
      stepsSubtitle: '适用于 Microsoft Edge 及所有 Chromium 内核浏览器（Chrome、Brave、360极速等）',
      stepBadge: '第 {step} 步',
      step1Title: '访问官方商店',
      step1: '1. 访问微软扩展商店',
      step1Desc: '点击「前往微软商店」按钮，直达 TruthGuard 官方扩展详情页。',
      step2Title: '点击获取安装',
      step2: '2. 点击「获取」按钮',
      step2Desc: '在商店页面右上方点击蓝色的「获取 (Get)」按钮，确认添加扩展。',
      step3Title: '自动完成安装',
      step3: '3. 浏览器自动启用',
      step3Desc: '浏览器会自动下载并完成安装，右上角扩展栏将亮起 TruthGuard 盾牌图标。',
      step4Title: '任意网页划选体验',
      step4: '4. 任意网页划选核验',
      step4Desc: '在任意网页划选文本，点击「🛡️ 事实核验」按钮，即刻展开全屏工作树与审计！',
      footerTech: '技术基座：腾讯云元宝搜索 (WSA API) • 创作者: freshmanJ',
      githubSource: 'GitHub 源码',
      downloadZipBtn: '离线 zip 安装包 (备用)',
      gotItBtn: '我知道了',
      storeInstallBtn: '前往微软商店安装',
      guideBtn: '功能介绍 & 离线包',
      guideBtnTooltip: '查看插件功能演示与离线安装包',
    },
    footer: {
      footnoteTitle: '系统架构与事实核验标准脚注 (System Footnotes)',
      fn1Label: '[1] 检索基座：',
      fn1Text: '依托腾讯云元宝搜索 (Tencent Yuanbao Search / WSA) 官方 API 构建，直连全网千亿权威网页、政务公开与主流垂直智库，毫秒级召回事实证据。',
      fn2Label: '[2] 事实裁决：',
      fn2Text: '客观命题拆解与多源证据链仲裁由大模型自适应推理完成，审校建议仅作为学术研究或专业内容创作的辅助校对参考。',
      fn3Label: '[3] 隐私与安全：',
      fn3Text: '原稿多模态检测与魔数匹配均于前端沙箱预检，不持久化存储用户的私密稿件。',
      brandName: 'TruthGuard 事实检察官',
      creatorLabel: '创作者:',
      brandSlogan: 'AI 时代的高保真事实护盾与学术文献溯源副驾驶',
      githubLink: 'GitHub 开源',
      settingsLink: '配置中心',
      copyright: '© 2026 freshmanJ. All Rights Reserved.',
    },
    businessProgress: {
      paused: '检测已挂起',
      inspecting: '正在执行来源预检与可用性分析...',
      extracting: '正在深度解析正文并提炼客观事实断言...',
      searching: '正在穿透元宝搜索 ({done}/{total})...',
      searchingInit: '正在调用腾讯云元宝搜索...',
      verifying: '正在多源证据交叉裁决 ({done}/{total})...',
      verifyingInit: '正在交叉比对证据与因果链...',
      synthesizing: '正在生成审校背书画像与报告...',
      completed: '全链路审校已完成',
      defaultSearching: '穿透检索中...',
    },
  },
  en: {
    common: {
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      copy: 'Copy',
      copied: 'Copied!',
      retry: 'Retry',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      unknown: 'Unknown',
      preview: 'Preview',
    },
    header: {
      brandName: 'TruthGuard',
      brandTagline: 'Veritas Copilot',
      onlineBadge: 'Tencent Yuanbao Search · Real-time Authoritative Index',
      studioSubtitle: 'Veritas AI Fact-Checking & Academic Citation Studio',
      claimsCount: 'Claims:',
      items: 'claims',
      healthScore: 'Health Score:',
      statusPaused: 'Audit Paused',
      statusSearching: 'Auditing...',
      resume: 'Resume',
      pause: 'Pause',
      abort: 'Abort',
      resumeTitle: 'Resume execution',
      pauseTitle: 'Pause current audit',
      abortTitle: 'Abort remaining pipeline',
      extensionBtn: 'Extension',
      extensionTitle: 'Install TruthGuard Fact-Checking Extension from Microsoft Edge Add-ons',
      extensionBadge: 'Edge Store',
      settingsBtn: 'Settings',
      settingsTitle: 'API credentials & model configuration',
      githubTitle: 'View open source repository on GitHub',
      langSwitchTitle: 'Switch language (中文 / English)',
      backToHeroTitle: 'Back to product overview',
    },
    hero: {
      topPill: 'Tencent Yuanbao Search · Authoritative Multi-Source Fact Verification Engine',
      extPill: '🧩 Browser Extension Live on Microsoft Store · 1-Click Install',
      mainTitle1: 'Fact Shield in the AI Era',
      mainTitle2: 'TruthGuard Veritas Copilot',
      subtitle: 'Eliminate LLM hallucinations and misinformation. Powered by Tencent Yuanbao Search (WSA) with hundreds of billions of web indices and 157+ vertical authoritative sources, executing claim extraction, deep web probing, and cross-source verification in milliseconds, with one-click academic citations and digital endorsement certificates.',
      pillLatency: 'Sub-second Retrieval (~350ms)',
      pillSources: '157+ Vertical Authoritative Sources',
      pillEvidence: '100% Traceable Evidence Chain',
      pillMultimodal: '3-in-1 Text/Doc/Web Multimodal',
      capabilitiesCategory: 'Core Capabilities · Three-Dimensional Fact Barriers',
      capabilitiesTitle: 'Full-Pipeline Fact-Checking Architecture',
      cap1Title: '1. Objective Claim Extraction & Causality Isolation',
      cap1Desc: 'Deeply parses technical drafts, papers, and reports to strip subjective phrasing, isolating falsifiable factual claims, numerical bounds, and causal premises.',
      cap2Title: '2. Tencent Yuanbao Adaptive Search Probes',
      cap2Desc: 'Leverages Tencent Yuanbao Search\'s multi-hundred-billion authoritative web index, adaptively splitting into 1-3 targeted search probes to retrieve authoritative evidence in milliseconds.',
      cap3Title: '3. Multi-Source Evidence Cross-Arbitration',
      cap3Desc: 'Cross-verifies conflicting evidence chains, providing clear green/yellow/red verdicts (Verified 🟢, Disputed 🟡, Refuted 🔴), and generating standard citations with anti-tamper certificates.',
      vsCategory: 'Pain Point & Solution · Why TruthGuard?',
      vsTitle: 'Traditional LLM Generation vs TruthGuard Copilot',
      llmTitle: 'Traditional LLMs / Unverified Content',
      llm1: 'Severe Hallucination: Confidently fabricates nonexistent research papers, fake statistics, and hallucinated citations.',
      llm2: 'Stale Knowledge: Bound by training cutoffs, unaware of latest current events, software versions, and policies.',
      llm3: 'Unverifiable Claims: Lacks grounded authoritative sources, creating severe liability in academic and professional settings.',
      llm4: 'False Causality Fallacy: Forcefully equates weak correlations into false causal attribution.',
      tgTitle: 'TruthGuard Copilot + Tencent Yuanbao Search',
      tg1: 'Direct Web Index: Sub-second access to Tencent Yuanbao\'s multi-hundred-billion index, retrieving government bulletins and academic papers.',
      tg2: 'Objective Claim & Causality Parsing: Examines not only isolated facts, but rigorously audits premises and causal linkages.',
      tg3: 'One-Click Academic Citations: Automatically appends standard GB/T 7714 / IEEE citations and footnotes.',
      tg4: 'Digital Endorsement Certificate: Generates a tamper-proof fact audit certificate with SHA-256 fingerprinting.',
    },
    editor: {
      title: 'Source Draft',
      wordCountSuffix: 'chars',
      imageCountSuffix: 'images',
      readTimePrefix: '~',
      readTimeSuffix: 'min read',
      modeText: 'Text Input',
      modeTextTitle: 'Switch to text mode: type or paste long-form content',
      modeDoc: 'Document Upload',
      modeDocTitle: 'Switch to document mode: supports Word (.docx), PDF (.pdf), TXT',
      modeUrl: 'Web URL',
      modeUrlTitle: 'Switch to URL mode: enter URL to crawl article text and images',
      clearDraft: 'Clear Draft',
      clearDraftTitle: 'Clear draft content, uploaded document or URL',
      quickSamples: 'Sample Presets:',
      sampleDocLabel: 'Sample Documents:',
      sampleUrlLabel: 'Sample URLs:',
      textModeHint: 'Type or paste your draft into the editor below',
      chooseDocBtn: 'Choose Word / PDF / TXT',
      changeDocBtn: 'Change Document',
      parsingDocNotice: 'Verifying magic bytes & extracting media...',
      urlPlaceholder: 'Enter public article or paper URL, e.g. https://...',
      fetchUrlBtn: 'Extract Webpage',
      fetchingUrlBtn: 'Fetching...',
      extractedMedia: 'Extracted Media ({count})',
      clickToViewImg: 'Click image to enlarge:',
      viewHDExtension: 'View full-resolution image',
      placeholderText: 'Type or paste your draft here (tech blog, academic paper, research report, or LLM output)...\n\n✦ Extracts falsifiable factual propositions\n✦ Queries Tencent Yuanbao Search index across hundreds of billions of web pages\n✦ Yields green/yellow/red verdicts and generates standard academic citations',
      placeholderDoc: 'Review and edit the text extracted from Word/PDF/TXT documents...\n\n✦ Pipeline: 1. Format & availability pre-check → 2. Multimodal extraction → 3. Claim parsing\n✦ Executes cross-source verification via Tencent Yuanbao Search',
      placeholderUrl: 'Review and edit the text crawled from the webpage URL...\n\n✦ Pipeline: 1. Protocol & availability pre-check → 2. Multimodal extraction → 3. Claim parsing\n✦ Executes cross-source verification via Tencent Yuanbao Search',
      injectCitationsBtn: 'Inject Citations',
      injectCitationsTitle: 'Appends academic citation markers [^1] and reference list based on Yuanbao Search evidence',
      startCheckBtn: 'Start Audit',
      startCheckWithPrecheckBtn: 'Start Audit (Pre-check → Extract → Verify)',
      recheckBtn: 'Re-audit',
      checkingBtn: 'Auditing...',
      pauseCheckBtn: 'Pause Audit',
      resumeCheckBtn: 'Resume Audit',
      lightboxTitle: 'Extracted Multimodal Image Preview',
      lightboxHint: 'Multimodal Evidence · Grounding for factual verification',
      lightboxCloseHint: 'Click outside to close',
    },
    logs: {
      title: '2. Real-Time Stream Logs',
      countPrefix: '•',
      countSuffix: 'records',
      statusReady: 'Ready',
      statusCompleted: 'Audit Completed',
      statusPaused: 'Paused',
      statusRunning: 'Auditing',
      autoScroll: 'Auto-scroll',
      on: 'ON',
      off: 'OFF',
      emptyTitle: 'Waiting for fact-checking pipeline to start',
      emptyDesc: 'Click "Start Audit" to observe live network requests and millisecond responses from Yuanbao Search and AI models in real time.',
      tagTimeout: 'Timeout Retry',
      tagAuth: 'Auth Error',
      tagRateLimit: 'Rate Limit',
      tagServer: 'Service Error',
      tagDegraded: 'Rule Fallback',
      tagInspect: 'Pre-check',
      tagExtract: 'Media Extract',
      tagSearch: 'WSA Search',
      tagSuccess: 'Verified',
      tagWarn: 'Hallucination',
      tagError: 'Exception',
      tagThinking: 'Deep Thinking',
      tagInfo: 'System Event',
      tagRetry: 'API Retry',
      thinkingActive: 'Thinking...',
      thinkingStreaming: 'Streaming thoughts...',
      thinkingSenseNova: 'SenseNova Chain of Thought',
      thinkingCharCount: '{count} chars',
      thinkingStreamingNotice: '(streaming)',
      expand: 'Expand',
      collapse: 'Collapse',
      organizingThoughts: 'Organizing thought chain...',
      footerLeft: 'Tencent Cloud Yuanbao Search WSA · Sub-second Index',
      footerRight: 'SenseNova Cross-Arbitration Engine',
    },
    tree: {
      title: '3. Interactive Fact-Checking Graph',
      branchesCount: '{count} branch trees expanded',
      inspectingStatus: 'Inspecting source format & security...',
      extractingMediaStatus: 'Extracting multimodal media...',
      extractingClaimsStatus: 'Extracting factual claims...',
      readyStatus: 'Ready (1 root node)',
      readyDocStatus: 'Ready (Pre-check & media extraction ready)',
      node1Title: 'Node 1 · Source Pre-check',
      node1SubtitleDoc: 'File Structure & Magic Bytes Security',
      node1SubtitleUrl: 'Network Protocol & Connectivity Check',
      node2Title: 'Node 2 · Multimodal Extraction',
      node2Subtitle: 'Text Topology & Figure Extraction',
      node3Title: 'Node 3 · Source Draft',
      node3Subtitle: 'Long-form Semantic Context',
      node4Title: 'Node 4 · Claim Extraction',
      node4Subtitle: 'Causality & Premise Isolation',
      node5Title: 'Node 5 · Yuanbao Search Probes',
      node5Subtitle: 'WSA Authoritative Index',
      node6Title: 'Node 6 · Evidence Cross-Arbitration',
      node6Subtitle: 'Three-Dimensional Credibility Verdict',
      node7Title: 'Node 7 · Fact Endorsement & Report',
      node7Subtitle: 'GB/T 7714 / IEEE Citations & Certificate',
      zoomIn: 'Zoom In (Max 100%)',
      zoomOut: 'Zoom Out',
      fitView: 'Fit View',
      resetView: 'Reset to 100%',
      panHint: '💡 Wheel to zoom (Max 100%) · Drag to pan',
      probeCount: '{count} probes',
      sourcesCount: '{count} sources',
      latency: '{ms}ms',
      statusSuccess: 'Verified',
      statusWarning: 'Disputed',
      statusDanger: 'Refuted',
      statusPending: 'Pending',
      closeView: 'Close',
    },
    report: {
      title: '4. Fact Verification Audit Report',
      subtitle: 'Cross-arbitrated via Tencent Yuanbao Search and LLM deep inference',
      healthScoreTitle: 'Overall Health Score',
      healthScoreDesc: 'Calculated from verification rate & causal validity',
      totalClaims: 'Total Claims',
      verified: 'Verified',
      disputed: 'Disputed',
      refuted: 'Refuted',
      unverifiable: 'Unverifiable',
      tokenSavings: 'Token Savings',
      tokenSavingsDesc: 'Yuanbao Search vs Raw Web Scrape',
      tabAll: 'All Claims',
      tabVerified: '🟢 Verified',
      tabDisputed: '🟡 Disputed',
      tabRefuted: '🔴 Refuted',
      tabUnverifiable: '⚪ Unverifiable',
      viewCertificate: 'Audit Certificate',
      viewBenchmark: 'Benchmark',
      injectCitations: 'Inject Citations',
      applyAllCorrections: 'Apply All Corrections',
      verdictVerified: 'Verified',
      verdictDisputed: 'Disputed / Stale',
      verdictRefuted: 'Refuted / False',
      verdictUnverifiable: 'Unverifiable',
      confidenceLabel: 'Confidence',
      causalBadge: 'Causal Attribution',
      contextBadge: 'Context Snippet',
      causalPremiseLabel: 'Underlying Causal Chain:',
      contextSnippetLabel: 'Contextual Surrounding Snippet:',
      searchKeywordsLabel: 'Yuanbao Search Probes:',
      evidenceSourcesTitle: 'Authoritative Yuanbao Evidence Sources',
      viewAllSources: 'View All Sources',
      correctionTitle: '💡 Fact Correction Suggestion',
      applyCorrectionBtn: 'Apply Correction',
      citationFootnoteTitle: '📖 Academic Standard Citation',
      copyCitationBtn: 'Copy Citation',
      copied: 'Copied!',
      modalSourcesTitle: 'Complete Yuanbao Search Sources Library',
      filterBySite: 'Filter by Site:',
      allSites: 'All Authoritative Sources',
      visitSource: 'Visit Source',
      copyLink: 'Copy Link',
      itemCount: 'claims',
      noPassage: 'No passage excerpt available',
      noClaimsFound: 'No claims found under this filter',
      categoryNumeric: 'Numerical Fact',
      categoryVersion: 'Version Fact',
      categoryTemporal: 'Temporal/Historical',
      categoryPolicy: 'Policy & Regulation',
      categoryScientific: 'Scientific Fact',
      categoryEntity: 'Entity Relation',
      categoryGeneral: 'General Fact',
    },
    settings: {
      title: 'TruthGuard System Settings & API Configuration',
      subtitle: 'Configure Tencent Cloud Yuanbao Search (WSA) and SenseNova / LLM inference credentials',
      yuanbaoKeyTitle: 'Tencent Cloud Yuanbao Search API Key (WSA - SearchPro)',
      yuanbaoKeyDesc: 'Used to access Yuanbao Search multi-hundred-billion authoritative index. Free trial quotas available on Tencent Cloud.',
      yuanbaoKeyPlaceholder: 'sk-...',
      testYuanbaoBtn: 'Test Yuanbao Connection',
      testing: 'Testing...',
      aiKeyTitle: 'SenseNova / OpenAI-Compatible LLM API Key',
      aiKeyDesc: 'Used for claim extraction, causal validation, and cross-source arbitration.',
      aiKeyPlaceholder: 'sk-...',
      testAiBtn: 'Test AI Connection',
      baseUrlTitle: 'LLM API Base URL',
      modelTitle: 'Model Name',
      citationFormatTitle: 'Auto-Citation Format',
      citationFootnote: 'Footnote Style [^1]',
      citationGbt7714: 'GB/T 7714 Standard',
      citationIeee: 'IEEE Standard',
      searchCountTitle: 'Yuanbao Search Result Count',
      reasoningEffortTitle: 'Chain of Thought Depth (Reasoning Effort)',
      effortNone: 'None (Fastest)',
      effortLow: 'Low (Concise, Recommended)',
      effortMedium: 'Medium (Standard)',
      effortHigh: 'High (Deep Reasoning)',
      effortMax: 'Max (Exhaustive)',
      streamingTitle: 'Streaming Output (Server-Sent Events)',
      streamingDesc: 'Real-time streaming for thoughts and reasoning deltas',
      resetBtn: 'Reset Defaults',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Settings',
      savedToast: 'Configuration saved to local sandbox!',
      securityNotice: 'Local Sandbox Storage: API keys are strictly stored in your browser\'s localStorage and never transmitted to third-party servers.',
      testSuccess: 'Connection test passed successfully',
      testFailed: 'Connection test failed',
    },
    certificate: {
      modalTitle: 'Fact Audit Health Endorsement Certificate',
      certTitle: 'FACT-CHECKING ENDORSEMENT CERTIFICATE',
      certSubtitle: 'Fact Health Audit & Academic Citation Endorsement',
      sealText: 'Tencent Yuanbao Search · Certified',
      timeLabel: 'Generated At:',
      engineLabel: 'Search Engine:',
      engineValue: 'Tencent Cloud Yuanbao Search (WSA - SearchPro)',
      hashLabel: 'Audit Fingerprint:',
      scoreLabel: 'Health Score:',
      hallucinationRateLabel: 'Hallucination Rate:',
      sectionStats: 'I. Verification Overview',
      sectionClaims: 'II. Detailed Claim Verdicts',
      exportMd: 'Export Markdown',
      printPdf: 'Print / Save as PDF',
      verifiedText: 'Authoritative Verified',
      disputedText: 'Disputed / Stale Info',
      refutedText: 'Refuted / False Claims',
      unverifiableText: 'Unverifiable Claims',
      tokenSavingsText: 'Yuanbao Token Savings',
    },
    benchmark: {
      title: 'Yuanbao Search vs Traditional Web Scraper Benchmark',
      subtitle: 'LLM input denoising rate & context token cost comparison',
      contextTokenReduction: 'CONTEXT TOKEN REDUCTION',
      tokenSavingsTitle: 'Token Consumption Reduced by {savings}%',
      tokenSavingsDesc: 'Yuanbao Search indexes billions of vectors in real-time with Gist Token compression, eliminating redundant HTML web boilerplate.',
      latencyTitle: 'End-to-End Latency',
      latencyYuanbao: 'Yuanbao Search: ~350ms (Clean passages direct)',
      latencyTraditional: 'Traditional Scraper: ~2,800ms (HTML parsing & cleaning)',
      metricComparison: 'Key Benchmark Metrics',
      cleanRateTitle: 'Information Density',
      cleanRateDesc: 'Yuanbao Search provides verified fact passages, eliminating 99% of frontend boilerplate and advertising noise.',
      apiSpeedTitle: 'Concurrent Multi-Probe Throughput',
      apiSpeedDesc: 'Executes 1-3 targeted search probes concurrently in sub-second response times for high-volume auditing.',
      cardTraditionalTitle: 'Traditional Web Scraping + Raw Cleansing',
      cardTraditionalSourceSize: 'Raw Source Size',
      cardTraditionalTokenCost: 'Single-Pass Token Cost',
      cardTraditionalLatency: 'Avg Retrieval Latency',
      cardTraditionalMaintenance: 'Maintenance Overhead',
      cardTraditionalMaintenanceVal: 'High (Proxies, anti-scraping)',
      cardYuanbaoTitle: 'Tencent Cloud Yuanbao Search (WSA)',
      cardYuanbaoSourceSize: 'Ranked Passage Size',
      cardYuanbaoSourceSizeVal: '~1.2 KB (Pure fact snippets)',
      cardYuanbaoTokenCost: 'Single-Pass Token Cost',
      cardYuanbaoLatency: 'Avg Retrieval Latency',
      cardYuanbaoAuthority: 'Source Authority',
      cardYuanbaoAuthorityVal: '157+ Verified Tier-1 Sources',
      whyTitle: 'Why is Yuanbao Search faster and more cost-effective?',
      whyDesc: 'Yuanbao Search performs hierarchical clustering and denoising in the cloud, delivering high-relevance passage snippets directly to LLMs. This eliminates brittle scrapers, cleaning pipelines, and heavy re-ranking models while maintaining real-time freshness.',
      closeBtn: 'Close Benchmark Panel',
    },
    extension: {
      title: 'TruthGuard Browser Fact-Checking Extension',
      subtitle: 'Certified by Microsoft Edge Add-ons · Highlight text to verify, view interactive process trees & export PDF reports',
      mv3Badge: 'Live on Microsoft Edge Add-ons',
      heroPill: 'Official Store Certified · 1-Click Install',
      heroTitle: 'Bring TruthGuard\'s External Brain to Your Browser',
      heroDesc: 'Officially certified and published on Microsoft Edge Add-ons! Select text on any web page (academic portals, news feeds, documentation) for real-time verification, interactive topology tree graphs, and PDF reports.',
      downloadBtn: 'Install from Microsoft Store',
      downloadedNotice: 'Redirecting to Microsoft Store...',
      downloadZipNotice: 'Official Store Verified · No Developer Mode Needed',
      pillar1Title: '1. Select Text & Floating Widget',
      pillar1Desc: 'Highlight text on any page; a "🛡️ Fact-Check" button appears. A lightweight floating widget shows real-time search & arbitration progress.',
      pillar2Title: '2. Click Arrow for Fullscreen Process Tree',
      pillar2Desc: 'Click the expand arrow inside the widget to open the full interactive workflow topology tree with pan and zoom controls.',
      pillar3Title: '3. View Report & Export PDF',
      pillar3Desc: 'When audit finishes, the widget expands to show complete verdict evidence, and you can export a high-res PDF certificate with 1 click.',
      stepsTitle: '1-Click Official Installation Guide',
      stepsSubtitle: 'For Microsoft Edge & Chromium-based browsers (Chrome, Brave, etc.)',
      stepBadge: 'Step {step}',
      step1Title: 'Open Microsoft Store',
      step1: '1. Visit Store Page',
      step1Desc: 'Click the button to open TruthGuard on the official Microsoft Edge Add-ons store.',
      step2Title: 'Click "Get"',
      step2: '2. Click "Get" Button',
      step2Desc: 'Click the blue "Get" button on the store listing and confirm "Add extension".',
      step3Title: 'Auto-installed',
      step3: '3. Ready in Seconds',
      step3Desc: 'Edge installs the extension automatically; the TruthGuard icon will appear in your toolbar.',
      step4Title: 'Fact-Check Anywhere',
      step4: '4. Fact-Check Anywhere',
      step4Desc: 'Highlight any text on the web, click the TruthGuard icon, and watch live verification in action!',
      footerTech: 'Engine: Tencent Cloud Yuanbao Search (WSA API) • Creator: freshmanJ',
      githubSource: 'GitHub Source',
      downloadZipBtn: 'Offline .zip Package (Fallback)',
      gotItBtn: 'Got It',
      storeInstallBtn: 'Install from Microsoft Store',
      guideBtn: 'Features & Offline Zip',
      guideBtnTooltip: 'View extension guide and offline package',
    },
    footer: {
      footnoteTitle: 'System Architecture & Fact-Checking Standard Footnotes',
      fn1Label: '[1] Search Infrastructure: ',
      fn1Text: 'Built on Tencent Cloud Yuanbao Search (WSA) official API, connecting hundreds of billions of authoritative pages, government disclosures, and vertical knowledge bases with sub-second evidence retrieval.',
      fn2Label: '[2] Fact Arbitration: ',
      fn2Text: 'Claim deconstruction and multi-source evidence arbitration are performed by LLM inference; recommendations serve as auxiliary proofreading for academic and professional writing.',
      fn3Label: '[3] Privacy & Security: ',
      fn3Text: 'Multimodal inspection and magic bytes validation run locally in the browser sandbox; private manuscripts are never persistently stored.',
      brandName: 'TruthGuard Veritas Copilot',
      creatorLabel: 'Creator:',
      brandSlogan: 'High-Fidelity Fact Shield & Academic Citation Copilot in the AI Era',
      githubLink: 'GitHub Open Source',
      settingsLink: 'Settings',
      copyright: '© 2026 freshmanJ. All Rights Reserved.',
    },
    businessProgress: {
      paused: 'Audit Paused',
      inspecting: 'Analyzing source format and availability...',
      extracting: 'Parsing text and extracting factual claims...',
      searching: 'Querying Tencent Yuanbao Search ({done}/{total})...',
      searchingInit: 'Querying Tencent Yuanbao Search...',
      verifying: 'Cross-arbitrating evidence & causal chains ({done}/{total})...',
      verifyingInit: 'Cross-comparing evidence & causal chains...',
      synthesizing: 'Synthesizing endorsement profile & report...',
      completed: 'Full-pipeline audit completed',
      defaultSearching: 'Auditing...',
    },
  },
};
