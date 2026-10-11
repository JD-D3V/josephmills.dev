import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { projectSchema } from '../../src/content/schema';

const schema = projectSchema(() => z.string());
const base = { title: 'T', order: 1, category: 'C', tech: 'A · B' };

describe('projectSchema', () => {
  it('parses the minimal project and defaults optional lists to []', () => {
    const parsed = schema.parse(base);
    expect(parsed.stats).toEqual([]);
    expect(parsed.links).toEqual([]);
    expect(parsed.media).toEqual([]);
  });

  it('accepts a valid youtube item and rejects a bad id', () => {
    expect(schema.safeParse({ ...base, media: [{ type: 'youtube', id: 'dQw4w9WgXcQ', alt: 'x' }] }).success).toBe(true);
    expect(schema.safeParse({ ...base, media: [{ type: 'youtube', id: 'bad', alt: 'x' }] }).success).toBe(false);
  });

  it('requires clip src to start with /media/', () => {
    const clip = { type: 'clip', src: 'clip.mp4', poster: '/media/p.jpg', alt: 'x' };
    expect(schema.safeParse({ ...base, media: [clip] }).success).toBe(false);
    expect(schema.safeParse({ ...base, media: [{ ...clip, src: '/media/clip.mp4' }] }).success).toBe(true);
  });

  it('rejects links with an invalid href', () => {
    expect(schema.safeParse({ ...base, links: [{ label: 'GitHub', href: 'not a url' }] }).success).toBe(false);
    expect(schema.safeParse({ ...base, links: [{ label: 'GitHub', href: 'https://github.com/x' }] }).success).toBe(true);
  });
});
