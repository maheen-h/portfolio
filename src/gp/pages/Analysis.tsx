import { Link, useLocation, match, useNavigate } from "../router";
import { useMemo, useRef, useState } from "react";
import { toast } from "../ui/overlay";
import { AlertTriangle, Download, GitCompare, HelpCircle, RefreshCw } from "../icons";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ComparisonTable } from "../components/ComparisonTable";
import { RouteCard } from "../components/RouteCard";
import { WhatIfPanel } from "../components/WhatIfPanel";
import { normalizeIntake } from "../lib/engine/intake";
import { diffRankings, rankRoutes, type RouteChange } from "../lib/engine/rank";
import { SAMPLE_NOTICE } from "../lib/engine/sample";
import type { FxTable, Intake, RouteResearch } from "../lib/engine/types";
import { saveIntake, useDb, type Analysis } from "../lib/store";
import { generateRoadmap } from "../lib/actions";
import { downloadReport } from "../lib/report";


export default function AnalysisPage() {
  const { id = "" } = match("/analysis/$id", useLocation().path) ?? {};
  const a = useDb((d) => d.analyses.find((x) => x.id === id));
  if (!a) return <Missing what="comparison" />;
  return <AnalysisView a={a} id={id} />;
}

export function Missing({ what }: { what: string }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 tabIndex={-1} className="outline-none font-display text-4xl">This {what} isn't saved in this browser</h1>
      <p className="mt-2 text-muted-foreground">In this portfolio edition, plans are kept in the browser where they were made. Open your plan to see what's saved here.</p>
      <Button asChild variant="ink" className="mt-6"><Link to="/dashboard">Open my plan</Link></Button>
    </main>
  );
}

