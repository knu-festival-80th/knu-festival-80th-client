# 롤링페이퍼 SSE 프론트 구현 전략

## 목적

롤링페이퍼 보드에서 다른 사용자가 새 스티커를 붙였을 때, 현재 사용자의 화면에도 빠르게 반영되도록 SSE 연결 방식을 정리한다.

현재 HTTP pull 방식은 사용자가 드래그하거나 클릭할 때 최신 postits를 다시 가져와 충돌 가능성을 줄인다. 하지만 사용자가 특정 위치를 선택한 뒤 가만히 있다가 나중에 붙이기를 누르면, 붙이기 직전 refetch 시점에 갑자기 새 스티커가 나타나며 버튼이 막히는 UX가 생길 수 있다.

SSE를 사용하면 사용자가 가만히 있어도 서버 이벤트로 새 스티커를 받을 수 있다. 따라서 선택한 위치가 다른 사용자에 의해 점유되면 화면과 버튼 상태가 자연스럽게 갱신된다.

## 기본 흐름

```text
롤링페이퍼 보드 진입
→ boardId 기준 SSE 연결
→ 다른 사용자가 스티커 생성
→ 서버가 postit.created 이벤트 전송
→ 프론트가 React Query postits cache 갱신
→ placedNotes 재계산
→ 보드 화면과 배치 가능 여부 자동 갱신
```

배치 모달이 열려 있는 경우도 같은 흐름을 사용한다.

```text
사용자가 위치 A 선택
→ 다른 사용자가 위치 A 근처에 먼저 스티커 생성
→ SSE postit.created 수신
→ postits cache append
→ occupiedNotes 변경
→ isPlacementAvailable false
→ 붙이기 버튼 비활성화
→ 화면에 새 스티커 표시
```

이 방식은 사용자가 붙이기를 누른 뒤에야 충돌을 알게 되는 상황을 줄인다.

## 프론트 구현 위치

SSE 연결은 `RollingPaperBoard` 안에 직접 넣기보다 훅으로 분리하는 것이 좋다.

권장 파일:

```text
src/components/rollingPaper/useRollingPaperBoardEvents.ts
```

사용 위치:

```ts
useRollingPaperBoardEvents(boardId);
```

`RollingPaperBoard`는 이미 `postitsQuery`를 통해 아래 query key를 사용한다.

```ts
['rollingPaper', 'postits', boardId];
```

SSE 이벤트도 같은 query cache를 갱신하면 기존 `placedNotes`, `occupiedNotes`, `isPlacementAvailable` 계산 흐름을 그대로 사용할 수 있다.

## 이벤트 엔드포인트

예시:

```http
GET /canvas/boards/{boardId}/events
```

프론트 연결:

```ts
const eventSource = new EventSource(`/api/canvas/boards/${boardId}/events`);
```

실제 프로젝트의 API base URL 정책에 따라 URL 생성 함수로 감싸는 것이 좋다.

```ts
function getRollingPaperBoardEventsUrl(boardId: number) {
  return `${import.meta.env.VITE_API_BASE_URL}/canvas/boards/${boardId}/events`;
}
```

## 권장 이벤트 타입

### postit.created

새 스티커가 생성됐을 때 사용한다.

```ts
type PostitCreatedEvent = {
  canvasPostitId: number;
  boardId: number;
  boardVariant: number;
  colorId: number;
  message: string;
  placement: {
    x: number;
    y: number;
  };
  createdAt: string;
};
```

가능하면 기존 `rollingPaperApi.listPostits`의 `CanvasPostitResponse`와 같은 형태로 내려주는 것이 좋다. 그러면 프론트는 변환 로직을 추가하지 않고 cache에 바로 넣을 수 있다.

### postit.deleted

관리자 삭제, moderation 변경, 숨김 처리 등으로 스티커가 화면에서 제거되어야 할 때 사용한다.

```ts
type PostitDeletedEvent = {
  canvasPostitId: number;
  boardId: number;
};
```

### sync.required

서버가 클라이언트 상태를 증분 이벤트만으로 복구하기 어렵다고 판단할 때 사용한다.

```ts
type SyncRequiredEvent = {
  boardId: number;
  reason?: 'version_mismatch' | 'too_many_events' | 'server_restart';
};
```

이 이벤트를 받으면 프론트는 전체 postits를 invalidate/refetch한다.

## 기본 훅 예시

```ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CanvasPostitResponse } from '@/apis/modules/rollingPaper';

type PostitDeletedEvent = {
  canvasPostitId: number;
};

function getRollingPaperBoardEventsUrl(boardId: number) {
  return `/api/canvas/boards/${boardId}/events`;
}

export function useRollingPaperBoardEvents(boardId?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) return;

    const eventSource = new EventSource(getRollingPaperBoardEventsUrl(boardId));
    const queryKey = ['rollingPaper', 'postits', boardId] as const;

    const handlePostitCreated = (event: MessageEvent) => {
      const postit = JSON.parse(event.data) as CanvasPostitResponse;

      queryClient.setQueryData(queryKey, (prev: CanvasPostitResponse[] | undefined) => {
        if (!prev) return [postit];

        const alreadyExists = prev.some((item) => item.canvasPostitId === postit.canvasPostitId);

        if (alreadyExists) return prev;

        return [...prev, postit];
      });
    };

    const handlePostitDeleted = (event: MessageEvent) => {
      const payload = JSON.parse(event.data) as PostitDeletedEvent;

      queryClient.setQueryData(queryKey, (prev: CanvasPostitResponse[] | undefined) => {
        return prev?.filter((item) => item.canvasPostitId !== payload.canvasPostitId) ?? [];
      });
    };

    const handleSyncRequired = () => {
      void queryClient.invalidateQueries({ queryKey });
    };

    eventSource.addEventListener('postit.created', handlePostitCreated);
    eventSource.addEventListener('postit.deleted', handlePostitDeleted);
    eventSource.addEventListener('sync.required', handleSyncRequired);

    eventSource.onerror = () => {
      // EventSource는 기본적으로 자동 재연결을 시도한다.
      // 여기서는 로깅, 연결 상태 표시, fallback 활성화 정도만 처리한다.
    };

    return () => {
      eventSource.removeEventListener('postit.created', handlePostitCreated);
      eventSource.removeEventListener('postit.deleted', handlePostitDeleted);
      eventSource.removeEventListener('sync.required', handleSyncRequired);
      eventSource.close();
    };
  }, [boardId, queryClient]);
}
```

## React Query cache 갱신 방식

SSE 이벤트를 받을 때마다 무조건 refetch하면 SSE의 장점이 줄어든다.

권장 방식:

- `postit.created`: cache에 직접 append
- `postit.deleted`: cache에서 직접 remove
- `sync.required`: 전체 refetch

이렇게 하면 대부분의 이벤트는 네트워크 추가 요청 없이 UI에 반영된다.

## 중복 이벤트 처리

SSE는 재연결 과정에서 같은 이벤트를 다시 받을 수 있다. 서버가 `Last-Event-ID`를 지원하더라도 클라이언트에서는 중복 방어를 해야 한다.

`postit.created` 처리 시 `canvasPostitId` 기준으로 이미 cache에 있으면 무시한다.

```ts
const alreadyExists = prev.some((item) => item.canvasPostitId === postit.canvasPostitId);
if (alreadyExists) return prev;
```

이 처리가 없으면 같은 스티커가 중복 렌더링될 수 있다.

## 보드 변경 시 연결 관리

사용자가 다른 보드로 이동하면 기존 SSE 연결을 닫아야 한다.

```ts
return () => {
  eventSource.close();
};
```

닫지 않으면 이전 보드 이벤트까지 계속 수신하거나, 여러 연결이 동시에 유지되어 메모리와 네트워크 리소스를 낭비한다.

`useEffect` dependency에 `boardId`를 넣으면 boardId 변경 시 자동으로 이전 연결이 정리되고 새 연결이 열린다.

## 인증 고려

기본 `EventSource`는 custom header를 넣을 수 없다.

따라서 인증 방식에 따라 구현이 달라진다.

### 쿠키 기반 인증

쿠키 기반이면 기본 `EventSource`를 그대로 사용할 수 있다.

```ts
const eventSource = new EventSource(url, { withCredentials: true });
```

단, 서버 CORS 설정에서 credential을 허용해야 한다.

### Authorization header 기반 인증

`Authorization: Bearer ...` 헤더가 필요한 구조라면 기본 `EventSource`만으로는 어렵다.

선택지는 다음과 같다.

1. SSE 엔드포인트만 쿠키 인증을 사용한다.
2. 짧은 수명의 SSE token을 query string으로 전달한다.
3. fetch 기반 SSE polyfill을 사용한다.

query string token을 사용할 경우 로그 노출 위험이 있으므로 짧은 TTL과 제한된 scope가 필요하다.

## 연결 상태와 fallback

SSE가 끊겨도 최종 저장은 백엔드 create 검증으로 막힌다. 하지만 UX는 다시 나빠질 수 있다.

