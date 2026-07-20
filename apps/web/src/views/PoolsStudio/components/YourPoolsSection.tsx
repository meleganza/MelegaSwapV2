/**
 * Your Pools — wallet-first primary surface (R791E.4).
 *
 * Consumes WalletPortfolio POOL positions via View Engine.
 * No local pool scanning. No fake opportunities first.
 * Ended owned positions remain visible.
 */

import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PositionCard } from 'components/portfolio/PositionCard'
import { projectMyPositionCard } from 'lib/wallet-portfolio/myPositionCardModel'
import { typography } from 'design-system/melega'
import { poolsStudioColors } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import {
  selectMyPoolPortfolioPositions,
  selectPoolPortfolioPositions,
} from '../poolsRuntime/buildPoolsWalletPortfolio'

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
  color: ${poolsStudioColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  color: ${poolsStudioColors.muted};
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
  border: 1px solid ${poolsStudioColors.rowBorder ?? poolsStudioColors.border};
  border-radius: 12px;
  background: rgba(20, 22, 28, 0.6);
  color: ${poolsStudioColors.muted};
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
  border: 1px solid ${poolsStudioColors.border};
  background: transparent;
  color: ${poolsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
`

export function YourPoolsSection() {
  const {
    account,
    userDataLoaded,
    poolsWalletPortfolio,
    portfolioViewMode,
    setPortfolioViewMode,
    setFilter,
    setPoolTab,
  } = usePoolsRuntime()

  const positionsLoading = Boolean(account) && !userDataLoaded

  const poolPositions = useMemo(() => {
    if (portfolioViewMode === 'MY_POOLS') {
      return selectMyPoolPortfolioPositions(poolsWalletPortfolio)
    }
    return selectPoolPortfolioPositions(poolsWalletPortfolio)
  }, [poolsWalletPortfolio, portfolioViewMode])

  return (
    <Section
      data-testid="your-pools-section"
      data-ps-wallet-first="true"
      data-portfolio-view={portfolioViewMode}
      data-position-count={poolPositions.length}
    >
      <Header>
        <Title>Your Pools</Title>
        <Subtitle>Staked pool positions from your wallet portfolio — including ended ownership.</Subtitle>
      </Header>

      {!account ? (
        <Empty data-testid="ps-pools-disconnected">Connect wallet to view pools.</Empty>
      ) : positionsLoading ? (
        <Empty data-testid="ps-pools-loading">Loading pool positions…</Empty>
      ) : poolPositions.length === 0 ? (
        <Empty data-testid="ps-pools-empty">No pool positions found.</Empty>
      ) : (
        <Grid data-testid="ps-pools-grid">
          {poolPositions.map((position) => {
            const model = projectMyPositionCard(position)
            return (
              <div
                key={position.positionId}
                data-testid="ps-pool-position-card"
                data-position-id={position.positionId}
                data-pool={position.title}
                data-lifecycle={position.status}
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
          data-testid="ps-explore-pools"
          onClick={() => {
            setPortfolioViewMode('ALL')
            setFilter('All')
            setPoolTab('all')
          }}
        >
          Explore Pools
        </ExploreButton>
      </ExploreRow>
    </Section>
  )
}

export default YourPoolsSection
