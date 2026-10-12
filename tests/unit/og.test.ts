import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('og.png is a 1200x630 PNG', () => {
  const buf = readFileSync(new URL('../../public/og.png', import.meta.url));
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  expect(buf.readUInt32BE(16)).toBe(1200);
  expect(buf.readUInt32BE(20)).toBe(630);
});
