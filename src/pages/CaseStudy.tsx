import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Page } from '../components/Layout';
import { CreditTag } from '../components/Bits';
import { BMFlow, CubFactors, GGUMatrix, GGUTimeline, GPTradeoff, JetsweatModules, PMIJourney, ProjectPanel, ZoomButton } from '../components/Visuals';
import { projects } from '../content/projects';
import type { CaseStudy as CS, Decision } from '../content/types';

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-[16px] leading-relaxed sm:text-[17px]">
      {items.map((t) => (
        <li key={t} className="relative pl-5 before:absolute before:left-0 before:top-[0.72em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-ink/35">{t}</li>
      ))}
    </ul>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[10px] border border-rule bg-sheet p-5 sm:p-7 ${className}`}>{children}</div>;
}

function SubHead({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-[14px] font-medium text-muted">{children}</h3>;
}

/** Both options stay visible. Where the consequences can be shown per item, a toggle compares them. */
function DecisionCompare({ d, impacts }: { d: Decision; impacts?: { item: string; byOption: string[] }[] }) {
  const chosen = Math.max(0, d.options.findIndex((o) => o.chosen));
  const [sel, setSel] = useState(chosen);
  return (
    <div className="space-y-5">
      <p className="display text-[22px] font-semibold leading-snug tracking-[-0.02em] sm:text-[26px]">{d.question}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {d.options.map((o, i) => (
          <div key={o.label} className={`rounded-[10px] border p-5 ${o.chosen ? 'border-ledger bg-sheet shadow-[inset_0_0_0_1px_var(--color-ledger)]' : 'border-rule bg-sheet/50'}`}>
            <span className={`inline-block rounded-full px-2.5 py-1 text-[12.5px] font-medium ${o.chosen ? 'bg-ledger text-night' : 'bg-tile text-carmine'}`}>
              {o.chosen ? 'Chosen' : 'Not chosen'}
            </span>
            <p className="mt-3 text-[17px] font-semibold leading-snug">{o.label}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{o.note}</p>
          </div>
        ))}
      </div>
      {impacts && (
        <Panel>
          <p className="text-[15px] font-medium">Compare the effect of each option</p>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-tile p-1" role="group" aria-label="Choose an option to see its effect">
            {d.options.map((o, i) => (
              <button key={o.label} type="button" onClick={() => setSel(i)} aria-pressed={sel === i} className={`min-h-11 rounded-full px-3 text-[14px] font-medium leading-tight transition-colors ${sel === i ? 'bg-ledger text-night' : 'text-ink/75 hover:text-ink'}`}>
                {o.chosen ? 'Chosen option' : 'Option not chosen'}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-muted">{d.options[sel].label}</p>
          <ul className="mt-1 divide-y divide-rule" aria-live="polite">
            {impacts.map((r) => (
              <li key={r.item} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <span className="font-semibold">{r.item}</span>
                <span className="text-[15px] leading-relaxed text-ink/85">{r.byOption[sel]}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel><SubHead>Why</SubHead><p className="text-[16px] leading-relaxed">{d.why}</p></Panel>
        <Panel><SubHead>What it cost</SubHead><p className="text-[16px] leading-relaxed">{d.cost}</p></Panel>
      </div>
    </div>
  );
}

function Outcomes({ p }: { p: CS }) {
  return (
    <ul className="divide-y divide-rule rounded-[10px] border border-rule bg-sheet">
      {p.outcomes!.map((o) => (
        <li key={o.text} className="grid gap-x-6 gap-y-2 p-5 sm:grid-cols-[7rem_1fr] sm:p-6">
          <p className="tnum display text-[30px] font-semibold leading-none text-ledger">{o.figure ?? ''}</p>
          <div>
            <p className="text-[16px] leading-relaxed">{o.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <CreditTag credit={o.credit} />
              {o.source && <a className="link inline-flex min-h-10 items-center text-[13px] text-muted" href={o.source.url} target="_blank" rel="noreferrer">Source: {o.source.label}</a>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Project-specific material: each story gets what suits its evidence  */
/* ------------------------------------------------------------------ */

type Extras = {
  problem?: ReactNode;
  evidence?: ReactNode;
  decision?: ReactNode;
  execution?: ReactNode;
  outcome?: ReactNode;
  impacts?: { item: string; byOption: string[] }[];
  details?: { title: string; items: string[] };
};

const extras: Record<string, Extras> = {
  'ggu-edvisor-ai': {
    evidence: <GGUMatrix />,
    impacts: [
      { item: 'Business', byOption: ['Gets the product.', 'Gets the product: strong productivity potential.'] },
      { item: 'Psychology', byOption: ['Gets the product.', 'Gets the product: productivity gains while maintaining quality.'] },
      { item: 'Law', byOption: ['Gets the product, with significant hallucination risk and jurisdiction-specific accuracy beyond current models.', 'Does not get the product, though it was a program under enrollment pressure.'] },
    ],
    outcome: <GGUTimeline />,
    details: { title: 'Success metrics and tracking', items: ['Faculty adoption, usability, instructional efficiency and scalability.', 'Engagement, retention and NPS, tracked through the pilot.'] },
  },
  'global-pathways-ai': { decision: <GPTradeoff /> },
  'bm-distributor': { decision: <BMFlow /> },
  'pmi-career-quest': { decision: <PMIJourney /> },
  jetsweat: { problem: <JetsweatModules /> },
  'cub-financial': { decision: <CubFactors /> },
};

/* ------------------------------------------------------------------ */
/* Chapter navigation: a full rail on desktop, a compact bar on phones  */
/* ------------------------------------------------------------------ */

type Chapter = { id: string; title: string; lead: string; body: ReactNode };

function ChapterRail({ chapters, current }: { chapters: Chapter[]; current: number }) {
  const [open, setOpen] = useState(false);
  const go = (id: string) => {
    setOpen(false);
    // Wait for the chapter list to close so the layout is stable before scrolling.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      el.focus({ preventScroll: true });
    }));
  };
  const pct = ((current + 1) / chapters.length) * 100;
  return (
    <nav aria-label="Case study chapters" className="sticky top-16 z-30 border-b border-rule bg-paper/95 backdrop-blur">
      <Page>
        {/* Desktop */}
        <ol className="hidden md:grid" style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }}>
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => go(c.id)}
                aria-current={i === current ? 'step' : undefined}
                className={`flex min-h-14 w-full items-center gap-2 border-b-2 text-left text-[14.5px] transition-colors ${i === current ? 'border-ledger text-ink' : i < current ? 'border-ledger/30 text-ink/70' : 'border-transparent text-muted hover:text-ink'}`}
              >
                <span className="chapter-num text-[15px]">{String(i + 1).padStart(2, '0')}</span>
                {c.title}
              </button>
            </li>
          ))}
        </ol>
        {/* Phone */}
        <div className="md:hidden">
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="chapter-list" className="flex min-h-14 w-full items-center justify-between gap-3 text-left">
            <span className="text-[15px]">
              <span className="chapter-num text-muted">{current + 1} of {chapters.length}</span>
              <span className="ml-2 font-medium">{chapters[current]?.title}</span>
            </span>
            <span className="rounded-full border border-ink/20 px-3 py-1.5 text-[13px] font-medium">{open ? 'Close' : 'Chapters'}</span>
          </button>
          {open && (
            <ol id="chapter-list" className="border-t border-rule pb-2">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button type="button" onClick={() => go(c.id)} className={`flex min-h-12 w-full items-center gap-3 text-left text-[16px] ${i === current ? 'font-semibold' : ''}`}>
                    <span className="chapter-num w-6 text-muted">{i + 1}</span>{c.title}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Page>
      <div className="h-[2px] bg-rule md:hidden" aria-hidden="true"><div className="h-full bg-ledger transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* The page                                                            */
/* ------------------------------------------------------------------ */

export default function CaseStudy({ project: p }: { project: CS }) {
  const x = extras[p.slug] ?? {};
  const idx = projects.findIndex((q) => q.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];

  const chapters: Chapter[] = [];
  if (p.context?.length || p.problem?.length) {
    chapters.push({
      id: 'problem', title: 'The problem', lead: p.card.problem,
      body: (
        <div className="space-y-6">
          <div className="prose-record space-y-4">{[...(p.context ?? []), ...(p.problem ?? [])].map((t) => <p key={t}>{t}</p>)}</div>
          {x.problem}
        </div>
      ),
    });
  }
  if (p.evidence && (p.evidence.methods.length || p.evidence.findings.length)) {
    chapters.push({
      id: 'evidence', title: 'The evidence', lead: p.card.evidence,
      body: (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Panel><SubHead>How I gathered it</SubHead><Bullets items={p.evidence.methods} /></Panel>
            {p.evidence.findings.length > 0 && <Panel><SubHead>What it showed</SubHead><Bullets items={p.evidence.findings} /></Panel>}
          </div>
          {x.evidence}
        </div>
      ),
    });
  }
  if (p.decision || p.approach?.length) {
    chapters.push({
      id: 'decision', title: p.decision ? 'The decision' : 'The approach', lead: p.card.decision,
      body: (
        <div className="space-y-6">
          {p.decision && <DecisionCompare d={p.decision} impacts={x.impacts} />}
          {x.decision}
          {p.approach?.length ? <Panel><Bullets items={p.approach} /></Panel> : null}
        </div>
      ),
    });
  }
  if (p.owned?.length || p.execution?.length) {
    chapters.push({
      id: 'execution', title: 'Execution', lead: p.card.role,
      body: (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            {p.owned?.length ? <Panel><SubHead>What I owned</SubHead><Bullets items={p.owned} /></Panel> : null}
            {p.execution?.length ? <Panel><SubHead>How it was delivered</SubHead><Bullets items={p.execution} /></Panel> : null}
          </div>
          {x.details && (
            <details className="group rounded-[10px] border border-rule bg-sheet">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 text-[15.5px] font-medium sm:px-7 [&::-webkit-details-marker]:hidden">
                {x.details.title}
                <span className="text-[13.5px] text-muted group-open:hidden">Show</span>
                <span className="hidden text-[13.5px] text-muted group-open:inline">Hide</span>
              </summary>
              <div className="border-t border-rule px-5 py-5 sm:px-7"><Bullets items={x.details.items} /></div>
            </details>
          )}
          {p.gallery && (
            <div className="grid gap-5 sm:grid-cols-2">
              {p.gallery.map((g) => (
                <figure key={g.src}>
                  <div className="relative overflow-hidden rounded-[6px]" style={{ aspectRatio: '16 / 11', background: p.panel.bg }}>
                    <ZoomButton figure={g}><img src={g.src} alt={g.alt} loading="lazy" className="absolute inset-[6%] h-[88%] w-[88%] object-contain" /></ZoomButton>
                  </div>
                  <figcaption className="mt-2 text-[13.5px] text-muted">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      ),
    });
  }
  if (p.outcomes?.length) {
    chapters.push({
      id: 'outcome', title: 'The outcome', lead: p.card.outcome,
      body: (
        <div className="space-y-6">
          {x.outcome}
          <Outcomes p={p} />
          {p.limits?.length ? <Panel className="bg-tile/50"><SubHead>Limits, stated plainly</SubHead><Bullets items={p.limits} /></Panel> : null}
        </div>
      ),
    });
  }

  // Track which chapter is in view.
  const [current, setCurrent] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.i)); }),
      { rootMargin: '-35% 0px -60% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [p.slug]);

  const glance: [string, string][] = [
    ['The problem', p.card.problem],
    ['My role', p.card.role],
    ['Key decision', p.card.decision],
    ['Key evidence', p.card.evidence],
    ['Outcome', p.card.outcome],
    ['What it demonstrates', p.card.relevance],
  ];

  return (
    <article>
      {/* Hero: high-contrast band with the product image */}
      <header className="border-b border-rule bg-night text-white">
        <Page>
          <div className="grid gap-10 pb-28 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-32">
            <div className="lg:col-span-6">
              <a href="#work" className="inline-flex min-h-11 items-center text-[14px] text-white/60 hover:text-white">All work</a>
              <p className="mt-4 text-[15px] text-ledger">{p.org}, {p.period}</p>
              <h1 tabIndex={-1} className="display mt-3 text-[36px] font-semibold leading-[1.04] outline-none sm:text-[50px] lg:text-[56px]">{p.title}</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/75">{p.summary}</p>
            </div>
            <div className="lg:col-span-6"><ProjectPanel p={p} ratio="4 / 3.2" priority zoom /></div>
          </div>
        </Page>
      </header>

      {/* At a glance: the 30-second read */}
      <Page>
        <section aria-labelledby="glance-h" className="-mt-16 rounded-[12px] border border-rule bg-sheet p-5 shadow-[0_30px_70px_-30px_rgba(0,0,0,.7)] sm:-mt-20 sm:p-8">
          <h2 id="glance-h" className="text-[14px] font-medium text-muted">At a glance</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {glance.map(([k, v]) => (
              <div key={k} className={k === 'Outcome' ? 'rounded-[8px] bg-ledger-wash p-4 sm:-m-1 sm:p-4' : ''}>
                <dt className={`text-[13.5px] font-medium ${k === 'Outcome' ? 'text-ledger' : 'text-muted'}`}>{k}</dt>
                <dd className={`mt-1.5 text-[15.5px] leading-relaxed ${k === 'Outcome' ? 'font-semibold' : ''}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Page>

      {/* Deep dive */}
      <div className="mt-14">
        <ChapterRail chapters={chapters} current={current} />
        <Page>
          {chapters.map((c, i) => (
            <section
              key={c.id}
              id={c.id}
              data-i={i}
              ref={(el) => { refs.current[i] = el; }}
              tabIndex={-1}
              aria-labelledby={`${c.id}-h`}
              className="grid scroll-mt-36 gap-8 border-b border-rule py-14 outline-none last:border-0 sm:py-20 lg:grid-cols-12 lg:gap-14"
            >
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-40">
                  <p className="chapter-num text-[18px] text-ledger">{String(i + 1).padStart(2, '0')}</p>
                  <h2 id={`${c.id}-h`} className="display mt-1 text-[30px] font-semibold leading-tight sm:text-[36px]">{c.title}</h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-muted">{c.lead}</p>
                </div>
              </div>
              <div className="min-w-0 lg:col-span-8">{c.body}</div>
            </section>
          ))}
        </Page>
      </div>

      {/* Next */}
      <Page>
        <nav aria-label="Next case study" className="mt-6">
          <a href={`#work-${next.slug}`} className="card group grid items-center gap-6 rounded-[12px] bg-tile/60 p-5 sm:grid-cols-[14rem_1fr] sm:p-6">
            <ProjectPanel p={next} ratio="4 / 3" />
            <div>
              <p className="text-[14px] text-muted">Next case study</p>
              <p className="display mt-1 text-[24px] font-semibold leading-snug sm:text-[30px]"><span className="card-title">{next.title}</span></p>
              <p className="mt-1 text-[14px] text-muted">{next.org}</p>
            </div>
          </a>
        </nav>
      </Page>
    </article>
  );
}

