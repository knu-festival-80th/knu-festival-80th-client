# 롤링페이퍼 배치 동기화 전략

## 배경

롤링페이퍼는 여러 사용자가 같은 보드에 동시에 스티커를 붙일 수 있다.

현재 프론트는 이미 조회한 스티커 목록을 기준으로 1차 배치 가능 여부를 검사한다. 사용자가 붙이기를 누르면 백엔드가 최신 DB 상태 기준으로 최종 충돌 검사를 수행한다. 이때 백엔드가 충돌을 감지하면 저장을 거부하고, 프론트는 보드 데이터를 다시 불러와 최신 스티커 목록을 렌더링한다.

이 구조는 정합성 측면에서는 맞다. 최종 충돌 검사는 반드시 백엔드가 담당해야 하기 때문이다.

하지만 UX 측면에서는 어색한 순간이 생길 수 있다.

1. 사용자는 화면상 비어 있는 위치라고 판단한다.
2. 붙이기를 누른다.
3. 백엔드가 이미 점유된 위치라고 reject한다.
4. 프론트가 최신 데이터를 refetch한다.
5. refetch 타이밍이나 노출 정책에 따라 충돌 위치의 스티커가 바로 보이지 않을 수 있다.
6. 사용자는 "붙일 수 없다면서 왜 화면에는 비어 있지?"라고 느낀다.

이 문제를 줄이기 위해 사용자가 스티커를 클릭하거나 드래그하는 시점에 최신 점유 상태를 더 자주 동기화하는 방식을 검토한다.

## 용어 정리

SSE와 HTTP 요청의 방향을 명확히 구분한다.

- SSE: 서버가 클라이언트로 이벤트를 밀어주는 push 모델
- HTTP 조회: 클라이언트가 필요한 시점에 서버에 최신 상태를 요청하는 pull 모델

이번 문제는 전체 보드를 실시간으로 감상하는 기능보다, **사용자가 배치하려는 순간의 최신 점유 상태를 얼마나 자연스럽게 반영할 것인가**에 가깝다.

따라서 당장 SSE를 전면 도입하기보다는, 사용자 액션 시점에 HTTP로 최신 상태를 가져오는 pull 모델이 더 현실적이다.

## SSE를 바로 선택하지 않는 이유

SSE는 다음 요구가 강할 때 적합하다.

- 여러 사용자가 같은 보드를 동시에 보고 있고, 누군가 스티커를 붙이면 다른 사용자 화면에도 즉시 나타나야 한다.
- 롤링페이퍼가 실시간 공동 작업 경험을 핵심 가치로 가진다.
- 서버와 인프라가 다수의 장시간 연결을 안정적으로 감당할 수 있다.

하지만 현재 문제는 모든 사용자에게 모든 변경을 즉시 보여주는 것이 핵심은 아니다. 핵심은 사용자가 배치하려는 위치가 이미 점유됐는지 더 빠르게 알아차리게 하는 것이다.

SSE를 켜면 사용자가 실제로 배치 행동을 하지 않는 동안에도 연결을 유지해야 한다. 접속자가 늘어날수록 서버 연결 수, heartbeat, 재연결 처리, 탭 백그라운드 처리, 모바일 네트워크 전환 처리까지 고려해야 한다.

반면 HTTP pull은 사용자가 실제로 보드와 상호작용할 때만 요청을 보낼 수 있다. debounce와 stale time을 잘 설정하면 불필요한 요청을 줄이면서도, 배치 직전 최신성은 높일 수 있다.

## 권장 방향

단기적으로는 아래 흐름을 권장한다.

1. 프론트의 현재 로컬 충돌 검사는 유지한다.
2. 사용자가 배치 모드에 진입하면 최신 점유 상태를 한 번 가져온다.
3. 사용자가 스티커를 드래그하거나 보드를 클릭하면 debounce된 HTTP 요청으로 점유 상태를 갱신한다.
4. 붙이기 버튼을 누르기 직전에는 프론트가 최신 점유 상태로 다시 1차 검증한다.
5. 최종 저장 요청은 백엔드가 원자적으로 충돌 검증 후 처리한다.
6. 백엔드 reject가 오면 즉시 점유 상태와 목록을 갱신하고, 충돌 위치를 사용자에게 명확히 표시한다.

이 방식은 SSE보다 단순하고, 현재 구조를 크게 바꾸지 않으면서 UX를 개선할 수 있다.

## 왜 요청을 두 종류로 나누는가

사용자 액션마다 전체 스티커 목록을 다시 받아오면 구현은 단순하지만 성능상 손해가 크다.

전체 스티커 목록에는 충돌 판정에 필요하지 않은 데이터가 많다.

- 작성 메시지
- 작성자 관련 표시 정보
- 색상, 폰트, 텍스트 렌더링 정보
- 승인 상태
- UI 렌더링에 필요한 메타데이터

