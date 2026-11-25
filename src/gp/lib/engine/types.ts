// Shared, browser-safe types for profiles, research and ranking.

export type MovingWindow = "asap" | "6_12" | "1_2y" | "2y_plus" | "flexible";
export type RouteType =
  | "direct_employment"
  | "study"
  | "local_experience_then_move"
  | "local_qualification_then_move";
export type MovingWith = "alone" | "partner" | "partner_children" | "children";
export type YesNoUnsure = "yes" | "no" | "unsure";
export type MustHave =
  | "move_together"
  | "spouse_work"
  | "no_borrowing"
  | "pr_pathway"
  | "within_window";
export type Priority =
  | "career_fit"
  | "affordability"
  | "family_fit"
  | "speed"
  | "long_term"
  | "evidence_quality";

export type LanguageEntry = {
  language: string;
  proficiency: "basic" | "intermediate" | "advanced" | "native";
  test: string;
  score: string;
  testDate: string;
};

export type Intake = {
  starting: {
    citizenship: string;
    residence: string;
    age: number | null;
    movingWindow: MovingWindow;
  };
  education: {
    highestLevel: string;
    field: string;
    institution: string;
    awardCountry: string;
    graduationYear: string;
    grades: string;
    licenses: string;
  };
  career: {
    currentRole: string;
    yearsExperience: number;
    responsibilities: string;
    skills: string;
    targetOccupation: string;
    willingToRetrain: YesNoUnsure;
    currentMonthlyIncome: number;
  };
  language: { entries: LanguageEntry[] };
  finances: {
    currency: string;
    savings: number;
    householdIncomeMonthly: number;
    monthlySavings: number;
    maxBorrowing: number;
    fundingNeeds: string;
  };
  family: {
    movingWith: MovingWith;
    mustMoveTogether: boolean;
    spouseOccupation: string;
    spouseNeedsWorkImmediately: YesNoUnsure;
    childrenAges: string;
  };
  destination: {
    preferred: string[];
    excluded: string[];
    openToSuggestions: boolean;
    routeTypes: RouteType[];
    routeTypesOpen: boolean;
    locationPrefs: string;
    supportNetwork: string;
  };
  goals: {
    desiredCareer: string;
    incomeGoal: string;
    wantsPermanentResidence: YesNoUnsure;
    acceptableYearsBeforeProgress: number;
  };
  priorities: { mustHaves: MustHave[]; ranked: Priority[] };
};

export type FactKind = "verified" | "estimate" | "assumption" | "unknown";

export type Evidence = {
  id: string;
  routeKey: string | null;
  topic:
    | "immigration"
    | "dependents"
    | "licensing"
    | "labour_market"
    | "wages"
    | "education"
    | "costs"
    | "timing"
    | "fx"
    | "general";
  claim: string;
  statistic: string | null;
  unit: string | null;
  population: string | null;
  geography: string | null;
  publisher: string | null;
  title: string | null;
  url: string | null;
  publishedDate: string | null;
  referenceYear: string | null;
  sourceType: "primary" | "secondary" | "sample";
  checkedAt: string | null;
};

export type Milestone = "preparation" | "application" | "pre_departure" | "arrival";

export type CostItem = {
  id: string;
  label: string;
  category:
    | "fee"
    | "test"
    | "credential"
    | "licensing"
    | "tuition"
    | "deposit"
    | "travel"
    | "settlement"
    | "other";
  amount: number;
  currency: string;
  perPerson: boolean;
  milestone: Milestone;
  refundable: boolean;
  kind: FactKind;
  evidenceIds: string[];
};

export type TimelineStep = {
  id: string;
  label: string;
  minMonths: number;
  maxMonths: number;
  parallel: boolean; // true: can run alongside other parallel prep steps
  factor: "savings" | "experience" | "licensing" | "application_window" | "processing" | "education" | "other";
  kind: FactKind;
  evidenceIds: string[];
};

export type Tri = "yes" | "no" | "conditional" | "unknown";

export type RouteResearch = {
  key: string;
  title: string;
  destination: string;
  city: string | null;
  pathway: RouteType;
  occupationOrProgram: string;
  timing: "now" | "later";
  where: string;
  when: string;
  how: string;
  costItems: CostItem[];
  proofOfFunds: {
    amount: number;
    perAdditionalMember: number;
    currency: string;
    overlapsSettlement: boolean;
    note: string;
    kind: FactKind;
    evidenceIds: string[];
  } | null;
  monthlyLiving: {
    singleAdult: number;
    perAdditionalAdult: number;
    perChild: number;
    currency: string;
    geography: string;
    kind: FactKind;
    evidenceIds: string[];
  };
  timeline: TimelineStep[];
  wage: {
    low: number;
    high: number;
    currency: string;
    population: string;
    geography: string;
    referenceYear: string;
    kind: FactKind;
    evidenceIds: string[];
  } | null;
  spouseMonthlyIncomeEstimate: number | null; // destination currency, if spouse can work
  family: {
    dependentsAllowed: Tri;
    spouseCanWork: Tri;
    spouseWorkNote: string;
    schoolingNote: string;
    evidenceIds: string[];
  };
  longTerm: { prPathway: Tri; note: string; evidenceIds: string[] };
  eligibility: {
    status: "eligible" | "likely" | "unresolved" | "not_yet" | "ineligible";
    note: string;
    futureAction: string | null;
    futureActionMonths: number | null;
    evidenceIds: string[];
  };
  assessment: {
    careerFit: number; // 0-10, model judgement grounded in evidence
    careerFitReason: string;
    longTerm: number; // 0-10
    longTermReason: string;
  };
  tradeoff: string;
  postArrival: string;
  verifyBeforePaying: string[];
  unresolvedQuestions: string[];
  assumptions: string[];
};

export type FxTable = {
  base: string; // user currency
  rates: Record<string, number>; // 1 base = rates[X] X
  asOf: string | null;
  source: string;
  sourceUrl: string | null;
};
