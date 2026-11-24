import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/pathways/Button';
import { fmt } from '../lib/engine/calc';
import { PRIORITY_LABEL, diffRankings, rankRoutes, statusLabel, type RankedRoute } from '../lib/engine/rank';
import { SAMPLE_EVIDENCE, SAMPLE_FX, SAMPLE_NOTICE, SAMPLE_PROFILE_FAMILY, SAMPLE_PROFILE_SOLO, SAMPLE_ROUTES } from '../lib/engine/sample';
import type { Intake, Priority } from '../lib/engine/types';

const PROGRESS_KEY = 'maheen-pathways-demo-progress-v1';

function stepsFor(r: RankedRoute) {
  return [
    ...r.route.verifyBeforePaying.map((text, i) => ({ id: `${r.key}-verify-${i}`, text, note: 'Verify against current official guidance before spending money.' })),
    ...r.route.timeline.map((t) => ({ id: `${r.key}-${t.id}`, text: t.label, note: `Sample estimate: ${t.minMonths}–${t.maxMonths} months. ${t.parallel ? 'Can run alongside other preparation.' : 'Follows preparation.'}` })),
  ];
}

function RouteCard({ r, onRoadmap }: { r: RankedRoute; onRoadmap: () => void }) {
  const evidence = SAMPLE_EVIDENCE.filter(e => e.routeKey === r.key);
  return <article className="gp-route" aria-label={`${r.route.destination} ${r.route.pathway}`}>
    <div className="gp-route-header"><span className="gp-rank">{r.rank ? `0${r.rank}` : '—'}</span><span className="gp-status" data-status={r.status}>{statusLabel(r.status)}</span></div>
    <p className="gp-location">{r.route.destination} · {r.route.city}</p>
    <h3>{r.route.title}</h3>
    <dl className="gp-metrics">
      <div><dt>Upfront cash · sample</dt><dd>{fmt(r.calc.upfrontTotal, 'INR')}</dd></div>
      <div><dt>Funding gap at departure</dt><dd>{fmt(r.calc.fundingGapAtDeparture, 'INR')}</dd></div>
      <div><dt>Feasible in · sample</dt><dd>{r.calc.feasibleInMonths >= 999 ? 'Unresolved' : `~${r.calc.feasibleInMonths} months`}</dd></div>
      <div><dt>Fit score · not approval odds</dt><dd>{r.score}/100</dd></div>
    </dl>
    <p>{r.route.tradeoff}</p>
    <details><summary>Why this rank?</summary><ul>{r.whyRank.map(x => <li key={x}>{x}</li>)}</ul>{r.statusReasons.length > 0 && <ul>{r.statusReasons.map(x => <li key={x}>{x}</li>)}</ul>}</details>
    <details><summary>Household costs</summary>
      <div className="gp-cost-scroll"><table><thead><tr><th>Item · illustrative</th><th>Amount</th></tr></thead><tbody>{r.calc.lines.map(l => <tr key={l.id}><td>{l.label}<br/><small>{l.milestone.replaceAll('_', ' ')} · {l.kind}{l.refundable ? ' · refundable/held funds' : ''}</small></td><td>{l.amountUser == null ? 'Unknown' : fmt(l.amountUser, 'INR')}</td></tr>)}</tbody></table></div>
      {r.calc.proofOfFunds && <p>{r.calc.proofOfFunds.overlapNote}</p>}
      <p>Monthly household living costs: {fmt(r.calc.monthlyHousehold, 'INR')} (sample).</p>
      <p>Timing depends on: {r.calc.timeline.controlling}.</p>
    </details>
    <details><summary>Assumptions &amp; source references</summary>
      <p>These references have not been retrieved or checked for this demo. No claim here is marked verified.</p>
      <ul>{r.route.assumptions.map(x => <li key={x}>{x}</li>)}</ul>
      <ul>{evidence.map(e => <li key={e.id}>{e.url ? <a href={e.url} target="_blank" rel="noreferrer">{e.publisher}</a> : e.publisher} — sample reference; date not checked.</li>)}</ul>
      <p>{r.route.family.spouseWorkNote}</p>
      <p>{r.route.longTerm.note}</p>
    </details>
    <div className="gp-toolbar gp-no-print"><Button className="gp-button-primary" onClick={onRoadmap}>Choose this roadmap →</Button></div>
  </article>;
}

