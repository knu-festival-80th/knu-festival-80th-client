import { useState } from 'react';
import BoothCard from '@/components/stampTour/BoothCard';
import boothMap1 from '@/assets/stampTour/booth_map_1.webp';
import boothMap2 from '@/assets/stampTour/booth_map_2.webp';
import boothMap3 from '@/assets/stampTour/booth_map_3.webp';
import boothMap4 from '@/assets/stampTour/booth_map_4.webp';
import boothMap5 from '@/assets/stampTour/booth_map_5.webp';
import boothMap6 from '@/assets/stampTour/booth_map_6.webp';
import boothMap7 from '@/assets/stampTour/booth_map_7.webp';

type Booth = {
  id: number;
  zone: string;
  name: string;
  description: string;
  location: string;
  time: string;
  target: string;
  imageSrc: string;
  imageAlt?: string;
};

const BOOTHS: Booth[] = [
  {
    id: 1,
    zone: 'ZONE 1',
    name: '장미덩쿨',
    description:
      '경북대에 전하고 싶은 바람이나 나의 목표를 \n카드에 적어보세요. 작성한 카드는 장미덩쿨에\n준비된 끈에 매달면 미션 clear! \n작성한 메시지들을 모아 경북대 80주년을 \n기념하는 공간을 모두 함께 완성해 보아요~',
    location: '벛꽃 로드',
    time: '13:00~18:00',
    target: '경북대학교 재적생 및 방문자',
    imageSrc: boothMap1,
    imageAlt: '장미덩쿨 부스 위치 지도',
  },
  {
    id: 2,
    zone: 'ZONE 2',
    name: '오락실',
    description:
      '펀치기계, 태고의 달인 등 오락실 기기를 \n즐겨보세요. 원하는 기기를 골라 자유롭게 \n체험하고, 참여 장면을 사진으로 남겨 본부에 \n보여주면 스탬프를 받을 수 있어요!',
    location: '벛꽃 로드',
    time: '13:00~18:00',
    target: '경북대학교 재적생 및 방문자',
    imageSrc: boothMap2,
    imageAlt: '오락실 부스 위치 지도',
  },
  {
    id: 3,
    zone: 'ZONE 3',
    name: '포토부스',
    description:
      '80주년 대동제에서의 오늘을 포토부스에서 \n남겨보세요. 친구와 함께, 가족과 함께 아니면 \n혼자 찍어도 좋아요! 촬영한 사진을 본부에 \n보여주면 스탬프를 받을 수 있어요!',
    location: '벛꽃 로드',
    time: '13:00~18:00',
    target: '경북대학교 재적생 및 방문자',
    imageSrc: boothMap3,
    imageAlt: '포토부스 부스 위치 지도',
  },
  {
    id: 4,
    zone: 'ZONE 4',
    name: '경대고사',
    description:
      '그대는 경북대학교에 대해 얼마나 \n알고계신지요? 경북대의 역사, 캠퍼스, 학교생활과 관련된\n문제를 재미있게 풀어보세요~ 문제를 풀어 \n스태프에게 보여주면 정답 개수와 상관없이 \n스탬프를 쾅!',
    location: '벛꽃 로드',
    time: '13:00~18:00',
    target: '경북대학교 재적생 및 방문자',
    imageSrc: boothMap4,
    imageAlt: '경대고사 부스 위치 지도',
  },
  {
    id: 5,
    zone: 'ZONE 5',
    name: '분필 아트',
    description:
      '분필로 캠퍼스 바닥 위에 나만의 그림이나 문구를 \n남겨보세요. 경북대 80주년, 대동제, 캠퍼스\n에서의 추억 등 원하는 주제로 자유롭게 표현\n가능해요! 완성한 그림이나 참여 장면을 사진\n으로 남겨 본부에 보여주면 스탬프 획득 가능~',
    location: '벛꽃 로드',
    time: '13:00~18:00',
    target: '경북대학교 재적생 및 방문자',
    imageSrc: boothMap5,
    imageAlt: '분필 아트 부스 위치 지도',
  },
  {
    id: 6,
    zone: 'ZONE 6',
    name: '전통놀이',
    description:
      '투호, 제기차기, 딱지치기 등 준비된 \n전통놀이를 즐겨보세요!\n에잇, 승패가 뭐가 중요하겠어요^_^ \n원하는 놀이를 하나 이상 가볍게 체험 후 \n놀이에 참여하는 장면을 사진으로 남겨 본부에\n보여주면 스탬프를 받을 수 있답니다~',
    location: '벛꽃 로드',
    time: '13:00~18:00',
    target: '경북대학교 재적생 및 방문자',
    imageSrc: boothMap6,
    imageAlt: '전통놀이 부스 위치 지도',
  },
  {
    id: 7,
    zone: 'ZONE 7',
    name: '점프! 그림그리기',
    description:
      '손끝에 물감을 묻히고 점프해 밑그림이 있는 \n그림판에 흔적을 남겨보세요!\n여러분의 손끝 자국이 하나씩 모이면 색칠된 \n멋진 호반우가 나타날지도~? \n축제에 함께한 나만의 흔적을 남겨볼까요?',
    location: '벛꽃 로드',
    time: '13:00~18:00',
    target: '경북대학교 재적생 및 방문자',
    imageSrc: boothMap7,
    imageAlt: '점프! 그림그리기 부스 위치 지도',
  },
];

const StampBoothListView = () => {
  const [openBoothId, setOpenBoothId] = useState<number | null>(BOOTHS[0]?.id ?? null);

  const handleDetailClick = (id: number) => {
    setOpenBoothId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          'linear-gradient(to bottom, rgba(255,218,61,0.3) 0%, rgba(255,141,101,0.3) 49%, rgba(255,61,144,0.3) 100%)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[450px] flex-col gap-5 px-5 pb-32 pt-7">
        <h1 className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
          부스 목록
        </h1>

        <ul className="flex flex-col gap-[30px]">
          {BOOTHS.map((booth) => (
            <li key={booth.id}>
              <BoothCard
                {...booth}
                isExpanded={openBoothId === booth.id}
                onDetailClick={() => handleDetailClick(booth.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StampBoothListView;
