import goodsbox from '@/assets/goods/goodsbox.webp';
import { GradientBanner } from '@/components/common/GradientBanner';
import { SectionTitle } from '@/components/common/SectionTitle';
import { GoodsModal } from '@/components/goods/GoodsModal';
import { ALL_GOODS, POPULAR_GOODS } from '@/mocks/goods';
import { useGoodsModal } from '@/hooks/useGoodsModal';

export default function GoodsPage() {
  const { selectedGoods, openModal, closeModal } = useGoodsModal();

  return (
    <div className="flex flex-col">
      <GradientBanner title="축제 굿즈" />

      <section className="flex flex-col items-center bg-white px-5 pb-12 pt-20">
        <div className="flex w-full max-w-7xl flex-col items-center gap-12">
          <SectionTitle
            label="2026 Festival Goods"
            title="2026 대동제 굿즈"
            description={
              '축제의 특별한 굿즈를 만나보세요!\n대동제의 무드를 담은 다양한 아이템들이 준비되어 있습니다. 마음에 드는 굿즈를 선택해 축제의 순간을 오래 간직해보세요.'
            }
            ctaLabel="굿즈 살펴보기"
            ctaHref="#all-goods"
          />
          <img src={goodsbox} alt="2026 대동제 굿즈" className="h-auto w-full object-contain" />
        </div>
      </section>

      <section className="flex flex-col gap-32 bg-white px-5 pb-32 pt-7">
        <div className="flex flex-col gap-5">
          <p className="font-wanted-sans text-xl font-bold leading-none tracking-[-0.02em] text-ink">
            현재 인기있는 굿즈
          </p>
          <div className="-mx-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-5 px-5 pb-2">
              {POPULAR_GOODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openModal(item)}
                  className="flex w-50 shrink-0 flex-col gap-3.5 text-left"
                >
                  <div className="flex h-50 w-full items-center justify-center rounded-md bg-gray-50">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02em] text-[#4d4d4d]">
                      {item.name}
                    </p>
                    <p className="font-wanted-sans text-sm font-medium leading-none tracking-[-0.02em] text-gray">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div id="all-goods" className="flex flex-col gap-5">
          <p className="font-wanted-sans text-xl font-bold leading-none tracking-[-0.02em] text-ink">
            전체 굿즈 목록
          </p>
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-4.5">
            {ALL_GOODS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openModal(item)}
                className="flex flex-col gap-3.5 text-left"
              >
                <div className="flex h-41 w-full items-center justify-center rounded-md bg-gray-50">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-2"
                  />
                </div>
                <div className="flex flex-col gap-2.5">
                  <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02em] text-[#4d4d4d]">
                    {item.name}
                  </p>
                  <p className="font-wanted-sans text-sm font-medium leading-none tracking-[-0.02em] text-gray">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="py-4.5">
          <SectionTitle
            label="Buy Now"
            title="지금 바로 구매하기"
            description={'대동제의 순간을 소장할 수 있는 특별한 기회를\n놓치지 마세요!'}
            ctaLabel="굿즈 구매 페이지 이동하기"
          />
        </div>
      </section>

      {selectedGoods && (
        <GoodsModal key={selectedGoods.id} goods={selectedGoods} onClose={closeModal} />
      )}
    </div>
  );
}
