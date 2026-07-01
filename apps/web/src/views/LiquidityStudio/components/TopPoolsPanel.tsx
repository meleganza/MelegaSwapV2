import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { LsPanel, LsSectionTitle } from './liquidityStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding: 4px 0;
  border-bottom: 1px solid ${liquidityStudioColors.rowBorder};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Pair = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`

const Apr = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.green};
  line-height: 1;
`

const Tvl = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
  line-height: 1;
`

const POOLS = [
  { pair: 'MARCO / BNB', apr: '14.2%', tvl: '$1.2M' },
  { pair: 'MARCO / USDT', apr: '11.8%', tvl: '$640K' },
  { pair: 'NAIIVE / BNB', apr: '9.4%', tvl: '$280K' },
]

export const TopPoolsPanel: React.FC = () => (
  <LsPanel data-ls-panel $height={liquidityStudioLayout.topPoolsHeight}>
    <LsSectionTitle>Top Pools</LsSectionTitle>
    {POOLS.map((pool) => (
      <Row key={pool.pair}>
        <Pair>{pool.pair}</Pair>
        <Right>
          <Apr>{pool.apr}</Apr>
          <Tvl>{pool.tvl}</Tvl>
        </Right>
      </Row>
    ))}
  </LsPanel>
)

export default TopPoolsPanel
