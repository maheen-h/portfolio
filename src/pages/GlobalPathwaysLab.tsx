import { useEffect, useRef, useState } from 'react';
import { Page } from '../components/Layout';
import { featuredDemo } from '../content/lab';

/* The portfolio frame around the Global Pathways AI prototype: a short note on what this
   edition does, the full app (loaded on demand, in its own shadow root and design system),
   and a way back to the Lab. */
export default function GlobalPathwaysLab() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('../gp/mount')
      .then(({ mountGlobalPathways }) => {
        if (!cancelled && host.current) cleanup = mountGlobalPathways(host.current);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <Page>
      <div className="pb-6 pt-8 sm:pt-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-full bg-ledger px-3 py-1 text-[13px] font-medium text-night">{featuredDemo.label}</p>
          <h1 tabIndex={-1} className="text-[14px] text-muted outline-none">Global Pathways AI, decision intelligence prototype</h1>
        </div>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-ink/80">{featuredDemo.scope}</p>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-rule bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,.8)]">
        {failed ? (
          <p className="p-8 text-[15px] text-night">The prototype didn’t load. Refresh the page to try again.</p>
        ) : (
          <div ref={host} className="min-h-[70vh]" />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-4 pt-8">
        <a href="#lab" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-4 text-[14px] font-medium hover:border-ink/60">Back to Product Lab</a>
        <a href="#work-global-pathways-ai" className="link text-[14px] text-muted">Read the Global Pathways AI case study</a>
      </div>
    </Page>
  );
}
