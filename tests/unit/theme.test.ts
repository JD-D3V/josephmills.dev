import { describe, expect, it } from 'vitest';
import { readStoredTheme, resolveTheme, writeStoredTheme } from '../../src/scripts/theme';

describe('resolveTheme', () => {
  it('prefers a valid stored theme', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });
  it('falls back to the system preference', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme('garbage', false)).toBe('light');
  });
});

describe('storage helpers', () => {
  it('readStoredTheme returns null when access throws or storage is missing', () => {
    expect(
      readStoredTheme({
        getItem() {
          throw new Error('denied');
        },
      }),
    ).toBeNull();
    expect(readStoredTheme(null)).toBeNull();
  });
  it('writeStoredTheme swallows errors', () => {
    expect(() =>
      writeStoredTheme(
        {
          setItem() {
            throw new Error('denied');
          },
        },
        'dark',
      ),
    ).not.toThrow();
  });
});
