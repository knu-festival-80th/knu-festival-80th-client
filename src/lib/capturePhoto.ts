export function capturePhoto(
  video: HTMLVideoElement,
  overlayImg: HTMLImageElement,
  bottomInset: number = 0,
  overlayScreenRect?: DOMRect,
  isFrontCamera = false,
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

  if (isFrontCamera) {
    ctx.save();
    ctx.translate(canvasW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, srcX, srcY, fullSrcW, visibleSrcH, 0, 0, canvasW, canvasH);
    ctx.restore();
  } else {
    ctx.drawImage(video, srcX, srcY, fullSrcW, visibleSrcH, 0, 0, canvasW, canvasH);
  }

  if (overlayScreenRect) {
    const computedTransform = window.getComputedStyle(overlayImg).transform;
    const cssMatrix =
      computedTransform !== 'none' ? new DOMMatrix(computedTransform) : new DOMMatrix();

    const layoutW = overlayImg.offsetWidth * dpr;
    const layoutH = overlayImg.offsetHeight * dpr;

    const centerX = (overlayScreenRect.left + overlayScreenRect.width / 2) * dpr;
    const centerY = (overlayScreenRect.top + overlayScreenRect.height / 2) * dpr;
    const drawMatrix = cssMatrix;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.transform(drawMatrix.a, drawMatrix.b, drawMatrix.c, drawMatrix.d, 0, 0);
    ctx.drawImage(overlayImg, -layoutW / 2, -layoutH / 2, layoutW, layoutH);
    ctx.restore();
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
