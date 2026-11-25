import { calculateRoute, fmt, household, windowMonths, type RouteCalc } from "./calc";
import type { Evidence, FxTable, Intake, Priority, RouteResearch } from "./types";

export type RouteStatus = "viable" | "needs_verification" | "future" | "excluded";

export type Scores = Record<Priority, number>;

export type RankedRoute = {
  key: string;
  rank: number | null; // null when excluded or beyond top 5
  status: RouteStatus;
  statusReasons: string[];
  futureAction: string | null;
  score: number;
  scores: Scores;
  calc: RouteCalc;
  whyRank: string[];
  route: RouteResearch;
};

export type Ranking = {
  shown: RankedRoute[];
  excluded: RankedRoute[];
  overflow: RankedRoute[];
  weights: Scores;
  whatWouldChange: string | null; // for #2 to beat #1
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  career_fit: "Career fit",
  affordability: "Affordability",
  family_fit: "Family fit",
  speed: "Timing",
  long_term: "Long-term prospects",
  evidence_quality: "Evidence quality",
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function weightsFor(intake: Intake): Scores {
  const w: Scores = { career_fit: 1, affordability: 1, family_fit: 1, speed: 1, long_term: 1, evidence_quality: 1 };
  const boosts = [3, 2, 1.5];
  intake.priorities.ranked.slice(0, 3).forEach((p, i) => (w[p] = boosts[i] ?? 1));
  return w;
}

function evidenceScore(route: RouteResearch, evidence: Evidence[]): number {
  const mine = evidence.filter((e) => e.routeKey === route.key || e.routeKey === null);
  const primary = mine.filter((e) => e.sourceType === "primary").length;
  const secondary = mine.filter((e) => e.sourceType === "secondary").length;
  const costVerified = route.costItems.length
    ? route.costItems.filter((c) => c.kind === "verified").length / route.costItems.length
    : 0;
  return clamp(Math.min(primary, 5) * 12 + Math.min(secondary, 3) * 5 + costVerified * 25);
}

export function scoreRoute(route: RouteResearch, calc: RouteCalc, intake: Intake, evidence: Evidence[]): Scores {
  const hh = household(intake);
  const savings = Math.max(1, intake.finances.savings);
  // Affordability: share of cost covered today, penalise negative monthly budget and borrowing dependence
  let affordability = 100 - Math.max(0, calc.upfrontTotal / savings - 0.6) * 55;
  if (calc.monthlyNet != null && calc.monthlyNet < 0) affordability -= 25;
  if (calc.fundingGapAtDeparture > 0) affordability -= 15;
  // Timing vs desired window
  const target = windowMonths(intake.starting.movingWindow);
  const speed = calc.feasibleInMonths <= target ? 100 - calc.feasibleInMonths : 100 - (calc.feasibleInMonths - target) * 4 - target;
  // Family
  let family = 100;
  if (hh.size > 1) {
    const dep = { yes: 50, conditional: 35, unknown: 20, no: 0 }[route.family.dependentsAllowed];
    let spouse = 50;
    if (hh.hasSpouse) {
      const needs = intake.family.spouseNeedsWorkImmediately === "yes";
      spouse = { yes: 50, conditional: needs ? 20 : 35, unknown: needs ? 10 : 25, no: needs ? 0 : 20 }[route.family.spouseCanWork];
    }
    family = dep + spouse;
  }
  let longTerm = route.assessment.longTerm * 10;
  if (intake.goals.wantsPermanentResidence === "yes") {
    longTerm += { yes: 10, conditional: 0, unknown: -10, no: -30 }[route.longTerm.prPathway];
  }
  return {
    career_fit: clamp(route.assessment.careerFit * 10),
    affordability: clamp(affordability),
    family_fit: clamp(family),
    speed: clamp(speed),
    long_term: clamp(longTerm),
    evidence_quality: evidenceScore(route, evidence),
  };
}

export function checkConstraints(route: RouteResearch, calc: RouteCalc, intake: Intake) {
  const hh = household(intake);
  const must = new Set(intake.priorities.mustHaves);
  if (intake.family.mustMoveTogether && hh.size > 1) must.add("move_together");
  if (intake.family.spouseNeedsWorkImmediately === "yes" && hh.hasSpouse) must.add("spouse_work");
  const reasons: string[] = [];
  let status = "viable" as RouteStatus;
  let futureAction: string | null = null;
  const bump = (s: RouteStatus) => {
    const order: RouteStatus[] = ["viable", "needs_verification", "future", "excluded"];
    if (order.indexOf(s) > order.indexOf(status)) status = s;
  };

  if (intake.destination.excluded.some((x) => x.trim() && route.destination.toLowerCase().includes(x.trim().toLowerCase()))) {
    bump("excluded");
    reasons.push(`You excluded ${route.destination}.`);
  }
  if (route.eligibility.status === "ineligible") {
    bump("excluded");
    reasons.push(`Not eligible: ${route.eligibility.note}`);
  }
  if (must.has("move_together") && hh.size > 1) {
    if (route.family.dependentsAllowed === "no") {
      bump("excluded");
      reasons.push("Your family must move together, but this route does not allow dependants to accompany you.");
    } else if (route.family.dependentsAllowed === "unknown") {
      bump("needs_verification");
      reasons.push("Whether your family can accompany you on this route is not confirmed.");
    }
  }
  if (must.has("spouse_work") && hh.hasSpouse) {
    if (route.family.spouseCanWork === "no") {
      bump("excluded");
      reasons.push("Your spouse needs to work immediately, but this route does not give them work permission.");
    } else if (route.family.spouseCanWork === "unknown" || route.family.spouseCanWork === "conditional") {
      bump("needs_verification");
      reasons.push(`Spouse work permission is ${route.family.spouseCanWork === "conditional" ? "conditional" : "not confirmed"}: ${route.family.spouseWorkNote}`);
    }
  }
  if (must.has("pr_pathway") && route.longTerm.prPathway === "no") {
    bump("excluded");
    reasons.push("You need a path to long-term residence, and this route does not lead to one.");
  }
  if (route.eligibility.status === "unresolved") {
    bump("needs_verification");
    reasons.push(`Eligibility unresolved: ${route.eligibility.note}`);
  }
  if (route.eligibility.status === "not_yet") {
    bump("future");
    futureAction = route.eligibility.futureAction;
    reasons.push(`Not eligible yet. ${route.eligibility.futureAction ?? route.eligibility.note}`);
  }
  // Money
  const cur = intake.finances.currency;
  if (calc.fundingGapAtDeparture > 0) {
    const coverable = calc.fundingGapAtDeparture <= intake.finances.maxBorrowing;
    if (must.has("no_borrowing") || !coverable) {
      if (calc.monthsToSave != null && calc.monthsToSave < 72) {
        bump("future");
        futureAction = futureAction ?? `Save about ${fmt(calc.upfrontTotal - intake.finances.savings, cur)} more (≈${calc.monthsToSave} months at your current rate).`;
        reasons.push(`Funding gap of ${fmt(calc.fundingGapAtDeparture, cur)} at departure with confirmed funds.`);
      } else {
        bump("excluded");
        reasons.push(`Funding gap of ${fmt(calc.fundingGapAtDeparture, cur)} cannot be closed by saving or your borrowing limit.`);
      }
    } else {
      reasons.push(`Needs ${fmt(calc.fundingGapAtDeparture, cur)} of borrowing (within your limit) — not confirmed funding.`);
    }
  }
  if (must.has("within_window") && calc.feasibleInMonths > windowMonths(intake.starting.movingWindow)) {
    bump("future");
    reasons.push(`Earliest realistic move is ~${calc.feasibleInMonths} months away, outside your moving window.`);
  }
  return { status, reasons, futureAction };
}

function weighted(s: Scores, w: Scores) {
  const keys = Object.keys(w) as Priority[];
  const total = keys.reduce((a, k) => a + w[k], 0);
  return Math.round((keys.reduce((a, k) => a + s[k] * w[k], 0) / total) * 10) / 10;
}

const STATUS_ORDER: Record<RouteStatus, number> = { viable: 0, needs_verification: 1, future: 2, excluded: 3 };

export function rankRoutes(routes: RouteResearch[], intake: Intake, fx: FxTable, evidence: Evidence[]): Ranking {
  const weights = weightsFor(intake);
  const all: RankedRoute[] = routes.map((route) => {
    const calc = calculateRoute(route, intake, fx);
    const { status, reasons, futureAction } = checkConstraints(route, calc, intake);
    const scores = scoreRoute(route, calc, intake, evidence);
    return { key: route.key, route, calc, status, statusReasons: reasons, futureAction, scores, score: weighted(scores, weights), rank: null, whyRank: [] };
  });
  const excluded = all.filter((r) => r.status === "excluded");
  const eligible = all
    .filter((r) => r.status !== "excluded")
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.score - a.score);
  const shown = eligible.slice(0, 5);
  const overflow = eligible.slice(5);
  shown.forEach((r, i) => (r.rank = i + 1));
  shown.forEach((r, i) => (r.whyRank = explain(r, shown[i - 1] ?? null, shown[i + 1] ?? null, weights, intake)));
  return { shown, excluded, overflow, weights, whatWouldChange: shown.length > 1 ? whatWouldFlip(routes, intake, fx, evidence, shown[0]!, shown[1]!) : null };
}

