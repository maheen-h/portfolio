import type { ReactNode } from 'react';
import { Page } from '../components/Layout';
import { ButtonLink } from '../components/Bits';
import { demos, featuredDemo, type Demo } from '../content/lab';
import { getProject } from '../content/projects';
import { site } from '../content/site';

function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="pb-10 pt-14 sm:pt-20">
      <h1 tabIndex={-1} className="display text-[2.5rem] font-semibold leading-tight tracking-tight outline-none sm:text-[3.25rem]">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink/85">{children}</div>}
    </header>
  );
}

/* ---------- Product Lab ---------- */

function DemoEntry({ d }: { d: Demo }) {
  const related = d.relatedSlug ? getProject(d.relatedSlug) : undefined;
  return (
    <li className="grid gap-6 border-t border-rule py-10 md:grid-cols-[1fr_1.2fr] md:gap-12">
      <div>
        <h3 className="display text-[1.75rem] font-semibold tracking-tight">{d.name}</h3>
        <p className="mt-3 font-serif text-[1.15rem] italic leading-snug text-ledger">{d.principle}</p>
      </div>
      <div className="text-[15px] leading-relaxed">
        <p>{d.what}</p>
        <p className="mt-4 text-muted">{d.provenanceLong}</p>
        {related && (
          <p className="mt-4">Related case study: <a className="link font-medium" href={`#work-${related.slug}`}>{related.org}</a></p>
        )}
        <p className="mt-5 inline-block rounded-full border border-dashed border-ink/30 px-3 py-1 text-[13px] text-muted">In build for the next release</p>
      </div>
    </li>
  );
}

function FeaturedEntry() {
  const d = featuredDemo;
  const related = d.relatedSlug ? getProject(d.relatedSlug) : undefined;
  return (
    <div className="grid gap-6 rounded-[10px] border border-ledger/40 bg-tile p-6 sm:p-8 md:grid-cols-[1fr_1.2fr] md:gap-12">
      <div>
        <p className="inline-block rounded-full bg-ledger px-3 py-1 text-[13px] font-medium text-night">{d.label}</p>
        <h3 className="display mt-4 text-[1.75rem] font-semibold leading-tight tracking-tight">{d.name}</h3>
      </div>
      <div className="text-[15px] leading-relaxed">
        <p>{d.description}</p>
        <p className="mt-4 text-muted">{d.scope}</p>
        {related && (
          <p className="mt-4">Related case study: <a className="link font-medium" href={`#work-${related.slug}`}>{related.org}</a></p>
        )}
        <div className="mt-6"><ButtonLink href={d.href}>Open the prototype</ButtonLink></div>
      </div>
    </div>
  );
}

export function Lab() {
  const original = demos.filter((d) => d.provenance === 'original');
  const rebuilt = demos.filter((d) => d.provenance === 'reconstructed');
  return (
    <Page>
      <PageHeader title="Product Lab">
        <p>Interactive demos, each built to make one product principle tangible. I keep two kinds apart: implementations based on original work, and demos rebuilt for this site to show how I think.</p>
      </PageHeader>
      <section aria-labelledby="featured" className="mb-12">
        <h2 id="featured" className="pb-2 font-serif text-xl font-semibold">Featured</h2>
        <FeaturedEntry />
      </section>
      <section aria-labelledby="original">
        <h2 id="original" className="pb-2 font-serif text-xl font-semibold">Based on original work</h2>
        <ul>{original.map((d) => <DemoEntry key={d.id} d={d} />)}</ul>
      </section>
      <section className="mt-12" aria-labelledby="rebuilt">
        <h2 id="rebuilt" className="pb-2 font-serif text-xl font-semibold">Rebuilt for this site</h2>
        <ul>{rebuilt.map((d) => <DemoEntry key={d.id} d={d} />)}</ul>
      </section>
    </Page>
  );
}

/* ---------- About ---------- */

