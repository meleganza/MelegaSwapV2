import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;

  @media (min-width: 420px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const Cell = styled.div`
  min-width: 0;
  padding: 8px 8px 7px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.28);
`

const K = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.02em;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const V = styled.div<{ $tone?: 'ok' | 'warn' | 'neutral' }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'ok' ? '#22c55e' : $tone === 'warn' ? '#f59e0b' : '#f8fafc'};
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Sub = styled.div`
  margin-top: 2px;
  font-size: 10px;
  color: #9ca3af;
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
          <K>{item.label}</K>
          <V $tone={item.tone ?? 'neutral'}>{item.value}</V>
          {item.sub ? <Sub>{item.sub}</Sub> : null}
        </Cell>
      ))}
    </Grid>
  )
}

export default SmartSwapCompactMetrics
