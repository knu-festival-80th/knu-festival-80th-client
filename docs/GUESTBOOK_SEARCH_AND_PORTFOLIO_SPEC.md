# 롤링페이퍼 탐험 모드 및 프론트엔드 포트폴리오 기획

## 1. 방향 재정의

줌/팬 보드는 기본 UX가 아니라 `탐험 모드`입니다.

축제 방명록의 핵심 경험은 "내가 남긴 메시지를 나중에 관리하는 것"보다 "작성 직후 내가 고른 위치에 포스트잇을 직접 붙이는 순간"에 가깝습니다. 따라서 기본 화면은 작성과 읽기가 쉬워야 하고, 위치 선택과 100개 줌 보드는 필요한 순간에만 쓰이도록 설계합니다.

포트폴리오 관점에서는 탐험 모드가 충분히 강한 기술 과제가 됩니다. 다만 사용자에게 이 조작을 강요하면 제품성이 떨어지므로, 기술적 도전은 기본 흐름 뒤에 숨깁니다.

권장안:

- 로그인 없음
- 내 글 찾기 없음
- 닉네임 검색 없음
- 작성 후 보드에서 빈 위치 직접 선택
- 기존 포스트잇을 밀거나 가리지 않는 보호 배치
- 붙이기 완료 후 내 포스트잇 위치로 자동 이동
- 기본 화면은 읽기 쉬운 포스트잇 뷰
- 탐험 모드는 보드 1장당 포스트잇 최대 100개
- 전체 메시지는 여러 보드로 분할
- 탐험 모드에서만 줌/팬 가능한 2D 공간 제공

## 2. 왜 기본 UX와 탐험 모드를 분리해야 하는가

### 기본 UX 관점

모바일 축제 현장에서 사용자는 오래 조작하지 않습니다. 걷는 중, 친구와 있는 중, 부스 대기 중에 잠깐 들어와 메시지를 남길 가능성이 큽니다. 이때 처음부터 줌/팬을 요구하면 사용자는 기능을 어렵게 느낄 수 있습니다.

기본 UX는 다음에 집중합니다.

- 빠르게 작성
- 작성 결과 확인
- 몇 개의 메시지를 바로 읽기
- 복잡한 조작 없이 나가기

### 탐험 모드 관점

100개 정도의 포스트잇이 한 보드에 붙어 있으면 "다 같이 남긴 롤링페이퍼"라는 감각이 살아납니다. 사용자가 원할 때 확대해서 읽고 축소해서 전체 분위기를 보는 경험도 만들 수 있습니다.

다만 이 경험은 선택 사항이어야 합니다.

### 기술 관점

단순 리스트나 그리드보다 다음 문제가 생깁니다.

- 좌표계 설계
- 줌/팬 제스처
- 모바일 pinch zoom
- 사용자가 선택한 좌표의 충돌 검사
- 가까운 빈 위치 추천
- 동시 작성으로 인한 좌표 충돌 보정
- viewport 기준 렌더링 최적화
- zoom level에 따른 LOD 렌더링
- 작성 후 특정 좌표로 카메라 이동
- 대량 mock 데이터 성능 검증
- 접근성과 제스처의 균형

이 문제들은 프론트엔드 포트폴리오에서 설명하기 좋습니다. 핵심은 "사용자에게는 쉬운 기본 UX를 제공하면서, 내부적으로는 복잡한 탐험 모드를 안정적으로 구현했다"는 점입니다.

### 성능

100개 포스트잇은 모바일 DOM으로도 관리 가능한 범위입니다. 다만 전체 1만 개 메시지를 한 번에 렌더링하면 안 됩니다. 1만 개 메시지는 100개 단위의 보드 100장으로 나누고, 클라이언트는 현재 보드와 인접 보드만 가져옵니다.

## 3. 제품 범위

### 포함

- 줌/팬 가능한 롤링페이퍼 보드
- 보드당 최대 100개 포스트잇
- 작성 바텀시트
- 작성 후 위치 직접 선택
- 선택 위치 충돌 검사
- 가까운 빈 위치 추천
- 붙이기 완료 후 자동 위치 이동
- 작성한 포스트잇 하이라이트
- 랜덤 보드 이동
- 이전/다음 보드 이동
- 미니맵 또는 보드 위치 인디케이터
- 신고 기능
- 로딩, 빈 상태, 오류 상태

### 제외

