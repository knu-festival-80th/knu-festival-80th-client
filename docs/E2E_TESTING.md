# E2E 테스트 가이드

## 1) 목적

- 사용자 핵심 플로우를 브라우저 기준으로 검증합니다.
- PR 단계에서 주요 라우팅/화면 회귀를 빠르게 탐지합니다.

## 2) 현재 구성

- 도구: Playwright (`@playwright/test`)
- 설정 파일: `playwright.config.ts`
- 테스트 위치: `tests/e2e`
- 기본 해상도: iPhone 13
- 실행 서버: `pnpm exec vite --host 127.0.0.1 --port 4173 --strictPort`

## 3) 실행 방법

```bash
pnpm test:e2e:install
pnpm test:e2e
```

선택 실행:

```bash
pnpm test:e2e:ui
pnpm test:e2e:headed
pnpm test:e2e:report
```

## 4) 유지보수 규칙

- UI 텍스트보다 접근 가능한 role/label, id 기반 선택자를 우선 사용합니다.
- 회귀 위험이 큰 경로는 smoke 시나리오로 유지합니다.
- API 의존성이 생기면 `tests/e2e/fixtures`에 route mock을 추가합니다.
