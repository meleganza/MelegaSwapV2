/**
 * Your Liquidity Positions — wallet-first primary surface (R791E.2).
 *
 * Consumes WalletPortfolio LIQUIDITY positions only.
 * No local LP scanning. No fake opportunities.
 */

import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PositionCard } from 'components/portfolio/PositionCard'
import { projectMyPositionCard } from 'lib/wallet-portfolio/myPositionCardModel'
import type { PortfolioPosition } from 'lib/wallet-portfolio/contracts'
import { typography } from 'design-system/melega'
import { liquidityStudioColors } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { selectLiquidityPortfolioPositions } from '../liquidityRuntime/buildLiquidityWalletPortfolio'

const Section = styled.section`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 18px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  color: ${liquidityStudioColors.muted};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const Empty = styled.div`
  padding: 20px 18px;
  border: 1px solid ${liquidityStudioColors.rowBorder};
  border-radius: 12px;
  background: rgba(20, 22, 28, 0.6);
  color: ${liquidityStudioColors.muted};
  font-family: ${typography.fontFamily.body};
  font-size: 14px;
`

const ExploreRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
`

const ExploreButton = styled.button`
  appearance: none;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid ${liquidityStudioColors.rowBorder};
  background: transparent;
  color: ${liquidityStudioColors.text};
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
`

function matchRowId(position: PortfolioPosition, rowIds: readonly string[]): string | null {
  const contract = position.contract?.toLowerCase() ?? null
  if (contract) {
    const hit = rowIds.find((id) => id.toLowerCase() === contract)
    if (hit) return hit
  }
  return null
}

export function YourLiquidityPositionsSection() {
  const {
    account,
    positionsLoading,
    positions,
    liquidityWalletPortfolio,
    setSelectedPositionId,
    setMode,
  } = useLiquidityRuntime()

  const liquidityPositions = useMemo(
    () => selectLiquidityPortfolioPositions(liquidityWalletPortfolio),
    [liquidityWalletPortfolio],
  )

  const rowIds = useMemo(() => positions.map((p) => p.id), [positions])

  return (
    <Section
      data-testid="your-liquidity-positions"
      data-ls-wallet-first="true"
      data-position-count={liquidityPositions.length}
    >
      <Header>
        <Title>Your Liquidity Positions</Title>
        <Subtitle>Owned liquidity positions from your wallet portfolio.</Subtitle>
      </Header>

      {!account ? (
        <Empty data-testid="ls-positions-disconnected">Connect wallet to view liquidity.</Empty>
      ) : positionsLoading ? (
        <Empty data-testid="ls-positions-loading">Loading liquidity positions…</Empty>
      ) : liquidityPositions.length === 0 ? (
        <Empty data-testid="ls-positions-empty">No liquidity positions found.</Empty>
      ) : (
        <Grid data-testid="ls-positions-grid">
          {liquidityPositions.map((position) => {
            const model = projectMyPositionCard(position)
            return (
              <div
                key={position.positionId}
                data-testid="ls-liquidity-position-card"
                data-position-id={position.positionId}
                data-pair={position.title}
                onClick={() => {
                  const rowId = matchRowId(position, rowIds)
                  if (rowId) setSelectedPositionId(rowId)
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  const rowId = matchRowId(position, rowIds)
                  if (rowId) setSelectedPositionId(rowId)
                }}
                role="button"
                tabIndex={0}
                style={{ minWidth: 0, cursor: 'pointer' }}
              >
                <PositionCard position={model} compact />
              </div>
            )
          })}
        </Grid>
      )}

      <ExploreRow>
        <ExploreButton
          type="button"
          data-testid="ls-explore-liquidity"
          onClick={() => setMode('Add Liquidity')}
        >
          Explore Liquidity
        </ExploreButton>
        <ExploreButton
          type="button"
          data-testid="ls-create-position"
          onClick={() => setMode('Add Liquidity')}
        >
          Create New Position
        </ExploreButton>
      </ExploreRow>
    </Section>
  )
}

export default YourLiquidityPositionsSection