- 로그인
- 내 메시지 목록
- 닉네임 검색
- 찾기 코드
- 수정/삭제
- 실시간 동시 편집
- 기존 포스트잇을 밀어내는 배치
- 다른 포스트잇 본문을 가리는 배치
- 여러 사용자가 동시에 같은 보드를 편집하는 협업 커서
- 무한 캔버스

## 4. UX 플로우

### 4.1 보드 진입

사용자는 `/guestbook`에서 현재 인기 보드 또는 최신 보드를 봅니다.

첫 화면:

- 상단: `80주년 롤링페이퍼`
- 보드 번호: `Board 12 / 100`
- 액션: 이전, 다음, 랜덤, 메시지 남기기
- 중앙: 줌 가능한 롤링페이퍼 보드
- 하단: 줌 컨트롤, 현재 줌 비율, 미니맵

### 4.2 보드 탐색

모바일 제스처:

- 한 손가락 드래그: 보드 이동
- 두 손가락 pinch: 확대/축소
- 더블 탭: 1.0x와 1.6x 사이 토글
- 하단 버튼: 확대, 축소, 원점 복귀

데스크톱:

- wheel: 줌
- drag: pan
- `+`, `-`, `0`: 줌 제어

### 4.3 메시지 작성 및 직접 배치

입력:

- 닉네임
- 메시지
- 포스트잇 색상

배치:

1. 작성 폼을 완료하면 포스트잇 미리보기가 보드 위에 나타납니다.
2. 사용자가 원하는 빈 공간을 탭하거나 드래그해 배치 후보를 정합니다.
3. 클라이언트가 현재 보드 데이터로 충돌 여부를 즉시 표시합니다.
4. 충돌하면 가까운 빈 위치를 추천합니다.
5. `이 위치에 붙이기`를 누르면 서버가 최종 검증 후 좌표를 확정합니다.
6. 클라이언트가 새 포스트잇을 optimistic으로 보드에 추가합니다.
7. 카메라가 해당 포스트잇 위치로 부드럽게 이동합니다.
8. 새 포스트잇이 2초 정도 하이라이트됩니다.
9. 토스트를 보여줍니다: `롤링페이퍼에 붙였어요.`

다음 방문에서 다시 찾는 기능은 제공하지 않습니다. 사용자가 지금 작성한 순간을 확인하는 데 집중합니다.

## 5. 보드 모델

보드는 페이지가 아니라 2D 좌표 공간입니다.

```ts
type GuestbookBoard = {
  id: string;
  boardNo: number;
  totalBoards: number;
  width: number;
  height: number;
  capacity: 100;
  noteCount: number;
  notes: GuestbookNote[];
};
```

```ts
type GuestbookNote = {
  id: string;
  boardId: string;
  nickname: string;
  message: string;
  color: 'yellow' | 'pink' | 'green' | 'blue' | 'white' | 'orange';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  status: 'visible' | 'pending' | 'hidden' | 'deleted';
  reportCount: number;
  createdAt: string;
};
```

좌표 규칙:

- 보드 기본 크기: `2400 x 3200`
- 포스트잇 기본 크기: `220 x 180`
- 사용자는 새 포스트잇의 배치 후보 좌표를 직접 선택합니다.
- 클라이언트는 현재 보드 데이터 기준으로 충돌 여부를 미리 계산합니다.
- 서버는 작성 시점에 배치 가능 여부를 다시 검증하고 최종 좌표를 확정합니다.
- 숨김 처리된 포스트잇은 좌표를 유지한 채 placeholder로 표시하거나 제거합니다.

```ts
type PlacementValidation = {
  isValid: boolean;
  reason?: 'outOfBounds' | 'overlap' | 'capacityFull';
  nearestValidPosition?: {
    x: number;
    y: number;
    rotation: number;
  };
};
```

## 6. API 초안

```txt
GET /guestbook/summary
  전체 메시지 수, 전체 보드 수, 최신 보드 번호

GET /guestbook/boards/:boardNo
  특정 보드와 포스트잇 100개 이하

GET /guestbook/boards/random
  랜덤 보드

POST /guestbook/notes
  포스트잇 작성

POST /guestbook/notes/placement/validate
  선택 위치 배치 가능 여부 검사

POST /guestbook/notes/:noteId/report
  포스트잇 신고
```

작성 요청:

