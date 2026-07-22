import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { NAV_COMING_SOON_LABEL } from 'lib/navigation/comingSoon'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import { homeTypography } from './homeTradeTokens'

type GrowItem =
  | { id: string; title: string; subtitle: string; href: string; external?: boolean; comingSoon?: false }
  | { id: string; title: string; subtitle: string; comingSoon: true }

const GROW_ITEMS: GrowItem[] = [
  {
    id: 'radar',
    title: 'Radar',
    subtitle: 'Discover trends and claim your profile.',
    comingSoon: true,
  },
  {
    id: 'labs',
    title: 'Labs',
    subtitle: 'Trade narratives before listing.',
    comingSoon: true,
  },
  {
    id: 'space',
    title: 'Space',
    subtitle: 'Increase project visibility.',
    comingSoon: true,
  },
  {
    id: 'smartdrop',
    title: 'Smartdrop',
    subtitle: 'Acquire active holders.',
    comingSoon: true,
  },
]

const Shell = styled.section`
  background: ${premiumStudioColors.card};
  border: 1px solid ${premiumStudioColors.cardBorder};
  border-radius: 20px;
  padding: 24px;
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
  max-width: ${homeTypography.heroSubtitleMaxWidth};
`

const Title = styled.h2`
  margin: 0;
  font-size: ${homeTypography.sectionTitle.size};
  font-weight: ${homeTypography.sectionTitle.weight};
  color: ${premiumStudioColors.text};
  line-height: 1.1;
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: ${homeTypography.heroSubtitle.size};
  font-weight: ${homeTypography.heroSubtitle.weight};
  color: ${premiumStudioColors.subtitle};
  line-height: ${homeTypography.heroSubtitle.lineHeight};
  max-width: ${homeTypography.heroSubtitleMaxWidth};
`

const ExploreLink = styled(Link)`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${premiumStudioColors.gold};
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

const ecoCardStyles = `
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 16px;
  box-sizing: border-box;
  min-height: 78px;
  transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;

  &:hover:not(:disabled) {
    border-color: rgba(244, 196, 48, 0.55);
    transform: translateY(-2px);
    box-shadow: 0 0 24px rgba(244, 196, 48, 0.08);
  }

  @media (max-width: 767px) {
    width: 210px;
    flex: 0 0 auto;
  }
`

const EcoCardLink = styled(Link)`
  ${ecoCardStyles}
`

const EcoCardExternal = styled.a`
  ${ecoCardStyles}
`

const EcoCardDisabled = styled.div`
  ${ecoCardStyles}
  opacity: 0.72;
  cursor: default;
`

const TextCol = styled.div`
  min-width: 0;
  flex: 1;
`

const IconWrap = styled.span`
  display: flex;
  width: 28px;
  height: 28px;
  color: ${premiumStudioColors.gold};
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
  color: ${premiumStudioColors.text};
  line-height: 1.2;
`

const CardSubtitle = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: ${premiumStudioColors.muted};
  line-height: 1.25;
`

const ComingSoonBadge = styled.span`
  display: inline-flex;
  margin-top: 6px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${premiumStudioColors.cardBorder};
  font-size: 11px;
  font-weight: 700;
  color: ${premiumStudioColors.muted};
`

const ICONS: Record<string, React.ReactNode> = {
  labs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M9 3h6l1 4H8l1-4z" />
      <path d="M6 10h12v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8z" />
      <path d="M10 14h4" />
    </svg>
  ),
  space: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
    </svg>
  ),
  radar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 12l5-3" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  smartdrop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3l2.5 5.5L20 10l-5.5 1.5L12 17l-2.5-5.5L4 10l5.5-1.5L12 3z" />
      <path d="M5 19l1.5 3M19 19l-1.5 3" />
    </svg>
  ),
}

export const GrowInsideMelegaPanel: React.FC = () => (
  <Shell data-grow-inside-melega>
    <Header>
      <TitleBlock>
        <Title>Grow inside Melega</Title>
        <Subtitle>Use Melega&apos;s ecosystem to launch, promote, discover and expand.</Subtitle>
      </TitleBlock>
      <ExploreLink href="/projects">Explore ecosystem →</ExploreLink>
    </Header>
    <CardTrack>
      {GROW_ITEMS.map((item) => {
        const content = (
          <>
            <IconWrap>{ICONS[item.id]}</IconWrap>
            <TextCol>
              <CardTitle>{item.title}</CardTitle>
              <CardSubtitle>{item.subtitle}</CardSubtitle>
              {'comingSoon' in item && item.comingSoon ? <ComingSoonBadge>{NAV_COMING_SOON_LABEL}</ComingSoonBadge> : null}
            </TextCol>
          </>
        )

        if ('comingSoon' in item && item.comingSoon) {
          return (
            <EcoCardDisabled key={item.id} aria-disabled="true">
              {content}
            </EcoCardDisabled>
          )
        }

        if ('href' in item && item.href) {
          if (item.external) {
            return (
              <EcoCardExternal key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">
                {content}
              </EcoCardExternal>
            )
          }

          return (
            <EcoCardLink key={item.id} href={item.href}>
              {content}
            </EcoCardLink>
          )
        }

        return (
          <EcoCardDisabled key={item.id} aria-disabled="true">
            {content}
          </EcoCardDisabled>
        )
      })}
    </CardTrack>
  </Shell>
)

export default GrowInsideMelegaPanel
