import { lazy } from 'react';

export const loadTwoShotOverlay = () =>
  import('@/components/hobanustagram/TwoShotOverlay').then(({ TwoShotOverlay }) => ({
    default: TwoShotOverlay,
  }));

export const LazyTwoShotOverlay = lazy(loadTwoShotOverlay);
