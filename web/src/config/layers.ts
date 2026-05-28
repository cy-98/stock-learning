export type LayerTab = 'industry' | 'trends' | 'events' | 'stocks';

export interface LayerSegment {
  name: string;
  desc: string;
  players?: string;
}

export interface LayerTrend {
  title: string;
  body: string;
  signal: 'bullish' | 'neutral' | 'caution';
}

export interface LayerEvent {
  date: string;
  title: string;
  body: string;
}

/** stock-sdk A 股代码格式：sh600519 / sz000858 */
export interface LayerStockPool {
  /** 候选池（按市值取 Top5） */
  cn: string[];
  /** 美股 us 前缀，港股 hk 前缀 */
  global: string[];
}

export interface LayerConfig {
  id: number;
  slug: string;
  name: string;
  short: string;
  icon: string;
  color: string;
  gradient: string;
  tagline: string;
  summary: string;
  stocks: LayerStockPool;
  industry: {
    overview: string;
    segments: LayerSegment[];
    metrics: { label: string; value: string }[];
  };
  trends: LayerTrend[];
  events: LayerEvent[];
}

export const LAYERS: LayerConfig[] = [
  {
    id: 1,
    slug: 'infrastructure',
    name: '算力与基础设施层',
    short: '算力层',
    icon: '⚡',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
    tagline: '芯片 · 数据中心 · 光互联 · 电力',
    summary:
      'AI 训练的物理底座：GPU/ASIC、晶圆代工、存储互连、光模块与 IDC。景气高度分化，算力链紧缺，消费电子链偏弱。',
    stocks: {
      cn: [
        'sh688981',
        'sh688256',
        'sh688041',
        'sh002371',
        'sh688008',
        'sh603986',
        'sh688012',
        'sz300748',
        'sh600011',
        'sh601991',
      ],
      global: ['usNVDA', 'usAMD', 'usTSM', 'usAVGO', 'usMU', 'usINTC', 'usQCOM'],
    },
    industry: {
      overview:
        '2026 年全球半导体规模逼近万亿美元，AI 算力（GPU、HBM、先进封装）高景气，成熟制程与设备国产化持续推进。',
      segments: [
        { name: 'AI 芯片', desc: '训练与推理算力核心', players: '英伟达、海光、寒武纪' },
        { name: '存储互连', desc: 'HBM、DDR5、内存接口', players: '海力士、美光、澜起' },
        { name: '晶圆制造', desc: '先进制程与成熟制程', players: '台积电、中芯国际' },
        { name: '电力能源', desc: '算电与火电红利', players: '华能、大唐、浙能' },
      ],
      metrics: [
        { label: '2026E 全球半导体', value: '~9750 亿美元' },
        { label: '中国矿产量占比', value: '~69%' },
      ],
    },
    trends: [
      { title: '推理算力占比上升', body: '推理支出有望超过训练，拉动多样化芯片需求。', signal: 'bullish' },
      { title: 'HBM 超级周期', body: '产能向 HBM 倾斜，存储价格中枢抬升。', signal: 'bullish' },
      { title: '估值分化', body: '龙头 PE 极高 vs 周期股，需分环节定价。', signal: 'caution' },
    ],
    events: [
      { date: '2026-05', title: '半导体板块活跃', body: '设备、封测、设计轮动，注意估值匹配。' },
      { date: '2026-02', title: '澜起 H 股上市', body: '内存互连龙头估值争议加大。' },
    ],
  },
  {
    id: 2,
    slug: 'model',
    name: '模型与算法层',
    short: '模型层',
    icon: '🧠',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 50%, #a78bfa 100%)',
    tagline: '大模型 · 多模态 · 开源生态',
    summary: '基础模型是 AI 的操作系统：闭源 API 与开源权重并行，监管与对齐成本上升。',
    stocks: {
      cn: ['sh688111', 'sh688246', 'sh300418', 'sh603533', 'sh002230', 'sh688088'],
      global: ['usMSFT', 'usGOOGL', 'usMETA', 'usAMZN', 'usPLTR', 'usAI'],
    },
    industry: {
      overview: '头部闭源模型领先复杂推理；开源降低部署门槛；中国强调自主可控与行业大模型。',
      segments: [
        { name: '闭源大模型', desc: 'API 按 token 计费', players: 'OpenAI、Anthropic' },
        { name: '开源生态', desc: '本地部署与微调', players: 'Meta、Qwen 等' },
        { name: 'AI 安全', desc: '合规与内容安全', players: '云厂商安全团队' },
      ],
      metrics: [{ label: '全球 AI 支出 2026E', value: '~2.52 万亿美元' }],
    },
    trends: [
      { title: 'Agent 普及', body: '工具调用与工作流自动化成为标配。', signal: 'bullish' },
      { title: '监管常态化', body: '备案与跨境数据影响产品节奏。', signal: 'caution' },
    ],
    events: [{ date: '2026', title: '推理时代叙事', body: '产业焦点从训练算力转向推理成本。' }],
  },
  {
    id: 3,
    slug: 'platform',
    name: '平台与工具层',
    short: '平台层',
    icon: '🔧',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 50%, #22d3ee 100%)',
    tagline: '云计算 · MLOps · RAG',
    summary: '把模型变成生产力的脚手架：算力、模型 API、向量库与 Agent 编排。',
    stocks: {
      cn: ['sh600588', 'sh688158', 'sh300454', 'sz002410', 'sh601360'],
      global: ['usMSFT', 'usAMZN', 'usGOOGL', 'usSNOW', 'usCRM', 'usORCL'],
    },
    industry: {
      overview: '云厂商将 AI 作为增长引擎；企业关注 FinOps 与数据治理。',
      segments: [
        { name: '公有云 AI', desc: '算力+模型一站式', players: 'Azure、AWS、阿里云' },
        { name: 'LLMOps', desc: '部署、监控、评测', players: '云原生工具链' },
      ],
      metrics: [{ label: 'AI 基础设施支出 2026E', value: '~4500 亿美元' }],
    },
    trends: [
      { title: 'RAG 标配化', body: '企业知识库+检索增强成为落地主流。', signal: 'bullish' },
      { title: '平台捆绑', body: '供应商锁定风险需评估。', signal: 'caution' },
    ],
    events: [{ date: '2026', title: 'Agent 开发平台竞争', body: '各云厂推出 Agent 托管与评测。' }],
  },
  {
    id: 4,
    slug: 'application',
    name: '应用与解决方案层',
    short: '应用层',
    icon: '📱',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
    tagline: '行业 Copilot · 垂直 SaaS',
    summary: 'AI 价值兑现主战场：金融、制造、医疗等场景的 ROI 验证。',
    stocks: {
      cn: ['sh600519', 'sz000858', 'sh601318', 'sh600036', 'sz300750', 'sh688169'],
      global: ['usAAPL', 'usTSLA', 'usNFLX', 'usADBE', 'usNOW', 'usUBER'],
    },
    industry: {
      overview: '竞争从「有没有 AI」转向「能否 measurable ROI」。',
      segments: [
        { name: '办公协作', desc: 'Copilot 嵌入', players: '微软、Google' },
        { name: '制造', desc: '质检与预测性维护', players: '工业软件' },
      ],
      metrics: [{ label: '付费模式', value: 'Seat + Usage 混合' }],
    },
    trends: [
      { title: '工作流嵌入', body: 'AI 进入 ERP/CRM/MES。', signal: 'bullish' },
      { title: '同质化价格战', body: '通用助手毛利承压。', signal: 'caution' },
    ],
    events: [{ date: '2026', title: '垂直 Agent 融资活跃', body: '法律、财务、客服等场景产品增多。' }],
  },
  {
    id: 5,
    slug: 'ecosystem',
    name: '终端与生态层',
    short: '生态层',
    icon: '🌐',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)',
    tagline: '机器人 · 资源 · 红利资产',
    summary: 'AI 走向物理世界与社会系统：具身智能、稀土、电力、高股息防御资产联动。',
    stocks: {
      cn: [
        'sh600111',
        'sz000831',
        'sh600392',
        'sh600259',
        'sh600011',
        'sh601991',
        'sh600023',
        'sh300748',
        'sh000970',
      ],
      global: ['usTSLA', 'usF', 'usGM', 'usCAT', 'usLIN', 'usFCX'],
    },
    industry: {
      overview: '主题叠加常见：机器人、稀土、电力、红利 ETF；需估值纪律。',
      segments: [
        { name: '稀土永磁', desc: '机器人与新能源车', players: '北方稀土、金力永磁' },
        { name: '电力', desc: '高股息与周期', players: '华能、浙能' },
      ],
      metrics: [{ label: '中国冶炼分离占比', value: '~88%+' }],
    },
    trends: [
      { title: '稀土供给刚性', body: '配额收紧、出口管制。', signal: 'bullish' },
      { title: '红利防御', body: '科技牛市阶段相对承压。', signal: 'neutral' },
    ],
    events: [
      { date: '2024-2026', title: '稀土条例体系', body: '总量控制与出口全链条管理。' },
      { date: '2026', title: '红利低波 ETF 扩容', body: '515450 等资金流入高股息主题。' },
    ],
  },
];

export function getLayerById(id: number): LayerConfig | undefined {
  return LAYERS.find((l) => l.id === id);
}
