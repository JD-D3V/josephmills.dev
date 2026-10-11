// Lighthouse gate: serves dist/ with `astro preview`, audits mobile + desktop, exits 1 if any score < 0.95.
// Usage: node scripts/lighthouse.mjs [url]   (pass a URL to audit a deployed site instead)
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const THRESHOLD = 0.95;
const PREVIEW_PORT = 4322;
const CDP_PORT = 9223;
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

let url = process.argv[2];
let preview;

async function waitFor(target) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(target)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${target}`);
}

if (!url) {
  url = `http://localhost:${PREVIEW_PORT}/`;
  preview = spawn('npx', ['astro', 'preview', '--port', String(PREVIEW_PORT), '--ignore-lock'], { stdio: 'ignore' });
  await waitFor(url);
}

const browser = await chromium.launch({ args: [`--remote-debugging-port=${CDP_PORT}`] });
let failed = false;
try {
  for (const [name, config] of [['mobile', undefined], ['desktop', desktopConfig]]) {
    const result = await lighthouse(url, { port: CDP_PORT, output: 'json', logLevel: 'error', onlyCategories: categories }, config);
    const scores = Object.fromEntries(categories.map((c) => [c, result.lhr.categories[c].score]));
    console.log(`${name.padEnd(8)}`, categories.map((c) => `${c} ${Math.round(scores[c] * 100)}`).join('  '));
    if (categories.some((c) => scores[c] < THRESHOLD)) failed = true;
  }
} finally {
  await browser.close();
  preview?.kill();
}
if (failed) {
  console.error(`Lighthouse: at least one score is below ${THRESHOLD * 100}`);
  process.exit(1);
}
