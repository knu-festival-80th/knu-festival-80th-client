export function captureVideoFrame(
  video: HTMLVideoElement,
  mirror: boolean,
  crop: { sx: number; sy: number; sw: number; sh: number },
): string {
  const { sx, sy, sw, sh } = crop;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}