```json
{
  "nickname": "북문지킴이",
  "message": "80주년 대동제 오래 기억할게요!",
  "color": "yellow",
  "boardNo": 18,
  "x": 1240,
  "y": 860,
  "rotation": -3
}
```

작성 응답:

```json
{
  "id": "note_123",
  "boardNo": 18,
  "x": 1240,
  "y": 860,
  "rotation": -3
}
```

배치 검사 응답:

```json
{
  "isValid": false,
  "reason": "overlap",
  "nearestValidPosition": {
    "x": 1320,
    "y": 910,
    "rotation": 2
  }
}
```

## 7. 프론트엔드 아키텍처

```txt
src/components/guestbook/
├─ GuestbookPageShell.tsx
├─ ZoomBoard.tsx
├─ ZoomBoardViewport.tsx
├─ NoteLayer.tsx
├─ NoteCard.tsx
├─ NotePlaceholder.tsx
├─ BoardControls.tsx
├─ BoardMinimap.tsx
├─ ComposerSheet.tsx
├─ PlacementPreview.tsx
├─ PlacementConfirmBar.tsx
├─ ReportSheet.tsx
└─ GuestbookToast.tsx
```

```txt
src/hooks/
├─ useZoomCamera.ts
├─ usePinchZoom.ts
├─ usePanGesture.ts
├─ useViewportCulling.ts
├─ useBoardNavigation.ts
├─ usePlacementCollision.ts
├─ useNearestEmptyPosition.ts
├─ useOptimisticNote.ts
└─ usePrefetchBoards.ts
```

```txt
src/types/guestbook.ts
src/apis/modules/guestbook.ts
src/constants/guestbook.ts
```

## 8. 기술 과제

### 8.1 카메라 좌표계

상태:

```ts
type Camera = {
  x: number;
  y: number;
  scale: number;
};
```

보드 transform:

```css
transform: translate3d(camera.x, camera.y, 0) scale(camera.scale);
transform-origin: 0 0;
```

핵심 과제:

- 화면 좌표와 보드 좌표 변환
- zoom 기준점을 손가락 또는 커서 위치로 유지
- min/max scale 제한
- 보드 밖으로 너무 멀리 pan되지 않도록 clamp

포트폴리오 포인트:

`DOM 기반 2D 캔버스에서 카메라 좌표계를 직접 설계하고, 모바일 pinch zoom과 pan을 안정적으로 처리했다.`

### 8.2 viewport culling

100개만 렌더링하면 필수는 아니지만, 포트폴리오를 위해 확장 가능한 구조로 설계합니다.

방법:

- 현재 viewport를 보드 좌표로 변환
- 각 포스트잇의 bounding box와 viewport 교차 여부 계산
- viewport 주변 buffer 영역 안의 포스트잇만 렌더링
- 렌더링 제외 포스트잇은 미니맵에는 점으로 표시

포트폴리오 포인트:

`1만 개 mock 포스트잇을 생성해도 화면에는 viewport 주변 노드만 렌더링되도록 최적화했다.`

### 8.3 zoom level별 LOD

확대/축소 단계에 따라 렌더링 정보를 바꿉니다.

- `0.25x ~ 0.45x`: 색상 블록과 점만 표시
- `0.45x ~ 0.8x`: 닉네임과 짧은 메시지 1줄
- `0.8x 이상`: 전체 카드 UI

장점:

- 축소 상태에서 글자가 뭉개지지 않습니다.
- DOM 텍스트 렌더링 부담을 줄입니다.
- 사용자는 전체 분위기와 상세 읽기를 자연스럽게 오갑니다.

포트폴리오 포인트:

`지도/캔버스 서비스에서 사용하는 LOD 개념을 UI 컴포넌트에 적용했다.`

### 8.4 직접 배치 충돌 검사

사용자가 직접 고른 위치는 즉시 피드백되어야 합니다.

배치 규칙:

- 기존 포스트잇은 절대 움직이지 않습니다.
- 새 포스트잇은 기존 포스트잇의 본문 영역을 덮을 수 없습니다.
- 카드 그림자나 모서리의 가벼운 겹침은 허용할 수 있습니다.
- 포스트잇 간 최소 여백은 8~16px 기준으로 디자인과 협의합니다.
- 보드 경계를 벗어난 위치는 배치할 수 없습니다.
- 현재 보드가 100개로 가득 찬 경우 새 보드 또는 다른 보드를 추천합니다.

구현 전략:

