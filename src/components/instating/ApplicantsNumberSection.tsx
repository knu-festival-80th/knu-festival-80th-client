interface ApplicantCardProps {
  label: string;
  count: number;
  color: string;
}

const ApplicantCard = ({ label, count, color }: ApplicantCardProps) => (
  <div className="flex flex-1 flex-col gap-2.5 rounded-lg bg-[#f9f9f9] p-4">
    <p className="font-wanted-sans text-[14px] leading-none tracking-[-0.28px] text-[#808080]">
      {label}
    </p>
    <p className={`font-wanted-sans text-[20px] font-bold leading-none tracking-[-0.4px] ${color}`}>
      {count}명
    </p>
  </div>
);

const ApplicantsSection = () => {
  return (
    <div className="flex w-full flex-col gap-6 bg-white px-5 pb-16 pt-8">
      <div className="flex flex-col gap-1.5">
        <p className="font-wanted-sans text-[16px] font-bold leading-[1.4] tracking-[-0.32px] text-ink">
          Applicants
        </p>
        <p className="font-wanted-sans text-[18px] font-medium leading-[1.4] tracking-[-0.36px] text-ink">
          현재 신청자 현황
        </p>
      </div>

      <div className="flex gap-2">
        {/* TODO: api 연동 */}
        <ApplicantCard label="남성" count={200} color="text-[#1893ff]" />
        <ApplicantCard label="여성" count={100} color="text-[#ff6568]" />
      </div>
    </div>
  );
};

export default ApplicantsSection;
