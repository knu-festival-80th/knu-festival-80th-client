interface ProcessCardProps {
  imgSrc: string;
  imgAlt: string;
}

const ProcessCard = ({ imgSrc, imgAlt }: ProcessCardProps) => (
  <div className="w-[335px] shrink-0 overflow-clip rounded-[6px]">
    <img src={imgSrc} alt={imgAlt} className="block w-full" />
  </div>
);

export default ProcessCard;
