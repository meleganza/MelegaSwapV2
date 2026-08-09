import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { useFarmsWalletPositions } from './useFarmsWalletPositions'
import { FarmsMyFarmCard } from './FarmsMyFarmCard'
import type { FarmsPositionAction, FarmsWalletPosition } from './farmsMyFarmsTypes'

const pulse = keyframes`0%,100%{opacity:.45}50%{opacity:.8}`

const Row = styled.section`
  width: 100%;
  max-width: ${farmsMyFarms.contentMax};
  margin-top: 0;
  display: block;
  font-family: ${typography.fontFamily.body};
  min-width: 0;
  position: relative;
  z-index: 0;
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Surface = styled.div`
  width: 100%;
  max-width: none;
  height: auto;
  min-height: ${farmsMyFarms.moduleH};
  border-radius: ${farmsMyFarms.moduleRadius};
  border: ${farmsMyFarms.moduleBorder};
  background: ${farmsMyFarms.moduleBg};
  box-shadow: ${farmsMyFarms.moduleShadow};
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Header = styled.header`
  min-height: ${farmsMyFarms.headerH};
  padding: 10px ${farmsMyFarms.headerPadX};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  color: ${farmsMyFarms.titleColor};
  font-size: ${farmsMyFarms.titleSize};
  line-height: ${farmsMyFarms.titleLine};
  font-weight: ${farmsMyFarms.titleWeight};
`

const Badge = styled.span`
  min-width: ${farmsMyFarms.countMinW};
  height: ${farmsMyFarms.countH};
  border-radius: ${farmsMyFarms.countRadius};
  background: ${farmsMyFarms.countBg};
  color: ${farmsMyFarms.countColor};
  font-size: ${farmsMyFarms.countSize};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const ViewToggle = styled.div`
  display: inline-flex;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
`

const ToggleBtn = styled.button<{ $active?: boolean }>`
  height: 34px;
  padding: 0 12px;
  border: 0;
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.16)' : 'transparent')};
  color: ${({ $active }) => ($active ? farmsMyFarms.gold : '#f5f5f5')};
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
`

const ViewAll = styled.button`
  min-width: ${farmsMyFarms.viewAllW};
  height: ${farmsMyFarms.viewAllH};
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
  &:focus-visible {
    outline: ${farmsMyFarms.focusRing};
    outline-offset: ${farmsMyFarms.focusOffset};
  }
`

const Body = styled.div`
  flex: 1;
  padding: 0 ${farmsMyFarms.contentPadX} 18px;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Grid = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${farmsMyFarms.cardGap};
  @media (max-width: 1199px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: ${farmsMyFarms.tabletBreak}) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  @media (max-width: ${farmsMyFarms.mobileBreak}) {
    grid-template-columns: 1fr;
    gap: ${farmsMyFarms.mobileCardGap};
  }
`

const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const ListRow = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 1.5fr) minmax(80px, 0.9fr) minmax(64px, 0.7fr) minmax(56px, 0.6fr) minmax(70px, 0.8fr) minmax(64px, 0.7fr) minmax(64px, 0.7fr) 80px minmax(200px, 1.2fr);
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(19, 19, 19, 0.96);
  min-width: 0;
  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`

const PairCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Logos = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const Logo = styled.span<{ $offset?: boolean }>`
  display: inline-flex;
  margin-left: ${({ $offset }) => ($offset ? '-8px' : '0')};
  position: relative;
  z-index: ${({ $offset }) => ($offset ? 2 : 1)};
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
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const Skeleton = styled.div`
  height: ${farmsMyFarms.cardH};
  border-radius: ${farmsMyFarms.cardRadius};
  border: ${farmsMyFarms.cardBorder};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;
`

const Center = styled.div`
  flex: 1;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
`

const StateTitle = styled.p`
  margin: 0;
  color: #f5f5f5;
  font-size: 15px;
  font-weight: 700;
`

const StateDesc = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
  max-width: 420px;
`

const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
`

/** Portal host for Module 006 — does not reserve blank desktop column width. */
const AdvisorPortalHost = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
`

function previewCount(_width: number): number {
  return 4
}