function explain(r: RankedRoute, above: RankedRoute | null, below: RankedRoute | null, w: Scores, intake: Intake): string[] {
  const cur = intake.finances.currency;
  const out: string[] = [];
  const top = (Object.keys(w) as Priority[])
    .filter((k) => w[k] > 1)
    .sort((a, b) => w[b] - w[a]);
  if (top.length) {
    out.push(
      `Your top priorities are ${top.map((k) => PRIORITY_LABEL[k].toLowerCase()).join(", ")}; this route scores ${top.map((k) => `${r.scores[k]}/100 on ${PRIORITY_LABEL[k].toLowerCase()}`).join(", ")}.`,
    );
  }
  if (r.status === "needs_verification") out.push("Ranked below fully viable routes because an essential fact still needs verification.");
  if (r.status === "future") out.push(`Treated as a future route: ${r.futureAction ?? "an action is needed before you qualify"}.`);
  out.push(
    `Upfront cash ≈ ${fmt(r.calc.upfrontTotal, cur)}; feasible in ~${r.calc.feasibleInMonths >= 999 ? "—" : r.calc.feasibleInMonths} months (controlled by ${r.calc.timeline.controlling.toLowerCase()}).`,
  );
  const cmp = (other: RankedRoute, label: string) => {
    const diffs = (Object.keys(w) as Priority[])
      .map((k) => ({ k, d: (r.scores[k] - other.scores[k]) * w[k] }))
      .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
      .slice(0, 2);
    return `Versus ${label} (${other.route.title}): ${diffs
      .map(({ k }) => `${PRIORITY_LABEL[k].toLowerCase()} ${r.scores[k]} vs ${other.scores[k]}`)
      .join(", ")}.`;
  };
  if (below) out.push(cmp(below, `#${below.rank}`));
  else if (above) out.push(cmp(above, `#${above.rank}`));
  out.push(r.route.assessment.careerFitReason);
  return out;
}