- 포스트잇의 회전값을 포함한 실제 polygon 충돌은 비용이 크므로 MVP에서는 padding을 포함한 axis-aligned bounding box로 판정합니다.
- 100개 보드는 전체 순회로도 충분하지만, 1,000개 이상 mock 검증을 위해 spatial grid 또는 quadtree 인터페이스를 분리합니다.
- 사용자가 선택한 위치가 막혀 있으면 주변을 나선형으로 탐색해 가장 가까운 유효 위치를 찾습니다.
- 클라이언트 검사는 미리보기용이며, 서버 검사가 최종 기준입니다.

포트폴리오 포인트:

`사용자에게는 자유롭게 붙이는 경험을 제공하면서, 내부적으로는 충돌 검사와 nearest empty position 계산으로 기존 메시지의 가독성을 보호했다.`

### 8.5 작성 후 카메라 이동

붙이기 완료 후 새 포스트잇을 보여주는 흐름이 핵심입니다.

동작:

- 사용자가 고른 좌표 또는 서버가 보정한 좌표를 받습니다.
- 현재 camera에서 target camera를 계산합니다.
- `requestAnimationFrame`으로 400ms 이동합니다.
- 이동이 끝나면 note를 highlight합니다.

포트폴리오 포인트:

`작성 성공 후 확정 좌표를 기반으로 카메라를 이동시키고, 사용자가 자신이 붙인 위치를 즉시 이해하도록 했다.`

### 8.6 optimistic UI

네트워크가 느려도 작성 직후 붙는 느낌을 줍니다.

전략:

- 사용자가 선택한 위치에 임시 포스트잇을 ghost 상태로 렌더링
- 서버 응답 후 확정 좌표가 같으면 visible 상태로 전환
- 동시 작성 충돌로 좌표가 보정되면 ghost를 추천 위치로 이동시키고 재확인을 요구
- 실패 시 임시 포스트잇 제거 및 작성 폼 복구

포트폴리오 포인트:

`UGC 작성 경험에서 낙관적 UI와 실패 복구를 함께 설계했다.`

### 8.7 모바일 제스처 충돌 처리

문제:

- 페이지 스크롤과 보드 pan이 충돌할 수 있습니다.
- pinch zoom 중 브라우저 기본 확대가 개입할 수 있습니다.
- 바텀시트와 보드 드래그가 충돌할 수 있습니다.

전략:

- 보드 영역에서는 `touch-action: none`
- 바텀시트에서는 기본 스크롤 허용
- pointer capture 사용
- pan 시작 threshold 적용
- reduced motion 환경에서는 카메라 애니메이션 축소

포트폴리오 포인트:

`모바일 브라우저의 pointer event 제약을 고려해 복합 제스처를 직접 구현했다.`

## 9. UI/UX 고민

### 9.1 사용자가 길을 잃지 않게 하기

줌 보드는 자유도가 높아질수록 현재 위치를 잃기 쉽습니다.

필요 장치:

- 미니맵
- 현재 줌 배율 표시
- 원점 복귀 버튼
- 새 글 작성 후 자동 포커스
- 보드 경계 그림자

### 9.2 읽기와 탐색의 균형

축소 상태에서는 전체 분위기를 보고, 확대 상태에서는 읽기에 집중해야 합니다.

필요 장치:

- zoom level별 LOD
- 카드 상세 모달
- 확대 시 선택 카드 주변만 강조
- 축소 시 메시지 텍스트 대신 색/밀도 중심 표현

### 9.3 모바일 조작성

작은 화면에서 자유 캔버스를 다루면 조작이 피곤해질 수 있습니다.

필요 장치:

- 하단 고정 컨트롤
- 확대/축소 버튼
- 더블 탭 확대
- 랜덤 보드 버튼
- 작성 CTA는 항상 접근 가능하게 유지

### 9.4 직접 배치의 부담 줄이기

위치를 직접 고르는 경험은 롤링페이퍼의 목적에 맞지만, 모바일에서 오래 걸리면 이탈 요인이 됩니다.

필요 장치:

- 작성 직후 추천 빈 위치를 먼저 보여주기
- 사용자가 원하면 주변으로만 살짝 옮기게 하기
- 배치 가능 여부를 즉시 색과 문구로 피드백
- 충돌 시 `가까운 빈 위치로 이동` 버튼 제공
- 붙이기 완료 후 선택 위치를 중앙에 두고 짧게 강조

