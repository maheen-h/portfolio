import { fmt } from "./engine/calc";
import { MiniPdf } from "./pdf";
import { profileSummary } from "./engine/db";
import { statusLabel, type Ranking } from "./engine/rank";
import { SAMPLE_NOTICE } from "./engine/sample";
import type { Evidence, FxTable, Intake } from "./engine/types";

/** Builds and downloads the detailed comparison report (browser only). */
export async function downloadReport(opts: {
  intake: Intake; ranking: Ranking; evidence: Evidence[]; fx: FxTable; analysisDate: string; sample: boolean; assumptions: string[];
}) {
  const doc = new MiniPdf();
  const W = doc.width;
  const H = doc.height;
  const M = 48;
  let y = M;
  const cur = opts.intake.finances.currency;
  // jsPDF core fonts can't render some symbols; keep text ASCII-safe
  const clean = (s: string) => s.replace(/[≈]/g, "~").replace(/[→]/g, "->").replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/×/g, "x").replace(/[^\x00-\xFF]/g, "");
  const money = (n: number) => clean(fmt(n, cur)).replace(/[^\x20-\x7E]/g, "") || `${Math.round(n)} ${cur}`;

  const ensure = (h: number) => { if (y + h > H - M) { doc.addPage(); y = M; } };
  const text = (s: string, size = 10, style: "normal" | "bold" | "italic" = "normal", indent = 0, color: [number, number, number] = [30, 35, 50]) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(s), W - M * 2 - indent) as string[];
    for (const l of lines) { ensure(size * 1.4); doc.text(l, M + indent, y); y += size * 1.4; }
  };
  const gap = (n = 8) => { y += n; };
  const rule = () => { ensure(10); doc.setDrawColor(210, 200, 180); doc.line(M, y, W - M, y); y += 12; };

  text("Global Pathways AI - Relocation route comparison", 18, "bold");
  text(`Analysis date: ${new Date(opts.analysisDate).toLocaleString()}   |   Report generated: ${new Date().toLocaleString()}`, 9, "normal", 0, [90, 95, 110]);
  text(`Currency: ${cur}. Exchange rates: ${opts.fx.source}${opts.fx.asOf ? `, as of ${new Date(opts.fx.asOf).toLocaleDateString()}` : ""}.`, 9, "normal", 0, [90, 95, 110]);
  if (opts.sample) { gap(4); text(SAMPLE_NOTICE, 10, "bold", 0, [170, 90, 0]); text("Portfolio edition: generated in your browser from the app's sample routes and evidence, calculated against the profile you entered.", 9, "italic", 0, [170, 90, 0]); }
  rule();

  text("Profile used", 13, "bold");
  for (const line of profileSummary(opts.intake).split("\n")) text(line, 9);
  rule();

  text("Ranked routes", 13, "bold");
  if (opts.ranking.whatWouldChange) text(`What would make #2 better: ${opts.ranking.whatWouldChange}`, 9, "italic");
  gap(6);
  for (const r of opts.ranking.shown) {
    const c = r.calc;
    ensure(60);
    text(`#${r.rank}  ${r.route.title}`, 12, "bold");
    text(`${statusLabel(r.status)}  |  score ${r.score}  |  ${r.route.destination}${r.route.city ? ` (${r.route.city})` : ""}`, 9, "normal", 0, [60, 100, 110]);
    text(`Where: ${r.route.where}. When: ${r.route.when}. How: ${r.route.how}.`, 9);
    for (const s of r.statusReasons) text(`! ${s}`, 9, "normal", 8);
    text("Why it ranks here:", 9, "bold");
    for (const w of r.whyRank) text(`- ${w}`, 9, "normal", 8);
    text(`Biggest trade-off: ${r.route.tradeoff}`, 9);
    text(`Family: dependants ${r.route.family.dependentsAllowed}, spouse can work ${r.route.family.spouseCanWork}. ${r.route.family.spouseWorkNote} ${r.route.family.schoolingNote}`, 9);
    text(`After arrival: ${r.route.postArrival}`, 9);
    text(`Upfront cash: ${money(c.upfrontTotal)}  |  Funding gap at departure: ${money(c.fundingGapAtDeparture)}  |  Feasible in ~${c.feasibleInMonths >= 999 ? "-" : c.feasibleInMonths} months (controlled by ${c.timeline.controlling})`, 9, "bold");
    text("Cost breakdown:", 9, "bold");
    for (const l of c.lines) text(`- ${l.label} [${l.milestone}, ${l.kind}${l.refundable ? ", refundable" : ""}]: ${l.amountUser == null ? "no FX rate" : money(l.amountUser)}`, 8.5, "normal", 8);
    if (c.proofOfFunds) text(`Proof of funds: ${c.proofOfFunds.overlapNote}`, 8.5, "italic", 8);
    text("Funding by milestone:", 9, "bold");
    for (const m of c.milestones) text(`- ${m.milestone} (month ${m.month}): need ${money(m.cumulativeNeeded)}, confirmed ${money(m.confirmedAvailable)}${m.gap > 0 ? `, gap ${money(m.gap)}` : ""}`, 8.5, "normal", 8);
    text("Timeline:", 9, "bold");
    for (const t of r.route.timeline) text(`- ${t.label}: ${t.minMonths}-${t.maxMonths} months (${t.parallel ? "parallel" : "sequential"}, ${t.kind})`, 8.5, "normal", 8);
    if (r.route.wage && c.wageAnnualUser) text(`Wage: ${r.route.wage.low}-${r.route.wage.high} ${r.route.wage.currency}/yr (${money(c.wageAnnualUser.low)}-${money(c.wageAnnualUser.high)}); population: ${r.route.wage.population}; ${r.route.wage.geography}; ref ${r.route.wage.referenceYear}.`, 9);
    else text("Wage: not estimated - no credible figure found.", 9);
    text(`Break-even: ${c.breakEven.years != null ? `${c.breakEven.years} years` : "not estimated"}. ${c.breakEven.reason}`, 9);
    text("Verify before paying:", 9, "bold");
    for (const v of r.route.verifyBeforePaying) text(`[ ] ${v}`, 9, "normal", 8);
    if (r.route.unresolvedQuestions.length) { text("Unanswered questions:", 9, "bold"); for (const q of r.route.unresolvedQuestions) text(`? ${q}`, 9, "normal", 8); }
    gap(6);
    rule();
  }

  if (opts.ranking.excluded.length) {
    text("Routes excluded by your constraints", 13, "bold");
    for (const r of opts.ranking.excluded) { text(r.route.title, 10, "bold"); for (const s of r.statusReasons) text(`- ${s}`, 9, "normal", 8); }
    rule();
  }

  text("Assumptions", 13, "bold");
  for (const a of [...opts.assumptions, "Wages are gross; taxes not deducted.", "Settlement buffer = 3 months of household living costs."]) text(`- ${a}`, 9);
  rule();

  text("Sources", 13, "bold");
  opts.evidence.forEach((e, i) => {
    text(`[${i + 1}] ${e.publisher ?? ""} - ${e.title ?? ""}`, 9, "bold");
    text(`${e.claim}${e.statistic ? ` | ${e.statistic} ${e.unit ?? ""}` : ""}${e.population ? ` | population: ${e.population}` : ""}${e.geography ? ` | ${e.geography}` : ""}`, 8.5, "normal", 8);
    text(`${e.url ?? "no URL"} | published: ${e.publishedDate ?? "n/a"} | checked: ${e.checkedAt ? new Date(e.checkedAt).toLocaleDateString() : "not checked (sample)"} | ${e.sourceType}`, 8, "normal", 8, [90, 95, 110]);
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 150);
    doc.text(`Global Pathways AI - page ${p} of ${pages}${opts.sample ? " - SAMPLE" : ""}`, M, H - 24);
  }
  doc.save(`global-pathways-report-${new Date(opts.analysisDate).toISOString().slice(0, 10)}.pdf`);
}