export default function GlobalPathwaysDemo() {
  const [persona, setPersona] = useState<'family' | 'solo'>('family');
  const [profile, setProfile] = useState<Intake>(SAMPLE_PROFILE_FAMILY);
  const [roadmapKey, setRoadmapKey] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Progress is saved on this browser only.');
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const data: unknown = JSON.parse(raw);
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const clean: Record<string, boolean> = {};
          for (const [key, value] of Object.entries(data)) if (typeof value === 'boolean') clean[key] = value;
          setCompleted(clean);
        }
      }
    } catch { setSaveMessage('Browser storage is unavailable; progress lasts until this page closes.'); }
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed)); }
    catch { setSaveMessage('Browser storage is unavailable; progress lasts until this page closes.'); }
  }, [completed, storageReady]);
  const ranking = useMemo(() => rankRoutes(SAMPLE_ROUTES, profile, SAMPLE_FX, SAMPLE_EVIDENCE), [profile]);
  // Compare against the untouched sample scenario so visitors can see what their changes did
  const baseline = useMemo(() => rankRoutes(SAMPLE_ROUTES, persona === 'family' ? SAMPLE_PROFILE_FAMILY : SAMPLE_PROFILE_SOLO, SAMPLE_FX, SAMPLE_EVIDENCE), [persona]);
  const changes = useMemo(() => diffRankings(baseline, ranking, 'INR'), [baseline, ranking]);
  const selected = ranking.shown.find(r => r.key === roadmapKey);
  const steps = selected ? stepsFor(selected) : [];
  const done = steps.filter(s => completed[s.id]).length;
  const choosePersona = (next: 'family' | 'solo') => {
    setPersona(next); setProfile(next === 'family' ? SAMPLE_PROFILE_FAMILY : SAMPLE_PROFILE_SOLO); setRoadmapKey(null);
  };
  const changePriority = (p: Priority) => setProfile(old => ({ ...old, priorities: { ...old.priorities, ranked: [p, ...old.priorities.ranked.filter(x => x !== p)].slice(0, 3) } }));
  const download = () => {
    const report = [
      'GLOBAL PATHWAYS AI — PORTFOLIO SAMPLE REPORT', SAMPLE_NOTICE,
      `Household: ${persona === 'family' ? 'Spouse + child' : 'Moving alone'}. Savings: ${fmt(profile.finances.savings, 'INR')}. Monthly savings: ${fmt(profile.finances.monthlySavings, 'INR')}.`,
      `Top priorities: ${profile.priorities.ranked.map(p => PRIORITY_LABEL[p]).join(', ')}.`,
      'Exchange rates are illustrative and have no checked date. Fit scores are not approval probabilities.',
      ...ranking.shown.flatMap(r => [
        `\n#${r.rank}: ${r.route.title}`, `Status: ${statusLabel(r.status)}. Fit score: ${r.score}/100.`,
        `Upfront: ${fmt(r.calc.upfrontTotal, 'INR')}; departure gap: ${fmt(r.calc.fundingGapAtDeparture, 'INR')}; feasible in: ${r.calc.feasibleInMonths >= 999 ? 'unresolved' : `${r.calc.feasibleInMonths} months`}.`,
        ...r.whyRank, ...r.statusReasons, 'COSTS — ILLUSTRATIVE',
        ...r.calc.lines.map(l => `${l.label}: ${l.amountUser == null ? 'Unknown' : fmt(l.amountUser, 'INR')} (${l.kind})`),
        r.calc.proofOfFunds?.overlapNote ?? '', `Tradeoff: ${r.route.tradeoff}`, 'ASSUMPTIONS', ...r.route.assumptions,
        'VERIFY BEFORE PAYING', ...r.route.verifyBeforePaying, 'SOURCE REFERENCES — NOT CHECKED',
        ...SAMPLE_EVIDENCE.filter(e => e.routeKey === r.key).map(e => `${e.publisher}: ${e.url ?? 'No URL'} (sample; not retrieved or dated)`),
      ]),
      '\nEXCLUDED ROUTES', ...ranking.excluded.flatMap(r => [r.route.title, ...r.statusReasons]),
      ...(selected ? ['\nSAMPLE ROADMAP', selected.route.title, ...steps.map(s => `${completed[s.id] ? '[x]' : '[ ]'} ${s.text} — ${s.note}`)] : []),
      '\nNo live research or personal accounts are included in this portfolio demo. Partners do not influence ranking.',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'global-pathways-sample-report.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="gp-demo">
    <div className="gp-top" />
    <div className="gp-inner">
      <a className="gp-no-print" href="#lab">← Back to Product Lab</a>
      <div className="gp-brand"><img src="images/global-pathways-logo.png" alt="Global Pathways AI globe and arrow"/><span>Portfolio demo · Sample analysis</span></div>
      <h1 tabIndex={-1}>Global Pathways AI</h1>
      <p className="gp-intro">You know you want to move abroad. Find a path you can trust.</p>
      <p className="gp-notice">{SAMPLE_NOTICE}</p>
      <div className="gp-toolbar gp-no-print">
        <div className="gp-segments" aria-label="Sample household">
          <Button aria-pressed={persona === 'family'} onClick={() => choosePersona('family')}>Spouse + child</Button>
          <Button aria-pressed={persona === 'solo'} onClick={() => choosePersona('solo')}>Moving alone</Button>
        </div>
        <Button onClick={download}>↓ Download sample report</Button>
        <Button onClick={() => choosePersona(persona)}>↺ Reset scenario</Button>
      </div>
      <form className="gp-form gp-no-print" onSubmit={e => e.preventDefault()}>
        <label className="gp-field">Savings (INR)<input type="number" min="0" step="50000" value={profile.finances.savings} onChange={e => setProfile(p => ({ ...p, finances: { ...p.finances, savings: Math.max(0, Number(e.target.value) || 0) } }))}/></label>
        <label className="gp-field">Monthly savings (INR)<input type="number" min="0" step="5000" value={profile.finances.monthlySavings} onChange={e => setProfile(p => ({ ...p, finances: { ...p.finances, monthlySavings: Math.max(0, Number(e.target.value) || 0) } }))}/></label>
        <label className="gp-field">Top priority<select value={profile.priorities.ranked[0]} onChange={e => changePriority(e.target.value as Priority)}>{Object.entries(PRIORITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className="gp-field">Moving window<select value={profile.starting.movingWindow} onChange={e => setProfile(p => ({ ...p, starting: { ...p.starting, movingWindow: e.target.value as Intake['starting']['movingWindow'] } }))}><option value="6_12">6–12 months</option><option value="1_2y">1–2 years</option><option value="2y_plus">2+ years</option><option value="flexible">Flexible</option></select></label>
        <label className="gp-field">Exclude a destination<select value={profile.destination.excluded[0] ?? ''} onChange={e => setProfile(p => ({ ...p, destination: { ...p.destination, excluded: e.target.value ? [e.target.value] : [] } }))}><option value="">None</option>{[...new Set(SAMPLE_ROUTES.map(r => r.destination))].map(d => <option key={d}>{d}</option>)}</select></label>
        {persona === 'family' && <label className="gp-check"><input type="checkbox" checked={profile.family.spouseNeedsWorkImmediately === 'yes'} onChange={e => { const yes = e.target.checked; setProfile(p => ({ ...p, family: { ...p.family, spouseNeedsWorkImmediately: yes ? 'yes' : 'no' }, priorities: { ...p.priorities, mustHaves: yes ? [...p.priorities.mustHaves.filter(x => x !== 'spouse_work'), 'spouse_work'] : p.priorities.mustHaves.filter(x => x !== 'spouse_work') } })); }}/>Spouse must be able to work immediately</label>}
      </form>
      <h2>Your sample routes</h2>
      <p className="gp-save-note" aria-live="polite">{ranking.shown.length} ranked · {ranking.excluded.length} excluded · Civil engineering sample profile</p>
      {ranking.shown.length === 0 && <p className="gp-empty">No sample routes fit these constraints. Adjust your budget or reset the scenario.</p>}
      <div className="gp-grid">{ranking.shown.map(r => <RouteCard key={r.key} r={r} onRoadmap={() => { setRoadmapKey(r.key); setTimeout(() => document.getElementById('gp-roadmap')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 0); }}/>)}</div>
      {ranking.whatWouldChange && <p className="gp-notice">{ranking.whatWouldChange}</p>}
      {changes.length > 0 && <section className="gp-changes" aria-live="polite"><h2>What your changes did</h2><p className="gp-save-note">Compared with the original sample scenario.</p><ul>{changes.map(c => <li key={c.key}><strong>{c.title}</strong>: {c.before === c.after ? c.after : `${c.before} → ${c.after}`}{c.why.length > 0 && <><br/><small>{c.why.join(' · ')}</small></>}</li>)}</ul></section>}
      {ranking.excluded.length > 0 && <section className="gp-excluded"><h2>Not a fit for this household</h2>{ranking.excluded.map(r => <details key={r.key}><summary>{r.route.destination} — {r.route.occupationOrProgram}</summary><ul>{r.statusReasons.map(x => <li key={x}>{x}</li>)}</ul></details>)}</section>}
      {selected && <section className="gp-roadmap" id="gp-roadmap" aria-label="Sample roadmap">
        <h2>Your sample roadmap</h2><h3>{selected.route.title}</h3>
        <p className="gp-save-note" aria-live="polite">{done}/{steps.length} done · {saveMessage}</p>
        <progress max={steps.length} value={done} aria-label="Roadmap completion"/>
        {steps.map(s => <div className="gp-step" key={s.id}><label><input type="checkbox" checked={completed[s.id] ?? false} onChange={e => setCompleted(old => ({ ...old, [s.id]: e.target.checked }))}/><span>{s.text}</span></label><p>{s.note}</p></div>)}
        <div className="gp-toolbar gp-no-print"><Button onClick={() => setCompleted(old => { const next = { ...old }; steps.forEach(s => delete next[s.id]); return next; })}>↺ Reset roadmap progress</Button><Button onClick={download}>↓ Download sample report</Button></div>
      </section>}
    </div>
  </section>;
}