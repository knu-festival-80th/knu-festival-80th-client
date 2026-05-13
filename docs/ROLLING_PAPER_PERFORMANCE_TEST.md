# Rolling Paper Performance Test

## 목적

한 보드에 포스트잇을 몇 개까지 허용할지 결정하기 위해 렌더링 성능과 탐색 UX를 분리해서 측정한다.

## 테스트 데이터

개발 환경에서 롤링페이퍼 보드 URL에 `rollingPaperMock` query를 붙이면 더미 포스트잇을 강제로 주입한다.

```txt
/rolling-paper/board?rollingPaperMock=10
/rolling-paper/board?rollingPaperMock=30
/rolling-paper/board?rollingPaperMock=50
/rolling-paper/board?rollingPaperMock=80
/rolling-paper/board?rollingPaperMock=100
/rolling-paper/board?rollingPaperMock=200
```

지원 개수는 `10 / 30 / 50 / 80 / 100 / 200`이다. 데이터는 `src/mocks/rollingPaperPerformance.ts`에서 생성하고, 위치는 실제 서비스 배치 함수인 `findNearestAvailableRollingPaperPlacement`를 사용한다.

단, `200`은 서비스 수용량 검증이 아니라 강제 렌더링 스트레스 테스트다. 현재 충돌 방지 규칙을 유지하면 200개를 모두 배치할 수 없으므로, 배치 함수가 실패한 항목은 촘촘한 격자 좌표로 강제 주입한다. 따라서 200개 결과는 UX 상한 판단보다 렌더링 부하와 frame drop 확인에 사용한다.

## 성능 측정

Chrome Performance Profiler로 다음 항목을 비교한다.

- 초기 보드 렌더링 시간
- 포스트잇 클릭 후 포커스 확대까지 걸리는 시간
- 확대/축소 및 드래그 중 FPS
- frame drop 발생 구간

개발 환경에서는 콘솔에 다음 측정값이 출력된다.

```txt
[rolling-paper:performance] render-50-notes: 00.00ms
[rolling-paper:performance] focus-50-notes: 00.00ms
```

React DevTools Profiler에서는 `RollingPaperBoardCanvas`와 `RollingPaperSticker`의 re-render 횟수를 확인한다.

## UX 측정

모바일 화면 기준으로 다음 항목을 관찰한다.

- 원하는 포스트잇을 찾는 데 걸리는 시간
- 포스트잇 클릭 확대 후 원점 복귀까지 걸리는 시간
- 100개 기준에서 보드가 시각적으로 답답해지는지 여부
- 사용자가 “가득 찼다”고 느끼는 개수

## 판단 기준 예시

- 드래그 중 FPS가 45 이하로 자주 떨어지면 불편한 상태로 본다.
- 포스트잇 클릭 후 포커스 확대가 300ms 이상 멈칫하면 불편한 상태로 본다.
- 100개에서 탐색 시간이 급격히 늘면 수용량보다 보드 분할을 우선 검토한다.
