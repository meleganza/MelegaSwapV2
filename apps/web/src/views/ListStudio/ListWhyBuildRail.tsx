/**
 * LIST_MODULE_003 — Why build on Melega benefits rail.
 * Desktop 1376×112. Informational only — no buttons or navigation.
 */
import React from 'react'
import styled from 'styled-components'
import { Share2, Sparkles, ShieldCheck, Users } from 'lucide-react'
import { listOne } from './listTokens'

type Accent = 'gold' | 'cyan' | 'blue'

type Benefit = {
  id: string
  title: string
  description: string
  accent: Accent
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const BENEFITS: Benefit[] = [
  {
    id: 'ecosystem',
    title: 'Full Ecosystem Access',
    description: 'Liquidity, Farms, Pools, SmartDrop, Radar and more.',
    accent: 'gold',
    Icon: Share2,
  },
  {
    id: 'ai',
    title: 'AI-Powered Guidance',
    description: 'Smart assistance helps prepare and improve your project information.',
    accent: 'cyan',
    Icon: Sparkles,
  },
  {
    id: 'secure',
    title: 'Verified & Secure',
    description: 'Built-in tools support verification, ownership checks and safer publishing.',
    accent: 'blue',
    Icon: ShieldCheck,
  },
  {
    id: 'community',
    title: 'Community Driven',
    description: 'Gain visibility and connect with the wider Melega builder community.',
    accent: 'gold',
    Icon: Users,
  },
]

const ACCENT: Record<Accent, { tile: string; border: string; icon: string }> = {
  gold: {
    tile: 'rgba(221, 185, 47, 0.06)',
    border: 'rgba(221, 185, 47, 0.25)',
    icon: '#E7C438',
  },
  cyan: {
    tile: 'rgba(45, 212, 191, 0.08)',
    border: 'rgba(45, 212, 191, 0.28)',
    icon: '#5EEAD4',
  },
  blue: {
    tile: 'rgba(64, 120, 255, 0.08)',
    border: 'rgba(64, 120, 255, 0.28)',
    icon: '#7AA8FF',
  },
}

const Section = styled.section`
  position: relative;
  width: 100%;
  max-width: ${listOne.contentMax};
  height: ${listOne.whyH};
  margin: ${listOne.whyTop} 0 0;
  box-sizing: border-box;
  border-radius: ${listOne.whyRadius};
  padding: ${listOne.whyPad};
  overflow: hidden;
  font-family: ${listOne.font};
  background:
    radial-gradient(circle at 92% 50%, rgba(221, 185, 47, 0.06) 0%, transparent 42%),
    linear-gradient(
      120deg,
      rgba(18, 18, 18, 0.98) 0%,
      rgba(13, 13, 13, 0.98) 55%,
      rgba(18, 16, 11, 0.98) 100%
    );
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);

  @media (min-width: 768px) and (max-width: 1199px) {
    height: auto;
    min-height: 0;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: ${listOne.mobileCardW};
    height: auto;
    min-height: 0;
  }
`

const Inner = styled.div`
  width: 100%;
  max-width: ${listOne.whyInnerW};
  height: ${listOne.whyInnerH};
  display: grid;
  grid-template-columns:
    ${listOne.whyIntroW} ${listOne.whyBenefitW} ${listOne.whyBenefitW} ${listOne.whyBenefitW}
    ${listOne.whyBenefitW};
  column-gap: ${listOne.whyColGap};
  align-items: center;
  box-sizing: border-box;

  @media (min-width: 768px) and (max-width: 1199px) {
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${listOne.whyTabletGap};
  }

  @media (max-width: 767px) {
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }
`

const Intro = styled.div`
  width: ${listOne.whyIntroW};
  height: ${listOne.whyInnerH};
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;

  @media (min-width: 768px) and (max-width: 1199px) {
    width: 100%;
    height: auto;
    grid-column: 1 / -1;
    margin-bottom: 4px;
  }

  @media (max-width: 767px) {
    width: 100%;
    height: auto;
    margin-bottom: 14px;
  }
`

const IntroTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: #f5f5f5;
`

const IntroSub = styled.p`
  margin: 6px 0 0;
  max-width: 100%;
  font-size: 11px;
  line-height: 16px;
  font-weight: 400;
  color: #747474;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const BenefitList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: contents;

  @media (min-width: 768px) and (max-width: 1199px) {
    display: contents;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: ${listOne.whyMobileGap};
    width: 100%;
  }
`

const BenefitItem = styled.li<{ $accent: Accent }>`
  position: relative;
  width: ${listOne.whyBenefitW};
  height: ${listOne.whyInnerH};
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-width: 0;
  box-sizing: border-box;

  /* Separators between benefits only (not after intro) */
  &:not(:first-child)::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: ${listOne.whySepH};
    background: rgba(255, 255, 255, 0.06);
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    width: 100%;
    height: ${listOne.whyTabletBenefitH};

    &::before {
      display: none;
    }
  }

  @media (max-width: 767px) {
    width: 100%;
    height: ${listOne.whyMobileBenefitH};

    &::before {
      display: none;
    }
  }
`

const IconTile = styled.span<{ $accent: Accent }>`
  width: ${listOne.whyIconTile};
  height: ${listOne.whyIconTile};
  border-radius: 12px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $accent }) => ACCENT[$accent].tile};
  border: 1px solid ${({ $accent }) => ACCENT[$accent].border};
  color: ${({ $accent }) => ACCENT[$accent].icon};

  svg {
    display: block;
    width: ${listOne.whyIconSize};
    height: ${listOne.whyIconSize};
  }
`

const TextBlock = styled.div`
  width: ${listOne.whyTextW};
  max-width: 100%;
  min-width: 0;
  flex: 1;
`

const BenefitTitle = styled.h3`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: #f5f5f5;
`

const BenefitDesc = styled.p`
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 16px;
  font-weight: 400;
  color: #a8a8a8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 767px) {
    -webkit-line-clamp: 2;
  }
`

export const ListWhyBuildRail: React.FC = () => {
  return (
    <Section
      data-testid="list-why-build"
      data-list-module="003"
      data-pixel-why="1376x112"
      aria-labelledby="list-why-build-title"
    >
      <Inner data-testid="list-why-inner" data-pixel-why-inner="1344x80">
        <Intro data-testid="list-why-intro" data-pixel-why-intro="220x80">
          <IntroTitle id="list-why-build-title">Why build on Melega?</IntroTitle>
          <IntroSub>One ecosystem. More ways to launch, grow and be discovered.</IntroSub>
        </Intro>

        <BenefitList data-testid="list-why-benefits">
          {BENEFITS.map((b) => (
            <BenefitItem
              key={b.id}
              $accent={b.accent}
              data-testid={`list-why-benefit-${b.id}`}
              data-pixel-why-benefit="265x80"
            >
              <IconTile $accent={b.accent} aria-hidden data-testid={`list-why-icon-${b.id}`}>
                <b.Icon strokeWidth={1.75} />
              </IconTile>
              <TextBlock>
                <BenefitTitle>{b.title}</BenefitTitle>
                <BenefitDesc>{b.description}</BenefitDesc>
              </TextBlock>
            </BenefitItem>
          ))}
        </BenefitList>
      </Inner>
    </Section>
  )
}

export default ListWhyBuildRail
