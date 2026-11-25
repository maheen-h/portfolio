import { useState } from "react";
import { AlertTriangle, ArrowRight, BookOpenCheck, ChevronDown, ExternalLink, Scale, ShieldCheck, Users } from "../icons";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/overlay";
import { fmt } from "../lib/engine/calc";
import { ROUTE_TYPE_LABEL } from "../lib/engine/intake";
import type { RankedRoute } from "../lib/engine/rank";
import type { Evidence, FactKind } from "../lib/engine/types";
import { FactBadge, StatusBadge } from "./FactBadge";
import { cn } from "../lib/utils";

const MILESTONE_LABEL = { preparation: "Preparation", application: "Application", pre_departure: "Before departure", arrival: "On arrival" } as const;

export function RouteCard({
  r, evidence, currency, sample, onBuild, onCompare, building, defaultOpen,
}: {
  r: RankedRoute; evidence: Evidence[]; currency: string; sample: boolean;
  onBuild?: () => void; onCompare?: () => void; building?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [evOpen, setEvOpen] = useState(false);
  const c = r.calc;
  const route = r.route;
  const mine = evidence.filter((e) => e.routeKey === route.key || e.routeKey === null);
  const months = c.feasibleInMonths >= 999 ? "—" : `${c.feasibleInMonths}`;
  return (
    <article className="animate-rise overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="flex gap-5 p-5 sm:p-6">
        <div className="hidden w-14 shrink-0 sm:block">
          <div className="font-display text-6xl leading-none text-primary">{r.rank ?? "—"}</div>
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-3xl leading-none text-primary sm:hidden">#{r.rank}</span>
            <StatusBadge status={r.status} />
            <span className="eyebrow">{route.destination}{route.city ? ` · ${route.city}` : ""}</span>
            <span className="eyebrow">· {ROUTE_TYPE_LABEL[route.pathway]}</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground" title="Weighted score from your priorities">score {r.score}</span>
          </div>
          <h3 className="font-display text-2xl leading-tight sm:text-[1.7rem]">{route.title}</h3>

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            {[["Where", route.where], ["When", route.when], ["How", route.how]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-muted/60 p-3">
                <dt className="eyebrow mb-1">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            <Stat label="Upfront cash needed" value={fmt(c.upfrontTotal, currency)} />
            <Stat label="Funding gap at departure" value={c.fundingGapAtDeparture > 0 ? fmt(c.fundingGapAtDeparture, currency) : "None"} sub={`if you leave at the earliest point (month ${c.timeline.maxMonths}), confirmed funds only`} tone={c.fundingGapAtDeparture > 0 ? "warn" : "ok"} />
            <Stat label="Feasible in" value={`${months} mo`} sub={c.timeline.controlling} />
            <Stat label="Monthly after arrival" value={c.monthlyNet == null ? "Not estimated" : fmt(c.monthlyNet, currency)} sub={c.monthlyNet == null ? "No credible wage figure" : "gross income − household costs"} tone={c.monthlyNet != null && c.monthlyNet < 0 ? "warn" : undefined} />
          </div>

          {r.statusReasons.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-verify/30 bg-verify/5 p-3 text-sm">
              {r.statusReasons.map((s) => (
                <li key={s} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-verify" />{s}</li>
              ))}
            </ul>
          )}

          <section>
            <h4 className="eyebrow mb-2">Why it ranks here</h4>
            <ul className="space-y-1.5 text-sm">
              {r.whyRank.map((w) => <li key={w} className="flex gap-2"><ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />{w}</li>)}
            </ul>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Block icon={<Scale />} title="Biggest trade-off">{route.tradeoff}</Block>
            <Block icon={<Users />} title="Family & after arrival">
              <p>Dependants: <b>{route.family.dependentsAllowed}</b> · Spouse can work: <b>{route.family.spouseCanWork}</b>. {route.family.spouseWorkNote}</p>
              {route.family.schoolingNote && <p className="mt-1">{route.family.schoolingNote}</p>}
              <p className="mt-1">{route.postArrival}</p>
            </Block>
          </div>

          <Block icon={<ShieldCheck />} title="Verify before paying or committing" tone="signal">
            <ul className="list-inside list-disc space-y-0.5">
              {[...route.verifyBeforePaying, ...route.unresolvedQuestions].map((v) => <li key={v}>{v}</li>)}
            </ul>
          </Block>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="quiet" size="sm" onClick={() => setEvOpen(true)}><BookOpenCheck /> View evidence ({mine.length})</Button>
            {onCompare && <Button variant="quiet" size="sm" onClick={onCompare}>Compare routes</Button>}
            <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              Costs, timing & assumptions <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
            </Button>
            {onBuild && (
              <Button variant="ink" size="sm" className="ml-auto" onClick={onBuild} disabled={building}>
                {building ? "Building roadmap…" : "Build my roadmap"} <ArrowRight />
              </Button>
            )}
          </div>

          {open && <RouteDetails r={r} currency={currency} sample={sample} />}
        </div>
      </div>
      <EvidenceDialog open={evOpen} onOpenChange={setEvOpen} title={route.title} evidence={mine} />
    </article>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string | undefined; tone?: "ok" | "warn" | undefined }) {
  return (
    <div className="bg-card p-3">
      <div className="eyebrow">{label}</div>
      <div className={cn("mt-1 font-mono text-lg font-medium", tone === "warn" && "text-excluded", tone === "ok" && "text-verified")}>{value}</div>
      {sub && <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Block({ icon, title, children, tone }: { icon: React.ReactNode; title: string; children: React.ReactNode; tone?: "signal" }) {
  return (
    <div className={cn("rounded-lg border border-border p-3 text-sm [&_svg]:h-4 [&_svg]:w-4", tone === "signal" && "border-signal/50 bg-signal/10")}>
      <div className="mb-1.5 flex items-center gap-2 font-semibold">{icon}{title}</div>
      <div className="text-foreground/85">{children}</div>
    </div>
  );
}

export function RouteDetails({ r, currency, sample }: { r: RankedRoute; currency: string; sample: boolean }) {
  const c = r.calc;
  const route = r.route;
  return (
    <div className="space-y-5 border-t border-dashed border-border pt-4 text-sm">
      <section>
        <h4 className="eyebrow mb-2">Upfront cost breakdown ({currency})</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="py-1 font-medium">Item</th><th className="font-medium">When</th><th className="font-medium">Type</th><th className="text-right font-medium">Local</th><th className="text-right font-medium">{currency}</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.lines.map((l) => (
                <tr key={l.id}>
                  <td className="py-1.5 pr-2">{l.label}{l.refundable && <span className="ml-1 text-xs text-muted-foreground">(refundable)</span>}</td>
                  <td className="pr-2 text-muted-foreground">{MILESTONE_LABEL[l.milestone]}</td>
                  <td className="pr-2"><FactBadge kind={l.kind as FactKind} sample={sample} /></td>
                  <td className="text-right font-mono text-muted-foreground">{fmt(l.amountLocal, l.localCurrency)}</td>
                  <td className="text-right font-mono">{l.amountUser == null ? "—" : fmt(l.amountUser, currency)}</td>
                </tr>
              ))}
              <tr className="font-semibold"><td className="py-1.5" colSpan={4}>Total upfront cash</td><td className="text-right font-mono">{fmt(c.upfrontTotal, currency)}</td></tr>
            </tbody>
          </table>
        </div>
        {c.proofOfFunds && <p className="mt-2 rounded-md bg-muted/60 p-2 text-xs"><b>Proof of funds:</b> {c.proofOfFunds.overlapNote}</p>}
        {c.unconvertible.length > 0 && <p className="mt-2 text-xs text-excluded">No exchange rate for {c.unconvertible.join(", ")} — those items are not in the total.</p>}
      </section>

      <section>
        <h4 className="eyebrow mb-2">Funding by milestone</h4>
        <div className="grid gap-2 sm:grid-cols-4">
          {c.milestones.map((m) => (
            <div key={m.milestone} className="rounded-md border border-border p-2">
              <div className="text-xs text-muted-foreground">{MILESTONE_LABEL[m.milestone]} · month {m.month}</div>
              <div className="font-mono text-xs">Need {fmt(m.cumulativeNeeded, currency)}</div>
              <div className="font-mono text-xs">Have {fmt(m.confirmedAvailable, currency)}</div>
              <div className={cn("font-mono text-xs font-semibold", m.gap > 0 ? "text-excluded" : "text-verified")}>{m.gap > 0 ? `Gap ${fmt(m.gap, currency)}` : "Covered"}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">“Have” counts only confirmed funds: current savings plus your monthly savings until that date. Potential borrowing (up to {fmt(c.potentialFunding.borrowing, currency)}) and unconfirmed scholarships are not counted.</p>
      </section>

      <section>
        <h4 className="eyebrow mb-2">Timeline — {c.timeline.minMonths}–{c.timeline.maxMonths} months of steps; controlled by {c.timeline.controlling.toLowerCase()}</h4>
        <ul className="space-y-1">
          {route.timeline.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <span className="w-24 shrink-0 font-mono text-xs">{t.minMonths}–{t.maxMonths} mo</span>
              <span className="flex-1">{t.label} <span className="text-xs text-muted-foreground">({t.parallel ? "runs in parallel" : "after preparation"})</span></span>
              <FactBadge kind={t.kind} sample={sample} />
            </li>
          ))}
          {c.monthsToSave != null && c.monthsToSave > 0 && <li className="text-xs text-muted-foreground">Saving the remaining cost takes ≈{c.monthsToSave} months at your current rate (runs in parallel).</li>}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div>
          <h4 className="eyebrow mb-1">Career & financial outlook</h4>
          {route.wage && c.wageAnnualUser ? (
            <p>Wage {fmt(route.wage.low, route.wage.currency)}–{fmt(route.wage.high, route.wage.currency)} / year ({fmt(c.wageAnnualUser.low, currency)}–{fmt(c.wageAnnualUser.high, currency)}). <span className="text-muted-foreground">Population: {route.wage.population}; {route.wage.geography}; ref. {route.wage.referenceYear}.</span> <FactBadge kind={route.wage.kind} sample={sample} /></p>
          ) : <p className="text-muted-foreground">No credible wage figure was found for this role and location.</p>}
          <p className="mt-1">Break-even: {c.breakEven.years != null ? <b>{c.breakEven.years} years</b> : "not estimated"}. <span className="text-muted-foreground">{c.breakEven.reason}</span></p>
          <p className="mt-1 text-muted-foreground">{route.assessment.longTermReason}</p>
        </div>
        <div>
          <h4 className="eyebrow mb-1">Assumptions</h4>
          <ul className="list-inside list-disc text-muted-foreground">
            {route.assumptions.map((a) => <li key={a}>{a}</li>)}
            <li>Wages are gross; taxes are not deducted.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export function EvidenceDialog({ open, onOpenChange, title, evidence }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; evidence: Evidence[] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">Evidence</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        {evidence.length === 0 ? <p className="text-sm text-muted-foreground">No source evidence was stored for this route. Treat all figures as estimates.</p> : (
          <ol className="space-y-3">
            {evidence.map((e) => (
              <li key={e.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow">{e.topic.replace("_", " ")}</span>
                  <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] uppercase", e.sourceType === "primary" ? "bg-verified/15 text-verified" : e.sourceType === "sample" ? "bg-signal/25 text-signal-foreground" : "bg-muted text-muted-foreground")}>{e.sourceType === "sample" ? "sample — not checked" : `${e.sourceType} source`}</span>
                </div>
                <p className="mt-1.5">{e.claim}</p>
                {(e.statistic || e.population) && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{[e.statistic, e.unit, e.population && `population: ${e.population}`, e.geography].filter(Boolean).join(" · ")}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{e.publisher}</span>
                  {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{e.title ?? e.url}<ExternalLink className="h-3 w-3" /></a>}
                  {e.publishedDate && <span>Published/effective: {e.publishedDate}</span>}
                  {e.referenceYear && <span>Ref. year: {e.referenceYear}</span>}
                  <span>Checked: {e.checkedAt ? new Date(e.checkedAt).toLocaleDateString() : "not checked"}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
