export const theme = {
  colors: {
    knuRed: '#e60000',
    knuGray: '#797979',
    knuGold: '#bf7c26',
    primary: '#ea5147',
    baseDeep: '#1d2038',
    secondaryPurple: '#6a3cae',
    secondaryBlue: '#5b79c8',
    secondaryGreen: '#48af4f',
    secondaryOrange: '#ff6738',
    secondaryYellow: '#fec74e',
    background: '#f7f8fb',
    surface: '#ffffff',
    border: '#e5e5e5',
    text: '#1d2038',
    textMuted: '#737373',
    white: '#ffffff',
  },
  fonts: {
    sans: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Segoe UI', system-ui, sans-serif",
  },
  shadows: {
    sm: '0 0 8px rgba(0, 0, 0, 0.05)',
    md: '0 12px 36px rgba(29, 32, 56, 0.12)',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  },
  typography: {
    display1: {
      fontSize: '2.5rem',
      lineHeight: '3rem',
      fontWeight: 700,
    },
    heading1: {
      fontSize: '1.75rem',
      lineHeight: '2.25rem',
      fontWeight: 700,
    },
    heading2: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: '1.375rem',
      fontWeight: 400,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '1.125rem',
      fontWeight: 400,
    },
  },
} as const;

export type AppTheme = typeof theme;
