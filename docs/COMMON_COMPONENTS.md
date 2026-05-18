# 공통 컴포넌트

`src/components/common/`에 위치한 공통 컴포넌트 목록과 사용 가이드.

---

## 탭 구현 방식

프로젝트에서 탭은 세 가지 방식으로 구현되어 있다. **탭이 독립적인 페이지인가, 하나의 화면 안에서 콘텐츠를 전환하는 수단인가**에 따라 방식을 선택했다.

### 1. 라우터 기반 (TabNavigation)

탭 전환 = URL 변경. 각 탭이 독립적인 페이지일 때 사용한다.

```tsx
// URL: /instating, /instating/apply, /instating/result
<TabNavigation tabs={TABS} layoutId="instating-tab" />
```

- `useLocation`으로 현재 pathname을 읽어 active 탭을 자동 판정
- 딥링크·뒤로가기·새로고침 모두 자연스럽게 동작
- 부모가 상태를 관리할 필요 없음

**사용 중인 곳**: 인스타팅, 스탬프 투어

### 2. Controlled 상태 기반 (TavernTabBar, HobanustagramTabBar)

탭 전환 = URL 변경 없음. 하나의 화면 안에서 콘텐츠만 바뀔 때 사용한다.

```tsx
const [activeTab, setActiveTab] = useState<TopTab>('intro');

<TavernTabBar activeTab={activeTab} onTabChange={setActiveTab} />;

{
  activeTab === 'intro' && <IntroOverview />;
}
{
  activeTab === 'map' && <MapOverview />;
}
```

- URL은 고정, 부모 컴포넌트가 `useState`로 현재 탭을 관리
- 딥링크가 불필요하거나 URL 변경이 어색한 경우에 적합

**사용 중인 곳**: 주막(TavernTabBar), 호반우스타그램(HobanustagramTabBar)

> **참고 — searchParams 방식**: URL은 유지하면서 딥링크가 필요하다면 `/tavern?tab=reservation` 형태의 쿼리 파라미터(`useSearchParams`)도 선택지다. controlled과 라우터 기반의 중간 지점으로, 현재는 사용하지 않는다.

> **왜 하나로 통합하지 않았나**: controlled(상태 기반)과 라우터 기반은 active 판정 방식이 근본적으로 달라, 하나로 합치면 TabNavigation에 불필요한 분기와 props가 생긴다. 시각적 일관성은 `TabBar`와 `tabIndicatorTransition` 공유로 충분하다.

### 3. 명시적 activeKey + path 네비게이션 혼용 (RollingPaperTabs)

클릭 시 라우터 이동은 하지만, active 판정은 부모가 직접 내려준다.

```tsx
// URL이 /rolling-paper/categories/123/channels/456처럼 깊어지므로
// 라우터 자동 감지 대신 명시적 prop 사용
<RollingPaperTabs active="board" />
```

URL 구조가 복잡해 자동 감지 로직이 불안정해질 수 있을 때의 예외 케이스. 가능하면 라우터 기반이나 controlled 중 하나로 통일하는 것이 낫다.

---

## TabNavigation

탭 목록을 props로 주입받아 경로 기반 탭 UI를 렌더링한다. 인스타팅과 스탬프 투어가 공유한다.

내부적으로 `TabBar`를 감싸며, 라우터 기반 active 판정 로직만 담당한다.

```tsx
import TabNavigation from '@/components/common/TabNavigation';

const TABS = [
  { label: '소개', path: '/stamptour' },
  { label: '부스 위치 확인하기', path: '/stamptour/booths' },
] as const;

<TabNavigation tabs={TABS} layoutId="stamptour-tab" />;
```

### Props

| prop       | type                                         | default           | 설명                                                                       |
| ---------- | -------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `tabs`     | `readonly { label: string; path: string }[]` | —                 | 탭 목록                                                                    |
| `layoutId` | `string`                                     | `"tab-indicator"` | Framer Motion layoutId. 페이지별로 다른 값을 주어야 애니메이션이 격리된다. |

### 활성 탭 판정

다른 탭의 path prefix가 되는 탭(인덱스 탭)은 자동으로 exact 매칭, 나머지는 `startsWith`로 판정한다.

예) `/stamptour`는 `/stamptour/booths`의 prefix이므로 exact 매칭 적용.

