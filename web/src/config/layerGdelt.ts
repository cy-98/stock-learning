/** 每层 GDELT DOC 2.0 检索式（写在 query 参数内，空格分隔条件） */
export interface LayerGdeltConfig {
  /** GDELT query 字符串 */
  query: string;
  /** 回溯窗口，如 3d / 7d / 24h */
  timespan: string;
  /** 返回条数（建议 ≤ 15，避免过重） */
  maxRecords: number;
}

export const LAYER_GDELT: Record<number, LayerGdeltConfig> = {
  1: {
    query:
      '(semiconductor OR GPU OR HBM OR "memory chip" OR 半导体 OR 芯片 OR 算力 OR 光模块)',
    timespan: '7d',
    maxRecords: 12,
  },
  2: {
    query:
      '("large language model" OR ChatGPT OR OpenAI OR 大模型 OR 人工智能 OR LLM OR Agent)',
    timespan: '7d',
    maxRecords: 12,
  },
  3: {
    query:
      '(cloud OR MLOps OR RAG OR "vector database" OR 云计算 OR 企业软件 OR SaaS)',
    timespan: '7d',
    maxRecords: 12,
  },
  4: {
    query:
      '(Copilot OR "generative AI" OR fintech OR 智能制造 OR 医疗AI OR "vertical AI")',
    timespan: '7d',
    maxRecords: 12,
  },
  5: {
    query:
      '(robot OR "rare earth" OR 稀土 OR 人形机器人 OR 红利 OR ETF OR 电力 OR EV)',
    timespan: '7d',
    maxRecords: 12,
  },
};

export function getLayerGdelt(layerId: number): LayerGdeltConfig | undefined {
  return LAYER_GDELT[layerId];
}
