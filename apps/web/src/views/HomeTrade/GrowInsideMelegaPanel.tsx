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
    id: 'space',
    title: 'Space',
    subtitle: 'Increase project visibility',
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
    subtitle: 'Find trends and claim your profile',
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
    subtitle: 'Acquire active holders',
    href: '/launch',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 3l2.5 5.5L20 10l-5.5 1.5L12 17l-2.5-5.5L4 10l5.5-1.5L12 3z" />
        <path d="M5 19l1.5 3M19 19l-1.5 3" />
      </svg>
    ),
  },
  {
    id: 'insights',
    title: 'Insights',
    subtitle: 'Monitor ecosystem intelligence',
    href: '/query',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 19h16M6 16l3-8 4 5 3-4 2 7" />
        <circle cx="18" cy="6" r="2" />
      </svg>
    ),
  },
] as const

const Shell = styled.section`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 20px 22px 22px;
  box-sizing: border-box;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

const TitleBlock = styled.div`
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  font-weight: 400;
  color: #a8a8a8;
  line-height: 1.35;
`

const ExploreLink = styled(Link)`
  flex-shrink: 0;
  font-size: 13px;
  color: #d4af37;
  text-decoration: none;
  white-space: nowrap;
  padding-top: 4px;

  &:hover {
    text-decoration: underline;
  }
`

const CardTrack = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    overflow: visible;
  }
`

const EcoCard = styled(Link)`
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  height: 74px;
  transition:
    border-color 150ms ease,
    transform 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.08);
  }

  @media (max-width: 767px) {
    width: 160px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    height: 92px;
  }
`

const TextCol = styled.div`
  min-width: 0;
  flex: 1;
`

const IconWrap = styled.span`
  display: flex;
  width: 22px;
  height: 22px;
  color: ${colors.gold};
  flex-shrink: 0;

  svg {
    width: 22px;
    height: 22px;
  }
`

const CardTitle = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
`

const CardSubtitle = styled.span`
  display: block;
  margin-top: 2px;
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
      <TitleBlock>
        <Title>Grow inside Melega</Title>
        <Subtitle>Grow faster using the Melega ecosystem.</Subtitle>
      </TitleBlock>
      <ExploreLink href="/projects">Explore ecosystem →</ExploreLink>
    </Header>
    <CardTrack>
      {ECOSYSTEM_ITEMS.map((item) => (
        <EcoCard key={item.id} href={item.href}>
          <IconWrap>{item.icon}</IconWrap>
          <TextCol>
            <CardTitle>{item.title}</CardTitle>
            <CardSubtitle>{item.subtitle}</CardSubtitle>
          </TextCol>
        </EcoCard>
      ))}
    </CardTrack>
  </Shell>
)

export default GrowInsideMelegaPanel
