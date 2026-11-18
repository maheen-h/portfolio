import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { CaseStudy, Figure } from '../content/types';

/* ------------------------------------------------------------------ */
/* Project panel: the large visual used on cards and case-study heads. */
/* Real screenshots sit on a coloured panel; projects without public   */
/* screens get a drawn illustration, clearly not a screenshot.        */
/* ------------------------------------------------------------------ */

export function ProjectPanel({ p, ratio = '4 / 3', priority = false, zoom = false }: { p: CaseStudy; ratio?: string; priority?: boolean; zoom?: boolean }) {
  const Illus = illustrations[p.slug];
  const inner = Illus ? (
    <div className="absolute inset-0"><Illus /></div>
  ) : p.image ? (
    <img
      src={p.image.src}
      alt={p.image.alt}
      loading={priority ? 'eager' : 'lazy'}
      className="panel-img absolute inset-[8%] h-[84%] w-[84%] object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,.18)]"
    />
  ) : null;
  return (
    <div className="panel relative isolate overflow-hidden rounded-[6px]" style={{ aspectRatio: ratio, background: p.panel.bg }}>
      {zoom && p.image && !Illus ? <ZoomButton figure={p.image}>{inner}</ZoomButton> : inner}
      {Illus && (
        <span className="absolute left-3 top-3 rounded-[5px] bg-white/90 px-2 py-1 text-[12px] font-medium text-night/70">Diagram</span>
      )}
    </div>
  );
}

/** Wraps an image so it opens full screen on click, tap or Enter. */
export function ZoomButton({ figure, children }: { figure: Figure; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; btn.current?.focus(); };
  }, [open]);
  return (
    <>
      <button ref={btn} type="button" onClick={() => setOpen(true)} className="absolute inset-0 cursor-zoom-in" aria-label={`Enlarge image: ${figure.alt}`}>
        {children}
        <span className="absolute bottom-3 right-3 rounded-full bg-night/85 px-3 py-1.5 text-[12.5px] font-medium text-white shadow-sm">Enlarge</span>
      </button>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={figure.alt} className="fixed inset-0 z-[100] flex items-center justify-center bg-night p-4 sm:p-10" onClick={() => setOpen(false)}>
          <img src={figure.src} alt={figure.alt} className="max-h-[86vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button ref={close} type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 min-h-11 rounded-full border border-white/40 px-4 text-[14px] text-white">Close</button>
          <p className="absolute bottom-4 left-4 right-4 text-center text-[13px] text-white/70">{figure.caption}</p>
        </div>,
        document.body
      )}
    </>
  );
}

/* Global Pathways AI: student data feeding two recommendation engines; the LLM path is taken. */
function GPIllustration() {
  return (
    <svg viewBox="0 0 480 360" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Diagram: student data feeds two recommendation approaches. The trained prediction model was replaced by an LLM, which produces the career recommendation. Accuracy and speed went up; customization went down.">
      <path d="M156 180 C 200 180, 200 118, 244 118" fill="none" stroke="#9aa39d" strokeWidth="1.5" strokeDasharray="5 5" />
      <path d="M156 180 C 200 180, 200 242, 244 242" fill="none" stroke="#c4472e" strokeWidth="3" />
      <g transform="translate(48 150)">
        <rect width="108" height="60" rx="10" fill="#fff" stroke="#c9d0cb" />
        {[0, 1, 2].map((i) => <rect key={i} x="16" y={15 + i * 11} width={70 - i * 16} height="5" rx="2.5" fill="#c9d0cb" />)}
        <text x="54" y="84" textAnchor="middle" fontSize="15" fill="#55605a" fontFamily="Inter">Student data</text>
      </g>
      <g transform="translate(244 94)">
        <rect width="136" height="48" rx="10" fill="none" stroke="#9aa39d" strokeDasharray="4 4" />
        <text x="68" y="29" textAnchor="middle" fontSize="15" fill="#6b6b66" fontFamily="Inter">Trained model</text>
      </g>
      <g transform="translate(244 218)">
        <rect width="136" height="48" rx="10" fill="#c4472e" />
        <text x="68" y="30" textAnchor="middle" fontSize="17" fontWeight="600" fill="#fff" fontFamily="Inter">LLM</text>
      </g>
      <path d="M380 242 H 410" stroke="#c4472e" strokeWidth="3" />
      <circle cx="421" cy="242" r="10" fill="none" stroke="#c4472e" strokeWidth="3" />
      <text x="410" y="282" textAnchor="middle" fontSize="15" fill="#55605a" fontFamily="Inter">Recommendation</text>
      <g fontFamily="Inter" fontSize="15" fontWeight="500">
        <rect x="24" y="300" width="124" height="34" rx="17" fill="#fff" /><text x="86" y="322" textAnchor="middle" fill="#c4472e">Accuracy up</text>
        <rect x="156" y="300" width="104" height="34" rx="17" fill="#fff" /><text x="208" y="322" textAnchor="middle" fill="#c4472e">Speed up</text>
        <rect x="268" y="300" width="188" height="34" rx="17" fill="#fff" /><text x="362" y="322" textAnchor="middle" fill="#6b6b66">Customization down</text>
      </g>
    </svg>
  );
}

