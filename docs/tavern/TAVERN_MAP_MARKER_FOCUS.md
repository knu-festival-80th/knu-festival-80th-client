# 주막 지도 마커 클릭 포커스 구현 정리

## 목적

주막 지도는 `booths/map` API에서 받은 `xRatio`, `yRatio`를 기준으로 마커를 렌더링한다.

기존에는 사용자가 특정 부스 마커를 클릭하면 선택 상태와 하단 카드만 변경되었다. 지도 자체는 사용자가 보고 있던 위치와 확대 비율을 유지했기 때문에, 축소 상태에서는 선택한 부스가 화면에서 작게 보이거나 주변 맥락을 파악하기 어려웠다.

이번 작업에서는 마커 클릭 시 해당 부스 위치로 지도가 자동 이동하고, 동시에 확대되도록 변경했다.

## 구현 파일

```txt
src/components/tavern/map/CampusMap.tsx
```

## 지도 좌표계

지도는 다음 세 가지 좌표계를 함께 사용한다.

- API 좌표: 백엔드에서 내려주는 `xRatio`, `yRatio`
- 기준 좌표: `MAP_BASE_VIEWPORT_SIZE = 335` 기준으로 환산한 지도 내부 좌표
- 실제 화면 좌표: 현재 viewport 크기에 맞춰 다시 스케일링된 좌표

API 좌표는 먼저 지도 이미지 렌더 영역 기준 좌표로 변환된다.

```ts
const getMapPoint = (tavern: Tavern) => {
  const x = clampRatio(tavern.xRatio) * festivalMap.width * MAP_RENDER_SCALE + MAP_RENDER_OFFSET_X;
  const y = clampRatio(tavern.yRatio) * festivalMap.height * MAP_RENDER_SCALE + MAP_RENDER_OFFSET_Y;

  return { x, y };
};
```

여기서 `MAP_RENDER_OFFSET_X`, `MAP_RENDER_OFFSET_Y`는 Figma 지도 이미지가 viewport 내부에서 배치되는 위치를 맞추기 위한 보정값이다.

## viewport 크기 보정

지도 viewport는 모바일 화면 폭에 따라 달라질 수 있다. 따라서 `335px` 기준 좌표를 실제 viewport 크기에 맞춰 다시 환산해야 한다.

```ts
const getViewportRatio = (viewportSize: number) => viewportSize / MAP_BASE_VIEWPORT_SIZE;
```

마커 포커스에서도 동일한 환산을 사용한다.

```ts
const getScaledMapPoint = (tavern: Tavern, viewportSize: number) => {
  const ratio = getViewportRatio(viewportSize);
  const point = getMapPoint(tavern);

  return {
    x: point.x * ratio,
    y: point.y * ratio,
  };
};
```

이 과정을 거치지 않으면 PC, 모바일, 좁은 viewport에서 같은 `xRatio/yRatio`라도 실제 화면상 중앙 정렬 위치가 달라질 수 있다.

## 포커스 pan 계산

지도는 아래 transform으로 이동과 확대를 처리한다.

```tsx
transform: `translate3d(${mapPan.x}px, ${mapPan.y}px, 0) scale(${mapScale})`;
```

즉, 화면에 보이는 마커 위치는 다음 공식으로 계산된다.

```txt
screenPoint = mapPan + markerPoint * scale
```

마커를 화면 중앙에 두려면 이 공식을 반대로 풀면 된다.

```txt
mapPan = viewportCenter - markerPoint * scale
```

코드에서는 이 계산을 `getFocusedMapPan`으로 분리했다.

```ts
const getFocusedMapPan = (tavern: Tavern, scale: number, viewportSize: number) => {
  const point = getScaledMapPoint(tavern, viewportSize);
  const center = viewportSize / 2;

  return {
    x: center - point.x * scale,
    y: center - point.y * scale,
  };
};
```

## 클릭 시 확대 배율

클릭 포커스 전용 배율은 별도 상수로 분리했다.

```ts
const MAP_FOCUS_SCALE = 1;
```

현재 지도 최대 확대 배율도 `1`이므로, 마커 클릭 시 현재 허용된 최대 확대 상태로 이동한다.

이 값을 분리한 이유는 다음과 같다.

- 일반 버튼 확대 범위와 마커 클릭 포커스 배율을 독립적으로 조정할 수 있다.
- 나중에 `MAP_MAX_SCALE`을 더 높이더라도 마커 클릭 시 너무 과하게 확대되는 것을 막을 수 있다.
- 디자인 QA 이후 클릭 포커스 배율만 쉽게 조정할 수 있다.

## 마커 클릭 처리

마커 클릭 시 선택 상태를 먼저 갱신하고, interactive 지도에서만 pan/scale을 변경한다.

```ts
const handleSelectTavern = (tavern: Tavern) => {
  onSelectTavern(tavern);

  if (!interactive) return;

  const nextScale = clampScale(MAP_FOCUS_SCALE);
  const nextPan = getFocusedMapPan(tavern, nextScale, viewportSize);
  setIsGestureActive(false);
  applyMapViewport(nextScale, nextPan);
};
```

`interactive` 조건을 둔 이유는 상세 페이지 지도처럼 고정 표시용으로 쓰는 지도에서는 클릭 포커스나 제스처 동작이 필요 없기 때문이다.

## 이동 범위 제한과의 관계

계산된 `nextPan`은 그대로 적용하지 않고 기존의 `applyMapViewport`를 거친다.

```ts
applyMapViewport(nextScale, nextPan);
```

`applyMapViewport` 내부에서는 다음 처리를 공통으로 수행한다.

- scale을 `MAP_MIN_SCALE`과 `MAP_MAX_SCALE` 사이로 제한
- pan을 실제 지도 이미지 렌더 영역 밖으로 나가지 않도록 제한
- React state와 ref 값을 동시에 동기화

따라서 마커가 지도 가장자리 근처에 있는 경우에는 완전히 중앙에 오지 않을 수 있다. 이 경우는 버그가 아니라 지도 이미지가 viewport 밖으로 과도하게 밀려나지 않도록 clamp가 우선 적용된 결과다.

## 기존 제스처와의 충돌 방지

마커는 지도 layer 안에 있기 때문에 클릭 이벤트가 지도 drag 제스처로도 해석될 수 있다. 이를 막기 위해 마커의 `pointerdown`에서 이벤트 전파를 중단한다.

```tsx
onPointerDown={(event) => event.stopPropagation()}
```

이후 실제 선택과 포커스 이동은 `onClick`에서 처리한다.

```tsx
onClick={() => handleSelectTavern(tavern)}
```

이 구조를 사용하면 다음 동작이 분리된다.

- 지도 빈 영역 터치: drag/pinch 제스처
- 마커 터치: 부스 선택 및 자동 포커스

## 결과

마커 클릭 후 다음 동작이 한 번에 수행된다.

- 선택된 마커 스타일 변경
- 선택된 부스명 라벨 표시
- 하단 부스 카드 변경
- 해당 부스 위치로 지도 자동 이동
- 지정된 포커스 배율까지 자동 확대

## 조정 가능한 값

클릭 시 확대 정도는 아래 값으로 조정한다.

```ts
const MAP_FOCUS_SCALE = 1;
```

지도 자체의 최대 확대 가능 범위는 아래 값으로 조정한다.

```ts
const MAP_MAX_SCALE = 1;
```

만약 클릭 시 더 크게 확대하고 싶다면 `MAP_MAX_SCALE`을 먼저 높이고, 그 안에서 `MAP_FOCUS_SCALE`을 원하는 배율로 설정해야 한다.
