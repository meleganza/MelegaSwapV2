/**
 * POOLS_MODULE_004 — Explore Pools (ACTIVE stakeable registry).
 * Does not modify Modules 001–003. Does not mount Modules 005–010.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { poolsExplore, POOLS_EXPLORE_FILTERS, POOLS_EXPLORE_SORTS } from './poolsExplorePoolsTokens'
import { usePoolsExplorePools } from './usePoolsExplorePools'
import { PoolsExplorePoolCard } from './PoolsExplorePoolCard'
import type { PoolsExploreFilter, PoolsExploreSort } from './poolsExplorePoolsTypes'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${poolsExplore.contentMax};
  /* Parent Content gap 32px → 16px after My Positions */
  margin-top: -16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsExplore.mobileBreak}) {
    max-width: none;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  font-weight: 750;
  color: #f5f5f5;
`

const Count = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 24px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(244, 196, 48, 0.18);
  color: ${poolsExplore.gold};
  font-size: 11px;
  font-weight: 700;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-width: 0;
`

const Search = styled.input`
  appearance: none;
  width: min(280px, 100%);
  height: 40px;
  min-height: ${poolsExplore.touchMin};
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;

  &:focus-visible {
    outline: ${poolsExplore.focusRing};
    outline-offset: ${poolsExplore.focusOffset};
  }
`

const Select = styled.select`
  height: 40px;
  min-height: ${poolsExplore.touchMin};
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(20, 20, 20, 0.95);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;

  &:focus-visible {
    outline: ${poolsExplore.focusRing};
    outline-offset: ${poolsExplore.focusOffset};
  }
`

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
`

const Chip = styled.button<{ $active?: boolean }>`
  appearance: none;
  cursor: pointer;
  height: 34px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(244,196,48,0.14)' : 'rgba(255,255,255,0.03)')};
  color: ${({ $active }) => ($active ? poolsExplore.gold : 'rgba(255,255,255,0.78)')};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 650;

  &:focus-visible {
    outline: ${poolsExplore.focusRing};
    outline-offset: ${poolsExplore.focusOffset};
  }
`

/**
 * Founder amendment P0-9 — same density grid as Explore Farms, mobile-first so
 * wider breakpoints simply override columns without depending on declaration order:
 *   ≤767 mobile: 1 · 768–1024 (small tablet landscape): 3 · 1025–1199 (tablet): 2
 *   1200–1919 (default/1440, ≤1366 safe): 4 · ≥1920 (ultra-wide): 5
 */
const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: ${poolsExplore.cardGap};
  min-width: 0;

  @media (min-width: ${poolsExplore.smallTabletBreak}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: ${poolsExplore.tabletPortraitBreak}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${poolsExplore.desktopBreak}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (min-width: ${poolsExplore.ultraWideBreak}) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const Item = styled.li`
  margin: 0;
  padding: 0;
  min-width: 0;
  display: flex;
`

const Skeleton = styled.div`
  width: 100%;
  max-width: ${poolsExplore.cardW};
  height: ${poolsExplore.cardH};
  border-radius: ${poolsExplore.cardRadius};
  border: ${poolsExplore.cardBorder};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;
  box-sizing: border-box;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
`

const Empty = styled.div`
  padding: 28px 18px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(18, 18, 18, 0.9);
  text-align: center;
`

const EmptyTitle = styled.p`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #f5f5f5;
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
`

const Disclosure = styled.p`
  margin: 0;
  font-size: 11px;
  color: rgba(224, 184, 90, 0.95);
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

export const PoolsExplorePoolsModule: React.FC = () => {
  const vm = usePoolsExplorePools()

  return (
    <Module
      data-testid="pools-explore-pools-module"
      data-pools-module="004"
      data-pools-module-004="mounted"
      data-ps-pool-explorer
      data-module-state={vm.state}
      aria-labelledby="pools-explore-pools-title"
    >
      <Header>
        <TitleRow>
          <Title id="pools-explore-pools-title">Explore Pools</Title>
          {vm.state !== 'loading' && vm.state !== 'unavailable' ? (
            <Count aria-label={`${vm.totalActive} active pools`}>{vm.totalActive}</Count>
          ) : null}
        </TitleRow>
      </Header>

      <Toolbar>
        <Search
          type="search"
          placeholder="Search pool, token, reward, address"
          value={vm.search}
          onChange={(e) => vm.setSearch(e.target.value)}
          aria-label="Search active staking pools"
        />
        <Select
          value={vm.sort}
          aria-label="Sort active pools"
          onChange={(e) => vm.setSort(e.target.value as PoolsExploreSort)}
        >
          {POOLS_EXPLORE_SORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Toolbar>

      <FilterRow role="toolbar" aria-label="Explore pool filters">
        {POOLS_EXPLORE_FILTERS.map((f) => (
          <Chip
            key={f}
            type="button"
            $active={vm.filter === f}
            aria-pressed={vm.filter === f}
            onClick={() => vm.setFilter(f as PoolsExploreFilter)}
          >
            {f}
          </Chip>
        ))}
      </FilterRow>

      {vm.disclosure ? <Disclosure>{vm.disclosure}</Disclosure> : null}

      {vm.state === 'loading' ? (
        <Grid aria-busy="true" aria-label="Loading active pools" data-testid="pools-explore-loading">
          {[0, 1, 2].map((i) => (
            <Item key={i}>
              <Skeleton data-testid="pools-explore-skeleton" />
            </Item>
          ))}
        </Grid>
      ) : null}

      {vm.state === 'empty' ? (
        <Empty data-testid="pools-explore-empty">
          <EmptyTitle>No active staking pools</EmptyTitle>
          <EmptyDesc>There are currently no active pools available.</EmptyDesc>
        </Empty>
      ) : null}

      {vm.state === 'unavailable' ? (
        <Empty data-testid="pools-explore-unavailable">
          <EmptyTitle>Active pools are temporarily unavailable</EmptyTitle>
          <EmptyDesc>Try again later. Historical pools are not shown here.</EmptyDesc>
        </Empty>
      ) : null}

      {vm.state === 'ready' || vm.state === 'partial' ? (
        vm.pools.length === 0 ? (
          <Empty data-testid="pools-explore-filter-empty">
            <EmptyTitle>No active staking pools</EmptyTitle>
            <EmptyDesc>No pools match the current filters or search.</EmptyDesc>
          </Empty>
        ) : (
          <Grid data-testid="pools-explore-grid">
            {vm.pools.map((pool) => (
              <Item key={pool.poolId}>
                <PoolsExplorePoolCard pool={pool} />
              </Item>
            ))}
          </Grid>
        )
      ) : null}

      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Module>
  )
}

export default PoolsExplorePoolsModule
