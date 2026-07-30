/**
 * POOLS_MODULE_003 — My Positions (left 936×360) + reserved Advisor slot (424).
 * Does not modify Modules 001–002. Does not mount Modules 004–010 content.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import { usePoolsWalletPositions } from './usePoolsWalletPositions'
import { PoolsMyPositionCard } from './PoolsMyPositionCard'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Row = styled.section<{ $solo?: boolean }>`
  width: 100%;
  max-width: ${poolsMyPositions.contentMax};
  /* Parent Content gap 32px → 16px after Overview KPIs */
  margin-top: -16px;
  box-sizing: border-box;
  display: grid;
  /* 936:424 ratio — exact at 1376; scales on narrower desktop */
  grid-template-columns: ${({ $solo }) => ($solo ? '1fr' : 'minmax(0, 2.207547fr) minmax(0, 1fr)')};
  column-gap: ${poolsMyPositions.columnGap};
  align-items: start;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsMyPositions.tabletBreak}) {
    grid-template-columns: 1fr;
    row-gap: 16px;
  }

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    max-width: none;
    margin-top: -16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Surface = styled.div<{ $solo?: boolean }>`
  width: 100%;
  max-width: ${({ $solo }) => ($solo ? '100%' : poolsMyPositions.leftW)};
  height: auto;
  min-height: ${poolsMyPositions.moduleH};
  box-sizing: border-box;
  border-radius: ${poolsMyPositions.moduleRadius};
  border: ${poolsMyPositions.moduleBorder};
  background: ${poolsMyPositions.moduleBg};
  box-shadow: ${poolsMyPositions.moduleShadow};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
  justify-self: stretch;

  @media (max-width: ${poolsMyPositions.tabletBreak}) {
    max-width: none;
    height: auto;
    min-height: ${poolsMyPositions.moduleH};
  }

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    width: 100%;
    height: auto;
    min-height: 0;
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

const ViewAll = styled.button`
  appearance: none;
  cursor: pointer;
  width: ${poolsMyPositions.viewAllW};
  height: ${poolsMyPositions.viewAllH};
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 650;
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
  width: 100%;
  max-width: ${poolsMyPositions.rightSlotW};
  height: ${poolsMyPositions.moduleH};
  box-sizing: border-box;
  border-radius: ${poolsMyPositions.moduleRadius};
  border: 1px dashed rgba(255, 255, 255, 0.06);
  background: transparent;
  min-width: 0;
  justify-self: stretch;

  @media (max-width: ${poolsMyPositions.tabletBreak}) {
    display: none;
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

export const PoolsMyPositionsModule: React.FC<{ variant?: 'default' | 'with-create-side' }> = ({
  variant = 'default',
}) => {
  const vm = usePoolsWalletPositions()
  const { setPortfolioViewMode, setPoolTab } = usePoolsRuntime()
  const hideAdvisor = variant === 'with-create-side'

  const onViewAll = () => {
    setPortfolioViewMode('MY_POOLS')
    setPoolTab('positions')
    const el = document.querySelector('[data-ps-pool-explorer]')
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const onExplore = () => {
    setPortfolioViewMode('ALL')
    setPoolTab('all')
    const el = document.querySelector('[data-ps-pool-explorer]')
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Row
      $solo={hideAdvisor}
      data-testid="pools-my-positions-module"
      data-pools-module="003"
      data-pools-module-003="mounted"
      data-module-state={vm.state}
      aria-labelledby="pools-my-positions-title"
    >
      <Surface $solo={hideAdvisor} data-pools-my-positions-surface="true">
        <Header>
          <TitleRow>
            <Title id="pools-my-positions-title">My Positions</Title>
            {vm.showCountBadge && vm.totalCount != null ? (
              <CountBadge aria-label={`${vm.totalCount} positions`}>{vm.totalCount}</CountBadge>
            ) : null}
          </TitleRow>
          {vm.showViewAll ? (
            <ViewAll type="button" onClick={onViewAll} aria-label="View all pool positions">
              View all positions
            </ViewAll>
          ) : null}
        </Header>

        <Body>
          {vm.moduleDisclosure ? <Disclosure>{vm.moduleDisclosure}</Disclosure> : null}

          {vm.state === 'disconnected' ? (
            <CenterState data-testid="pools-my-positions-disconnected">
              <StateTitle>Connect your wallet to view pool positions</StateTitle>
              <ConnectWrap>
                <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton>
              </ConnectWrap>
            </CenterState>
          ) : null}

          {vm.state === 'loading' ? (
            <CardGrid aria-busy="true" aria-label="Loading pool positions" data-testid="pools-my-positions-loading">
              {[0, 1, 2].map((i) => (
                <CardItem key={i}>
                  <SkeletonCard data-testid="pools-my-positions-skeleton" />
                </CardItem>
              ))}
            </CardGrid>
          ) : null}

          {vm.state === 'empty' ? (
            <CenterState data-testid="pools-my-positions-empty">
              <StateTitle>No pool positions yet</StateTitle>
              <StateDesc>Stake in an available pool to start earning rewards.</StateDesc>
              <StateButton type="button" onClick={onExplore}>
                Explore Pools
              </StateButton>
            </CenterState>
          ) : null}

          {vm.state === 'unavailable' ? (
            <CenterState data-testid="pools-my-positions-unavailable">
              <StateTitle>Pool positions are temporarily unavailable</StateTitle>
              <StateDesc>Your funds are not represented as zero. Try again later.</StateDesc>
            </CenterState>
          ) : null}

          {vm.state === 'ready' || vm.state === 'partial' || vm.state === 'stale' ? (
            <CardGrid data-testid="pools-my-positions-grid">
              {vm.visiblePositions.map((position) => (
                <CardItem key={position.positionId}>
                  <PoolsMyPositionCard position={position} />
                </CardItem>
              ))}
            </CardGrid>
          ) : null}
        </Body>

        <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
      </Surface>

      {!hideAdvisor ? (
        <AdvisorSlot
          data-pools-module-006-slot="reserved"
          aria-hidden="true"
          title="Reserved for Module 006"
        />
      ) : null}
    </Row>
  )
}

export default PoolsMyPositionsModule
