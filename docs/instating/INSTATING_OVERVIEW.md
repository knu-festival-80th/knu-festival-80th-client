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

**카운트다운 (`CountDownTimer`)**

1초 간격 `setInterval`로 `days / hours / minutes / seconds`를 계산한다. 카운트다운이 0에 도달하면 인터벌을 정리한다. `deadline`이 변경될 때마다 재시작된다.

**신청자 현황 (`ApplicantsNumberSection`)**

`useMatchingStatus`에서 `malePendingCount`, `femalePendingCount`를 읽어 표시한다. 30초 폴링으로 갱신한다. 정밀한 실시간성이 필요하지 않아 SSE를 도입하지 않았다.

### 신청 폼 (`InstatingApplyView`)

`react-hook-form`으로 폼 상태를 관리한다. 성별, 인스타 ID, 연락처, 만 19세 이상 확인 체크박스를 입력받는다.

제출 성공 시 `InstatingSuccessModal`을 띄운다. 이 모달에는 입력한 정보 요약과 함께 결과 공개까지 남은 카운트다운이 표시된다.

에러 처리:

```
409 → 이미 신청하셨습니다.
403 → 현재 신청이 마감되었습니다.
그 외 → 서버 메시지 그대로 표시
```

### 결과 조회 폼 (`InstatingResultView`)

인스타 ID와 연락처를 입력해 인증한다. 제출 성공 시 `InstatingResultModal`을 띄운다.

`resultOpen: false`이면 API 성공 응답 이후에도 "아직 결과 공개 전입니다." 메시지를 표시한다. 에러 처리:

```
404 → 신청 정보를 찾을 수 없습니다.
그 외 → 서버 메시지 그대로 표시
```

### 결과 모달과 스크래치 카드 (`InstatingResultModal`)

결과 모달은 `createPortal`로 `document.body`에 마운트된다. Framer Motion으로 오른쪽에서 슬라이드 인 애니메이션 처리된다.

매칭 실패인 경우 `FailureCard`를 바로 표시한다. 매칭 성공인 경우 스크래치 카드를 먼저 보여주고, 긁으면 `ResultCard`로 전환된다.

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

**결과 카드 (`ResultCard`)**

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

401 / 403 응답은 인터셉터에서 `unauthorizedHandler`를 호출해 전역으로 처리한다.

## 파일 구조

```
src/
├── apis/modules/matching.ts
├── hooks/instating/
│   ├── useMatchingStatus.ts
│   └── useInstatingScratchCanvas.ts
├── pages/
│   ├── InstatingPage.tsx
│   └── console/
│       ├── MatchingOverviewPage.tsx
│       └── MatchingParticipantsPage.tsx
└── components/instating/
    ├── TabNavigation.tsx
    ├── OutlineButton.tsx
    ├── intro/
    │   ├── ApplicantsNumberSection.tsx
    │   ├── CountDownSection.tsx
    │   ├── CountDownTimer.tsx
    │   ├── InstatingContent.tsx
    │   └── ProcessCard.tsx
    ├── result/
    │   ├── FailureCard.tsx
    │   ├── InstatingResultModal.tsx
    │   ├── InstatingSuccessModal.tsx
    │   ├── ResultCard.tsx
    │   └── ScratchCard.tsx
    └── views/
        ├── InstatingApplyView.tsx
        ├── InstatingIntroView.tsx
        └── InstatingResultView.tsx
```
