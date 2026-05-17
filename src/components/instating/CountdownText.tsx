import { useCountdown } from '@/hooks/instating/useCountdown';

const CountdownText = ({ deadline }: { deadline: Date | null }) => (
  <>남은시간 {useCountdown(deadline)}</>
);

export default CountdownText;
