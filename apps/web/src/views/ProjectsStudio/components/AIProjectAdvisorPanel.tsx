import React from 'react'
import styled from 'styled-components'
import { AI_ADVISOR_ROWS } from '../projectsStudioData'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { PrPanel } from './projectsStudioPrimitives'

const Title = styled.h3`
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 800;
  color: ${projectsStudioColors.text};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${projectsStudioColors.rowBorder};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.secondary};
`

const Value = styled.span<{ $tone?: 'green' | 'gold' }>`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $tone }) =>
    $tone === 'green' ? projectsStudioColors.green : $tone === 'gold' ? projectsStudioColors.gold : projectsStudioColors.text};
  white-space: nowrap;
`

const Score = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${projectsStudioColors.muted};
`

const Sustainability = styled.div`
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid ${projectsStudioColors.rowBorder};
`

const SustainLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
  margin-bottom: 8px;
`

const Bar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  width: 92%;
  border-radius: 999px;
  background: linear-gradient(90deg, ${projectsStudioColors.green}, ${projectsStudioColors.gold});
`

export const AIProjectAdvisorPanel: React.FC = () => (
  <PrPanel data-pr-panel data-pr-advisor $height={projectsStudioLayout.featuredHeight} style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
    <Title>AI Project Advisor</Title>
    <List>
      {AI_ADVISOR_ROWS.map((row) => (
        <Row key={row.label}>
          <div>
            <Label>{row.label}</Label>
            <div>
              <Value $tone={row.tone}>{row.value}</Value>
            </div>
          </div>
          <Score>{row.score}</Score>
        </Row>
      ))}
    </List>
    <Sustainability>
      <SustainLabel>
        <span>Index Coverage</span>
        <span style={{ color: projectsStudioColors.green }}>Very High</span>
      </SustainLabel>
      <Bar>
        <Fill />
      </Bar>
      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: projectsStudioColors.muted, textAlign: 'right' }}>
        92/100
      </div>
    </Sustainability>
  </PrPanel>
)

export default AIProjectAdvisorPanel
