import { fmt } from "../lib/engine/calc";
import { PRIORITY_LABEL, type Ranking } from "../lib/engine/rank";
import type { Priority } from "../lib/engine/types";
import { StatusBadge } from "./FactBadge";
import { cn } from "../lib/utils";

export function ComparisonTable({ ranking, currency }: { ranking: Ranking; currency: string }) {
  const rows = ranking.shown;
  const prios = Object.keys(ranking.weights) as Priority[];
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="w-48 p-3 eyebrow">Compare</th>
            {rows.map((r) => (
              <th key={r.key} className="p-3 align-top font-normal">
                <div className="font-display text-2xl leading-none text-primary">#{r.rank}</div>
                <div className="mt-1 line-clamp-3 text-xs font-semibold">{r.route.title}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <Row label="Status">{rows.map((r) => <td key={r.key} className="p-3"><StatusBadge status={r.status} /></td>)}</Row>
          <Row label="Weighted score">{rows.map((r) => <td key={r.key} className="p-3 font-mono">{r.score}</td>)}</Row>
          {prios.map((p) => (
            <Row key={p} label={`${PRIORITY_LABEL[p]}${ranking.weights[p] > 1 ? ` ×${ranking.weights[p]}` : ""}`}>
              {rows.map((r) => (
                <td key={r.key} className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${r.scores[p]}%` }} /></div>
                    <span className="font-mono text-xs">{r.scores[p]}</span>
                  </div>
                </td>
              ))}
            </Row>
          ))}
          <Row label="Upfront cash">{rows.map((r) => <td key={r.key} className="p-3 font-mono">{fmt(r.calc.upfrontTotal, currency)}</td>)}</Row>
          <Row label="Funding gap">{rows.map((r) => <td key={r.key} className={cn("p-3 font-mono", r.calc.fundingGapAtDeparture > 0 && "text-excluded")}>{r.calc.fundingGapAtDeparture > 0 ? fmt(r.calc.fundingGapAtDeparture, currency) : "—"}</td>)}</Row>
          <Row label="Feasible in">{rows.map((r) => <td key={r.key} className="p-3 font-mono">{r.calc.feasibleInMonths >= 999 ? "—" : `${r.calc.feasibleInMonths} mo`}</td>)}</Row>
          <Row label="Family can come / spouse works">{rows.map((r) => <td key={r.key} className="p-3 text-xs">{r.route.family.dependentsAllowed} / {r.route.family.spouseCanWork}</td>)}</Row>
          <Row label="Long-term residence">{rows.map((r) => <td key={r.key} className="p-3 text-xs">{r.route.longTerm.prPathway}</td>)}</Row>
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th className="p-3 text-left text-xs font-medium text-muted-foreground">{label}</th>
      {children}
    </tr>
  );
}
