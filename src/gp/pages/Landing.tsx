import { Link } from "../router";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpenCheck, Calculator, Map, Scale, ShieldCheck } from "../icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/overlay";
import { SiteHeader } from "../components/SiteHeader";
import { StatusBadge } from "../components/FactBadge";
import { RouteCard } from "../components/RouteCard";
import { useDb } from "../lib/store";
import { fmt } from "../lib/engine/calc";
import { rankRoutes, type RankedRoute } from "../lib/engine/rank";
import { SAMPLE_EVIDENCE, SAMPLE_FX, SAMPLE_NOTICE, SAMPLE_PROFILE_FAMILY, SAMPLE_PROFILE_SOLO, SAMPLE_ROUTES } from "../lib/engine/sample";


const PERSONAS = {
  solo: { label: "Moving alone, ₹40 lakh saved", intake: SAMPLE_PROFILE_SOLO },
  family: { label: "Spouse + child, ₹8 lakh saved, spouse must work", intake: SAMPLE_PROFILE_FAMILY },
} as const;

export default function Landing() {
  const user = useDb((d) => d.session);
  const sampleRef = useRef<HTMLElement>(null);
  const [persona, setPersona] = useState<keyof typeof PERSONAS>("family");
  const [openRoute, setOpenRoute] = useState<RankedRoute | null>(null);
  const ranking = useMemo(() => rankRoutes(SAMPLE_ROUTES, PERSONAS[persona].intake, SAMPLE_FX, SAMPLE_EVIDENCE), [persona]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden bg-hero">
        <div className="pointer-events-none absolute inset-0 grid-paper opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
          <p className="eyebrow animate-rise">Relocation planning for people in emerging markets</p>
          <h1 tabIndex={-1} className="outline-none animate-rise mt-4 max-w-4xl font-display text-5xl leading-[1.02] sm:text-7xl">
            You know you want to move abroad. <span className="italic text-primary">Find a path you can trust.</span>
          </h1>
          <p className="animate-rise mt-6 max-w-2xl text-lg text-muted-foreground">
            Tell us about your degree, career, savings and family. We research current official sources, compare realistic routes,
            calculate what each one really costs your household — and turn the one you choose into a step-by-step roadmap.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap gap-3">
            {user ? (
              <Button asChild variant="ink" size="xl"><Link to="/dashboard">Open my plan <ArrowRight /></Link></Button>
            ) : (
              <Button asChild variant="ink" size="xl"><Link to="/auth" search={{ mode: "signup" }}>Start my analysis <ArrowRight /></Link></Button>
            )}
            <Button variant="quiet" size="xl" onClick={() => sampleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>See a sample comparison</Button>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-4">
            {[
              [BookOpenCheck, "Sourced, dated evidence", "Every rule and statistic links to where it came from."],
              [Calculator, "Real household costs", "Fees per person, proof of funds, funding gap by milestone."],
              [Scale, "Explainable ranking", "See why #1 is #1 — and what would change it."],
              [Map, "A roadmap you can act on", "What to verify before you pay anything."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof BookOpenCheck;
              return (
                <div key={t as string} className="rounded-xl border border-border/80 bg-card/80 p-4 backdrop-blur">
                  <I className="h-5 w-5 text-primary" />
                  <div className="mt-3 font-semibold">{t as string}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{d as string}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={sampleRef} id="sample" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="sample">Sample comparison</Badge>
            <h2 className="mt-3 font-display text-4xl">Same degree. Same career. Different households.</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Two civil engineers from Mumbai. Switch between them to see how family and savings change costs, timing and the ranking.
            </p>
          </div>
          <div className="flex rounded-lg border border-border bg-card p-1 shadow-card" role="tablist">
            {(Object.keys(PERSONAS) as (keyof typeof PERSONAS)[]).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={persona === k}
                onClick={() => setPersona(k)}
                className={`rounded-md px-3 py-2 text-sm transition ${persona === k ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {PERSONAS[k].label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 rounded-md border border-signal/50 bg-signal/10 p-3 text-xs">{SAMPLE_NOTICE}</p>

        <ol className="mt-6 space-y-3">
          {ranking.shown.map((r) => (
            <li key={r.key}>
              <button onClick={() => setOpenRoute(r)} className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-card transition hover:border-primary/50 hover:shadow-lift">
                <span className="w-10 font-display text-4xl text-primary">{r.rank}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2"><StatusBadge status={r.status} /><span className="eyebrow">{r.route.destination}</span></span>
                  <span className="mt-1 block font-medium">{r.route.title}</span>
                </span>
                <span className="hidden text-right sm:block">
                  <span className="eyebrow block">Upfront</span>
                  <span className="font-mono">{fmt(r.calc.upfrontTotal, "INR")}</span>
                </span>
                <span className="hidden text-right sm:block">
                  <span className="eyebrow block">Feasible in</span>
                  <span className="font-mono">{r.calc.feasibleInMonths} mo</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            </li>
          ))}
        </ol>
        {ranking.excluded.length > 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-excluded/40 p-4">
            <div className="eyebrow mb-2">Excluded for this household</div>
            {ranking.excluded.map((r) => (
              <div key={r.key} className="text-sm"><b>{r.route.title}</b> — {r.statusReasons[0]}</div>
            ))}
          </div>
        )}
        {ranking.whatWouldChange && <p className="mt-4 text-sm text-muted-foreground"><b>What would have to change for #2 to win?</b> {ranking.whatWouldChange}</p>}
      </section>

      <section className="border-t border-border bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-[1.3fr_1fr]">
          <div>
            <ShieldCheck className="h-6 w-6 text-signal" />
            <h2 className="mt-3 font-display text-4xl">Partners never buy a ranking.</h2>
            <p className="mt-3 max-w-xl opacity-80">
              We show vetted experts only at the step where they help — credential evaluation, financing, legal checks, training. Partner availability, referral fees and school commissions have zero influence on how routes are ranked. You can always complete a step yourself.
            </p>
          </div>
          <div className="flex items-end">
            {user ? (
              <Button asChild variant="signal" size="xl"><Link to="/dashboard">Continue my plan <ArrowRight /></Link></Button>
            ) : (
              <Button asChild variant="signal" size="xl"><Link to="/auth" search={{ mode: "signup" }}>Create my profile <ArrowRight /></Link></Button>
            )}
          </div>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-5 py-8 text-xs text-muted-foreground">
        Global Pathways AI provides research and planning support, not legal or immigration advice. Always confirm requirements with the official authority before paying.
      </footer>

      <Dialog open={!!openRoute} onOpenChange={(o) => !o && setOpenRoute(null)}>
        <DialogContent label="Recommendation reasoning" className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
          <DialogHeader className="sr-only"><DialogTitle>Recommendation reasoning</DialogTitle><DialogDescription>Why this route ranks here</DialogDescription></DialogHeader>
          {openRoute && <RouteCard r={openRoute} evidence={SAMPLE_EVIDENCE} currency="INR" sample defaultOpen />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
