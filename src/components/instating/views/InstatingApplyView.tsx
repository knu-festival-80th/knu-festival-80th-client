import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ApiClientError, matchingApi } from '@/apis';
import { useMatchingStatus } from '@/hooks/instating/useMatchingStatus';
import type { SubmittedData } from '../result/InstatingSuccessModal';
import InstatingSuccessModal from '../result/InstatingSuccessModal';
import AlertModal from '@/components/instating/AlertModal';
import CountdownText from '@/components/instating/CountdownText';

type FormValues = {
  gender: 'male' | 'female';
  instagramId: string;
  phone: string;
  ageConfirm: boolean;
};

const InstatingApplyView = () => {
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ title: string; description: string } | null>(null);

  const { data: status } = useMatchingStatus();
  const isRegistrationOpen = status?.registrationOpen ?? true;
  const registrationOpenAt = status?.registrationOpenAt
    ? new Date(status.registrationOpenAt)
    : null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { gender: 'male' }, mode: 'onChange' });

  const gender = useWatch({ control, name: 'gender' });
  const ageConfirm = useWatch({ control, name: 'ageConfirm' });

  const onSubmit = async ({ gender, instagramId, phone }: FormValues) => {
    setSubmitError(null);
    try {
      await matchingApi.registerMatching({
        gender: gender === 'male' ? 'MALE' : 'FEMALE',
        instagramId,
        phoneNumber: phone,
      });
      setSubmittedData({ gender, instagramId, phone });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setErrorModal({
            title: '이미 참여하셨어요',
            description: '본 이벤트는 하루에 한 번만 참여 가능합니다.\n내일 다시 참여해 주세요.',
          });
        } else if (err.status === 403) {
          setSubmitError('현재 신청이 마감되었습니다.');
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError('오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <>
      {submittedData && (
        <InstatingSuccessModal data={submittedData} onClose={() => setSubmittedData(null)} />
      )}
      {errorModal && (
        <AlertModal
          title={errorModal.title}
          description={errorModal.description}
          onClose={() => setErrorModal(null)}
        />
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-7 bg-white px-5 py-6 min-h-[calc(100dvh-6.75rem)]"
      >
        {/* Header */}
        <div className="flex flex-col gap-2.5">
          <h1 className="font-wanted-sans text-heading2 font-bold tracking-tight text-ink">
            인스타팅 신청하기
          </h1>
          <p className="font-wanted-sans text-body1 tracking-tight text-gray">
            기본 정보를 입력해주세요.
          </p>
        </div>

        <fieldset
          disabled={!isRegistrationOpen}
          className="m-0 flex flex-col gap-6 border-0 p-0 disabled:opacity-40"
        >
          {/* Gender */}
          <div className="flex flex-col gap-2">
            <span className="font-wanted-sans text-body1 font-semibold tracking-tight text-ink">
              성별
            </span>
            <div className="flex gap-5">
              {(['male', 'female'] as const).map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-1.5 disabled:cursor-not-allowed"
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('gender', { required: true })}
                    className="hidden"
                  />
                  <div
                    className={`flex size-5 items-center justify-center rounded-full border-2 ${
                      gender === value ? 'border-sub-red' : 'border-border'
                    }`}
                  >
                    {gender === value && <div className="size-2.5 rounded-full bg-sub-red" />}
                  </div>
                  <span
                    className={`font-wanted-sans text-body1 font-semibold tracking-tight ${
                      gender === value ? 'text-sub-red' : 'text-ink'
                    }`}
                  >
                    {value === 'male' ? '남성' : '여성'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Text fields */}
          <div className="flex flex-col gap-[18px]">
            {/* Instagram ID */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="instagramId"
                className="font-wanted-sans text-body1 font-semibold tracking-tight text-ink"
              >
                인스타 ID
              </label>
              <input
                id="instagramId"
                type="text"
                placeholder="honggildong"
                {...register('instagramId', {
                  required: '인스타 ID를 입력해주세요.',
                  pattern: {
                    value: /^[a-zA-Z0-9_.]{1,30}$/,
                    message: '올바른 인스타그램 ID를 입력해주세요.',
                  },
                })}
                className="h-[50px] w-full rounded-md border border-border bg-surface px-4 font-wanted-sans text-body1 tracking-tight text-ink placeholder:text-text-disabled focus:border-sub-red focus:outline-none disabled:cursor-not-allowed"
              />
              {errors.instagramId && (
                <p className="font-wanted-sans text-body2 text-sub-red">
                  {errors.instagramId.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="font-wanted-sans text-body1 font-semibold tracking-tight text-ink"
              >
                연락처
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="번호를 입력해주세요 ('-' 없이 번호만)"
                {...register('phone', {
                  required: '연락처를 입력해주세요.',
                  pattern: {
                    value: /^01[0-9]{8,9}$/,
                    message: '올바른 연락처를 입력해주세요.',
                  },
                })}
                className="h-[50px] w-full rounded-md border border-border bg-surface px-4 font-wanted-sans text-body1 tracking-tight text-ink placeholder:text-text-disabled focus:border-sub-red focus:outline-none disabled:cursor-not-allowed"
              />
              {errors.phone && (
                <p className="font-wanted-sans text-body2 text-sub-red">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Age confirmation */}
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              {...register('ageConfirm', { required: true })}
              className="hidden"
            />
            <div
              className={`flex size-5 items-center justify-center rounded-sm ${
                ageConfirm ? 'bg-sub-red' : 'border-2 border-border bg-surface'
              }`}
            >
              {ageConfirm && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
                  <path
                    d="M1 4L4.5 7.5L11 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="font-wanted-sans text-body1 font-medium tracking-tight text-ink">
              만 19세 이상 성인임을 확인합니다.
            </span>
          </label>
        </fieldset>

        {submitError && (
          <p className="font-wanted-sans text-body2 text-sub-red" role="alert">
            {submitError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isRegistrationOpen || !isValid || isSubmitting}
          className={`h-[50px] w-full rounded-md font-wanted-sans text-body1 font-medium tracking-tight text-surface ${
            !isRegistrationOpen
              ? 'bg-black'
              : isValid && !isSubmitting
                ? 'bg-sub-red'
                : 'bg-[#CCCCCC]'
          }`}
        >
          {!isRegistrationOpen ? (
            <CountdownText deadline={registrationOpenAt} />
          ) : isSubmitting ? (
            '신청 중...'
          ) : (
            '인스타팅 신청하기'
          )}
        </button>

        {/* Notice */}
        <div className="rounded-md bg-[#f9f9f9] p-4">
          <p className="font-wanted-sans text-body2 font-medium leading-[1.5] tracking-tight text-gray">
            *신청 후 취소는 불가능하오니 신중하게 결정해 주세요.
            <br />
            *본 서비스는 만 19세 이상의 성인(대학생)을 대상으로 합니다. 미성년자의 참여를 엄격히
            금지하며, 허위 정보 입력으로 발생한 문제의 책임은 본인에게 있습니다.
          </p>
        </div>
      </form>
    </>
  );
};

export default InstatingApplyView;
