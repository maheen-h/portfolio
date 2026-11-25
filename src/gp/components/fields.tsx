import { useId } from "react";
import { Input } from "../ui/form";
import { Label } from "../ui/form";
import { Textarea } from "../ui/form";
import { Select, SelectItem } from "../ui/form";
import { cn } from "../lib/utils";

export function Field({ label, hint, children, className, htmlFor }: { label: string; hint?: string | undefined; children: React.ReactNode; className?: string | undefined; htmlFor?: string }) {
  // Without a control id (chip groups), the label names the group instead.
  const gid = useId();
  return (
    <div className={cn("space-y-1.5", className)} role={htmlFor ? undefined : "group"} aria-labelledby={htmlFor ? undefined : gid}>
      <Label id={gid} htmlFor={htmlFor} className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({ label, hint, value, onChange, placeholder, type = "text", className }: {
  label: string; hint?: string | undefined; value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string | undefined;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function NumberField({ label, hint, value, onChange, className, suffix }: { label: string; hint?: string | undefined; value: number; onChange: (v: number) => void; className?: string | undefined; suffix?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} className={className} htmlFor={id}>
      <div className="relative">
        <Input id={id} type="number" min={0} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value || 0))} className={suffix ? "pr-14" : ""} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </Field>
  );
}

export function AreaField({ label, hint, value, onChange, placeholder }: { label: string; hint?: string | undefined; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Textarea id={id} rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function SelectField<T extends string>({ label, hint, value, onChange, options }: { label: string; hint?: string | undefined; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Select id={id} value={value} onValueChange={(v) => onChange(v as T)}>
        {options.map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
      </Select>
    </Field>
  );
}

export function ChoiceChips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([k, v]) => (
        <button key={k} type="button" onClick={() => onChange(k)} aria-pressed={value === k}
          className={cn("rounded-full border px-3 py-1.5 text-sm transition", value === k ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card hover:border-primary/50")}>
          {v}
        </button>
      ))}
    </div>
  );
}

export function ToggleChips<T extends string>({ values, onChange, options }: { values: T[]; onChange: (v: T[]) => void; options: [T, string][] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([k, v]) => {
        const on = values.includes(k);
        return (
          <button key={k} type="button" aria-pressed={on} onClick={() => onChange(on ? values.filter((x) => x !== k) : [...values, k])}
            className={cn("rounded-full border px-3 py-1.5 text-sm transition", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>
            {v}
          </button>
        );
      })}
    </div>
  );
}

export function ListField({ label, hint, values, onChange, placeholder }: { label: string; hint?: string | undefined; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint ?? "Separate with commas"} htmlFor={id}>
      <Input id={id} defaultValue={values.join(", ")} placeholder={placeholder} onBlur={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
    </Field>
  );
}
