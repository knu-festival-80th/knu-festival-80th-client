# 롤링페이퍼 포커스 인터랙션 성능 개선 정리

## 배경

롤링페이퍼 보드에서 사용자가 스티커를 누르면 해당 스티커 위치로 보드가 확대되고, `원점` 버튼을 누르면 기본 위치로 돌아간다. 이 인터랙션은 모바일에서 자주 사용되는 탐색 동작이기 때문에 부드럽게 이어져야 한다.

하지만 모바일 환경에서 다음 문제가 있었다.

- 스티커를 클릭해 확대될 때 화면이 심하게 버벅거린다.
- 확대 상태에서 축소하거나 원점으로 돌아갈 때 기존의 부드러운 이동감이 사라진다.
- 원점 복귀 시 확대된 스티커가 자연스럽게 축소되지 않고, 바로 사라지면서 화면이 순간 이동하는 것처럼 보인다.

관련 구현 파일은 다음이다.

- `src/components/rollingPaper/RollingPaperBoard.tsx`
- `src/components/rollingPaper/RollingPaperBoardCanvas.tsx`

## 원인

문제는 크게 두 가지였다.

### 1. 확대/축소 상태 변경 때마다 많은 스티커가 다시 렌더링됨

보드의 확대/축소/이동 상태는 `scale`, `pan`, `focusedNoteId`로 관리된다.

```ts
const [boardScale, setBoardScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
const [boardPan, setBoardPan] = useState<RollingPaperPan>(INITIAL_BOARD_PAN);
const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
```

스티커 클릭 시 `scale`, `pan`, `focusedNoteId`가 함께 바뀐다. 기존 구조에서는 이 상태가 바뀔 때마다 보드 컴포넌트가 다시 렌더링되고, 그 과정에서 포스트잇 목록 파생 데이터도 새 배열/객체로 다시 만들어졌다.

`RollingPaperBoardCanvas` 내부에서도 전체 스티커 목록을 그대로 `map`으로 렌더링하고 있었다.

```tsx
{
  boardNotes.map((note) => {
    const isFocused = focusedNoteId === note.id;

    return (
      <button key={note.id}>
        <RollingPaperSticker colorId={note.colorId} message={note.message} />
      </button>
    );
  });
}
```

`RollingPaperSticker`는 SVG를 raw string으로 렌더링한다.

```tsx
<span
  aria-hidden="true"
  className="block w-full select-none [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
  dangerouslySetInnerHTML={{ __html: paper.svg }}
/>
```

따라서 스티커가 많은 보드에서는 확대/축소 상태가 바뀔 때마다 많은 SVG 스티커가 다시 렌더링될 수 있고, 모바일에서는 이 비용이 체감될 정도로 커질 수 있었다.

### 2. 원점 복귀 시 focused note를 즉시 제거함

기존 원점 복귀 로직은 `scale`, `pan`을 기본값으로 바꾼 뒤 `focusedNoteId`를 즉시 `null`로 만들었다.

```ts
const resetBoardViewport = () => {
  setBoardScale(ROLLING_PAPER_ZOOM.default);
  setBoardPan(INITIAL_BOARD_PAN);
  setFocusedNoteId(null);
};
```

확대 상태에서는 선택된 스티커를 별도 오버레이로 렌더링한다.

```tsx
{focusedNote && focusedNotePosition && (
  <button
    className="absolute z-20 ..."
    style={{
      left: `${focusedNotePosition.x}px`,
      top: `${focusedNotePosition.y}px`,
      width: `${focusedNoteWidth}px`,
    }}
  >
    <RollingPaperSticker ... />
  </button>
)}
```

그런데 `focusedNoteId`가 즉시 사라지면 이 오버레이가 애니메이션을 탈 기회 없이 바로 unmount된다. 그래서 원점으로 돌아갈 때 확대된 스티커가 부드럽게 축소되는 대신, 순간적으로 사라져 화면이 튀는 것처럼 느껴졌다.

## 수정 방향

이번 수정은 두 방향으로 진행했다.

1. 확대/축소/이동 중 스티커 SVG가 불필요하게 다시 렌더링되지 않게 한다.
2. 원점 복귀 시 포커스 오버레이를 바로 제거하지 않고, 축소 애니메이션이 끝난 뒤 제거한다.

