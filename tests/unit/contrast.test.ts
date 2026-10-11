import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');

function tokensFrom(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2];
  return out;
}

// Light values live on :root; dark values live in the [data-theme="dark"] block.
const light = tokensFrom(css.slice(0, css.indexOf('[data-theme="dark"]')));
const darkStart = css.indexOf('[data-theme="dark"]');
const dark = tokensFrom(css.slice(darkStart, css.indexOf('@media', darkStart) === -1 ? undefined : css.indexOf('@media', darkStart)));

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs: [string, string][] = [
  ['--text', '--bg'],
  ['--text', '--bg-raised'],
  ['--heading', '--bg'],
  ['--muted', '--bg'],
  ['--muted', '--bg-raised'],
  ['--accent', '--bg'],
  ['--accent', '--accent-soft'],
];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme contrast', (_name, tokens) => {
  it.each(pairs)('%s on %s ≥ 4.5:1', (fg, bg) => {
    expect(tokens[fg], `${fg} defined`).toBeTruthy();
    expect(tokens[bg], `${bg} defined`).toBeTruthy();
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
