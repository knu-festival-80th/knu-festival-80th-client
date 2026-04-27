import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '경북대학교 80주년 대동제' })).toBeVisible();
});

test('tavern map page renders and opens waiting modal', async ({ page }) => {
  await page.goto('/map');

  await expect(page.getByRole('heading', { name: '지도 및 주막 정보' })).toBeVisible();
  await expect(page.getByText('지도에서 모든 주막 리스트를 확인해요.')).toBeVisible();

  await page.getByRole('button', { name: '주막 목록' }).click();
  await expect(page.getByRole('heading', { name: '주막 목록' })).toBeVisible();
  await expect(page.getByRole('button', { name: '대기 적은 순' })).toBeVisible();

  await page.getByRole('button', { name: '대기 등록하기' }).first().click();
  await expect(page.getByRole('heading', { name: '웨이팅 등록 완료!' })).toBeVisible();
  await expect(page.getByText('예약자명')).toBeVisible();
});
