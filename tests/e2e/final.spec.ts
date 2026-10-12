import { expect, test } from '@playwright/test';

test('more-projects cards with a live app show an optimised thumbnail', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#more-projects article');
  await expect(cards).toHaveCount(4);
  await expect(page.locator('#more-projects img')).toHaveCount(3);
  for (const title of ['Woofer', 'Classroom Finder', 'Music Browser']) {
    const img = cards.filter({ has: page.getByRole('heading', { name: title }) }).locator('img');
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveAttribute('src', /\.webp$/);
    await expect(img).toHaveAttribute('alt', new RegExp(title, 'i'));
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await expect(cards.filter({ has: page.getByRole('heading', { name: 'Multi-Threaded Web Server' }) }).locator('img')).toHaveCount(0);
});

test('skip link is the first tab stop and moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('a.skip-link');
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('title, description and structured data identify Joseph', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Joseph Mills.*Software Engineer/);
  const desc = (await page.locator('meta[name=description]').getAttribute('content')) ?? '';
  expect(desc).toContain('co-op');
  expect(desc.length).toBeLessThanOrEqual(170);
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(ld['@type']).toBe('Person');
  expect(ld.name).toBe('Joseph Mills');
  expect(ld.sameAs).toEqual(expect.arrayContaining(['https://github.com/JD-D3V', 'https://www.linkedin.com/in/joseph-mills317']));
  expect(JSON.stringify(ld)).not.toMatch(/403|@mtroyal|tel:/); // no phone or email in structured data
});

test('phone nav fades at the edge but the last link is fully reachable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  await page.goto('/');
  const links = page.locator('.nav__links');
  expect(await links.evaluate((el) => getComputedStyle(el).maskImage)).not.toBe('none');
  expect(await links.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  const gap = await links.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
    const last = el.querySelector('li:last-child a')!.getBoundingClientRect();
    return el.getBoundingClientRect().right - last.right;
  });
  expect(gap).toBeGreaterThanOrEqual(24);
});

test('desktop nav has no edge fade', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  await page.goto('/');
  expect(await page.locator('.nav__links').evaluate((el) => getComputedStyle(el).maskImage)).toBe('none');
});

test('copy-email button copies the address', async ({ browser }) => {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  await page.goto('/');
  const btn = page.locator('#contact button[data-copy]');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('jmill004@mtroyal.ca');
  await expect(btn).toHaveText('Copy', { timeout: 4000 });
  await context.close();
});

test('copy-email button is hidden without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#contact button[data-copy]')).toBeHidden();
  await expect(page.locator('#contact a[href="mailto:jmill004@mtroyal.ca"]').first()).toBeVisible();
  await context.close();
});
