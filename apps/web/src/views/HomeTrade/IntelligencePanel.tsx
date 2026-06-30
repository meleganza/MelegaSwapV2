import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
  min-height: 120px;

  @media (min-width: 1024px) {
    min-height: 170px;
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
  font-weight: 600;
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
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const IntelCard = styled(Link)`
  position: relative;
  display: block;
  min-height: 88px;
  border-radius: 10px;
  border: 1px solid ${ht.borderSoft};
  overflow: hidden;
  text-decoration: none;
  padding: 12px 14px;
  background: ${ht.surface2};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background: radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.45), transparent 55%);
  }

  &:hover {
    border-color: ${ht.borderGold};
  }
`

const IntelTitle = styled.div`
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 600;
  color: ${ht.white};
  margin-bottom: 4px;
`

const IntelText = styled.div`
  position: relative;
  z-index: 1;
  font-size: 12px;
  color: ${ht.textMuted};
  line-height: 1.4;
`

const items = [
  {
    id: 'radar',
    title: 'Radar',
    text: 'Discover rising projects',
    href: '/projects',
    visual: 'radar',
  },
  {
    id: 'space',
    title: 'Space Insights',
    text: 'Real-time ecosystem intelligence',
    href: '/query',
    visual: 'space',
  },
  {
    id: 'recap',
    title: 'Weekly Recap',
    text: 'Top projects, trends and opportunities',
    href: '/projects',
    visual: 'chart',
  },
] as const

export const IntelligencePanel: React.FC = () => (
  <Card>
    <Header>
      <Title>Intelligence</Title>
      <ViewLink href="/projects">View all →</ViewLink>
    </Header>
    <Grid>
      {items.map((item) => (
        <IntelCard key={item.id} href={item.href}>
          <IntelTitle>{item.title}</IntelTitle>
          <IntelText>{item.text}</IntelText>
        </IntelCard>
      ))}
    </Grid>
  </Card>
)

export default IntelligencePanel
