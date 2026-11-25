import type { Evidence } from "./types";

export type EvidenceRow = {
  id: string;
  route_key: string | null;
  topic: string;
  claim: string;
  statistic: string | null;
  unit: string | null;
  population: string | null;
  geography: string | null;
  publisher: string | null;
  title: string | null;
  url: string | null;
  published_date: string | null;
  reference_year: string | null;
  source_type: string;
  checked_at: string | null;
};

export function rowToEvidence(r: EvidenceRow): Evidence {
  return {
    id: r.id,
    routeKey: r.route_key,
    topic: r.topic as Evidence["topic"],
    claim: r.claim,
    statistic: r.statistic,
    unit: r.unit,
    population: r.population,
    geography: r.geography,
    publisher: r.publisher,
    title: r.title,
    url: r.url,
    publishedDate: r.published_date,
    referenceYear: r.reference_year,
    sourceType: r.source_type as Evidence["sourceType"],
    checkedAt: r.source_type === "sample" ? null : r.checked_at,
  };
}

export function evidenceToRow(e: Omit<Evidence, "id">, analysisId: string, userId: string) {
  return {
    analysis_id: analysisId,
    user_id: userId,
    route_key: e.routeKey,
    topic: e.topic,
    claim: e.claim,
    statistic: e.statistic,
    unit: e.unit,
    population: e.population,
    geography: e.geography,
    publisher: e.publisher,
    title: e.title,
    url: e.url,
    published_date: e.publishedDate,
    reference_year: e.referenceYear,
    source_type: e.sourceType,
  };
}

export function profileSummary(i: import("./types").Intake): string {
  const lines = [
    `Citizenship: ${i.starting.citizenship || "?"}; lives in: ${i.starting.residence || "?"}; age: ${i.starting.age ?? "not given"}; moving window: ${i.starting.movingWindow}`,
    `Education: ${i.education.highestLevel} in ${i.education.field}, ${i.education.institution} (${i.education.awardCountry}, ${i.education.graduationYear}); grades: ${i.education.grades}; licenses: ${i.education.licenses || "none"}`,
    `Career: ${i.career.currentRole}, ${i.career.yearsExperience} yrs; responsibilities: ${i.career.responsibilities}; skills: ${i.career.skills}; target occupation: ${i.career.targetOccupation}; willing to retrain: ${i.career.willingToRetrain}`,
    `Languages: ${i.language.entries.map((l) => `${l.language} (${l.proficiency}${l.test ? `, ${l.test} ${l.score} ${l.testDate}` : ""})`).join("; ")}`,
    `Finances (${i.finances.currency}): savings ${i.finances.savings}; household income/month ${i.finances.householdIncomeMonthly}; saves/month ${i.finances.monthlySavings}; max borrowing ${i.finances.maxBorrowing}; notes: ${i.finances.fundingNeeds}`,
    `Family: moving with ${i.family.movingWith}; must move together: ${i.family.mustMoveTogether}; spouse occupation: ${i.family.spouseOccupation || "n/a"}; spouse needs work immediately: ${i.family.spouseNeedsWorkImmediately}; children ages: ${i.family.childrenAges || "none"}`,
    `Destinations: preferred ${i.destination.preferred.join(", ") || "none"}; excluded ${i.destination.excluded.join(", ") || "none"}; open to suggestions: ${i.destination.openToSuggestions}; route types: ${i.destination.routeTypesOpen ? "open" : i.destination.routeTypes.join(", ")}; location prefs: ${i.destination.locationPrefs}; support network: ${i.destination.supportNetwork}`,
    `Goals: ${i.goals.desiredCareer}; income goal: ${i.goals.incomeGoal}; wants permanent residence: ${i.goals.wantsPermanentResidence}; acceptable years before career progress: ${i.goals.acceptableYearsBeforeProgress}`,
    `Must-haves: ${i.priorities.mustHaves.join(", ") || "none"}; top preferences in order: ${i.priorities.ranked.join(", ")}`,
  ];
  return lines.join("\n");
}
