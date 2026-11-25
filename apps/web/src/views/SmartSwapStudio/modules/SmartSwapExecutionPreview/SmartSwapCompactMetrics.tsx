import React, { useState } from 'react'
import styled from 'styled-components'

/* R035B: approved Trade mockup — three decision metrics in one row, the rest behind an expand control. */
const Wrap = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  border: 1px solid #efede6;
  border-radius: 16px;
  background: #ffffff;
  padding: 10px 6px 10px 4px;
  gap: 4px;
`

const Grid = styled.div<{ $expanded: boolean }>`
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  row-gap: 10px;

  > div:nth-child(n + 4) {
    display: ${({ $expanded }) => ($expanded ? 'block' : 'none')};
  }
  > div:nth-child(3n) {
    border-right: 0;
  }
`

const Toggle = styled.button<{ $expanded: boolean }>`
  flex: 0 0 36px;
  align-self: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: #f7f6f2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    margin-top: ${({ $expanded }) => ($expanded ? '4px' : '-4px')};
    border-right: 2px solid #171817;
    border-bottom: 2px solid #171817;
    transform: rotate(${({ $expanded }) => ($expanded ? '225deg' : '45deg')});
  }
  &:focus-visible {
    outline: 2px solid rgba(243, 201, 40, 0.62);
  }
`

const Cell = styled.div`
  min-width: 0;
  padding: 0 10px;
  border-right: 1px solid #efede6;
  background: transparent;
  &:last-child {
    border-right: 0;
  }
`

const K = styled.div`
  min-height: 16px;
  font-size: 12px;
  line-height: 15px;
  font-weight: 500;
  color: #72736e;
  letter-spacing: 0.02em;
  margin-bottom: 2px;
  white-space: normal;
  overflow-wrap: anywhere;
`

const V = styled.div<{ $tone?: 'ok' | 'warn' | 'neutral' }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $tone }) => ($tone === 'ok' ? '#21865A' : $tone === 'warn' ? '#9A7600' : '#171817')};
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  white-space: normal;
  overflow-wrap: anywhere;
`

const Sub = styled.div`
  margin-top: 2px;
  font-size: 9px;
  line-height: 1.25;
  color: #9ca3af;

  /* Long diagnostics belong to Details; keep the decision strip scannable. */
  display: none;
`

export type MetricCell = {
  label: string
  value: string
  sub?: string
  tone?: 'ok' | 'warn' | 'neutral'
}

export function SmartSwapCompactMetrics({ items }: { items: MetricCell[] }) {
  const [expanded, setExpanded] = useState(false)
  // Decision-critical disclosure stays visible: minimum received, price impact, protocol fee first.
  const priority = ['Minimum received', 'Price impact', 'Protocol fee']
  const ordered = [
    ...priority.map((label) => items.find((item) => item.label === label)).filter(Boolean),
    ...items.filter((item) => !priority.includes(item.label)),
  ] as MetricCell[]
  return (
    <Wrap>
      <Grid data-smart-compact-metrics $expanded={expanded} id="smart-swap-metrics">
        {ordered.map((item) => (
          <Cell key={item.label}>
            <K title={item.label}>{item.label}</K>
            <V $tone={item.tone ?? 'neutral'} title={item.value}>
              {item.value}
            </V>
            {item.sub ? <Sub>{item.sub}</Sub> : null}
          </Cell>
        ))}
      </Grid>
      {ordered.length > 3 ? (
        <Toggle
          type="button"
          $expanded={expanded}
          aria-expanded={expanded}
          aria-controls="smart-swap-metrics"
          aria-label={expanded ? 'Hide swap details' : 'Show swap details'}
          onClick={() => setExpanded((value) => !value)}
        />
      ) : null}
    </Wrap>
  )
}

export default SmartSwapCompactMetrics