const arc = [
  { years: '2014 to 2020', title: 'Finance', text: 'A tax co-op at PwC, where my team ranked first of 15 for speed and accuracy, then fund accounting at Citco for $2B+ in private equity and real estate funds, working in AWS-based financial platforms: reconciliation, treasury, capital calls and NAV reporting. I automated fund accounting on an AWS-based system, cutting processing time by 60%. It taught me how money actually moves through a business.' },
  { years: '2016', title: 'A first product', text: 'As product manager of a seven-person team, I took Cub Financial, a tool that helps students choose a degree with their finances in mind, to the top prize at a University of Toronto financial literacy hackathon.' },
  { years: '2020 to 2022', title: 'Research and design', text: 'Product discovery and prototyping for five small businesses moving online during COVID-19, then UX and UI design across web, iOS and Android for Jetsweat’s operations and ERP platform for fitness businesses, covering payments, scheduling, marketing, financial tracking and live classes.' },
  { years: '2022 to 2024', title: 'Product ownership', text: 'Digital product manager for a private B2B ordering platform at B&M Distributor, from concept to launch: interviews, usability testing, journey analysis and a roadmap across ordering, catalog and checkout.' },
  { years: '2025 to now', title: 'AI products', text: 'AI product manager at Golden Gate University, evaluating where an AI teaching platform could be trusted, then at Global Pathways AI, building an AI career and financial planning platform from zero to one: pathways ranked by financial ROI, loan and funding plans, and a roadmap to act on.' },
];

export function About() {
  return (
    <Page>
      <PageHeader title="About">
        <p>I build AI-powered SaaS and cloud products that simplify financial planning and payments, from concept to launch. I combine customer insight, technical fluency and a finance background to turn complicated money decisions into products people can act on.</p><p className="mt-4">My six years span FinTech, EdTech, HRTech and B2B SaaS. The path ran through tax, fund accounting and design before product management, and each step left a habit I still use.</p>
      </PageHeader>
      <ol className="border-l border-rule pl-6 sm:pl-10">
        {arc.map((a) => (
          <li key={a.title} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full bg-ledger sm:-left-[45px]" aria-hidden="true" />
            <p className="tnum text-[14px] text-muted">{a.years}</p>
            <h2 className="mt-1 display text-[1.4rem] font-semibold">{a.title}</h2>
            <p className="prose-record mt-2">{a.text}</p>
          </li>
        ))}
      </ol>
      <section className="mt-16 border-t border-rule pt-10" aria-labelledby="tech-h">
        <h2 id="tech-h" className="display text-[26px] font-semibold">How I’ve worked with technology</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">What I led or used alongside engineering teams, kept separate from what I built myself.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-[10px] border border-rule bg-sheet p-6">
            <h3 className="text-[15px] font-semibold">Led, oversaw or worked with</h3>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink/85">
              <li><span className="font-medium text-ink">AI/ML model training and evaluation.</span> Built synthetic personas and evaluation datasets, and oversaw the engineering team’s model training and AI evals at Global Pathways AI.</li>
              <li><span className="font-medium text-ink">LLMs, RAG and API integrations.</span> The AI matching engine at Global Pathways AI that ranks pathways by financial ROI and fit.</li>
              <li><span className="font-medium text-ink">LLMs, generative AI tools and APIs.</span> Led their integration into product workflows with engineers at Global Pathways AI.</li>
              <li><span className="font-medium text-ink">Claude and OpenAI APIs.</span> Product owner on the PMI team’s working multi-agent build.</li>
              <li><span className="font-medium text-ink">AWS-based financial platforms.</span> Used daily for fund operations at Citco.</li>
            </ul>
          </div>
          <div className="rounded-[10px] border border-rule bg-sheet p-6">
            <h3 className="text-[15px] font-semibold">Built myself</h3>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink/85">
              <li><span className="font-medium text-ink">Fund accounting automation.</span> Automated fund accounting on an AWS-based system at Citco, cutting processing time by 60%.</li>
              <li><span className="font-medium text-ink">A relocation planning prototype.</span> Built in Lovable to model costs and funding gaps across relocation routes; now in the <a className="link" href="#lab-global-pathways">Product Lab</a>.</li>
              <li><span className="font-medium text-ink">A brand-voice agent.</span> A Claude skill I wrote and use with Canva through a connector.</li>
              <li><span className="font-medium text-ink">UX and UI designs.</span> Web, iOS and Android designs for Jetsweat.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-10 border-t border-rule pt-10 md:grid-cols-2" aria-label="Education and credentials">
        <div>
          <h2 className="font-serif text-xl font-semibold">Education</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li><span className="font-medium">Master of Science in IT Management</span>, Golden Gate University, 2024 to 2026. 4.0 GPA.</li>
            <li><span className="font-medium">Bachelor of Business Administration, Finance</span>, University of Toronto, 2012 to 2016.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold">Credentials</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li><span className="font-medium">Certified Scrum Product Owner (CSPO)</span>, Scrum Alliance.</li>
            <li><span className="font-medium">Passed CFA Level I</span>, CFA Institute.</li>
          </ul>
        </div>
      </section>
    </Page>
  );
}

