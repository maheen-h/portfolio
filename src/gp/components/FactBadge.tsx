import { Badge } from "../ui/badge";
import type { FactKind } from "../lib/engine/types";
import type { RouteStatus } from "../lib/engine/rank";
import { statusLabel } from "../lib/engine/rank";

const KIND_LABEL: Record<FactKind, string> = { verified: "Verified", estimate: "Estimate", assumption: "Assumption", unknown: "Unknown" };
const KIND_HELP: Record<FactKind, string> = {
  verified: "Stated in a retrieved source",
  estimate: "Reasoned estimate — not stated in a source",
  assumption: "An assumption we made; check it",
  unknown: "No credible evidence found",
};

export function FactBadge({ kind, sample }: { kind: FactKind; sample?: boolean }) {
  if (sample) return <Badge variant="sample" title="Illustrative sample figure">Sample</Badge>;
  return <Badge variant={kind} title={KIND_HELP[kind]}>{KIND_LABEL[kind]}</Badge>;
}

export function StatusBadge({ status }: { status: RouteStatus }) {
  return <Badge variant={status}>{statusLabel(status)}</Badge>;
}
