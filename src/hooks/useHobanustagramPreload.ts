import { CHARACTER_LIST } from '@/constants/hobanustagram';
import { loadPhotoboothTab } from '@/components/hobanustagram/LazyPhotoboothTab';
import { loadTwoShotOverlay } from '@/components/hobanustagram/LazyTwoShotOverlay';
import { preloadImage } from '@/lib/preloadImage';
import { useIdlePreload } from '@/hooks/useIdlePreload';

let didPreloadTwoShotAssets = false;

export const preloadPhotoboothTab = () => {
  void loadPhotoboothTab();
};

export const preloadCharacterOverlays = () => {
  CHARACTER_LIST.forEach((character) => preloadImage(character.src));
};

export const preloadTwoShotAssets = () => {
  if (didPreloadTwoShotAssets) return;
  didPreloadTwoShotAssets = true;

  void import('@/constants/twoShot').then(({ TWO_SHOT_FRAME_URLS, TWO_SHOT_PREVIEW_URLS }) => {
    Object.values(TWO_SHOT_FRAME_URLS).forEach(preloadImage);
    Object.values(TWO_SHOT_PREVIEW_URLS).forEach(preloadImage);
  });
};

export const preloadTwoShotExperience = () => {
  void loadTwoShotOverlay();
  preloadTwoShotAssets();
};

export const preloadPhotoboothExperience = () => {
  preloadCharacterOverlays();
  preloadTwoShotExperience();
};

export const useIntroPhotoboothPreload = (enabled: boolean) => {
  useIdlePreload(preloadPhotoboothTab, { enabled, timeout: 2500, fallbackDelay: 1200 });
};

export const usePhotoboothPreload = () => {
  useIdlePreload(preloadPhotoboothExperience, { timeout: 3000, fallbackDelay: 1200 });
};
