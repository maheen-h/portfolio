import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        verified: "border-verified/30 bg-verified/10 text-verified font-mono uppercase tracking-wide text-[10px]",
        estimate: "border-estimate/30 bg-estimate/10 text-estimate font-mono uppercase tracking-wide text-[10px]",
        assumption: "border-assumption/30 bg-assumption/10 text-assumption font-mono uppercase tracking-wide text-[10px]",
        unknown: "border-unknown/30 bg-unknown/10 text-unknown font-mono uppercase tracking-wide text-[10px]",
        viable: "border-viable/30 bg-viable/10 text-viable",
        needs_verification: "border-verify/40 bg-verify/10 text-verify",
        future: "border-future/30 bg-future/10 text-future",
        excluded: "border-excluded/30 bg-excluded/10 text-excluded",
        sample: "border-signal bg-signal/25 text-signal-foreground font-mono uppercase tracking-wide text-[10px]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
