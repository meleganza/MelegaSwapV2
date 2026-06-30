import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'
import { EconomicBadge } from './EconomicBadge'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`

const Cell = styled.div`
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  padding: 18px 20px;
`

const Label = styled.span`
  display: block;
  font-size: 11px;
  color: ${tokens.textSecondary};
  margin-bottom: 8px;
  letter-spacing: 0.04em;
`

const Value = styled.strong`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: ${tokens.text};
  line-height: 1.3;
`

export interface StatusItem {
  label: string
  value: string
  status?: string
}

export const EconomicStatusSummary: React.FC<{ items: StatusItem[] }> = ({ items }) => (
  <Grid>
    {items.map((item) => (
      <Cell key={item.label}>
        <Label>{item.label}</Label>
        {item.status ? <EconomicBadge status={item.status} /> : <Value>{item.value}</Value>}
      </Cell>
    ))}
  </Grid>
)

export default EconomicStatusSummary
