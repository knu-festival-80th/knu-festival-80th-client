const FailureCard = () => (
  <div
    className="relative w-[325px] shrink-0 overflow-hidden rounded-[12px] bg-white"
    style={{
      height: 430,
      border: '1px solid #ffe0e5',
      boxShadow: '0px 4px 30px 0px rgba(255,103,126,0.12)',
    }}
  >
    <div
      className="absolute overflow-hidden"
      style={{ left: 63, top: 73, width: 202, height: 210 }}
    >
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <span className="text-7xl">🐯</span>
      </div>
    </div>

    <p
      className="absolute text-center font-wanted-sans text-[18px] leading-[1.4] tracking-[-0.36px] text-[#808080]"
      style={{ left: 41, top: 325, width: 245 }}
    >
      신청자 성비가 맞지 않아
      <br />
      인스타팅 매칭이 성사되지 못했어요.
    </p>
  </div>
);

export default FailureCard;
