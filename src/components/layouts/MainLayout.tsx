import styled from '@emotion/styled';
import { Outlet } from 'react-router-dom';

import { theme } from '@/styles/theme';

export default function MainLayout() {
  return (
    <PageFrame>
      <Outlet />
    </PageFrame>
  );
}

const PageFrame = styled.main`
  min-height: 100dvh;
  background:
    radial-gradient(circle at 16% 12%, rgba(234, 81, 71, 0.12), transparent 28rem),
    radial-gradient(circle at 82% 18%, rgba(91, 121, 200, 0.12), transparent 24rem),
    ${theme.colors.background};
`;
