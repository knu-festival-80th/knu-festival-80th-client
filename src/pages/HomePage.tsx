import styled from '@emotion/styled';

import { theme } from '@/styles/theme';

export default function HomePage() {
  return (
    <Page>
      <Content>
        <Eyebrow>2026 KNU Festival</Eyebrow>
        <Title>경북대학교 80주년 대동제</Title>
        <Description>
          대동제 프론트엔드 개발을 위한 초기 프로젝트 환경입니다. 라우팅, API 레이어, Emotion 스타일
          토큰, 테스트 설정을 기준 구조에 맞춰 준비했습니다.
        </Description>
        <MetaList aria-label="프로젝트 기본 구성">
          <MetaItem>Vite</MetaItem>
          <MetaItem>React</MetaItem>
          <MetaItem>TypeScript</MetaItem>
          <MetaItem>Emotion</MetaItem>
        </MetaList>
      </Content>
    </Page>
  );
}

const Page = styled.section`
  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const Content = styled.div`
  width: min(100%, 720px);
`;

const Eyebrow = styled.p`
  margin: 0 0 12px;
  color: ${theme.colors.primary};
  font-size: ${theme.typography.body2.fontSize};
  font-weight: 700;
  line-height: ${theme.typography.body2.lineHeight};
`;

const Title = styled.h1`
  margin: 0;
  color: ${theme.colors.baseDeep};
  font-size: clamp(2.25rem, 7vw, 4.5rem);
  font-weight: 800;
  line-height: 1.08;
`;

const Description = styled.p`
  margin: 24px 0 0;
  max-width: 560px;
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.body1.fontSize};
  line-height: ${theme.typography.body1.lineHeight};
`;

const MetaList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
`;

const MetaItem = styled.li`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.72);
  color: ${theme.colors.text};
  font-size: ${theme.typography.body2.fontSize};
  line-height: ${theme.typography.body2.lineHeight};
  box-shadow: ${theme.shadows.sm};
`;
