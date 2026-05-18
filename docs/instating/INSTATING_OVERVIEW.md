# 인스타팅 구현 개요

## 서비스 개요

인스타팅(Instagram + Ting)은 축제 참여자끼리 인스타그램 ID를 기반으로 매칭해주는 소셜 서비스다.

사용자는 성별과 인스타그램 ID, 연락처를 입력해 신청하고, 운영진이 지정한 시간에 결과가 공개된다. 결과 조회 시 스크래치 카드 UX를 통해 매칭 상대를 확인한다.

## 페이지 구조

```
/instating         → 인트로 (소개, 카운트다운, 신청자 현황)
/instating/apply   → 신청 폼
/instating/result  → 결과 조회 폼
```

세 화면은 상단 탭 네비게이션(`TabNavigation`)을 공유하고 `<Outlet />`으로 렌더링된다. 탭 전환 시 Framer Motion의 `layoutId`를 활용한 슬라이딩 인디케이터가 적용된다.

탭 네비게이션은 `src/components/common/TabNavigation`의 공통 컴포넌트를 사용한다. `src/components/instating/TabNavigation`은 공통 컴포넌트에 인스타팅 탭 목록을 주입하는 래퍼다. 자세한 스펙은 [공통 컴포넌트 문서](../COMMON_COMPONENTS.md#tabnavigation)를 참고한다.

## 운영 상태 흐름

백엔드는 `registrationOpen`, `resultOpen`, `registrationDeadline`, `resultOpenAt` 네 필드로 현재 단계를 표현한다.

```
신청 전       registrationOpen: false / resultOpen: false / resultOpenAt: null
신청 중       registrationOpen: true  / registrationDeadline: 있음
결과 공개 전  registrationOpen: false / resultOpen: false  / resultOpenAt: 있음
결과 공개 후  registrationOpen: false / resultOpen: true
```

이 상태 조합을 기준으로 인트로 페이지의 카운트다운 라벨과 목표 시간이 결정된다.

```
신청 중       → '인스타팅 신청 마감까지'  + registrationDeadline
결과 공개 전  → '인스타팅 매칭 공개까지'  + resultOpenAt
그 외         → '결과를 확인하세요.'       + 카운트다운 없음
```

## 핵심 기능

### 인트로 뷰

**카운트다운 (`CountDownTimer`, `useTimeLeft`, `useCountdown`)**

tick 로직은 `useTimeLeft` 훅 하나로 관리한다. 1초마다 카운터를 증가시켜 리렌더를 유발하고, `getTimeLeft(deadline)`으로 매 렌더마다 남은 시간을 계산한다. 이 방식은 stale state 없이 항상 최신 값을 보장한다.

- `useTimeLeft(deadline)` — tick 담당, `TimeLeft | null` 반환
- `useCountdown(deadline)` — `useTimeLeft` 결과를 `"DD:HH:MM:SS"` 문자열로 포맷
- `CountDownTimer` — `useTimeLeft` 결과로 큰 숫자 UI 조립, 인트로 섹션에 사용
- `CountdownText` — `useCountdown`을 래핑한 인라인 텍스트용 컴포넌트 (`남은시간 DD:HH:MM:SS`), 신청·결과 조회 폼 버튼에 사용

`useCountdown`을 폼 컴포넌트에서 직접 호출하면 폼 전체가 1초마다 리렌더된다. `CountdownText`로 분리해 타이머 tick이 해당 컴포넌트에만 국한되도록 했다.

**신청자 현황 (`ApplicantsNumberSection`)**

`useMatchingStatus`에서 `malePendingCount`, `femalePendingCount`를 읽어 표시한다. 30초 폴링으로 갱신한다. 정밀한 실시간성이 필요하지 않아 SSE를 도입하지 않았다.

### 신청 폼 (`InstatingApplyView`)

`react-hook-form`으로 폼 상태를 관리한다. 성별, 인스타 ID, 연락처, 만 19세 이상 확인 체크박스를 입력받는다.

인스타 ID는 `^[a-zA-Z0-9_.]{1,30}$` 패턴으로 형식을 검증한다. 연락처는 `^01[0-9]{8,9}$` 패턴으로 검증한다. 결과 조회 폼도 동일한 규칙을 적용한다.

제출 성공 시 `InstatingApplySuccessModal`을 띄운다. 이 모달에는 입력한 정보 요약과 함께 결과 공개까지 남은 카운트다운이 표시된다.

`registrationOpen: false`이면 `fieldset disabled`로 모든 입력 필드를 비활성화하고, 버튼에 `CountdownText` 컴포넌트로 신청 시작까지 남은 시간을 표시한다. 목표 시간은 `useMatchingStatus`의 `registrationOpenAt` 필드를 사용한다.

`useQueryInvalidateAtDeadline(registrationOpenAt, isRegistrationOpen, queryKey)`을 호출해 deadline 도달 시점에 즉시 `matchings/status` 캐시를 무효화한다. 30초 폴링만 의존하면 deadline 이후 최대 30초간 버튼이 타이머 상태로 남는 문제를 방지한다.

에러 처리:

```
409 → AlertModal ('이미 참여하셨어요')
403 → 인라인 텍스트 ('현재 신청이 마감되었습니다.')
그 외 → 서버 메시지 그대로 표시
```

### 결과 조회 폼 (`InstatingResultView`)

인스타 ID와 연락처를 입력해 인증한다. 제출 성공 시 `InstatingResultModal`을 띄운다.

`resultOpen: false`이면 `fieldset disabled`로 모든 입력 필드를 비활성화하고, 버튼에 `useCountdown`으로 결과 공개까지 남은 시간을 표시한다. API 성공 응답 이후에도 `resultOpen: false`이면 "아직 결과 공개 전입니다." 인라인 메시지를 표시한다.

신청 폼과 동일하게 `useQueryInvalidateAtDeadline(resultOpenAt, isResultOpen, queryKey)`을 사용해 deadline 도달 즉시 캐시를 무효화한다.

제출 버튼 활성 여부는 `formState.isValid`를 사용한다. `useWatch`로 필드 값을 직접 구독하면 키 입력마다 전체 컴포넌트가 리렌더되므로, 유효성이 실제로 변할 때만 리렌더를 유발하는 `formState.isValid`로 대체했다. 필드별 유효성 검사 실패 메시지는 `formState.errors`로 표시한다.

**페이지 진입 모션**: 두 폼 뷰 모두 헤더 → fieldset → 버튼 순서로 `fadeUpVariant`를 staggered 적용한다(0s → 0.1s → 0.15s 딜레이). 신청 폼은 하단 notice까지 0.2s 딜레이로 추가된다. 인트로 뷰 섹션들과 동일한 패턴이다.

에러 처리:

```
401 → AlertModal ('신청 후 결과확인 해주세요!')  ← 인터셉터 전역 처리 대상 아님
404 → AlertModal ('신청 정보를 찾을 수 없어요')
그 외 → 서버 메시지 그대로 표시
```

### 결과 모달과 스크래치 카드 (`InstatingResultModal`)

결과 모달은 `createPortal`로 `document.body`에 마운트된다. Framer Motion으로 오른쪽에서 슬라이드 인 애니메이션 처리된다.

매칭 실패인 경우 `MatchFailureCard`를 바로 표시한다. 매칭 성공인 경우 스크래치 카드를 먼저 보여주고, 긁으면 `MatchSuccessCard`로 전환된다.

모달 내부 단계(Phase):

```
idle       → 스크래치 전 대기 상태
scratching → 긁기 시작 후 아직 공개 임계값 미달
success    → 충분히 긁어서 공개됨
failure    → 매칭 실패
```

Phase에 따라 부제목 텍스트와 배경색이 달라진다.

**스크래치 카드 (`useInstatingScratchCanvas`)**

Canvas API와 `globalCompositeOperation: 'destination-out'`을 이용해 긁기 효과를 구현했다.

주요 파라미터:

```ts
BRUSH_RADIUS = 28; // 긁기 브러시 크기
REVEAL_THRESHOLD = 0.55; // 55% 이상 긁으면 자동 공개
```

힌트 애니메이션으로 하트 경로를 따라 자동으로 긁히는 모션을 보여준다. 사용자가 직접 긁기 시작하면 힌트 애니메이션이 멈춘다. 힌트는 trace → pause → fill 세 phase를 반복한다.

공개 여부 판정은 Canvas의 픽셀 투명도를 샘플링해 계산한다. 전체 픽셀을 순회하면 비용이 크므로 64px 간격으로 샘플링한다.

DPR(Device Pixel Ratio)을 반영해 레티나 디스플레이에서도 선명하게 렌더링된다. `ResizeObserver`로 캔버스 크기 변화를 감지해 재초기화한다.

**블러 하트 렌더링**

오버레이 캔버스에 반투명 핑크 블러 하트를 그린다. `fillText('♥')` 대신 파라메트릭 공식(`x = 16sin³t`, `y = 13cost − 5cos2t − 2cos3t − cos4t`)으로 closed path를 직접 작성한다. 폰트 렌더링 차이 없이 브라우저·OS 무관하게 동일한 형태가 보장된다.

블러는 `ctx.filter`(Safari < 18 미지원) 대신 `shadowBlur`로 통일해 크로스 브라우저 일관성을 확보했다. `shadowBlur` 단독으로는 블러 강도가 약하므로 `fill()`을 3회 반복해 보강한다.

하단 첨점은 `quadraticCurveTo`로 대체해 둥글게 처리했다. `t = π ± 0.2π` 구간만 베지어로 교체하고 나머지는 원래 공식을 유지해 하트 전체 형태를 보존한다. y축은 `scaleY = scale * 1.2`를 적용해 세로를 20% 늘렸다.

**스크래치 UX 인터랙션**

긁는 동안 카드가 살짝 흔들리는 wobble 애니메이션을 Framer Motion `useAnimate`로 구현했다.

- `onPointerDown`: `rotate: [-0.8, 0.8]` 무한 반복 wobble 시작 (duration 0.12s)
- `onPointerUp`: wobble 중지, `rotate: 0`으로 복귀

긁는 동안 커서 위치에서 하트 파티클이 튀어오른다. `useHeartParticles` 훅이 별도 캔버스에 파티클을 렌더링한다. `onPointerMove`에서 40ms 스로틀로 `emit(x, y)`를 호출해 프레임당 최대 3개의 하트를 생성한다. 파티클 캔버스는 `ScratchCard` 내부의 overlay canvas 위에 `pointer-events-none`으로 배치된다.

RAF 루프는 파티클이 있을 때만 실행된다(`isRunningRef`로 상태 추적). `emit`·`burst` 호출 시 루프를 시작하고, 모든 파티클의 life가 0이 되면 루프를 멈춘다.

|                           | 기존                                           | 개선 후                                       |
| ------------------------- | ---------------------------------------------- | --------------------------------------------- |
| RAF 실행 시점             | 훅 마운트 시 즉시 시작, 언마운트까지 상시 실행 | `emit` 호출 시 시작, 파티클 소진 시 자동 중단 |
| 유휴 상태(긁기 전·후) CPU | 매 프레임 `filter` + `clearRect` 실행          | RAF 자체가 멈춰 있어 비용 없음                |
| 파티클 없을 때 캔버스     | 매 프레임 `clearRect` 호출                     | 루프 종료 직전 1회만 `clearRect` 후 정지      |

클립보드 복사 버튼의 `setTimeout` ID를 `useRef`로 보관해 모달 unmount 시 `clearTimeout`으로 정리한다.

|              | 기존                                                                                         | 개선 후                                               |
| ------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| unmount 시   | 타이머가 남아 unmount된 컴포넌트에 `setState` 호출                                           | cleanup effect에서 `clearTimeout`으로 타이머 취소     |
| 연속 복사 시 | 이전 타이머와 새 타이머가 동시에 존재해 `copied` 상태가 예기치 않게 `false`로 전환될 수 있음 | 새 타이머 등록 전 이전 타이머를 취소해 상태 충돌 방지 |

스크래치 임계값 도달(공개) 시 `MatchSuccessCard`가 `opacity: 0 → 1`, `scale: 0.88 → 1`, `y: 16 → 0` 스프링 애니메이션으로 등장한다.

**결과 카드 캐릭터 모션 (`MatchSuccessCard`, `MatchFailureCard`)**

두 카드 모두 호반우 이미지에 Framer Motion 루프 애니메이션을 적용해 생동감을 준다.

- `MatchSuccessCard`: `rotate: [-5, 7]` 무한 반복 (duration 0.45s, mirror) — 좌우 앙탈 느낌
- `MatchFailureCard`: `rotate: [-4, 4]` 무한 반복 (duration 0.45s, mirror) — 좌우 흔들림

**결과 카드 (`MatchSuccessCard`)**

매칭 상대의 인스타그램 ID 표시, 클립보드 복사, 인스타그램 프로필 딥링크(`https://www.instagram.com/:id`)를 제공한다.

## 데이터 페칭 구조

| 위치                         | 방식                                             | 이유                                  |
| ---------------------------- | ------------------------------------------------ | ------------------------------------- |
| 인트로 (`useMatchingStatus`) | `useQuery` + 30초 폴링                           | 주기적 갱신이 필요한 읽기 전용 데이터 |
| 신청 폼 / 결과 조회 폼       | `async/await` 직접 호출                          | 버튼 클릭 1회성 mutation, 캐시 불필요 |
| 관리자 페이지                | `useQuery` + `useMutation` + `invalidateQueries` | mutation 이후 목록 즉시 갱신 필요     |

## API 모듈 구조 (`src/apis/modules/matching.ts`)

사용자 API와 관리자 API를 하나의 모듈로 관리한다.

**사용자**

```ts
registerMatching(payload); // 신청
getMatchingResult(payload); // 결과 조회 (instagramId + phoneNumber 인증)
getMatchingStatus(); // 운영 상태, 신청자 수, 카운트다운 시간 조회
```

**관리자**

```ts
getStatus();
updateStatus(payload); // OPEN / PAUSED 전환
runJob(); // 전체 날짜 매칭 실행
runJobForDay(festivalDay); // 특정 날짜 매칭 실행
listParticipants(params); // 참여자 목록 (성별/상태/날짜 필터)
deleteParticipant(participantId);
resetParticipant(participantId);
getApplicantsCount();
```

## 관리자 콘솔

두 페이지로 구성된다.

**MatchingOverviewPage**

운영 상태 OPEN / PAUSED 토글, 날짜별 또는 전체 매칭 잡 수동 실행, 신청자 현황 요약을 제공한다.

**MatchingParticipantsPage**

참여자 목록을 성별, 매칭 상태, 날짜, 검색어로 필터링하고 개별 삭제 및 초기화를 지원한다.

## 에러 처리 구조

`http.ts` 인터셉터가 모든 axios 에러를 `ApiClientError`로 변환한다. 컴포넌트는 `status` 코드별로 메시지를 분기하고, 그 외에는 서버가 내려준 `err.message`를 그대로 표시한다.

401 / 403 응답은 인터셉터에서 `unauthorizedHandler`를 호출해 전역으로 처리한다. 단, `unauthorizedHandler`는 `/console`, `/booth/manage` 경로에서만 리디렉션을 수행한다. 인스타팅 사용자 페이지에서 발생하는 401은 전역 처리 대상이 아니므로 각 컴포넌트에서 `AlertModal`로 별도 처리한다.

공통 에러 모달은 `AlertModal` 컴포넌트로 통일했다. title과 description을 props로 주입받아 `createPortal`로 렌더링된다.

### ErrorBoundary 적용

`InstatingPage`에서 `<Outlet />`을 `ErrorBoundary`로 감싼다. `TabNavigation`은 경계 바깥에 두어 렌더링 에러가 발생해도 탭은 유지된다.

```
InstatingPage
├── TabNavigation          ← 에러와 무관하게 유지
└── ErrorBoundary
    └── Outlet             ← 렌더링 에러 발생 시 InstatingErrorFallback 표시
```

`ErrorBoundary`는 예상치 못한 JS 런타임 에러(null 접근, 타입 에러 등)를 최후 방어선으로 잡는다. API 에러는 각 컴포넌트에서 별도 처리한다.

### 섹션 레벨 Fallback (MatchingStatusFallback)

`CountDownSection`과 `ApplicantsNumberSection`은 `useMatchingStatus` API가 실패(`isError`)하면 각자 `MatchingStatusFallback`을 렌더한다. `InstatingContent`(정적 콘텐츠)는 API와 무관하므로 영향 없이 렌더된다.

**isLoading 처리를 별도로 두지 않은 이유**: `staleTime: 10s` 설정으로 재방문 시 캐시에서 즉시 반환되고, 첫 로드 시만 짧게(수백 ms) 보인다. 이 시간 동안 기본값(`00:00:00:00`, `0명`)이 표시되는 게 스켈레톤이나 별도 로딩 UI보다 자연스럽다고 판단했다.

**섹션 레벨을 선택한 이유**: API 실패 시에도 `InstatingContent`(스텝 카드, 신청 버튼)는 의미 있는 정보를 제공한다. 페이지 전체를 대체하면 실질적으로 유효한 콘텐츠까지 가려지므로 섹션 단위로 처리한다.

**Apply/Result 뷰에서 별도 처리가 불필요한 이유**: `isRegistrationOpen`과 `isResultOpen` 기본값이 `true`라서 API 실패 시 폼이 활성화된 상태로 렌더된다. 잘못된 시간에 제출해도 서버에서 거부(403, 결과 미공개)하므로 클라이언트 추가 처리가 불필요하다.

## 보안 및 어뷰징 방지

### 적용한 것

**인스타 ID 형식 검증**: `^[a-zA-Z0-9_.]{1,30}$` 패턴으로 실제 Instagram ID 규칙에 맞지 않는 값을 사전 차단한다. 연락처는 `^01[0-9]{8,9}$`로 검증한다.

### 검토 후 적용하지 않은 것

**reCAPTCHA**: 봇·매크로 판별에 가장 효과적이나 서버의 토큰 검증 엔드포인트가 필요하다. 백엔드 연동 없이 프론트 단독으로는 의미가 없어 보류했다.

**중복 신청 차단**: 서버가 이미 409로 처리한다. 클라이언트 중복 방지는 서버 거부 전 UX 개선에 불과하므로 추가하지 않았다.

**선착순 공정성 보장**: 요청이 서버에 도달하는 순서는 네트워크와 서버 스케줄러가 결정한다. 프론트에서 개입할 수 있는 영역이 아니다.

**IP rate limiting**: 서버·인프라 영역이다. 프론트에서 구현해도 우회가 trivial하다.

> 매크로·어뷰징 방지의 실질적인 효과는 백엔드(rate limiting, CAPTCHA 검증, 기기 핑거프린팅)에서 나온다. 프론트는 정상 사용자의 입력 실수를 줄이는 수준으로 역할을 한정했다.

## 접근성 개선

### 폼 레이블 연결 (`InstatingApplyView`, `InstatingResultView`)

기존 `<label>`이 `htmlFor` 없이 단독 사용되어 스크린리더가 입력 필드와 레이블을 연결하지 못했다. 인스타 ID와 연락처 입력 필드에 `id`를 부여하고, 레이블에 `htmlFor`를 추가해 연결했다.

### 모달 시맨틱 (`AlertModal`, `InstatingApplySuccessModal`, `InstatingResultModal`)

세 모달 모두 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`를 추가했다. `aria-labelledby`는 각 모달의 제목 요소(`h1`/`h2`) `id`를 참조한다. `InstatingApplySuccessModal`의 닫기 버튼(아이콘만)에도 `aria-label="닫기"`, 아이콘에 `aria-hidden="true"`를 추가했다.

### 장식 이미지 alt 처리 (`MatchSuccessCard`, `MatchFailureCard`)

카드 내 호반우 이미지는 카드 텍스트가 결과를 충분히 설명하므로 장식 이미지로 처리(`alt=""`)했다.

## 이미지 최적화

모든 이미지 에셋을 WebP로 변환했다. SVG는 내부에 base64 래스터 이미지가 임베드된 구조라 sharp(librsvg 내장)로 WebP 변환이 가능하다.

| 대상                   | 변환 전 | 변환 후 | 감소율 |
| ---------------------- | ------- | ------- | ------ |
| step_bg × 4 (PNG)      | ~1.9MB  | ~18KB   | ~99%   |
| step_illust × 4 (SVG)  | ~13.2MB | ~117KB  | ~99%   |
| Hobanwoo × 3 (SVG/PNG) | ~5.2MB  | ~78KB   | ~98%   |

SVG 일러스트는 `width: 800px`(2x 모바일), Hobanwoo는 `width: 400px`(2x 렌더 사이즈)로 래스터라이즈했다.

아이콘 SVG(`closeIcon`, `copyIcon`, `forwardArrowIcon`)는 lucide-react 컴포넌트로 교체했다. `forwardArrowIcon`은 `OutlineButton`의 기존 `showArrow` prop으로 대체했다.

## 파일 구조

```
src/
├── apis/modules/matching.ts
├── hooks/
│   ├── useBodyScrollLock.ts     ← 모달 마운트 시 body 스크롤 잠금 (언마운트 시 복원)
│   └── instating/
│       ├── useMatchingStatus.ts
│       ├── useCountdown.ts                  ← useTimeLeft, useCountdown, getTimeLeft
│       ├── useInstatingScratchCanvas.ts
│       ├── useHeartParticles.ts             ← 스크래치 시 하트 파티클 캔버스 애니메이션
│       └── useQueryInvalidateAtDeadline.ts  ← deadline 도달 시 즉시 queryKey 무효화
├── pages/
│   ├── InstatingPage.tsx        ← ErrorBoundary로 Outlet 감쌈, bg-white 적용
│   └── console/
│       ├── MatchingOverviewPage.tsx
│       └── MatchingParticipantsPage.tsx
├── components/common/            ← 공통 컴포넌트 (docs/COMMON_COMPONENTS.md 참고)
│   ├── TabNavigation.tsx         ← 탭 목록을 props로 받는 공통 탭 네비게이션
│   ├── OutlineButton.tsx         ← variant 기반 테두리 버튼 (dark/default/red/glass)
│   └── ProcessCard.tsx           ← 배경+일러스트 스텝 카드
├── components/error/
│   ├── ErrorBoundary.tsx         ← 렌더링 에러 캐치, fallback prop 지원
│   └── ErrorFallback.tsx         ← 네트워크/서비스 에러 기본 fallback UI
└── components/instating/
    ├── AlertModal.tsx            ← 공통 에러 모달 (useBodyScrollLock 적용)
    ├── CountdownText.tsx         ← 폼 버튼 카운트다운 텍스트 (리렌더 격리)
    ├── InstatingErrorFallback.tsx ← ErrorBoundary fallback (탭 하단 영역 전체)
    ├── MatchingStatusFallback.tsx ← useMatchingStatus isError 시 섹션 fallback
    ├── TabNavigation.tsx         ← 공통 TabNavigation에 인스타팅 탭을 주입하는 래퍼
    ├── intro/
    │   ├── ApplicantsNumberSection.tsx
    │   ├── CountDownSection.tsx
    │   ├── CountDownTimer.tsx
    │   └── InstatingContent.tsx  ← OutlineButton, ProcessCard를 공통 컴포넌트에서 import
    ├── result/
    │   ├── InstatingApplySuccessModal.tsx ← 신청 완료 모달 (useBodyScrollLock 적용)
    │   ├── InstatingResultModal.tsx       ← 결과 조회 모달 (useBodyScrollLock 적용)
    │   ├── MatchFailureCard.tsx           ← 매칭 실패 카드
    │   ├── MatchSuccessCard.tsx           ← 매칭 성공 카드 (인스타 ID + 프로필 링크)
    │   └── ScratchCard.tsx
    └── views/
        ├── InstatingApplyView.tsx
        ├── InstatingIntroView.tsx
        └── InstatingResultView.tsx
```
