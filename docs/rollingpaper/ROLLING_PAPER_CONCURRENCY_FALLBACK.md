# 롤링페이퍼 동시성 충돌 fallback 정리

## 배경

롤링페이퍼는 여러 사용자가 동시에 같은 보드에 포스트잇을 붙일 수 있다. 그래서 프론트는 현재 조회된 포스트잇 목록을 기준으로 1차 충돌 검사를 하고, 최종 저장 시점에는 백엔드가 최신 DB 상태 기준으로 다시 충돌 검사를 한다.

프론트 1차 검사는 사용자 경험을 위한 방어선이다. 이미 화면에 보이는 포스트잇과 겹치는 위치라면 `롤링페이퍼 붙이기` 버튼을 비활성화한다.

하지만 동시에 같은 위치에 붙이는 상황은 프론트만으로 막을 수 없다. 두 사용자가 같은 시점에 같은 위치를 비어 있다고 보고 제출할 수 있기 때문이다. 이 경우 백엔드는 `CP008` 충돌 에러를 반환한다.

## 발생한 문제

기존 코드는 `CP008`을 받으면 에러 문구를 보여주고 서버 데이터를 다시 불러왔다.

```ts
if (error instanceof ApiClientError && error.code === POSTIT_POSITION_CONFLICT_CODE) {
  setPlacementErrorMessage(POSTIT_POSITION_CONFLICT_MESSAGE);
  await queryClient.refetchQueries({ queryKey: ['rollingPaper', 'postits', boardId] });
  await queryClient.invalidateQueries({ queryKey: ['rollingPaper', 'boards', questionId] });
  return;
}
```

문제는 이 refetch 결과에 충돌을 만든 포스트잇이 항상 즉시 포함된다고 보장할 수 없다는 점이었다.

가능한 상황은 다음과 같다.

1. 사용자 A와 사용자 B가 같은 위치를 비어 있다고 본다.
2. 사용자 A의 요청이 먼저 저장된다.
3. 사용자 B의 요청은 백엔드에서 `CP008`로 거절된다.
4. 사용자 B 프론트는 `postits`를 refetch한다.
5. 하지만 조회 응답에는 아직 사용자 A의 포스트잇이 보이지 않거나, 승인/노출 정책 때문에 바로 내려오지 않는다.
6. 사용자 B 화면에서는 그 위치가 계속 비어 보인다.
7. 사용자가 포스트잇을 조금 움직이면 `placementErrorMessage`가 초기화된다.
8. 현재 클라이언트 점유 목록에도 해당 위치가 없으므로 버튼이 다시 활성화된다.

이 흐름 때문에 사용자는 "분명 방금 붙일 수 없다고 했는데, 같은 위치가 다시 비어 보이는" 상태를 겪을 수 있었다.

## 원인

핵심 원인은 `CP008` 이후의 클라이언트 상태가 서버 조회 결과에만 의존했다는 점이다.

프론트의 버튼 비활성화 기준은 `occupiedNotes`이다.

```ts
const occupiedNotes = getPlacedNotesForBoard(placedNotes, boardVariant);
const isPlacementAvailable = isRollingPaperPlacementAvailable(
  selectedPlacement,
  colorId,
  occupiedNotes,
  boardVariant,
  undefined,
  ROLLING_PAPER_CLIENT_COLLISION_SCALE,
);
```

즉 `placedNotes` 안에 충돌 위치를 점유하는 노트가 없으면, 프론트는 그 위치를 다시 배치 가능한 곳으로 판단한다.

기존 구현에서는 `CP008`을 받아도 `placedNotes`에 아무것도 추가하지 않았다. 서버 refetch가 최신 점유 상태를 즉시 반영해 주는 경우에는 문제가 없어 보이지만, 응답 타이밍이나 노출 정책이 어긋나는 순간 같은 문제가 다시 나타날 수 있었다.

따라서 이 문제는 단순한 리렌더 문제라기보다, **서버가 충돌이라고 알려준 위치를 프론트의 점유 모델에 반영하지 않은 상태 동기화 문제**에 가깝다.

