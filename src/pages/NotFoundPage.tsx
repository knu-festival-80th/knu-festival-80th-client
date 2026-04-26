import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { theme } from '@/styles/theme';

export default function NotFoundPage() {
  return (
    <Page>
      <Title>페이지를 찾을 수 없습니다</Title>
      <HomeLink to="/">홈으로 돌아가기</HomeLink>
    </Page>
  );
}

const Page = styled.main`
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: ${theme.colors.background};
`;

const Title = styled.h1`
  margin: 0;
  color: ${theme.colors.text};
  font-size: ${theme.typography.heading2.fontSize};
  line-height: ${theme.typography.heading2.lineHeight};
`;

const HomeLink = styled(Link)`
  border-radius: ${theme.radii.md};
  padding: 10px 14px;
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-size: ${theme.typography.body2.fontSize};
  font-weight: 700;
  line-height: ${theme.typography.body2.lineHeight};
`;
