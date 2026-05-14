# Rolling Paper Sticker Text Alignment

## 문제

롤링페이퍼 포스트잇은 6종의 SVG를 사용하고, 각 스티커의 실제 텍스트 가능 영역이 모두 다르다. 단순히 스티커 중앙에 텍스트를 배치하면 다음 문제가 생긴다.

- 스티커 모양에 따라 텍스트가 그림 밖으로 밀린다.
- 작성 모달의 `textarea` 커서 위치와 실제로 보이는 텍스트 위치가 어긋난다.
- 긴 텍스트를 입력할 때 글자 크기만 계속 줄이면 읽기 어렵고, 줄 간격이 크면 제한 글자 수 안에서도 영역을 초과한다.
- 보드에 작게 붙은 스티커와 작성 모달의 큰 미리보기에서 같은 렌더링 기준을 쓰면 한쪽 가독성이 깨진다.

## 해결 방향

스티커별 텍스트 안전 영역을 명시적으로 관리한다. 위치, 크기, 줄 수, 줄당 글자 수를 색상별 설정으로 분리하고, 작성 모달과 보드 표시에서 같은 안전 영역을 사용한다.

핵심 원칙은 다음과 같다.

- 텍스트 위치는 스티커 전체 중앙이 아니라 스티커별 안전 영역 중심을 기준으로 둔다.
- 작성 중에는 실제 `textarea`를 안전 영역 위에 올려 커서와 드래그 선택 위치를 맞춘다.
- 텍스트 길이에 따라 폰트를 계속 줄이지 않고, 고정 글자 크기와 입력 제한으로 영역 초과를 막는다.
- 보드에 붙은 작은 스티커는 `cqw` 단위로 폰트를 계산해 스티커 폭에 비례하게 렌더링한다.

## 구현 파일

- `src/components/rollingPaper/rollingPaperStickerText.ts`: 스티커별 텍스트 안전 영역, 줄 수 계산, 입력 제한 로직
- `src/components/rollingPaper/RollingPaperSticker.tsx`: 스티커 SVG와 텍스트 영역 렌더링
- `src/components/rollingPaper/RollingPaperWriteModal.tsx`: 작성 모달 `textarea` 스타일과 입력 제한 적용
- `src/constants/rollingPaper.ts`: 메시지 최대 길이

## 텍스트 안전 영역

`ROLLING_PAPER_STICKER_TEXT_CONFIG`는 색상별 텍스트 박스 위치와 제약을 가진다.

```ts
type RollingPaperStickerTextConfig = {
  centerX: string;
  centerY: string;
  width: string;
  height: string;
  aspectRatio: number;
  heightRatio: number;
  maxLines: number;
  charsPerLine: number;
};
```

각 필드의 역할은 다음과 같다.

- `centerX`, `centerY`: 스티커 내부 텍스트 박스 중심 위치
- `width`, `height`: 텍스트가 들어갈 수 있는 안전 영역 크기
- `aspectRatio`: 스티커의 세로/가로 비율
- `heightRatio`: 세로 중앙 정렬 계산에 사용하는 텍스트 박스 높이 비율
- `maxLines`: 해당 스티커에서 허용하는 최대 줄 수
- `charsPerLine`: 줄바꿈 예측에 사용하는 줄당 기준 글자 수

## 작성 모달 정렬

작성 모달에서는 `RollingPaperSticker` 내부에 `textarea`를 child로 넣는다. 이때 `RollingPaperSticker`는 내부 `<p>` 텍스트를 렌더링하지 않고, `textarea`가 실제 입력과 표시를 모두 담당한다.

```tsx
<RollingPaperSticker colorId={colorId} message="">
  <textarea
    value={message}
    style={textInputStyle}
    onChange={(event) => updateMessage(event.target.value)}
  />
</RollingPaperSticker>
```

`textarea`는 텍스트 안전 영역 전체를 덮고, `getRollingPaperStickerTextInputStyle`이 글자 크기와 세로 padding을 계산한다.

```ts
const textBlockHeightPx = estimatedLines * FIGMA_MODAL_FONT_SIZE_PX * STICKER_TEXT_LINE_HEIGHT;
const verticalPadding = `max(0px, calc((${textBoxHeightCqw.toFixed(2)}cqw - ${textBlockHeightPx}px) / 2))`;
```

이 방식의 목적은 다음과 같다.

