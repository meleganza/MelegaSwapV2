/**
 * POOLS_MODULE_003 — My Positions (left 936×360) + reserved Advisor slot (424).
 * Does not modify Modules 001–002. Does not mount Modules 004–010 content.
 */

import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { PoolTokenIcon } from '../components/poolsStudioPrimitives'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import { usePoolsWalletPositions } from './usePoolsWalletPositions'
import { PoolsMyPositionCard } from './PoolsMyPositionCard'
import type { PoolsWalletPosition } from './poolsMyPositionsTypes'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Row = styled.section`
  width: 100%;
  max-width: ${poolsMyPositions.contentMax};
  margin-top: 0;
  box-sizing: border-box;
  display: block;
  min-width: 0;
  font-family: ${typography.fontFamily.body};
  position: relative;
  z-index: 0;

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
  max-width: none;
  height: auto;
  min-height: 0;
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
    width: 100%;
  }
`

const Header = styled.header`
  height: ${poolsMyPositions.headerH};
  padding: 0 ${poolsMyPositions.headerPadX};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    height: ${poolsMyPositions.mobileHeaderH};
  }
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
`

const ViewAll = styled.button`
  appearance: none;
  cursor: pointer;
  min-width: ${poolsMyPositions.viewAllW};
  height: ${poolsMyPositions.viewAllH};
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 650;
  flex-shrink: 0;
  white-space: nowrap;

  &:focus-visible {
    outline: ${poolsMyPositions.focusRing};
    outline-offset: ${poolsMyPositions.focusOffset};
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
  grid-template-columns: minmax(140px, 1.4fr) minmax(80px, 0.9fr) minmax(70px, 0.8fr) minmax(80px, 0.9fr) minmax(70px, 0.8fr) minmax(70px, 0.8fr) minmax(160px, 1.1fr);
  gap: 8px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(19, 19, 19, 0.96);
  min-width: 0;
  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
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

const ListActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const ListBtn = styled.button`
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
  max-width: ${poolsMyPositions.contentW};
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: ${poolsMyPositions.cardGap};
  min-width: 0;

  @media (max-width: ${poolsMyPositions.tabletBreak}) {
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${poolsMyPositions.cardGap};
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
  max-width: ${poolsMyPositions.cardW};
  height: ${poolsMyPositions.cardH};
  border-radius: ${poolsMyPositions.cardRadius};
  border: ${poolsMyPositions.cardBorder};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;
  box-sizing: border-box;

  @media (max-width: ${poolsMyPositions.tabletBreak}) {
    max-width: none;
    min-width: 250px;
  }

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    width: 100%;
    height: ${poolsMyPositions.mobileCardMinH};
  }

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

const StateButton = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: ${poolsMyPositions.touchMin};
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.16);
  color: ${poolsMyPositions.gold};
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 700;

  &:focus-visible {
    outline: ${poolsMyPositions.focusRing};
    outline-offset: ${poolsMyPositions.focusOffset};
  }
`

const Disclosure = styled.p`
  margin: 0 0 8px;
  font-size: 11px;
  line-height: 15px;
  color: rgba(224, 184, 90, 0.95);
`

const AdvisorSlot = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
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

const ConnectWrap = styled.div`
  button {
    min-height: ${poolsMyPositions.touchMin};
    height: 40px;
    padding: 0 18px;
    border-radius: 10px;
    border: 1px solid rgba(244, 196, 48, 0.45) !important;
    background: rgba(244, 196, 48, 0.16) !important;
    color: ${poolsMyPositions.gold} !important;
    font-weight: 700;
  }
