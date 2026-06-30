import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 16px;
  min-height: 130px;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    min-height: 170px;
    margin-top: 0;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  color: ${ht.white};

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`

const ViewLink = styled(Link)`
  font-size: 13px;
  color: ${ht.gold};
  text-decoration: none;
`

const Grid = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow: visible;
  }
`

const IntelCard = styled(Link)`
  position: relative;
  display: block;
  flex: 0 0 200px;
  min-height: 110px;
  border-radius: 10px;
  border: 1px solid ${ht.borderSoft};
  overflow: hidden;
  text-decoration: none;
  padding: 12px 14px;
  background: #0a0a0a;
  box-sizing: border-box;

  &:hover {
    border-color: ${ht.borderGold};
  }

  @media (min-width: 1024px) {
    flex: unset;
    min-height: 100px;
  }
`

const Thumb = styled.div<{ $variant: 'radar' | 'space' | 'chart' }>`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  opacity: 0.85;

  ${({ $variant }) =>
    $variant === 'radar' &&
    `
    background:
      radial-gradient(circle at center, transparent 18%, rgba(212,175,55,0.15) 19%, rgba(212,175,55,0.15) 22%, transparent 23%),
      radial-gradient(circle at center, transparent 38%, rgba(212,175,55,0.2) 39%, rgba(212,175,55,0.2) 42%, transparent 43%),
      radial-gradient(circle at center, transparent 58%, rgba(212,175,55,0.25) 59%, rgba(212,175,55,0.25) 62%, transparent 63%),
      linear-gradient(135deg, #111 0%, #0a0a0a 100%);
    border: 1px solid rgba(212,175,55,0.3);

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      background: ${ht.gold};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 12px ${ht.gold};
    }
  `}

  ${({ $variant }) =>
    $variant === 'space' &&
    `
    background:
      radial-gradient(circle at 70% 85%, rgba(244,197,66,0.55) 0%, rgba(212,175,55,0.2) 30%, transparent 55%),
      linear-gradient(180deg, #050505, #000);
    border: 1px solid rgba(212,175,55,0.2);
  `}

  ${({ $variant }) =>
    $variant === 'chart' &&
    `
    background: linear-gradient(180deg, #111, #0a0a0a);
    border: 1px solid rgba(212,175,55,0.25);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 4px;
    padding-bottom: 10px;

    &::before {
      content: '';
      width: 8px;
      height: 28px;
      background: linear-gradient(180deg, ${ht.goldBright}, ${ht.gold});
      border-radius: 2px;
    }
    &::after {
      content: '';
      width: 8px;
      height: 18px;
      background: linear-gradient(180deg, ${ht.goldBright}, ${ht.goldDark});
      border-radius: 2px;
      opacity: 0.7;
    }
  `}
`

const IntelTitle = styled.div`
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 600;
  color: ${ht.white};
  margin-bottom: 4px;
  max-width: calc(100% - 72px);
`

const IntelText = styled.div`
  position: relative;
  z-index: 1;
  font-size: 12px;
  color: ${ht.textMuted};
  line-height: 1.4;
  max-width: calc(100% - 72px);
`

const items = [
  {
    id: 'radar',
    title: 'Radar',
    text: 'Discover rising projects',
    href: '/projects',
    visual: 'radar' as const,
  },
  {
    id: 'space',
    title: 'Space Insights',
    text: 'Real-time ecosystem intelligence',
    href: '/query',
    visual: 'space' as const,
  },
  {
    id: 'recap',
    title: 'Weekly Recap',
    text: 'Top projects, trends and opportunities',
    href: '/projects',
    visual: 'chart' as const,
  },
]

export const IntelligencePanel: React.FC = () => (
  <Card>
    <Header>
      <Title>Intelligence</Title>
      <ViewLink href="/projects">View all →</ViewLink>
    </Header>
    <Grid>
      {items.map((item) => (
        <IntelCard key={item.id} href={item.href}>
          <Thumb $variant={item.visual} />
          <IntelTitle>{item.title}</IntelTitle>
          <IntelText>{item.text}</IntelText>
        </IntelCard>
      ))}
    </Grid>
  </Card>
)

export default IntelligencePanel
