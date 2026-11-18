import { useEffect, useRef, useState } from 'react';
import type { Decision } from '../content/types';

/**
 * The signature element: a decision drawn as a fork.
 * The question sits on the left; every option considered branches to the right.
 * The path taken is solid ledger green; paths not taken are dashed carmine.
 * Selecting an option shows its reasoning. Connectors draw once, on first view.
 */
export function DecisionFork({ decision, compact = false }: { decision: Decision; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const chosenIndex = Math.max(0, decision.options.findIndex((o) => o.chosen));
  const [selected, setSelected] = useState(chosenIndex);
  const n = decision.options.length;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setDrawn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const opt = decision.options[selected];

  return (
    <div ref={ref} className={drawn ? 'fork-drawn' : ''}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_72px_minmax(0,1.25fr)] md:gap-0">
        <div className="flex items-center md:pr-4">
          <p className={`font-serif ${compact ? 'text-lg' : 'text-xl'} leading-snug`}>{decision.question}</p>
        </div>

        <svg className="hidden h-full w-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {decision.options.map((o, i) => {
            const y = ((i + 0.5) / n) * 100;
            return (
              <path
                key={i}
                d={`M0 50 C 55 50, 45 ${y}, 100 ${y}`}
                fill="none"
                vectorEffect="non-scaling-stroke"
                className={o.chosen ? 'fork-path' : 'fork-fade'}
                stroke={o.chosen ? 'var(--color-ledger)' : 'var(--color-carmine)'}
                strokeWidth={o.chosen ? 2.5 : 1.25}
                strokeDasharray={o.chosen ? undefined : '4 4'}
              />
            );
          })}
        </svg>

        <ul className="flex flex-col gap-2 border-l border-rule pl-4 md:border-0 md:pl-0" role="list">
          {decision.options.map((o, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  selected === i ? 'border-ink/70 bg-sheet' : 'border-rule bg-transparent hover:border-ink/40'
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className={`text-[15px] font-medium ${o.chosen ? 'text-ledger' : 'text-carmine line-through decoration-carmine/50'}`}>
                    {o.label}
                  </span>
                  <span className={`shrink-0 text-[13px] ${o.chosen ? 'text-ledger' : 'text-muted'}`}>{o.chosen ? 'Chosen' : 'Not chosen'}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid gap-5 border-t border-rule pt-5 text-[15px] md:grid-cols-3" aria-live="polite">
        <div>
          <p className="font-serif italic text-muted">{opt.chosen ? 'The path taken' : 'The path not taken'}</p>
          <p className="mt-1">{opt.note}</p>
        </div>
        <div>
          <p className="font-serif italic text-muted">Why</p>
          <p className="mt-1">{decision.why}</p>
        </div>
        <div>
          <p className="font-serif italic text-muted">What it cost</p>
          <p className="mt-1">{decision.cost}</p>
        </div>
      </div>
    </div>
  );
}
