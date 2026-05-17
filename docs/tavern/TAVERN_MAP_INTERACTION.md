# 주막 지도 인터랙션 구현 정리

## 목적

주막 지도는 모바일 중심으로 사용되기 때문에 정적인 이미지 표시만으로는 전체 지도 탐색이 어렵다. 사용자가 직접 지도 영역을 손가락으로 이동하고, 필요한 경우 확대/축소해서 원하는 주막 위치를 확인할 수 있도록 구현했다.

구현 파일은 `src/components/tavern/map/CampusMap.tsx`이다.

## 핵심 구조

지도는 고정 크기의 viewport와 그 안에서 움직이는 map layer로 나누었다.

```tsx
<div className="relative aspect-square ... overflow-hidden">
  <div
    className="absolute left-0 top-0 size-full origin-top-left"
    style={{
      transform: `translate3d(${mapPan.x}px, ${mapPan.y}px, 0) scale(${mapScale})`,
    }}
  >
    <img src={tavernMapImage} />
    {taverns.map(...)}
  </div>
</div>
```

viewport는 화면에 보이는 영역이고, map layer는 실제 지도 이미지와 마커를 함께 포함한다. `mapPan`은 지도 이동량, `mapScale`은 지도 확대/축소 배율이다.

이 구조를 사용한 이유는 지도 이미지와 주막 마커가 항상 같은 좌표계에서 움직여야 하기 때문이다. 이미지와 마커를 따로 움직이면 확대/축소 시 위치가 어긋날 수 있다.

## 확대/축소 상수

확대/축소 범위는 상단 상수로 분리했다.

```ts
const MAP_MIN_SCALE = 0.1;
const MAP_DEFAULT_SCALE = 0.6;
const MAP_MAX_SCALE = 1;
const MAP_ZOOM_STEP = 0.15;
const INITIAL_MAP_PAN = { x: 420, y: 350 };
```

- `MAP_MIN_SCALE`: 사용자가 최대로 축소할 수 있는 배율
- `MAP_DEFAULT_SCALE`: 초기 진입 및 원점 버튼 클릭 시 돌아가는 배율
- `MAP_MAX_SCALE`: 사용자가 최대로 확대할 수 있는 배율
- `MAP_ZOOM_STEP`: 버튼을 한 번 누를 때 변경되는 배율
- `INITIAL_MAP_PAN`: 초기 진입 및 원점 버튼 클릭 시 돌아가는 지도 위치

원점 배율을 최소 배율과 분리한 이유는 사용자가 더 축소해서 볼 수는 있어야 하지만, 원점은 디자인상 보기 좋은 기본 상태로 돌아가야 하기 때문이다.

## 버튼 기반 축소 / 원점 / 확대

하단에 `축소`, `원점`, `확대` 버튼을 제공한다.

```tsx
<button onClick={() => handleZoom(-MAP_ZOOM_STEP)}>축소</button>
<button onClick={handleReset}>원점</button>
<button onClick={() => handleZoom(MAP_ZOOM_STEP)}>확대</button>
```

버튼 확대/축소는 viewport 중앙을 기준점으로 잡는다.

```ts
const handleZoom = (delta: number) => {
  const nextScale = clampScale(scaleRef.current + delta);
  const center = { x: MAP_VIEWPORT_SIZE / 2, y: MAP_VIEWPORT_SIZE / 2 };
  const nextPan = getAnchoredPan(panRef.current, scaleRef.current, nextScale, center);

  applyMapViewport(nextScale, nextPan);
};
```

단순히 scale만 바꾸면 지도 좌상단 기준으로 확대되어 사용자가 보고 있던 위치가 밀린다. 그래서 `getAnchoredPan`으로 현재 viewport 중앙에 있던 지도 좌표가 확대 후에도 같은 화면 위치에 남도록 pan 값을 다시 계산한다.

원점 버튼은 최소 배율이 아니라 기본 배율과 기본 위치로 복귀한다.

```ts
const handleReset = () => {
  applyMapViewport(MAP_DEFAULT_SCALE, INITIAL_MAP_PAN);
};
```

## 모바일 한 손가락 drag 이동

한 손가락 이동은 Pointer Events로 구현했다.

```ts
const pointerMapRef = useRef(new Map<number, MapPoint>());
const lastDragPointRef = useRef<MapPoint | null>(null);
```

포인터가 하나일 때는 이전 포인터 위치와 현재 포인터 위치의 차이를 구해서 `mapPan`에 더한다.

```ts
const deltaX = point.x - lastDragPointRef.current.x;
const deltaY = point.y - lastDragPointRef.current.y;

applyMapViewport(scaleRef.current, {
  x: panRef.current.x + deltaX,
  y: panRef.current.y + deltaY,
});
```

지도 viewport에는 `touch-none`을 적용했다.

```tsx
<div className="relative aspect-square w-full touch-none overflow-hidden ...">
```

이 설정이 없으면 모바일 브라우저가 기본 스크롤, 확대 같은 제스처를 먼저 처리해서 커스텀 지도 이동과 충돌할 수 있다.

## 모바일 두 손가락 pinch zoom

두 손가락 확대/축소도 Pointer Events로 직접 구현했다.

포인터가 두 개가 되는 순간 현재 두 손가락 사이 거리, 중심점, 현재 scale, 현재 pan을 저장한다.