/** Concrete change that would make #2 overtake #1, tested by re-running the engine. */
export function whatWouldFlip(
  routes: RouteResearch[],
  intake: Intake,
  fx: FxTable,
  evidence: Evidence[],
  first: RankedRoute,
  second: RankedRoute,
): string {
  const cur = intake.finances.currency;
  const rankOf = (i: Intake) => {
    const r = rankRoutes_noFlip(routes, i, fx, evidence);
    return r.findIndex((x) => x.key === second.key) < r.findIndex((x) => x.key === first.key);
  };
  const tries: { label: string; intake: Intake }[] = [];
  for (const mult of [1.25, 1.5, 2, 3]) {
    const extra = Math.round(intake.finances.savings * (mult - 1));
    tries.push({ label: `you had about ${fmt(extra, cur)} more in savings`, intake: { ...intake, finances: { ...intake.finances, savings: intake.finances.savings + extra } } });
  }
  if (intake.family.spouseNeedsWorkImmediately === "yes")
    tries.push({ label: "your spouse did not need to work immediately", intake: { ...intake, family: { ...intake.family, spouseNeedsWorkImmediately: "no" } } });
  if (intake.starting.movingWindow !== "2y_plus")
    tries.push({ label: "you could wait 2+ years to move", intake: { ...intake, starting: { ...intake.starting, movingWindow: "2y_plus" } } });
  for (const p of ["affordability", "speed", "career_fit", "family_fit", "long_term"] as Priority[]) {
    if (intake.priorities.ranked[0] !== p)
      tries.push({ label: `${PRIORITY_LABEL[p].toLowerCase()} were your top priority`, intake: { ...intake, priorities: { ...intake.priorities, ranked: [p, ...intake.priorities.ranked.filter((x) => x !== p)].slice(0, 3) } } });
  }
  const hit = tries.find((t) => rankOf(t.intake));
  if (hit) return `“${second.route.title}” would overtake #1 if ${hit.label}.`;
  const gaps = (Object.keys(first.scores) as Priority[])
    .filter((k) => first.scores[k] > second.scores[k])
    .sort((a, b) => first.scores[b] - second.scores[b] - (first.scores[a] - second.scores[a]));
  return `No single change we tested flips the order. #2 trails mainly on ${gaps.slice(0, 2).map((k) => PRIORITY_LABEL[k].toLowerCase()).join(" and ") || "overall score"}; it would need new evidence improving those.`;
}