## 10. 성능 목표

테스트 기준:

- 100개 포스트잇 보드에서 60fps에 가까운 pan
- 1,000개 mock 포스트잇에서도 viewport culling으로 렌더 노드 제한
- 1만 개 mock 데이터 검색 없이도 보드 전환 안정
- 보드 전환 시 skeleton 300ms 이내 표시
- 인접 보드 prefetch

측정:

- Chrome Performance panel
- React Profiler
- Lighthouse mobile
- Playwright trace
- 렌더링된 note DOM 수 로깅

## 11. 구현 단계

### Step 1. 줌 보드 프로토타입

- 100개 mock 포스트잇 생성
- 좌표 기반 absolute 렌더링
- pan, zoom, reset 구현
- 작성 후 특정 좌표로 이동
- 배치 미리보기 ghost note 구현
- 선택 위치 충돌 검사 구현

### Step 2. 렌더링 최적화

- viewport culling
- LOD 렌더링
- `React.memo`로 NoteCard 최적화
- transform 변경과 note 렌더링 상태 분리
- spatial grid 또는 quadtree 인터페이스 분리

### Step 3. 모바일 UX

- pinch zoom
- double tap zoom
- 하단 컨트롤
- 미니맵
- 바텀시트 작성 폼
- 가까운 빈 위치 추천 버튼
- 배치 가능/불가능 상태 표시

### Step 4. 서버 연동 대비

- board API mock 분리
- React Query 캐싱
- 이전/다음 보드 prefetch
- optimistic create mutation
- placement validate API mock
- 동시 작성 충돌 시 서버 보정 좌표 처리

### Step 5. 포트폴리오 검증

- 100, 1,000, 10,000개 mock 데이터 비교
- culling on/off 성능 비교
- LOD on/off 성능 비교
- collision check 전체 순회와 spatial index 성능 비교
- nearest empty position 탐색 시간 측정
- 모바일 스크린샷과 trace 확보

## 12. 포트폴리오 서술 예시

문제:

`로그인 없는 축제 방명록에서 사용자가 원하는 위치에 직접 포스트잇을 붙이되, 기존 사용자의 메시지를 가리거나 밀어내지 않아야 했다. 동시에 수천 개의 포스트잇을 모바일에서 부담 없이 탐색할 수 있어야 했다.`

해결:

`무한 캔버스 대신 100개 단위의 bounded zoom board로 데이터를 분할했다. 사용자가 선택한 위치는 클라이언트에서 즉시 충돌 검사하고, 막힌 위치는 가장 가까운 빈 공간을 추천하도록 설계했다. 클라이언트는 카메라 좌표계, pinch zoom, pan, viewport culling, LOD 렌더링을 통해 모바일 성능을 유지했다.`

기술:

`React, Emotion, Pointer Events, requestAnimationFrame, React Query, optimistic mutation, collision detection, nearest empty position search, viewport culling, zoom level별 LOD, Playwright 기반 모바일 검증을 적용했다.`

결과:

`사용자는 FigJam처럼 보드를 확대/축소하며 읽을 수 있고, 작성 후에는 자신이 고른 빈 위치에 포스트잇을 붙인 뒤 즉시 피드백을 받는다. 프론트엔드는 1만 개 mock 데이터에서도 현재 viewport 중심으로 렌더링 비용을 제어하고, 배치 검사의 확장성을 설명할 수 있다.`

## 13. 최종 권장안

현재 방향에서는 닉네임 검색보다 `보호된 자유 배치`와 줌 보드가 더 적합합니다.

제품 관점:

- 사용자는 작성 직후 자신이 고른 위치에 붙는 순간을 확인하면 됩니다.
- 다시 찾기 기능을 줄이면 UX와 개인정보 리스크가 단순해집니다.
- 큰 롤링페이퍼를 탐색하고 직접 붙이는 감성이 살아납니다.

기술 관점:

- 단순 리스트 구현을 넘어섭니다.
- 프론트엔드가 해결할 수 있는 성능, 제스처, 좌표계, 충돌 검사 문제가 생깁니다.
- 포트폴리오에서 "왜 어려웠고 어떻게 해결했는지" 설명하기 좋습니다.

따라서 MVP 확장 방향은 `보호된 자유 배치 + 100개 단위 줌 보드 + 붙이기 완료 후 위치 이동 + 렌더링 최적화`를 권장합니다.
