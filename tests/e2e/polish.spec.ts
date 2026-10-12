import { expect, test } from '@playwright/test';

test('buttons give press feedback (hover-capable, normal motion)', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'needs a hover-capable pointer');
  await page.goto('/');
  const btn = page.locator('.hero .btn--primary');
  await btn.hover();
  await page.mouse.down();
  await page.waitForTimeout(250);
  const transform = await btn.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.up();
  expect(transform).toMatch(/^matrix\(0\.97/);
});

test('reduced motion: no press scale and no hover lift', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const btn = page.locator('.hero .btn--primary');
  await btn.hover();
  await page.mouse.down();
  await page.waitForTimeout(250);
  expect(await btn.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  await page.mouse.up();
  await context.close();
});

test('theme toggle crossfades via a view transition, but not with reduced motion', async ({ browser }) => {
  for (const [reduced, expected] of [['no-preference', 1], ['reduce', 0]] as const) {
    const context = await browser.newContext({ reducedMotion: reduced });
    const page = await context.newPage();
    await page.addInitScript(() => {
      (window as unknown as { __vt: number }).__vt = 0;
      const orig = document.startViewTransition?.bind(document);
      if (orig) {
        document.startViewTransition = ((cb: () => void) => {
          (window as unknown as { __vt: number }).__vt++;
          return orig(cb);
        }) as typeof document.startViewTransition;
      }
    });
    await page.goto('/');
    await page.getByRole('button', { name: /switch to (dark|light) theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
    expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(expected);
    await context.close();
  }
});

test('gallery exits faster than it enters', async ({ page }) => {
  await page.goto('/');
  await page.locator('#boring-web-browser [data-gallery]').click();
  const dlg = page.locator('dialog[open]');
  await expect(dlg).toBeVisible();
  expect(await dlg.evaluate((d) => getComputedStyle(d).transitionDuration.split(',')[0].trim())).toBe('0.22s');
  const closedDuration = await page.evaluate(() => {
    const d = document.querySelector('dialog[data-gallery-dialog="boring-web-browser"]')!;
    d.removeAttribute('open');
    return getComputedStyle(d).transitionDuration.split(',')[0].trim();
  });
  expect(closedDuration).toBe('0.15s');
});

test('mobile hero: name and both actions are visible without scrolling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  await page.goto('/');
  const vh = page.viewportSize()!.height;
  const primary = await page.locator('.hero .btn--primary').boundingBox();
  const ghost = await page.locator('.hero .btn--ghost').boundingBox();
  expect(primary!.y + primary!.height).toBeLessThanOrEqual(vh);
  expect(ghost!.y + ghost!.height).toBeLessThanOrEqual(vh);
  expect(Math.round(primary!.width)).toBe(Math.round(ghost!.width));
});
