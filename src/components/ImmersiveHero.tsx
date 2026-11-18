import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LinkedInButton } from './Layout';
import { creditLabel, type Credit } from '../content/types';

/* =====================================================================
   "The descent": a scroll-driven world the camera moves down through.
   Problem → Discovery → Decisions → Build → Impact.

   How it works
   - A tall wrapper (one screen per scene) contains a sticky, full-screen stage.
   - Scroll position becomes a camera position (cam, in pixels of world height).
   - Every element lives at a world (x, y) and a depth. Its screen position is
     H/2 + (y − cam − H/2) × depth, so near layers move faster than far ones.
   - One coral line runs the full height of the world and draws as you descend.
   - All per-frame work is transforms, opacity and one small canvas, written
     directly to the DOM (no React re-render while scrolling).
   ===================================================================== */

const N = 5;
const STEPS = ['Problem', 'Discovery', 'Decisions', 'Build', 'Impact'];

// The site's own tokens, plus darker shades of the same coral for light and depth.
const C = {
  paper: '#1b1a18',
  night: '#121110',
  ink: '#f2ede5',
  muted: '#a8a094',
  rule: '#3a3732',
  coral: '#ef6a4e',
  coralDeep: '#c4472e',
  coralDark: '#8a2f1f',
  coralShadow: '#4a1d14',
  rose: '#d29a8e',
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
/** 1 inside [a, b] of scene progress, fading to 0 over `f` outside it. */
const windowed = (s: number, a: number, b: number, f = 0.28) =>
  s < a ? smooth(1 - (a - s) / f) : s > b ? smooth(1 - (s - b) / f) : 1;

type Dims = { W: number; H: number; mobile: boolean };

/* ---------------------------------------------------------------- */
/* Content: only verified facts from the portfolio                   */
/* ---------------------------------------------------------------- */

const problems = [
  'Unclear path to certification',
  'Fragmented tools for payments and scheduling',
  'Enrollment and revenue pressure',
  'Friction in B2B ordering',
  'Choosing a degree without financial guidance',
  'Career plans users can trust',
];

const clusters = [
  { label: 'Faculty research across APAC and the Americas', org: 'Golden Gate University' },
  { label: 'Customer interviews and usability tests', org: 'B&M Distributor' },
  { label: 'Student surveys and interviews', org: 'Cub Financial' },
];

const nodes = ['User needs', 'UX/UI', 'APIs', 'LLM', 'AI agents', 'Data'];

const shots = [
  { src: 'images/jetsweat-devices.webp', alt: 'Jetsweat dashboard on a tablet and a phone', org: 'Jetsweat' },
  { src: 'images/cub-financial.webp', alt: 'Cub Financial app screens showing cubScores', org: 'Cub Financial' },
  { src: 'images/pmi-career-quest.webp', alt: 'PMP exam preparation page on a tablet', org: 'PMI SF Bay Area' },
  { src: 'images/jetsweat-analytics.webp', alt: 'Jetsweat subscriber analytics panels', org: 'Jetsweat' },
];

const results: { figure: string; label: string; slug?: string; credit: Credit }[] = [
  { figure: '16 wks', label: 'Zero to an internal AI MVP, with a team of 10+ I hired', slug: 'global-pathways-ai', credit: 'led' },
  { figure: '40+', label: 'University courses now using the AI platform I piloted', slug: 'ggu-edvisor-ai', credit: 'contributed' },
  { figure: '60%', label: 'Less processing time after I automated fund reconciliation', credit: 'owned' },
  { figure: '2', label: 'First-place awards for an AI multi-agent prototype', slug: 'pmi-career-quest', credit: 'team' },
];

/* ---------------------------------------------------------------- */
/* World layout, in pixels, recomputed only on resize               */
/* ---------------------------------------------------------------- */

function layout({ W, H, mobile }: Dims) {
  const cx = mobile ? W * 0.5 : W * 0.7;
  const cyOff = mobile ? H * 0.3 : H * 0.5; // where a scene's visual centre sits on screen
  const sy = (i: number) => i * H + cyOff; // world y of scene i's visual centre
  const span = mobile ? W * 0.42 : W * 0.24; // half-width of the visual area

  const fork = { x: cx, y: sy(2) - H * (mobile ? 0.17 : 0.12) };
  const chosen = { x: cx + span * (mobile ? 0.5 : 0.45), y: sy(2) + H * (mobile ? 0.08 : 0.2) };
  const rejected = { x: cx - span * (mobile ? 0.5 : 0.75), y: sy(2) + H * (mobile ? 0.08 : 0.2) };
  const hub = { x: cx, y: sy(3) };
  const horizonY = 4 * H + (mobile ? H * 0.44 : H * 0.7);

  const main = [
    // On phones the line starts at the right edge so it never runs through the headline
    { x: mobile ? W * 0.94 : cx, y: -H * 0.2 },
    ...(mobile ? [{ x: W * 0.93, y: sy(0) }, { x: W * 0.9, y: H * 0.95 }] : [{ x: cx - span * 0.25, y: sy(0) }]),
    { x: cx + span * 0.15, y: sy(1) },
    fork,
    chosen,
    hub,
    { x: cx, y: horizonY },
  ];
  const path = (pts: { x: number; y: number }[]) =>
    pts.reduce((d, p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const q = pts[i - 1];
      const m = (p.y - q.y) / 2;
      return `${d} C${q.x},${q.y + m} ${p.x},${p.y - m} ${p.x},${p.y}`;
    }, '');

  const clusterPos = clusters.map((_, i) => {
    const a = (-90 + i * 120) * (Math.PI / 180);
    return { x: cx + Math.cos(a) * span * 0.72, y: sy(1) + Math.sin(a) * (mobile ? H * 0.13 : H * 0.2) };
  });
  const nodePos = nodes.map((_, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    return { x: hub.x + Math.cos(a) * span * (mobile ? 0.82 : 0.7), y: hub.y + Math.sin(a) * (mobile ? H * 0.14 : H * 0.24) };
  });
  const problemPos = problems.map((_, i) => {
    // Scattered around the first scene's visual area at different depths
    const grid = mobile
      ? [[-0.3, -1], [0.3, -0.6], [-0.35, -0.2], [0.35, 0.2], [-0.3, 0.6], [0.3, 1]]
      : [[-0.4, -0.6], [0.55, -0.72], [-0.3, 0.12], [0.8, -0.08], [-0.1, 0.72], [0.62, 0.5]];
    const [gx, gy] = grid[i];
    return mobile
      ? { x: cx + gx * span, y: H * 0.88 + gy * H * 0.1, depth: [0.95, 1.05, 1, 1.1, 0.95, 1.05][i] }
      : { x: cx + gx * span, y: sy(0) + gy * H * 0.3, depth: [0.75, 1.2, 0.9, 1.35, 1.1, 0.8][i] };
  });
  const shotPos = (mobile
    ? [[-0.55, -0.55, 0.85, 0.42], [0.6, 0.55, 1.2, 0.46]]
    : [[-0.95, -0.62, 0.8, 0.3], [0.85, -0.6, 1.2, 0.38], [-0.9, 0.62, 1.15, 0.34], [0.95, 0.6, 0.85, 0.28]]
  ).map(([gx, gy, depth, w]) => ({ x: hub.x + gx * span, y: hub.y + gy * (mobile ? H * 0.2 : H * 0.34), depth, w: w * (mobile ? W : W * 0.5) }));

  return { cx, sy, span, fork, chosen, rejected, hub, horizonY, mainPath: path(main), rejectPath: path([fork, rejected]), clusterPos, nodePos, problemPos, shotPos };
}

/* ---------------------------------------------------------------- */
/* Component                                                         */
/* ---------------------------------------------------------------- */

export default function ImmersiveHero({ onSkip }: { onSkip: () => void }) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState<Dims>({ W: 1280, H: 800, mobile: false });
  const [step, setStep] = useState(0);
  const L = useMemo(() => layout(dims), [dims]);

  // Measure the stage (svh-based, so mobile toolbars don't cause jumps).
  useLayoutEffect(() => {
    const measure = () => {
      const el = stage.current;
      if (!el) return;
      const W = el.clientWidth, H = el.clientHeight;
      setDims((d) => (d.W === W && d.H === H ? d : { W, H, mobile: W < 768 }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);

  // The animation loop: runs only while the section is on screen.
  useEffect(() => {
    const root = wrap.current, st = stage.current, cv = canvas.current;
    if (!root || !st || !cv) return;
    const { W, H, mobile } = dims;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Particles: scattered "noise" that gathers into research clusters, then flows into the decision.
    const count = mobile ? 70 : 150;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const parts = Array.from({ length: count }, (_, i) => ({
      x: rnd() * W, y: rnd() * H * 1.6, z: 0.35 + rnd() * 0.95,
      c: i % 3, jx: (rnd() - 0.5) * (mobile ? 70 : 110), jy: (rnd() - 0.5) * (mobile ? 50 : 90),
      ph: rnd() * Math.PI * 2, warm: rnd() < 0.22,
    }));

    const q = (sel: string) => Array.from(st.querySelectorAll<HTMLElement>(sel));
    const items = q('[data-depth]');
    const panels = q('[data-panel]');
    const main = st.querySelector<SVGPathElement>('[data-thread="main"]');
    const halos = Array.from(st.querySelectorAll<SVGPathElement>('[data-thread="halo"]'));
    const worldLayers = Array.from(st.querySelectorAll<HTMLElement>('[data-world], [data-world-html]'));
    const far = st.querySelector<HTMLElement>('[data-far]');
    const near = st.querySelector<HTMLElement>('[data-near]');
    const reject = st.querySelector<SVGPathElement>('[data-thread="reject"]');
    const rejectLabel = st.querySelector<HTMLElement>('[data-reject-label]');
    const edges = Array.from(st.querySelectorAll<SVGLineElement>('[data-edge]'));
    const bgDeep = st.querySelector<HTMLElement>('[data-bg="deep"]');
    const bgTop = st.querySelector<HTMLElement>('[data-bg="top"]');
    const rail = st.querySelector<HTMLElement>('[data-rail-fill]');
    const hint = st.querySelector<HTMLElement>('[data-hint]');

    let visible = true, raf = 0, lastStep = -1;

    const frame = (time: number) => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const total = rect.height - H;
      const p = clamp(-rect.top / total);
      const s = p * (N - 1); // scene progress, 0..4
      const cam = s * H; // world y at the top of the screen

      {
        // Layers with depth
        for (const el of items) {
          const d = Number(el.dataset.depth);
          const x = Number(el.dataset.x), y = Number(el.dataset.y);
          let tx = x, op = 1, sc = Number(el.dataset.scale || 1);
          const role = el.dataset.role;
          if (role === 'problem') {
            // Pulled into the coral line, then dissolved into particles
            // On phones the headline fills the screen, so the problems get their own beat after it
            const k = mobile ? smooth((s - 0.4) / 0.5) : smooth(s / 0.75);
            tx = x + (L.cx - x) * k * 0.85;
            op = mobile ? smooth((s - 0.22) / 0.18) * (1 - smooth((s - 0.62) / 0.25)) : 1 - smooth((s - 0.25) / 0.45);
            sc *= 1 - k * 0.25;
          } else if (role === 'cluster') op = windowed(s, 0.8, 1.35, 0.3);
          else if (role === 'node') op = 0.25 + 0.75 * smooth((s - 2.45 - Number(el.dataset.i) * 0.06) / 0.35);
          else if (role === 'shot') op = windowed(s, 2.7, 3.35, 0.4) * (d < 1 ? 0.75 : 1);
          else if (role === 'choice') op = mobile ? windowed(s, 1.75, 2.15, 0.2) : windowed(s, 1.75, 2.35, 0.3);
          const ty = H / 2 + (y - cam - H / 2) * d;
          el.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%) scale(${sc})`;
          el.style.opacity = String(op);
          el.style.visibility = op < 0.02 || ty < -H || ty > 2 * H ? 'hidden' : 'visible';
        }
        // World-attached SVG (the coral line and the system) moves with the camera at depth 1
        for (const g of worldLayers) g.style.transform = `translate3d(0, ${-cam}px, 0)`;
        if (far) far.style.transform = `translate3d(0, ${-cam * 0.45}px, 0)`;
        if (near) near.style.transform = `translate3d(0, ${-cam * 1.45}px, 0)`;

        // The line draws just ahead of the camera
        const drawn = String(1 - clamp((cam + H * 0.85) / (L.horizonY + 1)));
        if (main) main.style.strokeDashoffset = drawn;
        for (const h of halos) h.style.strokeDashoffset = drawn;
        if (reject) {
          reject.style.strokeDashoffset = String(1 - smooth((s - 1.55) / 0.35));
          reject.style.opacity = String(1 - 0.65 * smooth((s - 2.0) / 0.3));
        }
        if (rejectLabel) rejectLabel.style.textDecorationColor = `rgba(210,154,142,${smooth((s - 1.95) / 0.25)})`;
        edges.forEach((e, i) => {
          const k = smooth((s - 2.5 - i * 0.05) / 0.35);
          e.style.strokeOpacity = String(0.15 + 0.85 * k);
          e.style.stroke = k > 0.5 ? C.coral : C.rule;
        });

        // Atmosphere: warm haze at the surface, darker in the depths, coral glow lower down is world-attached
        if (bgTop) bgTop.style.opacity = String(1 - smooth(s / 1.4));
        if (bgDeep) bgDeep.style.opacity = String(smooth((s - 0.6) / 1.2) * (1 - smooth((s - 3.4) / 0.6)));

        // Text panels: one per scene, readable and still while the world moves behind them
        panels.forEach((el, i) => {
          const op = i === 0 ? 1 - (mobile ? smooth((s - 0.08) / 0.22) : smooth((s - 0.32) / 0.3)) : windowed(s, i - 0.32, i + 0.32, 0.26);
          el.style.opacity = String(op);
          el.style.transform = `translate3d(0, ${(1 - op) * (s < i ? 24 : -24)}px, 0)`;
          el.style.visibility = op < 0.02 ? 'hidden' : 'visible';
        });
        if (rail) rail.style.transform = `scaleX(${p})`;
        if (hint) hint.style.opacity = String(1 - smooth(s / 0.15));
        const cur = Math.round(s);
        if (cur !== lastStep) { lastStep = cur; setStep(cur); }

      }

      // Particles
      if (ctx) {
        ctx.clearRect(0, 0, W, H);
        const gather = smooth((s - 0.3) / 0.6);
        const flow = smooth((s - 1.35) / 0.5);
        const fade = 1 - smooth((s - 1.85) / 0.35);
        if (fade > 0.01) {
          const forkY = H / 2 + (L.fork.y - cam - H / 2);
          for (const pt of parts) {
            const drift = Math.sin(time / 2400 + pt.ph) * 10;
            const sx = pt.x + drift;
            const sy0 = ((pt.y - cam * pt.z * 0.35) % (H * 1.6) + H * 1.6) % (H * 1.6) - H * 0.3;
            const cl = L.clusterPos[pt.c];
            const cy = H / 2 + (cl.y - cam - H / 2);
            let x = sx + (cl.x + pt.jx - sx) * gather;
            let y = sy0 + (cy + pt.jy - sy0) * gather;
            x += (L.fork.x - x) * flow;
            y += (forkY - y) * flow;
            const a = (0.18 + 0.5 * pt.z) * fade;
            ctx.fillStyle = pt.warm ? `rgba(239,106,78,${a})` : `rgba(242,237,229,${a * 0.75})`;
            ctx.beginPath();
            ctx.arc(x, y, 0.8 + pt.z * 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      if (visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(root);
    raf = requestAnimationFrame(frame);
    const onVis = () => { visible = !document.hidden && root.getBoundingClientRect().bottom > 0; if (visible && !raf) raf = requestAnimationFrame(frame); };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, [dims, L]);

  const jump = (i: number) => {
    const root = wrap.current;
    if (!root) return;
    const total = root.offsetHeight - dims.H;
    const top = root.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / (N - 1)) * total, behavior: 'smooth' });
  };

  const { W, H, mobile } = dims;
  const worldH = 5 * H;

  return (
    <section ref={wrap} aria-label="Introduction: how I build products" className="relative" style={{ height: `${N * 100}svh` }}>
      <div ref={stage} className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ background: C.paper }}>
        {/* Atmosphere */}
        <div data-bg="top" aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(110% 70% at ${mobile ? 50 : 72}% -10%, #3a2a24 0%, ${C.paper} 60%)` }} />
        <div data-bg="deep" aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.night} 0%, #161412 100%)`, opacity: 0 }} />

        {/* Far layer: strata contours, moving slowly */}
        <svg data-far="" aria-hidden="true" className="absolute left-0 top-0 will-change-transform" width={W} height={H * 2.9} viewBox={`0 0 ${W} ${H * 2.9}`}>
          <g>
            {Array.from({ length: 18 }, (_, i) => {
              const y = i * H * 0.32 + H * 0.15;
              const amp = 18 + (i % 4) * 9;
              const deep = i > 8;
              return (
                <path key={i} d={`M0,${y} C${W * 0.25},${y - amp} ${W * 0.5},${y + amp} ${W * 0.75},${y - amp * 0.6} S${W * 1.05},${y + amp * 0.4} ${W * 1.1},${y}`}
                  fill="none" stroke={deep ? C.coralShadow : C.rule} strokeOpacity={deep ? 0.9 : 0.55} strokeWidth="1" />
              );
            })}
          </g>
        </svg>

        {/* World glows that travel with the camera: the build glow and the horizon */}
        <div data-world-html="" aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ width: W, height: worldH }}>
          <div className="absolute rounded-full" style={{ left: L.hub.x - W * 0.35, top: L.hub.y - H * 0.4, width: W * 0.7, height: H * 0.8, background: `radial-gradient(closest-side, rgba(196,71,46,.22), rgba(138,47,31,.08) 60%, transparent)` }} />
          <div className="absolute" style={{ left: -W * 0.3, top: L.horizonY - H * 0.08, width: W * 1.6, height: H * 1.2, borderRadius: '50% 50% 0 0', background: `radial-gradient(60% 55% at 50% 0%, rgba(239,106,78,.55), rgba(196,71,46,.32) 35%, rgba(74,29,20,.4) 65%, ${C.paper} 100%)` }} />
          <div className="absolute" style={{ left: 0, top: L.horizonY - 1, width: W, height: 1, background: `linear-gradient(90deg, transparent, ${C.coral}, transparent)` }} />
        </div>

        {/* Particles */}
        <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        {/* The coral line and the system it builds */}
        <svg data-world="" aria-hidden="true" className="absolute left-0 top-0 will-change-transform" width={W} height={worldH} viewBox={`0 0 ${W} ${worldH}`}>
          <g>
            {/* System edges */}
            {L.nodePos.map((n, i) => (
              <line key={`h${i}`} data-edge="" x1={L.hub.x} y1={L.hub.y} x2={n.x} y2={n.y} stroke={C.rule} strokeWidth="1.25" />
            ))}
            {L.nodePos.map((n, i) => {
              const m = L.nodePos[(i + 1) % L.nodePos.length];
              return <line key={`r${i}`} data-edge="" x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke={C.rule} strokeWidth="1" strokeDasharray="3 5" />;
            })}
            <path data-thread="reject" d={L.rejectPath} pathLength={1} fill="none" stroke={C.rose} strokeWidth="1.5" strokeDasharray="1" strokeDashoffset="1" />
            <path data-thread="halo" d={L.mainPath} pathLength={1} fill="none" stroke={C.coralDeep} strokeWidth="12" strokeOpacity=".14" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
            <path data-thread="halo" d={L.mainPath} pathLength={1} fill="none" stroke={C.coralDeep} strokeWidth="5" strokeOpacity=".3" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
            <path data-thread="main" d={L.mainPath} pathLength={1} fill="none" stroke={C.coral} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
            <circle cx={L.hub.x} cy={L.hub.y} r={mobile ? 30 : 42} fill={C.coralShadow} stroke={C.coral} strokeWidth="2" />
            <circle cx={L.fork.x} cy={L.fork.y} r="5" fill={C.coral} />
          </g>
        </svg>

        {/* Depth-placed elements (HTML so text stays crisp) */}
        <div className="absolute inset-0" aria-hidden="true">
          <Item x={L.hub.x} y={L.hub.y} depth={1}><span className="display text-[13px] font-semibold text-ink sm:text-[15px]">Product</span></Item>
          {problems.map((t, i) => (
            <Item key={t} role="problem" x={L.problemPos[i].x} y={L.problemPos[i].y} depth={L.problemPos[i].depth} scale={mobile ? 0.8 : L.problemPos[i].depth > 1 ? 1.05 : 0.9}>
              <span className="block whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] text-ink/80" style={{ borderColor: 'rgba(242,237,229,.16)', background: 'rgba(36,34,31,.85)' }}>{t}</span>
            </Item>
          ))}
          {clusters.map((c, i) => (
            <Item key={c.label} role="cluster" x={L.clusterPos[i].x} y={L.clusterPos[i].y + (mobile ? 46 : 70)} depth={1}>
              <span className="block max-w-[11rem] text-center text-[12.5px] leading-snug text-ink/85 sm:max-w-[13rem] sm:text-[13px]">{c.label}<span className="mt-0.5 block text-[11.5px] text-ledger">{c.org}</span></span>
            </Item>
          ))}
          <Item role="choice" x={L.rejected.x} y={L.rejected.y + 28} depth={1}>
            <span data-reject-label="" className="block whitespace-nowrap text-[13px] text-carmine line-through" style={{ textDecorationColor: 'transparent' }}>Trained prediction model</span>
          </Item>
          <Item role="choice" x={L.chosen.x} y={L.chosen.y + (mobile ? 64 : 30)} depth={1}>
            <span className="block whitespace-nowrap rounded-full bg-ledger px-3 py-1 text-[13px] font-medium text-night">LLM: more accurate, faster</span>
          </Item>
          {nodes.map((n, i) => (
            <Item key={n} role="node" i={i} x={L.nodePos[i].x} y={L.nodePos[i].y} depth={1}>
              <span className="block whitespace-nowrap rounded-full border border-ledger/50 bg-sheet px-3 py-1 text-[12.5px] text-ink sm:text-[13px]">{n}</span>
            </Item>
          ))}
          {L.shotPos.map((sp, i) => (
            <Item key={i} role="shot" x={sp.x} y={sp.y} depth={sp.depth}>
              <figure className="overflow-hidden rounded-[8px] shadow-[0_30px_60px_-25px_rgba(0,0,0,.8)]" style={{ width: sp.w, background: '#ebe4d8' }}>
                <img src={shots[i].src} alt="" loading="lazy" decoding="async" className="block w-full object-contain p-[6%]" style={{ aspectRatio: '4 / 3' }} />
              </figure>
            </Item>
          ))}
        </div>

        {/* Near layer: soft shapes that pass faster than everything else */}
        <div data-near="" aria-hidden="true" className="pointer-events-none absolute left-0 top-0 will-change-transform" style={{ width: W, height: H * 7.5 }}>
          {[[0.08, 1.1, 110], [0.92, 2.2, 150], [0.15, 3.3, 130], [0.85, 4.4, 170], [0.4, 5.6, 120], [0.7, 6.6, 160]].map(([x, y, r], i) => (
            <div key={i} className="absolute rounded-full" style={{ left: x * W - r, top: y * H - r, width: r * 2, height: r * 2, background: `radial-gradient(closest-side, ${i % 2 ? 'rgba(138,47,31,.4)' : 'rgba(74,29,20,.5)'}, transparent)` }} />
          ))}
        </div>

        {/* Text panels: one per scene, kept still and readable */}
        <div className={`pointer-events-none absolute inset-0 ${mobile ? '' : 'mx-auto max-w-[1320px]'}`}>
          {/* 1. Problem (the hero) */}
          <Panel i={0} mobile={mobile} hero>
            <p className="text-[14px] text-ledger sm:text-[15px]">Maheen Hassan, product manager for AI, SaaS and cloud-based products</p>
            <h1 id="hero-title" tabIndex={-1} className="display mt-3 text-[38px] font-semibold leading-[1.0] outline-none sm:mt-4 sm:text-[60px] lg:text-[68px]">
              I build what users need, <em className="font-serif font-normal italic tracking-[-0.02em] text-ink/95">then prove it worked.</em>
            </h1>
            <p className="mt-5 max-w-[34em] text-[15.5px] leading-relaxed text-ink/80 sm:mt-6 sm:text-[17px]">
              I’m a product manager specializing in AI-powered, SaaS and cloud-based products. I combine customer insight, technical fluency and commercial strategy to turn complex problems into scalable solutions, from 0→1 development to growth and optimization. My experience spans FinTech, EdTech, HRTech and enterprise technology.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <button type="button" onClick={onSkip} className="inline-flex min-h-12 items-center rounded-full bg-ledger px-5 text-[15px] font-medium text-night transition hover:brightness-110">See the work</button>
              <LinkedInButton tone="line" />
            </div>
          </Panel>

          <Panel i={1} mobile={mobile} title="Discovery" lead="I start from what users do and what the evidence shows.">
            <Facts items={[
              ['Faculty research across APAC and the Americas', 'ggu-edvisor-ai', 'Golden Gate University'],
              ['Customer interviews, usability tests and drop-off analysis', 'bm-distributor', 'B&M Distributor'],
              ['Surveys and interviews with students', 'cub-financial', 'Cub Financial'],
            ]} />
          </Panel>

          <Panel i={2} mobile={mobile} title="Decisions" lead="Then I choose, and say what it costs.">
            <Facts items={[
              ['Moved recommendations from a trained prediction model to an LLM: more accurate and faster, with less customization.', 'global-pathways-ai', 'Global Pathways AI'],
              ['Focused an AI teaching product on Business and Psychology, not Law, where hallucination risk was too high.', 'ggu-edvisor-ai', 'Golden Gate University'],
            ]} />
          </Panel>

          <Panel i={3} mobile={mobile} title="Build" lead="Zero to one, in close partnership with engineering.">
            <Facts items={[
              ['An internal AI MVP in 16 weeks, with a distributed team of 10+ that I hired and led.', 'global-pathways-ai', 'Global Pathways AI'],
              ['Integration of generative AI tools, APIs and LLM interfaces into product workflows.', 'global-pathways-ai', 'Global Pathways AI'],
              ['A working multi-agent build on the Claude and OpenAI APIs.', 'pmi-career-quest', 'PMI San Francisco Bay Area Chapter'],
            ]} />
          </Panel>

          <Panel i={4} mobile={mobile} title="Impact" lead="Then I prove it worked.">
            <ul className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-rule">
              {results.map((r) => (
                <li key={r.figure} className="bg-sheet/95 p-3.5 sm:p-4">
                  <p className="tnum display text-[26px] font-semibold leading-none sm:text-[32px]">{r.figure}</p>
                  <p className="mt-2 text-[12.5px] leading-snug text-ink/75 sm:text-[13.5px]">{r.label}</p>
                  <p className="mt-2 text-[11.5px] text-ledger sm:text-[12px]">{creditLabel[r.credit]}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={onSkip} className="inline-flex min-h-12 items-center rounded-full bg-ledger px-5 text-[15px] font-medium text-night transition hover:brightness-110">See the work</button>
              <LinkedInButton tone="line" />
            </div>
          </Panel>
        </div>

        {/* Progress, jump links and skip */}
        <div className={`absolute inset-x-0 ${mobile ? 'top-[72px]' : 'bottom-6'} z-10`}>
          <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
            <nav aria-label="Introduction progress" className="min-w-0">
              <ol className="flex gap-1 sm:gap-2">
                {STEPS.map((t, i) => (
                  <li key={t}>
                    <button type="button" onClick={() => jump(i)} aria-current={step === i ? 'step' : undefined}
                      className={`min-h-9 rounded-full px-2.5 text-[12px] transition-colors sm:min-h-10 sm:px-3.5 sm:text-[13.5px] ${step === i ? 'bg-ink/10 font-medium text-ink' : 'text-muted hover:text-ink'}`}>
                      {t}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="mx-2.5 mt-1 h-px bg-rule sm:mx-3.5"><div data-rail-fill="" className="h-full origin-left bg-ledger" style={{ transform: 'scaleX(0)' }} /></div>
            </nav>
            {!mobile && (
              <button type="button" onClick={onSkip} className="pointer-events-auto min-h-10 shrink-0 rounded-full border border-ink/20 px-4 text-[13.5px] font-medium text-ink/85 hover:border-ink/50">Skip to work</button>
            )}
          </div>
        </div>
        {mobile && step > 0 && (
          <button type="button" onClick={onSkip} className="absolute bottom-4 right-4 z-10 min-h-11 rounded-full border border-ink/25 bg-paper/80 px-4 text-[13.5px] font-medium backdrop-blur">Skip to work</button>
        )}
        <p data-hint="" aria-hidden="true" className={`absolute z-10 text-[13px] text-muted ${mobile ? 'bottom-6 left-5' : 'bottom-20 left-1/2 -translate-x-1/2'}`}>Scroll to see how I build products</p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Item({ x, y, depth, role, i, scale, children }: { x: number; y: number; depth: number; role?: string; i?: number; scale?: number; children: ReactNode }) {
  return (
    <div data-depth={depth} data-x={x} data-y={y} data-role={role} data-i={i} data-scale={scale} className="absolute left-0 top-0 will-change-transform" style={{ visibility: 'hidden' }}>
      {children}
    </div>
  );
}

function Panel({ i, mobile, hero, title, lead, children }: { i: number; mobile: boolean; hero?: boolean; title?: string; lead?: string; children: ReactNode }) {
  const pos = hero
    ? mobile ? 'left-5 right-5 top-[132px]' : 'left-12 top-1/2 w-[min(46%,600px)] -translate-y-1/2'
    : mobile ? 'left-0 right-0 bottom-0 px-5 pb-20 pt-10' : 'left-12 top-1/2 w-[min(36%,460px)] -translate-y-1/2';
  return (
    <div data-panel={i} className={`pointer-events-auto absolute ${pos}`} style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden', background: mobile && !hero ? 'linear-gradient(180deg, transparent, rgba(27,26,24,.92) 22%, rgba(27,26,24,.98))' : undefined }}>
      {!hero && (
        <>
          <p className="chapter-num text-[16px] text-ledger">{String(i + 1).padStart(2, '0')}</p>
          <h2 className="display mt-1 text-[30px] font-semibold leading-tight sm:text-[40px]">{title}</h2>
          <p className="mt-2 font-serif text-[18px] italic leading-snug text-ink/90 sm:text-[21px]">{lead}</p>
        </>
      )}
      {children}
    </div>
  );
}

function Facts({ items }: { items: [string, string, string][] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map(([text, slug, org]) => (
        <li key={text} className="border-l-2 border-ledger/60 pl-4 text-[14.5px] leading-relaxed text-ink/85 sm:text-[15.5px]">
          {text} <a href={`#work-${slug}`} className="link whitespace-nowrap text-[13.5px] text-muted">{org}</a>
        </li>
      ))}
    </ul>
  );
}
