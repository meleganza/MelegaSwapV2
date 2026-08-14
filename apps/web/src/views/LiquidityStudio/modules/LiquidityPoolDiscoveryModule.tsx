/**
 * LIQUIDITY_MODULE_003_POOL_DISCOVERY — Explore Pools (discovery only).
 */
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { LiquidityPoolDiscoveryCard } from './LiquidityPoolDiscoveryCard'
import {
  LIQUIDITY_POOL_DISCOVERY_COPY,
  liquidityPoolDiscovery,
  type LiquidityDiscoveryFilter,
  type LiquidityDiscoverySort,
} from './liquidityPoolDiscoveryTokens'
import { useLiquidityPoolDiscovery } from './useLiquidityPoolDiscovery'

const Shell = styled.section<{ $embedded?: boolean }>`
  width: 100%;
  max-width: ${liquidityPoolDiscovery.contentMax};
  margin: ${({ $embedded }) => ($embedded ? '0 auto' : `${liquidityPoolDiscovery.gapAfterActions} auto 0`)};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${liquidityPoolDiscovery.tabletBreak}) {
    padding: ${({ $embedded }) => ($embedded ? '0' : '0 16px')};
  }
`

const Header = styled.div`
  width: 100%;
  min-height: ${liquidityPoolDiscovery.headerH};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`

const Titles = styled.div`
  min-width: 0;
  flex: 1 1 280px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  line-height: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${liquidityPoolDiscovery.text};
`

const Description = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 20px;
  color: ${liquidityPoolDiscovery.muted};
`

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: stretch;
  min-width: 0;
  width: 100%;
`

const Search = styled.input`
  flex: 1 1 240px;
  min-width: 0;
  height: 44px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: ${liquidityPoolDiscovery.text};
  padding: 0 12px;
  font-size: 13px;

  &::placeholder {
    color: ${liquidityPoolDiscovery.dim};
  }

  &:focus-visible {
    outline: ${liquidityPoolDiscovery.focusRing};
    outline-offset: ${liquidityPoolDiscovery.focusOffset};
  }
`

const ToolbarSide = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 0 0 auto;

  @media (max-width: ${liquidityPoolDiscovery.mobileBreak}) {
    width: 100%;
  }
`

const FiltersWrap = styled.div`
  position: relative;
`

const FiltersButton = styled.button<{ $open?: boolean }>`
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ $open }) => ($open ? 'rgba(244,196,48,0.5)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $open }) => ($open ? 'rgba(244,196,48,0.12)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $open }) => ($open ? liquidityPoolDiscovery.gold : liquidityPoolDiscovery.text)};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const FiltersPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  width: 230px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(18, 18, 18, 0.98);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
`

const ViewToggle = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(60px, 1fr));
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  overflow: hidden;
`

const ViewButton = styled.button<{ $active?: boolean }>`
  border: 0;
  background: ${({ $active }) => ($active ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.03)')};
  color: ${({ $active }) => ($active ? liquidityPoolDiscovery.gold : liquidityPoolDiscovery.text)};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$active ? 'rgba(244,196,48,0.55)' : 'rgba(255,255,255,0.12)')};
  background: ${(p) => (p.$active ? 'rgba(244,196,48,0.12)' : 'rgba(255,255,255,0.03)')};
  color: ${(p) => (p.$active ? liquidityPoolDiscovery.gold : liquidityPoolDiscovery.muted)};
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;

  &:focus-visible {
    outline: ${liquidityPoolDiscovery.focusRing};
    outline-offset: ${liquidityPoolDiscovery.focusOffset};
  }
`

const SortSelect = styled.select`
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 8, 8, 0.9);
  color: ${liquidityPoolDiscovery.muted};
  font-size: 12px;
  font-weight: 650;
  padding: 0 10px;
`

