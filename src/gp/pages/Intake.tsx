import { scrollToAppTop, useLocation, useNavigate } from "../router";
import { useEffect, useRef, useState } from "react";
import { toast } from "../ui/overlay";
import { saveIntake as save, useDb } from "../lib/store";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "../icons";
import { Button } from "../ui/button";
import { Switch } from "../ui/form";
import { AreaField, ChoiceChips, Field, ListField, NumberField, SelectField, TextField, ToggleChips } from "../components/fields";
import { MOVING_WITH_LABEL, MUST_HAVE_LABEL, PRIORITY_OPTIONS, ROUTE_TYPE_LABEL, WINDOW_LABEL, sectionComplete } from "../lib/engine/intake";
import { PRIORITY_LABEL } from "../lib/engine/rank";
import type { Intake, MustHave, Priority, RouteType } from "../lib/engine/types";
import { cn } from "../lib/utils";


const STEPS = [
  { id: "starting", title: "Starting point", blurb: "Where you are today and when you'd like to move." },
  { id: "education", title: "Education", blurb: "Your qualifications decide admission fit, recognition and licensing." },
  { id: "career", title: "Career", blurb: "Your experience and the job you want abroad." },
  { id: "language", title: "Languages", blurb: "Requirements you may already meet, and evidence still needed." },
  { id: "finances", title: "Finances", blurb: "What you can spend, save and borrow." },
  { id: "family", title: "Family", blurb: "Who is moving with you changes everything from fees to eligibility." },
  { id: "destination", title: "Destination & lifestyle", blurb: "Not sure where? That's fine — we'll suggest options." },
  { id: "goals", title: "Long-term goals", blurb: "Does the route still make sense after the first job or course ends?" },
  { id: "priorities", title: "Priorities", blurb: "Must-haves exclude routes; your top three order the rest." },
] as const;

const CURRENCIES = ["INR", "PKR", "BDT", "NGN", "KES", "GHS", "EGP", "PHP", "IDR", "VND", "BRL", "MXN", "COP", "ZAR", "LKR", "NPR", "USD", "EUR", "GBP"];

