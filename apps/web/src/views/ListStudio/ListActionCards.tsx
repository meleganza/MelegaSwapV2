/**
 * LIST_MODULE_002 — five List entry action cards.
 * Desktop 5×256×272 @ 1376. Mobile compact 358×82 rows. Hero untouched.
 */
import React, { useEffect, useRef } from 'react'
import styled, { css } from 'styled-components'
import {
  ArrowDownToLine,
  Box,
  FileBadge2,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import {
  LIST_CREATE_TOKEN_AVAILABLE,
  listOne,
  type ListIntent,
} from './listTokens'
import { useListIntent } from './useListIntent'

type Accent = 'violet' | 'gold' | 'goldPremium' | 'blue' | 'cyan'

type CardDef = {
  intent: ListIntent
  title: string
  description: string
  cta: string
  accent: Accent
  featured?: boolean
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  available: boolean
  disabledCta?: string
}

const CARDS: CardDef[] = [
  {
    intent: 'import-token',
    title: 'Import Token',
    description: 'Add an existing token to the Melega ecosystem in just a few clicks.',
    cta: 'Import Token',
    accent: 'violet',
    Icon: ArrowDownToLine,
    available: true,
  },
  {
    intent: 'create-token',
    title: 'Create Token',
    description: 'Launch your own token with a simple and secure creation flow.',
    cta: 'Create Token',
    accent: 'gold',
    Icon: Box,
    available: LIST_CREATE_TOKEN_AVAILABLE,
    disabledCta: 'Coming Soon',
  },
  {
    intent: 'claim-project',
    title: 'Claim Project Page',
    description: 'Already have a listed token? Claim its official Melega Project Page.',
    cta: 'Claim Page',
    accent: 'goldPremium',
    featured: true,
    Icon: FileBadge2,
    available: true,
  },
  {
    intent: 'create-project',
    title: 'Create Project Page',
    description: 'Build your project presence with or without a token.',
    cta: 'Create Page',
    accent: 'blue',
    Icon: Layers,
    available: true,
  },
  {
    intent: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Get guided help to prepare your token or project information.',
    cta: 'Get Help',
    accent: 'cyan',
    Icon: Sparkles,
    available: true,
  },
]

const ACCENT: Record<Accent, { tile: string; icon: string }> = {
  violet: { tile: 'rgba(124, 92, 255, 0.18)', icon: '#B8A4FF' },
  gold: { tile: 'rgba(221, 185, 47, 0.16)', icon: '#E7C438' },
  goldPremium: { tile: 'rgba(221, 185, 47, 0.22)', icon: '#F2C84C' },
  blue: { tile: 'rgba(64, 120, 255, 0.18)', icon: '#7AA8FF' },
  cyan: { tile: 'rgba(45, 212, 191, 0.16)', icon: '#5EEAD4' },
}

const INTENT_LABEL: Record<ListIntent, string> = {
  'import-token': 'Import Token',
  'create-token': 'Create Token',
  'claim-project': 'Claim Project Page',
  'create-project': 'Create Project Page',
  'ai-assistant': 'AI Assistant',
}

const Row = styled.div`
  width: 100%;
  max-width: ${listOne.contentMax};
  margin: ${listOne.cardsTop} 0 0;
  box-sizing: border-box;
  min-width: 0;

  @media (min-width: 1200px) {
    height: ${listOne.cardsRowH};
    display: grid;
    grid-template-columns: repeat(5, ${listOne.cardW});
    column-gap: ${listOne.cardGap};
    align-items: stretch;
    overflow: visible;
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${listOne.tabletGap};
  }

  @media (max-width: 767px) {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${listOne.mobileCardGap};
  }
`

const cardShell = css<{ $featured?: boolean; $selected?: boolean }>`
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  /* Featured POPULAR badge sits at top:-10px — allow that escape only */
  overflow: ${({ $featured }) => ($featured ? 'visible' : 'hidden')};
  font-family: ${listOne.font};
  text-align: left;
  cursor: pointer;
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  &:focus-visible {
    outline: 2px solid rgba(221, 185, 47, 0.85);
    outline-offset: 2px;
  }

  @media (min-width: 1200px) {
    width: ${listOne.cardW};
    height: ${listOne.cardH};
    border-radius: ${listOne.cardRadius};
    padding: ${listOne.cardPad};
    background: ${({ $featured }) =>
      $featured
        ? `radial-gradient(
            circle at 50% 10%,
            rgba(221, 185, 47, 0.20),
            rgba(18, 17, 13, 0.98) 55%,
            rgba(12, 12, 12, 0.98) 100%
          )`
        : `linear-gradient(
            145deg,
            rgba(22, 22, 22, 0.98) 0%,
            rgba(14, 14, 14, 0.98) 100%
          )`};
    border: 1px solid
      ${({ $featured, $selected }) =>
        $featured
          ? 'rgba(221, 185, 47, 0.95)'
          : $selected
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(255, 255, 255, 0.10)'};
    box-shadow: ${({ $featured }) =>
      $featured
        ? `0 18px 44px rgba(0, 0, 0, 0.34),
           0 0 28px rgba(221, 185, 47, 0.12),
           inset 0 1px 0 rgba(255, 235, 150, 0.14)`
        : `0 18px 42px rgba(0, 0, 0, 0.30),
           inset 0 1px 0 rgba(255, 255, 255, 0.035)`};

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      border-color: ${({ $featured }) =>
        $featured ? 'rgba(231, 196, 56, 1)' : 'rgba(255, 255, 255, 0.16)'};
      box-shadow: ${({ $featured }) =>
        $featured
          ? `0 20px 48px rgba(0, 0, 0, 0.36),
             0 0 34px rgba(221, 185, 47, 0.144),
             inset 0 1px 0 rgba(255, 235, 150, 0.14)`
          : `0 20px 44px rgba(0, 0, 0, 0.34),
             inset 0 1px 0 rgba(255, 255, 255, 0.035)`};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    width: 100%;
    height: ${listOne.tabletCardH};
    border-radius: ${listOne.cardRadius};
    padding: ${listOne.cardPad};
    background: ${({ $featured }) =>
      $featured
        ? `radial-gradient(
            circle at 50% 10%,
            rgba(221, 185, 47, 0.20),
            rgba(18, 17, 13, 0.98) 55%,
            rgba(12, 12, 12, 0.98) 100%
          )`
        : `linear-gradient(
            145deg,
            rgba(22, 22, 22, 0.98) 0%,
            rgba(14, 14, 14, 0.98) 100%
          )`};
    border: 1px solid
      ${({ $featured }) => ($featured ? 'rgba(221, 185, 47, 0.95)' : 'rgba(255, 255, 255, 0.10)')};
    box-shadow: ${({ $featured }) =>
      $featured
        ? `0 18px 44px rgba(0, 0, 0, 0.34),
           0 0 28px rgba(221, 185, 47, 0.12),
           inset 0 1px 0 rgba(255, 235, 150, 0.14)`
        : `0 18px 42px rgba(0, 0, 0, 0.30),
           inset 0 1px 0 rgba(255, 255, 255, 0.035)`};

    &:nth-child(5) {
      grid-column: 1 / -1;
      max-width: 100%;
    }
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: ${listOne.mobileCardW};
    height: ${listOne.mobileCardH};
    border-radius: ${listOne.mobileCardRadius};
    padding: ${listOne.mobileCardPad};
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    background: ${({ $featured }) =>
      $featured
        ? `radial-gradient(
            circle at 12% 50%,
            rgba(221, 185, 47, 0.18),
            rgba(14, 14, 14, 0.98) 70%
          )`
        : `linear-gradient(
            145deg,
            rgba(22, 22, 22, 0.98) 0%,
            rgba(14, 14, 14, 0.98) 100%
          )`};
    border: 1px solid
      ${({ $featured }) => ($featured ? 'rgba(221, 185, 47, 0.85)' : 'rgba(255, 255, 255, 0.10)')};
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);

    &:hover:not(:disabled) {
      transform: none;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }
`

const CardButton = styled.button<{ $featured?: boolean; $selected?: boolean; $span?: boolean }>`
  ${cardShell}
  appearance: none;
  display: flex;
  flex-direction: column;
  color: inherit;

  @media (min-width: 768px) and (max-width: 1199px) {
    ${({ $span }) => ($span ? 'grid-column: 1 / -1;' : '')}
  }
`

const PopularBadgeDesktop = styled.span`
  position: absolute;
  top: ${listOne.badgeTop};
  left: 50%;
  transform: translateX(-50%);
  width: ${listOne.badgeW};
  height: ${listOne.badgeH};
  border-radius: 999px;
  background: #ddb92f;
  color: #090909;
  font-size: 9px;
  line-height: 12px;
  font-weight: 750;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;

  @media (max-width: 767px) {
    display: none;
  }
`

const PopularBadgeMobile = styled.span`
  display: none;

  @media (max-width: 767px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${listOne.mobileBadgeW};
    height: ${listOne.mobileBadgeH};
    border-radius: 999px;
    background: #ddb92f;
    color: #090909;
    font-size: 8px;
    line-height: 10px;
    font-weight: 750;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
`

const IconTile = styled.span<{ $accent: Accent }>`
  width: ${listOne.iconTile};
  height: ${listOne.iconTile};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $accent }) => ACCENT[$accent].tile};
  color: ${({ $accent }) => ACCENT[$accent].icon};

  svg {
    display: block;
    width: ${listOne.iconSize};
    height: ${listOne.iconSize};
  }

  @media (max-width: 767px) {
    width: ${listOne.mobileIcon};
    height: ${listOne.mobileIcon};

    svg {
      width: 20px;
      height: 20px;
    }
  }
`

const Title = styled.h2`
  margin: ${listOne.contentGap} 0 0;
  height: ${listOne.titleH};
  max-height: ${listOne.titleH};
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #f5f5f5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (max-width: 767px) {
    margin: 0;
    height: auto;
    max-height: none;
    font-size: 15px;
    line-height: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
`

const Description = styled.p`
  margin: 0;
  height: ${listOne.descH};
  max-height: ${listOne.descH};
  font-size: 13px;
  line-height: 19px;
  font-weight: 400;
  color: #a8a8a8;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  @media (max-width: 767px) {
    margin: 2px 0 0;
    height: auto;
    max-height: 32px;
    font-size: 12px;
    line-height: 16px;
    -webkit-line-clamp: 2;
  }
`

const Spacer = styled.div`
  flex: 1 1 auto;
  min-height: 0;

  @media (max-width: 767px) {
    display: none;
  }
`

const Cta = styled.span<{ $featured?: boolean; $disabled?: boolean }>`
  position: relative;
  width: ${listOne.ctaW};
  height: ${listOne.ctaH};
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  padding: 0 40px 0 14px;
  box-sizing: border-box;
  font-size: 13px;
  line-height: 18px;
  font-weight: 650;
  flex-shrink: 0;
  background: ${({ $featured, $disabled }) =>
    $disabled
      ? 'rgba(255, 255, 255, 0.03)'
      : $featured
        ? 'linear-gradient(180deg, #e7c438 0%, #ddb92f 100%)'
        : 'rgba(255, 255, 255, 0.035)'};
  border: 1px solid
    ${({ $featured, $disabled }) =>
      $disabled
        ? 'rgba(255, 255, 255, 0.08)'
        : $featured
          ? 'rgba(221, 185, 47, 0.55)'
          : 'rgba(255, 255, 255, 0.12)'};
  color: ${({ $featured, $disabled }) => ($disabled ? '#888' : $featured ? '#090909' : '#f5f5f5')};

  svg {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
  }

  @media (max-width: 767px) {
    display: none;
  }
`

const MobileBody = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
`

const DesktopBody = styled.div`
  display: contents;

  @media (max-width: 767px) {
    display: none;
  }
`

const MobileChevron = styled.span`
  display: none;

  @media (max-width: 767px) {
    display: inline-flex;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: #c8c8c8;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`

const Placeholder = styled.div`
  margin-top: 16px;
  width: 100%;
  max-width: ${listOne.contentMax};
  min-height: 48px;
  padding: 14px 16px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(16, 16, 16, 0.92);
  color: #a8a8a8;
  font-size: 13px;
  line-height: 20px;
  font-family: ${listOne.font};

  strong {
    color: #f5f5f5;
    font-weight: 650;
  }
`

function ActionCard({
  def,
  selected,
  onSelect,
}: {
  def: CardDef
  selected: boolean
  onSelect: (intent: ListIntent) => void
}) {
  const disabled = !def.available
  const ctaLabel = disabled ? def.disabledCta || 'Coming Soon' : def.cta

  return (
    <CardButton
      type="button"
      $featured={def.featured}
      $selected={selected}
      $span={def.intent === 'ai-assistant'}
      data-testid={`list-action-${def.intent}`}
      data-list-intent={def.intent}
      data-featured={def.featured ? '1' : '0'}
      data-selected={selected ? '1' : '0'}
      data-available={def.available ? '1' : '0'}
      data-pixel-card={def.featured ? '256x272-featured' : '256x272'}
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onSelect(def.intent)
      }}
    >
      {def.featured ? (
        <PopularBadgeDesktop data-testid="list-action-popular-badge">POPULAR</PopularBadgeDesktop>
      ) : null}

      <IconTile $accent={def.accent} aria-hidden data-testid={`list-action-icon-${def.intent}`}>
        <def.Icon strokeWidth={1.75} />
      </IconTile>

      <DesktopBody>
        <Title>{def.title}</Title>
        <Description>{def.description}</Description>
        <Spacer aria-hidden />
        <Cta $featured={def.featured} $disabled={disabled} data-testid={`list-action-cta-${def.intent}`}>
          {ctaLabel}
          <ArrowRight strokeWidth={2} aria-hidden />
        </Cta>
      </DesktopBody>

      <MobileBody>
        <Title>
          <span>{def.title}</span>
          {def.featured ? (
            <PopularBadgeMobile data-testid="list-action-popular-badge-mobile">POPULAR</PopularBadgeMobile>
          ) : null}
        </Title>
        <Description>{def.description}</Description>
      </MobileBody>

      <MobileChevron aria-hidden>
        <ChevronRight strokeWidth={2} />
      </MobileChevron>
    </CardButton>
  )
}

export const ListActionCards: React.FC = () => {
  const { listIntent, setListIntent } = useListIntent()
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listIntent) return
    placeholderRef.current?.focus({ preventScroll: false })
    placeholderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [listIntent])

  return (
    <>
      <Row data-testid="list-action-cards" data-pixel-cards-row="1376x272" data-list-module="002">
        {CARDS.map((def) => (
          <ActionCard
            key={def.intent}
            def={def}
            selected={listIntent === def.intent}
            onSelect={setListIntent}
          />
        ))}
      </Row>

      <Placeholder
        ref={placeholderRef}
        tabIndex={-1}
        data-testid="list-intent-placeholder"
        data-list-intent={listIntent || ''}
        aria-live="polite"
      >
        {listIntent ? (
          <>
            <strong>{INTENT_LABEL[listIntent]}</strong>
            {' — '}
            {listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE
              ? 'Token creation is not available yet on this page.'
              : 'Inline flow will open here. You remain on /list.'}
          </>
        ) : (
          'Select a path above to continue. Forms open on this page — no separate route.'
        )}
      </Placeholder>
    </>
  )
}

export default ListActionCards
