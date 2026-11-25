import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "../router";
import { Button } from "../ui/button";
import { Input, Label } from "../ui/form";
import { SiteHeader } from "../components/SiteHeader";
import { ChoiceChips } from "../components/fields";
import { SAMPLE_PROFILE_FAMILY, SAMPLE_PROFILE_SOLO } from "../lib/engine/sample";
import { resetDemo, signIn, storageAvailable, useDb } from "../lib/store";

/* Portfolio edition of the sign-in page. The full app uses real accounts (email, Google, Lovable).
   Here sign-in is a demo step: no account, no password, and nothing leaves this browser. */
export default function AuthPage() {
  const search = useLocation().search;
  const navigate = useNavigate();
  const session = useDb((d) => d.session);
  const saved = useDb((d) => d.profile);
  const [mode, setMode] = useState(search.mode === "signup" || !saved ? "signup" : "signin");
  const [name, setName] = useState("");
  const [start, setStart] = useState<"empty" | "family" | "solo">("family");

  // Already signed in when arriving here: go to the plan, as the original did.
  useEffect(() => { if (session) navigate({ to: "/dashboard", replace: true }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function create(e: React.FormEvent) {
    e.preventDefault();
    signIn({ fresh: true, name: name.trim(), intake: start === "family" ? SAMPLE_PROFILE_FAMILY : start === "solo" ? SAMPLE_PROFILE_SOLO : undefined });
    navigate({ to: start === "empty" ? "/intake" : "/review", replace: true });
  }

  const title = mode === "signup" ? "Create your demo profile" : "Welcome back";
  return (
    <div className="min-h-screen bg-hero">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-[1fr_420px]">
        <div className="hidden md:block">
          <p className="eyebrow">Global Pathways AI</p>
          <h1 tabIndex={-1} className="outline-none mt-3 font-display text-5xl leading-tight">Your profile, comparisons and roadmap — saved in one place.</h1>
          <p className="mt-4 text-muted-foreground">Come back any time: we'll open your latest comparison or active roadmap.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lift">
          <h2 className="font-display text-3xl">{title}</h2>
          <p className="mt-3 rounded-md border border-signal/60 bg-signal/10 p-3 text-xs">
            Portfolio demo: no account or password. Your profile and plans are saved in this browser only{storageAvailable ? "" : " (storage is blocked here, so they last until you close the page)"}.
          </p>

          {mode === "signin" && saved ? (
            <div className="mt-5 space-y-3">
              <p className="text-sm">A demo profile{saved.display_name ? ` for ${saved.display_name}` : ""} is saved in this browser.</p>
              <Button variant="ink" className="h-10 w-full" onClick={() => { signIn({}); navigate({ to: "/dashboard", replace: true }); }}>Continue where I left off</Button>
              <div className="flex flex-wrap justify-between gap-2 pt-1 text-sm">
                <button type="button" className="text-primary hover:underline" onClick={() => setMode("signup")}>Start a new demo profile</button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => { resetDemo(); setMode("signup"); }}>Delete saved demo data</button>
              </div>
            </div>
          ) : (
            <form onSubmit={create} className="mt-5 space-y-4">
              <div className="space-y-1"><Label htmlFor="gp-name">Your name (optional)</Label><Input id="gp-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" /></div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Start from</p>
                <ChoiceChips value={start} onChange={setStart} options={[["family", "Sample: spouse + child"], ["solo", "Sample: moving alone"], ["empty", "An empty profile"]]} />
                <p className="text-xs text-muted-foreground">{start === "empty" ? "You'll fill in the nine-step guided intake yourself." : "A civil engineer from Mumbai, from the app's test personas. You can edit every answer."}</p>
              </div>
              <Button type="submit" variant="ink" className="h-10 w-full">{start === "empty" ? "Start my profile" : "Load the sample profile"}</Button>
              {saved && <button type="button" className="text-sm text-primary hover:underline" onClick={() => setMode("signin")}>Use the profile already saved here</button>}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
