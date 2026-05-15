import CountDownTimer from './CountDownTimer';
import { useMatchingStatus } from '@/hooks/instating/useMatchingStatus';

const CountDownSection = () => {
  const { data } = useMatchingStatus();

  let label: string;
  let deadline: Date;

  if (!data) {
    label = '';
    deadline = new Date(0);
  } else if (data.registrationOpen && data.registrationDeadline) {
    label = '인스타팅 신청 마감까지';
    deadline = new Date(data.registrationDeadline);
  } else if (!data.registrationOpen && !data.resultOpen && data.resultOpenAt) {
    label = '인스타팅 매칭 공개까지';
    deadline = new Date(data.resultOpenAt);
  } else if (!data.registrationOpen && data.resultOpen && data.registrationOpenAt) {
    label = '결과를 확인하세요.\n결과는 다음날 오전 11시 까지 확인 가능합니다.';
    deadline = new Date(data.registrationOpenAt);
  } else {
    label = '결과를 확인하세요.\n결과는 다음날 오전 11시 까지 확인 가능합니다.';
    deadline = new Date(0);
  }

  return (
    <div className="flex w-full flex-col gap-6 bg-white px-5 pb-16 pt-8">
      <div className="flex flex-col gap-1.5">
        <p className="font-wanted-sans text-[16px] font-bold leading-[1.4] tracking-[-0.32px] text-ink">
          Count Down
        </p>
        <p className="whitespace-pre-line font-wanted-sans text-[18px] font-medium leading-[1.4] tracking-[-0.36px] text-ink">
          {label}
        </p>
      </div>

      <CountDownTimer deadline={deadline} />
    </div>
  );
};

export default CountDownSection;
