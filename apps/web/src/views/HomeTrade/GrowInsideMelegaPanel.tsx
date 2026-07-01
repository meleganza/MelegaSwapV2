import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { colors } from 'design-system/melega'

const ECOSYSTEM_ITEMS = [
  {
    id: 'labs',
    title: 'Labs',
    subtitle: 'Trade narratives before listing',
    href: '/runtime/labs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M9 3h6l1 4H8l1-4z" />
        <path d="M6 10h12v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8z" />
        <path d="M10 14h4" />
      </svg>
    ),
  },
  {
    id: 'dex',
    title: 'DEX',
    subtitle: 'List, trade and earn',
    href: '/swap',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M7 10h10l-3-3M17 14H7l3 3" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: 'space',
    title: 'Space',
    subtitle: 'Propagate your project',
    href: '/presence',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
      </svg>
    ),
  },
  {
    id: 'radar',
    title: 'Radar',
    subtitle: 'Find trends and claim visibility',
    href: '/projects',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 12l5-3" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: 'smartdrop',
    title: 'SmartDrop',
    subtitle: 'Reach active holders',
    href: '/launch',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 3l2.5 5.5L20 10l-5.5 1.5L12 17l-2.5-5.5L4 10l5.5-1.5L12 3z" />
        <path d="M5 19l1.5 3M19 19l-1.5 3" />
      </svg>
    ),
  },
] as const

const Shell = styled.section`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 22px;
  box-sizing: border-box;
  max-height: 190px;
  overflow: hidden;

  @media (max-width: 767px) {
    max-height: none;
    padding: 18px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 850;
  color: #ffffff;
  line-height: 1.1;
`

const ExploreLink = styled(Link)`
  flex-shrink: 0;
  font-size: 13px;
  color: #d4af37;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

const CardTrack = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    padding-bottom: 2px;
  }
`

const EcoCard = styled(Link)`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  transition: border-color 150ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
  }

  @media (min-width: 768px) {
    width: calc((100% - 32px) / 5);
    min-width: 108px;
    height: 58px;
  }

  @media (max-width: 767px) {
    width: 150px;
    height: 92px;
    justify-content: flex-start;
  }
`

const IconWrap = styled.span`
  display: flex;
  width: 20px;
  height: 20px;
  color: ${colors.gold};
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 767px) {
    margin-bottom: 4px;
  }
`

const CardTitle = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
`

const CardSubtitle = styled.span`
  font-size: 11px;
  color: #a8a8a8;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const GrowInsideMelegaPanel: React.FC = () => (
  <Shell data-grow-inside-melega="true">
    <Header>
      <Title>Grow inside Melega</Title>
      <ExploreLink href="/projects">Explore ecosystem →</ExploreLink>
    </Header>
    <CardTrack>
      {ECOSYSTEM_ITEMS.map((item) => (
        <EcoCard key={item.id} href={item.href}>
          <IconWrap>{item.icon}</IconWrap>
          <CardTitle>{item.title}</CardTitle>
          <CardSubtitle>{item.subtitle}</CardSubtitle>
        </EcoCard>
      ))}
    </CardTrack>
  </Shell>
)

export default GrowInsideMelegaPanel
