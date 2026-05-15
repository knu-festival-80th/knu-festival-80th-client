import { useState } from 'react';

export const useSavePhoto = (capturedDataUrl: string | null, filename = 'photo.png') => {
  const [showSaveSheet, setShowSaveSheet] = useState(false);

  const handleSaveButtonClick = () => {
    const testFile = new File([], 'test');
    if (navigator.canShare?.({ files: [testFile] })) {
      setShowSaveSheet(true);
    } else {
      void downloadPhoto();
    }
  };

  const downloadPhoto = async () => {
    if (!capturedDataUrl) return;
    setShowSaveSheet(false);
    const res = await fetch(capturedDataUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sharePhoto = async () => {
    if (!capturedDataUrl) return;
    setShowSaveSheet(false);
    const res = await fetch(capturedDataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });
    try {
      await navigator.share({ files: [file] });
    } catch {
      // 사용자 취소 시 무시
    }
  };

  return {
    showSaveSheet,
    closeSaveSheet: () => setShowSaveSheet(false),
    handleSaveButtonClick,
    downloadPhoto,
    sharePhoto,
  };
};
