/**
 * Journey guide rail — answers "What can I do here?" and "What next?"
 * Presentation / routing only.
 */
import React, { useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import {
  getJourney,
  getJourneyStep,
  getNextStep,
  type JourneyId,
  type JourneyStepId,
} from 'lib/user-journeys'

const Rail = styled.section`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  background:
    radial-gradient(ellipse 70% 80% at 0% 0%, rgba(244, 196, 48, 0.1), transparent 55%),
    linear-gradient(165deg, rgba(18, 18, 18, 0.98), rgba(10, 10, 10, 0.98));
`

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px 12px;
  margin-bottom: 8px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: 750;
  color: #f2c84c;
`

const Sub = styled.p`
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
`

const HereNext = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;

  @media (max-width: 639px) {
    grid-template-columns: 1fr;
  }
`

const Box = styled.div`
  min-width: 0;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
`

const BoxLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 4px;
`

const BoxText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  color: #e8e8e8;
`

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`

const Step = styled.li<{ $state: 'done' | 'current' | 'future' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const StepLink = styled(Link)<{ $state: 'done' | 'current' | 'future' }>`
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
  border-radius: 999px;
  border: 1px solid
    ${({ $state }) =>
      $state === 'current'
        ? 'rgba(244, 196, 48, 0.65)'
        : $state === 'done'
          ? 'rgba(80, 200, 120, 0.35)'
          : 'rgba(255, 255, 255, 0.12)'};
  background: ${({ $state }) =>
    $state === 'current'
      ? 'rgba(244, 196, 48, 0.16)'
      : $state === 'done'
        ? 'rgba(40, 100, 70, 0.25)'
        : 'rgba(255, 255, 255, 0.03)'};
  color: ${({ $state }) =>
    $state === 'current' ? '#f2c84c' : $state === 'done' ? '#9ee6bc' : '#c8c8c8'};
`

const NextCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.55);
  background: rgba(244, 196, 48, 0.16);
  color: #f2c84c;
  font-size: 12px;
  font-weight: 750;
  text-decoration: none;
  width: fit-content;

  &:hover {
    background: rgba(244, 196, 48, 0.24);
  }
`

const Arrow = styled.span`
  color: rgba(255, 255, 255, 0.25);
  font-size: 11px;
  padding: 0 2px;
`

export type JourneyGuideRailProps = {
  journeyId: JourneyId
  currentStepId: JourneyStepId
  /** Override next CTA href (e.g. project-specific slug) */
  nextHref?: string
  /** Override next CTA label */
  nextLabel?: string
  testId?: string
  compact?: boolean
}

export const JourneyGuideRail: React.FC<JourneyGuideRailProps> = ({
  journeyId,
  currentStepId,
  nextHref,
  nextLabel,
  testId = 'journey-guide-rail',
  compact = false,
}) => {
  const journey = useMemo(() => getJourney(journeyId), [journeyId])
  const current = useMemo(() => getJourneyStep(journey, currentStepId), [journey, currentStepId])
  const next = useMemo(() => getNextStep(journey, currentStepId), [journey, currentStepId])
  const currentIdx = journey.steps.findIndex((s) => s.id === currentStepId)

  return (
    <Rail
      data-testid={testId}
      data-journey={journeyId}
      data-journey-step={currentStepId}
      aria-label={`${journey.title}: what you can do and what to do next`}
    >
      <Head>
        <Title>{journey.title}</Title>
        <Sub>{journey.subtitle}</Sub>
      </Head>
      <HereNext>
        <Box data-testid={`${testId}-here`}>
          <BoxLabel>What you can do here</BoxLabel>
          <BoxText>{current.hereCopy}</BoxText>
        </Box>
        <Box data-testid={`${testId}-next`}>
          <BoxLabel>What to do next</BoxLabel>
          <BoxText>{current.nextCopy}</BoxText>
        </Box>
      </HereNext>
      {!compact ? (
        <Steps data-testid={`${testId}-steps`}>
          {journey.steps.map((step, i) => {
            const state = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'future'
            return (
              <Step key={step.id} $state={state}>
                {i > 0 ? <Arrow aria-hidden>→</Arrow> : null}
                <StepLink
                  href={step.href}
                  $state={state}
                  data-testid={`${testId}-step-${step.id}`}
                  data-step-state={state}
                >
                  {step.label}
                </StepLink>
              </Step>
            )
          })}
        </Steps>
      ) : null}
      {next ? (
        <NextCta
          href={nextHref || next.href}
          data-testid={`${testId}-cta`}
          data-next-step={next.id}
        >
          {nextLabel || `Next: ${next.label}`}
        </NextCta>
      ) : null}
    </Rail>
  )
}

export default JourneyGuideRail
