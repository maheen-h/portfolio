import { calculateRoute, fmt, household } from "./calc";
import type { Evidence, FxTable, Intake, RouteResearch } from "./types";

export type ExpertCategory =
  | "credential_evaluation"
  | "immigration_legal"
  | "financing"
  | "training"
  | "interview_prep"
  | "test_prep"
  | "local_education"
  | "entrepreneurship";

export const EXPERT_CATEGORY_LABEL: Record<ExpertCategory, string> = {
  credential_evaluation: "Credential evaluation",
  immigration_legal: "Immigration legal advice",
  financing: "Financing",
  training: "Skills training",
  interview_prep: "Interview preparation",
  test_prep: "Test preparation",
  local_education: "Local education",
  entrepreneurship: "Entrepreneurship support",
};

export type StepDraft = {
  phase: "verify" | "prepare" | "finance" | "apply" | "relocate" | "post_arrival";
  title: string;
  what: string;
  why: string;
  startWhen: string;
  dependencies: string[];
  estimatedCost: string;
  documents: string[];
  sourceTitle: string | null;
  sourceUrl: string | null;
  completionCriteria: string;
  expertCategory: ExpertCategory | null;
  beforeSpending: boolean;
};

export const PHASE_LABEL: Record<StepDraft["phase"], string> = {
  verify: "Verify before spending",
  prepare: "Prepare",
  finance: "Finance",
  apply: "Apply",
  relocate: "Relocate",
  post_arrival: "After arrival",
};

const addMonths = (m: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + m);
  return d.toISOString().slice(0, 10);
};

