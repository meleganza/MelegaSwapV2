/**
 * LIQUIDITY_MODULE_003_POOL_DISCOVERY — Explore Pools (discovery only).
 */
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { LiquidityPoolDiscoveryCard } from './LiquidityPoolDiscoveryCard'
import {
  LIQUIDITY_POOL_DISCOVERY_COPY,
  liquidityPoolDiscovery,
  type LiquidityDiscoveryFilter,
  type LiquidityDiscoverySort,
} from './liquidityPoolDiscoveryTokens'
import { useLiquidityPoolDiscovery } from './useLiquidityPoolDiscovery'

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityPoolDiscovery.contentMax};
  margin: ${liquidityPoolDiscovery.gapAfterActions} auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: ${liquidityPoolDiscovery.tabletBreak}) {
    padding: 0 16px;
  }
`

const Header = styled.div`
  width: 100%;
  min-height: ${liquidityPoolDiscovery.headerH};
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
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
  justify-content: flex-end;
  min-width: 0;
`

const Search = styled.input`
  width: min(280px, 100%);
  height: 40px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 8, 8, 0.9);
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

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: ${liquidityPoolDiscovery.columnGap};
  row-gap: ${liquidityPoolDiscovery.rowGap};
  min-width: 0;

  @media (max-width: ${liquidityPoolDiscovery.twoColMax}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${liquidityPoolDiscovery.mobileBreak}) {
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

const FILTER_LABEL: Record<LiquidityDiscoveryFilter, string> = {
  all: LIQUIDITY_POOL_DISCOVERY_COPY.filters.all,
  'my-tokens': LIQUIDITY_POOL_DISCOVERY_COPY.filters.myTokens,
  popular: LIQUIDITY_POOL_DISCOVERY_COPY.filters.popular,
  newest: LIQUIDITY_POOL_DISCOVERY_COPY.filters.newest,
}

const SORT_LABEL: Record<LiquidityDiscoverySort, string> = {
  market: LIQUIDITY_POOL_DISCOVERY_COPY.sorts.market,
  tvl: LIQUIDITY_POOL_DISCOVERY_COPY.sorts.tvl,
  volume: LIQUIDITY_POOL_DISCOVERY_COPY.sorts.volume,
  newest: LIQUIDITY_POOL_DISCOVERY_COPY.sorts.newest,
}

export const LiquidityPoolDiscoveryModule: React.FC = () => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<LiquidityDiscoveryFilter>('all')
  const [sort, setSort] = useState<LiquidityDiscoverySort>('market')

  const discovery = useLiquidityPoolDiscovery({ query, filter, sort })

  const skeletons = useMemo(
    () => Array.from({ length: liquidityPoolDiscovery.skeletonCount }, (_, i) => i),
    [],
  )

  return (
    <Shell
      data-testid="liquidity-pool-discovery-module"
      data-liquidity-module="003-pool-discovery"
      data-liquidity-module-003="mounted"
      aria-labelledby="liquidity-pool-discovery-title"
    >
      <Header data-testid="liquidity-pool-discovery-header" data-liquidity-discovery-header="64">
        <Titles>
          <Title id="liquidity-pool-discovery-title">{LIQUIDITY_POOL_DISCOVERY_COPY.title}</Title>
          <Description>{LIQUIDITY_POOL_DISCOVERY_COPY.description}</Description>
        </Titles>
        <Controls>
          <Search
            data-testid="liquidity-pool-discovery-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={LIQUIDITY_POOL_DISCOVERY_COPY.searchPlaceholder}
            aria-label={LIQUIDITY_POOL_DISCOVERY_COPY.searchPlaceholder}
          />
          <ChipRow data-testid="liquidity-pool-discovery-filters" role="group" aria-label="Pool filters">
            {discovery.availableFilters.map((id) => (
              <Chip
                key={id}
                type="button"
                $active={filter === id}
                data-testid={`liquidity-pool-discovery-filter-${id}`}
                onClick={() => setFilter(id)}
              >
                {FILTER_LABEL[id]}
              </Chip>
            ))}
          </ChipRow>
          {discovery.availableSorts.length > 0 ? (
            <SortSelect
              data-testid="liquidity-pool-discovery-sort"
              value={discovery.availableSorts.includes(sort) ? sort : discovery.availableSorts[0]}
              onChange={(e) => setSort(e.target.value as LiquidityDiscoverySort)}
              aria-label="Sort pools"
            >
              {discovery.availableSorts.map((id) => (
                <option key={id} value={id}>
                  {SORT_LABEL[id]}
                </option>
              ))}
            </SortSelect>
          ) : null}
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
        <Grid data-testid="liquidity-pool-discovery-grid" data-liquidity-discovery-geometry="1376-20-445">
          {discovery.visibleCards.map((card) => (
            <LiquidityPoolDiscoveryCard key={card.id} card={card} />
          ))}
        </Grid>
      ) : null}
    </Shell>
  )
}

export default LiquidityPoolDiscoveryModule
