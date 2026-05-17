export const preloadImage = (src: string) => {
  if (typeof Image === 'undefined') return;

  const image = new Image();
  image.decoding = 'async';
  image.src = src;
};
