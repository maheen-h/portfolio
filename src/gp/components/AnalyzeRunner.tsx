import { useState } from "react";
import { useNavigate } from "../router";
import { AlertTriangle, Check, Loader2, Sparkles } from "../icons";
import { Button } from "../ui/button";
import { createSampleAnalysis } from "../lib/actions";
import { cn } from "../lib/utils";


export function AnalyzeRunner({ disabled }: { disabled?: boolean }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "ranking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Portfolio edition: the original researches live sources with an AI model first. Here the same
  // ranking engine runs straight away on the app's labelled sample routes, against this profile.
  function run() {
    setError(null);
    setPhase("ranking");
    window.setTimeout(() => {
      try {
        const { analysisId } = createSampleAnalysis();
        navigate({ to: "/analysis/$id", params: { id: analysisId } });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create the analysis");
        setPhase("error");
      }
    }, 900);
  }

  if (phase === "idle")
    return <Button variant="ink" size="xl" onClick={run} disabled={disabled}><Sparkles /> Analyze my options</Button>;

  return (
    <div className="w-full rounded-xl border border-border bg-card p-5 shadow-card">
      {phase === "error" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-excluded"><AlertTriangle className="h-5 w-5" /> Analysis stopped</div>
          <p className="text-sm">{error}</p>
          <div className="flex gap-2"><Button variant="ink" onClick={run}>Try again</Button></div>
        </div>
      ) : (
        <div className="space-y-4">
          <Step on={false} done label="Reading your profile" />
          <Step on={false} done label="Loading the sample routes and evidence (live research runs only in the full app)" />
          <Step on done={false} label="Checking your constraints, calculating costs and ranking" />
          <div className="relative h-1 overflow-hidden rounded-full bg-muted"><div className="absolute inset-y-0 w-1/3 animate-scan bg-primary" /></div>
        </div>
      )}
    </div>
  );
}

function Step({ on, done, label }: { on: boolean; done: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", !on && !done && "text-muted-foreground")}>
      {done ? <Check className="h-5 w-5 text-verified" /> : on ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <span className="h-5 w-5 rounded-full border border-border" />}
      <span className={cn(on && "font-semibold")}>{label}</span>
    </div>
  );
}
