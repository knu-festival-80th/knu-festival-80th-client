import { Global, css } from '@emotion/react';

import { theme } from '@/styles/theme';

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        @font-face {
          font-family: 'Pretendard';
          src: url('/fonts/PretendardVariable.woff2') format('woff2');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }

        :root {
          color-scheme: light;
          font-family: ${theme.fonts.sans};
          color: ${theme.colors.text};
          background: ${theme.colors.background};
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          min-height: 100%;
        }

        body {
          margin: 0;
          min-width: 320px;
          background: ${theme.colors.background};
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        img,
        picture,
        video,
        canvas,
        svg {
          display: block;
          max-width: 100%;
        }
      `}
    />
  );
}
