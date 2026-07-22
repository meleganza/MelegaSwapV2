import React from 'react'
import styled from 'styled-components'
import { FARM_FILTER_CHIPS } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import type { FarmsPortfolioViewMode } from '../farmsRuntime/buildFarmsWalletPortfolio'

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: ${farmsStudioLayout.filterMarginTop};
  min-width: 0;
`

const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: ${farmsStudioLayout.filterHeight};
  overflow-x: auto;
  min-width: 0;
  padding-bottom: 2px;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) => ($active ? farmsStudioColors.goldBorder : farmsStudioColors.border)};
  background: ${({ $active }) => ($active ? farmsStudioColors.goldBg : 'transparent')};
  color: ${({ $active }) => ($active ? farmsStudioColors.goldBright : farmsStudioColors.text)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 140ms ease, background 140ms ease;
`

const VIEW_CHIPS: { mode: FarmsPortfolioViewMode; label: string }[] = [
  { mode: 'MY_FARMS', label: 'My Positions' },
  { mode: 'ALL', label: 'All Farms' },
]

const EXPLORE_CHIPS = FARM_FILTER_CHIPS.filter((chip) => chip !== 'All' && chip !== 'My Farms')

export const FarmsFilterRow: React.FC = () => {
  const { filter, setFilter, portfolioViewMode, setPortfolioViewMode } = useFarmsRuntime()

  return (
    <Row data-fs-filters data-fs-portfolio-view={portfolioViewMode}>
      <ChipRow data-testid="fs-view-filters" aria-label="Farm portfolio views">
        {VIEW_CHIPS.map((chip) => (
          <Chip
            key={chip.mode}
            type="button"
            $active={portfolioViewMode === chip.mode}
            data-testid={`fs-view-${chip.mode === 'MY_FARMS' ? 'my-farms' : 'all-farms'}`}
            onClick={() => setPortfolioViewMode(chip.mode)}
          >
            {chip.label}
          </Chip>
        ))}
      </ChipRow>
      <ChipRow data-testid="fs-explore-filters" aria-label="Explore farm filters">
        {EXPLORE_CHIPS.map((chip) => (
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
      </ChipRow>
    </Row>
  )
}

export default FarmsFilterRow
