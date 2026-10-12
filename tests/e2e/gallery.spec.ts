import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const clip = readFileSync('tests/fixtures/clip.mp4');
const poster = readFileSync('tests/fixtures/poster.jpg');

test.beforeEach(async ({ page }) => {
  await page.route('**/media/fixture/clip.mp4', (r) => r.fulfill({ body: clip, contentType: 'video/mp4' }));
  await page.route('**/media/fixture/poster.jpg', (r) => r.fulfill({ body: poster, contentType: 'image/jpeg' }));
  await page.route('**://i.ytimg.com/**', (r) => r.fulfill({ body: poster, contentType: 'image/jpeg' }));
  await page.route('**://www.youtube-nocookie.com/**', (r) => r.fulfill({ body: '<html></html>', contentType: 'text/html' }));
});

const opener = (page: Page, id: string) => page.locator(`article.project#${id} [data-gallery]`);
const counter = (page: Page) => page.locator('dialog[open] .gallery__counter');

test('opens at clicked item and steps with arrows', async ({ page }) => {
  await page.goto('/');
  await opener(page, 'boring-web-browser').click();
  await expect(page.locator('dialog[open]')).toBeVisible();
  await expect(counter(page)).toHaveText('1 / 5');
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('2 / 5');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(counter(page)).toHaveText('5 / 5');
});

test('Escape closes and returns focus', async ({ page }) => {
  await page.goto('/');
  const btn = opener(page, 'boring-web-browser');
  await btn.click();
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(btn).toBeFocused();
});

test('swipe navigates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  await page.goto('/');
  await opener(page, 'boring-web-browser').click();
  await expect(counter(page)).toHaveText('1 / 5');
  await page.evaluate(() => {
    const dlg = document.querySelector('dialog[open]')!;
    const touch = (x: number) => new Touch({ identifier: 1, target: dlg, clientX: x, clientY: 200 });
    dlg.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, changedTouches: [touch(250)], touches: [touch(250)] }));
    dlg.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [touch(170)] }));
  });
  await expect(counter(page)).toHaveText('2 / 5');
});

test('YouTube iframe only after click', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  await opener(page, 'zz-fixture-all-media').click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('3 / 3');
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  await page.getByRole('button', { name: /play video/i }).click();
  const frame = page.locator('dialog[open] iframe');
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
});

test('closing stops video and removes the YouTube iframe', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __plays: number; __pauses: number };
    w.__plays = 0;
    w.__pauses = 0;
    const play = HTMLMediaElement.prototype.play;
    const pause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function () {
      w.__plays++;
      return play.call(this);
    };
    HTMLMediaElement.prototype.pause = function () {
      w.__pauses++;
      return pause.call(this);
    };
  });
  await page.goto('/');
  await opener(page, 'zz-fixture-all-media').click();
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('2 / 3');
  // wait until the clip has really started, so closing has something to stop
  await expect.poll(() => page.evaluate(() => (window as unknown as { __plays: number }).__plays)).toBeGreaterThan(0);
  const pausesBefore = await page.evaluate(() => (window as unknown as { __pauses: number }).__pauses);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  const allPaused = await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => v.closest('dialog')).every((v) => v.paused));
  expect(allPaused).toBe(true);
  expect(await page.evaluate(() => (window as unknown as { __pauses: number }).__pauses)).toBeGreaterThan(pausesBefore);
  const playsAfterClose = await page.evaluate(() => (window as unknown as { __plays: number }).__plays);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __plays: number }).__plays)).toBe(playsAfterClose); // nothing restarts it

  await opener(page, 'zz-fixture-all-media').click();
  await page.keyboard.press('ArrowLeft');
  await page.getByRole('button', { name: /play video/i }).click();
  await expect(page.locator('dialog iframe')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog iframe')).toHaveCount(0);
});

test('stage keeps its size when stepping between photos', async ({ page }) => {
  await page.goto('/');
  await opener(page, 'boring-web-browser').click();
  const stage = page.locator('dialog[open] .gallery__stage');
  await expect(counter(page)).toHaveText('1 / 5');
  await page.waitForTimeout(400); // let the open transition finish
  const before = await stage.boundingBox();
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('2 / 5');
  await page.waitForTimeout(400);
  expect(await stage.boundingBox()).toEqual(before);
});

test('only one slide remains after rapid stepping', async ({ page }) => {
  await page.goto('/');
  await opener(page, 'boring-web-browser').click();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('4 / 5');
  await expect(page.locator('dialog[open] .gallery__slide')).toHaveCount(1);
  await expect(page.locator('dialog[open] .gallery__slide.is-active img')).toHaveAttribute('alt', /protection page/i);
});

test('neighbouring photos are requested before they are shown', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => r.url().endsWith('.webp') && urls.push(r.url()));
  await page.goto('/');
  await opener(page, 'boring-web-browser').click();
  await expect(counter(page)).toHaveText('1 / 5');
  await page.waitForTimeout(500);
  const slideSrcs = await page.evaluate(() =>
    JSON.parse(document.querySelector('script[data-gallery-items="boring-web-browser"]')!.textContent!).map((i: { src: string }) => i.src),
  );
  // photos 2 and 5 (next and previous of the first) were fetched without being displayed
  for (const src of [slideSrcs[1], slideSrcs[4]]) expect(urls.some((u) => u.endsWith(src))).toBe(true);
  expect(urls.some((u) => u.endsWith(slideSrcs[3]))).toBe(false);
});

test('reduced motion: no leftover slides and no transition', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await opener(page, 'boring-web-browser').click();
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('2 / 5');
  await expect(page.locator('dialog[open] .gallery__slide')).toHaveCount(1);
  const dur = await page.locator('dialog[open]').evaluate((d) => getComputedStyle(d).transitionDuration);
  expect(dur).toMatch(/^0s/);
  await context.close();
});

test('keyboard stepping swaps instantly; the Next button still crossfades', async ({ page }) => {
  await page.goto('/');
  await opener(page, 'boring-web-browser').click();
  await expect(counter(page)).toHaveText('1 / 5');
  await page.waitForTimeout(400); // let the open transition and first slide settle
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('2 / 5');
  // no fade-out overlap: the old slide is gone as soon as the new one is ready (animated exit is ~260 ms)
  await expect(page.locator('dialog[open] .gallery__slide')).toHaveCount(1, { timeout: 150 });
  await page.locator('dialog[open] .gallery__next').click();
  await expect(counter(page)).toHaveText('3 / 5');
  await expect(page.locator('dialog[open] .gallery__slide')).toHaveCount(2, { timeout: 150 });
});
