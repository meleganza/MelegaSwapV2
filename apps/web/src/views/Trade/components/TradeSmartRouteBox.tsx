import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'
import { useTradeRuntime } from '../tradeRuntime/TradeRuntimeContext'

const Box = styled.div`
  height: 52px;
  min-height: 52px;
  max-height: 52px;
  margin-bottom: 14px;
  padding: 8px 10px;
  box-sizing: border-box;
  background: #171512;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 12px;
  height: 12px;
`

const Title = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  line-height: 12px;
`

const Savings = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${tradeColors.green};
  line-height: 12px;
`

const Muted = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${tradeColors.muted};
  line-height: 12px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 12px;
  height: 12px;
  margin-top: 12px;
  font-size: 12px;
  line-height: 12px;
`

const Label = styled.span`
  color: ${tradeColors.muted};
  font-size: 12px;
  line-height: 12px;
`

const Value = styled.span`
  color: #ffffff;
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
`

export const TradeSmartRouteBox: React.FC = () => {
  const { phase, loadingLabel, smartRouteSavings, executionSpeed, executionSummary, error } = useTradeRuntime()

  const title =
    phase === 'routing'
      ? loadingLabel ?? 'Routing…'
      : phase === 'error' && error
        ? error.message
        : executionSummary.executionRoute
          ? 'Best Route Found'
          : 'Awaiting quote'

  const savingsNode =
    phase === 'routing' ? (
      <Muted>…</Muted>
    ) : (
      <Savings>{smartRouteSavings ?? executionSummary.priceImpact ?? '—'}</Savings>
    )

  return (
    <Box data-trade-smart-route-box data-trade-runtime-phase={phase}>
      <TitleRow>
        <Title>{title}</Title>
        {savingsNode}
      </TitleRow>
      <Row>
        <Label>Execution speed</Label>
        <Value>{phase === 'routing' ? '…' : executionSpeed ?? '—'}</Value>
      </Row>
    </Box>
  )
}

export default TradeSmartRouteBox
