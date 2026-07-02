import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'

const Box = styled.div`
  height: 54px;
  min-height: 54px;
  margin-bottom: 14px;
  padding: 10px;
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
  gap: 8px;
  min-height: 20px;
  height: 20px;
`

const Title = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
`

const Savings = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${tradeColors.green};
  line-height: 1.2;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 20px;
  height: 20px;
  font-size: 12px;
  line-height: 1.2;
`

const Label = styled.span`
  color: ${tradeColors.muted};
  font-size: 12px;
`

const Value = styled.span`
  color: #ffffff;
  font-weight: 600;
  font-size: 12px;
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
