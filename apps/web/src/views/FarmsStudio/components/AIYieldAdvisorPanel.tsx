import React from 'react'
import styled from 'styled-components'
import { AI_ADVISOR_ROWS } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { FsPanel, FsSectionTitle } from './farmsStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  padding: 4px 0;
  border-bottom: 1px solid ${farmsStudioColors.rowBorder};

  &:last-child {
    border-bottom: none;
  }
`

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${farmsStudioColors.muted};
`

const Value = styled.span<{ $tone?: 'green' | 'gold' | 'muted' }>`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? farmsStudioColors.green
      : $tone === 'gold'
        ? farmsStudioColors.gold
        : farmsStudioColors.muted};
  text-align: right;
`

export const AIYieldAdvisorPanel: React.FC = () => (
  <FsPanel
    data-fs-panel
    data-fs-advisor
    $width={farmsStudioLayout.advisorWidth}
    $height={farmsStudioLayout.featuredHeight}
  >
    <FsSectionTitle>AI Yield Advisor</FsSectionTitle>
    {AI_ADVISOR_ROWS.map((row) => (
      <Row key={row.label}>
        <Label>{row.label}</Label>
        <Value $tone={row.tone}>{row.value}</Value>
      </Row>
    ))}
  </FsPanel>
)

export default AIYieldAdvisorPanel