## 변경 1: 파생 데이터 memoization

`RollingPaperBoard.tsx`에서 API 응답으로부터 만드는 카테고리, 보드, 포스트잇 목록을 `useMemo`로 고정했다.

```ts
const apiCategories = useMemo(
  () =>
    (questionsQuery.data ?? [])
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(toRollingPaperCategory),
  [questionsQuery.data],
);
```

```ts
const apiChannels = useMemo(
  () =>
    (boardsQuery.data ?? [])
      .map(toRollingPaperChannel)
      .slice(0, ROLLING_PAPER_CHANNELS_PER_CATEGORY),
  [boardsQuery.data],
);
```

```ts
const apiPlacedNotes = useMemo(
  () => (postitsQuery.data ?? []).map(toPlacedRollingPaperNote),
  [postitsQuery.data],
);
```

그리고 최종 렌더링에 쓰는 `placedNotes`, `scopedPlacedNotes`, `currentBoardNotes`도 memoization했다.

```ts
const placedNotes = useMemo(
  () => (mockNotes.length > 0 ? mockNotes : [...apiPlacedNotes, ...visiblePendingNotes]),
  [apiPlacedNotes, mockNotes, visiblePendingNotes],
);

const scopedPlacedNotes = useMemo(
  () => placedNotes.filter((note) => isNoteInChannel(note, category.id, channel.id)),
  [category.id, channel.id, placedNotes],
);

const currentBoardNotes = useMemo(
  () => getPlacedNotesForBoard(placedNotes, boardIndex, boardScope),
  [boardIndex, boardScope, placedNotes],
);
```

이렇게 하면 `scale`, `pan`, `focusedNoteId`만 바뀌는 경우에는 포스트잇 데이터 배열이 불필요하게 새로 만들어지는 일을 줄일 수 있다.

## 변경 2: 스티커 버튼 memoization

`RollingPaperBoardCanvas.tsx`에서 개별 스티커 버튼을 `PlacedStickerButton` 컴포넌트로 분리하고 `memo`를 적용했다.

```tsx
const PlacedStickerButton = memo(
  function PlacedStickerButton({ note, isFocused, onFocus }: PlacedStickerButtonProps) {
    const handleClick = useCallback(() => {
      onFocus(note);
    }, [note, onFocus]);

    return (
      <button
        type="button"
        aria-label={`포스트잇 보기: ${note.message}`}
        className={...}
        style={...}
        onClick={handleClick}
      >
        <RollingPaperSticker colorId={note.colorId} message={note.message} className="w-full" />
      </button>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.onFocus === nextProps.onFocus &&
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.message === nextProps.note.message &&
    prevProps.note.colorId === nextProps.note.colorId &&
    prevProps.note.x === nextProps.note.x &&
    prevProps.note.y === nextProps.note.y,
);
```

비교 조건은 스티커 렌더링 결과에 영향을 주는 값만 포함한다.

- 포커스 여부
- 클릭 핸들러 참조
- 스티커 id
- 메시지
- 색상
- 좌표

이제 보드의 `scale`, `pan`만 바뀌는 경우, 각 스티커는 자신의 props가 바뀌지 않았으므로 다시 렌더링되지 않는다.

## 변경 3: focus handler 안정화

`PlacedStickerButton`이 memoized 되어도 `onFocus` 함수가 매 렌더마다 바뀌면 memo 효과가 줄어든다. 그래서 `focusNote`를 `useCallback`으로 감쌌다.

```ts
const focusNote = useCallback(
  (note: PlacedRollingPaperNote) => {
    const focusScale = getRollingPaperNoteFocusScale(...);
    const nextPan = getRollingPaperPlacementFocusPan(...);

    onScaleChange(focusScale);
    onPanChange(nextPan);
    onFocusedNoteChange(note.id);
  },
  [
    boardNotes.length,
    onFocusedNoteChange,
    onPanChange,
    onScaleChange,
    viewport.height,
    viewport.width,
  ],
);
```

## 변경 4: 원점 복귀 시 포커스 오버레이 제거 지연

원점 복귀 때 `focusedNoteId`를 바로 제거하지 않고, 320ms 뒤에 제거하도록 바꿨다.

