import styled, { keyframes } from 'styled-components'
import { PREMIUM_FONT_BODY, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { ds001Colors, ds001Spacing, ds001TypeRoles } from 'design-system/melega/tokens/ds001'

export const CANVAS = ds001Colors.background
export const CARD_BG = ds001Colors.surface
export const CARD_BORDER = ds001Colors.border
export const GOLD = ds001Colors.primaryGold
export const MUTED = ds001Colors.muted
export const TEXT = ds001Colors.primaryText
export const BODY_SIZE = ds001TypeRoles.body.size
export const BODY_LINE = 1.5
export const SECTION_GAP = ds001Spacing[40]

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export const PageFrame = styled.div`
  width: 100%;
  min-height: calc(100vh - 64px);
  background: ${CANVAS};
  color: ${TEXT};
  font-family: ${PREMIUM_FONT_BODY};
  font-size: ${BODY_SIZE};
  line-height: ${BODY_LINE};
`

export const Shell = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${SECTION_GAP};
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px calc(96px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

export const AnimatedSection = styled.div`
  animation: ${fadeInUp} 0.45s ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-margin-top: calc(56px + env(safe-area-inset-top, 0px));
`

export const SectionTitle = styled.h2`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 700;
  line-height: 1.2;
  color: ${TEXT};
`

export const SubTitle = styled.h3`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  color: ${TEXT};
`

export const BodyText = styled.p`
  margin: 0;
  font-size: ${BODY_SIZE};
  line-height: ${BODY_LINE};
  color: ${TEXT};
  word-break: break-word;
`

export const MutedText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: ${BODY_LINE};
  color: ${MUTED};
  word-break: break-word;
`

export const Card = styled.div`
  background: ${CARD_BG};
  border: 1px solid ${CARD_BORDER};
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  backdrop-filter: blur(8px);
`

export const SoftCard = styled(Card)`
  background: linear-gradient(145deg, rgba(22, 22, 22, 0.9) 0%, rgba(14, 14, 14, 0.85) 100%);
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
`

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

export const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

export const MetricLabel = styled.span`
  font-size: 13px;
  color: ${MUTED};
  line-height: 1.3;
`

export const MetricValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${TEXT};
  line-height: 1.3;
  word-break: break-word;
`

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

export const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  background: ${GOLD};
  color: #0a0a0a;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${GOLD};
    outline-offset: 2px;
  }
`

export const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  background: transparent;
  color: ${TEXT};
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid ${CARD_BORDER};

  &:focus-visible {
    outline: 2px solid ${GOLD};
    outline-offset: 2px;
  }
`

export const TextLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: ${GOLD};
  font-size: 15px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${GOLD};
    outline-offset: 2px;
  }
`

export const Accordion = styled.details`
  border: 1px solid ${CARD_BORDER};
  border-radius: 12px;
  padding: 12px 14px;
  background: ${CARD_BG};

  &[open] > summary {
    margin-bottom: 12px;
  }
`

export const AccordionSummary = styled.summary`
  cursor: pointer;
  list-style: none;
  min-height: 44px;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: ${TEXT};

  &::-webkit-details-marker {
    display: none;
  }

  &:focus-visible {
    outline: 2px solid ${GOLD};
    outline-offset: 2px;
  }
`

export const EmptyState = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.06) 0%, rgba(20, 20, 20, 0.92) 45%, rgba(27, 231, 122, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0.35;
  }

  &::before {
    width: 120px;
    height: 120px;
    top: -40px;
    right: -20px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%);
  }

  &::after {
    width: 80px;
    height: 80px;
    bottom: -24px;
    left: -12px;
    background: radial-gradient(circle, rgba(27, 231, 122, 0.18) 0%, transparent 70%);
  }
`

export const EmptyStateTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${TEXT};
  position: relative;
  z-index: 1;
`

export const EmptyStateBody = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: ${BODY_LINE};
  color: ${MUTED};
  position: relative;
  z-index: 1;
`

export const SkeletonBlock = styled.div`
  min-height: 72px;
  border-radius: 12px;
  background: linear-gradient(90deg, #141414 0%, #1c1c1c 50%, #141414 100%);
  background-size: 200% 100%;
  animation: project-consumer-shimmer 1.2s ease-in-out infinite;

  @keyframes project-consumer-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
