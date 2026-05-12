import { useForm, useWatch } from 'react-hook-form';
import InstaTingResultModal, { type MatchResult } from '../result/InstaTingResultModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type FormValues = {
  instagramId: string;
  phone: string;
};

const InstaTingResultView = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onChange' });

  const instagramId = useWatch({ control, name: 'instagramId' });
  const phone = useWatch({ control, name: 'phone' });
  const isValid = !!instagramId && !!phone && !errors.instagramId && !errors.phone;

  const [result, setResult] = useState<MatchResult | null>(null);
  const navigate = useNavigate();

  const onSubmit = () => {
    // TODO: API 연동 후 setResult({ matched: true, instagramId: '...' }) 또는 setResult({ matched: false })
    setResult({ matched: true, instagramId: 'lll_0311' });

    // setResult({ matched: false });
  };

  const handleCloseResult = () => {
    navigate('/instating');
  };

  return (
    <>
      {result && <InstaTingResultModal onClose={handleCloseResult} result={result} />}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-7 bg-white px-5 py-6 min-h-[calc(100dvh-6.75rem)]"
      >
        {/* Header */}
        <div className="flex flex-col gap-2.5">
          <h1 className="font-wanted-sans text-heading2 font-bold tracking-tight text-ink">
            결과 조회
          </h1>
          <p className="font-wanted-sans text-body1 tracking-tight text-gray">
            신청 시 입력했던 정보를 입력해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-[18px]">
          {/* Instagram ID */}
          <div className="flex flex-col gap-2">
            <label className="font-wanted-sans text-body1 font-semibold tracking-tight text-ink">
              인스타 아이디
            </label>
            <input
              type="text"
              placeholder="인스타 아이디를 입력해주세요"
              {...register('instagramId', { required: true })}
              className="h-[50px] w-full rounded-md border border-border bg-surface px-4 font-wanted-sans text-body1 tracking-tight text-ink placeholder:text-text-disabled focus:border-sub-red focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label className="font-wanted-sans text-body1 font-semibold tracking-tight text-ink">
              연락처
            </label>
            <input
              type="tel"
              placeholder="번호를 입력해주세요 ('-' 없이 번호만)"
              {...register('phone', {
                required: true,
                pattern: /^01[0-9]{8,9}$/,
              })}
              className="h-[50px] w-full rounded-md border border-border bg-surface px-4 font-wanted-sans text-body1 tracking-tight text-ink placeholder:text-text-disabled focus:border-sub-red focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`h-[50px] w-full rounded-md ${isValid ? 'bg-sub-red' : 'bg-[#CCCCCC]'} font-wanted-sans text-body1 font-medium tracking-tight text-surface`}
        >
          결과 조회하기
        </button>
      </form>
    </>
  );
};

export default InstaTingResultView;
