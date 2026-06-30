import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const List = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
`

const Step = styled.li`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 14px;
  padding-bottom: 20px;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 13px;
    top: 28px;
    bottom: 0;
    width: 2px;
    background: ${tokens.border};
  }
`

const Dot = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${tokens.borderGold};
  background: ${tokens.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: ${tokens.gold};
  flex-shrink: 0;
`

const Body = styled.div`
  padding-top: 2px;
`

const StepTitle = styled.strong`
  display: block;
  font-size: 14px;
  color: ${tokens.text};
  margin-bottom: 4px;
`

const StepDesc = styled.p`
  margin: 0 0 6px;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const StepLink = styled(Link)`
  font-size: 12px;
  color: ${tokens.gold};
  text-decoration: none;

  &:hover {
    color: ${tokens.goldHighlight};
  }
`

export interface TimelineStep {
  label: string
  description: string
  surface: string
  index: number
}

export const EconomicTimeline: React.FC<{ steps: TimelineStep[] }> = ({ steps }) => (
  <List>
    {steps.map((step) => (
      <Step key={step.label}>
        <Dot>{step.index}</Dot>
        <Body>
          <StepTitle>{step.label}</StepTitle>
          <StepDesc>{step.description}</StepDesc>
          <StepLink href={step.surface}>{step.surface}</StepLink>
        </Body>
      </Step>
    ))}
  </List>
)

export default EconomicTimeline
