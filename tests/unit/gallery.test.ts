import { describe, expect, it } from 'vitest';
import { stepIndex, youtubeEmbedUrl } from '../../src/scripts/gallery';

describe('stepIndex', () => {
  it('wraps backwards from the first item', () => expect(stepIndex(0, -1, 5)).toBe(4));
  it('wraps forwards from the last item', () => expect(stepIndex(4, 1, 5)).toBe(0));
  it('steps normally', () => expect(stepIndex(2, 1, 5)).toBe(3));
  it('stays put with a single item', () => expect(stepIndex(0, 1, 1)).toBe(0));
});

describe('youtubeEmbedUrl', () => {
  it('uses the no-cookie domain with autoplay', () => {
    expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1');
  });
});
