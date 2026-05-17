# 주막 지도 SVG 렌더링 최적화 정리

## 배경

주막 지도는 `src/assets/images/map.svg`를 기반으로 렌더링한다. 이 SVG는 약 526KB 정도로 파일 자체가 아주 큰 편은 아니지만, 화면에서 크게 렌더링한 뒤 모바일에서 이동/확대/축소를 반복하면 브라우저가 매 제스처마다 큰 레이어를 다시 계산해야 해서 버벅임이 발생할 수 있다.

이 문제를 줄이기 위해 이전에는 SVG를 런타임에 `canvas`로 그려서 사용하는 방식이 적용되어 있었다. 하지만 이 방식은 다음 문제가 있었다.

- SVG를 고정 픽셀 크기의 canvas로 래스터라이즈하면서 확대 시 선명도가 떨어질 수 있다.
- canvas 크기와 실제 화면 렌더 크기가 맞지 않으면 지도 일부가 흐리거나 깨져 보인다.
- 이미지 로딩, canvas draw, fallback 이미지 전환이 섞이면서 지도 영역이 비어 보이는 상태가 발생할 수 있다.
- WebP로 변환하면 파일과 렌더링 비용은 줄어들지만, 지도처럼 얇은 선과 작은 텍스트가 많은 이미지에서는 압축 손상이 눈에 띈다.

그래서 최종적으로는 SVG 원본을 유지하되, 제스처 중 React 렌더 비용을 줄이는 방향으로 수정했다.

구현 파일은 `src/components/tavern/map/CampusMap.tsx`이다.

## 수정 방향

이번 수정의 목표는 세 가지였다.

1. 지도 화질을 유지한다.
2. 모바일 이동/확대/축소 중 불필요한 React 리렌더를 줄인다.
3. 기존 지도 좌표계와 마커 위치 계산은 유지한다.

따라서 WebP 변환과 canvas 렌더링은 제거하고, `map.svg`를 다시 `<img>`로 직접 렌더링하도록 변경했다.

## 변경 전 구조

기존에는 `CanvasMapImage` 컴포넌트가 SVG를 읽어서 canvas에 다시 그렸다.

```tsx
function CanvasMapImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      canvas.width = MAP_CANVAS_WIDTH;
      canvas.height = MAP_CANVAS_HEIGHT;
      context.drawImage(image, 0, 0, MAP_CANVAS_WIDTH, MAP_CANVAS_HEIGHT);
      setCanvasReady(true);
    };

    image.src = tavernMapImage;
  }, []);

  return <canvas ref={canvasRef} />;
}
```

이 방식은 화면에 보이는 지도는 canvas가 되고, SVG는 canvas가 준비되기 전 fallback처럼 사용된다. 문제는 canvas가 한 번 픽셀 이미지가 된 뒤에는 SVG처럼 무손실 확대가 되지 않는다는 점이다. 지도 텍스트와 선이 많은 이미지에서는 이 차이가 바로 보인다.

## 변경 후 구조

현재는 SVG를 직접 `<img>`로 렌더링한다.

```tsx
<img
  src={tavernMapImage}
  alt="대동제 주막 지도"
  className="pointer-events-none absolute h-auto max-w-none select-none"
  style={mapImageStyle}
  decoding="async"
  draggable={false}
/>
```

이렇게 하면 브라우저가 SVG를 벡터로 렌더링하므로 WebP 압축 손상이나 canvas 래스터라이즈 손상이 발생하지 않는다.

## 이미지 크기 스타일 보정

기존 `mapImageStyle`에는 `width`, `left`, `top`만 있었다. 이번 수정에서는 `height`도 명시했다.

