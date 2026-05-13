// TODO: API 연동으로 교체
const todayAt = (hour: number) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
};

export const APPLY_DEADLINE = todayAt(21); // 매일 21시
export const REVEAL_DEADLINE = todayAt(22); // 매일 22시
export const ZERO_DEADLINE = new Date(0); // 00:00:00:00 고정용
