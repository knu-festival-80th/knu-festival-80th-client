export default function HomePage() {
  return (
    <section className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-[720px]">
        <p className="m-0 mb-3 text-body2 font-bold text-primary">2026 KNU Festival</p>
        <h1 className="m-0 text-[clamp(2.25rem,7vw,4.5rem)] font-extrabold leading-[1.08] text-base-deep">
          경북대학교 80주년 대동제
        </h1>
        <p className="mt-6 max-w-[560px] text-body1 text-text-muted">
          대동제 프론트엔드 개발을 위한 초기 프로젝트 환경입니다. 라우팅, API 레이어, Tailwind CSS
          스타일 토큰, 테스트 설정을 기준 구조에 맞춰 준비했습니다.
        </p>
        <ul className="m-0 mt-7 flex list-none flex-wrap gap-2 p-0" aria-label="프로젝트 기본 구성">
          <li className="rounded-md border border-border bg-white/72 px-3 py-2 text-body2 text-text shadow-sm">
            Vite
          </li>
          <li className="rounded-md border border-border bg-white/72 px-3 py-2 text-body2 text-text shadow-sm">
            React
          </li>
          <li className="rounded-md border border-border bg-white/72 px-3 py-2 text-body2 text-text shadow-sm">
            TypeScript
          </li>
          <li className="rounded-md border border-border bg-white/72 px-3 py-2 text-body2 text-text shadow-sm">
            Tailwind CSS
          </li>
        </ul>
      </div>
    </section>
  );
}
