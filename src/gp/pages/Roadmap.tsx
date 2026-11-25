import { Link, match, useLocation } from "../router";
import { useState } from "react";
import { ArrowLeft, Check, ExternalLink, Pencil, ShieldAlert, Users } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/form";
import { Textarea } from "../ui/form";
import { Progress } from "../ui/form";
import { EXPERTS, patchStep, useDb, type Expert, type Step, type Roadmap } from "../lib/store";
import { Missing } from "./Analysis";
import { EXPERT_CATEGORY_LABEL, PHASE_LABEL, type ExpertCategory, type StepDraft } from "../lib/engine/roadmap";
import { cn } from "../lib/utils";


const STATUS: [string, string][] = [["todo", "To do"], ["in_progress", "In progress"], ["done", "Done"]];

export default function RoadmapPage() {
  const { id = "" } = match("/roadmap/$id", useLocation().path) ?? {};
  const roadmap = useDb((d) => d.roadmaps.find((x) => x.id === id));
  const all = useDb((d) => d.steps);
  if (!roadmap) return <Missing what="roadmap" />;
  return <RoadmapView roadmap={roadmap} steps={all.filter((s) => s.roadmap_id === id).sort((a, b) => a.position - b.position)} />;
}

function RoadmapView({ roadmap, steps }: { roadmap: Roadmap; steps: Step[] }) {
  const experts = EXPERTS;
  const done = steps.filter((s) => s.status === "done").length;
  const verify = steps.filter((s) => s.before_spending);
  const phases = (Object.keys(PHASE_LABEL) as StepDraft["phase"][]).filter((p) => steps.some((s) => s.phase === p));

  function patch(stepId: string, values: Partial<Step>) {
    patchStep(stepId, values);
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Button asChild variant="ghost" size="sm"><Link to="/analysis/$id" params={{ id: roadmap.analysis_id }}><ArrowLeft /> Back to comparison</Link></Button>
      <p className="eyebrow mt-4">Your roadmap</p>
      <h1 tabIndex={-1} className="outline-none mt-1 font-display text-4xl leading-tight sm:text-5xl">{roadmap.route_title}</h1>
      {roadmap.summary && <p className="mt-2 max-w-3xl text-muted-foreground">{roadmap.summary}</p>}
      <div className="mt-5 flex items-center gap-3">
        <Progress value={steps.length ? (done / steps.length) * 100 : 0} className="h-2 max-w-sm" />
        <span className="font-mono text-sm">{done}/{steps.length} done</span>
      </div>

      {verify.length > 0 && (
        <section className="mt-8 rounded-xl border-2 border-signal bg-signal/10 p-5">
          <h2 className="flex items-center gap-2 font-display text-2xl"><ShieldAlert className="h-5 w-5" /> Verify these before you spend money</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {verify.map((s) => (
              <li key={s.id} className="flex items-start gap-2">
                <button aria-label={s.status === "done" ? "Mark not done" : "Mark done"} onClick={() => patch(s.id, { status: s.status === "done" ? "todo" : "done" })}
                  className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border", s.status === "done" ? "border-verified bg-verified text-primary-foreground" : "border-foreground/40 bg-card")}>
                  {s.status === "done" && <Check className="h-3 w-3" />}
                </button>
                <span className={cn(s.status === "done" && "text-muted-foreground line-through")}>{s.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {phases.map((p) => (
        <section key={p} className="mt-10">
          <h2 className="eyebrow mb-3">{PHASE_LABEL[p]}</h2>
          <ol className="space-y-3">
            {steps.filter((s) => s.phase === p).map((s) => <StepCard key={s.id} s={s} experts={experts} onPatch={(v) => patch(s.id, v)} />)}
          </ol>
        </section>
      ))}
    </main>
  );
}

function StepCard({ s, experts, onPatch }: { s: Step; experts: Expert[]; onPatch: (v: Partial<Step>) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: s.title, what: s.what, start_when: s.start_when, estimated_cost: s.estimated_cost, completion_criteria: s.completion_criteria, notes: s.notes });
  const matches = s.expert_category ? experts.filter((e) => e.category === s.expert_category) : [];
  return (
    <li className={cn("rounded-xl border border-border bg-card p-5 shadow-card", s.status === "done" && "opacity-70")}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          {editing ? <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /> : <h3 className={cn("text-lg font-semibold", s.status === "done" && "line-through")}>{s.title}</h3>}
        </div>
        <div className="flex rounded-md border border-border p-0.5 text-xs">
          {STATUS.map(([k, v]) => (
            <button key={k} onClick={() => onPatch({ status: k })} className={cn("rounded px-2 py-1", s.status === k ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground")}>{v}</button>
          ))}
        </div>
        <Button variant="ghost" size="icon" aria-label="Edit step" onClick={() => setEditing((e) => !e)}><Pencil /></Button>
      </div>

      {editing ? (
        <div className="mt-3 grid gap-2 text-sm">
          <Textarea value={draft.what} onChange={(e) => setDraft({ ...draft, what: e.target.value })} />
          <div className="grid gap-2 sm:grid-cols-3">
            <Input value={draft.start_when} onChange={(e) => setDraft({ ...draft, start_when: e.target.value })} placeholder="When to start" />
            <Input value={draft.estimated_cost} onChange={(e) => setDraft({ ...draft, estimated_cost: e.target.value })} placeholder="Estimated cost" />
            <Input value={draft.completion_criteria} onChange={(e) => setDraft({ ...draft, completion_criteria: e.target.value })} placeholder="What counts as complete" />
          </div>
          <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Your notes" />
          <div><Button size="sm" variant="ink" onClick={() => { onPatch(draft); setEditing(false); }}>Save step</Button></div>
        </div>
      ) : (
        <div className="mt-3 grid gap-4 text-sm sm:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2">
            <p><span className="eyebrow mr-2">What</span>{s.what}</p>
            <p><span className="eyebrow mr-2">Why for you</span>{s.why}</p>
            {s.notes && <p className="rounded-md bg-muted/70 p-2"><span className="eyebrow mr-2">Notes</span>{s.notes}</p>}
          </div>
          <dl className="space-y-1.5">
            <Row k="Start">{s.start_when || "—"}</Row>
            <Row k="Depends on">{s.dependencies.length ? s.dependencies.join(", ") : "Nothing"}</Row>
            <Row k="Est. cost">{s.estimated_cost || "—"}</Row>
            <Row k="Documents">{s.documents.length ? s.documents.join(", ") : "—"}</Row>
            <Row k="Complete when">{s.completion_criteria || "—"}</Row>
            <Row k="Source">{s.source_url ? <a href={s.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{s.source_title ?? "Source"} <ExternalLink className="h-3 w-3" /></a> : "No specific source"}</Row>
          </dl>
        </div>
      )}

      {matches.length > 0 && (
        <details className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-medium"><Users className="h-4 w-4" /> Expert help for this step · {EXPERT_CATEGORY_LABEL[s.expert_category as ExpertCategory]} ({matches.length})</summary>
          <p className="mt-2 text-xs text-muted-foreground">Optional — you can complete this step yourself. Listings have no influence on your route ranking.</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {matches.map((e) => (
              <li key={e.id} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{e.name}</span>
                  {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="text-primary" aria-label={`Visit ${e.name}`}><ExternalLink className="h-4 w-4" /></a>}
                </div>
                <p className="text-xs text-muted-foreground">{e.service}{e.location ? ` · ${e.location}` : ""}</p>
                <dl className="mt-2 space-y-0.5 text-xs">
                  <div><dt className="inline font-medium">What was vetted: </dt><dd className="inline">{e.vetted}</dd></div>
                  <div><dt className="inline font-medium">Price: </dt><dd className="inline">{e.price}</dd></div>
                  <div><dt className="inline font-medium">Commercial relationship: </dt><dd className="inline">{e.commercial_relationship}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0">{children}</dd></div>;
}
