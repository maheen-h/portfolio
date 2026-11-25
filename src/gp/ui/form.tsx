import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { ChevronDown } from "../icons";
import { cn } from "../lib/utils";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(({ className, type, ...props }, ref) => (
  <input type={type} ref={ref} {...props}
    className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(({ className, ...props }, ref) => (
  <textarea ref={ref} {...props}
    className={cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />;
}

/** Native select styled like the original's Radix select trigger (keyboard and mobile friendly). */
export function Select({ value, onValueChange, children, id, className, "aria-label": ariaLabel }: { value: string; onValueChange: (v: string) => void; children: ReactNode; id?: string; className?: string; "aria-label"?: string }) {
  return (
    <div className={cn("relative", className)}>
      <select id={id} aria-label={ariaLabel} value={value} onChange={(e) => onValueChange(e.target.value)}
        className="flex h-9 w-full cursor-pointer appearance-none items-center rounded-md border border-input bg-transparent py-2 pl-3 pr-9 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
    </div>
  );
}
export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return <option value={value}>{children}</option>;
}

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  return (
    <div role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value || 0)}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}>
      <div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
    </div>
  );
}

export function Switch({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (v: boolean) => void; label?: string }) {
  const id = useId();
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onCheckedChange(!checked)}
      className={cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", checked ? "bg-primary" : "bg-input")}>
      <span className={cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
    </button>
  );
}
