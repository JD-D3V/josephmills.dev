import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const clip = readFileSync('tests/fixtures/clip.mp4');
const poster = readFileSync('tests/fixtures/poster.jpg');

async function stubMedia(page: Page) {
  await page.route('**/media/fixture/clip.mp4', (r) => r.fulfill({ body: clip, contentType: 'video/mp4' }));
  await page.route('**/media/fixture/poster.jpg', (r) => r.fulfill({ body: poster, contentType: 'image/jpeg' }));
  await page.route('**://i.ytimg.com/**', (r) => r.fulfill({ body: poster, contentType: 'image/jpeg' }));
}

const card = (page: Page, id: string) => page.locator(`article.project#${id}`);

test.beforeEach(async ({ page }) => stubMedia(page));

test('real projects render in order', async ({ page }) => {
  await page.goto('/');
  const titles = await page.locator('article.project h3').allTextContents();
  expect(titles.slice(0, 4)).toEqual(['The Boring Web Browser', 'beyonder', 'WaterTempProject', 'calgary-watermain-agent']);
});

test('private projects have no GitHub link', async ({ page }) => {
  await page.goto('/');
  for (const id of ['water-temp-monitor', 'calgary-watermain-agent']) {
    await expect(card(page, id).locator('a[href*="github.com"]')).toHaveCount(0);
  }
});

test('minimal project has placeholder and no empty rows', async ({ page }) => {
  await page.goto('/');
  const c = card(page, 'zz-fixture-minimal');
  await expect(c.locator('.media-frame--empty')).toHaveCount(1);
  await expect(c.locator('.stat')).toHaveCount(0);
  await expect(c.locator('.project__stats')).toHaveCount(0);
  await expect(c.locator('.project__links')).toHaveCount(0);
});

test('images are optimised', async ({ page }) => {
  await page.goto('/');
  const img = card(page, 'boring-web-browser').locator('img').first();
  await expect(img).toHaveAttribute('src', /\.webp$/);
  await expect(img).toHaveAttribute('width', /\d+/);
  await expect(img).toHaveAttribute('height', /\d+/);
});

test('clip autoplays muted normally', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __plays: number }).__plays = 0;
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { __plays: number }).__plays++;
      return orig.call(this);
    };
  });
  await page.goto('/');
  const video = card(page, 'zz-fixture-clip').locator('video');
  for (const attr of ['muted', 'loop', 'playsinline', 'poster', 'autoplay']) {
    await expect(video).toHaveAttribute(attr, /.*/);
  }
  expect(await page.evaluate(() => (window as unknown as { __plays: number }).__plays)).toBeGreaterThan(0);
});

test('clip does not autoplay with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await stubMedia(page);
  await page.addInitScript(() => {
    (window as unknown as { __plays: number }).__plays = 0;
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { __plays: number }).__plays++;
      return orig.call(this);
    };
  });
  await page.goto('/');
  await page.waitForTimeout(1000);
  const video = card(page, 'zz-fixture-clip').locator('video');
  await expect(video).not.toHaveAttribute('autoplay', /.*/);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  expect(await page.evaluate(() => (window as unknown as { __plays: number }).__plays)).toBe(0);
  await context.close();
});

test('media visible without JS', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(card(page, 'boring-web-browser').locator('img').first()).toBeVisible();
  await expect(card(page, 'zz-fixture-clip').locator('video')).toBeVisible();
  await context.close();
});

test('no horizontal scroll with projects', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await stubMedia(page);
  await page.goto('/');
  await expect(card(page, 'zz-fixture-all-media')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await context.close();
});
