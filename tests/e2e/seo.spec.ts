import { expect, test } from '@playwright/test';

test('meta tags', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://josephmills.dev/');
  expect(((await page.locator('meta[name=description]').getAttribute('content')) ?? '').length).toBeGreaterThan(20);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://josephmills.dev/og.png');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Joseph Mills/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href', '/favicon.svg');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('static files', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://josephmills.dev/sitemap-index.xml');
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
  const og = await request.get('/og.png');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');
  const missing = await request.get('/does-not-exist');
  expect(missing.status()).toBe(404);
  const body = await missing.text();
  expect(body).toContain('Page not found');
  expect(body).toContain('href="/"');
});

test('no Google Fonts requests', async ({ page }) => {
  const hosts: string[] = [];
  page.on('request', (r) => hosts.push(new URL(r.url()).host));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(hosts.filter((h) => /fonts\.(googleapis|gstatic)\.com/.test(h))).toEqual([]);
});
