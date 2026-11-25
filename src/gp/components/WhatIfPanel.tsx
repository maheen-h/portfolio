import { useMemo, useState } from "react";
import { RefreshCw, Save } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/form";
import { Label } from "../ui/form";
import { Select, SelectItem } from "../ui/form";
import { household } from "../lib/engine/calc";
import { WINDOW_LABEL } from "../lib/engine/intake";
import { diffRankings, rankRoutes, type Ranking } from "../lib/engine/rank";
import type { Evidence, FxTable, Intake, RouteResearch } from "../lib/engine/types";

type Field = "savings" | "movingWindow" | "spouseNeedsWork" | "monthlySavings";

export function WhatIfPanel({
  intake, routes, fx, evidence, baseline, onSave, saving,
}: {
  intake: Intake; routes: RouteResearch[]; fx: FxTable; evidence: Evidence[]; baseline: Ranking;
  onSave: (next: Intake) => void; saving?: boolean;
}) {
  const hh = household(intake);
  const [field, setField] = useState<Field>("savings");
  const [savings, setSavings] = useState(intake.finances.savings);
  const [monthly, setMonthly] = useState(intake.finances.monthlySavings);
  const [win, setWin] = useState(intake.starting.movingWindow);
  const [spouse, setSpouse] = useState(intake.family.spouseNeedsWorkImmediately);
  const [preview, setPreview] = useState<Intake | null>(null);

  const next = (): Intake => {
    if (field === "savings") return { ...intake, finances: { ...intake.finances, savings } };
    if (field === "monthlySavings") return { ...intake, finances: { ...intake.finances, monthlySavings: monthly } };
    if (field === "movingWindow") return { ...intake, starting: { ...intake.starting, movingWindow: win } };
    return { ...intake, family: { ...intake.family, spouseNeedsWorkImmediately: spouse } };
  };

  const result = useMemo(() => {
    if (!preview) return null;
    const ranking = rankRoutes(routes, preview, fx, evidence);
    return { ranking, changes: diffRankings(baseline, ranking, intake.finances.currency) };
  }, [preview, routes, fx, evidence, baseline, intake.finances.currency]);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display text-2xl">What if my situation changes?</h3>
      <p className="mt-1 text-sm text-muted-foreground">Change one detail and preview how the same evidence ranks. Nothing is saved until you choose to.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <Label htmlFor="gp-whatif-field">Change</Label>
          <Select id="gp-whatif-field" value={field} onValueChange={(v) => { setField(v as Field); setPreview(null); }}>
            
              <SelectItem value="savings">Available savings</SelectItem>
              <SelectItem value="monthlySavings">Monthly savings</SelectItem>
              <SelectItem value="movingWindow">Moving date</SelectItem>
              {hh.hasSpouse && <SelectItem value="spouseNeedsWork">Spouse needs to work immediately</SelectItem>}
            
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="gp-whatif-value">New value</Label>
          {field === "savings" && <Input id="gp-whatif-value" type="number" min={0} value={savings} onChange={(e) => setSavings(Number(e.target.value))} />}
          {field === "monthlySavings" && <Input id="gp-whatif-value" type="number" min={0} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />}
          {field === "movingWindow" && (
            <Select id="gp-whatif-value" value={win} onValueChange={(v) => setWin(v as Intake["starting"]["movingWindow"])}>
              {Object.entries(WINDOW_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </Select>
          )}
          {field === "spouseNeedsWork" && (
            <Select id="gp-whatif-value" value={spouse} onValueChange={(v) => setSpouse(v as Intake["family"]["spouseNeedsWorkImmediately"])}>
              <SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="unsure">Not sure</SelectItem>
            </Select>
          )}
        </div>
        <Button variant="quiet" onClick={() => setPreview(next())}><RefreshCw /> Preview</Button>
      </div>

      {result && (
        <div className="mt-5 space-y-3">
          <h4 className="eyebrow">Preview — new order</h4>
          <ol className="space-y-1 text-sm">
            {result.ranking.shown.map((r) => <li key={r.key}><span className="font-mono text-primary">#{r.rank}</span> {r.route.title}</li>)}
          </ol>
          {result.changes.length === 0 ? <p className="text-sm text-muted-foreground">No recommendation changes.</p> : (
            <ul className="space-y-2 text-sm">
              {result.changes.map((c) => (
                <li key={c.key} className="rounded-md border border-border p-2">
                  <div className="font-medium">{c.title}: <span className="font-mono">{c.before} → {c.after}</span></div>
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">{c.why.map((w) => <li key={w}>{w}</li>)}</ul>
                </li>
              ))}
            </ul>
          )}
          <Button variant="ink" onClick={() => preview && onSave(preview)} disabled={saving}><Save /> {saving ? "Saving…" : "Save this to my profile"}</Button>
        </div>
      )}
    </section>
  );
}
