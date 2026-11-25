import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";

/* A small hash router so the app lives under the portfolio's own hash routes:
   #lab-global-pathways            → "/"
   #lab-global-pathways/intake?step=2 → "/intake", { step: "2" }
   It mirrors the parts of TanStack Router's Link/navigate API the original app used. */

export const BASE = "#lab-global-pathways";

export type Loc = { path: string; search: Record<string, string> };

function parse(hash: string): Loc {
  const raw = decodeURIComponent(hash).replace(/^#\/?/, "#");
  const rest = raw.startsWith(BASE) ? raw.slice(BASE.length) : "";
  const [p = "", q = ""] = rest.split("?");
  const path = p && p !== "/" ? (p.startsWith("/") ? p : `/${p}`) : "/";
  return { path, search: Object.fromEntries(new URLSearchParams(q)) };
}

type To = { to: string; params?: Record<string, string>; search?: Record<string, string | number | undefined>; replace?: boolean };

export function href({ to, params, search }: To) {
  let path = to;
  for (const [k, v] of Object.entries(params ?? {})) path = path.replace(`$${k}`, encodeURIComponent(v));
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(search ?? {})) if (v !== undefined) qs.set(k, String(v));
  const q = qs.toString();
  return `${BASE}${path === "/" ? "" : path}${q ? `?${q}` : ""}`;
}

const Ctx = createContext<{ loc: Loc; navigate: (t: To) => void }>({ loc: { path: "/", search: {} }, navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<Loc>(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => {
      setLoc(parse(window.location.hash));
      // Like a page change: back to the top of the app, focus on the new page's heading.
      requestAnimationFrame(() => {
        scrollToAppTop();
        host?.shadowRoot?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
      });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const navigate = useCallback((t: To) => {
    const h = href(t);
    if (t.replace) {
      history.replaceState(null, "", h);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else window.location.hash = h;
  }, []);
  return <Ctx.Provider value={{ loc, navigate }}>{children}</Ctx.Provider>;
}

export const useLocation = () => useContext(Ctx).loc;
export const useNavigate = () => useContext(Ctx).navigate;

export function Link({ to, params, search, children, ...rest }: To & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { children?: ReactNode }) {
  return <a href={href({ to, params, search })} {...rest}>{children}</a>;
}

/** Match "/analysis/$id" against a path; returns params or null. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const out: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.startsWith("$")) out[a[i]!.slice(1)] = decodeURIComponent(b[i]!);
    else if (a[i] !== b[i]) return null;
  }
  return out;
}

/* The element the app is mounted in, so pages can scroll to the top of the app
   (not the top of the portfolio page) when they change. */
let host: HTMLElement | null = null;
export const setAppHost = (el: HTMLElement | null) => { host = el; };
export function scrollToAppTop() {
  if (!host) return;
  const top = host.getBoundingClientRect().top + window.scrollY - 72;
  if (window.scrollY > top) window.scrollTo({ top });
}
