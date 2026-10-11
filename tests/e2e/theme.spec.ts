import { expect, test } from '@playwright/test';

const html = (page: import('@playwright/test').Page) => page.locator('html');

test('follows system dark preference', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await context.close();
});

test('toggle persists across reload', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: /switch to light theme/i })).toBeVisible();
  await context.close();
});

test('no flash: theme set before first paint', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { __themeAtDCL: string }).__themeAtDCL = document.documentElement.dataset.theme ?? '';
    });
  });
  await page.goto('/');
  expect(await page.evaluate(() => (window as unknown as { __themeAtDCL: string }).__themeAtDCL)).toBe('dark');
  await context.close();
});

test('works when localStorage throws', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Fixture projects reference media that is only stubbed in projects.spec.ts; ignore resource-load noise.
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('denied', 'SecurityError');
      },
    });
  });
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
  await context.close();
});

test('no-JS falls back to system theme', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(17, 20, 23)');
  await context.close();
});
