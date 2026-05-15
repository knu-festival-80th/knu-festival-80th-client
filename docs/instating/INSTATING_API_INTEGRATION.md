# 인스타팅 API 연동 구현 과정

## 배경

인스타팅(Instagram Matching) 기능은 축제 참여자끼리 인스타그램 ID를 기반으로 매칭해주는 서비스다.

UI는 이미 구현된 상태에서 백엔드 API 연동을 추가했다. 연동 전에는 카운트다운 시간, 신청자 수 등이 하드코딩되어 있었다.

## 구현 범위

### API 모듈 (`src/apis/modules/matching.ts`)

사용자와 관리자 API를 하나의 모듈로 관리한다.

**사용자 API**

```ts
registerMatching(payload); // 매칭 신청
getMatchingResult(payload); // 결과 조회 (인증 방식: instagramId + phoneNumber)
getMatchingStatus(); // 운영 상태 및 신청자 수 조회
```

**관리자 API**

```ts
getStatus(); // 운영 상태 전체 조회
updateStatus(payload); // 운영 상태 변경 (OPEN / PAUSED)
runJob(); // 전체 날짜 매칭 잡 실행
runJobForDay(festivalDay); // 특정 날짜 매칭 잡 실행
listParticipants(params); // 참여자 목록 조회 (필터 지원)
deleteParticipant(participantId); // 참여자 삭제
resetParticipant(participantId); // 참여자 매칭 초기화
getApplicantsCount(); // 성별별 신청자 수 조회
```

### 운영 상태 흐름

백엔드의 `MatchingUserStatusResponse`에서 `registrationOpen`, `resultOpen` 두 플래그로 현재 단계를 구분한다.

```
신청 전         registrationOpen: false, resultOpen: false, resultOpenAt: null
신청 중         registrationOpen: true,  resultOpen: false, registrationDeadline: 있음
결과 공개 전    registrationOpen: false, resultOpen: false, resultOpenAt: 있음
결과 공개 후    registrationOpen: false, resultOpen: true
```

`CountDownSection`은 이 플래그 조합에 따라 카운트다운 라벨과 목표 시간을 결정한다.

```ts
if (registrationOpen && registrationDeadline)       → '인스타팅 신청 마감까지'
if (!registrationOpen && !resultOpen && resultOpenAt) → '인스타팅 매칭 공개까지'
else                                                 → '결과를 확인하세요.'
```

### 데이터 페칭 전략

**인트로 페이지 (`useMatchingStatus`)**

`useQuery`로 운영 상태를 조회한다. 카운트다운, 신청자 수 모두 이 훅 하나에서 가져온다.

```ts
useQuery({
  queryKey: ['matchings', 'status'],
  queryFn: matchingApi.getMatchingStatus,
  refetchInterval: 30_000,
  staleTime: 10_000,
});
```

30초 폴링으로 충분하다고 판단했다. 신청자 수는 정밀한 실시간성이 필요한 데이터가 아니고, SSE 도입은 서버 연결 유지 비용 대비 UX 개선이 없다.

**신청 / 결과 조회 폼**

TanStack Query 없이 `react-hook-form`의 `handleSubmit` + `async/await` 직접 호출 방식을 사용한다.

사용자가 버튼을 누를 때 한 번만 실행되는 mutation이라 `useMutation`의 캐시 무효화, 낙관적 업데이트가 필요하지 않다. `isSubmitting` 상태도 `react-hook-form`이 이미 관리하고 있어서 별도 상태 관리가 불필요하다.

**관리자 페이지**

`useQuery` + `useMutation` + `useQueryClient`를 사용한다. 관리자 페이지는 여러 mutation 이후 상태 목록을 즉시 갱신해야 하므로 `invalidateQueries`가 필요하다.

### 에러 처리

`http.ts` 인터셉터가 모든 axios 에러를 `ApiClientError`로 변환한다. 컴포넌트에서는 `status` 코드별로 메시지를 분기한다.

```ts
// 신청 폼
409 → '이미 신청하셨습니다.'
403 → '현재 신청이 마감되었습니다.'
그 외 → err.message (서버 메시지 그대로 표시)

// 결과 조회 폼
404 → '신청 정보를 찾을 수 없습니다. 입력 정보를 확인해주세요.'
그 외 → err.message
```

인터셉터가 항상 `ApiClientError`를 반환하므로 catch 블록의 `instanceof ApiClientError`가 false인 경우는 실제로 도달하지 않는다. 방어 코드로 유지하고 있다.

## 고려했으나 채택하지 않은 것

**신청 폼 로직을 훅으로 분리**

`InstatingApplyView` 전용 로직이라 재사용될 곳이 없다. 파일만 늘고 응집도가 낮아진다.

**SSE 도입**

신청자 수 실시간 반영을 위한 SSE 도입을 검토했으나 오버 엔지니어링으로 판단했다. 폴링 간격을 3초 이하로 줄여야 하는 상황이 아니면 SSE 도입이 불필요하다.
