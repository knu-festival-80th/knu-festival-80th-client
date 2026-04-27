import { expect, test } from '@playwright/test';

test('root redirects to guestbook', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/guestbook$/);
  await expect(page.getByRole('heading', { name: '80주년 롤링페이퍼' })).toBeVisible();
});

test('guestbook page renders', async ({ page }) => {
  await page.goto('/guestbook');

  await expect(page.getByRole('heading', { name: '80주년 롤링페이퍼' })).toBeVisible();
  await expect(page.getByText('포스트잇 100 / 100')).toBeVisible();
  await expect(page.getByText('16%')).toBeVisible();
  await page.getByRole('button', { name: '확대' }).click();
  await expect(page.getByText('28%')).toBeVisible();
  await expect(page.getByRole('button', { name: '롤링페이퍼에 붙이기' })).toBeDisabled();
});

test('guestbook supports direct note placement', async ({ page }) => {
  await page.goto('/guestbook');

  await page.getByLabel('닉네임').fill('테스터');
  await page.getByLabel('메시지').fill('직접 배치 테스트');
  await page.getByRole('button', { name: '롤링페이퍼에 붙이기' }).click();

  await expect(page.getByText('배치 가능').first()).toBeVisible();
  await expect(page.getByRole('button', { name: '이 위치에 붙이기' })).toBeEnabled();

  await page.getByRole('button', { name: '이 위치에 붙이기' }).click();

  await expect(page.getByText('방금 작성')).toBeVisible();
  await expect(page.getByText('직접 배치 테스트')).toBeVisible();
});
