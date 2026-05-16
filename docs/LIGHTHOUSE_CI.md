# Lighthouse CI

프로덕션 배포 환경(`https://chcse.knu.ac.kr/festival`)의 성능을 측정하기 위한 Lighthouse CI 설정입니다.

## 실행 방법

GitHub Actions 탭에서 수동으로 트리거합니다.

```bash
# GitHub CLI로 실행
gh workflow run lighthouse.yml --field target=prod

# 특정 브랜치 기준으로 실행
gh workflow run lighthouse.yml --ref <branch> --field target=prod
```

`target` 옵션:

- `prod` — `https://chcse.knu.ac.kr/festival` 측정
- `local` — `pnpm preview` 서버 실행 후 `http://localhost:4173` 측정

## 결과 확인

**아티팩트**: Actions 탭 → 해당 run → Artifacts → `lighthouse-prod-run{N}.zip` 다운로드 (90일 보관)

- `lhr-*.json` — Lighthouse Result JSON (상세 데이터)
- `lhr-*.html` — Lighthouse Report HTML (브라우저에서 열기)

**PR 댓글**: 해당 브랜치에 열린 PR이 있으면 점수 테이블이 자동으로 댓글로 등록됩니다.

```
## 🔦 Lighthouse 측정 결과 (`prod`)

| 카테고리       | 점수  |
|----------------|-------|
| Performance    | 🔴 42 |
| Accessibility  | 🟡 80 |
| Best Practices | 🟡 68 |
| SEO            | 🟢 92 |
```

PR이 없으면 댓글은 스킵되고 아티팩트로만 확인 가능합니다.

## 측정 설정 (`lighthouserc.cjs`)

```js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
        },
      },
    },
  },
};
```

모바일 환경(iPhone 14 기준) 단일 측정입니다.

## 주의사항

- `lighthouserc.cjs` — `package.json`에 `"type": "module"` 설정이 있어 `.js` 확장자는 ESM으로 해석됩니다. CommonJS 문법(`module.exports`)을 사용하기 위해 `.cjs` 확장자를 사용합니다.
- `include-hidden-files: true` — `.lighthouseci/`는 숨김 디렉토리라 `actions/upload-artifact@v4` 기본 설정에서 업로드 대상에서 제외됩니다.