function AnalysisView({ a, id }: { a: Analysis; id: string }) {
  const profile = useDb((d) => d.profile)!;
  const navigate = useNavigate();
  const [building, setBuilding] = useState<string | null>(null);
  const [savingScenario, setSavingScenario] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);

  const routes = (a.routes ?? []) as unknown as RouteResearch[];
  const fx = a.fx as unknown as FxTable;
  const intake = useMemo(() => normalizeIntake(a.profile_snapshot), [a.profile_snapshot]);
  const sample = a.mode === "sample";
  const cur = intake.finances.currency;
  const ranking = useMemo(() => rankRoutes(routes, intake, fx, a.evidence), [routes, intake, fx, a.evidence]);

  const profileChanged = profile.intake_version !== a.profile_version;
  const currentDiff = useMemo<RouteChange[]>(() => {
    if (!profileChanged) return [];
    return diffRankings(ranking, rankRoutes(routes, profile.intake, fx, a.evidence), cur);
  }, [profileChanged, ranking, routes, profile.intake, fx, a.evidence, cur]);
  const prevChanges = (a.changes ?? []) as unknown as RouteChange[];
  const planned = ((a.plan as { routes?: { key: string; title: string }[] })?.routes ?? []).filter((p) => !routes.some((r) => r.key === p.key));

  if (a.status !== "complete") {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 tabIndex={-1} className="outline-none font-display text-4xl">This analysis didn't finish</h1>
        <p className="mt-2 text-muted-foreground">{a.error ?? "It was interrupted."}</p>
        <Button asChild variant="ink" className="mt-6"><Link to="/review">Run a new analysis</Link></Button>
      </main>
    );
  }

  async function onBuild(key: string) {
    setBuilding(key);
    try {
      const { roadmapId } = generateRoadmap({ analysisId: id, routeKey: key });
      navigate({ to: "/roadmap/$id", params: { id: roadmapId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build roadmap");
      setBuilding(null);
    }
  }

  async function onSaveScenario(next: Intake) {
    setSavingScenario(true);
    try {
      saveIntake(next, { bumpVersion: true });
      toast.success("Saved to your profile. Run a new analysis to rank with it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSavingScenario(false);
    }
  }

  const top = ranking.shown[0];
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {sample ? <Badge variant="sample">Sample analysis</Badge> : <Badge variant="verified">Live research</Badge>}
            <span className="eyebrow">Analysed {new Date(a.completed_at ?? a.created_at).toLocaleString()} · profile v{a.profile_version}</span>
          </div>
          <h1 tabIndex={-1} className="outline-none mt-2 font-display text-5xl">Your ranked routes</h1>
          <p className="mt-1 text-muted-foreground">{ranking.shown.length} credible route{ranking.shown.length === 1 ? "" : "s"}{ranking.excluded.length ? `, ${ranking.excluded.length} excluded by your constraints` : ""}. Exchange rates: {fx.source}{fx.asOf ? `, ${new Date(fx.asOf).toLocaleDateString()}` : ""}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="quiet" onClick={() => compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}><GitCompare /> Compare routes</Button>
          <Button variant="ink" onClick={() => downloadReport({ intake, ranking, evidence: a.evidence, fx, analysisDate: a.completed_at ?? a.created_at, sample, assumptions: (a.assumptions ?? []) as string[] })}><Download /> Download detailed report</Button>
        </div>
      </div>

      {sample && <p className="mt-5 rounded-md border border-signal/60 bg-signal/10 p-3 text-sm">{SAMPLE_NOTICE} Calculations use your real profile.</p>}

      {planned.length > 0 && (
        <p className="mt-4 flex gap-2 rounded-md border border-verify/40 bg-verify/5 p-3 text-sm"><AlertTriangle className="h-4 w-4 shrink-0 text-verify" /> We couldn't research {planned.map((p) => `“${p.title}”`).join(", ")}, so they're not ranked.</p>
      )}

      {profileChanged && (
        <section className="mt-5 rounded-xl border border-primary/30 bg-accent/60 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <b>Your profile changed since this analysis (v{a.profile_version} → v{profile.intake_version}).</b>
            <Button asChild size="sm" variant="ink"><Link to="/review"><RefreshCw /> Re-run with new profile</Link></Button>
          </div>
          {currentDiff.length === 0 ? <p className="mt-1">On the same evidence, no recommendation changes.</p> : (
            <ul className="mt-2 space-y-1">{currentDiff.map((c) => <li key={c.key}><b>{c.title}</b>: {c.before} → {c.after}. <span className="text-muted-foreground">{c.why.join("; ")}</span></li>)}</ul>
          )}
        </section>
      )}

      {prevChanges.length > 0 && (
        <details className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
          <summary className="cursor-pointer font-semibold">What changed since your previous analysis ({prevChanges.length})</summary>
          <ul className="mt-2 space-y-1">{prevChanges.map((c) => <li key={c.key}><b>{c.title}</b>: {c.before} → {c.after}. <span className="text-muted-foreground">{c.why.join("; ")}</span></li>)}</ul>
        </details>
      )}

      {top && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-ink p-5 text-ink-foreground shadow-lift">
            <div className="eyebrow !text-ink-foreground/60">Why is #1 right for me?</div>
            <p className="mt-2 font-display text-2xl leading-snug">{top.route.title}</p>
            <p className="mt-2 text-sm opacity-80">{top.whyRank[0]}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="eyebrow flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> What would have to change for #2 to be better?</div>
            <p className="mt-2 text-sm">{ranking.whatWouldChange ?? "There is only one credible route for your profile right now."}</p>
          </div>
        </section>
      )}

      <section className="mt-8 space-y-5">
        {ranking.shown.map((r) => (
          <RouteCard key={r.key} r={r} evidence={a.evidence} currency={cur} sample={sample}
            onBuild={() => onBuild(r.key)} building={building === r.key}
            onCompare={() => compareRef.current?.scrollIntoView({ behavior: "smooth" })} />
        ))}
        {ranking.shown.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No route meets your must-haves right now. See the excluded routes below and what would make them work.</p>}
      </section>

      {ranking.overflow.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Also researched but not in your top five: {ranking.overflow.map((r) => r.route.title).join("; ")}.</p>
      )}

      {ranking.excluded.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-3xl">Excluded by your constraints</h2>
          <div className="mt-3 space-y-2">
            {ranking.excluded.map((r) => (
              <div key={r.key} className="rounded-lg border border-dashed border-excluded/40 bg-card p-4 text-sm">
                <div className="font-semibold">{r.route.title}</div>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">{r.statusReasons.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <div ref={compareRef} className="mt-12 scroll-mt-20">
        <h2 className="mb-3 font-display text-3xl">Compare routes</h2>
        {ranking.shown.length > 0 && <ComparisonTable ranking={ranking} currency={cur} />}
      </div>

      <div className="mt-12">
        <WhatIfPanel intake={intake} routes={routes} fx={fx} evidence={a.evidence} baseline={ranking} onSave={onSaveScenario} saving={savingScenario} />
      </div>
    </main>
  );
}