function FarmListRow({ position }: { position: FarmsWalletPosition }) {
  const { requestModal } = useFarmsRuntime()
  const [busy, setBusy] = useState<FarmsPositionAction['kind'] | null>(null)
  const run = (kind: FarmsPositionAction['kind']) => {
    const action = (position.actions ?? []).find((a) => a.kind === kind && a.enabled && a.modalAction)
    if (!action?.modalAction) return
    setBusy(kind)
    try {
      requestModal(position.sourceCard, action.modalAction)
    } finally {
      window.setTimeout(() => setBusy(null), 1200)
    }
  }
  const enabled = (kind: FarmsPositionAction['kind']) =>
    (position.actions ?? []).some((a) => a.kind === kind && a.enabled && a.modalAction)
  const deposited =
    position.depositedUsdAvailable !== false
      ? position.stakedFormatted || position.stakedValue || '—'
      : position.stakedLpFormatted || position.stakedFormatted || '—'
  return (
    <ListRow data-testid="farms-my-farm-list-row">
      <ListCell>
        <ListLabel>Pair</ListLabel>
        <PairCell>
          <Logos aria-hidden>
            <Logo>
              <MelegaTokenAvatar
                name={position.token0.symbol}
                symbol={position.token0.symbol}
                address={position.token0.address ?? undefined}
                chainId={position.chainId}
                size={22}
                radius="circle"
              />
            </Logo>
            <Logo $offset>
              <MelegaTokenAvatar
                name={position.token1.symbol}
                symbol={position.token1.symbol}
                address={position.token1.address ?? undefined}
                chainId={position.chainId}
                size={22}
                radius="circle"
              />
            </Logo>
          </Logos>
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {position.title}
            </strong>
            <MelegaExploreChainBadge chainId={position.chainId} />
          </div>
        </PairCell>
      </ListCell>
      <ListCell data-primary-metric="deposited-value">
        <ListLabel>Deposited</ListLabel>
        {deposited}
      </ListCell>
      <ListCell>
        <ListLabel>APR</ListLabel>
        {position.apr && position.apr !== '0%' ? position.apr : '—'}
      </ListCell>
      <ListCell>
        <ListLabel>Multiplier</ListLabel>
        {position.multiplier || '—'}
      </ListCell>
      <ListCell>
        <ListLabel>Rewards</ListLabel>
        {position.pendingFormatted || '—'}
      </ListCell>
      <ListCell>
        <ListLabel>Duration</ListLabel>
        —
      </ListCell>
      <ListCell>
        <ListLabel>Remaining</ListLabel>
        —
      </ListCell>
      <ListCell>
        <ListLabel>Status</ListLabel>
        {position.statusLabel}
      </ListCell>
      <ListCell>
        <Actions>
          <ActionBtn
            type="button"
            disabled={!enabled('claim') || busy === 'claim'}
            data-action="harvest"
            onClick={() => run('claim')}
          >
            {busy === 'claim' ? 'Harvesting…' : 'Harvest'}
          </ActionBtn>
          <ActionBtn
            type="button"
            disabled={!enabled('stake') || busy === 'stake'}
            data-action="stake-more"
            onClick={() => run('stake')}
          >
            Stake More
          </ActionBtn>
          <ActionBtn
            type="button"
            disabled={!enabled('unstake') || busy === 'unstake'}
            data-action="withdraw"
            onClick={() => run('unstake')}
          >
            {busy === 'unstake' ? 'Withdrawing…' : 'Withdraw'}
          </ActionBtn>
        </Actions>
      </ListCell>
    </ListRow>
  )
}

export const FarmsMyFarmsModule: React.FC = () => {
  const vm = useFarmsWalletPositions()
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [viewportW, setViewportW] = useState(1440)

  React.useEffect(() => {
    const sync = () => setViewportW(window.innerWidth)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  const limit = previewCount(viewportW)
  const shown = useMemo(() => {
    if (expanded) return vm.positions
    return vm.visiblePositions.slice(0, limit)
  }, [expanded, vm.positions, vm.visiblePositions, limit])

  const canExpand = (vm.totalCount ?? vm.positions.length) > limit

  if (vm.state === 'empty') {
    return null
  }

  return (
    <Row
      data-testid="farms-my-farms-module"
      data-farms-module="003"
      data-pixel-farms-my-farms="full-width"
      data-module-state={vm.state}
      data-my-farms-expanded={expanded ? 'true' : 'false'}
      data-my-farms-view={viewMode}
      aria-labelledby="farms-my-farms-title"
    >
      <Surface data-testid="farms-my-farms-surface">
        <Header>
          <TitleRow>
            <Title id="farms-my-farms-title">My Farms</Title>
            {vm.showCountBadge && vm.totalCount != null ? (
              <Badge aria-label={`${vm.totalCount} farm positions`}>{vm.totalCount}</Badge>
            ) : null}
          </TitleRow>
          <HeaderActions>
            {expanded ? (
              <ViewToggle role="group" aria-label="My Farms view mode">
                <ToggleBtn type="button" $active={viewMode === 'cards'} onClick={() => setViewMode('cards')}>
                  Cards
                </ToggleBtn>
                <ToggleBtn type="button" $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                  List
                </ToggleBtn>
              </ViewToggle>
            ) : null}
            {canExpand || expanded ? (
              <ViewAll
                type="button"
                onClick={() => {
                  setExpanded((v) => !v)
                  if (expanded) setViewMode('cards')
                }}
                data-testid="farms-view-all-my-farms"
              >
                {expanded ? 'Show less' : 'View all my farms'}
              </ViewAll>
            ) : null}
          </HeaderActions>
        </Header>
        <Body>
          {vm.moduleDisclosure ? <StateDesc role="status">{vm.moduleDisclosure}</StateDesc> : null}
          <LiveRegion aria-live="polite">{vm.liveRegion}</LiveRegion>
          {vm.state === 'disconnected' ? (
            <Center>
              <StateTitle>Connect your wallet to view farm positions</StateTitle>
              <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton>
            </Center>
          ) : null}
          {vm.state === 'loading' ? (
            <Grid aria-busy="true" aria-label="Loading farm positions">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <Skeleton data-testid="farms-my-farms-skeleton" />
                </li>
              ))}
            </Grid>
          ) : null}
          {vm.state === 'unavailable' ? (
            <Center>
              <StateTitle>Farm positions are temporarily unavailable</StateTitle>
              <StateDesc>Your positions are not represented as zero. Try again later.</StateDesc>
            </Center>
          ) : null}
          {(['ready', 'partial', 'stale'] as const).includes(vm.state as 'ready') ? (
            viewMode === 'list' && expanded ? (
              <List data-testid="farms-my-farms-list">
                {shown.map((position) => (
                  <FarmListRow key={position.positionId} position={position} />
                ))}
              </List>
            ) : (
              <Grid data-testid="farms-my-farms-grid">
                {shown.map((position) => (
                  <li key={position.positionId}>
                    <FarmsMyFarmCard position={position} />
                  </li>
                ))}
              </Grid>
            )
          ) : null}
        </Body>
      </Surface>
      <AdvisorPortalHost
        data-farms-module-006-slot="reserved"
        aria-hidden="true"
        title="Reserved for Module 006 Yield Advisor portal"
      />
    </Row>
  )
}

export default FarmsMyFarmsModule
