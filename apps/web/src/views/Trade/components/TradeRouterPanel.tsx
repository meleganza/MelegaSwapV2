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
  padding: 18px;
  background: ${tradeColors.panelGradient};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
`

const Sub = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${tradeColors.muted};
`

const Line = styled.div<{ $best?: boolean }>`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ $best }) => ($best ? 'rgba(244,197,66,0.45)' : tradeColors.border)};
  background: rgba(0, 0, 0, 0.22);
`

const LineTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`

const LineName = styled.div`
  font-size: 15px;
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
  font-size: 12px;
  color: ${tradeColors.muted};
`

const MetricVal = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
`

const Note = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${tradeColors.muted};
  line-height: 1.5;
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
        <Title>MelegaSwap Router</Title>
        <Sub>Live route comparison from SmartSwap runtime. No fabricated execution times.</Sub>
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
          Router status: {routerStatus.status}. Enter a swap amount on SmartSwap to refresh route quotes.
        </Note>
      </Panel>
    </Shell>
  )
}

export default TradeRouterPanel
