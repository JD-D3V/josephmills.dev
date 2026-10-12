import { expect, test } from '@playwright/test';

const card = '#pipe-dreams';

test('Pipe Dreams links to its public repo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(`${card} a[href="https://github.com/Masroor73/pipe-dreams"]`)).toHaveCount(1);
});

test('Pipe Dreams shows an optimised screenshot first and has 6 gallery items', async ({ page }) => {
  await page.goto('/');
  const img = page.locator(`${card} .media-frame img`).first();
  await expect(img).toHaveAttribute('src', /\.webp$/);
  await page.locator(`${card} [data-gallery]`).click();
  await expect(page.locator('dialog[open] .gallery__counter')).toHaveText('1 / 6');
});

test('the demo video is the last gallery item and its files are served', async ({ page, request }) => {
  await page.goto('/');
  await page.locator(`${card} [data-gallery]`).click();
  await page.keyboard.press('ArrowLeft'); // wraps to the last item
  await expect(page.locator('dialog[open] .gallery__counter')).toHaveText('6 / 6');
  await expect(page.locator('dialog[open] video')).toHaveAttribute('src', '/media/pipe-dreams/demo.mp4');
  const video = await request.head('/media/pipe-dreams/demo.mp4');
  expect(video.status()).toBe(200);
  expect(Number(video.headers()['content-length'])).toBeLessThan(25 * 1024 * 1024);
  expect((await request.head('/media/pipe-dreams/poster.jpg')).status()).toBe(200);
});
