import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  width: 100%;

  @media (max-width: 520px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const Cell = styled.div`
  min-width: 0;
  padding: 6px 8px;
  border-right: 1px solid #E5E2D9;
  background: transparent;
  &:last-child { border-right: 0; }
`

const K = styled.div`
  min-height: 20px;
  font-size: 9px;
  line-height: 11px;
  font-weight: 600;
  color: #72736E;
  letter-spacing: 0.02em;
  margin-bottom: 2px;
  white-space: normal;
  overflow-wrap: anywhere;
`

const V = styled.div<{ $tone?: 'ok' | 'warn' | 'neutral' }>`
  font-size: 10px;
  font-weight: 700;
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
  return (
    <Grid data-smart-compact-metrics>
      {items.map((item) => (
        <Cell key={item.label}>
          <K title={item.label}>{item.label}</K>
          <V $tone={item.tone ?? 'neutral'} title={item.value}>
            {item.value}
          </V>
          {item.sub ? <Sub>{item.sub}</Sub> : null}
        </Cell>
      ))}
    </Grid>
  )
}

export default SmartSwapCompactMetrics
