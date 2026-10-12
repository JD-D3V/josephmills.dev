import { expect, test } from '@playwright/test';

const ids = ['about', 'experience', 'skills', 'projects', 'beyond', 'contact'];

test('all sections present and linked from nav', async ({ page }) => {
  await page.goto('/');
  for (const id of ids) {
    await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator(`nav a[href="#${id}"]`)).toHaveCount(1);
  }
});

test('hero shows status, tagline, and actions', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.hero');
  await expect(hero.getByText('Open to Winter 2027 co-ops')).toBeVisible();
  await expect(hero.getByText('Software Engineer · AI/ML · Calgary')).toBeVisible();
  await expect(hero.getByRole('link', { name: /View projects/ })).toHaveAttribute('href', '#projects');
  await expect(hero.getByRole('link', { name: 'Download résumé' })).toHaveAttribute('href', '/resume.pdf');
});

test('active nav link follows scroll', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  await page.goto('/');
  await page.locator('#skills').scrollIntoViewIfNeeded();
  await expect(page.locator('nav a[href="#skills"]')).toHaveAttribute('aria-current', 'true');
});

test('no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('hero shows the real portrait, optimised', async ({ page }) => {
  await page.goto('/');
  const img = page.locator('.hero figure img');
  await expect(img).toHaveAttribute('alt', 'Portrait of Joseph Mills');
  await expect(img).toHaveAttribute('src', /\.webp$/);
  await expect(img).toHaveAttribute('width', /\d+/);
  await expect(img).toHaveAttribute('height', /\d+/);
  await expect(img).toBeVisible();
  // loaded and decoded (naturalWidth is density-adjusted for srcset, so only check it is non-zero)
  expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});

test('resume PDF is served', async ({ request }) => {
  const res = await request.get('/resume.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('pdf');
});
