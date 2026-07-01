import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'

const Box = styled.div`
  height: 68px;
  min-height: 68px;
  margin-bottom: 12px;
  padding: 12px;
  box-sizing: border-box;
  background: #171512;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 22px;
`

const Title = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
`

const Savings = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${tradeColors.green};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 22px;
  font-size: 12px;
`

const Label = styled.span`
  color: ${tradeColors.muted};
`

const Value = styled.span`
  color: #ffffff;
  font-weight: 600;
`

export const TradeSmartRouteBox: React.FC = () => (
  <Box data-trade-smart-route-box>
    <TitleRow>
      <Title>Best Route Found</Title>
      <Savings>0.5% better price</Savings>
    </TitleRow>
    <Row>
      <Label>Execution speed</Label>
      <Value>Fast</Value>
    </Row>
  </Box>
)

export default TradeSmartRouteBox
