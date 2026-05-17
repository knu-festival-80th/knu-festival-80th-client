const PHOTO_FILENAME_BASE = 'hobanu-photo';
const FALLBACK_MIME_TYPE = 'image/png';
const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

function getDataUrlMimeType(dataUrl: string): string {
  return dataUrl.match(/^data:([^;,]+)/)?.[1] ?? FALLBACK_MIME_TYPE;
}

function getPhotoFilename(mimeType: string): string {
  return `${PHOTO_FILENAME_BASE}.${MIME_TYPE_TO_EXTENSION[mimeType] ?? 'png'}`;
}

export async function downloadPhoto(dataUrl: string): Promise<void> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const mimeType = blob.type || getDataUrlMimeType(dataUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getPhotoFilename(mimeType);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function sharePhoto(dataUrl: string): Promise<void> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const mimeType = blob.type || getDataUrlMimeType(dataUrl);
  const file = new File([blob], getPhotoFilename(mimeType), { type: mimeType });
  await navigator.share({ files: [file] }).catch(() => {});
}
