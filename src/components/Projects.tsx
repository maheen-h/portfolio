import { useState } from 'react';
import { ProjectPanel } from './Visuals';
import { domainLabel, type CaseStudy, type Domain } from '../content/types';

export type Filter = 'all' | Domain;
const filters: Filter[] = ['all', 'ai', 'fin', 'saas', 'erp'];

export function useProjectFilter() {
  return useState<Filter>('all');
}

/** Filter chips. Buttons with aria-pressed so state is announced; 44px tall for touch. */
export function FilterChips({ value, onChange, count }: { value: Filter; onChange: (f: Filter) => void; count: number }) {
  return (
    <div>
      <div className="-mx-1 flex flex-wrap gap-2 px-1" role="group" aria-label="Filter projects by type">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            aria-pressed={value === f}
            className={`min-h-11 rounded-full border px-4 text-[14px] font-medium transition-colors ${
              value === f ? 'border-ledger bg-ledger text-night' : 'border-rule bg-sheet text-ink/80 hover:border-ink/40'
            }`}
          >
            {f === 'all' ? 'All' : domainLabel[f]}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{count} projects shown</p>
    </div>
  );
}

export function matches(p: CaseStudy, f: Filter) {
  return f === 'all' || p.domains.includes(f);
}

/** A gallery tile. The outcome is always visible; hover only lifts the image. */
export function ProjectTile({ p, ratio, titleSize = 'md' }: { p: CaseStudy; ratio: string; titleSize?: 'md' | 'lg' }) {
  return (
    <a href={`#work-${p.slug}`} className="card group block">
      <ProjectPanel p={p} ratio={ratio} />
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <p className="text-[14px] text-muted">{p.org}</p>
        <p className="tnum shrink-0 text-[14px] text-muted">{p.year}</p>
      </div>
      <h3 className={`display mt-1 font-semibold leading-[1.15] tracking-[-0.02em] ${titleSize === 'lg' ? 'text-[24px] sm:text-[28px]' : 'text-[21px] sm:text-[23px]'}`}>
        <span className="card-title">{p.short}</span>
      </h3>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink/80">
        <span className="font-medium text-ledger">Outcome. </span>{p.card.outcome}
      </p>
    </a>
  );
}

/* Composed mosaic for the full set; a regular grid when filtered, so nothing leaves gaps. */
const mosaic: Record<string, { span: string; ratio: string; lg?: boolean }> = {
  'global-pathways-ai': { span: 'lg:col-span-7', ratio: '16 / 11', lg: true },
  'ggu-edvisor-ai': { span: 'lg:col-span-5', ratio: '1.04 / 1', lg: true },
  'bm-distributor': { span: 'lg:col-span-5', ratio: '1.04 / 1', lg: true },
  'pmi-career-quest': { span: 'lg:col-span-7', ratio: '16 / 11', lg: true },
  jetsweat: { span: 'lg:col-span-6', ratio: '16 / 11' },
  'cub-financial': { span: 'lg:col-span-6', ratio: '16 / 11' },
};

export function ProjectMosaic({ projects, filter }: { projects: CaseStudy[]; filter: Filter }) {
  const shown = projects.filter((p) => matches(p, filter));
  if (filter === 'all') {
    return (
      <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-16">
        {shown.map((p) => {
          const m = mosaic[p.slug] ?? { span: 'lg:col-span-6', ratio: '4 / 3' };
          return (
            <li key={p.slug} className={m.span}>
              <ProjectTile p={p} ratio={m.ratio} titleSize={m.lg ? 'lg' : 'md'} />
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:gap-x-10">
      {shown.map((p) => (
        <li key={p.slug}><ProjectTile p={p} ratio="16 / 11" titleSize="lg" /></li>
      ))}
    </ul>
  );
}
