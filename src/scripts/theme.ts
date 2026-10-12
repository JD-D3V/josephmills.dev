export type Theme = 'light' | 'dark';

export const THEME_KEY = 'theme';

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'> | null): string | null {
  try {
    return storage ? storage.getItem(THEME_KEY) : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(storage: Pick<Storage, 'setItem'> | null, theme: Theme): void {
  try {
    storage?.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked (private mode etc.): the choice just lasts for this page view.
  }
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function applyLabel(button: HTMLElement, theme: Theme): void {
  button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

export function initThemeToggle(button: HTMLElement): void {
  const root = document.documentElement;
  const current = (): Theme => (root.dataset.theme === 'dark' ? 'dark' : 'light');
  applyLabel(button, current());
  button.addEventListener('click', () => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      applyLabel(button, next);
    };
    writeStoredTheme(safeStorage(), next);
    // Rare action, so a short crossfade is fine; skipped when motion is reduced or unsupported.
    if (typeof document.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });
}