export default function IntakePage() {
  const profile = useDb((d) => d.profile)!;
  const search = useLocation().search;
  const navigate = useNavigate();
  const initial = Number(search.step);
  const [step, setStep] = useState(Number.isInteger(initial) && initial >= 0 && initial <= 8 ? initial : 0);
  const [intake, setIntake] = useState<Intake>(profile.intake);
  const [saving, setSaving] = useState(false);
  const dirty = useRef(false);

  const update = <K extends keyof Intake>(k: K, patch: Partial<Intake[K]>) => {
    dirty.current = true;
    setIntake((i) => ({ ...i, [k]: { ...i[k], ...patch } }));
  };

  async function persist(complete?: boolean) {
    setSaving(true);
    try {
      save(intake, { complete, bumpVersion: dirty.current });
      dirty.current = false;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } scrollToAppTop(); }, [step]);
  const done = sectionComplete(intake);
  const s = STEPS[step]!;

  async function next() {
    await persist();
    if (step < STEPS.length - 1) setStep(step + 1);
    else { await persist(true); navigate({ to: "/review" }); }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow mb-3">Guided intake · saved as you go</p>
        <ol className="flex gap-1 overflow-x-auto lg:flex-col">
          {STEPS.map((x, i) => (
            <li key={x.id}>
              <button onClick={async () => { await persist(); setStep(i); }}
                className={cn("flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition",
                  i === step ? "bg-ink text-ink-foreground" : "hover:bg-muted")}>
                <span className={cn("grid h-5 w-5 place-items-center rounded-full border text-[10px] font-mono", done[x.id] ? "border-verified bg-verified text-primary-foreground" : "border-border")}>
                  {done[x.id] ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {x.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <section className="animate-rise min-w-0" key={s.id}>
        <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
        <h1 tabIndex={-1} className="outline-none mt-1 font-display text-5xl">{s.title}</h1>
        <p className="mt-2 text-muted-foreground">{s.blurb}</p>

        <div className="mt-8 space-y-6 rounded-xl border border-border bg-card p-6 shadow-card">
          {s.id === "starting" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Citizenship" value={intake.starting.citizenship} onChange={(v) => update("starting", { citizenship: v })} placeholder="e.g. India" />
              <TextField label="Current country of residence" value={intake.starting.residence} onChange={(v) => update("starting", { residence: v })} />
              <NumberField label="Age (optional)" hint="Only used where a route has age-based rules or points." value={intake.starting.age ?? 0} onChange={(v) => update("starting", { age: v || null })} />
              <Field label="When would you like to move?" className="sm:col-span-2">
                <ChoiceChips value={intake.starting.movingWindow} onChange={(v) => update("starting", { movingWindow: v })} options={Object.entries(WINDOW_LABEL) as [Intake["starting"]["movingWindow"], string][]} />
              </Field>
            </div>
          )}

          {s.id === "education" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Highest qualification" value={(intake.education.highestLevel || "Bachelor's") as string} onChange={(v) => update("education", { highestLevel: v })}
                options={[["Secondary", "Secondary school"], ["Diploma", "Diploma / polytechnic"], ["Bachelor's", "Bachelor's degree"], ["Master's", "Master's degree"], ["Doctorate", "Doctorate"], ["Professional", "Professional qualification"]]} />
              <TextField label="Field of study" value={intake.education.field} onChange={(v) => update("education", { field: v })} placeholder="e.g. Civil Engineering" />
              <TextField label="Institution" value={intake.education.institution} onChange={(v) => update("education", { institution: v })} />
              <TextField label="Country where awarded" value={intake.education.awardCountry} onChange={(v) => update("education", { awardCountry: v })} />
              <TextField label="Graduation year" value={intake.education.graduationYear} onChange={(v) => update("education", { graduationYear: v })} />
              <TextField label="Grades (where relevant)" value={intake.education.grades} onChange={(v) => update("education", { grades: v })} placeholder="e.g. First class / 7.8 CGPA" />
              <div className="sm:col-span-2"><AreaField label="Licenses and certifications" value={intake.education.licenses} onChange={(v) => update("education", { licenses: v })} placeholder="e.g. Chartered engineer, PMP, nursing registration" /></div>
            </div>
          )}

          {s.id === "career" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Current role" value={intake.career.currentRole} onChange={(v) => update("career", { currentRole: v })} />
              <NumberField label="Years of relevant experience" value={intake.career.yearsExperience} onChange={(v) => update("career", { yearsExperience: v })} />
              <div className="sm:col-span-2"><AreaField label="Main responsibilities" value={intake.career.responsibilities} onChange={(v) => update("career", { responsibilities: v })} /></div>
              <div className="sm:col-span-2"><AreaField label="Key skills" value={intake.career.skills} onChange={(v) => update("career", { skills: v })} /></div>
              <TextField label="Job you want abroad" hint="Leave blank if you're open to suggestions." value={intake.career.targetOccupation} onChange={(v) => update("career", { targetOccupation: v })} />
              <NumberField label="Your monthly income today" suffix={intake.finances.currency} value={intake.career.currentMonthlyIncome} onChange={(v) => update("career", { currentMonthlyIncome: v })} hint="Used for foregone-earnings estimates." />
              <Field label="Willing to retrain?" className="sm:col-span-2">
                <ChoiceChips value={intake.career.willingToRetrain} onChange={(v) => update("career", { willingToRetrain: v })} options={[["yes", "Yes"], ["unsure", "Maybe"], ["no", "No"]]} />
              </Field>
            </div>
          )}

          {s.id === "language" && (
            <div className="space-y-4">
              {intake.language.entries.map((l, i) => {
                const set = (patch: Partial<typeof l>) => update("language", { entries: intake.language.entries.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
                return (
                  <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_1fr_auto]">
                    <TextField label="Language" value={l.language} onChange={(v) => set({ language: v })} />
                    <SelectField label="Proficiency" value={l.proficiency} onChange={(v) => set({ proficiency: v })} options={[["basic", "Basic"], ["intermediate", "Intermediate"], ["advanced", "Advanced"], ["native", "Native"]]} />
                    <Button type="button" variant="ghost" size="icon" className="self-end" aria-label="Remove language" onClick={() => update("language", { entries: intake.language.entries.filter((_, j) => j !== i) })}><Trash2 /></Button>
                    <TextField label="Test taken (if any)" value={l.test} onChange={(v) => set({ test: v })} placeholder="IELTS, TOEFL, PTE, Goethe…" />
                    {l.test && <TextField label="Score" value={l.score} onChange={(v) => set({ score: v })} />}
                    {l.test && <TextField label="Test date" type="date" value={l.testDate} onChange={(v) => set({ testDate: v })} />}
                  </div>
                );
              })}
              <Button type="button" variant="quiet" size="sm" onClick={() => update("language", { entries: [...intake.language.entries, { language: "", proficiency: "basic", test: "", score: "", testDate: "" }] })}><Plus /> Add language</Button>
            </div>
          )}

          {s.id === "finances" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Your currency" value={intake.finances.currency} onChange={(v) => update("finances", { currency: v })} options={CURRENCIES.map((c) => [c, c])} />
              <NumberField label="Savings available for the move" suffix={intake.finances.currency} value={intake.finances.savings} onChange={(v) => update("finances", { savings: v })} />
              <NumberField label="Household income per month" suffix={intake.finances.currency} value={intake.finances.householdIncomeMonthly} onChange={(v) => update("finances", { householdIncomeMonthly: v })} />
              <NumberField label="How much you can save each month" suffix={intake.finances.currency} value={intake.finances.monthlySavings} onChange={(v) => update("finances", { monthlySavings: v })} />
              <NumberField label="Maximum you're willing to borrow" suffix={intake.finances.currency} hint="0 if you don't want to borrow." value={intake.finances.maxBorrowing} onChange={(v) => update("finances", { maxBorrowing: v })} />
              <div className="sm:col-span-2"><AreaField label="Funding needs or notes" value={intake.finances.fundingNeeds} onChange={(v) => update("finances", { fundingNeeds: v })} placeholder="e.g. Family can contribute ₹2 lakh next year; need a scholarship for study routes" /></div>
            </div>
          )}

          {s.id === "family" && (
            <div className="space-y-5">
              <Field label="Who is moving?">
                <ChoiceChips value={intake.family.movingWith} onChange={(v) => update("family", { movingWith: v })} options={Object.entries(MOVING_WITH_LABEL) as [Intake["family"]["movingWith"], string][]} />
              </Field>
              {intake.family.movingWith !== "alone" && (
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div><div className="font-medium">Everyone must move at the same time</div><div className="text-sm text-muted-foreground">If on, routes that don't allow dependants are excluded.</div></div>
                  <Switch label="Everyone must move at the same time" checked={intake.family.mustMoveTogether} onCheckedChange={(v) => update("family", { mustMoveTogether: v })} />
                </div>
              )}
              {(intake.family.movingWith === "partner" || intake.family.movingWith === "partner_children") && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label="Spouse/partner's occupation" value={intake.family.spouseOccupation} onChange={(v) => update("family", { spouseOccupation: v })} />
                  <Field label="Does your spouse need to work right away for the move to be affordable?">
                    <ChoiceChips value={intake.family.spouseNeedsWorkImmediately} onChange={(v) => update("family", { spouseNeedsWorkImmediately: v })} options={[["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]]} />
                  </Field>
                </div>
              )}
              {(intake.family.movingWith === "partner_children" || intake.family.movingWith === "children") && (
                <TextField label="Children's ages" hint="Separate with commas, e.g. 4, 9" value={intake.family.childrenAges} onChange={(v) => update("family", { childrenAges: v })} />
              )}
            </div>
          )}

          {s.id === "destination" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div><div className="font-medium">I'm open to suggestions</div><div className="text-sm text-muted-foreground">We'll consider destinations you haven't named.</div></div>
                <Switch label="I'm open to suggestions" checked={intake.destination.openToSuggestions} onCheckedChange={(v) => update("destination", { openToSuggestions: v })} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <ListField label="Preferred countries" values={intake.destination.preferred} onChange={(v) => update("destination", { preferred: v })} placeholder="e.g. Canada, Germany" />
                <ListField label="Countries to exclude" values={intake.destination.excluded} onChange={(v) => update("destination", { excluded: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div><div className="font-medium">I'm open to any route type</div><div className="text-sm text-muted-foreground">Work, study, or preparing at home first.</div></div>
                <Switch label="I'm open to any route type" checked={intake.destination.routeTypesOpen} onCheckedChange={(v) => update("destination", { routeTypesOpen: v })} />
              </div>
              {!intake.destination.routeTypesOpen && (
                <ToggleChips values={intake.destination.routeTypes} onChange={(v) => update("destination", { routeTypes: v })} options={Object.entries(ROUTE_TYPE_LABEL) as [RouteType, string][]} />
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <AreaField label="Location preferences" value={intake.destination.locationPrefs} onChange={(v) => update("destination", { locationPrefs: v })} placeholder="Big city, warm climate, near family…" />
                <AreaField label="Support network abroad" value={intake.destination.supportNetwork} onChange={(v) => update("destination", { supportNetwork: v })} placeholder="e.g. Cousin in Toronto" />
              </div>
            </div>
          )}

          {s.id === "goals" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Career you want long-term" value={intake.goals.desiredCareer} onChange={(v) => update("goals", { desiredCareer: v })} />
              <TextField label="Income goal" value={intake.goals.incomeGoal} onChange={(v) => update("goals", { incomeGoal: v })} placeholder="e.g. Senior engineer salary in 5 years" />
              <Field label="Do you want long-term residence?">
                <ChoiceChips value={intake.goals.wantsPermanentResidence} onChange={(v) => update("goals", { wantsPermanentResidence: v })} options={[["yes", "Yes"], ["unsure", "Not sure"], ["no", "No"]]} />
              </Field>
              <NumberField label="Years abroad you'd accept before your career moves forward" value={intake.goals.acceptableYearsBeforeProgress} onChange={(v) => update("goals", { acceptableYearsBeforeProgress: v })} suffix="years" />
            </div>
          )}

          {s.id === "priorities" && (
            <div className="space-y-6">
              <Field label="Must-haves" hint="Any route that breaks a must-have is excluded (and we explain why).">
                <ToggleChips values={intake.priorities.mustHaves} onChange={(v) => update("priorities", { mustHaves: v })} options={Object.entries(MUST_HAVE_LABEL) as [MustHave, string][]} />
              </Field>
              <Field label="Rank your top three preferences" hint="Click in order of importance. Click again to remove.">
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((p) => {
                    const idx = intake.priorities.ranked.indexOf(p);
                    return (
                      <button key={p} type="button"
                        onClick={() => update("priorities", { ranked: idx >= 0 ? intake.priorities.ranked.filter((x) => x !== p) : intake.priorities.ranked.length < 3 ? [...intake.priorities.ranked, p] : intake.priorities.ranked })}
                        className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition", idx >= 0 ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card hover:border-primary/50")}>
                        {idx >= 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-signal font-mono text-[11px] text-signal-foreground">{idx + 1}</span>}
                        {PRIORITY_LABEL[p as Priority]}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={async () => { await persist(); setStep(step - 1); }}><ArrowLeft /> Back</Button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{saving ? "Saving…" : "Saved"}</span>
            <Button variant="ink" size="lg" onClick={next} disabled={saving}>{step === STEPS.length - 1 ? "Review my profile" : "Next"} <ArrowRight /></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
