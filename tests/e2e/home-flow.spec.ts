import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '경북대학교 80주년 대동제' })).toBeVisible();
});

test('tavern map page renders and opens waiting modal', async ({ page }) => {
  await page.goto('/map');

  await expect(page.getByRole('heading', { name: '지도' })).toBeVisible();
  await expect(page.getByText('가고 싶은 주막의 아이콘을 클릭해보세요.')).toBeVisible();

  await page.getByRole('button', { name: 'E태원 클라쓰 지도 위치' }).click();
  await expect(page.getByRole('heading', { name: 'E태원 클라쓰' })).toBeVisible();

  await page.getByRole('button', { name: '대기 등록하기' }).first().click();
  await expect(page.getByRole('heading', { name: '웨이팅 등록 완료!' })).toBeVisible();
  await expect(page.getByText('예약자명')).toBeVisible();
});