따라서 SSE를 도입해도 기존 HTTP pull 전략을 완전히 제거하지 않는 것이 좋다.

권장 fallback:

- SSE 연결 성공: 이벤트 기반 cache 갱신
- SSE 연결 실패 또는 장시간 이벤트 없음: 기존 debounce HTTP refetch 유지
- 붙이기 직전: stale 상태이면 HTTP refetch 후 최종 프론트 검증
- create 요청: 백엔드 최종 충돌 검증 유지

즉, SSE는 최신성을 높이는 수단이고, 정합성의 최종 방어선은 여전히 백엔드 create 검증이다.

## 배치 모달과의 관계

현재 배치 가능 여부는 `placedNotes` 기반으로 계산된다.

```ts
const occupiedNotes = getPlacedNotesForBoard(placedNotes, boardVariant);
const isPlacementAvailable = isRollingPaperPlacementAvailable(...);
```

SSE가 `postits` query cache를 갱신하면 다음 값들이 자동으로 바뀐다.

```text
postitsQuery.data
→ apiPlacedNotes
→ placedNotes
→ occupiedNotes
→ isPlacementAvailable
```

따라서 배치 모달에 SSE 전용 로직을 많이 넣을 필요는 없다. 보드 단위 postits cache만 정확히 갱신하면 기존 계산 흐름이 그대로 반응한다.

## 서버 이벤트 예시

SSE 응답은 아래 형식을 따른다.

```text
event: postit.created
id: 101
data: {"canvasPostitId":101,"boardId":1,"boardVariant":0,"colorId":2,"message":"축하해요","placement":{"x":42.1,"y":51.3},"createdAt":"2026-05-18T12:00:00Z"}

event: postit.deleted
id: 102
data: {"canvasPostitId":99,"boardId":1}

event: sync.required
id: 103
data: {"boardId":1,"reason":"version_mismatch"}
```

서버가 `id`를 내려주면 브라우저는 재연결 시 `Last-Event-ID`를 보낼 수 있다. 서버가 이를 지원하면 누락 이벤트 복구에 도움이 된다.

## 구현 단계 제안

### 1단계: boardId 단위 SSE 연결

- `useRollingPaperBoardEvents(boardId)` 훅 추가
- `postit.created` 이벤트만 먼저 처리
- React Query `postits` cache에 append
- 중복 이벤트 방어 추가

### 2단계: 삭제/숨김 이벤트 처리

- `postit.deleted` 이벤트 추가
- 관리자 삭제나 moderation 변경 시 cache에서 제거

### 3단계: sync.required fallback

- 서버가 상태 불일치 이벤트를 보낼 수 있게 한다.
- 프론트는 해당 이벤트 수신 시 전체 postits refetch를 수행한다.

### 4단계: 연결 상태 UI와 HTTP fallback

- SSE 연결 실패 시 내부 상태를 기록한다.
- 실패 중에는 기존 debounce refetch 전략을 유지한다.
- 사용자에게 굳이 연결 상태를 크게 노출할 필요는 없지만, 디버깅과 QA를 위해 상태를 추적할 수 있게 한다.

## 주의할 점

- SSE가 있어도 최종 create 충돌 검증은 백엔드가 반드시 유지해야 한다.
- 이벤트 중복 수신에 대비해야 한다.
- 보드 변경 시 연결을 반드시 닫아야 한다.
- 인증 방식이 Authorization header 기반이면 기본 EventSource로는 부족할 수 있다.
- 모바일 네트워크 전환, 백그라운드 탭, 재연결 타이밍을 고려해야 한다.
- 모든 이벤트마다 refetch하면 SSE 도입 효과가 줄어든다.

## 결론

SSE를 도입하면 사용자가 배치 위치를 선택한 뒤 가만히 있어도 다른 사용자의 새 스티커가 자연스럽게 반영된다. 이 덕분에 붙이기 직전에 갑자기 실패하는 UX를 줄일 수 있다.

프론트 구현의 핵심은 새로운 상태 구조를 크게 만드는 것이 아니라, 서버 이벤트를 기존 React Query `postits` cache에 정확히 반영하는 것이다. 그러면 기존 `placedNotes`와 배치 가능 여부 계산 로직이 그대로 최신 상태를 따라간다.

다만 SSE는 최신성을 높이는 장치이지 정합성의 최종 보장은 아니다. 최종 저장 시 백엔드 충돌 검증과 HTTP fallback은 계속 유지해야 한다.