- 한 줄일 때 텍스트가 안전 영역 중앙에 오게 한다.
- 여러 줄일 때 텍스트 블록 전체가 중앙 기준으로 확장되게 한다.
- 실제 입력 커서와 드래그 선택 위치가 표시 텍스트와 같은 좌표에 있게 한다.

## 텍스트 크기와 줄 간격

작성 모달 기준은 다음 값으로 고정한다.

```ts
const FIGMA_MODAL_FONT_SIZE_PX = 11;
const STICKER_TEXT_LINE_HEIGHT = 1.5;
```

초기에는 피그마 기준에 가까운 `line-height: 2`를 사용했지만, 줄 간격이 커서 제한 글자 수 안에서도 텍스트가 안전 영역을 넘는 문제가 있었다. 현재는 `line-height: 1.5`로 줄여 긴 메시지도 더 안정적으로 들어가게 했다.

보드 표시 텍스트는 스티커가 작게 렌더링되기 때문에 고정 `px`가 아니라 컨테이너 폭 기준으로 계산한다.

```ts
fontSize: `clamp(1.79px, ${BOARD_TEXT_FONT_SIZE_CQW}cqw, 12px)`;
```

이 값은 보드에서는 작게 보이고, 포스트잇 포커스 확대 시 함께 커져 읽을 수 있게 만드는 목적이다.

## 입력 제한

현재 메시지 길이 제한은 `ROLLING_PAPER_MAX_MESSAGE_LENGTH = 80`이다.

입력 제한은 두 단계로 처리한다.

1. `textarea`의 `maxLength`로 전체 최대 글자 수를 제한한다.
2. `limitRollingPaperMessageForSticker`에서 스티커별 `maxLines`, `charsPerLine` 기준을 넘는 문자를 잘라낸다.

한글, 영어, 숫자, 공백, 문장부호는 시각적으로 차지하는 폭이 달라서 단순 글자 수 대신 가중치를 사용한다.

```ts
if (/[\u3131-\u318e\uac00-\ud7a3]/.test(character)) return 1;
if (/[a-zA-Z0-9]/.test(character)) return 0.58;
if (/\s/.test(character)) return 0.35;
```

이 계산은 브라우저의 실제 줄바꿈과 완전히 동일하지는 않지만, 입력 단계에서 넘침을 방지하기 위한 가벼운 추정치로 충분하다.

## 커서와 선택 색상

작성 모달의 커서와 드래그 선택 색상은 빨간색이 아니라 파란색 계열로 맞춘다.

```tsx
<textarea className="caret-secondary-blue selection:bg-secondary-blue/20 selection:text-black" />
```

이유는 다음과 같다.

- 빨간 커서는 오류나 경고처럼 보일 수 있다.
- 스티커 색상이 다양하기 때문에 중립적인 포커스 색상이 필요하다.
- 선택 영역이 실제 텍스트 위치와 맞는지 확인하기 쉽다.

## 조정 가이드

스티커 텍스트가 어긋나면 다음 순서로 조정한다.

1. 텍스트가 위아래로 어긋나면 `centerY`를 먼저 조정한다.
2. 텍스트가 좌우로 어긋나면 `centerX`를 조정한다.
3. 텍스트가 그림 영역 밖으로 나가면 `width` 또는 `height`를 줄인다.
4. 입력 가능 글자 수가 너무 적으면 `maxLines`, `charsPerLine`, `STICKER_TEXT_LINE_HEIGHT`를 함께 본다.
5. 작성 모달의 세로 중앙 정렬이 어색하면 `heightRatio`와 `aspectRatio`를 확인한다.

주의할 점은 `width`/`height`만 늘리면 작성 모달에서는 좋아 보여도 보드의 작은 스티커에서 텍스트가 그림 밖으로 나갈 수 있다는 것이다. 작성 모달, 배치 미리보기, 보드 포커스 확대 화면을 함께 확인해야 한다.

## 유지할 원칙

- 스티커별 위치값은 `RollingPaperSticker.tsx`에 직접 넣지 않는다.
- 텍스트 관련 수치는 `rollingPaperStickerText.ts`에 모아 관리한다.
- 작성 모달과 보드 표시가 같은 안전 영역을 사용해야 한다.
- 글자 수가 늘어난다고 폰트를 계속 줄이는 방식은 피한다.
- 보이지 않는 preview 텍스트와 투명 textarea를 겹치는 방식은 사용하지 않는다. 커서 위치와 실제 텍스트 위치가 어긋나기 때문이다.
