/**
 * FARMS_MODULE_004 — Explore Farms (ACTIVE stakeable LP registry).
 * Compact toolbar: Search | Filters ▼ | Cards|List
 */

import React, { useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { LIVE_CHAIN_FILTERS } from 'lib/data-truth/globalYieldInventory'
import { truthDash } from 'lib/data-truth'
import { getBlockExploreLink } from 'utils'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsExplore, FARMS_EXPLORE_FILTERS, FARMS_EXPLORE_SORTS } from './farmsExploreFarmsTokens'
import { useExploreFarms } from './useFarmsExploreFarms'
import { FarmsExploreFarmCard } from './FarmsExploreFarmCard'
import type { ExploreFarmViewModel, FarmsExploreFilter, FarmsExploreSort } from './farmsExploreFarmsTypes'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${farmsExplore.contentMax};
  margin-top: 0;
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
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-width: 0;
  width: 100%;
  margin-bottom: 14px;
`

const Search = styled.input`
  appearance: none;
  flex: 1 1 220px;
  min-width: 0;
  height: 40px;
  min-height: ${farmsExplore.touchMin};
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  box-sizing: border-box;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }

  @media (max-width: ${farmsExplore.mobileBreak}) {
    flex: 1 1 100%;
  }
`

const ToolbarSide = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: ${farmsExplore.mobileBreak}) {
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
  min-height: ${farmsExplore.touchMin};
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ $open }) => ($open ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $open }) => ($open ? 'rgba(244,196,48,0.12)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $open }) => ($open ? farmsExplore.gold : '#f5f5f5')};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
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

  @media (max-width: ${farmsExplore.mobileBreak}) {
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
  color: ${({ $active }) => ($active ? farmsExplore.gold : 'rgba(255,255,255,0.78)')};
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: 650;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
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

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
`

const ActiveChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
  margin-bottom: 12px;
`

const RemovableChip = styled.button`
  appearance: none;
  cursor: pointer;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(244, 196, 48, 0.1);
  color: ${farmsExplore.gold};
  font-size: 11px;
  font-weight: 650;
  font-family: ${typography.fontFamily.body};
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
  color: ${({ $active }) => ($active ? farmsExplore.gold : '#f5f5f5')};
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  font-family: ${typography.fontFamily.body};
`

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

const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
`

const LIST_GRID =
  'minmax(140px, 1.5fr) 72px minmax(72px, 0.75fr) minmax(64px, 0.65fr) minmax(64px, 0.65fr) minmax(80px, 0.75fr) minmax(72px, 0.7fr) minmax(72px, 0.7fr) minmax(72px, 0.7fr) 72px minmax(140px, 1.1fr)'

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: ${LIST_GRID};
  gap: 8px;
  padding: 0 14px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  min-width: 1080px;

  @media (max-width: 1023px) {
    display: none;
  }
`

const ListRow = styled.div`
  display: grid;
  grid-template-columns: ${LIST_GRID};
  gap: 8px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(19, 19, 19, 0.96);
  min-width: 1080px;

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

const FarmIdentity = styled.div`
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

const LogoOverlap = styled.span`
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

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
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
  text-decoration: none;
  box-sizing: border-box;
