// Runs the Global Pathways prototype's tests (src/gp/**/*.test.ts) without extra dependencies.
// esbuild bundles each test file and swaps the `vitest` import for the small
// compatible runner below, so `npm test` works with the packages already installed.
import * as esbuild from 'esbuild';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, 'src/gp');
const files = (await readdir(dir, { recursive: true })).filter((f) => f.endsWith('.test.ts'));

const runner = `
const tests = [];
let prefix = '';
export function describe(name, fn) { const p = prefix; prefix = p + name + ' > '; fn(); prefix = p; }
export function it(name, fn) { tests.push([prefix + name, fn]); }
export const test = it;
const fmt = (v) => { try { return JSON.stringify(v); } catch { return String(v); } };
function matchers(actual, neg) {
  const check = (ok, msg) => { if (ok === neg) throw new Error((neg ? 'Expected not: ' : 'Expected: ') + msg); };
  return {
    toBe: (e) => check(Object.is(actual, e), fmt(actual) + ' to be ' + fmt(e)),
    toEqual: (e) => check(fmt(actual) === fmt(e), fmt(actual) + ' to equal ' + fmt(e)),
    toContain: (e) => check(actual.includes(e), fmt(actual) + ' to contain ' + fmt(e)),
    toBeDefined: () => check(actual !== undefined, 'value to be defined'),
    toBeGreaterThan: (e) => check(actual > e, actual + ' > ' + e),
    toBeGreaterThanOrEqual: (e) => check(actual >= e, actual + ' >= ' + e),
    toBeLessThan: (e) => check(actual < e, actual + ' < ' + e),
    toBeLessThanOrEqual: (e) => check(actual <= e, actual + ' <= ' + e),
  };
}
export function expect(actual) { return { ...matchers(actual, false), not: matchers(actual, true) }; }
export async function run() {
  let failed = 0;
  for (const [name, fn] of tests) {
    try { await fn(); console.log('  ✓ ' + name); }
    catch (e) { failed++; console.log('  ✗ ' + name + '\\n    ' + e.message); }
  }
  return { total: tests.length, failed };
}`;

let total = 0, failed = 0;
for (const f of files) {
  const out = path.join(os.tmpdir(), `gp-test-${Date.now()}-${path.basename(f)}.mjs`);
  await esbuild.build({
    stdin: { contents: `export * from 'vitest';\nimport './${f.split(path.sep).join('/')}';`, resolveDir: dir, loader: 'ts' },
    bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'warning',
    plugins: [{ name: 'vitest-shim', setup(b) {
      b.onResolve({ filter: /^vitest$/ }, () => ({ path: 'vitest', namespace: 'shim' }));
      b.onLoad({ filter: /.*/, namespace: 'shim' }, () => ({ contents: runner, loader: 'js' }));
    } }],
  });
  console.log(f);
  const r = await (await import(pathToFileURL(out).href)).run();
  total += r.total; failed += r.failed;
}
console.log(`\n${total - failed}/${total} tests passed`);
process.exit(failed ? 1 : 0);