## 수정 방향

`CP008`은 백엔드가 "그 위치는 이미 점유되었다"고 확인해 준 신뢰 가능한 신호다. 그래서 refetch 결과를 기다리는 것과 별개로, 프론트도 즉시 그 위치를 임시 점유 상태로 반영하도록 수정했다.

이를 위해 로컬 충돌 placeholder를 추가했다.

```ts
const conflictPlaceholder: PlacedRollingPaperNote = {
  ...note,
  id: `conflict-${boardId}-${Date.now()}`,
  boardId,
  boardVariant: boardIndex,
  categoryId: category.id,
  channelId: channel.id,
  message: POSTIT_POSITION_CONFLICT_PLACEHOLDER_MESSAGE,
  isPending: true,
  isLocalOnly: true,
  isConflictPlaceholder: true,
  pendingVisibleUntil: Date.now() + CONFLICT_PLACEHOLDER_LOCAL_VISIBLE_MS,
};
```

이 placeholder는 실제 서버 포스트잇은 아니지만, 프론트의 배치 가능 여부 계산에서는 기존 포스트잇처럼 취급된다. 따라서 충돌 응답을 받은 직후 같은 위치로 다시 돌아오면 `isRollingPaperPlacementAvailable`이 `false`를 반환하고 버튼이 비활성화된다.

## 변경된 코드

### 타입 확장

`PlacedRollingPaperNote`에 충돌 placeholder임을 표시하는 플래그를 추가했다.

```ts
export type PlacedRollingPaperNote = {
  id: string;
  postitId?: number;
  boardId?: number;
  isPending?: boolean;
  isLocalOnly?: boolean;
  isConflictPlaceholder?: boolean;
  pendingVisibleUntil?: number;
  message: string;
  colorId: RollingPaperStickerColorId;
  x: number;
  y: number;
  boardVariant: number;
  categoryId?: string;
  channelId?: string;
};
```

파일: `src/lib/rollingPaperLayout.ts`

### 충돌 placeholder 유지 시간

서버 refetch가 늦거나 충돌 포스트잇이 바로 노출되지 않는 상황을 흡수하기 위해 60초 동안 로컬에서 유지한다.

```ts
const CONFLICT_PLACEHOLDER_LOCAL_VISIBLE_MS = 60000;
```

이 값은 기존 pending postit fallback 유지 시간과 같은 기준이다.

### 만료된 로컬 노트 제거

로컬 fallback이 무기한 남아 있으면 실제로는 비어 있는 위치까지 계속 막을 수 있다. 그래서 `pendingVisibleUntil`이 지난 로컬 노트는 필터링한다.

```ts
function isExpiredLocalNote(note: PlacedRollingPaperNote, now = Date.now()) {
  return Boolean(note.pendingVisibleUntil && note.pendingVisibleUntil <= now);
}
```

### 같은 위치 placeholder 중복 방지

같은 위치에서 충돌을 여러 번 받으면 placeholder가 계속 쌓일 수 있다. 그래서 같은 보드, 같은 variant, 거의 같은 좌표의 기존 placeholder는 교체한다.

```ts
function isSameConflictPlaceholder(note: PlacedRollingPaperNote, nextNote: PlacedRollingPaperNote) {
  return (
    note.isConflictPlaceholder &&
    note.boardId === nextNote.boardId &&
    note.boardVariant === nextNote.boardVariant &&
    Math.abs(note.x - nextNote.x) < 0.01 &&
    Math.abs(note.y - nextNote.y) < 0.01
  );
}
```

### 서버 데이터와 중복되는 placeholder 제거

refetch 이후 실제 서버 포스트잇이 조회되면 placeholder를 계속 보여줄 필요가 없다. 그래서 서버 포스트잇 목록과 충돌하는 로컬 fallback은 제거한다.

