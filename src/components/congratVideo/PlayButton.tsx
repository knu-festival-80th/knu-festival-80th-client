import { Play } from 'lucide-react';

export default function PlayButton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex items-center justify-center size-16 rounded-full bg-black/50">
        <Play className="size-7 text-white fill-white ml-0.5" />
      </div>
    </div>
  );
}