function rankRoutes_noFlip(routes: RouteResearch[], intake: Intake, fx: FxTable, evidence: Evidence[]) {
  const weights = weightsFor(intake);
  return routes
    .map((route) => {
      const calc = calculateRoute(route, intake, fx);
      const { status } = checkConstraints(route, calc, intake);
      return { key: route.key, status, score: weighted(scoreRoute(route, calc, intake, evidence), weights) };
    })
    .filter((r) => r.status !== "excluded")
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.score - a.score);
}

export type RouteChange = { key: string; title: string; before: string; after: string; why: string[] };

/** Compare two rankings (e.g. saved vs what-if) and explain differences. */
export function diffRankings(before: Ranking, after: Ranking, currency: string): RouteChange[] {
  const map = (r: Ranking) => new Map([...r.shown, ...r.overflow, ...r.excluded].map((x) => [x.key, x]));
  const b = map(before);
  const a = map(after);
  const changes: RouteChange[] = [];
  for (const [key, x] of a) {
    const y = b.get(key);
    if (!y) continue;
    const label = (r: RankedRoute) => (r.status === "excluded" ? "Excluded" : r.rank ? `#${r.rank}${r.status !== "viable" ? ` (${statusLabel(r.status)})` : ""}` : "Not shown");
    const why: string[] = [];
    if (Math.round(x.calc.upfrontTotal) !== Math.round(y.calc.upfrontTotal))
      why.push(`Upfront cash ${fmt(y.calc.upfrontTotal, currency)} → ${fmt(x.calc.upfrontTotal, currency)}`);
    if (Math.round(x.calc.fundingGapAtDeparture) !== Math.round(y.calc.fundingGapAtDeparture))
      why.push(`Funding gap ${fmt(y.calc.fundingGapAtDeparture, currency)} → ${fmt(x.calc.fundingGapAtDeparture, currency)}`);
    if (x.calc.feasibleInMonths !== y.calc.feasibleInMonths)
      why.push(`Feasible in ${y.calc.feasibleInMonths} → ${x.calc.feasibleInMonths} months`);
    if (x.status !== y.status) why.push(`Status ${statusLabel(y.status)} → ${statusLabel(x.status)}${x.statusReasons[0] ? `: ${x.statusReasons[0]}` : ""}`);
    if (Math.abs(x.score - y.score) >= 1) why.push(`Score ${y.score} → ${x.score}`);
    if (label(x) !== label(y) || why.length) changes.push({ key, title: x.route.title, before: label(y), after: label(x), why });
  }
  return changes;
}

export function statusLabel(s: RouteStatus) {
  return { viable: "Viable", needs_verification: "Needs verification", future: "Future route", excluded: "Excluded" }[s];
}
