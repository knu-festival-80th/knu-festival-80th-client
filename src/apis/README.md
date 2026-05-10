# API Layer Guide

## Environment Variables

- `VITE_API_BASE_URL`: 백엔드 호출 베이스
  - dev: `http://localhost:8080`
  - prod: `https://chcse.knu.ac.kr/festival/api` (학교 ingress 가 `/festival/api` 를 strip 후 백엔드 root 로 전달)
- `VITE_API_TIMEOUT_MS`: 요청 타임아웃(ms, 기본 `10000`)

## Path Convention

- 모든 endpoint path 는 **root(`/`) 기준** 으로 작성한다 (예: `/booths`, `/admin/booths`).
- 환경별 prefix(`/festival/api` 등)는 `VITE_API_BASE_URL` 한 곳에서만 처리한다.
- 그 결과 같은 endpoints.ts 정의가 dev/prod 모두에서 그대로 동작한다.

## Folder Structure

```txt
src/apis
├─ http.ts              # axios 공통 인스턴스/인터셉터 (withCredentials)
├─ endpoints.ts         # API 경로 상수 (auth / booths / waitings / admin)
├─ types.ts             # 공통 응답/에러 타입
├─ error.ts             # 공통 에러 변환 유틸
├─ utils.ts             # 공통 유틸 (omitUndefined, FormData)
├─ modules/             # 도메인별 API 모듈 (auth/booth/menu/waiting)
└─ index.ts             # 외부 export 진입점
```

## Authentication

- 관리자 인증은 **세션 쿠키(`JSESSIONID`)** 기반.
- axios 인스턴스에 `withCredentials: true` — 브라우저가 자동으로 쿠키 보관·전송.

## Response Handling

- 백엔드 공통 응답: `{ success: boolean, data: T | null, error: { code, message } | null }`
- `unwrapApiResponse(payload)` → 성공 시 `data` 반환, 실패 시 `ApiClientError` throw.
- `unwrapVoidApiResponse(payload)` → 응답 본문이 없는 mutation 검사 (호출/입장 처리 등).
- `ApiClientError.code` 로 서버 에러 코드(`B001` 등) 분기 가능.
- 401 응답은 axios interceptor 가 `setUnauthorizedHandler` 콜백을 호출 (현재 `/admin/login` redirect 등록).

## API 그룹

- 공개 (인증 불필요): `/booths/**`, `/waitings/**`
- 인증: `/auth/login` (permitAll), `/auth/logout` (인증 필요)
- 관리자: `/admin/**` (세션 쿠키 필요)
  - 슈퍼 전용 (`SUPER_ADMIN`): POST `/admin/booths`, DELETE `/admin/booths/{id}`, PATCH `/admin/booths/{id}/password`
  - 슈퍼+부스 운영진 (`SUPER_ADMIN | BOOTH_ADMIN`): 그 외 `/admin/**`
  - 권한은 백엔드 SecurityConfig 에서 HTTP 메서드+path 조합으로 분기되며, 클라이언트는 단일 prefix 만 호출.

## Partial Update Rule (PATCH/PUT)

- "변경된 필드만 전송" 정책. `Partial` 타입 + `omitUndefined` 로 `undefined` 제거.
- `null` 은 백엔드가 명시적으로 허용한 필드에 한해 "비움" 의도로 전송.

## Usage Example

```ts
import { ENDPOINTS, http, unwrapApiResponse, boothApi } from '@/apis';

// 직접 호출
const response = await http.get(ENDPOINTS.booths.list);
const booths = unwrapApiResponse(response.data);

// 모듈 사용 (권장)
const adminBooths = await boothApi.listAdminBooths('likes');
```

## React Query Key Convention

- 부스 목록: `['admin', 'booths', { sort }]`
- 메뉴 목록: `['admin', 'booth', boothId, 'menus']`
- 대기열: `['admin', 'booth', boothId, 'waitings', { status }]`
- mutation 후 동일 prefix 를 invalidate.