/* B&M: a catalog of products flowing into an order and on to fulfillment. */
function BMIllustration() {
  const tiles = Array.from({ length: 30 }, (_, i) => i);
  return (
    <svg viewBox="0 0 480 360" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Diagram: a catalog of more than 200 products flows into a single order and then to fulfillment.">
      <g transform="translate(36 70)">
        {tiles.map((i) => {
          const x = (i % 6) * 26, y = Math.floor(i / 6) * 26;
          const hot = [8, 14, 21].includes(i);
          return <rect key={i} x={x} y={y} width="20" height="20" rx="4" fill={hot ? '#24221d' : 'rgba(36,34,29,.14)'} />;
        })}
        <text x="0" y="158" fontSize="15" fill="rgba(36,34,29,.7)" fontFamily="Inter">Catalog, 200+ SKUs</text>
      </g>
      <path d="M200 135 C 240 135, 240 180, 280 180" fill="none" stroke="#24221d" strokeWidth="2" />
      <path d="M200 185 C 240 185, 240 180, 280 180" fill="none" stroke="#24221d" strokeWidth="2" />
      <path d="M200 225 C 240 225, 240 180, 280 180" fill="none" stroke="#24221d" strokeWidth="2" />
      <g transform="translate(280 140)">
        <rect width="92" height="80" rx="8" fill="#fbfaf6" stroke="#24221d" strokeWidth="1.5" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(12 ${14 + i * 18})`}>
            <rect width="10" height="10" rx="2" fill="#24221d" />
            <rect x="16" y="3" width={40 - i * 8} height="4" rx="2" fill="rgba(36,34,29,.35)" />
          </g>
        ))}
        <text x="46" y="100" textAnchor="middle" fontSize="15" fill="rgba(36,34,29,.7)" fontFamily="Inter">Order</text>
      </g>
      <path d="M372 180 H 410" fill="none" stroke="#24221d" strokeWidth="2" />
      <g transform="translate(410 160)">
        <path d="M0 10 L20 0 L40 10 L40 34 L20 44 L0 34 Z" fill="#c69a3a" stroke="#24221d" strokeWidth="1.5" />
        <path d="M0 10 L20 20 L40 10 M20 20 V44" fill="none" stroke="#24221d" strokeWidth="1.5" />
        <text x="20" y="64" textAnchor="middle" fontSize="15" fill="rgba(36,34,29,.7)" fontFamily="Inter">Fulfillment</text>
      </g>
    </svg>
  );
}

const illustrations: Record<string, () => ReactNode> = {
  'global-pathways-ai': GPIllustration,
  'bm-distributor': BMIllustration,
};

/* ------------------------------------------------------------------ */
/* Case-study visuals, each matched to the kind of story it tells.     */
/* ------------------------------------------------------------------ */

function Exhibit({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <figure className="my-8 rounded-[10px] border border-rule bg-sheet p-5 sm:p-7">
      <figcaption className="mb-5">
        <p className="display text-[19px] font-semibold tracking-[-0.02em]">{title}</p>
        {note && <p className="mt-1 text-[13.5px] text-muted">{note}</p>}
      </figcaption>
      {children}
    </figure>
  );
}

/** Global Pathways AI: the architecture trade-off, as confirmed. */
export function GPTradeoff() {
  const rows = [
    { k: 'Accuracy of recommendations', a: 'Lower', b: 'Higher', better: 'b' },
    { k: 'Speed', a: 'Slower', b: 'Faster', better: 'b' },
    { k: 'Customization', a: 'More', b: 'Less', better: 'a' },
  ];
  return (
    <Exhibit title="The architecture trade-off" note="Accuracy was the product’s core job, so it outweighed customization.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-[15px]">
          <thead>
            <tr className="text-left">
              <th className="w-[40%] pb-3 font-normal text-muted" scope="col">Criterion</th>
              <th className="pb-3 font-medium text-carmine" scope="col">Trained prediction model</th>
              <th className="pb-3 font-medium text-ledger" scope="col">LLM (chosen)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-t border-rule">
                <th scope="row" className="py-3 text-left font-normal">{r.k}</th>
                <td className={`py-3 ${r.better === 'a' ? 'font-medium' : 'text-muted'}`}>{r.a}</td>
                <td className={`py-3 ${r.better === 'b' ? 'font-medium text-ledger' : 'text-muted'}`}>{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Exhibit>
  );
}

/** GGU: what the evaluation found, discipline by discipline. */
export function GGUMatrix() {
  const rows = [
    { d: 'Business', f: 'Strong potential to improve faculty productivity', r: 'Focus', tone: 'go' },
    { d: 'Psychology', f: 'AI could improve educator productivity while maintaining academic quality', r: 'Focus', tone: 'go' },
    { d: 'Law', f: 'Needs jurisdiction-specific reasoning and regulatory accuracy beyond current models; hallucination risk', r: 'Not recommended', tone: 'stop' },
  ];
  const tone: Record<string, string> = {
    go: 'bg-ledger text-night',
    maybe: 'bg-ledger-wash text-ledger',
    stop: 'bg-tile text-carmine ring-1 ring-carmine/40',
  };
  return (
    <Exhibit title="The evaluation, by discipline" note="From faculty research, pilot testing and technical evaluation.">
      <ul className="divide-y divide-rule">
        {rows.map((r) => (
          <li key={r.d} className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr_9.5rem] sm:items-center sm:gap-6">
            <p className="text-[16px] font-semibold">{r.d}</p>
            <p className="text-[14.5px] leading-relaxed text-ink/85">{r.f}</p>
            <p><span className={`inline-block rounded-full px-3 py-1 text-[12.5px] font-medium ${tone[r.tone]}`}>{r.r}</span></p>
          </li>
        ))}
      </ul>
    </Exhibit>
  );
}

/** GGU: from the pilot to what the university did next. */
export function GGUTimeline() {
  const steps = [
    { when: 'Fall 2025', what: 'Faculty discovery and multi-region research', mine: true },
    { when: 'Fall 2025', what: 'Phased pilot with seven faculty members', mine: true },
    { when: 'Fall 2025', what: 'Recommendation: Business and Psychology, not Law', mine: true },
    { when: 'Fall 2025', what: 'Pilot outcomes presented to 50+ executives and faculty', mine: true },
    { when: 'April 2026', what: 'GGU launches its School of Psychology and GGU Digital', mine: false },
    { when: 'October 2026', what: 'GGU partners with Edvisor across 40+ courses', mine: false },
  ];
  return (
    <Exhibit title="From pilot to rollout" note="Filled markers are my work; open markers are what the university did next.">
      <ol className="relative ml-2 border-l border-rule">
        {steps.map((s, i) => (
          <li key={i} className="relative pb-5 pl-6 last:pb-0">
            <span className={`absolute -left-[6px] top-1.5 h-[11px] w-[11px] rounded-full ${s.mine ? 'bg-ledger' : 'border-2 border-ledger bg-sheet'}`} aria-hidden="true" />
            <p className="tnum text-[13px] text-muted">{s.when}</p>
            <p className="text-[15px]">{s.what}<span className="sr-only">{s.mine ? ' (my work)' : ' (university decision)'}</span></p>
          </li>
        ))}
      </ol>
    </Exhibit>
  );
}

/** B&M: how research became a roadmap. */
export function BMFlow() {
  const steps = [
    { t: 'Research', d: 'Customer interviews, usability tests, journey data' },
    { t: 'Friction found', d: 'Where the ordering journey broke down' },
    { t: 'Prioritized', d: 'Each feature weighed on ROI, user needs and technical constraints' },
    { t: 'Roadmap', d: '5 key features across concurrent tracks' },
    { t: 'Launch', d: 'Private B2B platform, 200+ SKUs' },
  ];
  return (
    <Exhibit title="From research to launch">
      <ol className="grid gap-3 md:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s.t} className="relative rounded-md border border-rule bg-paper p-4">
            <p className="tnum text-[12.5px] text-muted">Step {i + 1}</p>
            <p className="mt-1 text-[16px] font-semibold">{s.t}</p>
            <p className="mt-1 text-[13.5px] leading-snug text-ink/80">{s.d}</p>
          </li>
        ))}
      </ol>
    </Exhibit>
  );
}

/** PMI: the certification journey and the flows built for it. */
export function PMIJourney() {
  const stages = ['Awareness', 'Eligibility check', 'Skill-gap identification', 'Study plan', 'Certification readiness'];
  const flows = [
    { f: 'Onboarding and profiling', span: [0, 1] },
    { f: 'PMP readiness assessment', span: [1, 2] },
    { f: 'AI-generated study roadmap', span: [2, 3] },
    { f: 'Gamified progress tracking', span: [3, 4] },
  ];
  return (
    <Exhibit title="The journey, and the flows built for each stage">
      <div className="overflow-x-auto">
        <div className="min-w-[40rem]">
          <ol className="grid grid-cols-5 gap-2">
            {stages.map((s, i) => (
              <li key={s} className="relative">
                <div className="h-1.5 rounded-full bg-ledger" style={{ opacity: 0.35 + i * 0.16 }} />
                <p className="mt-2 text-[13.5px] font-medium">{s}</p>
              </li>
            ))}
          </ol>
          <ul className="mt-5 space-y-2">
            {flows.map((x) => (
              <li key={x.f} className="grid grid-cols-5 gap-2">
                <span
                  className="rounded-md border border-ledger/30 bg-ledger-wash px-3 py-2 text-[13px] text-ledger"
                  style={{ gridColumn: `${x.span[0] + 1} / ${x.span[1] + 2}` }}
                >
                  {x.f}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Exhibit>
  );
}

/** Jetsweat: one dashboard replacing separate tools. */
export function JetsweatModules() {
  const mods = ['Payments and refunds', 'Class scheduling and reminders', 'Live-streamed classes', 'Marketing campaigns', 'Financial and performance analytics', 'Client segmentation and export'];
  return (
    <Exhibit title="One dashboard for the studio owner" note="What owners could manage in one place.">
      <ul className="grid gap-2 sm:grid-cols-3">
        {mods.map((m) => (
          <li key={m} className="rounded-md border border-rule bg-paper px-4 py-3 text-[14px]">{m}</li>
        ))}
      </ul>
    </Exhibit>
  );
}

/** Cub Financial: the four inputs to a CubScore. */
export function CubFactors() {
  const f = ['Finances', 'Career prospects', 'Location', 'Lifestyle'];
  return (
    <Exhibit title="What a CubScore combined" note="Each program got one score combining these four factors.">
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_auto]">
        <ul className="grid grid-cols-2 gap-2">
          {f.map((x) => <li key={x} className="rounded-md border border-rule bg-paper px-4 py-3 text-[14px] font-medium">{x}</li>)}
        </ul>
        <svg width="56" height="24" viewBox="0 0 56 24" className="hidden sm:block" aria-hidden="true"><path d="M0 12 H48 M40 4 L50 12 L40 20" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" /></svg>
        <div className="rounded-md px-5 py-4 text-center" style={{ background: '#16283d' }}>
          <p className="display text-[18px] font-semibold text-[#e8c766]">cubScore</p>
          <p className="text-[12.5px] text-white/70">for each program</p>
        </div>
      </div>
    </Exhibit>
  );
}
