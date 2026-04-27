import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '경북대학교 80주년 대동제' })).toBeVisible();
});

test('tavern map page renders and opens waiting modal', async ({ page }) => {
  await page.goto('/map');

  await expect(page.getByRole('heading', { name: '지도 및 주막 정보' })).toBeVisible();
  await expect(page.getByText('지도에서 주막 위치를 확인하고 빠르게 예약해요')).toBeVisible();

  await page.getByRole('button', { name: '지도' }).click();
  await expect(page.getByRole('heading', { name: '지도' })).toBeVisible();
  await expect(page.getByText('가고 싶은 주막의 아이콘을 클릭해보세요.')).toBeVisible();

  await page.getByRole('button', { name: 'E태원 클라쓰 지도 위치' }).click();
  await expect(page.getByRole('heading', { name: 'E태원 클라쓰' })).toBeVisible();

  await page.getByRole('button', { name: '대기 등록하기' }).first().click();
  const waitingDialog = page.getByRole('dialog', { name: '대기 등록하기' });

  await expect(waitingDialog).toBeVisible();
  await expect(waitingDialog.getByText('예약 주막')).toBeVisible();
  await expect(waitingDialog.getByRole('button', { name: '대기 등록하기' })).toBeDisabled();

  await waitingDialog.getByPlaceholder('이름을 입력해주세요').fill('홍길동');
  await waitingDialog.getByPlaceholder('예약 인원을 입력해주세요 (숫자만)').fill('2');
  await waitingDialog.getByPlaceholder("번호를 입력해주세요 ('-' 없이 번호만)").fill('01012345678');
  await waitingDialog.getByRole('button', { name: '대기 등록하기' }).click();

  await expect(page.getByRole('heading', { name: '웨이팅 등록 완료!' })).toBeVisible();
  await expect(page.getByText('예약자명')).toBeVisible();
  await expect(page.getByText('01012345678')).toBeVisible();
});

test('reservation lookup page renders input form', async ({ page }) => {
  await page.goto('/map');

  await page.getByRole('button', { name: '예약 조회' }).click();
  await expect(page.getByRole('heading', { name: '예약 조회' })).toBeVisible();
  await expect(page.getByPlaceholder('이름을 입력해주세요')).toBeVisible();
  await expect(page.getByPlaceholder("번호를 입력해주세요 ('-' 없이 번호만)")).toBeVisible();
  await expect(page.getByRole('button', { name: '조회하기' })).toBeDisabled();

  await page.getByPlaceholder('이름을 입력해주세요').fill('홍길동');
  await page.getByPlaceholder("번호를 입력해주세요 ('-' 없이 번호만)").fill('01012345678');
  await page.getByRole('button', { name: '조회하기' }).click();

  await expect(page.getByRole('heading', { name: '예약 조회 결과' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Start-up/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /컴스토랑/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /E태원 클라쓰/ })).toBeVisible();
  await expect(page.getByText('주막은 총 3곳까지만 예약 가능합니다.')).toBeVisible();

  await page.getByRole('button', { name: /Start-up/ }).click();

  const reservationDialog = page.getByRole('dialog', { name: '예약 조회' });

  await expect(reservationDialog).toBeVisible();
  await expect(reservationDialog.getByRole('heading', { name: 'Start-up' })).toBeVisible();
  await expect(reservationDialog.getByText('번째로 대기 중')).toBeVisible();
  await expect(reservationDialog.getByText('01012345678')).toBeVisible();

  await reservationDialog.getByRole('button', { name: '예약 취소하기' }).click();
  await expect(page.getByRole('button', { name: /Start-up/ })).toHaveCount(0);
});

test('tavern list card opens detail view', async ({ page }) => {
  await page.goto('/map');

  await page.getByRole('button', { name: '주막 목록' }).click();
  await page
    .getByRole('button', { name: /Start-up/ })
    .first()
    .click();

  await expect(page.getByText('떡볶이와 튀김, 간단한 안주를 빠르게 즐길 수 있어요.')).toBeVisible();
  await expect(page.getByAltText('Start-up 메뉴 임시 이미지')).toBeVisible();
  await expect(page.getByRole('heading', { name: '위치' })).toBeVisible();
});