const Grid = styled.div<{ $view?: 'cards' | 'list' }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ $view }) => ($view === 'list' ? '1fr' : 'repeat(5, minmax(0, 1fr))')};
  column-gap: ${liquidityPoolDiscovery.columnGap};
  row-gap: ${liquidityPoolDiscovery.rowGap};
  min-width: 0;

  @media (min-width: 1920px) {
    grid-template-columns: ${({ $view }) => ($view === 'list' ? '1fr' : 'repeat(6, minmax(0, 1fr))')};
  }

  @media (max-width: ${liquidityPoolDiscovery.threeColMax}) {
    grid-template-columns: ${({ $view }) => ($view === 'list' ? '1fr' : 'repeat(3, minmax(0, 1fr))')};
  }

  @media (max-width: ${liquidityPoolDiscovery.mobileBreak}) {
    grid-template-columns: ${({ $view }) => ($view === 'list' ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
  }

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
  }
`

const Skeleton = styled.div`
  width: 100%;
  max-width: ${liquidityPoolDiscovery.cardW};
  min-height: ${liquidityPoolDiscovery.cardMinH};
  margin: 0 auto;
  border-radius: ${liquidityPoolDiscovery.cardRadius};
  border: ${liquidityPoolDiscovery.cardBorder};
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
`

const Empty = styled.p`
  margin: 24px 0 8px;
  font-size: 14px;
  line-height: 20px;
  color: ${liquidityPoolDiscovery.muted};
  text-align: center;
`

const LoadMoreRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0 8px;
`

const LoadMoreBtn = styled.button`
  min-height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.4);
  background: rgba(244, 196, 48, 0.1);
  color: ${liquidityPoolDiscovery.text};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: rgba(244, 196, 48, 0.65);
  }

  &:focus-visible {
    outline: ${liquidityPoolDiscovery.focusRing};
    outline-offset: ${liquidityPoolDiscovery.focusOffset};
  }
`

export const LiquidityPoolDiscoveryModule: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [query, setQuery] = useState('')
  const filter: LiquidityDiscoveryFilter = 'all'
  const [sort, setSort] = useState<LiquidityDiscoverySort>('tvl')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const pageIncrement = 10
  const [pageSize, setPageSize] = useState(pageIncrement)

  useEffect(() => {
    setPageSize(pageIncrement)
  }, [query, sort, pageIncrement])

  const discovery = useLiquidityPoolDiscovery({ query, filter, sort, pageSize })

  const skeletons = useMemo(() => Array.from({ length: liquidityPoolDiscovery.skeletonCount }, (_, i) => i), [])

  return (
    <Shell
      $embedded={embedded}
      data-testid="liquidity-pool-discovery-module"
      data-liquidity-module="003-pool-discovery"
      data-liquidity-module-003="mounted"
      aria-labelledby={embedded ? undefined : 'liquidity-pool-discovery-title'}
      aria-label={embedded ? LIQUIDITY_POOL_DISCOVERY_COPY.title : undefined}
    >
      <Header data-testid="liquidity-pool-discovery-header" data-liquidity-discovery-header="64">
        {embedded ? null : (
          <Titles>
            <Title id="liquidity-pool-discovery-title">{LIQUIDITY_POOL_DISCOVERY_COPY.title}</Title>
            <Description>{LIQUIDITY_POOL_DISCOVERY_COPY.description}</Description>
          </Titles>
        )}
        <Controls data-testid="liquidity-pool-discovery-toolbar">
          <Search
            data-testid="liquidity-pool-discovery-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={LIQUIDITY_POOL_DISCOVERY_COPY.searchPlaceholder}
            aria-label={LIQUIDITY_POOL_DISCOVERY_COPY.searchPlaceholder}
          />
          <ToolbarSide>
            <FiltersWrap>
              <FiltersButton type="button" $open={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
                Filters ▾
              </FiltersButton>
              {filtersOpen ? (
                <FiltersPanel>
                  <SortSelect
                    data-testid="liquidity-pool-discovery-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as LiquidityDiscoverySort)}
                    aria-label="Sort pools"
                  >
                    <option value="tvl">Sort by liquidity</option>
                    {discovery.availableSorts.includes('volume') ? (
                      <option value="volume">Sort by volume</option>
                    ) : null}
                    {discovery.availableSorts.includes('newest') ? (
                      <option value="newest">Sort by newest</option>
                    ) : null}
                  </SortSelect>
                </FiltersPanel>
              ) : null}
            </FiltersWrap>
            <ViewToggle aria-label="Pool display">
              <ViewButton type="button" $active={view === 'cards'} onClick={() => setView('cards')}>
                Cards
              </ViewButton>
              <ViewButton type="button" $active={view === 'list'} onClick={() => setView('list')}>
                List
              </ViewButton>
            </ViewToggle>
          </ToolbarSide>
        </Controls>
      </Header>

      {discovery.state === 'loading' ? (
        <Grid data-testid="liquidity-pool-discovery-grid" data-liquidity-discovery-grid="3col" aria-busy="true">
          {skeletons.map((i) => (
            <Skeleton key={i} data-testid="liquidity-pool-discovery-skeleton" aria-hidden="true" />
          ))}
        </Grid>
      ) : null}

      {discovery.state === 'unavailable' ? (
        <Empty data-testid="liquidity-pool-discovery-unavailable">{LIQUIDITY_POOL_DISCOVERY_COPY.unavailable}</Empty>
      ) : null}

      {discovery.state === 'empty' ? (
        <Empty data-testid="liquidity-pool-discovery-empty">{LIQUIDITY_POOL_DISCOVERY_COPY.empty}</Empty>
      ) : null}

      {discovery.state === 'ready' ? (
        <>
          <Grid $view={view} data-testid="liquidity-pool-discovery-grid" data-liquidity-discovery-view={view}>
            {discovery.visibleCards.map((card) => (
              <LiquidityPoolDiscoveryCard key={card.id} card={card} listView={view === 'list'} />
            ))}
          </Grid>
          {discovery.hasMore ? (
            <LoadMoreRow>
              <LoadMoreBtn
                type="button"
                data-testid="liquidity-pool-discovery-load-more"
                onClick={() => setPageSize((n) => n + pageIncrement)}
              >
                Show more pools ({discovery.visibleCards.length} of {discovery.matchedCount})
              </LoadMoreBtn>
            </LoadMoreRow>
          ) : null}
        </>
      ) : null}
    </Shell>
  )
}

export default LiquidityPoolDiscoveryModule
