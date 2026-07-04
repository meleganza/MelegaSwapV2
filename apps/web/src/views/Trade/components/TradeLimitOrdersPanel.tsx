import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'

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

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${tradeColors.gold};
  background: rgba(244, 197, 66, 0.1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${tradeColors.goldBright};
  width: fit-content;
`

const Sub = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: ${tradeColors.muted};
`

const Block = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
`

const BlockTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
`

const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.55;
  color: #b5b5b5;

  li {
    margin-bottom: 6px;
  }
`

export const TradeLimitOrdersPanel: React.FC = () => (
  <Shell data-trade-limit-orders-panel>
    <Panel>
      <Title>Limit Orders</Title>
      <Badge>Coming soon</Badge>
      <Sub>
        Limit order placement is not available on Melega DEX staging. This panel is a read-only explainer — there is no
        limit order engine, no fake quotes, and no silent order book.
      </Sub>
      <Block>
        <BlockTitle>What will ship</BlockTitle>
        <List>
          <li>Place limit buy/sell against indexed pairs when router support is ready.</li>
          <li>Open orders visible in Trade History with honest status.</li>
          <li>Cancel and fill events surfaced from on-chain state only.</li>
        </List>
      </Block>
      <Block>
        <BlockTitle>Use SmartSwap today</BlockTitle>
        <List>
          <li>Market swaps via SmartSwap tab with live route comparison.</li>
          <li>Router tab shows SmartSwap vs MelegaSwap V2 availability.</li>
          <li>History tab lists wallet and protocol swap activity.</li>
        </List>
      </Block>
    </Panel>
  </Shell>
)

export default TradeLimitOrdersPanel
