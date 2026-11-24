import { Page } from '../components/Layout';
import { featuredDemo } from '../content/lab';
import GlobalPathwaysDemo from './GlobalPathwaysDemo';

/* The portfolio frame around the Global Pathways AI prototype: the site's own
   header, a short note on what the prototype does and does not do, the
   prototype in its own application UI, and a way back to the Lab. */
export default function GlobalPathwaysLab() {
  return (
    <Page>
      <div className="pb-6 pt-8 sm:pt-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-full bg-ledger px-3 py-1 text-[13px] font-medium text-night">{featuredDemo.label}</p>
          <p className="text-[14px] text-muted">Global Pathways AI, decision intelligence prototype</p>
        </div>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-ink/80">{featuredDemo.scope}</p>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-rule shadow-[0_30px_80px_-40px_rgba(0,0,0,.8)]">
        <GlobalPathwaysDemo />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-4 pt-8">
        <a href="#lab" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-4 text-[14px] font-medium hover:border-ink/60">Back to Product Lab</a>
        <a href="#work-global-pathways-ai" className="link text-[14px] text-muted">Read the Global Pathways AI case study</a>
      </div>
    </Page>
  );
}