`

function ExploreFarmListRow({ farm }: { farm: ExploreFarmViewModel }) {
  const { requestModal } = useFarmsRuntime()
  const unavailable = farm.primaryAction === 'Farm Unavailable'
  const stakeDisabled = unavailable || farm.primaryAction === 'Connect Wallet'
  const farmExplorer = farm.masterbuilder
    ? getBlockExploreLink(farm.masterbuilder, 'address', farm.chainId)
    : null
  const lpExplorer = farm.lpToken?.address
    ? getBlockExploreLink(farm.lpToken.address, 'address', farm.chainId)
    : null

  return (
    <ListRow data-testid="farms-explore-list-row">
      <ListCell>
        <ListLabel>Farm</ListLabel>
        <FarmIdentity>
          <LogoStack aria-hidden>
            <MelegaTokenAvatar
              name={farm.token0.symbol}
              symbol={farm.token0.symbol}
              address={farm.token0.address ?? undefined}
              chainId={farm.chainId}
              size={28}
              radius="circle"
            />
            <LogoOverlap>
              <MelegaTokenAvatar
                name={farm.token1.symbol}
                symbol={farm.token1.symbol}
                address={farm.token1.address ?? undefined}
                chainId={farm.chainId}
                size={22}
                radius="circle"
              />
            </LogoOverlap>
          </LogoStack>
          <strong title={farm.title} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {farm.title}
          </strong>
        </FarmIdentity>
      </ListCell>
      <ListCell>
        <ListLabel>Chain</ListLabel>
        <MelegaExploreChainBadge chainId={farm.chainId} />
      </ListCell>
      <ListCell>
        <ListLabel>TVL</ListLabel>
        {truthDash(farm.tvl)}
      </ListCell>
      <ListCell>
        <ListLabel>APR</ListLabel>
        {truthDash(farm.apr)}
      </ListCell>
      <ListCell>
        <ListLabel>Multiplier</ListLabel>
        {truthDash(farm.multiplier)}
      </ListCell>
      <ListCell>
        <ListLabel>Volume 24h</ListLabel>
        {truthDash(farm.volume24h)}
      </ListCell>
      <ListCell>
        <ListLabel>Participants</ListLabel>
        {truthDash(farm.participants)}
      </ListCell>
      <ListCell>
        <ListLabel>Duration</ListLabel>
        {truthDash(farm.rewardDuration)}
      </ListCell>
      <ListCell>
        <ListLabel>Remaining</ListLabel>
        {truthDash(farm.rewardsRemaining)}
      </ListCell>
      <ListCell>
        <ListLabel>Status</ListLabel>
        {farm.statusLabel}
      </ListCell>
      <ListCell>
        <Actions>
          <ActionBtn
            type="button"
            disabled={stakeDisabled}
            onClick={() => {
              if (stakeDisabled) return
              requestModal(farm.sourceCard, 'stake')
            }}
          >
            {farm.primaryAction.includes('Stake') || farm.primaryAction === 'Approve LP'
              ? 'Stake'
              : farm.primaryAction === 'Switch Network'
                ? 'Switch Network'
                : 'Stake'}
          </ActionBtn>
          {farmExplorer ? (
            <ActionLink href={farmExplorer} target="_blank" rel="noopener noreferrer">
              View Farm
            </ActionLink>
          ) : (
            <ActionBtn type="button" disabled>
              View Farm
            </ActionBtn>
          )}
          {lpExplorer ? (
            <ActionLink href={lpExplorer} target="_blank" rel="noopener noreferrer">
              View LP
            </ActionLink>
          ) : (
            <ActionBtn type="button" disabled>
              View LP
            </ActionBtn>
          )}
        </Actions>
      </ListCell>
    </ListRow>
  )
}

export const FarmsExploreFarmsModule: React.FC = () => {
  const vm = useExploreFarms()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

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
        key: 'filter',
        label: vm.filter,
        clear: () => vm.setFilter('All'),
      })
    }
    if (vm.sort !== 'Highest TVL') {
      chips.push({
        key: 'sort',
        label: vm.sort,
        clear: () => vm.setSort('Highest TVL'),
      })
    }
    return chips
  }, [vm])

  const showCount = vm.state !== 'loading' && vm.state !== 'unavailable' && vm.totalActive > 0
  const chainCountLabel =
    vm.chainFilter === 'all'
      ? 'all LIVE chains'
      : LIVE_CHAIN_FILTERS.find((chain) => chain.id === vm.chainFilter)?.label ?? String(vm.chainFilter)

  const viewToggle = (
    <ViewToggle role="group" aria-label="Explore farms view mode" data-testid="farms-explore-view-toggle">
      <ToggleBtn type="button" $active={viewMode === 'cards'} onClick={() => setViewMode('cards')}>
        Cards
      </ToggleBtn>
      <ToggleBtn type="button" $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
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
        data-testid="farms-explore-filters"
        onClick={() => setFiltersOpen((v) => !v)}
      >
        Filters ▾
      </FiltersBtn>
      {filtersOpen ? (
        <FiltersPanel role="dialog" aria-label="Explore farm filters" data-testid="farms-explore-filters-panel">
          <FilterGroup>
            <FilterGroupLabel>Chain</FilterGroupLabel>
            <ChipRow role="toolbar" aria-label="Explore farm chains" data-testid="farms-chain-filters">
              {LIVE_CHAIN_FILTERS.map((c) => (
                <Chip
                  key={String(c.id)}
                  type="button"
                  $active={vm.chainFilter === c.id}
                  aria-pressed={vm.chainFilter === c.id}
                  data-testid={`farms-chain-filter-${c.id}`}
                  onClick={() => vm.setChainFilter(c.id)}
                >
                  {c.label}
                </Chip>
              ))}
            </ChipRow>
          </FilterGroup>
          <FilterGroup>
            <FilterGroupLabel>Filter</FilterGroupLabel>
            <ChipRow role="toolbar" aria-label="Explore farm filters">
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
            </ChipRow>
          </FilterGroup>
          <FilterGroup>
            <FilterGroupLabel>Sort</FilterGroupLabel>
            <Select
              value={vm.sort}
              aria-label="Sort active farms"
              onChange={(e) => vm.setSort(e.target.value as FarmsExploreSort)}
            >
              {FARMS_EXPLORE_SORTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FilterGroup>
        </FiltersPanel>
      ) : null}
    </FiltersWrap>
  )

  return (
    <Module
      id="explore-farms"
      data-testid="farms-explore-farms-module"
      data-farms-module-004="mounted"
      data-fs-explore-farms="true"
      data-multichain-inventory="true"
      data-module-state={vm.state}
      data-explore-view={viewMode}
      aria-labelledby="farms-explore-farms-title"
    >
      <Header>
        <TitleRow>
          <Title id="farms-explore-farms-title">Explore Farms</Title>
          {showCount ? (
            <Count aria-label={`${vm.totalActive} active farms on ${chainCountLabel}`}>
              {vm.totalActive} farms · {chainCountLabel}
            </Count>
          ) : null}
        </TitleRow>
        {vm.freshness ? (
          <Freshness aria-label={`Source freshness ${vm.freshness}`}>
            {vm.freshness === 'stale' ? 'Stale' : vm.freshness === 'partial' ? 'Partial' : 'Live'}
          </Freshness>
        ) : null}
      </Header>

      <Toolbar role="search" aria-label="Explore farms search and filters" data-testid="farms-explore-toolbar">
        <Search
          type="search"
          placeholder="Search farm / token / pair"
          value={vm.search}
          onChange={(e) => vm.setSearch(e.target.value)}
          aria-label="Search farm, token or pair"
        />
        <ToolbarSide>
          {filtersControl}
          {viewToggle}
        </ToolbarSide>
      </Toolbar>

      {activeChips.length > 0 ? (
        <ActiveChips data-testid="farms-explore-active-chips">
          {activeChips.map((c) => (
            <RemovableChip key={c.key} type="button" onClick={c.clear} aria-label={`Clear ${c.label}`}>
              {c.label} ×
            </RemovableChip>
          ))}
        </ActiveChips>
      ) : null}

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
            {viewMode === 'list' ? (
              <List data-testid="farms-explore-list">
                <ListHeader data-testid="farms-explore-list-header">
                  <span>Farm</span>
                  <span>Chain</span>
                  <span>TVL</span>
                  <span>APR</span>
                  <span>Multiplier</span>
                  <span>Volume 24h</span>
                  <span>Participants</span>
                  <span>Duration</span>
                  <span>Remaining</span>
                  <span>Status</span>
                  <span>Actions</span>
                </ListHeader>
                {vm.visibleFarms.map((farm) => (
                  <ExploreFarmListRow key={farm.farmId} farm={farm} />
                ))}
              </List>
            ) : (
              <Grid data-testid="farms-explore-grid">
                {vm.visibleFarms.map((farm) => (
                  <Item key={farm.farmId}>
                    <FarmsExploreFarmCard farm={farm} />
                  </Item>
                ))}
              </Grid>
            )}
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
