import type { Artist } from '@/types/home';

export default function LineupImage({ src, alt }: Artist) {
  return (
    <div className="size-[312px] shrink-0 overflow-hidden">
      <img src={src} alt={alt} draggable={false} className="size-full object-cover" />
    </div>
  );
}
