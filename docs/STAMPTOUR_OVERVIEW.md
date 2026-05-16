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

부스 위치 확인하기 탭 뷰. 부스 데이터(`BOOTHS` 상수)를 포함하며 `BoothCard`를 아코디언 형태로 렌더링한다.

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

부스 상세 아코디언 카드. `isExpanded` 상태에 따라 진행장소·시간·대상·지도 이미지를 CSS grid로 애니메이션 展開한다.

## 파일 구조

```
src/
├── pages/
│   └── StampTourPage.tsx              ← 레이아웃 (TabNavigation + Outlet)
└── components/stampTour/
    ├── views/
    │   ├── StampTourIntroView.tsx      ← 소개 탭
    │   └── StampBoothListView.tsx      ← 부스 위치 탭
    ├── StampTourContext.tsx            ← 소개 탭 본문
    ├── BoothCard.tsx                   ← 부스 아코디언 카드
    └── ZoneBadge.tsx                   ← ZONE 레이블 배지
```
