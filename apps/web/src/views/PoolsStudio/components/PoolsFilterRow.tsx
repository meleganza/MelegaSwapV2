import React from 'react'
import styled from 'styled-components'
import { POOL_FILTER_CHIPS } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import type { PoolsPortfolioViewMode } from '../poolsRuntime/buildPoolsWalletPortfolio'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  overflow: visible;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${poolsStudioLayout.filterGap};
  align-items: center;
  width: 100%;
  overflow: visible;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: ${poolsStudioLayout.filterPillHeight};
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${poolsStudioColors.chipBorder};
  background: ${({ $active }) => ($active ? poolsStudioColors.explorerGold : poolsStudioColors.card)};
  color: ${({ $active }) => ($active ? '#050505' : poolsStudioColors.tabInactive)};
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
`

const VIEW_CHIPS: { mode: PoolsPortfolioViewMode; label: string }[] = [
  { mode: 'MY_POOLS', label: 'My Positions' },
  { mode: 'ALL', label: 'Explore Pools' },
]

export const PoolsFilterRow: React.FC = () => {
  const { filter, setFilter, portfolioViewMode, setPortfolioViewMode } = usePoolsRuntime()

  return (
    <Wrap data-ps-filters data-ps-portfolio-view={portfolioViewMode}>
      <Row data-testid="ps-view-filters" aria-label="Pool portfolio views">
        {VIEW_CHIPS.map((chip) => (
          <Chip
            key={chip.mode}
            type="button"
            $active={portfolioViewMode === chip.mode}
            data-testid={chip.mode === 'MY_POOLS' ? 'ps-view-my-positions' : 'ps-view-explore-pools'}
            data-view-mode={chip.mode}
            onClick={() => setPortfolioViewMode(chip.mode)}
          >
            {chip.label}
          </Chip>
        ))}
      </Row>
      <Row data-testid="ps-explore-filters" aria-label="Explore pool filters">
        {POOL_FILTER_CHIPS.map((chip) => (
          <Chip
            key={chip}
            type="button"
            $active={filter === chip}
            onClick={() => {
              setPortfolioViewMode('ALL')
              setFilter(chip)
            }}
          >
            {chip}
          </Chip>
        ))}
      </Row>
    </Wrap>
  )
}

export default PoolsFilterRow
