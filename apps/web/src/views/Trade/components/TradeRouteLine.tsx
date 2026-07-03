import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'
import { useTradeRuntime } from '../tradeRuntime/TradeRuntimeContext'

const Block = styled.div`
  min-height: 54px;
  height: 54px;
  max-height: 54px;
  overflow: hidden;
  box-sizing: border-box;
`

const Title = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
  line-height: 1;
`

const Track = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const NodeCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 22px;
  flex-shrink: 0;
`

const Icon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #171717;
  border: 1px solid ${tradeColors.gold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: ${tradeColors.goldBright};
  flex-shrink: 0;
`

const Label = styled.span`
  font-size: 9px;
  color: ${tradeColors.muted};
  white-space: nowrap;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1.2;
  transform: translateY(2px);
`

const ArrowSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 22px;
  flex-shrink: 0;
  color: ${tradeColors.gold};
  font-size: 12px;
  line-height: 1;
  transform: translateY(-2px);
`

const Placeholder = styled.div`
  font-size: 11px;
  color: ${tradeColors.muted};
  text-align: center;
  padding-top: 8px;
`

export const TradeRouteLine: React.FC = () => {
  const { routeSteps, phase, loadingLabel } = useTradeRuntime()
  const steps = routeSteps.length > 0 ? routeSteps : []

  return (
    <Block data-trade-route-line>
      <Title>Route</Title>
      {phase === 'routing' && (
        <Placeholder>{loadingLabel ?? 'Routing…'}</Placeholder>
      )}
      {phase !== 'routing' && steps.length === 0 && (
        <Placeholder>Enter amount to preview route</Placeholder>
      )}
      {steps.length > 0 && (
        <Track>
          {steps.map((step, i) => (
            <React.Fragment key={`${step}-${i}`}>
              <NodeCol>
                <Icon aria-hidden>{step.slice(0, 1)}</Icon>
                <Label>{step}</Label>
              </NodeCol>
              {i < steps.length - 1 && <ArrowSlot aria-hidden>→</ArrowSlot>}
            </React.Fragment>
          ))}
        </Track>
      )}
    </Block>
  )
}

export default TradeRouteLine