/* ---------- Resume ---------- */

const roles = [
  { period: 'May 2026 to present', role: 'AI Product Manager', org: 'Global Pathways AI', slug: 'global-pathways-ai', points: ['Built an internal MVP of an AI career and financial planning platform in 16 weeks, with waitlisted users, leading a distributed team of 10+ that I hired and trained.', 'Architected financial planning, loan planning and education-funding workflows, and an AI matching engine that ranks pathways by financial ROI and fit.', 'Delivered about 15% ahead of the original planned timeline by resolving architecture bottlenecks.', 'Recommended moving from a trained prediction model to an LLM for accuracy.'] },
  { period: 'September to December 2025', role: 'AI Product Manager', org: 'Golden Gate University', slug: 'ggu-edvisor-ai', points: ['Led the initial pilot of the Edvisor AI teaching platform with seven faculty members.', 'Recommended repositioning toward Business and Psychology and away from Law.', 'Presented pilot outcomes to 50+ executive and faculty stakeholders.'] },
  { period: 'June 2022 to April 2024', role: 'Digital Product Manager', org: 'B&M Distributor', slug: 'bm-distributor', points: ['Owned strategy and execution for a private B2B ordering platform supporting 200+ SKUs, from concept to launch.', 'Prioritized a roadmap of 5 key features across ordering, catalog and checkout by ROI, user needs and technical constraints.'] },
  { period: 'February to May 2022', role: 'Product Designer', org: 'Jetsweat', slug: 'jetsweat', points: ['UX and UI design across web, iOS and Android for an operations and ERP platform for fitness businesses; 4 features shipped with distributed teams.', 'Helped win and personally onboarded two enterprise clients.'] },
  { period: 'October 2020 to December 2021', role: 'Product Consultant', org: 'SeedxTech', points: ['Product discovery and strategy for 5 small businesses moving to virtual services during COVID-19, including 20+ customer interviews.'] },
  { period: 'October 2018 to July 2020', role: 'Private Equity and Real Estate Fund Accountant', org: 'Citco', points: ['Reconciled 500+ accounts across cash management, treasury and NAV reporting on AWS-based financial platforms.', 'Automated fund accounting on an AWS-based system, cutting processing time by 60%.', 'Ran capital calls, accounts receivable and payable, and general ledger work for $2B+ in private equity and real estate funds, under IFRS and GAAP.'] },
  { period: 'February to April 2014', role: 'Tax Associate (co-op)', org: 'PwC', points: ['Coordinated 400+ cross-border tax compliance deliverables under regulatory deadlines; the team ranked first of 15 for speed and accuracy.'] },
];

export function Resume() {
  return (
    <Page>
      <PageHeader title="Resume">
        <p>Experience at a glance. A full resume is available on request through <a className="link" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>.</p>
      </PageHeader>
      <ul>
        {roles.map((r) => (
          <li key={r.org + r.period} className="grid gap-3 border-t border-rule py-7 sm:grid-cols-[14rem_1fr] sm:gap-8">
            <p className="tnum text-[14px] text-muted">{r.period}</p>
            <div>
              <h2 className="display text-[1.3rem] font-semibold leading-snug">
                {r.role}, {r.slug ? <a className="link" href={`#work-${r.slug}`}>{r.org}</a> : r.org}
              </h2>
              {r.points.length > 0 && (
                <ul className="mt-3 max-w-2xl space-y-2 text-[15px] leading-relaxed text-ink/85">
                  {r.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Page>
  );
}

/* ---------- Contact ---------- */

export function Contact() {
  return (
    <Page>
      <PageHeader title="Contact">
        <p>The best way to reach me is on LinkedIn. I’m open to product manager roles on AI, SaaS and cloud products, especially in financial planning, payments and FinTech.</p>
      </PageHeader>
      <ButtonLink href={site.linkedin} external>Message me on LinkedIn</ButtonLink>
      <p className="mt-4 text-[14px] text-muted">linkedin.com/in/mhassan05</p>
    </Page>
  );
}

export function NotFound() {
  return (
    <Page>
      <PageHeader title="Page not found">
        <p>That page doesn’t exist. Try the <a className="link" href="#work">work</a> or go back to the <a className="link" href="#">homepage</a>.</p>
      </PageHeader>
    </Page>
  );
}
