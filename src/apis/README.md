# API Layer Guide

## Environment Variables

- `VITE_API_BASE_URL`: API 서버 주소 (기본값 `http://localhost:8080`)
- `VITE_API_TIMEOUT_MS`: 요청 타임아웃(ms, 기본값 `10000`)

## Folder Structure

```txt
src/apis
├─ auth.ts              # localStorage Bearer 토큰 유틸 (현재 미사용, 호환용)
├─ http.ts              # axios 공통 인스턴스/인터셉터 (withCredentials)
├─ endpoints.ts         # API 경로 상수 (public / auth / super / booth)
├─ types.ts             # 공통 응답/에러 타입
├─ error.ts             # 공통 에러 변환 유틸
├─ utils.ts             # 공통 유틸 (omitUndefined, FormData)
├─ modules/             # 도메인별 API 모듈 (auth/booth/menu/waiting)
└─ index.ts             # 외부 export 진입점
```

## Authentication

- 관리자 인증은 **세션 쿠키(`JSESSIONID`)** 기반.
- axios 인스턴스에 `withCredentials: true`가 설정되어 있어 브라우저가 쿠키를 자동 보관·전송한다.
- `apis/auth.ts`의 localStorage Bearer 토큰 유틸은 **현재 사용하지 않는다**(이전 JWT 흐름 잔재). 향후 제거 예정.

## Response Handling Rule

- 백엔드 공통 응답 포맷: `{ success: boolean, data: T | null, error: { code, message } | null }`
- 클라이언트는 `ApiResponse<T>` 타입으로 모델링한다.
- 성공 케이스(`success === true`)는 `unwrapApiResponse(payload)`로 `data`를 꺼낸다.
- 실패 케이스(`success === false` 또는 `data === null`)는 `ApiClientError`를 throw한다.
  - HTTP 4xx/5xx 응답도 axios interceptor에서 동일한 `ApiClientError`로 변환된다.
  - `error.code`(서버 에러 코드, 예: `B001`)와 `error.message`(한국어 메시지)를 노출.
- 응답 본문이 없는 mutation(예: 호출/입장 처리)은 `unwrapVoidApiResponse(payload)`로 검사만 수행.
- 401 응답은 토큰 정리 + `setUnauthorizedHandler`로 등록된 핸들러를 호출한다(주로 `/admin/login` redirect).

## API 경로 규칙

- 공개: `/api/v1/**`
- 관리자: `/admin/v1/super/**` (슈퍼 전용), `/admin/v1/booth/**` (슈퍼+부스 운영진), `/admin/v1/auth/**` (로그인/로그아웃)
- 슈퍼 관리자는 booth 엔드포인트도 호출 가능(권한 위계: `SUPER_ADMIN` > `BOOTH_ADMIN`).

## Partial Update Rule (PATCH/PUT)

- 수정 API는 "변경된 필드만 전송" 정책.
- 모듈별 `update*` 함수는 `Partial` 타입을 사용하고 `omitUndefined`로 `undefined` 필드를 자동 제거.
- `null`은 백엔드에서 허용한 필드에 한해 "명시적 비움" 의도로 전송.

## Usage Example

```ts
import { ENDPOINTS, http, unwrapApiResponse, boothApi } from '@/apis';

// 공통 ENDPOINTS 직접 사용
const response = await http.get(ENDPOINTS.health);
const data = unwrapApiResponse(response.data);

// 도메인 모듈 사용 (권장)
const booths = await boothApi.listAdminBooths('likes');
```

## React Query Key Convention

- 부스 목록: `['admin', 'booths', { sort }]`
- 메뉴 목록: `['admin', 'booth', boothId, 'menus']`
- 대기열: `['admin', 'booth', boothId, 'waitings', { status }]`
- mutation 후 동일 prefix를 invalidate.
