import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 14px 16px;
  box-sizing: border-box;
  transition: box-shadow 200ms ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  @media (min-width: 1024px) {
    min-height: 160px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;
`

const ViewLink = styled(Link)`
  font-size: 12px;
  color: ${ht.gold};
  text-decoration: none;
`

const Grid = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;

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
  display: flex;
  flex-direction: column;
  flex: 0 0 200px;
  min-height: 110px;
  border-radius: 10px;
  border: 1px solid ${ht.borderSoft};
  overflow: hidden;
  text-decoration: none;
  background: #0a0a0a;
  box-sizing: border-box;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;

  &:hover {
    border-color: ${ht.borderGold};
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.08);
    transform: translateY(-1px);
  }

  @media (min-width: 1024px) {
    flex: unset;
    min-height: 120px;
  }
`

const Thumb = styled.div<{ $variant: 'radar' | 'space' | 'chart' }>`
  width: 100%;
  height: 45%;
  min-height: 50px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  ${({ $variant }) =>
    $variant === 'radar' &&
    `
    background: radial-gradient(circle at 50% 55%, rgba(212,175,55,0.08) 0%, transparent 70%), #0d0d0d;

    &::before {
      content: '';
      position: absolute;
      inset: 8px 16px;
      border: 1px solid rgba(212,175,55,0.25);
      border-radius: 50%;
    }
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 70%;
      height: 70%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 1px solid rgba(212,175,55,0.15);
      background:
        repeating-conic-gradient(from 0deg, transparent 0deg 8deg, rgba(212,175,55,0.12) 8deg 9deg);
    }
  `}

  ${({ $variant }) =>
    $variant === 'space' &&
    `
    background:
      radial-gradient(ellipse 80% 70% at 75% 95%, rgba(244,197,66,0.55) 0%, rgba(212,175,55,0.2) 35%, transparent 60%),
      linear-gradient(180deg, #050505, #000);
  `}

  ${({ $variant }) =>
    $variant === 'chart' &&
    `
    background: linear-gradient(180deg, #111, #0a0a0a);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    padding-bottom: 8px;

    &::before {
      content: '';
      width: 10px;
      height: 36px;
      background: linear-gradient(180deg, ${ht.goldBright}, ${ht.gold});
      border-radius: 2px;
    }
    &::after {
      content: '';
      width: 10px;
      height: 22px;
      background: linear-gradient(180deg, ${ht.goldBright}, ${ht.goldDark});
      border-radius: 2px;
      opacity: 0.65;
    }
  `}
`

const TextBlock = styled.div`
  padding: 10px 12px;
  flex: 1;
`

const IntelTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${ht.white};
  margin-bottom: 2px;
  line-height: 1.3;
`

const IntelText = styled.div`
  font-size: 12px;
  color: ${ht.textMuted};
  line-height: 1.35;
`

const items = [
  { id: 'radar', title: 'Radar', text: 'Discover rising projects', href: '/projects', visual: 'radar' as const },
  { id: 'space', title: 'Space Insights', text: 'Real-time ecosystem intelligence', href: '/query', visual: 'space' as const },
  { id: 'recap', title: 'Weekly Recap', text: 'Top projects, trends and opportunities', href: '/projects', visual: 'chart' as const },
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
          <TextBlock>
            <IntelTitle>{item.title}</IntelTitle>
            <IntelText>{item.text}</IntelText>
          </TextBlock>
        </IntelCard>
      ))}
    </Grid>
  </Card>
)

export default IntelligencePanel
