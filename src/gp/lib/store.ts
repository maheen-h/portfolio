import { useSyncExternalStore } from "react";
import { EMPTY_INTAKE, normalizeIntake } from "./engine/intake";
import type { ExpertCategory } from "./engine/roadmap";
import type { RouteChange, Ranking } from "./engine/rank";
import type { Evidence, FxTable, Intake, RouteResearch } from "./engine/types";

/* Portfolio edition: stands in for the original app's Supabase tables.
   Everything is kept in this browser's localStorage, under one key, for one demo user.
   No account is created and nothing leaves the visitor's browser. */

export type Profile = { id: string; display_name: string; intake: Intake; intake_complete: boolean; intake_version: number };
export type Analysis = {
  id: string; mode: "sample" | "live"; status: "researching" | "complete" | "failed"; created_at: string; completed_at: string | null;
  profile_version: number; profile_snapshot: Intake; fx: FxTable; routes: RouteResearch[]; ranking: Ranking | null;
  assumptions: string[]; changes: RouteChange[]; plan: { researchQuestions: string[]; routes: { key: string; title: string }[] }; error: string | null;
  evidence: Evidence[];
};
export type Roadmap = { id: string; analysis_id: string; route_key: string; route_title: string; summary: string; status: "active" | "archived"; created_at: string };
export type Step = {
  id: string; roadmap_id: string; position: number; phase: "verify" | "prepare" | "finance" | "apply" | "relocate" | "post_arrival";
  title: string; what: string; why: string; start_when: string; dependencies: string[]; estimated_cost: string; documents: string[];
  source_title: string | null; source_url: string | null; completion_criteria: string; expert_category: ExpertCategory | null;
  before_spending: boolean; status: string; notes: string;
};
export type Expert = { id: string; name: string; category: ExpertCategory; service: string; location: string | null; url: string | null; vetted: string; price: string; commercial_relationship: string };

type Db = { session: { userId: string } | null; profile: Profile | null; analyses: Analysis[]; roadmaps: Roadmap[]; steps: Step[] };

const KEY = "gp-portfolio-demo-v1";
const empty: Db = { session: null, profile: null, analyses: [], roadmaps: [], steps: [] };

export let storageAvailable = true;
function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const d = JSON.parse(raw) as Db;
    if (d.profile) d.profile.intake = normalizeIntake(d.profile.intake);
    return { ...empty, ...d };
  } catch {
    storageAvailable = false;
    return empty;
  }
}

let db: Db = load();
const listeners = new Set<() => void>();
function commit(next: Db) {
  db = next;
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { storageAvailable = false; }
  listeners.forEach((l) => l());
}
window.addEventListener("storage", (e) => { if (e.key === KEY) { db = load(); listeners.forEach((l) => l()); } });

export function useDb<T>(select: (d: Db) => T): T {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => select(db));
}
export const getDb = () => db;

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

/* ---------- Demo sign-in ---------- */

export function signIn(opts: { name?: string; intake?: Intake; fresh?: boolean }) {
  if (db.profile && !opts.fresh) {
    commit({ ...db, session: { userId: db.profile.id } });
    return;
  }
  // A new demo profile starts with a clean slate in this browser.
  const id = uid();
  const profile: Profile = { id, display_name: opts.name ?? "", intake: normalizeIntake(opts.intake ?? EMPTY_INTAKE), intake_complete: Boolean(opts.intake), intake_version: 1 };
  commit({ ...empty, session: { userId: id }, profile });
}
export function signOut() { commit({ ...db, session: null }); }
/** Removes every trace of the demo from this browser. */
export function resetDemo() { commit({ ...empty }); }

/* ---------- Profile ---------- */

export function saveIntake(intake: Intake, opts: { complete?: boolean | undefined; bumpVersion?: boolean | undefined }) {
  if (!db.profile) throw new Error("Not signed in");
  const p = db.profile;
  commit({ ...db, profile: { ...p, intake, intake_complete: opts.complete ?? p.intake_complete, intake_version: opts.bumpVersion ? p.intake_version + 1 : p.intake_version } });
}

/* ---------- Analyses and roadmaps ---------- */

export function insertAnalysis(a: Analysis) { commit({ ...db, analyses: [a, ...db.analyses].slice(0, 20) }); }
export function insertRoadmap(r: Roadmap, steps: Step[]) {
  const roadmaps = [r, ...db.roadmaps.map((x) => ({ ...x, status: "archived" as const }))].slice(0, 10);
  const kept = new Set(roadmaps.map((x) => x.id));
  commit({ ...db, roadmaps, steps: [...db.steps.filter((s) => kept.has(s.roadmap_id)), ...steps] });
}
export function patchStep(id: string, values: Partial<Step>) {
  commit({ ...db, steps: db.steps.map((s) => (s.id === id ? { ...s, ...values } : s)) });
}

/* The partner directory from the original app's seed data. Partners never affect rankings. */
const d = { vetted: "Vetting details not yet published.", price: "No negotiated price published yet.", commercial_relationship: "Institutional partner of Global Pathways AI. Referral or commission terms not yet disclosed." };
export const EXPERTS: Expert[] = ([
  ["Fortis Evaluations", "credential_evaluation", "Foreign credential and degree evaluation reports", "United States", "https://fortiseval.com/"],
  ["Carnegie Evaluations", "credential_evaluation", "Foreign education credential evaluation", "United States", "https://carnegieevaluations.com/"],
  ["Shan Potts Law", "immigration_legal", "Immigration legal advice and route verification", "United States", "https://www.shanpottslaw.com/"],
  ["Credila", "financing", "Education loans for study abroad", "India", "https://www.credila.com/"],
  ["Sueños Solutions", "training", "Tech workforce training and data-science certification cohorts", "United States", "https://suenossolutions.org/"],
  ["Koaches", "interview_prep", "AI interview coaching for recruiter, behavioral and hiring-manager rounds", "Online", "https://www.koaches.app/"],
  ["Mascot Tutorials", "test_prep", "Education and exam preparation center", "Mumbai, India", null],
  ["Saboo Siddiq (University of Mumbai affiliate)", "local_education", "Engineering and polytechnic programs for local qualifications", "Mumbai, India", "https://www.mhssp.ac.in/"],
  ["NVIDIA Inception Program", "entrepreneurship", "Support program for AI and deep-tech startups", "Global", "https://www.nvidia.com/en-us/startups/"],
  ["California SBDC", "entrepreneurship", "Small business advising for founders starting a business in California", "California, United States", "https://www.californiasbdc.org/"],
] as [string, ExpertCategory, string, string, string | null][]).map(([name, category, service, location, url], i) => ({ id: `expert-${i}`, name, category, service, location, url, ...d })).sort((a, b) => a.name.localeCompare(b.name));