드래그 중 또는 클릭 중에 필요한 정보는 대부분 "어느 좌표가 이미 점유되어 있는가"이다. 즉, 충돌 검사용 데이터는 훨씬 작게 만들 수 있다.

그래서 백엔드 요청을 아래 두 종류로 분리하는 것이 좋다.

1. 화면 렌더링용 스티커 목록 조회
2. 배치 충돌 검사용 점유 상태 조회

이렇게 나누면 각 요청의 목적과 비용을 명확히 제어할 수 있다.

## 요청 1: 화면 렌더링용 스티커 목록 조회

이 요청은 보드 화면에 실제 스티커를 그리기 위한 데이터이다.

사용 시점:

- 보드 최초 진입
- 붙이기 성공 후
- 백엔드 reject 후 화면을 최신 상태로 복구할 때
- 일정 시간 이상 지나 전체 상태를 다시 맞추고 싶을 때

예시:

```http
GET /rolling-papers/boards/{boardId}/postits
```

응답 예시:

```ts
type RollingPaperPostitResponse = {
  boardVersion: number;
  postits: Array<{
    postitId: number;
    boardId: number;
    boardVariant: number;
    colorId: number;
    message: string;
    x: number;
    y: number;
    createdAt: string;
  }>;
};
```

특징:

- 화면 렌더링에 필요한 풍부한 데이터를 포함한다.
- 응답 크기가 비교적 크다.
- 드래그 중 반복 호출하기에는 부담이 있다.
- 캐싱과 pagination, lazy loading을 고려할 수 있다.

## 요청 2: 배치 충돌 검사용 점유 상태 조회

이 요청은 화면을 다시 그리기 위한 요청이 아니라, 배치 가능 여부를 더 정확하게 판단하기 위한 요청이다.

사용 시점:

- 배치 모드 진입 시
- 사용자가 스티커를 드래그하거나 클릭할 때
- 사용자가 붙이기 버튼 근처까지 진행했을 때
- 백엔드 reject 후 충돌 위치를 빠르게 막아야 할 때

예시:

```http
GET /rolling-papers/boards/{boardId}/occupancy
```

응답 예시:

```ts
type RollingPaperOccupancyResponse = {
  boardVersion: number;
  occupied: Array<{
    postitId: number;
    boardVariant: number;
    colorId: number;
    x: number;
    y: number;
  }>;
};
```

특징:

- 충돌 계산에 필요한 최소 데이터만 내려준다.
- 메시지 본문이 없어서 응답이 작다.
- debounce된 사용자 액션에 붙이기 쉽다.
- 프론트는 이 데이터로 `isRollingPaperPlacementAvailable`을 다시 계산할 수 있다.
- 전체 스티커 UI를 리렌더하지 않고도 배치 버튼 상태만 갱신할 수 있다.

가능하다면 `occupied`는 실제 스티커 원본 데이터보다 더 서버 계산 친화적인 형태로 내려줄 수 있다.

```ts
type RollingPaperOccupancyRectResponse = {
  boardVersion: number;
  occupiedRects: Array<{
    postitId: number;
    boardVariant: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
  }>;
};
```

이 방식은 충돌 정책을 백엔드가 주도할 때 유리하다. 프론트는 서버가 내려준 충돌 박스를 그대로 사용하면 된다.

## 증분 조회 옵션

요청 비용을 더 줄이려면 `boardVersion` 또는 `updatedAt` 기반 증분 조회를 추가할 수 있다.

예시:

```http
GET /rolling-papers/boards/{boardId}/occupancy?sinceVersion=123
```

응답 예시:

```ts
type RollingPaperOccupancyDeltaResponse = {
  boardVersion: number;
  changes: Array<{
    postitId: number;
    boardVariant: number;
    colorId: number;
    x: number;
    y: number;
    operation: 'created' | 'deleted';
  }>;
};
```

이 방식의 장점:

- 보드 전체 점유 목록을 매번 받지 않아도 된다.
- 사용자가 오래 보드를 열어둔 상태에서도 최신 변경분만 반영할 수 있다.
- 모바일 네트워크에서 반복 요청 비용을 줄일 수 있다.

단점:

- 백엔드가 보드 단위 version을 관리해야 한다.
- 삭제나 숨김 처리까지 고려하면 delta 계산이 복잡해진다.
- 클라이언트가 version mismatch를 만났을 때 전체 조회로 fallback해야 한다.

권장 fallback:

```ts
if (response.requiresFullSync) {
  refetchFullOccupancy();
}
```

## 최종 저장 요청은 별도로 유지해야 한다

점유 상태 조회를 자주 하더라도 최종 저장 요청의 백엔드 충돌 검사는 절대 제거하면 안 된다.

사용자 A와 사용자 B가 거의 동시에 같은 위치를 선택하면, 둘 다 최신 점유 조회에서는 비어 있다고 볼 수 있다. 이후 두 사용자가 동시에 저장 요청을 보내면 하나만 성공해야 한다.

