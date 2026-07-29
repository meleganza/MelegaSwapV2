/**
 * LIST Wave 04A — compact horizontal How it works (beside Completion in workspace row).
 */
import React from 'react'
import styled from 'styled-components'
import { listOne } from './listTokens'

type Step = {
  n: number
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Choose',
    description: 'Import, create or claim your token or project.',
  },
  {
    n: 2,
    title: 'Setup',
    description: 'Complete the required information with AI assistance.',
  },
  {
    n: 3,
    title: 'Review',
    description: 'Confirm the details, ownership and publishing choices.',
  },
  {
    n: 4,
    title: 'Publish',
    description: 'Create your Melega identity and ecosystem presence.',
  },
  {
    n: 5,
    title: 'Grow',
    description: 'Build visibility, liquidity and community over time.',
  },
]

const Section = styled.section`
  position: relative;
  width: 100%;
  max-width: none;
  min-height: 0;
  height: auto;
  margin: 0;
  box-sizing: border-box;
  border-radius: 14px;
  padding: 12px 14px;
  overflow: hidden;
  font-family: ${listOne.font};
  background: linear-gradient(145deg, rgba(17, 17, 17, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  user-select: text;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 10px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 750;
  color: #f5f5f5;
`

const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`

const StepItem = styled.li`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
`

const Circle = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 1px solid rgba(221, 185, 47, 0.9);
  background: #121212;
  color: #ddb92f;
  font-size: 11px;
  line-height: 14px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const StepTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #f5f5f5;
`

const StepDesc = styled.p`
  margin: 0;
  font-size: 10px;
  line-height: 14px;
  font-weight: 400;
  color: #a8a8a8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const ListHowItWorks: React.FC = () => {
  return (
    <Section
      data-testid="list-how-it-works"
      data-list-module="004"
      data-list-how="compact"
      aria-labelledby="list-how-it-works-title"
    >
      <Header data-testid="list-how-header">
        <Title id="list-how-it-works-title">How it works</Title>
      </Header>

      <StepList data-testid="list-how-steps">
        {STEPS.map((step) => (
          <StepItem key={step.n} data-testid={`list-how-step-${step.n}`}>
            <Circle data-testid={`list-how-circle-${step.n}`}>{step.n}</Circle>
            <StepTitle>{step.title}</StepTitle>
            <StepDesc>{step.description}</StepDesc>
          </StepItem>
        ))}
      </StepList>
    </Section>
  )
}

export default ListHowItWorks
