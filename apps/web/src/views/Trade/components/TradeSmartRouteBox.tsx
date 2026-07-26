import React, { useMemo } from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'
import { useTradeRuntime } from '../tradeRuntime/TradeRuntimeContext'

const Box = styled.div`
  min-height: 52px;
  margin-bottom: 14px;
  padding: 10px 12px;
  box-sizing: border-box;
  background: #171512;
  border: 1px solid rgba(244, 196, 48, 0.18);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 12px;
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

const RouteBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`

const RouteLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${tradeColors.muted};
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin-bottom: 2px;
`

const RouteHop = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  line-height: 16px;
`

const RouteArrow = styled.span`
  font-size: 11px;
  color: ${tradeColors.gold};
  line-height: 14px;
  padding-left: 2px;
`

function formatRouteHops(steps: string[]): { kind: 'direct' | 'multi' | 'unavailable'; hops: string[] } {
  if (!steps.length) return { kind: 'unavailable', hops: [] }
  if (steps.length === 2) return { kind: 'direct', hops: steps }
  return { kind: 'multi', hops: steps }
}

export const TradeSmartRouteBox: React.FC = () => {
  const { phase, loadingLabel, smartRouteSavings, executionSpeed, executionSummary, error, routeSteps } =
    useTradeRuntime()

  const title =
    phase === 'routing'
      ? loadingLabel ?? 'Loading quote…'
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

  const routeView = useMemo(() => formatRouteHops(routeSteps), [routeSteps])

  return (
    <Box data-trade-smart-route-box data-trade-runtime-phase={phase} data-route-kind={routeView.kind}>
      <TitleRow>
        <Title>{title}</Title>
        {savingsNode}
      </TitleRow>
      <Row>
        <Label>Execution speed</Label>
        <Value>{phase === 'routing' ? '…' : executionSpeed ?? '—'}</Value>
      </Row>
      <RouteBlock data-trade-smart-route-path>
        <RouteLabel>Route</RouteLabel>
        {phase === 'routing' && <Muted>Loading quote…</Muted>}
        {phase !== 'routing' && routeView.kind === 'unavailable' && (
          <Muted data-route-unavailable>Route unavailable</Muted>
        )}
        {phase !== 'routing' && routeView.kind === 'direct' && (
          <>
            <RouteHop>{routeView.hops[0]}</RouteHop>
            <RouteArrow aria-hidden>↓</RouteArrow>
            <RouteHop>Direct route</RouteHop>
            <RouteArrow aria-hidden>↓</RouteArrow>
            <RouteHop>{routeView.hops[1]}</RouteHop>
          </>
        )}
        {phase !== 'routing' && routeView.kind === 'multi' &&
          routeView.hops.map((hop, i) => (
            <React.Fragment key={`${hop}-${i}`}>
              <RouteHop>{hop}</RouteHop>
              {i < routeView.hops.length - 1 ? <RouteArrow aria-hidden>↓</RouteArrow> : null}
            </React.Fragment>
          ))}
      </RouteBlock>
    </Box>
  )
}

export default TradeSmartRouteBox
