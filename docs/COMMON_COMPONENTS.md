# 공통 컴포넌트

`src/components/common/`에 위치한 공통 컴포넌트 목록과 사용 가이드.

---

## TabNavigation

탭 목록을 props로 주입받아 경로 기반 탭 UI를 렌더링한다. 인스타팅과 스탬프 투어가 공유한다.

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
├── TabNavigation.tsx
├── OutlineButton.tsx
├── ProcessCard.tsx
├── GradientBanner.tsx
├── SectionTitle.tsx
├── ContactSection.tsx
├── FaqAccordion.tsx
└── ScrollToTop.tsx
```
