import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "../icons";
import { cn } from "../lib/utils";

/* Dialogs and toasts render into the app's own layer inside its shadow root,
   so they keep the app's styles and sit above everything else. */
export const LayerContext = createContext<HTMLElement | null>(null);

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: ReactNode }) {
  const layer = useContext(LayerContext);
  const panel = useRef<HTMLDivElement>(null);
  const change = useRef(onOpenChange);
  change.current = onOpenChange;
  useEffect(() => {
    if (!open) return;
    const prev = (panel.current?.getRootNode() as Document | ShadowRoot | undefined)?.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") change.current(false);
      if (e.key === "Tab" && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'));
        if (!f.length) return;
        const root = panel.current.getRootNode() as ShadowRoot;
        const first = f[0]!, last = f[f.length - 1]!;
        if (e.shiftKey && root.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && root.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.focus());
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [open]);
  if (!open || !layer) return null;
  return createPortal(
    <DialogCtx.Provider value={{ panel, close: () => onOpenChange(false) }}>
      <div className="animate-fade fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />
      {children}
    </DialogCtx.Provider>,
    layer,
  );
}
const DialogCtx = createContext<{ panel: React.RefObject<HTMLDivElement | null>; close: () => void } | null>(null);

export function DialogContent({ className, children, label }: { className?: string; children: ReactNode; label?: string }) {
  const ctx = useContext(DialogCtx)!;
  return (
    <div ref={ctx.panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
      className={cn("animate-pop fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg outline-none", className)}>
      {children}
      <button type="button" onClick={ctx.close} className="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
        <X className="h-4 w-4" /><span className="sr-only">Close</span>
      </button>
    </div>
  );
}
export const DialogHeader = ({ className, children }: { className?: string; children: ReactNode }) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>;
export const DialogTitle = ({ className, children }: { className?: string; children: ReactNode }) => <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>;
export const DialogDescription = ({ className, children }: { className?: string; children: ReactNode }) => <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;

/* ---------- Toasts (replaces sonner) ---------- */
type T = { id: number; kind: "success" | "error"; text: string };
let push: (t: Omit<T, "id">) => void = () => {};
export const toast = {
  success: (text: string) => push({ kind: "success", text }),
  error: (text: string) => push({ kind: "error", text }),
};
export function Toaster() {
  const [items, setItems] = useState<T[]>([]);
  const layer = useContext(LayerContext);
  const add = useCallback((t: Omit<T, "id">) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { ...t, id }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4500);
  }, []);
  useEffect(() => { push = add; return () => { push = () => {}; }; }, [add]);
  if (!layer) return null;
  return createPortal(
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100%-2rem))] flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className={cn("animate-fade rounded-lg border bg-background p-4 text-sm shadow-lg", t.kind === "error" ? "border-excluded/40 text-excluded" : "border-border text-foreground")}>{t.text}</div>
      ))}
    </div>,
    layer,
  );
}
