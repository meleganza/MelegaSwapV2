import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 18px;
  box-sizing: border-box;
  min-height: 160px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontBody};
  font-size: 20px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;
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
  flex: 0 0 160px;
  height: 108px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  text-decoration: none;
  background: #111111;
  box-sizing: border-box;
  transition: border-color 180ms ease, transform 180ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.4);
    transform: translateY(-1px);
  }

  @media (min-width: 1024px) {
    flex: unset;
  }
`

const TextBlock = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  z-index: 2;
`

const IntelTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${ht.white};
  margin-bottom: 2px;
  line-height: 1.3;
`

const IntelText = styled.div`
  font-size: 12px;
  color: ${ht.textMuted};
  line-height: 1.35;
`

const Thumb = styled.div<{ $variant: 'radar' | 'space' | 'chart' }>`
  position: absolute;
  inset: 0;
  pointer-events: none;

  ${({ $variant }) =>
    $variant === 'radar' &&
    `
    &::before {
      content: '';
      position: absolute;
      right: -10%;
      bottom: -20%;
      width: 90%;
      height: 90%;
      border-radius: 50%;
      border: 1px solid rgba(212,175,55,0.3);
      background:
        repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(212,175,55,0.1) 10deg 11deg);
    }
    &::after {
      content: '';
      position: absolute;
      right: 8%;
      bottom: 8%;
      width: 55%;
      height: 55%;
      border-radius: 50%;
      border: 1px solid rgba(212,175,55,0.2);
    }
  `}

  ${({ $variant }) =>
    $variant === 'space' &&
    `
    &::before {
      content: '';
      position: absolute;
      right: -5%;
      bottom: -30%;
      width: 100%;
      height: 80%;
      background:
        radial-gradient(ellipse 80% 70% at 75% 95%, rgba(244,197,66,0.6) 0%, rgba(212,175,55,0.25) 35%, transparent 60%);
    }
  `}

  ${({ $variant }) =>
    $variant === 'chart' &&
    `
    &::before {
      content: '';
      position: absolute;
      right: 12px;
      bottom: 10px;
      width: 12px;
      height: 42px;
      background: linear-gradient(180deg, ${ht.goldBright}, ${ht.gold});
      border-radius: 2px;
      opacity: 0.85;
    }
    &::after {
      content: '';
      position: absolute;
      right: 30px;
      bottom: 10px;
      width: 12px;
      height: 28px;
      background: linear-gradient(180deg, ${ht.goldBright}, ${ht.goldDark});
      border-radius: 2px;
      opacity: 0.55;
    }
  `}
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
