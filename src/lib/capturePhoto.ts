export function capturePhoto(
  video: HTMLVideoElement,
  overlayImg: HTMLImageElement,
  bottomInset: number = 0,
  overlayScreenRect?: DOMRect,
): string {
  const videoW = video.videoWidth;
  const videoH = video.videoHeight;
  const displayW = video.clientWidth;
  const displayH = video.clientHeight;
  const visibleH = displayH - bottomInset;

  const scale = Math.max(displayW / videoW, displayH / videoH);
  const fullSrcW = displayW / scale;
  const srcX = (videoW - fullSrcW) / 2;
  const srcY = Math.max(0, (videoH - displayH / scale) / 2);
  const visibleSrcH = visibleH / scale;

  const dpr = window.devicePixelRatio || 1;
  const canvasW = Math.round(displayW * dpr);
  const canvasH = Math.round(visibleH * dpr);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(video, srcX, srcY, fullSrcW, visibleSrcH, 0, 0, canvasW, canvasH);

  if (overlayScreenRect) {
    const overlayX = overlayScreenRect.left * dpr;
    const overlayY = overlayScreenRect.top * dpr;
    const overlayW = overlayScreenRect.width * dpr;
    const overlayH = overlayScreenRect.height * dpr;
    ctx.drawImage(overlayImg, overlayX, overlayY, overlayW, overlayH);
  } else {
    const ratio = displayH / visibleH;
    const overlayX = canvasW * 0.083;
    const overlayY = canvasH * 0.413 * ratio;
    const overlayW = canvasW * 0.837;
    const overlayH = canvasH * 0.553 * ratio;
    ctx.drawImage(overlayImg, overlayX, overlayY, overlayW, overlayH);
  }

  return canvas.toDataURL('image/png');
}
