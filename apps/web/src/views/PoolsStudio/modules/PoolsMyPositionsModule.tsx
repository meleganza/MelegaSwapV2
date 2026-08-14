/**
 * POOLS_MODULE_003 — My Positions.
 * Preview ≤4 cards; View all my positions expands inline with Cards | List.
 */

import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { truthDash } from 'lib/data-truth'
import { PoolTokenIcon } from '../components/poolsStudioPrimitives'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import { usePoolsWalletPositions } from './usePoolsWalletPositions'
import { PoolsMyPositionCard } from './PoolsMyPositionCard'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import type { PoolsWalletPosition } from './poolsMyPositionsTypes'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Row = styled.section<{ $solo?: boolean }>`
  width: 100%;
  max-width: ${poolsMyPositions.contentMax};
  margin-top: 0;
  box-sizing: border-box;
  display: block;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    max-width: none;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Surface = styled.div`
  width: 100%;
  height: auto;
  min-height: ${poolsMyPositions.moduleH};
  box-sizing: border-box;
  border-radius: ${poolsMyPositions.moduleRadius};
  border: ${poolsMyPositions.moduleBorder};
  background: ${poolsMyPositions.moduleBg};
  box-shadow: ${poolsMyPositions.moduleShadow};
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    min-height: 0;
  }
`

const Header = styled.header`
  min-height: ${poolsMyPositions.headerH};
  padding: 10px ${poolsMyPositions.headerPadX};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
  box-sizing: border-box;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${poolsMyPositions.titleSize};
  line-height: ${poolsMyPositions.titleLine};
  font-weight: ${poolsMyPositions.titleWeight};
  color: ${poolsMyPositions.titleColor};
`

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${poolsMyPositions.countMinW};
  height: ${poolsMyPositions.countH};
  padding: 0 8px;
  border-radius: ${poolsMyPositions.countRadius};
  background: ${poolsMyPositions.countBg};
  color: ${poolsMyPositions.countColor};
  font-size: ${poolsMyPositions.countSize};
  font-weight: 700;
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
  color: ${({ $active }) => ($active ? poolsMyPositions.gold : '#f5f5f5')};
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  font-family: ${typography.fontFamily.body};
`

const ViewAll = styled.button`
  appearance: none;
  cursor: pointer;
  min-width: ${poolsMyPositions.viewAllW};
  height: ${poolsMyPositions.viewAllH};
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  flex-shrink: 0;

  &:focus-visible {
    outline: ${poolsMyPositions.focusRing};
    outline-offset: ${poolsMyPositions.focusOffset};
  }
`

const Body = styled.div`
  flex: 1;
  padding: 0 ${poolsMyPositions.contentPadX} 18px;
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const CardGrid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${poolsMyPositions.cardGap};
  min-width: 0;

  @media (max-width: 1279px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    grid-template-columns: 1fr;
    gap: ${poolsMyPositions.mobileCardGap};
  }
`

const CardItem = styled.li`
  margin: 0;
  padding: 0;
  min-width: 0;
`

const SkeletonCard = styled.div`
  width: 100%;
  height: ${poolsMyPositions.cardH};
  border-radius: ${poolsMyPositions.cardRadius};
  border: ${poolsMyPositions.cardBorder};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;
  box-sizing: border-box;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
`

const CenterState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  padding: 12px;
  min-height: 240px;
`

const StateTitle = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 20px;
  font-weight: 700;
  color: #f5f5f5;
`

const StateDesc = styled.p`
  margin: 0;
  max-width: 360px;
  font-size: 13px;
  line-height: 18px;
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

/** Portal host for Module 006 — does not reserve blank desktop column width. */
const AdvisorPortalHost = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
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
  grid-template-columns: minmax(140px, 1.6fr) 72px minmax(90px, 1fr) minmax(64px, 0.7fr) minmax(90px, 1fr) minmax(72px, 0.7fr) minmax(72px, 0.7fr) minmax(72px, 0.7fr) 88px minmax(160px, 1.1fr);
  gap: 8px;
  padding: 0 14px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  min-width: 980px;

  @media (max-width: 1023px) {
    display: none;
  }
`

