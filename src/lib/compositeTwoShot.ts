import frame1WebpUrl from '@/assets/hobanustagram/twoframephoto_frame1.webp';
import frame2WebpUrl from '@/assets/hobanustagram/twoframephoto_frame2.webp';

const FRAME_WEBP_URLS: Record<1 | 2, string> = { 1: frame1WebpUrl, 2: frame2WebpUrl };

const PHOTO_SLOT_RATIOS: Record<
  1 | 2,
  [
    { left: number; top: number; width: number; height: number },
    { left: number; top: number; width: number; height: number },
  ]
> = {
  1: [
    { left: 0.091, top: 0.084, width: 0.816, height: 0.356 },
    { left: 0.095, top: 0.461, width: 0.818, height: 0.352 },
  ],
  2: [
    { left: 0.091, top: 0.084, width: 0.816, height: 0.356 },
    { left: 0.095, top: 0.461, width: 0.818, height: 0.352 },
  ],
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const imgRatio = img.width / img.height;
  const slotRatio = dw / dh;
  let sx: number, sy: number, sw: number, sh: number;
  if (imgRatio > slotRatio) {
    sh = img.height;
    sw = sh * slotRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / slotRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

export async function compositeTwoShot(photos: [string, string], filterId: 1 | 2): Promise<string> {
  const [frameImg, photo1Img, photo2Img] = await Promise.all([
    loadImage(FRAME_WEBP_URLS[filterId]),
    loadImage(photos[0]),
    loadImage(photos[1]),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = frameImg.naturalWidth;
  canvas.height = frameImg.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const w = canvas.width;
  const h = canvas.height;
  const slots = PHOTO_SLOT_RATIOS[filterId];

  drawCoverImage(
    ctx,
    photo1Img,
    slots[0].left * w,
    slots[0].top * h,
    slots[0].width * w,
    slots[0].height * h,
  );
  drawCoverImage(
    ctx,
    photo2Img,
    slots[1].left * w,
    slots[1].top * h,
    slots[1].width * w,
    slots[1].height * h,
  );

  ctx.drawImage(frameImg, 0, 0, w, h);

  return canvas.toDataURL('image/png');
}
