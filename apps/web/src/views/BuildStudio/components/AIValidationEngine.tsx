import React from 'react'
import styled from 'styled-components'
import { VALIDATION_CHECKS } from '../buildStudioData'
import { BS_FONT_BODY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { IconSparkles } from './buildStudioIcons'
import { BsPanel, BsSectionTitle, BsStatusChip } from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const CheckCard = styled.div`
  padding: 14px;
  border-radius: 16px;
  border: 1px solid ${buildStudioColors.border};
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const CheckLabel = styled.span`
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  color: ${buildStudioColors.white};
`

export const AIValidationEngine: React.FC = () => (
  <BsPanel data-bs-panel data-bs-validation $height={buildStudioLayout.validationH}>
    <Inner>
      <BsSectionTitle>
        <IconSparkles size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        AI Validation Engine
      </BsSectionTitle>
      <Grid>
        {VALIDATION_CHECKS.map((check) => (
          <CheckCard key={check.id}>
            <CheckLabel>{check.label}</CheckLabel>
            <BsStatusChip $status={check.status}>
              {check.status === 'green' ? 'Pass' : check.status === 'yellow' ? 'Review' : 'Fail'}
            </BsStatusChip>
          </CheckCard>
        ))}
      </Grid>
    </Inner>
  </BsPanel>
)

export default AIValidationEngine
