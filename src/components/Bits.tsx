import type { ReactNode } from 'react';
import { creditLabel, type Credit, type Figure } from '../content/types';
import { SHOW_EDITOR_NOTES } from '../content/site';

const creditStyle: Record<Credit, string> = {
  owned: 'bg-ledger text-night',
  led: 'bg-ledger-wash text-ledger',
  team: 'bg-ledger-wash text-ledger',
  contributed: 'border border-ledger/40 text-ledger',
  company: 'border border-rule text-muted',
};

/** Who gets credit for a result. Shown beside every outcome. */
export function CreditTag({ credit }: { credit: Credit }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] leading-snug font-medium ${creditStyle[credit]}`}>
      {creditLabel[credit]}
    </span>
  );
}

/** Facts still to be supplied. Visible in preview builds only. */
export function EditorNote({ items, title = 'Still to document' }: { items?: string[]; title?: string }) {
  if (!SHOW_EDITOR_NOTES || !items || items.length === 0) return null;
  return (
    <aside className="rounded-md border border-dashed border-[#c9b787] bg-note px-5 py-4 text-[14px] text-[#5b4a1e]" aria-label="Editor note">
      <p className="font-medium">{title} <span className="font-normal">(editor note, preview only)</span></p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}

export function ProjectImage({ figure, priority = false, className = '' }: { figure: Figure; priority?: boolean; className?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-md border border-rule bg-sheet" style={{ aspectRatio: String(figure.ratio) }}>
        <img src={figure.src} alt={figure.alt} loading={priority ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
      </div>
      <figcaption className="mt-2 text-[13px] text-muted">{figure.caption}</figcaption>
    </figure>
  );
}

/** Placeholder for a project with no image yet: the organization name set as type. */
export function TypePlate({ org, ratio = 4 / 3 }: { org: string; ratio?: number }) {
  return (
    <div className="ledger flex items-end overflow-hidden rounded-md border border-rule p-6 pl-16" style={{ aspectRatio: String(ratio) }} aria-hidden="true">
      <span className="font-serif text-3xl font-semibold leading-none tracking-tight text-ink/80">{org}</span>
    </div>
  );
}

export function ButtonLink({ href, children, variant = 'solid', external = false }: { href: string; children: ReactNode; variant?: 'solid' | 'quiet'; external?: boolean }) {
  const base = 'inline-flex items-center rounded-md px-4 py-2.5 text-[15px] font-medium transition-colors';
  const style = variant === 'solid' ? 'bg-ledger text-night hover:brightness-110' : 'border border-ink/25 text-ink hover:border-ink/60';
  return (
    <a href={href} className={`${base} ${style}`} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  );
}