```ts
pinchStateRef.current = {
  distance,
  center: getCenter(points),
  scale: scaleRef.current,
  pan: panRef.current,
};
```

이후 두 손가락이 움직이면 현재 거리와 시작 거리의 비율로 다음 확대 배율을 계산한다.

```ts
const nextScale = clampScale(pinchState.scale * (getDistance(points) / pinchState.distance));
```

pinch zoom 역시 두 손가락 중심점을 기준으로 확대되어야 한다. 그래서 버튼 확대와 동일하게 `getAnchoredPan`을 사용한다.

```ts
const nextPan = getAnchoredPan(pinchState.pan, pinchState.scale, nextScale, pinchState.center);
```

이렇게 하면 사용자가 두 손가락 사이에 두고 있던 지도 위치가 확대 후에도 손가락 중심에 유지된다.

## 지도 이동 범위 제한

지도는 실제 SVG 렌더 영역 밖으로 무한히 이동하면 안 된다. 그래서 `clampMapPan`에서 현재 scale 기준으로 이동 가능한 최소/최대 pan 값을 계산한다.

```ts
const minX = MAP_VIEWPORT_SIZE - (MAP_RENDER_OFFSET_X + MAP_RENDER_WIDTH) * scale;
const maxX = -MAP_RENDER_OFFSET_X * scale;
const minY = MAP_VIEWPORT_SIZE - (MAP_RENDER_OFFSET_Y + MAP_RENDER_HEIGHT) * scale;
const maxY = -MAP_RENDER_OFFSET_Y * scale;
```

이 계산은 다음 조건을 만족시키기 위한 것이다.

- 지도 이미지의 왼쪽 끝이 viewport 오른쪽으로 밀려나지 않는다.
- 지도 이미지의 오른쪽 끝이 viewport 왼쪽으로 밀려나지 않는다.
- 지도 이미지의 위쪽 끝이 viewport 아래로 밀려나지 않는다.
- 지도 이미지의 아래쪽 끝이 viewport 위로 밀려나지 않는다.

최종 pan 값은 이 범위 안으로 제한한다.

```ts
return {
  x: clamp(pan.x, minX, maxX),
  y: clamp(pan.y, minY, maxY),
};
```

## Figma 기준 최대 확대 범위 반영

Figma 노드에는 지도 영역이 `주막(최대크기_최대의 6x)` 기준으로 설계되어 있었다. 따라서 코드에서도 최대 확대 배율을 상수로 분리해 관리할 수 있게 했다.

```ts
const MAP_MAX_SCALE = 1;
```

현재 구현에서는 신규 지도 리소스가 이미 Figma 내에서 크게 렌더링된 상태이기 때문에 실제 UX 기준으로 `1`을 최대값으로 두었다. 만약 Figma 기준의 6배 확대를 그대로 허용하려면 아래처럼 조정하면 된다.

```ts
const MAP_MAX_SCALE = 6;
```

다만 최대 배율을 높이면 마커와 지도 이미지가 함께 커지기 때문에, 모바일에서 마커 선택성과 탐색 UX를 같이 확인해야 한다.

## 상태 업데이트 방식

`mapScale`, `mapPan`은 React state로 렌더링에 사용하고, 동시에 ref에도 저장한다.

```ts
const scaleRef = useRef(MAP_DEFAULT_SCALE);
const panRef = useRef(INITIAL_MAP_PAN);
```

제스처 이벤트는 짧은 시간에 연속으로 발생한다. 이벤트 핸들러 안에서 최신 scale/pan 값이 필요하기 때문에 state만 사용하지 않고 ref를 함께 사용했다.

```ts
const applyMapViewport = (nextScale: number, nextPan: MapPoint) => {
  const clampedScale = clampScale(nextScale);
  const clampedPan = clampMapPan(nextPan, clampedScale);

  scaleRef.current = clampedScale;
  panRef.current = clampedPan;
  setMapScale(clampedScale);
  setMapPan(clampedPan);
};
```

모든 확대, 축소, 이동은 `applyMapViewport`를 거치기 때문에 scale 제한과 pan 제한이 일관되게 적용된다.

## 마커 좌표 처리

마커는 지도 이미지와 같은 map layer 안에 렌더링한다.

```tsx
{
  taverns.map((tavern) => <button style={getMapMarkerStyle(tavern)} />);
}
```

이렇게 하면 지도 이미지가 이동하거나 확대될 때 마커도 같은 transform을 적용받는다. 결과적으로 지도와 마커 위치가 분리되지 않는다.

마커 클릭 시에는 지도 drag 이벤트와 충돌하지 않도록 포인터 이벤트 전파를 막았다.

```tsx
onPointerDown={(event) => event.stopPropagation()}
```

이를 적용하지 않으면 마커를 누르는 동작이 지도 이동 제스처로도 해석될 수 있다.

## 정리

현재 지도 인터랙션은 별도 라이브러리 없이 직접 구현했다.

- 버튼 클릭으로 확대/축소/원점 복귀
- 한 손가락 drag로 지도 이동
- 두 손가락 pinch로 지도 확대/축소
- 지도 이동 범위 clamp 처리
- 지도 이미지와 마커를 같은 transform layer에서 렌더링
- 원점 배율과 최소 배율 분리

이 구조는 외부 라이브러리 의존성이 없고, Figma에서 지정한 지도 렌더링 위치와 프로젝트의 마커 좌표계를 직접 맞출 수 있다는 장점이 있다.
