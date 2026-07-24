/**
 * LIST_MODULE_004 — How it works process rail.
 * Desktop 1376×176 static explanation. Not interactive.
 */
import React from 'react'
import styled from 'styled-components'
import { listOne } from './listTokens'

type Step = {
  n: number
  title: string
  description: string
  /** Desktop center X within the 1336px timeline */
  center: number
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Choose',
    description: 'Import, create or claim your token or project.',
    center: 104,
  },
  {
    n: 2,
    title: 'Setup',
    description: 'Complete the required information with AI assistance.',
    center: 386,
  },
  {
    n: 3,
    title: 'Review',
    description: 'Confirm the details, ownership and publishing choices.',
    center: 668,
  },
  {
    n: 4,
    title: 'Publish',
    description: 'Create your Melega identity and ecosystem presence.',
    center: 950,
  },
  {
    n: 5,
    title: 'Grow',
    description: 'Build visibility, liquidity and community over time.',
    center: 1232,
  },
]

const Section = styled.section`
  position: relative;
  width: 100%;
  max-width: ${listOne.contentMax};
  height: ${listOne.howH};
  margin: ${listOne.howTop} 0 0;
  box-sizing: border-box;
  border-radius: ${listOne.howRadius};
  padding: ${listOne.howPad};
  overflow: hidden;
  font-family: ${listOne.font};
  background: linear-gradient(145deg, rgba(17, 17, 17, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  pointer-events: none;
  user-select: text;

  @media (min-width: 768px) and (max-width: 1199px) {
    height: auto;
    min-height: 0;
    padding: 18px;
    pointer-events: auto;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: ${listOne.mobileCardW};
    height: auto;
    min-height: 0;
    padding: 16px;
    pointer-events: auto;
  }
`

const Header = styled.div`
  height: ${listOne.howHeaderH};
  display: flex;
  align-items: center;
  margin: 0 0 ${listOne.howHeaderGap};

  @media (max-width: 767px) {
    height: ${listOne.howMobileTitleRow};
    margin-bottom: 12px;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: #f5f5f5;
`

const Timeline = styled.div`
  position: relative;
  width: 100%;
  max-width: ${listOne.howTimelineW};
  height: ${listOne.howTimelineH};

  @media (min-width: 768px) and (max-width: 1199px) {
    height: auto;
    max-width: none;
  }

  @media (max-width: 767px) {
    height: auto;
    max-width: none;
  }
`

const Connector = styled.div`
  position: absolute;
  left: ${listOne.howConnectorL};
  top: ${listOne.howConnectorY};
  width: ${listOne.howConnectorW};
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(221, 185, 47, 0.3),
    rgba(221, 185, 47, 0.9),
    rgba(221, 185, 47, 0.3)
  );
  z-index: 0;
  pointer-events: none;

  @media (max-width: 1199px) {
    display: none;
  }
`

const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;

  @media (min-width: 768px) and (max-width: 1199px) {
    height: auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: ${listOne.howTabletGapX};
    row-gap: ${listOne.howTabletGapY};
  }

  @media (max-width: 767px) {
    height: auto;
    display: flex;
    flex-direction: column;
    gap: ${listOne.howMobileGap};
  }
`

const StepItem = styled.li<{ $center: number }>`
  position: absolute;
  left: ${({ $center }) => `${$center - 104}px`};
  top: 0;
  width: ${listOne.howStepW};
  height: ${listOne.howStepH};
  box-sizing: border-box;
  text-align: left;

  @media (min-width: 768px) and (max-width: 1199px) {
    position: relative;
    left: auto;
    width: 100%;
    height: auto;
    min-height: ${listOne.howTabletStepMinH};
  }

  @media (max-width: 767px) {
    position: relative;
    left: auto;
    width: 100%;
    max-width: 326px;
    height: auto;
    min-height: ${listOne.howMobileStepMinH};
    display: grid;
    grid-template-columns: ${listOne.howMobileCircle} 1fr;
    column-gap: 12px;
    align-items: start;
  }
`

const Circle = styled.span`
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: ${listOne.howCircle};
  height: ${listOne.howCircle};
  border-radius: 50%;
  box-sizing: border-box;
  border: 1px solid rgba(221, 185, 47, 0.9);
  background: #121212;
  color: #ddb92f;
  font-size: 12px;
  line-height: 16px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px rgba(221, 185, 47, 0.08);
  z-index: 2;

  @media (prefers-reduced-motion: reduce) {
    box-shadow: none;
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    margin-bottom: 10px;
  }

  @media (max-width: 767px) {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    width: ${listOne.howMobileCircle};
    height: ${listOne.howMobileCircle};
    grid-row: 1 / span 2;
  }
`

const StepTitle = styled.h3`
  position: absolute;
  top: 50px;
  left: 0;
  margin: 0;
  width: ${listOne.howDescW};
  max-width: 100%;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: #f5f5f5;

  @media (min-width: 768px) and (max-width: 1199px) {
    position: relative;
    top: auto;
  }

  @media (max-width: 767px) {
    position: relative;
    top: auto;
    width: auto;
    font-size: 13px;
    line-height: 18px;
  }
`

const StepDesc = styled.p`
  position: absolute;
  top: 72px;
  left: 0;
  margin: 0;
  width: ${listOne.howDescW};
  max-width: 100%;
  font-size: 11px;
  line-height: 16px;
  font-weight: 400;
  color: #a8a8a8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: 768px) and (max-width: 1199px) {
    position: relative;
    top: auto;
    margin-top: 4px;
  }

  @media (max-width: 767px) {
    position: relative;
    top: auto;
    width: auto;
    margin-top: 2px;
    font-size: 12px;
    line-height: 17px;
  }
`

const MobileRail = styled.span`
  display: none;

  @media (max-width: 767px) {
    display: block;
    position: absolute;
    left: 13px;
    top: 28px;
    width: 1px;
    height: 20px;
    background: rgba(221, 185, 47, 0.3);
    z-index: 0;
  }
`

export const ListHowItWorks: React.FC = () => {
  return (
    <Section
      data-testid="list-how-it-works"
      data-list-module="004"
      data-pixel-how="1376x176"
      aria-labelledby="list-how-it-works-title"
    >
      <Header data-testid="list-how-header" data-pixel-how-header="28">
        <Title id="list-how-it-works-title">How it works</Title>
      </Header>

      <Timeline data-testid="list-how-timeline" data-pixel-how-timeline="1336x108">
        <Connector data-testid="list-how-connector" aria-hidden data-pixel-how-connector="1088" />
        <StepList data-testid="list-how-steps">
          {STEPS.map((step, index) => (
            <StepItem
              key={step.n}
              $center={step.center}
              data-testid={`list-how-step-${step.n}`}
              data-pixel-how-step="208x108"
            >
              {index < STEPS.length - 1 ? <MobileRail aria-hidden /> : null}
              <Circle data-testid={`list-how-circle-${step.n}`}>{step.n}</Circle>
              <StepTitle>{step.title}</StepTitle>
              <StepDesc>{step.description}</StepDesc>
            </StepItem>
          ))}
        </StepList>
      </Timeline>
    </Section>
  )
}

export default ListHowItWorks
