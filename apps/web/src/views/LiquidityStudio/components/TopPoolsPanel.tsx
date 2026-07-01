import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout, LIQUIDITY_STUDIO_PREVIEW_LABEL } from '../liquidityStudioTokens'

const Panel = styled.div`
  background: ${liquidityStudioColors.panel};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${liquidityStudioLayout.panelRadius};
  padding: ${liquidityStudioLayout.panelPadding};
  box-sizing: border-box;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: ${liquidityStudioColors.text};
`

const Badge = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Pair = styled.span`
  color: ${liquidityStudioColors.text};
  font-weight: 700;
`

const Apr = styled.span`
  color: ${liquidityStudioColors.green};
  font-weight: 700;
`

const Tvl = styled.span`
  color: ${liquidityStudioColors.muted};
  font-weight: 600;
  font-size: 11px;
`

const POOLS = [
  { pair: 'MARCO / BNB', apr: '14.2%', tvl: '$1.2M' },
  { pair: 'MARCO / USDT', apr: '11.8%', tvl: '$640K' },
  { pair: 'NAIIVE / BNB', apr: '9.4%', tvl: '$280K' },
]

export const TopPoolsPanel: React.FC = () => (
  <Panel data-ls-panel>
    <Head>
      <Title>Top Pools</Title>
      <Badge>{LIQUIDITY_STUDIO_PREVIEW_LABEL}</Badge>
    </Head>
    {POOLS.map((pool) => (
      <Row key={pool.pair}>
        <Pair>{pool.pair}</Pair>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <Apr>{pool.apr}</Apr>
          <Tvl>{pool.tvl}</Tvl>
        </div>
      </Row>
    ))}
  </Panel>
)

export default TopPoolsPanel
