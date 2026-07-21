import styled from 'styled-components'
import { PREMIUM_FONT_BODY, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'

export const CANVAS = '#0a0a0a'
export const CARD_BG = '#141414'
export const CARD_BORDER = '#2a2a2a'
export const GOLD = '#d4af37'
export const MUTED = '#8f8f8f'
export const TEXT = '#ffffff'
export const BODY_SIZE = '17px'
export const BODY_LINE = 1.5

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
  gap: 28px;
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

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  padding: 0 16px;
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
  padding: 0 16px;
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
