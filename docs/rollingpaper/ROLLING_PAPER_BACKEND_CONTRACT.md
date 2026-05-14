# 롤링페이퍼 백엔드 데이터 구조 및 배치 검증 명세

## 목적

롤링페이퍼 포스트잇은 프론트에서 자유 배치되는 UI이지만, 최종 저장 시에는 백엔드가 좌표와 겹침 여부를 검증해야 한다.

이 문서는 현재 프론트 구현 기준으로 백엔드와 맞춰야 할 좌표계, 스티커 타입별 크기, 충돌 검증 방식, API 데이터 구조를 정리한다.

## 현재 프론트 상황

- 보드는 `852px * 852px` 크기의 논리 캔버스를 기준으로 한다.
- 프론트와 백엔드는 실제 화면 픽셀이 아니라 `0~100` 상대좌표를 주고받는다.
- 포스트잇 좌표 `x`, `y`는 좌측 상단이 아니라 **스티커 중심점**이다.
- 스티커 기본 width는 논리 캔버스 기준 `80px`이다.
- 스티커 height는 타입별 SVG 비율로 계산한다.
- 중앙 마스코트/프레임 영역은 포스트잇을 배치할 수 없는 금지 영역이다.
- 현재 프론트의 기본 보드 최대 개수는 `100개`이다.
- 성능/UX 검증을 위해 dev fixture에서는 `200개`까지 강제 테스트할 수 있다.

## 좌표계

프론트가 백엔드로 보내는 좌표는 보드 논리 캔버스 기준 상대좌표이다.

```ts
type RollingPaperPlacement = {
  x: number; // 0~100, 보드 기준 중심 x
  y: number; // 0~100, 보드 기준 중심 y
};
```

백엔드에서 충돌 검증을 할 때는 아래처럼 논리 px로 변환한다.

```ts
const BOARD_WIDTH = 852;
const BOARD_HEIGHT = 852;

const centerX = (x / 100) * BOARD_WIDTH;
const centerY = (y / 100) * BOARD_HEIGHT;
```

## 스티커 타입

프론트에서 사용하는 스티커 타입은 아래 6개이다.

```ts
type RollingPaperStickerType = 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
```

백엔드는 클라이언트가 보낸 `width`, `height`를 그대로 신뢰하기보다, `stickerType` 기준으로 서버 내부 메타데이터를 가지고 있는 것이 안전하다.

```ts
const STICKER_META = {
  red: {
    width: 80,
    height: 80 * (249 / 271),
  },
  yellow: {
    width: 80,
    height: 80 * (270 / 274),
  },
  green: {
    width: 80,
    height: 80 * (361 / 253),
  },
  blue: {
    width: 80,
    height: 80 * (204 / 326),
  },
  purple: {
    width: 80,
    height: 80 * (259 / 259),
  },
  pink: {
    width: 80,
    height: 80 * (271 / 271),
  },
} as const;
```

## 충돌 정책

스티커 SVG는 직사각형이 아니기 때문에 실제 SVG 전체 박스를 기준으로 검증하면 배치 가능한 개수가 크게 줄어든다.

현재 프론트는 시각적으로 자연스러운 밀도를 위해 전체 스티커 박스가 아니라 **축소된 충돌 박스**를 기준으로 겹침을 검증한다.

```ts
const COLLISION_SCALE = 0.6;
```

즉, 실제 SVG 외곽이 조금 겹쳐 보일 수는 있지만, 스티커의 핵심 영역끼리는 겹치지 않도록 하는 정책이다.

만약 백엔드에서 완전한 직사각형 비겹침을 원한다면 `COLLISION_SCALE = 1`로 검증하면 된다. 다만 이 경우 100개 배치는 거의 어려울 수 있고, 현재 프론트의 시각적 배치 정책과 달라질 수 있다.

## 충돌 박스 계산

서버는 `stickerType`, `x`, `y`를 기준으로 아래 충돌 박스를 계산한다.

```ts
type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function getCollisionRect(
  placement: { x: number; y: number },
  stickerType: RollingPaperStickerType,
): Rect {
  const meta = STICKER_META[stickerType];
  const centerX = (placement.x / 100) * 852;
  const centerY = (placement.y / 100) * 852;
  const width = meta.width * 0.6;
  const height = meta.height * 0.6;

  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    right: centerX + width / 2,
    bottom: centerY + height / 2,
  };
}
```

겹침 여부는 AABB 방식으로 판단한다.

```ts
function doRectsOverlap(a: Rect, b: Rect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
```

## 보드 경계 검증

스티커 중심점은 `0~100` 안에 있어도 스티커 일부가 보드 밖으로 나갈 수 있다.

따라서 백엔드는 스티커 실제 크기 기준으로 보드 내부에 들어오는지 검증해야 한다. 이 검증은 충돌 박스가 아니라 **실제 스티커 전체 크기** 기준으로 하는 것이 좋다.

프론트 기준 padding은 아래와 같다.

```ts
const BOARD_PADDING_PX = {
  top: 20,
  right: 14,
  bottom: 20,
  left: 14,
};
```

검증 방식은 아래와 같다.

```ts
function isInsideBoard(placement: { x: number; y: number }, stickerType: RollingPaperStickerType) {
  const meta = STICKER_META[stickerType];
  const centerX = (placement.x / 100) * 852;
  const centerY = (placement.y / 100) * 852;

  return (
    centerX - meta.width / 2 >= 14 &&
    centerX + meta.width / 2 <= 852 - 14 &&
    centerY - meta.height / 2 >= 20 &&
    centerY + meta.height / 2 <= 852 - 20
  );
}
```

## 중앙 프레임 금지 영역

중앙 마스코트/프레임 주변에는 포스트잇을 배치할 수 없다.

