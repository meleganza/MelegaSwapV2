/**
 * Your Farms — wallet-first primary surface (R791E.3).
 *
 * Consumes WalletPortfolio FARM positions via View Engine.
 * No local farm scanning. No fake opportunities first.
 */

import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PositionCard } from 'components/portfolio/PositionCard'
import { projectMyPositionCard } from 'lib/wallet-portfolio/myPositionCardModel'
import { typography } from 'design-system/melega'
import { farmsStudioColors } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import {
  selectFarmPortfolioPositions,
  selectMyFarmPortfolioPositions,
} from '../farmsRuntime/buildFarmsWalletPortfolio'

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
  color: ${farmsStudioColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  color: ${farmsStudioColors.muted};
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
  border: 1px solid ${farmsStudioColors.rowBorder ?? farmsStudioColors.border};
  border-radius: 12px;
  background: rgba(20, 22, 28, 0.6);
  color: ${farmsStudioColors.muted};
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
  border: 1px solid ${farmsStudioColors.border};
  background: transparent;
  color: ${farmsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
`

export function YourFarmsSection() {
  const {
    account,
    userDataLoaded,
    farmsWalletPortfolio,
    portfolioViewMode,
    setPortfolioViewMode,
    setFilter,
  } = useFarmsRuntime()

  const positionsLoading = Boolean(account) && !userDataLoaded

  const farmPositions = useMemo(() => {
    if (portfolioViewMode === 'MY_FARMS') {
      return selectMyFarmPortfolioPositions(farmsWalletPortfolio)
    }
    return selectFarmPortfolioPositions(farmsWalletPortfolio)
  }, [farmsWalletPortfolio, portfolioViewMode])

  return (
    <Section
      data-testid="your-farms-section"
      data-fs-wallet-first="true"
      data-portfolio-view={portfolioViewMode}
      data-position-count={farmPositions.length}
    >
      <Header>
        <Title>Your Farms</Title>
        <Subtitle>Staked farm positions from your wallet portfolio.</Subtitle>
      </Header>

      {!account ? (
        <Empty data-testid="fs-farms-disconnected">Connect wallet to view farms.</Empty>
      ) : positionsLoading ? (
        <Empty data-testid="fs-farms-loading">Loading farm positions…</Empty>
      ) : farmPositions.length === 0 ? (
        <Empty data-testid="fs-farms-empty">No farm positions found.</Empty>
      ) : (
        <Grid data-testid="fs-farms-grid">
          {farmPositions.map((position) => {
            const model = projectMyPositionCard(position)
            return (
              <div
                key={position.positionId}
                data-testid="fs-farm-position-card"
                data-position-id={position.positionId}
                data-farm={position.title}
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
          data-testid="fs-explore-farms"
          onClick={() => {
            setPortfolioViewMode('ALL')
            setFilter('All')
          }}
        >
          Explore Farms
        </ExploreButton>
      </ExploreRow>
    </Section>
  )
}

export default YourFarmsSection
