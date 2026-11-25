import type { CostItem, FxTable, Intake, Milestone, RouteResearch } from "./types";

export function convert(amount: number, from: string, to: string, fx: FxTable): number | null {
  if (!Number.isFinite(amount)) return null;
  if (from === to) return amount;
  const r = fx.rates;
  // rates are "1 base = r[X] X"
  const fromRate = from === fx.base ? 1 : r[from];
  const toRate = to === fx.base ? 1 : r[to];
  if (!fromRate || !toRate) return null;
  return (amount / fromRate) * toRate;
}

export function household(intake: Intake) {
  const kids = intake.family.childrenAges
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "" && !Number.isNaN(Number(s))).length;
  const w = intake.family.movingWith;
  const adults = w === "partner" || w === "partner_children" ? 2 : 1;
  const children = w === "partner_children" || w === "children" ? Math.max(kids, 1) : 0;
  return { adults, children, size: adults + children, hasSpouse: adults === 2 };
}

export type CostLine = {
  id: string;
  label: string;
  category: CostItem["category"] | "proof_of_funds";
  milestone: Milestone;
  amountUser: number | null; // in user currency
  amountLocal: number;
  localCurrency: string;
  kind: CostItem["kind"];
  evidenceIds: string[];
  refundable: boolean;
  note?: string;
};

export type MilestoneFunding = {
  milestone: Milestone;
  month: number;
  cumulativeNeeded: number;
  confirmedAvailable: number;
  gap: number; // >0 means shortfall with confirmed funds
};

export type RouteCalc = {
  currency: string;
  lines: CostLine[];
  upfrontTotal: number;
  proofOfFunds: { required: number; overlapNote: string; countedSeparately: number } | null;
  monthlyHousehold: number; // user currency, after arrival
  monthlySpouseIncome: number; // user currency, counted only if spouse can work
  monthlyNet: number | null; // after-arrival income - costs (null if wage unknown)
  milestones: MilestoneFunding[];
  fundingGapAtDeparture: number;
  potentialFunding: { borrowing: number };
  monthsToSave: number | null; // months of saving needed to close the departure gap
  timeline: { minMonths: number; maxMonths: number; controlling: string; controllingFactor: string };
  feasibleInMonths: number; // max of timeline max and savings
  wageAnnualUser: { low: number; high: number } | null;
  breakEven: { years: number | null; reason: string; investment: number | null };
  unconvertible: string[];
};

const SETTLEMENT_MONTHS = 3;

