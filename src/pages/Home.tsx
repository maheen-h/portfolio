import { Page, SectionHeading, LinkedInButton } from '../components/Layout';
import { FilterChips, ProjectMosaic, matches, useProjectFilter } from '../components/Projects';
import { projects, getProject } from '../content/projects';
import { site } from '../content/site';
import { creditLabel, type Credit } from '../content/types';
import { demos, featuredDemo } from '../content/lab';

const proof: { figure: string; label: string; slug?: string; credit: Credit }[] = [
  { figure: '16 wks', label: 'To an internal MVP of an AI financial planning platform', slug: 'global-pathways-ai', credit: 'led' },
  { figure: '40+', label: 'Courses now using the AI platform I piloted', slug: 'ggu-edvisor-ai', credit: 'contributed' },
  { figure: '60%', label: 'Less processing time after I automated fund accounting', credit: 'owned' },
  { figure: '2', label: 'First-place awards for an AI prototype', slug: 'pmi-career-quest', credit: 'team' },
];

type Proof = { slug?: string; label?: string; href?: string; text: string };
type Capability = { name: string; proof: Proof[] };
const groups: { name: string; line: string; result: string; items: Capability[] }[] = [
  {
    name: 'AI and technical product management',
    line: 'AI, SaaS and cloud products, built in close partnership with engineering.',
    result: 'An internal AI MVP in 16 weeks, about 15% ahead of plan.',
    items: [
      { name: 'AI/ML and LLM-powered products', proof: [{ slug: 'global-pathways-ai', text: 'an AI matching engine that ranks pathways by financial ROI and fit, built on LLMs, APIs and RAG' }] },
      { name: 'AI evaluation', proof: [{ slug: 'global-pathways-ai', text: 'built synthetic personas and evaluation datasets, and oversaw model training and evals' }, { slug: 'ggu-edvisor-ai', text: 'evaluated where an AI teaching platform could be trusted' }] },
      { name: 'SaaS and cloud-based platforms', proof: [{ slug: 'jetsweat', text: 'designed a B2B operations and ERP platform across web, iOS and Android' }, { label: 'Citco', text: 'worked in AWS-based financial platforms' }] },
      { name: 'API integrations and technical workflows', proof: [{ slug: 'global-pathways-ai', text: 'led the integration of generative AI tools, APIs and LLM interfaces' }] },
      { name: 'Rapid AI prototyping', proof: [{ href: '#lab-global-pathways', label: 'Product Lab', text: 'a relocation cost and funding-gap prototype, built in Lovable' }, { slug: 'pmi-career-quest', text: 'product owner on a working multi-agent build' }] },
      { name: 'Engineering collaboration and trade-offs', proof: [{ slug: 'global-pathways-ai', text: 'resolved architecture bottlenecks and traded customization for accuracy' }] },
    ],
  },
  {
    name: 'Core product management',
    line: 'From discovery to delivery, decided on evidence.',
    result: 'An AI product steered away from its riskiest use, then rolled out across 40+ courses.',
    items: [
      { name: 'Product discovery and customer research', proof: [{ slug: 'ggu-edvisor-ai', text: 'multi-region research across APAC and the Americas' }, { slug: 'cub-financial', text: 'student surveys and interviews' }] },
      { name: 'Strategy, roadmapping and prioritization', proof: [{ slug: 'bm-distributor', text: 'a 5-feature roadmap weighed on ROI, user needs and technical constraints' }] },
      { name: 'UX/UI and experimentation', proof: [{ slug: 'jetsweat', text: 'UX/UI design and usability testing' }, { slug: 'pmi-career-quest', text: 'iterative testing in sprints' }] },
      { name: 'Data-driven decisions and analytics', proof: [{ slug: 'ggu-edvisor-ai', text: 'tracked engagement, retention and NPS through the pilot' }] },
      { name: 'Cross-functional leadership and delivery', proof: [{ slug: 'global-pathways-ai', text: 'hired and led a distributed team of 10+ to an MVP' }] },
    ],
  },
  {
    name: 'Financial planning and payments',
    line: 'Products that help people and businesses plan, pay and account for money.',
    result: 'Processing time cut by 60% through automation at Citco.',
    items: [
      { name: 'Financial planning and feasibility', proof: [{ slug: 'global-pathways-ai', text: 'financial planning, loan planning and education-funding workflows' }, { slug: 'cub-financial', text: 'a score for how well a degree fits a student’s finances' }] },
      { name: 'Payment and ordering workflows', proof: [{ slug: 'bm-distributor', text: 'B2B ordering and checkout across 200+ SKUs' }, { slug: 'jetsweat', text: 'payments and financial tracking in an operations and ERP platform' }] },
      { name: 'Fund operations and financial systems', proof: [{ label: 'Citco', text: 'reconciliation, treasury, capital calls and NAV reporting on AWS-based financial platforms' }] },
      { name: 'Launches and commercial impact', proof: [{ slug: 'bm-distributor', text: 'took a B2B platform from concept to launch' }, { slug: 'jetsweat', text: 'two enterprise clients onboarded' }] },
    ],
  },
];

