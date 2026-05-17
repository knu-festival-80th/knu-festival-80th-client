# ErrorBoundary & Loading UI 아키텍처

에러 처리와 로딩 UI의 계층 구조, 높이 계산 기준, 테스트 방법을 정리한다.

---

## 계층 구조

```
App.tsx
└─ ErrorBoundary (root — 안전망)
   └─ Suspense (root — 안전망)
      └─ Routes
         ├─ MainLayout
         │   └─ <main>
         │       ├─ ErrorBoundary
         │       │   └─ Suspense → PageLoader
         │       │       └─ Outlet (HomePage 등)
         │       └─ Footer
         ├─ DefaultLayout
         │   └─ <main>
         │       ├─ ErrorBoundary
         │       │   └─ Suspense → PageLoader
         │       │       └─ Outlet (페이지들)
         │       │           └─ InstatingPage
         │       │               ├─ TabNavigation
         │       │               └─ ErrorBoundary → InstatingErrorFallback
         │       │                   └─ Outlet (뷰들)
         │       └─ Footer
         └─ ConsoleShell / BoothManageShell (레이아웃 자체 ErrorBoundary 없음)
```

### 에러 전파 규칙

에러는 가장 가까운 상위 `ErrorBoundary`에서 잡힌다.

- **페이지 콘텐츠 에러** → `DefaultLayout` / `MainLayout`의 `ErrorBoundary` 처리 → 헤더/푸터 유지
- **레이아웃 자체 에러** → root `ErrorBoundary` 처리 → 헤더/푸터 없는 전체 화면
- **`ErrorBoundary` 밖에서 발생한 에러** → 상위 `ErrorBoundary`로 전파됨에 주의

---

## ErrorFallback

`src/components/error/ErrorFallback.tsx`

### Props

| prop        | type                                   | 설명                                    |
| ----------- | -------------------------------------- | --------------------------------------- |
| `type`      | `'service' \| 'network' \| 'notFound'` | 에러 종류에 따른 이미지와 메시지        |
| `onRetry`   | `() => void`                           | 전달 시 새로 고침 버튼 표시             |
| `className` | `string`                               | 컨테이너 높이 재정의 (기본값 아래 참고) |

### 높이 계산 기준

`className`을 지정하지 않으면 `min-h-[calc(100dvh-4rem)]`(기본값)이 적용된다.

| 사용 위치                        | `className`                        | 이유                               |
| -------------------------------- | ---------------------------------- | ---------------------------------- |
| root `ErrorBoundary` (`App.tsx`) | `min-h-dvh`                        | 레이아웃 없음, 전체 화면           |
| `DefaultLayout`                  | 기본값 `min-h-[calc(100dvh-4rem)]` | `h-16` spacer 존재                 |
| `MainLayout`                     | `min-h-dvh pt-16`                  | spacer 없음, 헤더가 fixed 오버레이 |

배경색은 `bg-background`(`#f7f8fb`)로 고정되어 있어 어떤 컨텍스트에서 렌더되든 동일한 배경을 보장한다.

---

## ErrorBoundary

`src/components/error/ErrorBoundary.tsx`

### Props

| prop                | type        | 설명                                                           |
| ------------------- | ----------- | -------------------------------------------------------------- |
| `children`          | `ReactNode` | 보호할 컴포넌트 트리                                           |
| `fallback`          | `ReactNode` | 직접 지정할 fallback UI (지정 시 `ErrorFallback` 대신 렌더)    |
| `fallbackClassName` | `string`    | `ErrorFallback`에 전달되는 `className` (에러 타입 감지는 유지) |

### 에러 타입 감지

`fallback`을 지정하지 않으면 자동으로 타입을 감지해 `ErrorFallback`을 렌더한다.

- `ApiClientError` with `status === 0` 또는 `navigator.onLine === false` → `network`
- 그 외 → `service`

`network` 타입만 새로 고침 버튼이 표시된다.

---

