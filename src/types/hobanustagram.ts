export type HobanustagramTab = 'intro' | 'photobooth';
export type CharacterKey = 'hobanu' | 'smile_hobanu' | 'smile_hobanu_incline';
export type TabStep = 1 | 2;
export type CameraState = 'idle' | 'shooting' | 'review';
export type OverlayStyle = {
  left: string;
  width: string;
  top?: string;
  bottom?: string;
  transform?: string;
  mirrorTransform?: string;
};