`

function PoolListRow({ position }: { position: PoolsWalletPosition }) {
  const { requestModal } = usePoolsRuntime()
  const claim = (position.actions ?? []).find((a) => a.kind === 'claim' && a.enabled && a.modalAction)
  const manage = (position.actions ?? []).find(
    (a) => (a.kind === 'manage' || a.kind === 'withdraw' || a.kind === 'stake') && a.enabled && a.modalAction,
  )
  return (
    <ListRow data-testid="pools-my-position-list-row">
      <ListCell>
        <ListLabel>Pair</ListLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>
            <PoolTokenIcon
              symbol={position.stakeToken.symbol}
              address={position.stakeToken.address ?? undefined}
              chainId={position.stakeToken.chainId ?? undefined}
              size={24}
            />
            {position.rewardToken.symbol && position.rewardToken.symbol !== position.stakeToken.symbol ? (
              <span style={{ marginLeft: -8, display: 'inline-flex' }}>
                <PoolTokenIcon
                  symbol={position.rewardToken.symbol}
                  address={position.rewardToken.address ?? undefined}
                  chainId={position.rewardToken.chainId ?? undefined}
                  size={20}
                />
              </span>
            ) : null}
          </span>
          <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{position.title}</strong>
        </div>
      </ListCell>
      <ListCell>
        <ListLabel>TVL / Staked</ListLabel>
        {position.stakedValue || position.stakedFormatted || '—'}
      </ListCell>
      <ListCell>
        <ListLabel>APR</ListLabel>
        {position.sourceCard?.sustainableAprDisplay || position.sourceCard?.apr || '—'}
      </ListCell>
      <ListCell>
        <ListLabel>Rewards</ListLabel>
        {position.claimableFormatted || position.rewardToken?.symbol || '—'}
      </ListCell>
      <ListCell>
        <ListLabel>Duration</ListLabel>
        {position.sourceCard?.estimatedDuration || position.sourceCard?.lockPeriod || '—'}
      </ListCell>
      <ListCell>
        <ListLabel>Status</ListLabel>
        {position.statusLabel}
      </ListCell>
      <ListCell>
        <ListActions>
          <ListBtn
            type="button"
            disabled={!claim}
            onClick={() => claim?.modalAction && requestModal(position.sourceCard, claim.modalAction)}
          >
            Claim
          </ListBtn>
          <ListBtn
            type="button"
            disabled={!manage}
            onClick={() => manage?.modalAction && requestModal(position.sourceCard, manage.modalAction)}
          >
            Manage
          </ListBtn>
        </ListActions>
      </ListCell>
    </ListRow>
  )
}

export const PoolsMyPositionsModule: React.FC<{ variant?: 'default' | 'with-create-side' }> = ({
  variant = 'default',
}) => {
  const vm = usePoolsWalletPositions()
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const hideAdvisor = variant === 'with-create-side'

  const limit = 3
  const shown = useMemo(() => {
    if (expanded) return vm.positions
    return vm.visiblePositions.slice(0, limit)
  }, [expanded, vm.positions, vm.visiblePositions])
  const canExpand = (vm.totalCount ?? vm.positions.length) > limit

  // Never render empty / disconnected — avoid giant empty module.
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
              <ViewToggle role="group" aria-label="My Positions view mode">
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
                data-testid="pools-view-all-my-positions"
                onClick={() => {
                  setExpanded((v) => !v)
                  if (expanded) setViewMode('cards')
                }}
                aria-label={expanded ? 'Show fewer pool positions' : 'View all my positions'}
              >
                {expanded ? 'Show less' : 'View all my positions'}
              </ViewAll>
            ) : null}
          </HeaderActions>
        </Header>

        <Body>
          {vm.moduleDisclosure ? <Disclosure>{vm.moduleDisclosure}</Disclosure> : null}

          {vm.state === 'loading' ? (
            <CardGrid aria-busy="true" aria-label="Loading pool positions" data-testid="pools-my-positions-loading">
              {[0, 1, 2].map((i) => (
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
                {shown.map((position) => (
                  <PoolListRow key={position.positionId} position={position} />
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

      {!hideAdvisor ? (
        <AdvisorSlot data-pools-module-006-slot="reserved" aria-hidden="true" title="Reserved for Module 006" />
      ) : null}
    </Row>
  )
}

export default PoolsMyPositionsModule
