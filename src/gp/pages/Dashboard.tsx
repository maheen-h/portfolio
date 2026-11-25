import { Link } from "../router";
import { ArrowRight, ClipboardList, Map, RouteIcon } from "../icons";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/form";
import { sectionComplete } from "../lib/engine/intake";
import type { Ranking } from "../lib/engine/rank";
import { useDb } from "../lib/store";


export default function Dashboard() {
  const profile = useDb((d) => d.profile)!;
  const analyses = useDb((d) => d.analyses);
  const roadmaps = useDb((d) => d.roadmaps);
  const done = Object.values(sectionComplete(profile.intake)).filter(Boolean).length;
  const latest = analyses.find((a) => a.status === "complete");
  const active = roadmaps.find((r) => r.status === "active");
  const top = latest ? ((latest.ranking as Ranking | null)?.shown?.[0] ?? null) : null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <p className="eyebrow">Welcome back{profile.display_name ? `, ${profile.display_name}` : ""}</p>
      <h1 tabIndex={-1} className="outline-none mt-1 font-display text-5xl">Your relocation plan</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-card">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-display text-2xl">Profile</h2>
          <div className="mt-3 flex items-center gap-2"><Progress value={(done / 9) * 100} className="h-2" /><span className="font-mono text-xs">{done}/9</span></div>
          <p className="mt-2 text-sm text-muted-foreground">Version {profile.intake_version}. {done < 9 ? "A few sections still need answers." : "Ready to analyse."}</p>
          <div className="mt-4 flex gap-2">
            <Button asChild variant={done < 9 ? "ink" : "quiet"} size="sm"><Link to="/intake">{done === 0 ? "Start intake" : "Edit profile"}</Link></Button>
            {done >= 3 && <Button asChild variant={done >= 9 ? "ink" : "quiet"} size="sm"><Link to="/review">Review & analyse</Link></Button>}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-card">
          <RouteIcon className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-display text-2xl">Latest comparison</h2>
          {latest ? (
            <>
              <p className="mt-2 text-sm">{top ? <>#1: <b>{top.route.title}</b></> : "No route met your must-haves."}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">{latest.mode === "sample" && <Badge variant="sample">Sample</Badge>}{new Date(latest.completed_at ?? latest.created_at).toLocaleDateString()}</p>
              <Button asChild variant="ink" size="sm" className="mt-4"><Link to="/analysis/$id" params={{ id: latest.id }}>Open comparison <ArrowRight /></Link></Button>
            </>
          ) : <p className="mt-2 text-sm text-muted-foreground">Complete your profile, then select “Analyze my options”.</p>}
        </section>

        <section className="min-w-0 rounded-xl bg-ink p-5 text-ink-foreground shadow-lift">
          <Map className="h-5 w-5 text-signal" />
          <h2 className="mt-3 font-display text-2xl">Active roadmap</h2>
          {active ? (
            <>
              <p className="mt-2 text-sm opacity-85">{active.route_title}</p>
              <Button asChild variant="signal" size="sm" className="mt-4"><Link to="/roadmap/$id" params={{ id: active.id }}>Continue roadmap <ArrowRight /></Link></Button>
            </>
          ) : <p className="mt-2 text-sm opacity-75">Choose a route in your comparison and select “Build my roadmap”.</p>}
        </section>
      </div>

      {analyses.length > 1 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-3">Past analyses</h2>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {analyses.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="flex items-center gap-2">{a.mode === "sample" && <Badge variant="sample">Sample</Badge>}{new Date(a.created_at).toLocaleString()} · profile v{a.profile_version} · {a.status}</span>
                {a.status === "complete" && <Button asChild variant="ghost" size="sm"><Link to="/analysis/$id" params={{ id: a.id }}>Open</Link></Button>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