/** Deterministic roadmap built from the same route, profile and calculations as the ranking. */
export function buildRoadmap(route: RouteResearch, intake: Intake, fx: FxTable, evidence: Evidence[]): StepDraft[] {
  const calc = calculateRoute(route, intake, fx);
  const hh = household(intake);
  const cur = intake.finances.currency;
  const src = (ids: string[]) => {
    const e = evidence.find((x) => ids.includes(x.id) && x.url);
    return { sourceTitle: e ? `${e.publisher ?? e.title ?? "Source"}` : null, sourceUrl: e?.url ?? null };
  };
  const steps: StepDraft[] = [];

  // A future/wait route: first action today, measurable target, reassess date
  if (route.eligibility.status === "not_yet" || route.timing === "later") {
    const months = route.eligibility.futureActionMonths ?? 12;
    steps.push({
      phase: "verify",
      title: "Start today: set your readiness target",
      what: route.eligibility.futureAction ?? "Work toward the eligibility gap identified for this route.",
      why: `This route is a future option for you: ${route.eligibility.note}`,
      startWhen: "Today",
      dependencies: [],
      estimatedCost: "—",
      documents: [],
      ...src(route.eligibility.evidenceIds),
      completionCriteria: `Readiness target met; reassess on ${addMonths(months)}.`,
      expertCategory: route.pathway === "local_qualification_then_move" ? "local_education" : null,
      beforeSpending: true,
    });
  }

  for (const v of route.verifyBeforePaying) {
    const lower = v.toLowerCase();
    steps.push({
      phase: "verify",
      title: v,
      what: v,
      why: `Required for “${route.title}” — confirm before any non-refundable payment.`,
      startWhen: "Now, before paying anything",
      dependencies: [],
      estimatedCost: "Usually free",
      documents: [],
      ...src([...route.eligibility.evidenceIds, ...route.family.evidenceIds]),
      completionCriteria: "You have written confirmation (email, official page or letter) saved.",
      expertCategory: /degree|credential|recogni|program|accredit|assessment/.test(lower)
        ? "credential_evaluation"
        : /visa|eligib|dependant|spouse|points|permit|petition/.test(lower)
          ? "immigration_legal"
          : null,
      beforeSpending: true,
    });
  }

  if (hh.size > 1) {
    steps.push({
      phase: "verify",
      title: "Confirm family eligibility and spouse work conditions",
      what: `Check that your ${hh.hasSpouse ? "spouse" : "family"} can accompany you on this exact route and intake${hh.hasSpouse ? ", and whether your spouse may work from day one" : ""}.`,
      why: `You are moving as a household of ${hh.size}. Route says: dependants ${route.family.dependentsAllowed}, spouse work ${route.family.spouseCanWork}. ${
        intake.family.spouseNeedsWorkImmediately === "yes" ? "Your budget depends on immediate spouse income." : ""
      }`,
      startWhen: "Now",
      dependencies: [],
      estimatedCost: "Free–consultation fee",
      documents: ["Marriage certificate", "Children's birth certificates"],
      ...src(route.family.evidenceIds),
      completionCriteria: "Official guidance or a professional's written opinion confirms both points.",
      expertCategory: "immigration_legal",
      beforeSpending: true,
    });
  }

  const firstNonRefundable = calc.lines.find((l) => !l.refundable && (l.milestone === "application" || l.category === "deposit" || l.category === "tuition"));
  steps.push({
    phase: "verify",
    title: "Compare payment dates with your savings",
    what: `Map each payment to a date. You need ≈${fmt(calc.upfrontTotal, cur)} in total; you have ${fmt(intake.finances.savings, cur)} plus ${fmt(intake.finances.monthlySavings, cur)}/month.`,
    why: calc.fundingGapAtDeparture > 0
      ? `Shortfall of ${fmt(calc.fundingGapAtDeparture, cur)} by departure with confirmed funds — identify it before ${firstNonRefundable ? `paying “${firstNonRefundable.label}”` : "any non-refundable payment"}.`
      : "Your confirmed funds cover the estimated costs; confirm the dates still line up.",
    startWhen: "Now",
    dependencies: [],
    estimatedCost: "—",
    documents: ["Bank statements"],
    sourceTitle: null,
    sourceUrl: null,
    completionCriteria: "A dated payment plan with no unfunded payment before departure.",
    expertCategory: calc.fundingGapAtDeparture > 0 ? "financing" : null,
    beforeSpending: true,
  });

  for (const t of route.timeline.filter((x) => x.parallel)) {
    const lower = t.label.toLowerCase();
    steps.push({
      phase: "prepare",
      title: t.label,
      what: t.label,
      why: `Part of the preparation that controls your timeline (${t.minMonths}–${t.maxMonths} months).`,
      startWhen: "After verification steps",
      dependencies: ["Verify before spending"],
      estimatedCost: costFor(route, lower, calc, cur),
      documents: /recogn|assess|credential/.test(lower) ? ["Degree certificate", "Transcripts"] : [],
      ...src(t.evidenceIds),
      completionCriteria: `${t.label} complete with written result.`,
      expertCategory: /recogn|credential|assess/.test(lower)
        ? "credential_evaluation"
        : /ielts|english|test|language|german/.test(lower)
          ? "test_prep"
          : /job|employer|interview/.test(lower)
            ? "interview_prep"
            : /experience/.test(lower)
              ? "training"
              : null,
      beforeSpending: false,
    });
  }

  if (calc.fundingGapAtDeparture > 0) {
    steps.push({
      phase: "finance",
      title: "Close your funding gap",
      what: `Arrange ${fmt(calc.fundingGapAtDeparture, cur)} — through more saving${intake.finances.maxBorrowing > 0 ? `, or borrowing up to your limit of ${fmt(intake.finances.maxBorrowing, cur)}` : ""}. Scholarships or loans count only once confirmed in writing.`,
      why: "Your confirmed funds don't yet cover the cash needed by departure.",
      startWhen: "Before the application stage",
      dependencies: ["Compare payment dates with your savings"],
      estimatedCost: "Interest varies",
      documents: ["Income proof", "Admission or offer letter"],
      sourceTitle: null,
      sourceUrl: null,
      completionCriteria: "Funding confirmed in writing for every payment before departure.",
      expertCategory: "financing",
      beforeSpending: false,
    });
  }

  for (const t of route.timeline.filter((x) => !x.parallel)) {
    steps.push({
      phase: t.factor === "education" ? "post_arrival" : "apply",
      title: t.label,
      what: t.label,
      why: `Must happen after preparation (${t.minMonths}–${t.maxMonths} months).`,
      startWhen: "After preparation",
      dependencies: ["Prepare"],
      estimatedCost: costFor(route, t.label.toLowerCase(), calc, cur),
      documents: ["Passport", ...(hh.size > 1 ? ["Family documents"] : [])],
      ...src(t.evidenceIds),
      completionCriteria: `${t.label} done.`,
      expertCategory: t.factor === "processing" || t.factor === "application_window" ? "immigration_legal" : null,
      beforeSpending: false,
    });
  }

  const relocation = calc.lines.filter((l) => l.milestone === "pre_departure" || l.milestone === "arrival");
  steps.push({
    phase: "relocate",
    title: "Relocate and settle",
    what: relocation.map((l) => l.label).join("; ") || "Travel and first housing.",
    why: `Covers travel and the first months for ${hh.size} ${hh.size === 1 ? "person" : "people"}.`,
    startWhen: "After visa approval",
    dependencies: ["Apply"],
    estimatedCost: fmt(relocation.reduce((s, l) => s + (l.amountUser ?? 0), 0), cur),
    documents: ["Visa", "Housing contract"],
    sourceTitle: null,
    sourceUrl: null,
    completionCriteria: "Arrived, registered address, bank account open.",
    expertCategory: null,
    beforeSpending: false,
  });

  steps.push({
    phase: "post_arrival",
    title: route.pathway === "direct_employment" ? "Start work and plan your licensing/progression" : "Turn your qualification into a job",
    what: route.postArrival,
    why: route.assessment.careerFitReason,
    startWhen: "First 3 months after arrival",
    dependencies: ["Relocate and settle"],
    estimatedCost: "—",
    documents: [],
    ...src(route.longTerm.evidenceIds),
    completionCriteria: route.pathway === "study" ? "Signed job offer that keeps you eligible to stay." : "Started role; licensing plan in place.",
    expertCategory: "interview_prep",
    beforeSpending: false,
  });
  return steps;
}

function costFor(route: RouteResearch, label: string, calc: ReturnType<typeof calculateRoute>, cur: string) {
  const words = label.split(/\W+/).filter((w) => w.length > 3);
  const match = calc.lines.find((l) => words.some((w) => l.label.toLowerCase().includes(w)));
  return match?.amountUser != null ? `≈ ${fmt(match.amountUser, cur)}` : "—";
}