export function calculateRoute(route: RouteResearch, intake: Intake, fx: FxTable): RouteCalc {
  const cur = intake.finances.currency;
  const hh = household(intake);
  const unconvertible: string[] = [];
  const conv = (amount: number, from: string) => {
    const v = convert(amount, from, cur, fx);
    if (v == null) unconvertible.push(from);
    return v;
  };

  const lines: CostLine[] = route.costItems.map((c) => {
    const local = c.perPerson ? c.amount * hh.size : c.amount;
    return {
      id: c.id,
      label: c.perPerson && hh.size > 1 ? `${c.label} (×${hh.size} people)` : c.label,
      category: c.category,
      milestone: c.milestone,
      amountLocal: local,
      localCurrency: c.currency,
      amountUser: conv(local, c.currency),
      kind: c.kind,
      evidenceIds: c.evidenceIds,
      refundable: c.refundable,
    };
  });

  // Household living costs in destination currency
  const ml = route.monthlyLiving;
  const monthlyLocal =
    ml.singleAdult + Math.max(0, hh.adults - 1) * ml.perAdditionalAdult + hh.children * ml.perChild;
  const monthlyHousehold = conv(monthlyLocal, ml.currency) ?? 0;

  const settlementLocal = monthlyLocal * SETTLEMENT_MONTHS;
  lines.push({
    id: "settlement-buffer",
    label: `First ${SETTLEMENT_MONTHS} months of household living costs (${hh.size} ${hh.size === 1 ? "person" : "people"})`,
    category: "settlement",
    milestone: "arrival",
    amountLocal: settlementLocal,
    localCurrency: ml.currency,
    amountUser: conv(settlementLocal, ml.currency),
    kind: ml.kind === "verified" ? "estimate" : ml.kind,
    evidenceIds: ml.evidenceIds,
    refundable: false,
    note: "Calculated from monthly cost of living for your household size.",
  });

  const sum = (ls: CostLine[]) => ls.reduce((s, l) => s + (l.amountUser ?? 0), 0);
  const settlementLines = lines.filter((l) => l.category === "settlement");
  const otherLines = lines.filter((l) => l.category !== "settlement");
  const settlementTotal = sum(settlementLines);

  let pof: RouteCalc["proofOfFunds"] = null;
  let pofExtra = 0;
  if (route.proofOfFunds && route.proofOfFunds.amount > 0) {
    const p = route.proofOfFunds;
    const local = p.amount + Math.max(0, hh.size - 1) * p.perAdditionalMember;
    const required = conv(local, p.currency) ?? 0;
    if (p.overlapsSettlement) {
      pofExtra = Math.max(0, required - settlementTotal);
      pof = {
        required,
        countedSeparately: pofExtra,
        overlapNote:
          pofExtra > 0
            ? `Proof of funds (${fmt(required, cur)}) is larger than your settlement costs, so only the extra ${fmt(pofExtra, cur)} is added. The same money covers both — it is not counted twice.`
            : `Your settlement money (${fmt(settlementTotal, cur)}) also satisfies the proof-of-funds requirement (${fmt(required, cur)}), so nothing extra is added.`,
      };
    } else {
      pofExtra = required;
      pof = {
        required,
        countedSeparately: required,
        overlapNote: `This route requires funds to be held separately (${fmt(required, cur)}), so it is added on top of other costs.`,
      };
    }
    if (pofExtra > 0) {
      lines.push({
        id: "proof-of-funds",
        label: "Proof of funds not already covered by settlement money",
        category: "proof_of_funds",
        milestone: "application",
        amountLocal: convert(pofExtra, cur, p.currency, fx) ?? pofExtra,
        localCurrency: p.currency,
        amountUser: pofExtra,
        kind: p.kind,
        evidenceIds: p.evidenceIds,
        refundable: true,
        note: p.note,
      });
    }
  }

  const upfrontTotal = sum(otherLines) + settlementTotal + pofExtra;

  // Timeline: slowest parallel step, then sequential steps
  const par = route.timeline.filter((t) => t.parallel);
  const seq = route.timeline.filter((t) => !t.parallel);
  const slowest = par.reduce<typeof par[number] | null>((a, t) => (!a || t.maxMonths > a.maxMonths ? t : a), null);
  const minMonths = Math.max(0, ...par.map((t) => t.minMonths)) + seq.reduce((s, t) => s + t.minMonths, 0);
  const maxMonths = Math.max(0, ...par.map((t) => t.maxMonths)) + seq.reduce((s, t) => s + t.maxMonths, 0);

  // Milestone months (upper-bound planning)
  const prepEnd = Math.max(0, ...par.map((t) => t.maxMonths));
  const monthOf: Record<Milestone, number> = {
    preparation: 0,
    application: prepEnd,
    pre_departure: maxMonths,
    arrival: maxMonths,
  };
  const order: Milestone[] = ["preparation", "application", "pre_departure", "arrival"];
  let cumulative = 0;
  const savingsRate = Math.max(0, intake.finances.monthlySavings);
  const milestones: MilestoneFunding[] = order.map((m) => {
    cumulative += sum(lines.filter((l) => l.milestone === m));
    const confirmedAvailable = intake.finances.savings + savingsRate * monthOf[m];
    return { milestone: m, month: monthOf[m], cumulativeNeeded: cumulative, confirmedAvailable, gap: cumulative - confirmedAvailable };
  });
  const departure = milestones[milestones.length - 1]!;
  const fundingGapAtDeparture = Math.max(0, departure.gap);

  // Months of saving needed so total cash covers total cost
  const shortfallNow = upfrontTotal - intake.finances.savings;
  const monthsToSave =
    shortfallNow <= 0 ? 0 : savingsRate > 0 ? Math.ceil(shortfallNow / savingsRate) : null;

  let controlling = slowest?.label ?? "No preparation steps";
  let controllingFactor: string = slowest?.factor ?? "other";
  let feasibleInMonths = maxMonths;
  if (monthsToSave == null) {
    controlling = "Savings — no monthly savings to close the gap";
    controllingFactor = "savings";
    feasibleInMonths = Math.max(maxMonths, 999);
  } else if (monthsToSave > maxMonths) {
    controlling = `Saving ${fmt(shortfallNow, cur)} more at ${fmt(savingsRate, cur)}/month`;
    controllingFactor = "savings";
    feasibleInMonths = monthsToSave;
  }
  if (route.eligibility.futureActionMonths && route.eligibility.futureActionMonths > feasibleInMonths) {
    feasibleInMonths = route.eligibility.futureActionMonths;
    controlling = route.eligibility.futureAction ?? controlling;
    controllingFactor = "experience";
  }

  // Spouse income only counts if the route lets the spouse work
  const spouseCounts = hh.hasSpouse && route.family.spouseCanWork === "yes" && route.spouseMonthlyIncomeEstimate;
  const monthlySpouseIncome = spouseCounts ? conv(route.spouseMonthlyIncomeEstimate ?? 0, ml.currency) ?? 0 : 0;

  let wageAnnualUser: RouteCalc["wageAnnualUser"] = null;
  if (route.wage && route.wage.kind !== "unknown") {
    const lo = conv(route.wage.low, route.wage.currency);
    const hi = conv(route.wage.high, route.wage.currency);
    if (lo != null && hi != null) wageAnnualUser = { low: lo, high: hi };
  }
  // Gross wage; tax not modelled, flagged as assumption in the UI.
  const monthlyNet = wageAnnualUser
    ? wageAnnualUser.low / 12 + monthlySpouseIncome - monthlyHousehold
    : route.pathway === "study"
      ? monthlySpouseIncome - monthlyHousehold
      : null;

  // Break-even: only with a wage estimate
  let breakEven: RouteCalc["breakEven"];
  if (!wageAnnualUser) {
    breakEven = { years: null, investment: null, reason: "Not estimated — no credible wage figure for the target role and location." };
  } else {
    const studyMonths = route.pathway === "study" ? seq.reduce((s, t) => s + (t.factor === "education" ? t.maxMonths : 0), 0) : 0;
    const foregone = studyMonths * intake.career.currentMonthlyIncome;
    const studyLiving = studyMonths * Math.max(0, monthlyHousehold - monthlySpouseIncome);
    const investment = upfrontTotal + foregone + studyLiving;
    const annualSurplusAbroad = wageAnnualUser.low + monthlySpouseIncome * 12 - monthlyHousehold * 12;
    const annualSurplusHome = intake.finances.monthlySavings * 12;
    const gain = annualSurplusAbroad - annualSurplusHome;
    breakEven =
      gain > 0
        ? {
            years: Math.round((investment / gain) * 10) / 10,
            investment,
            reason: `Uses the low end of the wage range (gross, before tax), your household costs, ${studyMonths ? `${studyMonths} months of foregone earnings, ` : ""}and compares against what you save today.`,
          }
        : {
            years: null,
            investment,
            reason: "Does not break even on these assumptions: the low-end wage does not exceed household costs plus what you save today.",
          };
  }

  return {
    currency: cur,
    lines,
    upfrontTotal,
    proofOfFunds: pof,
    monthlyHousehold,
    monthlySpouseIncome,
    monthlyNet,
    milestones,
    fundingGapAtDeparture,
    potentialFunding: { borrowing: intake.finances.maxBorrowing },
    monthsToSave,
    timeline: { minMonths, maxMonths, controlling, controllingFactor },
    feasibleInMonths,
    wageAnnualUser,
    breakEven,
    unconvertible: [...new Set(unconvertible)],
  };
}

export function fmt(n: number, currency: string): string {
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${Math.round(n).toLocaleString("en")} ${currency}`;
  }
}

export function windowMonths(w: Intake["starting"]["movingWindow"]): number {
  return { asap: 3, "6_12": 12, "1_2y": 24, "2y_plus": 36, flexible: 36 }[w];
}