### 도메인 래퍼

각 도메인은 탭 목록을 고정 주입하는 래퍼를 유지한다.

- `src/components/instating/TabNavigation.tsx` — 인스타팅 3개 탭 주입, `layoutId="instating-tab"`
- `StampTourPage`에서 직접 주입 (래퍼 없음)

## TabBar

탭 렌더링 전용 primitive 컴포넌트. active 판정 로직 없이 `activeKey`를 받아 그대로 표시한다. `TabNavigation`, `TavernTabBar`, `HobanustagramTabBar`, `RollingPaperTabs`가 이 컴포넌트를 감싼다.

탭 indicator 애니메이션은 `tabIndicatorTransition`(`@/constants/animation`)으로 통일되어 있어, 새로운 탭 컴포넌트를 만들 때 동일한 상수를 사용하면 된다.

---

## OutlineButton

테두리형 버튼. 색상 variant와 아이콘을 지원한다.

```tsx
import OutlineButton from '@/components/common/OutlineButton';

// 기본 (default variant)
<OutlineButton label="바로 신청하기" icon={forwardArrowIcon} onClick={handler} />

// 빨간색 + 화살표
<OutlineButton label="부스 위치 확인하기" variant="red" showArrow onClick={handler} />

// 다크
<OutlineButton label="결과 확인하기" variant="dark" onClick={handler} />
```

### Props

| prop        | type                                      | default     | 설명                                                 |
| ----------- | ----------------------------------------- | ----------- | ---------------------------------------------------- |
| `label`     | `string`                                  | —           | 버튼 텍스트                                          |
| `variant`   | `'default' \| 'red' \| 'glass' \| 'dark'` | `'default'` | 색상 테마                                            |
| `icon`      | `string`                                  | —           | 이미지 아이콘 src. `showArrow`와 함께 사용 가능      |
| `showArrow` | `boolean`                                 | `false`     | 인라인 SVG 화살표 표시. 색상은 variant에서 자동 결정 |
| `onClick`   | `() => void`                              | —           | 클릭 핸들러                                          |

### Variant 색상표

| variant   | border     | background  | text      |
| --------- | ---------- | ----------- | --------- |
| `default` | `black`    | transparent | `#111`    |
| `red`     | `#FF3D3D`  | transparent | `#FF3D3D` |
| `glass`   | `white/50` | `white/30`  | `#1A1A1A` |
| `dark`    | `white`    | `#1a1a1a`   | `white`   |

### 마이그레이션 노트

인스타팅의 기존 `dark` boolean prop은 `variant="dark"`로 교체됐다.

```tsx
// before
<OutlineButton label="결과 확인하기" dark onClick={handler} />

// after
<OutlineButton label="결과 확인하기" variant="dark" onClick={handler} />
```

---

## ProcessCard

배경 이미지와 일러스트가 있는 스텝 카드. 인스타팅과 스탬프 투어가 공유한다.

```tsx
import ProcessCard from '@/components/common/ProcessCard';

<ProcessCard
  step="Step 1"
  title="부스 방문하기"
  description="축제 지도에 표시된 부스를 탐방해 보세요."
  bgSrc={step1Bg}
  illustSrc={step1Img}
/>;
```

### Props

| prop          | type              | 설명                         |
| ------------- | ----------------- | ---------------------------- |
| `step`        | `string`          | 스텝 레이블 (예: `"Step 1"`) |
| `title`       | `string`          | 카드 제목                    |
| `description` | `React.ReactNode` | 설명 텍스트. JSX 허용        |
| `bgSrc`       | `string`          | 배경 이미지 src              |
| `illustSrc`   | `string`          | 하단 일러스트 src            |

### 스타일 기준

인스타팅 디자인을 기준으로 통일했다.

- step 레이블: `text-body1 font-bold text-ink`
- title: `text-subheading font-bold text-ink`
- 배경 그라디언트 각도: `132.09deg`

---

## 파일 구조

```
src/components/common/
├── TabBar.tsx
├── TabNavigation.tsx
├── OutlineButton.tsx
├── ProcessCard.tsx
├── GradientBanner.tsx
├── SectionTitle.tsx
├── ContactSection.tsx
├── FaqAccordion.tsx
└── ScrollToTop.tsx
```