```ts
const mapImageStyle: CSSProperties = {
  width: `${(MAP_RENDER_WIDTH / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
  height: `${(MAP_RENDER_HEIGHT / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
  left: `${(MAP_RENDER_OFFSET_X / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
  top: `${(MAP_RENDER_OFFSET_Y / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
};
```

지도 이미지는 실제 viewport보다 훨씬 크게 렌더링되고, 음수 offset으로 원하는 영역을 보여주는 구조다. 이때 높이를 명시해 두면 브라우저가 이미지 고유 비율을 계산하기 전에도 레이아웃 크기가 안정적으로 잡힌다.

## map layer transform 분리

지도 이미지와 마커는 같은 map layer 안에 있다. 이 layer 하나에만 `translate3d(...) scale(...)`을 적용하면 지도와 마커가 같은 좌표계에서 함께 움직인다.

이번 수정에서는 transform 문자열 생성을 함수로 분리했다.

```ts
const getMapTransform = (scale: number, pan: MapPoint) =>
  `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`;
```

렌더링 시에는 이 값을 사용한다.

```tsx
<div
  ref={mapLayerRef}
  className="absolute left-0 top-0 size-full origin-top-left"
  style={{
    transform: getMapTransform(mapScale, mapPan),
    transition: isGestureActive
      ? 'none'
      : 'transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  }}
>
```

## 제스처 중 React 리렌더 줄이기

가장 중요한 변경은 `applyMapViewport`의 동작 방식이다.

변경 전에는 pointer move가 발생할 때마다 `setMapScale`, `setMapPan`이 실행됐다.

```ts
const applyMapViewport = (nextScale: number, nextPan: MapPoint) => {
  const clampedScale = clampScale(nextScale);
  const clampedPan = clampMapPan(nextPan, clampedScale, viewportSize);

  scaleRef.current = clampedScale;
  panRef.current = clampedPan;
  setMapScale(clampedScale);
  setMapPan(clampedPan);
};
```

모바일 드래그와 핀치에서는 pointer move가 짧은 시간에 매우 많이 발생한다. 그때마다 React state를 갱신하면 `CampusMap` 전체가 계속 다시 렌더링되고, SVG 이미지와 마커 버튼들도 반복적으로 reconciliation 대상이 된다.

변경 후에는 제스처 중에는 DOM style을 직접 갱신하고, React state는 제스처가 끝날 때만 맞춘다.

```ts
const commitMapViewport = () => {
  setMapScale(scaleRef.current);
  setMapPan(panRef.current);
};

const applyMapViewport = (
  nextScale: number,
  nextPan: MapPoint,
  options: { commit?: boolean } = {},
) => {
  const clampedScale = clampScale(nextScale);
  const clampedPan = clampMapPan(nextPan, clampedScale, viewportSize);

  scaleRef.current = clampedScale;
  panRef.current = clampedPan;

  if (mapLayerRef.current) {
    mapLayerRef.current.style.transform = getMapTransform(clampedScale, clampedPan);
  }

  if (options.commit !== false) {
    commitMapViewport();
  }
};
```

## 드래그 처리 변경

한 손가락 드래그 중에는 `commit: false`로 호출한다.

```ts
applyMapViewport(
  scaleRef.current,
  {
    x: panRef.current.x + deltaX,
    y: panRef.current.y + deltaY,
  },
  { commit: false },
);
```

이렇게 하면 손가락이 움직이는 동안에는 map layer의 transform만 바뀐다. React state 업데이트는 일어나지 않으므로 제스처 중 렌더 부담이 줄어든다.

## 핀치 줌 처리 변경

두 손가락 핀치 줌도 같은 방식으로 처리한다.

```ts
applyMapViewport(nextScale, nextPan, { commit: false });
```

확대/축소 기준점 계산, scale 제한, pan 제한 로직은 그대로 유지한다. 달라진 것은 화면 반영 방식뿐이다.

## 제스처 종료 시 상태 동기화

손가락이 모두 떨어지면 ref에 저장된 최신 값을 React state로 커밋한다.

```ts
if (points.length === 0) {
  lastDragPointRef.current = null;
  pinchStateRef.current = null;
  commitMapViewport();
  setIsGestureActive(false);
  return;
}
```

이 과정이 필요한 이유는 React state와 실제 DOM transform을 다시 맞춰 두기 위해서다. 제스처 중에는 DOM transform을 직접 바꿨기 때문에, 제스처가 끝난 뒤 버튼 클릭, 선택 포커스, 리사이즈 같은 React 기반 업데이트가 들어와도 현재 지도 위치가 유지되어야 한다.

## 제거한 코드

이번 수정에서 제거한 요소는 다음과 같다.

- `MAP_CANVAS_WIDTH`
- `MAP_CANVAS_HEIGHT`
- `CanvasMapImage`
- SVG를 `Image` 객체로 로드한 뒤 canvas에 `drawImage`하는 로직
- canvas가 준비되기 전 fallback 이미지를 같이 렌더링하는 로직
- map layer의 `contain: 'layout paint size'`

특히 `contain: 'layout paint size'`는 큰 음수 offset을 가진 절대 위치 이미지와 조합될 때, 브라우저가 페인트 영역을 공격적으로 제한할 수 있어 지도 일부가 보이지 않는 문제를 만들 가능성이 있었다. 현재는 제거했다.

## 왜 WebP가 아니라 SVG인가

WebP는 사진이나 일반 일러스트에는 효율적이지만, 현재 지도처럼 다음 특성이 있는 이미지에는 손상이 눈에 띌 수 있다.

- 얇은 선이 많다.
- 작은 텍스트가 많다.
- 색상 경계가 또렷하다.
- 사용자가 확대해서 본다.

WebP는 래스터 이미지이기 때문에 한 번 픽셀화되면 확대할수록 경계가 흐려진다. 반면 SVG는 벡터라 확대해도 선과 텍스트 형태가 유지된다. 그래서 이 지도에서는 화질 기준으로 SVG가 더 적합하다.

## 성능상 기대 효과

이번 수정은 SVG 자체의 렌더링 비용을 없애는 방식은 아니다. 대신 모바일 제스처 중 가장 자주 발생하던 React 리렌더를 줄인다.

기대하는 개선점은 다음과 같다.

- 드래그 중 `setState` 연속 호출 감소
- 지도 이미지와 마커 리스트의 반복 렌더 감소
- canvas 변환 과정 제거
- WebP 압축 손상 제거
- SVG 원본 화질 유지

다만 SVG가 복잡한 파일인 것은 그대로이므로, 아주 저사양 기기에서는 브라우저의 SVG 페인트 비용이 여전히 남을 수 있다.

## 검증 결과

다음 검증을 진행했다.

- `pnpm build` 통과
- 모바일 viewport 크기에서 `/map` 화면 확인
- mocked API 응답으로 주막 데이터 주입 후 지도 이미지 렌더링 확인
- 드래그 후 map layer의 `transform` 값이 변경되는 것 확인

확인한 transform 예시는 다음과 같다.

```txt
before: translate3d(702.09px, 585.075px, 0px) scale(0.6)
after:  translate3d(642.09px, 545.075px, 0px) scale(0.6)
```

빌드 중 기존 경고는 남아 있다.

- `runtime-env.js` script 관련 Vite 경고
- `src/apis/modules/upload.ts` 재export 관련 Rollup circular dependency 경고
- chunk size 경고

이 경고들은 지도 수정으로 새로 생긴 문제는 아니다.

## 추가로 고려할 수 있는 개선

현재 방식으로도 화질 문제는 해결되지만, SVG 페인트 비용을 더 줄이려면 원본 SVG 자체를 정리하는 것이 가장 효과적이다.

가능한 후속 작업은 다음과 같다.

- SVG 내부의 불필요한 metadata 제거
- 중복 path 병합
- 사용하지 않는 hidden layer 제거
- 텍스트가 path로 변환되어 과도하게 복잡한 경우 단순화
- 지도 줌 레벨에 따라 label 표시 밀도를 조절
- SVG를 여러 타일로 나누고 현재 viewport 주변만 렌더링

다만 타일링은 마커 좌표계와 pan/zoom 계산까지 함께 손봐야 하므로, 지금 단계에서는 direct SVG 렌더링과 제스처 최적화가 가장 낮은 리스크의 해결책이다.
