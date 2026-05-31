export type SpecTaskStatus = 'done' | 'wip' | 'todo' | 'warn' | 'ok';

export interface SpecNavLink {
  slug: string;
  label: string;
}

export interface SpecCallout {
  type?: 'info' | 'warn' | 'ok';
  body: string;
}

export interface SpecTask {
  name: string;
  status: SpecTaskStatus;
  progress: number;
}

export interface SpecSection {
  title: string;
  paragraph?: string;
  list?: string[];
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
}

export interface SpecSubsection {
  title: string;
  items: { heading: string; body: string }[];
}

export interface SpecStat {
  label: string;
  value: string;
  hint?: string;
}

export interface SpecCodeBlock {
  title?: string;
  lang?: string;
  code: string;
}

export interface SpecBacklogItem {
  priority: string;
  item: string;
  progress: number;
}

export interface SpecCloseCondition {
  text: string;
  progress: number;
}

export interface SpecRound {
  round: number;
  date?: string;
  summary?: string;
  progress: number;
}

export interface SpecDocument {
  slug: string;
  order: number;
  navLabel: string;
  heading: string;
  progress: number;
  progressLabel: string;
  updated: string;
  tags?: string[];
  round?: number;
  lead: string;
  nav?: {
    prev?: SpecNavLink | null;
    next?: SpecNavLink | null;
  };
  callouts?: SpecCallout[];
  sections?: SpecSection[];
  subsections?: SpecSubsection[];
  tasks?: SpecTask[];
  stats?: SpecStat[];
  codeBlocks?: SpecCodeBlock[];
  backlog?: SpecBacklogItem[];
  closeConditions?: SpecCloseCondition[];
  rounds?: SpecRound[];
}
