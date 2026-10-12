import { expect, test } from '@playwright/test';

test('contact details are real', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('#contact');
  await expect(contact.locator('a[href="mailto:jmill004@mtroyal.ca"]').first()).toBeVisible();
  await expect(contact.locator('a[href="tel:+14033708406"]')).toBeVisible();
  await expect(contact.locator('a[href="https://www.linkedin.com/in/joseph-mills317"]')).toBeVisible();
  await expect(contact.locator('a[href="https://github.com/JD-D3V"]')).toBeVisible();
});

test('real résumé is served', async ({ request }) => {
  const res = await request.get('/resume.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('pdf');
  expect((await res.body()).length).toBeGreaterThan(50_000);
});

test('experience section lists the three roles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav a[href="#experience"]')).toHaveCount(1);
  const roles = await page.locator('#experience h3').allTextContents();
  expect(roles).toEqual([
    'Software Engineer and Machine Learning Research Assistant',
    'Data Science Intern',
    'Jump Crew and Signage Team',
  ]);
});

test('education and skills come from the résumé', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about')).toContainText('Mount Royal University');
  await expect(page.locator('#about')).toContainText('NSERC');
  await expect(page.locator('#skills')).toContainText('Haskell');
  await expect(page.locator('#skills')).toContainText('TensorFlow Lite');
});

test('more projects are listed with links', async ({ page }) => {
  await page.goto('/');
  const more = page.locator('#more-projects');
  for (const t of ['Woofer', 'Classroom Finder', 'Music Browser', 'Multi-Threaded Web Server']) {
    await expect(more.getByRole('heading', { name: t })).toBeVisible();
  }
  await expect(more.locator('a[href="https://woofer-web-ashen.vercel.app"]')).toHaveCount(1);
});

test('beyond covers athletics and hackathons', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#beyond')).toContainText('Biathlon');
  await expect(page.locator('#beyond')).toContainText('Team Alberta');
});
