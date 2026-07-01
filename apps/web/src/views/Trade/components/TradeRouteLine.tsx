import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'

const Block = styled.div`
  margin-top: 12px;
  min-height: 54px;
  overflow: hidden;
`

const Title = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
`

const Track = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  overflow: hidden;
`

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex-shrink: 0;
`

const Icon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #171717;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: ${tradeColors.goldBright};
`

const Label = styled.span`
  font-size: 9px;
  color: ${tradeColors.muted};
  white-space: nowrap;
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
`

const Arrow = styled.span`
  color: ${tradeColors.gold};
  font-size: 12px;
  line-height: 1;
  flex-shrink: 0;
`

const STEPS = ['BNB Chain', 'PancakeSwap', 'Bridge', 'Melega DEX']

export const TradeRouteLine: React.FC = () => (
  <Block data-trade-route-line>
    <Title>Route</Title>
    <Track>
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <Step>
            <Icon>{step.slice(0, 1)}</Icon>
            <Label>{step}</Label>
          </Step>
          {i < STEPS.length - 1 && <Arrow>→</Arrow>}
        </React.Fragment>
      ))}
    </Track>
  </Block>
)

export default TradeRouteLine
