import { useNavigate } from 'react-router-dom';
import day20PlaceholderImg from '@/assets/timetable/day20-placeholder.png';

export default function Day20Placeholder() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-[30px] items-center px-5 w-full">
      <div className="flex flex-col gap-[10px] items-center w-full">
        <p className="text-body1 text-text-muted">내일 공연을 위해 준비중이에요!</p>
        <div className="relative w-full aspect-square">
          <img
            src={day20PlaceholderImg}
            alt="준비중"
            className="absolute inset-0 size-full object-contain"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full h-[50px] bg-primary text-white text-body1 font-medium rounded-md"
      >
        다른 축제 이벤트 구경하기
      </button>
    </div>
  );
}