```ts
const FOCUS_RESET_ANIMATION_MS = 320;
```

```ts
const resetBoardViewport = (options: { animateFocusedNote?: boolean } = {}) => {
  const animateFocusedNote = options.animateFocusedNote ?? true;

  setBoardScale(ROLLING_PAPER_ZOOM.default);
  setBoardPan(INITIAL_BOARD_PAN);

  clearFocusResetTimeout();
  if (!focusedNoteId || !animateFocusedNote) {
    setFocusedNoteId(null);
    return;
  }

  focusResetTimeoutRef.current = window.setTimeout(() => {
    setFocusedNoteId(null);
    focusResetTimeoutRef.current = null;
  }, FOCUS_RESET_ANIMATION_MS);
};
```

이제 원점 버튼을 누르면 다음 순서로 동작한다.

1. 보드 `scale`, `pan`이 기본값으로 돌아간다.
2. 확대 오버레이의 `left`, `top`, `width`가 기본 보드 위치 기준으로 애니메이션된다.
3. 320ms 후 `focusedNoteId`를 제거해 오버레이를 정리한다.

보드 변경이나 이전/다음 보드 이동처럼 즉시 화면 전환되는 경우에는 지연 제거가 필요 없으므로 `animateFocusedNote: false`로 처리했다.

```ts
resetBoardViewport({ animateFocusedNote: false });
```

## 변경 5: transition 조정

보드 transform과 포커스 오버레이의 transition 시간을 맞췄다.

```tsx
<div className="absolute left-1/2 top-1/2 z-10 transition-transform duration-300 ease-out will-change-transform">
```

```tsx
<button className="absolute z-20 ... transition-[left,top,width] duration-300 ease-out ... will-change-[left,top,width]">
```

이렇게 보드 이동과 확대 오버레이 이동 시간이 맞으면 원점 복귀가 서로 따로 움직이는 것처럼 보이지 않는다.

## 기대 효과

이번 수정으로 기대하는 효과는 다음과 같다.

- 100개 수준의 스티커가 있는 보드에서 확대/축소 중 스티커 SVG 재렌더링 감소
- 스티커 클릭 확대 시 멈칫거림 완화
- 원점 복귀 시 확대 오버레이가 즉시 사라지는 문제 완화
- 기존보다 자연스러운 확대/축소 transition 유지

## 한계와 후속 고려사항

이번 수정은 React 렌더링 비용을 줄이는 작업이다. 하지만 스티커 자체가 SVG raw markup이고, 보드에 100개 가까이 쌓이면 브라우저가 실제로 그려야 하는 DOM/SVG 양은 여전히 많다.

더 강한 최적화가 필요하면 다음을 검토할 수 있다.

- 멀리 있는 스티커는 텍스트를 숨기거나 단순화해서 렌더링
- 현재 viewport 주변 스티커만 full SVG로 렌더링
- 보드가 축소 상태일 때는 스티커를 raster preview로 대체
- `RollingPaperSticker` SVG를 memoization하거나 asset 렌더링 방식을 더 가볍게 변경
- pan/zoom 제스처 중 state 업데이트를 줄이고 transform을 imperative하게 처리

다만 이런 방식은 시각 품질이나 접근성, 클릭 영역에 영향을 줄 수 있어서 별도 검증이 필요하다.

## 검증

다음 검증을 진행했다.

- `pnpm build` 통과
- `pnpm lint` 통과
- 모바일 viewport에서 `rollingPaperMock=100`으로 스티커 100개 보드 확인
- 스티커 클릭 후 포커스 오버레이가 생성되는 것 확인
- 원점 클릭 직후 포커스 오버레이가 유지되고, 애니메이션 시간 이후 제거되는 것 확인

빌드 중 기존 경고는 남아 있다.

- 현재 Node.js `20.12.2`는 Vite 권장 버전 `20.19+`보다 낮다는 경고
- `runtime-env.js` script 관련 Vite 경고
- `src/apis/modules/upload.ts` 재export 관련 Rollup circular dependency 경고
- chunk size 경고

이 경고들은 이번 포커스 인터랙션 성능 수정으로 새로 생긴 문제는 아니다.
