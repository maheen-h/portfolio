// Production build: bundles the React app with esbuild and compiles Tailwind CSS v4.
// Output goes to dist/, a static site that any static host (Vercel, Netlify, GitHub Pages) can serve.
//
// Optional environment variable:
//   SITE_URL  The public address, e.g. https://maheen-hassan.vercel.app
//             On Vercel this is filled in automatically from VERCEL_PROJECT_PRODUCTION_URL.
//             Used for the canonical link, social-sharing image and sitemap.
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

const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
).replace(/\/$/, '');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// 1. JavaScript
await esbuild.build({
  entryPoints: [path.join(src, 'main.tsx')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  jsx: 'automatic',
  outfile: path.join(dist, 'app.js'),
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
const candidates = new Set();
for (const f of await walk(src)) {
  const text = await readFile(f, 'utf8');
  for (const tok of text.split(/[\s"'`{}<>;=]+/)) if (tok && tok.length < 120) candidates.add(tok);
}
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
      `<meta property="og:image:alt" content="Maheen Hassan, product manager: I build what users need, then prove it worked." />`,
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
