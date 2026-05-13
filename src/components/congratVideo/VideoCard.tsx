import { useState } from 'react';
import PlayButton from './PlayButton';

type VideoCardProps = {
  badge: string;
  videoUrl: string;
};

function getYoutubeId(url: string): string {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortsMatch = url.match(/shorts\/([^?&]+)/);
  if (shortsMatch) return shortsMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  return shortMatch ? shortMatch[1] : '';
}

export default function VideoCard({ badge, videoUrl }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYoutubeId(videoUrl);

  return (
    <div className="group relative w-full aspect-video overflow-hidden bg-ink">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="absolute inset-0 size-full"
          onClick={() => setPlaying(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={badge}
            className="absolute inset-0 size-full object-cover"
          />
          <PlayButton />
        </button>
      )}
      <span className="absolute top-5 left-5 z-10 bg-primary text-white text-body2 font-medium rounded-full px-5 py-1.5 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
        {badge}
      </span>
    </div>
  );
}
