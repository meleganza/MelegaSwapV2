/**
 * FARMS_MODULE_004 — Explore Farms (ACTIVE stakeable LP registry).
 * Does not modify Modules 001–003. Does not mount Modules 005–010.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { farmsExplore, FARMS_EXPLORE_FILTERS, FARMS_EXPLORE_SORTS } from './farmsExploreFarmsTokens'
import { useExploreFarms } from './useFarmsExploreFarms'
import { FarmsExploreFarmCard } from './FarmsExploreFarmCard'
import type { FarmsExploreFilter, FarmsExploreSort } from './farmsExploreFarmsTypes'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${farmsExplore.contentMax};
  /* Parent Content gap 32px → 16px after My Farms / Advisor row */
  margin-top: -16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${farmsExplore.mobileBreak}) {
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
  height: ${farmsExplore.headerH};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${farmsExplore.titleSize};
  line-height: ${farmsExplore.titleLine};
  font-weight: ${farmsExplore.titleWeight};
  color: ${farmsExplore.titleColor};
`

const Count = styled.span`
  font-size: ${farmsExplore.countSize};
  line-height: ${farmsExplore.countLine};
  color: ${farmsExplore.countColor};
  font-weight: 600;
`

const Freshness = styled.span`
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.45);
`

const Toolbar = styled.div`
  height: auto;
  min-height: ${farmsExplore.toolbarH};
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-width: 0;
  margin-bottom: 14px;

  @media (max-width: ${farmsExplore.mobileBreak}) {
    flex-direction: column;
    align-items: stretch;
  }
`

const Search = styled.input`
  appearance: none;
  width: min(320px, 100%);
  height: 40px;
  min-height: ${farmsExplore.touchMin};
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }

  @media (max-width: ${farmsExplore.mobileBreak}) {
    width: 100%;
    max-width: 326px;
  }
`

const Select = styled.select`
  height: 40px;
  min-height: ${farmsExplore.touchMin};
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(20, 20, 20, 0.95);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
`

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  flex: 1;
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
  color: ${({ $active }) => ($active ? farmsExplore.gold : 'rgba(255,255,255,0.78)')};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 650;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
`

