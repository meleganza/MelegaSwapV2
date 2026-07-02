import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { LsPanel, LsRightLabel, LsRightRow, LsSectionTitle } from './liquidityStudioPrimitives'

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
  font-size: 14px;
  font-weight: 800;
  color: ${liquidityStudioColors.green};
  line-height: 1;
`

const Tvl = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
  line-height: 1;
`

const PoolRow = styled(LsRightRow)`
  height: auto;
  min-height: 32px;
  padding: 2px 0;
`

const POOLS = [
  { pair: 'MARCO / BNB', apr: '14.2%', tvl: '$1.2M' },
  { pair: 'MARCO / USDT', apr: '11.8%', tvl: '$640K' },
  { pair: 'NAIIVE / BNB', apr: '9.4%', tvl: '$280K' },
]

export const TopPoolsPanel: React.FC = () => (
  <LsPanel
    data-ls-panel
    $width={liquidityStudioLayout.rightWidth}
    $height={liquidityStudioLayout.topPoolsHeight}
    $radius={liquidityStudioLayout.rightPanelRadius}
    $pad={liquidityStudioLayout.rightPanelPadding}
  >
    <LsSectionTitle>Top Pools</LsSectionTitle>
    {POOLS.map((pool) => (
      <PoolRow key={pool.pair}>
        <Pair>{pool.pair}</Pair>
        <Right>
          <Apr>{pool.apr}</Apr>
          <Tvl>{pool.tvl}</Tvl>
        </Right>
      </PoolRow>
    ))}
  </LsPanel>
)

export default TopPoolsPanel