const ListRow = styled.div`
  display: grid;
  grid-template-columns: minmax(140px, 1.6fr) 72px minmax(90px, 1fr) minmax(64px, 0.7fr) minmax(90px, 1fr) minmax(72px, 0.7fr) minmax(72px, 0.7fr) minmax(72px, 0.7fr) 88px minmax(160px, 1.1fr);
  gap: 8px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(19, 19, 19, 0.96);
  min-width: 980px;

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

function previewCount(): number {
  return poolsMyPositions.maxVisibleDesktop
}

function positionApr(position: PoolsWalletPosition): string {
  const card = position.sourceCard
  const raw = card.sustainableAprDisplay || card.apr || null
  if (!raw || raw === '0%' || /unavailable|nan/i.test(raw)) return '—'
  return raw
}

function positionRemaining(position: PoolsWalletPosition): string {
  return truthDash(position.unlockLine || position.sourceCard.estimatedDuration || null)
}

function positionDuration(position: PoolsWalletPosition): string {
  const lock = position.lockType
  if (lock === 'flexible') return 'Flexible'
  if (lock === 'ended') return 'Ended'
  return truthDash(position.sourceCard.estimatedDuration || position.unlockLine || null)
}

function PositionListRow({ position }: { position: PoolsWalletPosition }) {
  const { requestModal } = usePoolsRuntime()
  const stakeAction = position.actions.find((a) => a.kind === 'manage' || a.modalAction === 'stake')
  const withdrawAction = position.actions.find((a) => a.kind === 'withdraw' || a.modalAction === 'unstake')
  const claimAction = position.actions.find((a) => a.kind === 'claim' || a.modalAction === 'claim')
  const explorer =
    position.sourceCard.explorerUrl ||
    (position.poolContract ? `https://bscscan.com/address/${position.poolContract}` : null)

  return (
    <ListRow data-testid="pools-my-position-list-row">
      <ListCell>
        <ListLabel>Pool</ListLabel>
        <PoolIdentity>
          <LogoStack aria-hidden>
            <PoolTokenIcon
              symbol={position.stakeToken.symbol}
              address={position.stakeToken.address ?? undefined}
              chainId={position.stakeToken.chainId ?? undefined}
              size={28}
            />
            <RewardWrap>
              <PoolTokenIcon
                symbol={position.rewardToken.symbol}
                address={position.rewardToken.address ?? undefined}
                chainId={position.rewardToken.chainId ?? undefined}
                size={22}
              />
            </RewardWrap>
          </LogoStack>
          <strong title={position.title}>{position.title}</strong>
        </PoolIdentity>
      </ListCell>
      <ListCell>
        <ListLabel>Chain</ListLabel>
        <MelegaExploreChainBadge chainId={position.chainId} />
      </ListCell>
      <ListCell>
        <ListLabel>Staked Value</ListLabel>
        {truthDash(position.stakedValue || position.stakedFormatted)}
      </ListCell>
      <ListCell>
        <ListLabel>APR</ListLabel>
        {positionApr(position)}
      </ListCell>
      <ListCell>
        <ListLabel>Rewards</ListLabel>
        {truthDash(position.claimableFormatted)}
      </ListCell>
      <ListCell>
        <ListLabel>Participants</ListLabel>
        —
      </ListCell>
      <ListCell>
        <ListLabel>Remaining</ListLabel>
        {positionRemaining(position)}
      </ListCell>
      <ListCell>
        <ListLabel>Duration</ListLabel>
        {positionDuration(position)}
      </ListCell>
      <ListCell>
        <ListLabel>Status</ListLabel>
        {position.statusLabel}
      </ListCell>
      <ListCell>
        <Actions>
          <ActionBtn
            type="button"
            data-action="stake"
            disabled={!stakeAction?.enabled}
            onClick={() => {
              if (stakeAction?.modalAction) requestModal(position.sourceCard, stakeAction.modalAction)
              else requestModal(position.sourceCard, 'stake')
            }}
          >
            Stake
          </ActionBtn>
          {claimAction?.enabled ? (
            <ActionBtn
              type="button"
              data-action="claim"
              onClick={() => requestModal(position.sourceCard, 'claim')}
            >
              Claim
            </ActionBtn>
          ) : null}
          {withdrawAction?.enabled ? (
            <ActionBtn
              type="button"
              data-action="withdraw"
              onClick={() => requestModal(position.sourceCard, 'unstake')}
            >
              Withdraw
            </ActionBtn>
          ) : null}
          <ActionBtn
            type="button"
            data-action="view-pool"
            disabled={!explorer}
            onClick={() => {
              if (explorer) window.open(explorer, '_blank', 'noopener,noreferrer')
            }}
          >
            View Pool
          </ActionBtn>
        </Actions>
      </ListCell>
    </ListRow>
  )
}

