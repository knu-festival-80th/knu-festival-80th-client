# 스탬프 투어 구현 개요

## 서비스 개요

스탬프 투어는 축제 부스를 방문하고 미션을 수행하며 스탬프를 모으는 이벤트 페이지다.

참여자는 소개 탭에서 투어 안내와 경품 정보를 확인하고, 부스 위치 탭에서 각 ZONE의 부스 상세 정보와 지도를 열람한다.

## 페이지 구조

```
/stamptour         → 소개 (투어 안내, 스텝, 경품)
/stamptour/booths  → 부스 위치 확인하기 (ZONE별 부스 목록 + 지도)
```

두 화면은 상단 탭 네비게이션(`TabNavigation`)을 공유하고 `<Outlet />`으로 렌더링된다. 탭 전환 시 Framer Motion의 `layoutId="stamptour-tab"`를 활용한 슬라이딩 인디케이터가 적용된다.

## 라우팅

`src/pages/StampTourPage.tsx`가 레이아웃 역할을 한다. `InstatingPage`와 동일한 구조다.

```
StampTourPage (TabNavigation + Outlet)
├── index  → StampTourIntroView
└── booths → StampBoothListView
```

```tsx
// App.tsx
<Route path="/stamptour" element={<StampTourPage />}>
  <Route index element={<StampTourIntroView />} />
  <Route path="booths" element={<StampBoothListView />} />
</Route>
```

## 공통 컴포넌트 사용

스탬프 투어는 아래 공통 컴포넌트를 사용한다. 스펙 상세는 [공통 컴포넌트 문서](./COMMON_COMPONENTS.md)를 참고한다.

| 컴포넌트        | 사용처             | 비고                                     |
| --------------- | ------------------ | ---------------------------------------- |
| `TabNavigation` | `StampTourPage`    | `layoutId="stamptour-tab"`, 탭 직접 주입 |
| `OutlineButton` | `StampTourContext` | `variant="red" showArrow`                |
| `ProcessCard`   | `StampTourContext` | 스텝 카드 3장                            |

## 핵심 컴포넌트

### StampTourPage (`src/pages/StampTourPage.tsx`)

레이아웃 컴포넌트. `TabNavigation`과 `<Outlet />`만 렌더링한다.

### StampTourIntroView (`src/components/stampTour/views/StampTourIntroView.tsx`)

소개 탭 뷰. `GradientBanner`와 `StampTourContext`를 조합한다.

### StampBoothListView (`src/components/stampTour/views/StampBoothListView.tsx`)

부스 위치 확인하기 탭 뷰. `BOOTHS` 상수를 `src/constants/stampTour.ts`에서 import하며 `BoothCard`를 아코디언 형태로 렌더링한다.

첫 번째 부스가 기본 펼침 상태다.

```tsx
const [openBoothId, setOpenBoothId] = useState<number | null>(BOOTHS[0]?.id ?? null);
```

### StampTourContext (`src/components/stampTour/StampTourContext.tsx`)

소개 탭 본문. 다음 세 섹션으로 구성된다.

1. **헤더** — 투어 제목, 설명, "부스 위치 확인하기" 버튼 (`OutlineButton variant="red"`)
2. **스텝 카드** — Step 1~3을 `ProcessCard`로 렌더링
3. **경품** — 1~3위 경품 목록

### BoothCard (`src/components/stampTour/BoothCard.tsx`)

부스 상세 아코디언 카드. `isExpanded` 상태에 따라 진행장소·시간·대상·지도 이미지를 펼치고 닫는다.

`ResizeObserver`로 콘텐츠 영역의 실제 픽셀 높이를 측정해 framer-motion에 전달한다. `height: auto` 방식은 애니메이션 시작 시점에 DOM 측정 → reflow가 발생해 close 시 jank가 생기는데, 픽셀값을 미리 확보해 두면 이 측정 단계 없이 바로 애니메이션한다.

콘텐츠는 항상 DOM에 마운트되어 있으므로 이미지가 카드를 열기 전에 미리 로드된다.

## 이미지 에셋

모든 이미지는 WebP 포맷으로 관리한다. `src/assets/stampTour/` 디렉토리에 위치한다.

| 파일                   | 용도                            | 비고                                                        |
| ---------------------- | ------------------------------- | ----------------------------------------------------------- |
| `stampHero.webp`       | 소개 탭 히어로 이미지           | `fetchPriority="high"`, `width`/`height` 명시 (CLS 방지)    |
| `step_{1~3}.webp`      | ProcessCard 일러스트            | `loading="lazy"`                                            |
| `step_{1~3}_bg.webp`   | ProcessCard 배경                | `loading="lazy"`                                            |
| `prize_{1~3}.webp`     | 경품 이미지 (468px, @3x)        | `loading="lazy"`                                            |
| `prize_stars.webp`     | 경품 별 장식                    | `loading="lazy"`                                            |
| `booth_map_{1~7}.webp` | 부스 위치 지도 (861×692px, @3x) | Figma @3x export, `loading` 생략 (카드 마운트 시 사전 로드) |

> SVG/PNG → WebP 변환으로 `/stamptour` 페이지 이미지 총량이 약 18MB에서 ~566KB로 감소했다.

## 접근성

- **heading 계층**: `GradientBanner`가 `h1`을 렌더링한다. `StampTourContext`의 섹션 제목은 `h2`, `BoothCard`의 부스명은 `h3`으로 계층이 유지된다.
- **TabNavigation**: 활성 탭 버튼에 `aria-current="page"` 적용.
- **BoothCard 토글 버튼**: `aria-expanded={isExpanded}`, `aria-label="{부스명} 상세정보"` 적용.
- **부스 지도 이미지 alt**: `'{부스명} 부스 위치 지도'` 형식으로 각 부스별 의미있는 alt 텍스트 제공.

## 스크롤 진입 애니메이션

`framer-motion`의 `whileInView`를 사용해 각 섹션이 뷰포트에 진입할 때 `opacity: 0, y: 40` → `opacity: 1, y: 0`으로 전환된다. `once: true`라 최초 1회만 실행된다.

공통 설정은 `src/constants/animation.ts`의 `fadeUpVariant`로 관리한다.

```ts
export const fadeUpVariant = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};
```

- **StampTourContext**: 헤더, 히어로 이미지, 스텝 카드, 경품 섹션 각각 독립적으로 적용
- **StampBoothListView**: 제목과 부스 카드 각각 적용. 부스 카드는 `index * 0.08s` 딜레이로 순차 등장

## 데이터 관리

부스 데이터(`Booth` 타입 및 `BOOTHS` 배열)는 `src/constants/stampTour.ts`에서 관리한다. 부스 지도 이미지 import도 함께 포함된다.

`steps`와 `prizes` 데이터는 description에 JSX(`<strong>`, `<br />`)가 포함되어 있어 `StampTourContext.tsx` 내에서 관리한다.

## 파일 구조

```
src/
├── pages/
│   └── StampTourPage.tsx              ← 레이아웃 (TabNavigation + Outlet)
├── constants/
│   ├── stampTour.ts                   ← Booth 타입, BOOTHS 데이터
│   └── animation.ts                   ← fadeUpVariant (공통 애니메이션 설정)
└── components/stampTour/
    ├── views/
    │   ├── StampTourIntroView.tsx      ← 소개 탭
    │   └── StampBoothListView.tsx      ← 부스 위치 탭
    ├── StampTourContext.tsx            ← 소개 탭 본문
    ├── BoothCard.tsx                   ← 부스 아코디언 카드
    └── ZoneBadge.tsx                   ← ZONE 레이블 배지
```
