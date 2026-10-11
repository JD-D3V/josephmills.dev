import { expect, test } from '@playwright/test';

test('home page renders the name', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Joseph Mills');
  await expect(page).toHaveTitle(/Joseph Mills/);
});
