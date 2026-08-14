/**
 * List Final Founder Acceptance — right-side vertical How it works guide.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { listOne } from './listTokens'
import { useListIntent } from './useListIntent'

type Step = {
  n: number
  title: string
  description: string
  stage: 'choose' | 'configure' | 'verify' | 'publish' | 'grow'
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Choose',
    description: 'Select Import, Create, Claim, or Project Page.',
    stage: 'choose',
  },
  {
    n: 2,
    title: 'Configure',
    description: 'Enter the required identity and project details.',
    stage: 'configure',
  },
  {
    n: 3,
    title: 'Verify',
    description: 'Confirm ownership and review before any publish action.',
    stage: 'verify',
  },
  {
    n: 4,
    title: 'Publish',
    description: 'Complete only when the selected flow can truthfully publish.',
    stage: 'publish',
  },
  {
    n: 5,
    title: 'Grow',
    description: 'Optional Featured Home placement and ongoing discovery.',
    stage: 'grow',
  },
]

const pulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.9; }
`

const Section = styled.aside`
  position: relative;
  width: 100%;
  max-width: none;
  min-height: 0;
  height: auto;
  margin: 0;
  box-sizing: border-box;
  border-radius: 14px;
  padding: 14px 14px 16px;
  overflow: hidden;
  font-family: ${listOne.font};
  background: linear-gradient(165deg, rgba(18, 18, 18, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid rgba(244, 196, 48, 0.14);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  pointer-events: none;
  user-select: text;

  @media (min-width: 1024px) {
    position: sticky;
    top: 88px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 750;
  color: #f5f5f5;
`

const Rail = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background: linear-gradient(180deg, rgba(244, 196, 48, 0.55), rgba(244, 196, 48, 0.08));
  }

  @media (max-width: 1023px) {
    flex-direction: row;
    gap: 8px;
    overflow-x: auto;

    &::before {
      display: none;
    }
  }
`

const StepItem = styled.li<{ $active?: boolean }>`
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 0;
  color: ${({ $active }) => ($active ? '#f5f5f5' : 'rgba(255,255,255,0.72)')};

  @media (max-width: 1023px) {
    min-width: 132px;
    grid-template-columns: 1fr;
    padding: 8px;
    border-radius: 10px;
    background: ${({ $active }) => ($active ? 'rgba(244,196,48,0.08)' : 'rgba(255,255,255,0.02)')};
    border: 1px solid ${({ $active }) => ($active ? 'rgba(244,196,48,0.28)' : 'rgba(255,255,255,0.05)')};
  }
`

const Node = styled.span<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.95)' : 'rgba(221, 185, 47, 0.55)')};
  background: #121212;
  color: #f2c84c;
  font-size: 12px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: ${({ $active }) => ($active ? '0 0 0 4px rgba(244,196,48,0.12)' : 'none')};

  @media (prefers-reduced-motion: no-preference) {
    animation: ${({ $active }) => ($active ? pulse : 'none')} 2.4s ease-in-out infinite;
  }
`

const StepTitle = styled.h3`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
`

const StepDesc = styled.p`
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.55);
`

function activeStageIndex(intent: string | null, stepHint = 0): number {
  if (!intent) return 0
  if (stepHint <= 0) return 1
  if (stepHint === 1) return 2
  if (stepHint === 2) return 2
  if (stepHint >= 3) return 3
  return 1
}

type Props = {
  /** Optional 0-based workspace step for highlight only — never claims publish done. */
  workflowStep?: number
}

export const ListHowItWorks: React.FC<Props> = ({ workflowStep = 0 }) => {
  const { listIntent } = useListIntent()
  const active = activeStageIndex(listIntent, workflowStep)

  return (
    <Section
      data-testid="list-how-it-works"
      data-list-how="vertical-right"
      data-list-how-placement="right"
      aria-label="How it works"
    >
      <Header>
        <Title>How it works</Title>
      </Header>
      <Rail data-testid="list-how-rail">
        {STEPS.map((s) => (
          <StepItem key={s.n} data-stage={s.stage} $active={active === s.n - 1 || (!listIntent && s.n === 1)}>
            <Node $active={active === s.n - 1 || (!listIntent && s.n === 1)} aria-hidden>
              {s.n}
            </Node>
            <div>
              <StepTitle>{s.title}</StepTitle>
              <StepDesc>{s.description}</StepDesc>
            </div>
          </StepItem>
        ))}
      </Rail>
    </Section>
  )
}

export default ListHowItWorks
