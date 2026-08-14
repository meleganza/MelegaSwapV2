import React from 'react'
import styled from 'styled-components'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { tradeColors } from '../tradeTokens'
import { useTradeRuntime } from '../tradeRuntime/TradeRuntimeContext'
import { buildRouterLines, routerStatusLabel } from '../tradeRuntime/formatTradeRouter'
import type { RouterLineStatus } from '../tradeRuntime/formatTradeRouter'

const Shell = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Panel = styled.div`
  flex: 1;
  padding: 16px;
  background: ${tradeColors.panelGradient};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  box-sizing: border-box;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
`

const Live = styled.span<{ $online: boolean }>`
  padding: 4px 7px;
  border-radius: 7px;
  background: ${({ $online }) => ($online ? 'rgba(0,230,118,.1)' : 'rgba(255,82,82,.1)')};
  color: ${({ $online }) => ($online ? tradeColors.green : tradeColors.red)};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Line = styled.div<{ $best?: boolean }>`
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid ${tradeColors.border};
  background: ${({ $best }) =>
    $best ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.055), rgba(0, 0, 0, 0.22) 34%)' : 'rgba(0, 0, 0, 0.22)'};
`

const LineTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
`

const LineName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
`

const StatusPill = styled.span<{ $status: RouterLineStatus }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $status }) =>
    $status === 'available' ? '#00e676' : $status === 'unavailable' ? '#ff5252' : tradeColors.muted};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  font-size: 10px;
  color: ${tradeColors.muted};
`

const MetricVal = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
`

const Note = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${tradeColors.muted};
  line-height: 1.35;
`

export const TradeRouterPanel: React.FC = () => {
  const { routeEntries, phase, routerStatus } = useTradeRuntime()
  const { typedValue } = useSwapState()
  const hasAmount = Boolean(typedValue && parseFloat(typedValue) > 0)
  const routerOnline = routerStatus.statusTone === 'ok'

  const lines = buildRouterLines({
    entries: routeEntries,
    phase,
    hasAmount,
    routerOnline,
  })

  return (
    <Shell data-trade-router-panel>
      <Panel>
        <Header>
          <Title>Available routes</Title>
          <Live $online={routerOnline}>{routerOnline ? 'Router live' : 'Unavailable'}</Live>
        </Header>
        {lines.map((line) => (
          <Line key={line.id} $best={line.best} data-trade-router-line>
            <LineTop>
              <LineName>
                {line.label}
                {line.best ? ' · Best' : ''}
              </LineName>
              <StatusPill $status={line.status}>{routerStatusLabel(line.status)}</StatusPill>
            </LineTop>
            <Metrics>
              <div>
                Output
                <MetricVal>{line.amount}</MetricVal>
              </div>
              <div>
                Delta
                <MetricVal>{line.delta}</MetricVal>
              </div>
              <div>
                Gas est.
                <MetricVal>{line.gas ?? '—'}</MetricVal>
              </div>
            </Metrics>
          </Line>
        ))}
        <Note>
          {hasAmount ? `Live comparison · ${routerStatus.status}` : 'Enter an amount to compare executable quotes.'}
        </Note>
      </Panel>
    </Shell>
  )
}

export default TradeRouterPanel