## PageLoader

`src/components/common/PageLoader.tsx`

### Props

| prop        | type     | 설명                                       |
| ----------- | -------- | ------------------------------------------ |
| `className` | `string` | 컨테이너 높이 재정의 (기본값: `min-h-dvh`) |

배경색은 `bg-background`(`#f7f8fb`)로 고정되어 `ErrorFallback`과 동일한 배경을 유지한다.

### 높이 계산 기준

`ErrorFallback`과 동일한 기준을 따른다.

| 사용 위치                   | `className`                 |
| --------------------------- | --------------------------- |
| root `Suspense` (`App.tsx`) | 기본값 `min-h-dvh`          |
| `DefaultLayout`             | `min-h-[calc(100dvh-4rem)]` |
| `MainLayout`                | `min-h-dvh pt-16`           |

---

## InstatingErrorFallback

`src/components/instating/InstatingErrorFallback.tsx`

인스타팅 전용 fallback. `InstatingPage` 내부 `ErrorBoundary`에 `fallback` prop으로 전달된다.

- 높이: `min-h-[calc(100dvh-6.75rem)]` (헤더 4rem + 탭 네비게이션 2.75rem 제외)
- 항상 새로 고침 버튼 표시 (`window.location.reload`)

---

## 로딩 상태 처리 방식

현재 앱은 `BrowserRouter` 기반이라 React Router의 `useNavigation` 훅을 사용할 수 없다.  
(`useNavigation`은 `createBrowserRouter` + `RouterProvider` 기반 data router에서만 동작)

따라서 페이지 이동 시 로딩은 `Suspense` fallback(`PageLoader`)으로만 처리한다.

- **최초 진입**: `Suspense`가 `PageLoader`를 전체 콘텐츠 영역에 표시
- **페이지 이동**: `Suspense`가 이전 콘텐츠를 언마운트하고 `PageLoader` 표시

> 투명 오버레이(이전 콘텐츠 유지) 방식은 data router 마이그레이션 후 구현 가능하다.

---

## 로컬 테스트 방법

`src/components/error/DevThrowError.tsx`를 이용해 에러 상태를 강제로 재현할 수 있다.

```tsx
// 테스트 완료 후 이 파일과 사용처를 모두 제거할 것
export default function DevThrowError(): never {
  throw new Error('[DEV] 에러 바운더리 테스트용');
}
```

### 테스트 위치별 확인 항목

| 파일                | 교체 대상    | 확인 항목                                                          |
| ------------------- | ------------ | ------------------------------------------------------------------ |
| `App.tsx`           | `<Suspense>` | 헤더/푸터 없이 `ErrorFallback`이 전체 화면(`min-h-dvh`)을 채우는지 |
| `DefaultLayout.tsx` | `<Outlet />` | 헤더/푸터 유지, `ErrorFallback`이 콘텐츠 영역만 채우는지           |
| `MainLayout.tsx`    | `<Outlet />` | `MainHeader`/푸터 유지, `ErrorFallback`이 헤더 아래를 채우는지     |
| `InstatingPage.tsx` | `<Outlet />` | 탭 네비게이션 유지, `InstatingErrorFallback`이 탭 아래를 채우는지  |

각 파일에 TODO 주석으로 교체 방법이 안내되어 있다. 테스트 완료 후 `DevThrowError.tsx`와 관련 TODO 주석을 모두 제거한다.

### 주의사항

- **한 번에 하나만 활성화**: `DevThrowError`가 여러 위치에 동시에 활성화되면 상위 `ErrorBoundary`가 먼저 잡아 하위 fallback을 확인할 수 없다.
- **network 에러 타입 테스트**: Chrome DevTools → Network → Offline 설정 후 **페이지 새로 고침 금지**. 새로 고침하면 브라우저 자체 오프라인 페이지가 뜬다. 오프라인 설정 후 앱 내 링크를 클릭해 클라이언트 사이드 이동으로 테스트한다.