따라서 최종 저장 요청은 아래 조건을 만족해야 한다.

- DB 트랜잭션 또는 원자적 조건으로 충돌 검증과 저장을 함께 처리한다.
- 충돌 시 명확한 에러 코드를 반환한다.
- 프론트가 해당 에러를 placement conflict로 구분할 수 있어야 한다.

예시:

```http
POST /rolling-papers/boards/{boardId}/postits
```

요청 예시:

```ts
type CreateRollingPaperPostitRequest = {
  boardVariant: number;
  colorId: number;
  message: string;
  x: number;
  y: number;
  clientKnownBoardVersion?: number;
};
```

응답 예시:

```ts
type CreateRollingPaperPostitResponse =
  | {
      ok: true;
      boardVersion: number;
      postit: RollingPaperPostit;
    }
  | {
      ok: false;
      code: 'POSTIT_POSITION_CONFLICT';
      boardVersion: number;
      occupancy?: RollingPaperOccupancyResponse;
    };
```

충돌 응답에 최신 `occupancy`를 함께 내려주면 프론트는 추가 refetch 없이 즉시 해당 위치를 막을 수 있다.

## 프론트 debounce 기준

HTTP pull을 사용할 때는 요청 빈도를 제한해야 한다.

권장 기준:

- 배치 모드 진입: 즉시 1회 요청
- 드래그 중: 300~500ms debounce
- 드래그 종료: 즉시 1회 요청
- 붙이기 버튼 클릭 직전: 현재 occupancy가 오래됐다면 즉시 1회 요청

예시 정책:

```ts
const OCCUPANCY_STALE_MS = 3000;
const DRAG_OCCUPANCY_DEBOUNCE_MS = 400;
```

프론트는 마지막 occupancy 조회 시각을 기억하고, 너무 오래된 상태라면 제출 직전 최신 상태를 다시 확인한다.

## UX 흐름 제안

배치 중 UX는 아래처럼 정리할 수 있다.

1. 사용자가 보드에서 스티커 위치를 선택한다.
2. 현재 로컬 postits와 occupancy로 즉시 1차 검증한다.
3. 위치가 겹치면 버튼을 비활성화한다.
4. 사용자가 드래그를 계속하면 debounce된 occupancy 조회를 수행한다.
5. 새 occupancy가 도착하면 버튼 활성화 상태와 충돌 안내를 갱신한다.
6. 붙이기 버튼 클릭 시 occupancy가 stale이면 한 번 더 조회한다.
7. 최신 occupancy 기준으로도 가능하면 create 요청을 보낸다.
8. create 성공 시 새 postit을 반영한다.
9. create 충돌 시 충돌 위치 placeholder 또는 최신 occupancy로 즉시 막는다.

## 요청 분리의 효과

요청을 분리하면 다음 장점이 있다.

- 드래그 중에는 가벼운 점유 상태만 받아 모바일 부하를 줄일 수 있다.
- 실제 화면 렌더링은 필요한 시점에만 전체 목록 조회로 처리할 수 있다.
- 백엔드와 프론트가 충돌 계산에 필요한 데이터 계약을 명확히 맞출 수 있다.
- SSE 없이도 사용자가 배치하려는 순간의 최신성을 높일 수 있다.
- 나중에 SSE를 도입하더라도 occupancy 모델을 그대로 재사용할 수 있다.

## SSE를 나중에 붙인다면

추후 실시간성이 제품 핵심 요구가 되면 SSE는 아래 이벤트만 작게 흘리는 방식이 좋다.

```ts
type RollingPaperBoardEvent =
  | {
      type: 'postit.created';
      boardVersion: number;
      postitId: number;
      boardVariant: number;
      colorId: number;
      x: number;
      y: number;
    }
  | {
      type: 'postit.deleted';
      boardVersion: number;
      postitId: number;
    };
```

SSE에서도 메시지 본문 전체를 계속 밀어주는 것보다, occupancy 갱신에 필요한 최소 이벤트를 보내고 프론트가 필요할 때 상세 목록을 조회하는 편이 안정적이다.

## 결론

현재 문제를 해결하기 위한 우선순위는 다음과 같다.

1. 백엔드의 최종 create 충돌 검사는 유지한다.
2. 프론트는 사용자 액션 시점에 가벼운 occupancy HTTP pull을 수행한다.
3. 화면 렌더링용 postits 조회와 충돌 검사용 occupancy 조회를 분리한다.
4. reject 응답에는 가능하면 최신 boardVersion 또는 occupancy를 포함한다.
5. SSE는 실시간 공동 감상이나 협업 UX가 명확한 요구가 됐을 때 추가한다.

이 방향이 현재 UX 문제를 줄이면서도 서버 리소스와 구현 복잡도를 가장 균형 있게 관리할 수 있다.
