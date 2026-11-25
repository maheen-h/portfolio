import type { Intake, MustHave, Priority, RouteType } from "./types";

export const EMPTY_INTAKE: Intake = {
  starting: { citizenship: "", residence: "", age: null, movingWindow: "6_12" },
  education: { highestLevel: "", field: "", institution: "", awardCountry: "", graduationYear: "", grades: "", licenses: "" },
  career: { currentRole: "", yearsExperience: 0, responsibilities: "", skills: "", targetOccupation: "", willingToRetrain: "unsure", currentMonthlyIncome: 0 },
  language: { entries: [{ language: "English", proficiency: "intermediate", test: "", score: "", testDate: "" }] },
  finances: { currency: "USD", savings: 0, householdIncomeMonthly: 0, monthlySavings: 0, maxBorrowing: 0, fundingNeeds: "" },
  family: { movingWith: "alone", mustMoveTogether: false, spouseOccupation: "", spouseNeedsWorkImmediately: "unsure", childrenAges: "" },
  destination: { preferred: [], excluded: [], openToSuggestions: true, routeTypes: [], routeTypesOpen: true, locationPrefs: "", supportNetwork: "" },
  goals: { desiredCareer: "", incomeGoal: "", wantsPermanentResidence: "unsure", acceptableYearsBeforeProgress: 2 },
  priorities: { mustHaves: [], ranked: [] },
};

type AnyObj = Record<string, unknown>;
function merge<T>(base: T, over: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (base && typeof base === "object") {
    const out: AnyObj = { ...(base as AnyObj) };
    const o = (over && typeof over === "object" ? over : {}) as AnyObj;
    for (const k of Object.keys(base as AnyObj)) out[k] = merge((base as AnyObj)[k], o[k]);
    return out as T;
  }
  return (over === undefined || over === null ? base : over) as T;
}
export function normalizeIntake(raw: unknown): Intake {
  const i = merge(EMPTY_INTAKE, raw);
  if (i.starting.age === 0) i.starting.age = null;
  return i;
}

export const MUST_HAVE_LABEL: Record<MustHave, string> = {
  move_together: "My whole household moves together",
  spouse_work: "My spouse can work right away",
  no_borrowing: "No borrowing — use only my own funds",
  pr_pathway: "A path to long-term residence",
  within_window: "Move within my chosen window",
};
export const PRIORITY_OPTIONS: Priority[] = ["career_fit", "affordability", "family_fit", "speed", "long_term", "evidence_quality"];
export const ROUTE_TYPE_LABEL: Record<RouteType, string> = {
  direct_employment: "Work abroad directly",
  study: "Study abroad, then work",
  local_experience_then_move: "Gain experience at home first",
  local_qualification_then_move: "Get a qualification at home first",
};
export const WINDOW_LABEL: Record<Intake["starting"]["movingWindow"], string> = {
  asap: "As soon as possible (0–3 months)",
  "6_12": "In 6–12 months",
  "1_2y": "In 1–2 years",
  "2y_plus": "In 2+ years",
  flexible: "I'm flexible",
};
export const MOVING_WITH_LABEL: Record<Intake["family"]["movingWith"], string> = {
  alone: "Just me",
  partner: "Me and my spouse/partner",
  partner_children: "Me, my spouse/partner and children",
  children: "Me and my children",
};

export type TargetedQuestion = { id: string; question: string; why: string; field: string };

/** Questions whose answers could materially change the result. */
export function targetedQuestions(i: Intake): TargetedQuestion[] {
  const q: TargetedQuestion[] = [];
  const spouse = i.family.movingWith === "partner" || i.family.movingWith === "partner_children";
  if (spouse && i.family.spouseNeedsWorkImmediately === "unsure")
    q.push({ id: "spouse_work", field: "family.spouseNeedsWorkImmediately", question: "You want to move with your spouse. Does your spouse need permission to work immediately for the move to be affordable?", why: "Some routes don't let spouses work, which can exclude them entirely." });
  if (i.family.movingWith !== "alone" && !i.family.mustMoveTogether && i.priorities.mustHaves.indexOf("move_together") < 0)
    q.push({ id: "together", field: "family.mustMoveTogether", question: "Must everyone move at the same time, or could family join you later?", why: "Routes that don't allow dependants are only an option if family can follow later." });
  if ((i.family.movingWith === "partner_children" || i.family.movingWith === "children") && !i.family.childrenAges.trim())
    q.push({ id: "kids", field: "family.childrenAges", question: "How old are your children?", why: "Fees, proof-of-funds and schooling costs depend on the number and ages of children." });
  if (i.finances.savings <= 0)
    q.push({ id: "savings", field: "finances.savings", question: "How much could you spend on the move today?", why: "Without savings we can't calculate your funding gap." });
  if (!i.career.targetOccupation.trim() && !i.goals.desiredCareer.trim())
    q.push({ id: "target", field: "career.targetOccupation", question: "What job do you want to do abroad?", why: "Demand, wages and licensing all depend on the target occupation." });
  if (i.priorities.ranked.length < 3)
    q.push({ id: "priorities", field: "priorities.ranked", question: "Rank your top three preferences.", why: "Your ranking decides the order of viable routes." });
  return q;
}

export function sectionComplete(i: Intake) {
  return {
    starting: Boolean(i.starting.citizenship && i.starting.residence),
    education: Boolean(i.education.highestLevel && i.education.field),
    career: Boolean(i.career.currentRole || i.career.targetOccupation),
    language: i.language.entries.length > 0,
    finances: i.finances.savings > 0 || i.finances.monthlySavings > 0,
    family: Boolean(i.family.movingWith),
    destination: i.destination.openToSuggestions || i.destination.preferred.length > 0,
    goals: Boolean(i.goals.desiredCareer || i.goals.wantsPermanentResidence !== "unsure"),
    priorities: i.priorities.ranked.length >= 3,
  };
}