```ts
const visiblePendingNotes = pendingPlacedNotes.filter((note) => {
  if (note.boardId !== boardId || approvedPostitIds.has(note.postitId)) {
    return false;
  }

  if (isExpiredLocalNote(note)) {
    return false;
  }

  const apiNotesForBoard = getPlacedNotesForBoard(apiPlacedNotes, note.boardVariant);
  const isAlreadyVisibleFromApi = !isRollingPaperPlacementAvailable(
    { x: note.x, y: note.y },
    note.colorId,
    apiNotesForBoard,
    note.boardVariant,
    undefined,
    ROLLING_PAPER_CLIENT_COLLISION_SCALE,
  );

  return !isAlreadyVisibleFromApi;
});
```

여기서 `isAlreadyVisibleFromApi`는 같은 위치가 서버 포스트잇으로 이미 점유되어 있는지를 뜻한다. 이미 서버 데이터가 그 위치를 막고 있다면 로컬 placeholder는 렌더링하지 않는다.

## 변경 후 흐름

수정 후 `CP008` 발생 시 흐름은 다음과 같다.

1. 사용자가 배치 가능한 것으로 보이는 위치에 제출한다.
2. 백엔드가 최신 상태 기준으로 충돌을 감지하고 `CP008`을 반환한다.
3. 프론트가 해당 위치에 로컬 충돌 placeholder를 추가한다.
4. 에러 문구를 보여준다.
5. 서버 postits refetch와 boards invalidate를 수행한다.
6. 사용자가 위치를 조금 움직였다가 다시 같은 곳으로 돌아와도 placeholder 때문에 버튼이 비활성화된다.
7. 서버 조회 결과에 실제 포스트잇이 나타나면 placeholder는 자동으로 빠지고 서버 포스트잇이 점유 기준이 된다.
8. 서버 조회 결과에 바로 나타나지 않더라도 placeholder가 60초 동안 위치를 막는다.

## 왜 보드 페이지에도 placeholder를 렌더링하는가

이 placeholder는 `pendingPlacedNotes`에 들어가고, 최종 `placedNotes`에 합쳐진다.

```ts
const placedNotes = mockNotes.length > 0 ? mockNotes : [...apiPlacedNotes, ...visiblePendingNotes];
```

이렇게 한 이유는 배치 모달의 점유 판정뿐 아니라, 보드 화면과 다른 보드 관련 UI도 같은 상태를 보게 하기 위해서다.

다만 placeholder는 실제 사용자 메시지가 아니기 때문에 메시지는 짧은 안내 문구로 둔다.

```ts
const POSTIT_POSITION_CONFLICT_PLACEHOLDER_MESSAGE = '이미 사용 중인 위치예요.';
```

## 한계

이 수정은 프론트의 fallback이다. 최종 동시성 안전성은 여전히 백엔드가 책임져야 한다.

프론트 placeholder가 막아 주는 것은 다음 상황이다.

- 서버가 충돌이라고 응답했지만, 최신 조회 결과가 아직 그 충돌 위치를 보여주지 못하는 상태
- 사용자가 에러 후 같은 위치에 반복 제출하는 상태
- 에러 문구가 위치 변경으로 clear된 뒤 같은 위치로 돌아오는 상태

하지만 다른 브라우저, 다른 사용자, 다른 기기에서 동시에 제출하는 최종 충돌은 백엔드 검증이 계속 필요하다.

## 검증

다음 검증을 진행했다.

- `pnpm build` 통과
- `pnpm test src/lib/rollingPaperLayout.test.ts` 통과

빌드 중 기존 경고는 남아 있다.

- 현재 Node.js `20.12.2`는 Vite 권장 버전 `20.19+`보다 낮다는 경고
- `runtime-env.js` script 관련 Vite 경고
- `src/apis/modules/upload.ts` 재export 관련 Rollup circular dependency 경고
- chunk size 경고

이 경고들은 이번 동시성 fallback 수정으로 새로 생긴 문제는 아니다.

## 관련 파일

- `src/components/rollingPaper/RollingPaperBoard.tsx`
- `src/lib/rollingPaperLayout.ts`
