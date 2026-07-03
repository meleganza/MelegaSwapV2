import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
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

const PoolLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: contents;
`

const LoadingLine = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${liquidityStudioColors.muted};
`

export const TopPoolsPanel: React.FC = () => {
  const { terminal, loadingLabel } = useLiquidityRuntime()
  const { topPools, isIndexing, isLoadingPools } = terminal

  return (
    <LsPanel
      data-ls-panel
      $width={liquidityStudioLayout.rightWidth}
      $height={liquidityStudioLayout.topPoolsHeight}
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
    >
      <LsSectionTitle>Top Pools</LsSectionTitle>
      {loadingLabel || isIndexing || isLoadingPools ? (
        <LoadingLine>{loadingLabel ?? 'Loading top pools…'}</LoadingLine>
      ) : topPools.length === 0 ? (
        <LoadingLine>No pools indexed yet.</LoadingLine>
      ) : (
        topPools.map((pool) => (
          <PoolRow key={pool.id}>
            <PoolLink href={pool.href}>
              <Pair>{pool.pair}</Pair>
              <Right>
                <Apr>{pool.apr}</Apr>
                <Tvl>{pool.tvl}</Tvl>
              </Right>
            </PoolLink>
          </PoolRow>
        ))
      )}
    </LsPanel>
  )
}

export default TopPoolsPanel
