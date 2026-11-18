// Content model for the portfolio. Every outcome carries a credit label so the
// reader knows whose result it is. Editor notes mark facts still to be supplied;
// they show only in preview builds (see SHOW_EDITOR_NOTES in site.ts).

export type Credit = 'owned' | 'led' | 'team' | 'contributed' | 'company';

export const creditLabel: Record<Credit, string> = {
  owned: 'I owned this',
  led: 'Team result I led',
  team: 'Team result',
  contributed: 'Organization result I contributed to',
  company: 'Company figure, for context',
};

export interface Source { label: string; url: string }

export interface Outcome {
  figure?: string;
  text: string;
  credit: Credit;
  source?: Source;
}

export interface ForkOption {
  label: string;
  note: string;
  chosen?: boolean;
}

export interface Decision {
  question: string;
  options: ForkOption[];
  why: string;
  cost: string;
}

export interface Figure {
  src: string;
  alt: string;
  caption: string;
  /** width / height, used to reserve space and avoid layout shift */
  ratio: number;
}

export interface CardSummary {
  problem: string;
  role: string;
  decision: string;
  /** The evidence behind the decision, in one line */
  evidence: string;
  outcome: string;
  relevance: string;
}

export type Domain = 'ai' | 'fin' | 'saas';
export const domainLabel: Record<Domain, string> = {
  ai: 'AI and LLM products',
  fin: 'FinTech and commerce',
  saas: 'SaaS platforms',
};

export interface Panel {
  /** Background colour of the project's visual panel */
  bg: string;
  /** Whether text drawn on the panel should be light */
  dark: boolean;
}

export interface CaseStudy {
  slug: string;
  org: string;
  title: string;
  role: string;
  period: string;
  year: number;
  tier: 'major' | 'supporting';
  /** Which pillars this story supports */
  pillars: Array<'judgment' | 'technical' | 'impact'>;
  domains: Domain[];
  /** Short line for gallery captions */
  short: string;
  /** One line: what this case study proves */
  proves: string;
  summary: string;
  status: 'complete' | 'partial' | 'scheduled';
  card: CardSummary;
  panel: Panel;
  /** Short line shown over the visual, e.g. the key figure */
  stamp?: string;
  image?: Figure;
  gallery?: Figure[];
  context?: string[];
  problem?: string[];
  owned?: string[];
  evidence?: { methods: string[]; findings: string[] };
  decision?: Decision;
  approach?: string[];
  execution?: string[];
  outcomes?: Outcome[];
  limits?: string[];
  reflection?: string[];
  links?: Source[];
  editorNotes?: string[];
}
