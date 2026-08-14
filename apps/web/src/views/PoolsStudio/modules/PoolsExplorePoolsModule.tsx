/**
 * POOLS_MODULE_004 — Explore Pools (ACTIVE stakeable registry).
 * Compact toolbar: Search | Filters ▼ | Cards|List
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { LIVE_CHAIN_FILTERS } from 'lib/data-truth/globalYieldInventory'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { PoolTokenIcon } from '../components/poolsStudioPrimitives'
import { poolsExplore, POOLS_EXPLORE_SORTS } from './poolsExplorePoolsTokens'
import { usePoolsExplorePools } from './usePoolsExplorePools'
import { PoolsExplorePoolCard } from './PoolsExplorePoolCard'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import type { PoolsExploreFilter, PoolsExplorePoolCardModel, PoolsExploreSort } from './poolsExplorePoolsTypes'
import { truthDash } from 'lib/data-truth'
import { ChainSwitchConfirmDialog, chainDisplayName } from 'components/ChainSwitchConfirmDialog'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${poolsExplore.contentMax};
  margin-top: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

const LoadMore = styled.button`
  appearance: none;
  cursor: pointer;
  align-self: center;
  min-height: ${poolsExplore.touchMin};
  padding: 0 22px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 13px;
  font-weight: 700;

  &:focus-visible {
    outline: ${poolsExplore.focusRing};
    outline-offset: ${poolsExplore.focusOffset};
  }
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
  width: 100%;
`

const Search = styled.input`
  appearance: none;
  flex: 1 1 220px;
  min-width: 0;
  height: 40px;
  min-height: ${poolsExplore.touchMin};
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  box-sizing: border-box;

  &:focus-visible {
    outline: ${poolsExplore.focusRing};
    outline-offset: ${poolsExplore.focusOffset};
  }

  @media (max-width: ${poolsExplore.mobileBreak}) {
    flex: 1 1 100%;
  }
`

const ToolbarSide = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: ${poolsExplore.mobileBreak}) {
    width: 100%;
    justify-content: space-between;
  }
`

const FiltersWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`

const FiltersBtn = styled.button<{ $open?: boolean }>`
  appearance: none;
  cursor: pointer;
  height: 40px;
  min-height: ${poolsExplore.touchMin};
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ $open }) => ($open ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $open }) => ($open ? 'rgba(244,196,48,0.12)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $open }) => ($open ? poolsExplore.gold : '#f5f5f5')};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;

  &:focus-visible {
    outline: ${poolsExplore.focusRing};
    outline-offset: ${poolsExplore.focusOffset};
  }
`

const FiltersPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 40;
  width: min(320px, calc(100vw - 32px));
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(18, 18, 18, 0.98);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: ${poolsExplore.mobileBreak}) {
    left: 0;
    right: auto;
  }
`

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const FilterGroupLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chip = styled.button<{ $active?: boolean }>`
  appearance: none;
  cursor: pointer;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(244,196,48,0.14)' : 'rgba(255,255,255,0.03)')};
  color: ${({ $active }) => ($active ? poolsExplore.gold : 'rgba(255,255,255,0.78)')};
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: 650;
`

const Select = styled.select`
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(20, 20, 20, 0.95);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
`

const ViewToggle = styled.div`
  display: inline-flex;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  flex-shrink: 0;
  height: 40px;
`

const ToggleBtn = styled.button<{ $active?: boolean }>`
  height: 100%;
  padding: 0 12px;
  border: 0;
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.16)' : 'transparent')};
  color: ${({ $active }) => ($active ? poolsExplore.gold : '#f5f5f5')};
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  font-family: ${typography.fontFamily.body};
`

const ActiveChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
`

const RemovableChip = styled.button`
  appearance: none;
  cursor: pointer;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(244, 196, 48, 0.1);
  color: ${poolsExplore.gold};
  font-size: 11px;
  font-weight: 650;
  font-family: ${typography.fontFamily.body};
`

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
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${poolsExplore.tabletPortraitBreak}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: ${poolsExplore.desktopBreak}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (min-width: ${poolsExplore.ultraWideBreak}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
`

const ListHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(140px, 1.6fr) 72px minmax(80px, 0.9fr) minmax(64px, 0.7fr) minmax(90px, 1fr) minmax(72px, 0.7fr)
    minmax(72px, 0.7fr) minmax(72px, 0.7fr) 88px minmax(140px, 1fr);
  gap: 8px;
  padding: 0 14px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  min-width: 960px;

  @media (max-width: 1023px) {
    display: none;
  }
`

const ListRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(140px, 1.6fr) 72px minmax(80px, 0.9fr) minmax(64px, 0.7fr) minmax(90px, 1fr) minmax(72px, 0.7fr)
    minmax(72px, 0.7fr) minmax(72px, 0.7fr) 88px minmax(140px, 1fr);
  gap: 8px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(19, 19, 19, 0.96);
  min-width: 960px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    min-width: 0;
    gap: 8px;
  }
`

const ListCell = styled.div`
  min-width: 0;
  font-size: 13px;
  color: #f5f5f5;
`

const ListLabel = styled.span`
  display: none;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  @media (max-width: 1023px) {
    display: inline;
    margin-right: 8px;
  }
`

const PoolIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const LogoStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const RewardWrap = styled.span`
  margin-left: -8px;
  position: relative;
  z-index: 1;
  display: inline-flex;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
  @media (max-width: 1023px) {
    justify-content: flex-start;
  }
`

const ActionBtn = styled.button`
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  font-family: ${typography.fontFamily.body};
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const ConnectActionBtn = styled(ConnectWalletButton)`
  height: 32px;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(244, 196, 48, 0.4);
  background: rgba(244, 196, 48, 0.12);
  color: ${poolsExplore.gold};
  box-shadow: none;
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: 650;
`

const TYPE_FILTERS: PoolsExploreFilter[] = ['All', 'Single Asset', 'LP', 'Flexible', 'Locked']

function ExploreListRow({ pool }: { pool: PoolsExplorePoolCardModel }) {
  const { requestModal } = usePoolsRuntime()
  const { switchNetworkAsync } = useSwitchNetwork()
  const [switchOpen, setSwitchOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const explorer = pool.contractExplorerUrl

  const onPrimary = () => {
    if (pool.primaryAction === 'Switch Network') {
      setSwitchOpen(true)
      return
    }
    if (pool.primaryAction === 'Stake') requestModal(pool.sourceCard, 'stake')
  }

  const onConfirmSwitch = async () => {
    setSwitching(true)
    try {
      await switchNetworkAsync?.(pool.chainId)
      setSwitchOpen(false)
      window.setTimeout(() => requestModal(pool.sourceCard, 'stake'), 400)
    } catch {
      setSwitchOpen(false)
    } finally {
      setSwitching(false)
    }
  }

  return (
    <>
      <ListRow data-testid="pools-explore-list-row">
        <ListCell>
          <ListLabel>Pool</ListLabel>
          <PoolIdentity>
            <LogoStack aria-hidden>
              <PoolTokenIcon
                symbol={pool.stakeToken.symbol}
                address={pool.stakeToken.address ?? undefined}
                chainId={pool.stakeToken.chainId ?? undefined}
                size={28}
              />
              <RewardWrap>
                <PoolTokenIcon
                  symbol={pool.rewardToken.symbol}
                  address={pool.rewardToken.address ?? undefined}
                  chainId={pool.rewardToken.chainId ?? undefined}
                  size={22}
                />
              </RewardWrap>
            </LogoStack>
            <strong title={pool.title}>{pool.title}</strong>
          </PoolIdentity>
        </ListCell>
        <ListCell>
          <ListLabel>Chain</ListLabel>
          <MelegaExploreChainBadge chainId={pool.chainId} />
        </ListCell>
        <ListCell>
          <ListLabel>TVL</ListLabel>
          {truthDash(pool.tvlDisplay)}
        </ListCell>
        <ListCell>
          <ListLabel>APR</ListLabel>
          {truthDash(pool.aprDisplay)}
        </ListCell>
        <ListCell>
          <ListLabel>Rewards</ListLabel>
          {truthDash(pool.emissionDisplay)}
        </ListCell>
        <ListCell>
          <ListLabel>Participants</ListLabel>
          {truthDash(pool.participantsDisplay)}
        </ListCell>
        <ListCell>
          <ListLabel>Remaining</ListLabel>
          {truthDash(pool.remainingDisplay)}
        </ListCell>
        <ListCell>
          <ListLabel>Duration</ListLabel>
          {truthDash(pool.durationDisplay)}
        </ListCell>
        <ListCell>
          <ListLabel>Status</ListLabel>
          {pool.statusLabel}
        </ListCell>
        <ListCell>
          <Actions>
            {pool.primaryAction === 'Connect Wallet' ? (
              <ConnectActionBtn data-action="connect-wallet">Connect Wallet</ConnectActionBtn>
            ) : (
              <ActionBtn
                type="button"
                data-action="stake"
                disabled={!pool.stakeEnabled || pool.primaryAction === 'Unavailable'}
                onClick={onPrimary}
              >
                {pool.primaryAction === 'Switch Network' ? 'Switch Network' : 'Stake'}
              </ActionBtn>
            )}
            <ActionBtn
              type="button"
              data-action="view-pool"
              disabled={!explorer && !pool.detailsHref}
              onClick={() => {
                if (explorer) window.open(explorer, '_blank', 'noopener,noreferrer')
                else if (pool.detailsHref) window.location.href = pool.detailsHref
              }}
            >
              View Pool
            </ActionBtn>
          </Actions>
        </ListCell>
      </ListRow>
      <ChainSwitchConfirmDialog
        open={switchOpen}
        targetChainId={pool.chainId}
        productLabel={`This pool is on ${chainDisplayName(pool.chainId)}. Switch network to continue?`}
        busy={switching}
        onCancel={() => setSwitchOpen(false)}
        onConfirm={onConfirmSwitch}
      />
    </>
  )
}

export const PoolsExplorePoolsModule: React.FC = () => {
  const vm = usePoolsExplorePools()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleLimit, setVisibleLimit] = useState(8)
  const filtersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleLimit(8)
  }, [vm.filter, vm.sort, vm.search, vm.chainFilter])

  const visiblePools = useMemo(() => vm.pools.slice(0, visibleLimit), [vm.pools, visibleLimit])

  React.useEffect(() => {
    if (!filtersOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!filtersRef.current?.contains(e.target as Node)) setFiltersOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [filtersOpen])

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    if (vm.chainFilter !== 'all') {
      const label = LIVE_CHAIN_FILTERS.find((c) => c.id === vm.chainFilter)?.label ?? String(vm.chainFilter)
      chips.push({
        key: 'chain',
        label: `Chain: ${label}`,
        clear: () => vm.setChainFilter('all'),
      })
    }
    if (vm.filter !== 'All') {
      chips.push({
        key: 'type',
        label: vm.filter,
        clear: () => vm.setFilter('All'),
      })
    }
    if (vm.sort !== 'Highest APR') {
      chips.push({
        key: 'sort',
        label: vm.sort,
        clear: () => vm.setSort('Highest APR'),
      })
    }
    return chips
  }, [vm])

  const viewToggle = (
    <ViewToggle role="group" aria-label="Explore pools view mode" data-testid="pools-explore-view-toggle">
      <ToggleBtn
        type="button"
        $active={viewMode === 'cards'}
        onClick={() => setViewMode('cards')}
        data-testid="pools-explore-cards"
      >
        Cards
      </ToggleBtn>
      <ToggleBtn
        type="button"
        $active={viewMode === 'list'}
        onClick={() => setViewMode('list')}
        data-testid="pools-explore-list-toggle"
      >
        List
      </ToggleBtn>
    </ViewToggle>
  )

  const filtersControl = (
    <FiltersWrap ref={filtersRef}>
      <FiltersBtn
        type="button"
        $open={filtersOpen}
        aria-expanded={filtersOpen}
        aria-haspopup="dialog"
        data-testid="pools-explore-filters"
        onClick={() => setFiltersOpen((v) => !v)}
      >
        Filters ▾
      </FiltersBtn>
      {filtersOpen ? (
        <FiltersPanel role="dialog" aria-label="Explore pool filters" data-testid="pools-explore-filters-panel">
          <FilterGroup>
            <FilterGroupLabel>Chain</FilterGroupLabel>
            <ChipRow role="toolbar" aria-label="Explore pool chains" data-testid="pools-chain-filters">
              {LIVE_CHAIN_FILTERS.map((c) => (
                <Chip
                  key={String(c.id)}
                  type="button"
                  $active={vm.chainFilter === c.id}
                  aria-pressed={vm.chainFilter === c.id}
                  onClick={() => vm.setChainFilter(c.id)}
                >
                  {c.label}
                </Chip>
              ))}
            </ChipRow>
          </FilterGroup>
          <FilterGroup>
            <FilterGroupLabel>Type</FilterGroupLabel>
            <ChipRow role="toolbar" aria-label="Explore pool type">
              {TYPE_FILTERS.map((f) => (
                <Chip
                  key={f}
                  type="button"
                  $active={vm.filter === f}
                  aria-pressed={vm.filter === f}
                  onClick={() => vm.setFilter(f)}
                >
                  {f}
                </Chip>
              ))}
            </ChipRow>
          </FilterGroup>
          <FilterGroup>
            <FilterGroupLabel>Sort · APR / TVL / Newest</FilterGroupLabel>
            <Select
              value={vm.sort}
              aria-label="Sort active pools"
              onChange={(e) => {
                const next = e.target.value as PoolsExploreSort
                vm.setSort(next)
                if (next === 'Highest APR') vm.setFilter('All')
                if (next === 'Highest TVL') vm.setFilter('Highest TVL')
                if (next === 'Newest') vm.setFilter('Newest')
              }}
            >
              {POOLS_EXPLORE_SORTS.map((s) => (
                <option key={s} value={s}>
                  {s === 'Highest APR' ? 'APR' : s === 'Highest TVL' ? 'TVL' : s}
                </option>
              ))}
            </Select>
            <ChipRow>
              {(['High APR', 'Highest TVL', 'Newest'] as PoolsExploreFilter[]).map((f) => (
                <Chip
                  key={f}
                  type="button"
                  $active={vm.filter === f}
                  aria-pressed={vm.filter === f}
                  onClick={() => {
                    vm.setFilter(f)
                    if (f === 'High APR') vm.setSort('Highest APR')
                    if (f === 'Highest TVL') vm.setSort('Highest TVL')
                    if (f === 'Newest') vm.setSort('Newest')
                  }}
                >
                  {f === 'High APR' ? 'APR' : f === 'Highest TVL' ? 'TVL' : 'Newest'}
                </Chip>
              ))}
            </ChipRow>
          </FilterGroup>
        </FiltersPanel>
      ) : null}
    </FiltersWrap>
  )

  return (
    <Module
      data-testid="pools-explore-pools-module"
      data-pools-module="004"
      data-pools-module-004="mounted"
      data-ps-pool-explorer
      data-module-state={vm.state}
      data-explore-view={viewMode}
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

      <Toolbar data-testid="pools-explore-toolbar">
        <Search
          type="search"
          placeholder="Search pool / token / address"
          value={vm.search}
          onChange={(e) => vm.setSearch(e.target.value)}
          aria-label="Search active staking pools"
          data-testid="pools-explore-search"
        />
        <ToolbarSide>
          {filtersControl}
          {viewToggle}
        </ToolbarSide>
      </Toolbar>

      {activeChips.length > 0 ? (
        <ActiveChips data-testid="pools-explore-active-chips">
          {activeChips.map((c) => (
            <RemovableChip key={c.key} type="button" onClick={c.clear} aria-label={`Clear ${c.label}`}>
              {c.label} ×
            </RemovableChip>
          ))}
        </ActiveChips>
      ) : null}

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
        ) : viewMode === 'list' ? (
          <List data-testid="pools-explore-list">
            <ListHeader data-testid="pools-explore-list-header">
              <span>Pool</span>
              <span>Chain</span>
              <span>TVL</span>
              <span>Apr</span>
              <span>Rewards</span>
              <span>Participants</span>
              <span>Remaining</span>
              <span>Duration</span>
              <span>Status</span>
              <span>Actions</span>
            </ListHeader>
            {visiblePools.map((pool) => (
              <ExploreListRow key={pool.poolId} pool={pool} />
            ))}
          </List>
        ) : (
          <Grid data-testid="pools-explore-grid">
            {visiblePools.map((pool) => (
              <Item key={pool.poolId}>
                <PoolsExplorePoolCard pool={pool} />
              </Item>
            ))}
          </Grid>
        )
      ) : null}

      {(vm.state === 'ready' || vm.state === 'partial') && visiblePools.length < vm.pools.length ? (
        <LoadMore
          type="button"
          onClick={() => setVisibleLimit((limit) => limit + 8)}
          data-testid="pools-explore-load-more"
        >
          Show more · {visiblePools.length} of {vm.pools.length}
        </LoadMore>
      ) : null}

      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Module>
  )
}

export default PoolsExplorePoolsModule
