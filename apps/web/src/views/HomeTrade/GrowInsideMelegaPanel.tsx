import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { colors } from 'design-system/melega'

const GROW_ITEMS = [
  {
    id: 'labs',
    title: 'LABS',
    subtitle: 'Trade narratives before listing.',
    href: '/build-studio',
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
    title: 'SPACE',
    subtitle: 'Increase project visibility.',
    href: 'https://space.melega.io',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
      </svg>
    ),
  },
  {
    id: 'radar',
    title: 'RADAR',
    subtitle: 'Discover trends and claim your profile.',
    href: '/radar',
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
    title: 'SMARTDROP',
    subtitle: 'Acquire active holders.',
    href: '/import-existing-token',
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
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  box-sizing: border-box;
  max-height: 180px;
  overflow: hidden;
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
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.1;
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  font-weight: 400;
  color: #b3b3b3;
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
  gap: 10px;
  margin-top: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow: visible;
  }
`

const EcoCard = styled(Link)`
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px;
  box-sizing: border-box;
  height: 78px;
  transition:
    border-color 150ms ease,
    transform 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.55);
    transform: translateY(-2px);
    box-shadow: 0 0 24px rgba(212, 175, 55, 0.08);
  }

  @media (max-width: 767px) {
    width: 210px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
`

const TextCol = styled.div`
  min-width: 0;
  flex: 1;
`

const IconWrap = styled.span`
  display: flex;
  width: 28px;
  height: 28px;
  color: ${colors.gold};
  flex-shrink: 0;

  svg {
    width: 28px;
    height: 28px;
  }
`

const CardTitle = styled.span`
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
`

const CardSubtitle = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: #a8a8a8;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const GrowInsideMelegaPanel: React.FC = () => (
  <Shell data-grow-your-project="true">
    <Header>
      <TitleBlock>
        <Title>Grow your project</Title>
        <Subtitle>Use Melega&apos;s ecosystem to launch, promote, discover and expand.</Subtitle>
      </TitleBlock>
      <ExploreLink href="/projects">Explore ecosystem →</ExploreLink>
    </Header>
    <CardTrack>
      {GROW_ITEMS.map((item) => (
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
