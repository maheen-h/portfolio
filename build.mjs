// Production build: bundles the React app with esbuild and compiles Tailwind CSS v4.
// Output goes to dist/, a static site that any static host (Vercel, Netlify, GitHub Pages) can serve.
//
// The public address, used for the canonical link, social-sharing image and sitemap.
// Change PRODUCTION_URL when the site moves (for example to a custom domain),
// or override it with a SITE_URL environment variable.
const PRODUCTION_URL = 'https://maheen-h.vercel.app';
import * as esbuild from 'esbuild';
import { compile } from 'tailwindcss';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

const siteUrl = (process.env.SITE_URL || PRODUCTION_URL).replace(/\/$/, '');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// 1. JavaScript
// The Global Pathways prototype (src/gp) is split into its own chunk, loaded only on its page.
await esbuild.build({
  entryPoints: { app: path.join(src, 'main.tsx') },
  bundle: true,
  minify: true,
  format: 'esm',
  splitting: true,
  target: 'es2020',
  jsx: 'automatic',
  outdir: dist,
  chunkNames: 'chunks/[name]-[hash]',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});

// 2. CSS: collect class candidates from the source, then let Tailwind generate only those utilities.
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
async function collect(files) {
  const set = new Set();
  for (const f of files) {
    const text = await readFile(f, 'utf8');
    for (const tok of text.split(/[\s"'`{}<>;=]+/)) if (tok && tok.length < 120) set.add(tok);
  }
  return set;
}
const gpDir = path.join(src, 'gp');
const candidates = await collect((await walk(src)).filter((f) => !f.startsWith(gpDir + path.sep)));
const tailwindCss = require.resolve('tailwindcss/index.css');
const compiler = await compile(await readFile(path.join(src, 'styles.css'), 'utf8'), {
  base: src,
  loadStylesheet: async (id, base) => {
    const file = id === 'tailwindcss' ? tailwindCss : path.resolve(base, id);
    return { path: file, base: path.dirname(file), content: await readFile(file, 'utf8') };
  },
});
const css = (await esbuild.transform(compiler.build([...candidates]), { loader: 'css', minify: true })).code;
await writeFile(path.join(dist, 'app.css'), css);

// The prototype's own design system, scoped to its shadow root.
const gpCompiler = await compile(await readFile(path.join(gpDir, 'styles.css'), 'utf8'), {
  base: gpDir,
  loadStylesheet: async (id, base) => {
    const file = id === 'tailwindcss' ? tailwindCss : path.resolve(base, id);
    return { path: file, base: path.dirname(file), content: await readFile(file, 'utf8') };
  },
});
const gpCss = (await esbuild.transform(gpCompiler.build([...(await collect(await walk(gpDir)))]), { loader: 'css', minify: true })).code;
await mkdir(path.join(dist, 'gp'), { recursive: true });
await writeFile(path.join(dist, 'gp', 'app.css'), gpCss);

// 3. Static assets
await cp(path.join(root, 'public'), dist, { recursive: true });

// 4. HTML, with absolute URLs for sharing previews when the site address is known
let html = await readFile(path.join(root, 'index.html'), 'utf8');
if (siteUrl) {
  html = html.replace(
    '<!-- SITE_META -->',
    [
      `<link rel="canonical" href="${siteUrl}/" />`,
      `<meta property="og:url" content="${siteUrl}/" />`,
      `<meta property="og:image" content="${siteUrl}/og-image.png" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:alt" content="Maheen Hassan, product manager: I build 0-to-1 AI, SaaS and cloud products that simplify financial planning and payments." />`,
      `<meta name="twitter:image" content="${siteUrl}/og-image.png" />`,
    ].join('\n    ')
  );
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`
  );
  await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
} else {
  html = html.replace('<!-- SITE_META -->', '');
  await writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
}
await writeFile(path.join(dist, 'index.html'), html);

console.log(`Built dist/${siteUrl ? ` for ${siteUrl}` : ' (no SITE_URL set: sharing image uses no absolute URL)'}`);
