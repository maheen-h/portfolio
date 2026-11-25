import { Link } from "../router";
import { useState } from "react";
import { toast } from "../ui/overlay";
import { HelpCircle, Pencil } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/form";
import { AnalyzeRunner } from "../components/AnalyzeRunner";
import { ChoiceChips } from "../components/fields";
import { fmt, household } from "../lib/engine/calc";
import { MOVING_WITH_LABEL, MUST_HAVE_LABEL, ROUTE_TYPE_LABEL, WINDOW_LABEL, targetedQuestions } from "../lib/engine/intake";
import { PRIORITY_LABEL } from "../lib/engine/rank";
import type { Intake } from "../lib/engine/types";
import { saveIntake, useDb } from "../lib/store";


export default function Review() {
  const profile = useDb((d) => d.profile)!;
  const i = profile.intake;
  const cur = i.finances.currency;
  const hh = household(i);
  const qs = targetedQuestions(i);

  async function answer(next: Intake) {
    try {
      saveIntake(next, { bumpVersion: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  }

  const sections: [string, number, [string, string][]][] = [
    ["Starting point", 0, [["Citizenship", i.starting.citizenship], ["Lives in", i.starting.residence], ["Moving window", WINDOW_LABEL[i.starting.movingWindow]], ["Age", i.starting.age ? String(i.starting.age) : "—"]]],
    ["Education", 1, [["Qualification", `${i.education.highestLevel} in ${i.education.field}`], ["Institution", `${i.education.institution} (${i.education.awardCountry}, ${i.education.graduationYear})`], ["Licenses", i.education.licenses || "—"]]],
    ["Career", 2, [["Now", `${i.career.currentRole}, ${i.career.yearsExperience} yrs`], ["Target abroad", i.career.targetOccupation || "Open to suggestions"], ["Retrain", i.career.willingToRetrain]]],
    ["Languages", 3, i.language.entries.map((l) => [l.language, `${l.proficiency}${l.test ? ` · ${l.test} ${l.score}` : ""}`])],
    ["Finances", 4, [["Savings", fmt(i.finances.savings, cur)], ["Saves / month", fmt(i.finances.monthlySavings, cur)], ["Max borrowing", fmt(i.finances.maxBorrowing, cur)]]],
    ["Family", 5, [["Moving", MOVING_WITH_LABEL[i.family.movingWith]], ["Household size", String(hh.size)], ["Move together", i.family.mustMoveTogether ? "Required" : "Flexible"], ...(hh.hasSpouse ? [["Spouse must work now", i.family.spouseNeedsWorkImmediately] as [string, string]] : [])]],
    ["Destination", 6, [["Preferred", i.destination.preferred.join(", ") || "—"], ["Excluded", i.destination.excluded.join(", ") || "—"], ["Open to suggestions", i.destination.openToSuggestions ? "Yes" : "No"], ["Route types", i.destination.routeTypesOpen ? "Any" : i.destination.routeTypes.map((r) => ROUTE_TYPE_LABEL[r]).join(", ")]]],
    ["Long-term goals", 7, [["Career", i.goals.desiredCareer || "—"], ["Long-term residence", i.goals.wantsPermanentResidence]]],
    ["Priorities", 8, [["Must-haves", i.priorities.mustHaves.map((m) => MUST_HAVE_LABEL[m]).join("; ") || "None"], ["Top three", i.priorities.ranked.map((p, n) => `${n + 1}. ${PRIORITY_LABEL[p]}`).join("  ") || "Not ranked"]]],
  ];

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="eyebrow">Profile version {profile.intake_version}</p>
      <h1 tabIndex={-1} className="outline-none mt-1 font-display text-5xl">Here's what we'll use to compare your routes.</h1>
      <p className="mt-2 text-muted-foreground">Edit anything that's wrong. Your name and contact details are never used in research searches.</p>

      {qs.length > 0 && (
        <section className="mt-8 space-y-3 rounded-xl border border-signal/60 bg-signal/10 p-5">
          <h2 className="flex items-center gap-2 font-semibold"><HelpCircle className="h-5 w-5" /> {qs.length === 1 ? "One answer" : `${qs.length} answers`} could change your results</h2>
          {qs.map((q) => (
            <div key={q.id} className="rounded-lg bg-card p-4 shadow-card">
              <p className="font-medium">{q.question}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{q.why}</p>
              <div className="mt-3">
                {q.id === "spouse_work" && <ChoiceChips value={i.family.spouseNeedsWorkImmediately} onChange={(v) => answer({ ...i, family: { ...i.family, spouseNeedsWorkImmediately: v } })} options={[["yes", "Yes, immediately"], ["no", "No, we can manage"]]} />}
                {q.id === "together" && <ChoiceChips value={i.family.mustMoveTogether ? "y" : "n"} onChange={(v) => answer({ ...i, family: { ...i.family, mustMoveTogether: v === "y" } })} options={[["y", "Must move together"], ["l", "Family can join later"]]} />}
                {q.id === "kids" && <InlineText placeholder="e.g. 4, 9" onSave={(v) => answer({ ...i, family: { ...i.family, childrenAges: v } })} />}
                {q.id === "savings" && <InlineText type="number" placeholder={`Amount in ${cur}`} onSave={(v) => answer({ ...i, finances: { ...i.finances, savings: Number(v) || 0 } })} />}
                {q.id === "target" && <InlineText placeholder="e.g. Civil engineer" onSave={(v) => answer({ ...i, career: { ...i.career, targetOccupation: v } })} />}
                {q.id === "priorities" && <Button asChild variant="quiet" size="sm"><Link to="/intake" search={{ step: 8 }}>Rank priorities</Link></Button>}
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map(([title, step, rows]) => (
          <section key={title} className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-xl">{title}</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/intake" search={{ step }}><Pencil /> Edit</Link></Button>
            </div>
            <dl className="space-y-1 text-sm">
              {rows.map(([k, v]) => <div key={k} className="flex gap-3"><dt className="w-28 shrink-0 text-muted-foreground sm:w-36">{k}</dt><dd className="min-w-0 break-words">{v || "—"}</dd></div>)}
            </dl>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start gap-3">
        <AnalyzeRunner />
        <p className="text-xs text-muted-foreground">In the full app, we research official sources for each candidate route. This portfolio edition ranks the app’s sample routes against your profile. Partners and referral fees never affect the ranking.</p>
      </div>
    </main>
  );
}

function InlineText({ onSave, placeholder, type = "text" }: { onSave: (v: string) => void; placeholder?: string; type?: string }) {
  const [v, setV] = useState("");
  return (
    <div className="flex max-w-sm gap-2">
      <Input type={type} value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} />
      <Button variant="ink" size="sm" className="h-9" onClick={() => v && onSave(v)}>Save</Button>
    </div>
  );
}