/**
 * Founder amendment P0-6 — density grid, mobile-first so wider breakpoints simply
 * override columns without depending on declaration order:
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
  column-gap: ${farmsExplore.cardGapX};
  row-gap: ${farmsExplore.mobileCardGap};
  min-width: 0;
  justify-content: start;

  @media (min-width: ${farmsExplore.smallTabletBreak}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: ${farmsExplore.cardGapY};
  }

  @media (min-width: ${farmsExplore.tabletPortraitBreak}) {
    grid-template-columns: repeat(2, minmax(${farmsExplore.tabletMinCardW}, 1fr));
    column-gap: 16px;
  }

  @media (min-width: ${farmsExplore.desktopBreak}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: ${farmsExplore.cardGapX};
  }

  @media (min-width: ${farmsExplore.ultraWideBreak}) {
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
  max-width: ${farmsExplore.cardW};
  height: ${farmsExplore.cardH};
  border-radius: ${farmsExplore.cardRadius};
  border: ${farmsExplore.cardBorder};
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
  margin: 0 0 12px;
  font-size: 11px;
  color: rgba(224, 184, 90, 0.95);
`

const LoadMore = styled.button`
  appearance: none;
  cursor: pointer;
  align-self: center;
  margin-top: 18px;
  min-height: ${farmsExplore.touchMin};
  height: 44px;
  padding: 0 22px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 13px;
  font-weight: 700;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
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

const Retry = styled.button`
  appearance: none;
  cursor: pointer;
  margin-top: 14px;
  min-height: ${farmsExplore.touchMin};
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.14);
  color: ${farmsExplore.gold};
  font-size: 13px;
  font-weight: 700;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
`

export const FarmsExploreFarmsModule: React.FC = () => {
  const vm = useExploreFarms()

  const showCount = vm.state !== 'loading' && vm.state !== 'unavailable' && vm.totalActive > 0

  return (
    <Module
      id="explore-farms"
      data-testid="farms-explore-farms-module"
      data-farms-module-004="mounted"
      data-fs-explore-farms="true"
      data-module-state={vm.state}
      aria-labelledby="farms-explore-farms-title"
    >
      <Header>
        <TitleRow>
          <Title id="farms-explore-farms-title">Explore Farms</Title>
          {showCount ? <Count aria-label={`${vm.totalActive} active farms`}>{vm.totalActive} active farms</Count> : null}
        </TitleRow>
        {vm.freshness ? (
          <Freshness aria-label={`Source freshness ${vm.freshness}`}>
            {vm.freshness === 'stale' ? 'Stale' : vm.freshness === 'partial' ? 'Partial' : 'Live'}
          </Freshness>
        ) : null}
      </Header>

      <Toolbar role="search" aria-label="Explore farms search and sort">
        <Search
          type="search"
          placeholder="Search LP pair, reward token or address"
          value={vm.search}
          onChange={(e) => vm.setSearch(e.target.value)}
          aria-label="Search LP pair, reward token or address"
        />
        <Select
          value={vm.sort}
          aria-label="Sort active farms"
          aria-valuetext={vm.sort}
          onChange={(e) => vm.setSort(e.target.value as FarmsExploreSort)}
        >
          {FARMS_EXPLORE_SORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <FilterRow role="toolbar" aria-label="Explore farm filters">
          {FARMS_EXPLORE_FILTERS.map((f) => (
            <Chip
              key={f}
              type="button"
              $active={vm.filter === f}
              aria-pressed={vm.filter === f}
              onClick={() => vm.setFilter(f as FarmsExploreFilter)}
            >
              {f}
            </Chip>
          ))}
        </FilterRow>
      </Toolbar>

      {vm.disclosure ? <Disclosure role="status">{vm.disclosure}</Disclosure> : null}

      {vm.state === 'loading' ? (
        <Grid aria-busy="true" aria-label="Loading active farms" data-testid="farms-explore-loading">
          {[0, 1, 2].map((i) => (
            <Item key={i}>
              <Skeleton data-testid="farms-explore-skeleton" />
            </Item>
          ))}
        </Grid>
      ) : null}

      {vm.state === 'empty' ? (
        <Empty data-testid="farms-explore-empty">
          <EmptyTitle>No active farms available</EmptyTitle>
          <EmptyDesc>There are currently no LP farming programs accepting deposits.</EmptyDesc>
        </Empty>
      ) : null}

      {vm.state === 'unavailable' ? (
        <Empty data-testid="farms-explore-unavailable">
          <EmptyTitle>Farms are temporarily unavailable</EmptyTitle>
          <EmptyDesc>Active farming programs could not be loaded.</EmptyDesc>
          <Retry type="button" onClick={() => window.location.reload()}>
            Retry
          </Retry>
        </Empty>
      ) : null}

      {vm.state === 'ready' || vm.state === 'partial' || vm.state === 'stale' ? (
        vm.visibleFarms.length === 0 ? (
          <Empty data-testid="farms-explore-filter-empty">
            <EmptyTitle>No active farms available</EmptyTitle>
            <EmptyDesc>No farms match the current filters or search.</EmptyDesc>
          </Empty>
        ) : (
          <>
            <Grid data-testid="farms-explore-grid">
              {vm.visibleFarms.map((farm) => (
                <Item key={farm.farmId}>
                  <FarmsExploreFarmCard farm={farm} />
                </Item>
              ))}
            </Grid>
            {vm.hasMore ? (
              <LoadMore type="button" onClick={vm.loadMore} data-testid="farms-explore-load-more">
                Load More
              </LoadMore>
            ) : null}
          </>
        )
      ) : null}

      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Module>
  )
}

export default FarmsExploreFarmsModule