export default function Home() {
  const [filter, setFilter] = useProjectFilter();
  const count = projects.filter((p) => matches(p, filter)).length;

  return (
    <Page>
      {/* Who I am, what makes me different, and the proof */}
      <section className="grid gap-10 pb-16 pt-12 sm:pt-16 lg:grid-cols-12 lg:items-stretch lg:gap-12 lg:pb-20 lg:pt-20" aria-labelledby="hero-title">
        <div className="flex flex-col justify-center lg:col-span-7">
          <p className="text-[15px] text-muted">Maheen Hassan — AI Product Manager</p>
          <h1 id="hero-title" tabIndex={-1} className="display mt-4 text-[42px] font-semibold leading-[1.02] outline-none sm:text-[58px] lg:text-[64px]">
            Turning complex money workflows into <em className="font-serif font-normal italic tracking-[-0.02em] text-ink/95">effortless products.</em>
          </h1>
          <p className="mt-6 max-w-[30em] text-[20px] font-medium leading-snug text-ledger sm:text-[22px]">
            I build 0-to-1 AI, SaaS, and cloud products that simplify financial planning and payments.{' '}
            <span className="text-ink/70">6+ years across product and finance, including automating core workflows at PwC and Citco.</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#work" className="inline-flex min-h-12 items-center rounded-full bg-ledger px-5 text-[15px] font-medium text-night transition hover:brightness-110">See the work</a>
            <LinkedInButton tone="line" />
          </div>
        </div>

        <div className="rounded-[10px] border border-rule bg-sheet/80 p-6 sm:p-8 lg:col-span-5">
          <p className="text-[14px] text-muted">Results, with who gets the credit</p>
          <ul className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] bg-rule">
            {proof.map((x) => {
              const body = (
                <>
                  <p className="tnum display text-[34px] font-semibold leading-none text-ink sm:text-[42px]">{x.figure}</p>
                  <p className="mt-3 text-[14px] leading-snug text-ink/75">{x.label}</p>
                  <p className="mt-3 text-[12.5px] text-ledger">{creditLabel[x.credit]}</p>
                </>
              );
              return (
                <li key={x.figure} className="bg-sheet">
                  {x.slug ? (
                    <a href={`#work-${x.slug}`} className="block h-full p-4 transition-colors hover:bg-tile sm:p-5">{body}</a>
                  ) : (
                    <div className="h-full p-4 sm:p-5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Project discovery */}
      <section className="border-t border-rule pt-12 sm:pt-16" aria-labelledby="work-heading">
        <SectionHeading id="work-heading" title="Selected work" intro="Six products, each with the problem, the decision and the result.">
          <FilterChips value={filter} onChange={setFilter} count={count} />
        </SectionHeading>
        <ProjectMosaic projects={projects} filter={filter} />
      </section>

      {/* Capabilities, each shown through real projects */}
      <section className="mt-24 border-t border-rule pt-12 sm:pt-16" aria-labelledby="capabilities">
        <SectionHeading id="capabilities" title="What I bring to a product team" intro="Each links to the project that proves it." />
        <div className="grid gap-5 lg:grid-cols-3">
          {groups.map((g) => (
            <article key={g.name} className="flex flex-col rounded-[10px] border border-rule bg-sheet p-6">
              <h3 className="display text-[21px] font-semibold leading-snug tracking-[-0.02em]">{g.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{g.line}</p>
              <ul className="mt-5 space-y-2.5">
                {g.items.map((c) => (
                  <li key={c.name} className="text-[14.5px] leading-relaxed">
                    {(() => {
                      const pr = c.proof[0]!;
                      const proj = pr.slug ? getProject(pr.slug) : undefined;
                      const href = proj ? `#work-${proj.slug}` : pr.href;
                      const label = proj ? proj.org : pr.label;
                      return (
                        <p>
                          <span className="font-semibold text-ink">{c.name}</span> <span className="text-muted">·</span>{' '}
                          {href ? <a className="link text-ink/75" href={href}>{label}</a> : <span className="text-ink/75">{label}</span>}
                        </p>
                      );
                    })()}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-rule pt-4 text-[15px] font-medium leading-snug text-ledger lg:mt-auto">{g.result}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Product Lab */}
      <section className="mt-24 border-t border-rule pt-12 sm:pt-16" aria-labelledby="lab-heading">
        <SectionHeading id="lab-heading" title="Product Lab" intro="Working prototypes. Start with the relocation planner.">
          <a href="#lab" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-4 text-[14px] font-medium hover:border-ink/60">Open the Lab</a>
        </SectionHeading>
        <a href={featuredDemo.href} className="mb-5 grid gap-4 rounded-[10px] border border-ledger/40 bg-tile p-6 transition-colors hover:border-ledger md:grid-cols-[1fr_1.2fr] md:gap-10 sm:p-8">
          <div>
            <p className="inline-block rounded-full bg-ledger px-3 py-1 text-[13px] font-medium text-night">{featuredDemo.label}</p>
            <h3 className="display mt-3 text-[24px] font-semibold leading-tight tracking-[-0.02em]">{featuredDemo.name}</h3>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-ink/80">{featuredDemo.description}</p>
            <p className="mt-4 text-[14px] font-medium text-ledger">Open the prototype</p>
          </div>
        </a>
        <ul className="grid gap-5 md:grid-cols-3">
          {demos.map((d) => (
            <li key={d.id}>
              <a href="#lab" className="block h-full rounded-[10px] border border-rule bg-tile p-6 transition-colors hover:border-ledger/60">
                <p className="text-[13px] text-muted">{d.provenance === 'original' ? 'Based on original work' : 'Rebuilt for this site'}</p>
                <h3 className="display mt-2 text-[22px] font-semibold tracking-[-0.02em]">{d.name}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{d.principle}</p>
                <p className="mt-4 text-[13px] text-muted">In build</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
