import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '경북대학교 80주년 대동제' })).toBeVisible();
});