현재 프론트의 프레임 영역은 아래와 같다.

```ts
const FRAME = {
  width: 320,
  height: 320,
  blockedPadding: 26,
};
```

프레임은 보드 중앙에 위치한다.

```ts
const frameRect = {
  x: (852 - 320) / 2,
  y: (852 - 320) / 2,
  width: 320,
  height: 320,
};

const blockedFrameRect = {
  left: frameRect.x - 26,
  top: frameRect.y - 26,
  right: frameRect.x + frameRect.width + 26,
  bottom: frameRect.y + frameRect.height + 26,
};
```

신규 포스트잇의 충돌 박스가 `blockedFrameRect`와 겹치면 저장을 거부한다.

## 생성 요청 데이터 구조

프론트는 포스트잇 생성 시 아래 형태로 전달하는 것을 권장한다.

```ts
type CreateRollingPaperNoteRequest = {
  boardId: number;
  boardVariant: number;
  stickerType: RollingPaperStickerType;
  message: string;
  placement: {
    x: number;
    y: number;
  };
};
```

예시:

```json
{
  "boardId": 1,
  "boardVariant": 0,
  "stickerType": "green",
  "message": "오랜 시간 쌓아온 전통처럼 앞으로도 빛나길!",
  "placement": {
    "x": 37.42,
    "y": 62.15
  }
}
```

## 생성 응답 데이터 구조

백엔드는 저장된 최종 좌표를 응답한다.

프론트가 요청한 좌표가 충돌되거나 금지 영역과 겹치는 경우, 백엔드가 가까운 대체 좌표를 찾아 저장할 수도 있고, 저장을 거부할 수도 있다. 정책은 둘 중 하나로 통일해야 한다.

### 권장안 A: 백엔드가 최종 좌표를 확정해서 반환

```ts
type CreateRollingPaperNoteResponse = {
  id: string;
  boardId: number;
  boardVariant: number;
  stickerType: RollingPaperStickerType;
  message: string;
  placement: {
    x: number;
    y: number;
  };
  createdAt: string;
};
```

장점:

- 동시성 상황에서 백엔드가 최종 배치를 확정할 수 있다.
- 프론트는 응답 좌표를 그대로 렌더링하면 된다.

### 권장안 B: 충돌 시 저장 거부

```ts
type RollingPaperPlacementErrorResponse = {
  code:
    | 'ROLLING_PAPER_PLACEMENT_CONFLICT'
    | 'ROLLING_PAPER_BOARD_FULL'
    | 'ROLLING_PAPER_BLOCKED_AREA';
  message: string;
};
```

장점:

- 서버 로직이 단순하다.

단점:

- 사용자가 선택한 위치가 자주 거부될 수 있다.
- 프론트에서 재배치 UX를 추가로 처리해야 한다.

현재 UX 기준으로는 **권장안 A**가 더 자연스럽다.

## 조회 응답 데이터 구조

보드 조회 시 프론트는 아래 데이터만 있으면 렌더링할 수 있다.

```ts
type RollingPaperNoteDto = {
  id: string;
  boardId: number;
  boardVariant: number;
  stickerType: RollingPaperStickerType;
  message: string;
  placement: {
    x: number;
    y: number;
  };
  createdAt: string;
};

type RollingPaperBoardResponse = {
  boardId: number;
  boardVariant: number;
  maxNotes: number;
  notes: RollingPaperNoteDto[];
};
```

## 동시성 처리

동시에 여러 사용자가 같은 보드에 포스트잇을 붙일 수 있으므로, 백엔드는 저장 시점에 다시 검증해야 한다.

권장 흐름:

1. 프론트가 요청 좌표와 스티커 타입을 보낸다.
2. 백엔드가 해당 보드의 현재 포스트잇 목록을 잠금 또는 트랜잭션 안에서 조회한다.
3. 보드 최대 개수를 검증한다.
4. 보드 경계, 중앙 금지 영역, 기존 포스트잇 충돌 여부를 검증한다.
5. 충돌이 없으면 저장한다.
6. 충돌이 있으면 가까운 대체 위치를 찾거나 에러를 반환한다.
7. 저장된 최종 좌표를 응답한다.

## 프론트와 백엔드가 반드시 맞춰야 할 값

아래 값이 프론트와 백엔드에서 달라지면 배치 결과가 어긋날 수 있다.

```ts
const BOARD_WIDTH = 852;
const BOARD_HEIGHT = 852;
const NOTE_WIDTH = 80;
const COLLISION_SCALE = 0.6;
const MAX_NOTES_PER_BOARD = 100;

const FRAME_WIDTH = 320;
const FRAME_HEIGHT = 320;
const FRAME_BLOCKED_PADDING = 26;

const BOARD_PADDING = {
  top: 20,
  right: 14,
  bottom: 20,
  left: 14,
};
```

## 백엔드에 전달할 요약

좌표 `x`, `y`는 픽셀이 아니라 보드 기준 `0~100` 상대좌표이고, 스티커의 중심점이다.

서버는 `stickerType`별 width/height를 내부 메타데이터로 가지고 있어야 한다. 클라이언트가 보낸 width/height를 신뢰하지 않는 것이 좋다.

현재 프론트는 100개 배치를 위해 스티커끼리 약간의 시각적 겹침을 허용하는 방향이고, 실제 충돌 검증은 `collisionScale = 0.6`이 적용된 축소 바운딩박스 기준으로 한다.

완전한 직사각형 비겹침을 원하면 `collisionScale = 1`로 검증하면 되지만, 이 경우 100개 수용은 어려울 수 있다. 따라서 100개 배치를 목표로 한다면 “SVG 전체 외곽 비겹침”이 아니라 “핵심 충돌 영역 비겹침”으로 정책을 정의하는 것이 현실적이다.
