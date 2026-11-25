import { rankRoutes } from "./engine/rank";
import { buildRoadmap } from "./engine/roadmap";
import { SAMPLE_EVIDENCE, SAMPLE_FX, SAMPLE_ROUTES } from "./engine/sample";
import type { FxTable, RouteResearch } from "./engine/types";
import { getDb, insertAnalysis, insertRoadmap, uid, type Analysis, type Step } from "./store";

/* Portfolio edition of the original app's server functions. The original researches live
   sources with an AI model and a web-search service; here the same ranking engine runs in
   the browser on the app's labelled sample routes and evidence, against the visitor's profile. */

export function createSampleAnalysis(): { analysisId: string } {
  const { profile } = getDb();
  if (!profile) throw new Error("Not signed in");
  const intake = profile.intake;
  // The original fetched live exchange rates for non-INR currencies; this edition uses the sample rates only.
  const fx: FxTable = SAMPLE_FX;
  const id = uid();
  const evidence = SAMPLE_EVIDENCE.map((e) => ({ ...e }));
  const routes = JSON.parse(JSON.stringify(SAMPLE_ROUTES)) as RouteResearch[];
  const ranking = rankRoutes(routes, intake, fx, evidence);
  const now = new Date().toISOString();
  const a: Analysis = {
    id, mode: "sample", status: "complete", created_at: now, completed_at: now,
    profile_version: profile.intake_version, profile_snapshot: intake, fx, routes, ranking,
    assumptions: [...new Set(routes.flatMap((r) => r.assumptions))], changes: [],
    plan: { researchQuestions: [], routes: [] }, error: null, evidence,
  };
  insertAnalysis(a);
  return { analysisId: id };
}

export function generateRoadmap({ analysisId, routeKey }: { analysisId: string; routeKey: string }): { roadmapId: string } {
  const a = getDb().analyses.find((x) => x.id === analysisId);
  if (!a) throw new Error("Analysis not found.");
  const route = a.routes.find((r) => r.key === routeKey);
  if (!route) throw new Error("Route not found.");
  const evidence = a.evidence.filter((e) => e.routeKey === route.key || e.routeKey === null);
  const drafts = buildRoadmap(route, a.profile_snapshot, a.fx, evidence);
  const id = uid();
  const steps: Step[] = drafts.map((s, i) => ({
    id: uid(), roadmap_id: id, position: i, phase: s.phase, title: s.title, what: s.what, why: s.why,
    start_when: s.startWhen, dependencies: s.dependencies, estimated_cost: s.estimatedCost, documents: s.documents,
    source_title: s.sourceTitle, source_url: s.sourceUrl, completion_criteria: s.completionCriteria,
    expert_category: s.expertCategory, before_spending: s.beforeSpending, status: "todo", notes: "",
  }));
  insertRoadmap({
    id, analysis_id: analysisId, route_key: route.key, route_title: route.title,
    summary: `${route.when.replace(/\s*[[(]e\d+(?:[,;\s]+e\d+)*[\])]/g, "")} Steps generated from your route's evidence and calculations.`,
    status: "active", created_at: new Date().toISOString(),
  }, steps);
  return { roadmapId: id };
}
