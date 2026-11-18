import { useEffect, useState, type ReactNode } from 'react';
import { nav, site } from '../content/site';

export function LinkedInButton({ tone = 'dark', size = 'md', label = 'Connect on LinkedIn' }: { tone?: 'dark' | 'light' | 'line'; size?: 'sm' | 'md'; label?: string }) {
  const tones = {
    dark: 'bg-ledger text-night hover:brightness-110',
    light: 'bg-ledger text-night hover:brightness-110',
    line: 'border border-ink/20 text-ink hover:border-ink/60',
  };
  const sizes = { sm: 'min-h-10 px-4 text-[14px]', md: 'min-h-12 px-5 text-[15px]' };
  return (
    <a href={site.linkedin} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center rounded-full font-medium transition-colors ${tones[tone]} ${sizes[size]}`}>
      {label}
    </a>
  );
}

export function Header({ route }: { route: string }) {
  const [open, setOpen] = useState(false);
  const section = route.split('-')[0];
  useEffect(() => setOpen(false), [route]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <a href="#" className="display inline-flex min-h-11 items-center text-[17px] font-semibold tracking-[-0.01em]">{site.name}</a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[15px]">
            {nav.map((n) => {
              const active = n.href.slice(1) === section;
              return (
                <li key={n.href}>
                  <a href={n.href} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-2 ${active ? 'text-ink' : 'text-muted hover:text-ink'}`}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-ledger" aria-hidden="true" />}
                    {n.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden md:block"><LinkedInButton size="sm" tone="line" label="LinkedIn" /></div>
        <button className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-4 text-[14px] font-medium md:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-paper px-5 pb-10 pt-4 md:hidden">
          <ul className="divide-y divide-rule border-y border-rule">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="display flex min-h-16 items-center justify-between text-[26px] font-semibold" aria-current={n.href.slice(1) === section ? 'page' : undefined}>
                  {n.label}
                  {n.href.slice(1) === section && <span className="h-2 w-2 rounded-full bg-ledger" aria-hidden="true" />}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8"><LinkedInButton /></div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-night text-white">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-12">
        <div>
          <p className="display text-[30px] font-semibold leading-tight sm:text-[40px]">Hiring a product manager for an AI, SaaS or cloud product?</p>
          <p className="mt-3 max-w-xl text-[16px] text-white/70">LinkedIn is the best way to reach me.</p>
        </div>
        <LinkedInButton tone="light" />
      </div>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-2 border-t border-white/10 px-5 py-6 text-[13.5px] text-white/50 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
        <span>{site.name}, product manager</span>
        <span>Built with React, TypeScript and Tailwind CSS</span>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">{children}</div>;
}

export function SectionHeading({ id, title, intro, children }: { id?: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 id={id} className="display text-[30px] font-semibold leading-[1.08] sm:text-[38px]">{title}</h2>
        {intro && <p className="mt-3 text-[16px] leading-relaxed text-muted sm:text-[17px]">{intro}</p>}
      </div>
      {children}
    </div>
  );
}
