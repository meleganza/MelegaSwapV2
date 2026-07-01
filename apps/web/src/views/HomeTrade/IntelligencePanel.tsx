import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaIntelligenceTile, MelegaSectionCard, colors } from 'design-system/melega'

const SectionLink = styled(Link)`
  color: ${colors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Grid = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-top: 14px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow: visible;
  }
`

const items = [
  { id: 'radar', title: 'Radar', text: 'Discover rising projects', href: '/projects', visual: 'radar' as const },
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
  <MelegaSectionCard
    title="Intelligence"
    minHeight="180px"
    action={<SectionLink href="/projects">View all →</SectionLink>}
  >
    <Grid>
      {items.map((item) => (
        <MelegaIntelligenceTile
          key={item.id}
          title={item.title}
          description={item.text}
          href={item.href}
          variant={item.visual}
        />
      ))}
    </Grid>
  </MelegaSectionCard>
)

export default IntelligencePanel
