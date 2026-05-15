export function captureVideoFrame(
  video: HTMLVideoElement,
  mirror: boolean,
  slotAspect: number,
): string {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  let sx: number, sy: number, sw: number, sh: number;
  if (vw / vh > slotAspect) {
    sh = vh;
    sw = vh * slotAspect;
    sx = (vw - sw) / 2;
    sy = 0;
  } else {
    sw = vw;
    sh = vw / slotAspect;
    sx = 0;
    sy = (vh - sh) / 2;
  }

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
