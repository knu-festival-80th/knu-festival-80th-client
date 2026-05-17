import { lazy } from 'react';

export const loadPhotoboothTab = () =>
  import('@/components/hobanustagram/PhotoboothTab').then(({ PhotoboothTab }) => ({
    default: PhotoboothTab,
  }));

export const LazyPhotoboothTab = lazy(loadPhotoboothTab);
