import { Page } from '../components/Layout';
import { ProjectPanel } from '../components/Visuals';
import { FilterChips, ProjectTile, matches, useProjectFilter } from '../components/Projects';
import { projects } from '../content/projects';
import type { CaseStudy } from '../content/types';

/** Problem, role, decision and outcome: what a hiring manager needs from a project. */
function Facts({ p }: { p: CaseStudy }) {
  const rows: [string, string][] = [
    ['Problem', p.card.problem],
    ['My role', p.card.role],
    ['Key decision', p.card.decision],
  ];
  return (
    <dl className="space-y-4 text-[15px] leading-relaxed">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
          <dt className="text-muted">{k}</dt>
          <dd className="text-ink/85">{v}</dd>
        </div>
      ))}
      <div className="grid gap-1 rounded-[6px] bg-ledger-wash px-4 py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
        <dt className="font-medium text-ledger">Outcome</dt>
        <dd className="font-medium">{p.card.outcome}</dd>
      </div>
    </dl>
  );
}

function Feature({ p, flip }: { p: CaseStudy; flip: boolean }) {
  return (
    <li className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <a href={`#work-${p.slug}`} className={`card block lg:col-span-7 ${flip ? 'lg:order-2' : ''}`} tabIndex={-1} aria-hidden="true">
        <ProjectPanel p={p} ratio="16 / 11" />
      </a>
      <div className="lg:col-span-5">
        <div className="flex flex-col gap-0.5 text-[14px] text-muted sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span>{p.org}</span><span className="tnum">{p.period}</span>
        </div>
        <h2 className="display mt-2 text-[28px] font-semibold leading-[1.1] sm:text-[34px]">
          <a href={`#work-${p.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">{p.title}</a>
        </h2>
        <div className="mt-6"><Facts p={p} /></div>
        <a href={`#work-${p.slug}`} aria-label={`Read the ${p.org} case study`} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ledger px-5 text-[14.5px] font-medium text-night transition hover:brightness-110">
          Read the case study
        </a>
      </div>
    </li>
  );
}

export default function Work() {
  const [filter, setFilter] = useProjectFilter();
  const shown = projects.filter((p) => matches(p, filter));
  const major = shown.filter((p) => p.tier === 'major');
  const supporting = shown.filter((p) => p.tier === 'supporting');

  return (
    <Page>
      <header className="grid gap-8 pb-10 pt-12 sm:pt-16 lg:grid-cols-12 lg:items-end lg:pb-14">
        <div className="lg:col-span-7">
          <h1 tabIndex={-1} className="display text-[46px] font-semibold leading-[1] outline-none sm:text-[64px]">Work</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/80 sm:text-[18px]">
            Four major projects, from an AI career and financial planning platform to B2B ordering, and two earlier ones: an operations and ERP platform, and student finance. Each shows the problem, my role, the decision that mattered and the result.
          </p>
        </div>
        <div className="lg:col-span-5 lg:justify-self-end">
          <FilterChips value={filter} onChange={setFilter} count={shown.length} />
          {/* Visible feedback: the first project fits every filter, so the top of the list alone doesn't show a change */}
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Showing {shown.length} of {projects.length} projects
            {filter !== 'all' && shown.length > 0 && (
              <>
                {': '}
                {shown.map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 && ', '}
                    <a href={`#work-${p.slug}`} className="link text-ink/90">{p.org}</a>
                  </span>
                ))}
              </>
            )}
          </p>
        </div>
      </header>

      {major.length > 0 && (
        <section aria-label="Major projects" className="border-t border-rule pt-12 sm:pt-16">
          <ul className="space-y-20 sm:space-y-28">
            {major.map((p, i) => <Feature key={p.slug} p={p} flip={i % 2 === 1} />)}
          </ul>
        </section>
      )}

      {supporting.length > 0 && (
        <section className="mt-24 rounded-[10px] bg-tile/60 px-5 py-10 sm:px-10 sm:py-12" aria-labelledby="supporting">
          <h2 id="supporting" className="display text-[26px] font-semibold sm:text-[30px]">Earlier and supporting work</h2>
          <p className="mt-2 max-w-xl text-[15px] text-muted">Shorter engagements: B2B SaaS design and enterprise onboarding, and my first product.</p>
          <ul className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {supporting.map((p) => <li key={p.slug}><ProjectTile p={p} ratio="16 / 11" /></li>)}
          </ul>
        </section>
      )}

      {shown.length === 0 && <p className="py-20 text-muted">No projects match this filter.</p>}
    </Page>
  );
}