export const PoolsMyPositionsModule: React.FC<{ variant?: 'default' | 'with-create-side' }> = () => {
  const vm = usePoolsWalletPositions()
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  const limit = previewCount()
  const shown = useMemo(() => {
    if (expanded) return vm.positions
    return vm.visiblePositions.slice(0, limit)
  }, [expanded, vm.positions, vm.visiblePositions, limit])

  const canExpand = (vm.totalCount ?? vm.positions.length) > limit

  // No giant empty module — hide when disconnected or zero positions.
  if (vm.state === 'empty' || vm.state === 'disconnected') {
    return null
  }

  return (
    <Row
      data-testid="pools-my-positions-module"
      data-pools-module="003"
      data-pools-module-003="mounted"
      data-module-state={vm.state}
      data-my-positions-expanded={expanded ? 'true' : 'false'}
      data-my-positions-view={viewMode}
      aria-labelledby="pools-my-positions-title"
    >
      <Surface data-pools-my-positions-surface="true">
        <Header>
          <TitleRow>
            <Title id="pools-my-positions-title">My Positions</Title>
            {vm.showCountBadge && vm.totalCount != null ? (
              <CountBadge aria-label={`${vm.totalCount} positions`}>{vm.totalCount}</CountBadge>
            ) : null}
          </TitleRow>
          <HeaderActions>
            {expanded ? (
              <ViewToggle role="group" aria-label="My Positions view mode" data-testid="pools-my-positions-view-toggle">
                <ToggleBtn
                  type="button"
                  $active={viewMode === 'cards'}
                  onClick={() => setViewMode('cards')}
                  data-testid="pools-my-positions-cards"
                >
                  Cards
                </ToggleBtn>
                <ToggleBtn
                  type="button"
                  $active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  data-testid="pools-my-positions-list-toggle"
                >
                  List
                </ToggleBtn>
              </ViewToggle>
            ) : null}
            {canExpand || expanded ? (
              <ViewAll
                type="button"
                onClick={() => {
                  setExpanded((v) => !v)
                }}
                data-testid="pools-view-all-my-positions"
                aria-label={expanded ? 'Show less' : 'View all my positions'}
              >
                {expanded ? 'Show less' : 'View all my positions'}
              </ViewAll>
            ) : null}
          </HeaderActions>
        </Header>

        <Body>
          {vm.state === 'loading' ? (
            <CardGrid aria-busy="true" aria-label="Loading pool positions" data-testid="pools-my-positions-loading">
              {[0, 1, 2, 3].map((i) => (
                <CardItem key={i}>
                  <SkeletonCard data-testid="pools-my-positions-skeleton" />
                </CardItem>
              ))}
            </CardGrid>
          ) : null}

          {vm.state === 'unavailable' ? (
            <CenterState data-testid="pools-my-positions-unavailable">
              <StateTitle>Pool positions are temporarily unavailable</StateTitle>
              <StateDesc>Your funds are not represented as zero. Try again later.</StateDesc>
            </CenterState>
          ) : null}

          {vm.state === 'ready' || vm.state === 'partial' || vm.state === 'stale' ? (
            viewMode === 'list' && expanded ? (
              <List data-testid="pools-my-positions-list">
                <ListHeader data-testid="pools-my-positions-list-header">
                  <span>Pool</span>
                  <span>Chain</span>
                  <span>Staked Value</span>
                  <span>Apr</span>
                  <span>Rewards</span>
                  <span>Participants</span>
                  <span>Remaining</span>
                  <span>Duration</span>
                  <span>Status</span>
                  <span>Actions</span>
                </ListHeader>
                {shown.map((position) => (
                  <PositionListRow key={position.positionId} position={position} />
                ))}
              </List>
            ) : (
              <CardGrid data-testid="pools-my-positions-grid">
                {shown.map((position) => (
                  <CardItem key={position.positionId}>
                    <PoolsMyPositionCard position={position} />
                  </CardItem>
                ))}
              </CardGrid>
            )
          ) : null}
        </Body>

        <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
      </Surface>
      <AdvisorPortalHost
        data-pools-module-006-slot="reserved"
        aria-hidden="true"
        title="Reserved for Module 006 Yield Advisor portal"
      />
    </Row>
  )
}

export default PoolsMyPositionsModule
