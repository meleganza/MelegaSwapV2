/**
 * FARMS_MODULE_005 — Finished Farms (wallet-scoped recovery archive).
 * Does not modify Modules 001–004. Does not mount Modules 006–010.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { farmsFinished } from './farmsFinishedFarmsTokens'
import { useFinishedFarmPositions } from './useFarmsFinishedFarms'
import { FarmsFinishedFarmCard } from './FarmsFinishedFarmCard'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${farmsFinished.contentMax};
  margin-top: -16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${farmsFinished.mobileBreak}) {
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
  min-height: ${farmsFinished.headerH};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${farmsFinished.titleSize};
  line-height: ${farmsFinished.titleLine};
  font-weight: ${farmsFinished.titleWeight};
  color: ${farmsFinished.titleColor};
`

const Support = styled.p`
  margin: 0;
  font-size: ${farmsFinished.supportSize};
  line-height: ${farmsFinished.supportLine};
  color: ${farmsFinished.supportColor};
`

const Count = styled.span`
  font-size: ${farmsFinished.countSize};
  line-height: 15px;
  color: ${farmsFinished.supportColor};
  font-weight: 600;
`

const HistoryLink = styled.a`
  font-size: 12px;
  font-weight: 650;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  min-height: ${farmsFinished.touchMin};
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);

  &:focus-visible {
    outline: ${farmsFinished.focusRing};
    outline-offset: ${farmsFinished.focusOffset};
  }
`

const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, ${farmsFinished.cardW});
  column-gap: ${farmsFinished.cardGapX};
  row-gap: ${farmsFinished.cardGapY};
  min-width: 0;
  justify-content: start;

  @media (max-width: ${farmsFinished.tabletBreak}) {
    grid-template-columns: repeat(2, minmax(${farmsFinished.tabletMinCardW}, 1fr));
    column-gap: 16px;
  }

  @media (max-width: ${farmsFinished.mobileBreak}) {
    grid-template-columns: 1fr;
    row-gap: ${farmsFinished.mobileCardGap};
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
  max-width: ${farmsFinished.cardW};
  height: ${farmsFinished.cardH};
  border-radius: ${farmsFinished.cardRadius};
  border: ${farmsFinished.cardBorder};
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const EmptyTitle = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #f5f5f5;
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  max-width: 420px;
`

const ExploreLink = styled.a`
  height: 40px;
  min-height: ${farmsFinished.touchMin};
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.16);
  color: ${farmsFinished.gold};
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:focus-visible {
    outline: ${farmsFinished.focusRing};
    outline-offset: ${farmsFinished.focusOffset};
  }
`

const Disclosure = styled.p`
  margin: 0;
  font-size: 11px;
  color: rgba(224, 184, 90, 0.95);
`

const ConnectWrap = styled.div`
  button {
    min-height: ${farmsFinished.touchMin};
    height: 40px;
    padding: 0 18px;
    border-radius: 10px;
    border: 1px solid rgba(244, 196, 48, 0.45) !important;
    background: rgba(244, 196, 48, 0.16) !important;
    color: ${farmsFinished.gold} !important;
    font-weight: 700;
  }
`

const Retry = styled.button`
  appearance: none;
  cursor: pointer;
  margin-top: 4px;
  min-height: ${farmsFinished.touchMin};
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.14);
  color: ${farmsFinished.gold};
  font-size: 13px;
  font-weight: 700;

  &:focus-visible {
    outline: ${farmsFinished.focusRing};
    outline-offset: ${farmsFinished.focusOffset};
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

export const FarmsFinishedFarmsModule: React.FC = () => {
  const vm = useFinishedFarmPositions()
  const showCount = vm.showCountBadge && vm.totalCount != null && vm.totalCount > 0

  return (
    <Module
      id="finished-farms"
      data-testid="farms-finished-farms-module"
      data-farms-module-005="mounted"
      data-module-state={vm.state}
      aria-labelledby="farms-finished-farms-title"
    >
      <Header>
        <TitleBlock>
          <TitleRow>
            <Title id="farms-finished-farms-title">Finished Farms</Title>
            {showCount ? (
              <Count aria-label={`${vm.totalCount} positions requiring attention`}>
                {vm.totalCount} positions requiring attention
              </Count>
            ) : null}
          </TitleRow>
          <Support>Historical farm positions that may still require action.</Support>
        </TitleBlock>
        {vm.historyHref ? (
          <HistoryLink href={vm.historyHref}>Show closed history</HistoryLink>
        ) : null}
      </Header>

      {vm.moduleDisclosure ? <Disclosure role="status">{vm.moduleDisclosure}</Disclosure> : null}

      {vm.state === 'disconnected' ? (
        <Empty data-testid="farms-finished-disconnected">
          <EmptyTitle>Connect your wallet to review finished farms</EmptyTitle>
          <EmptyDesc>Ended farm positions and recovery actions are wallet-specific.</EmptyDesc>
          <ConnectWrap>
            <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton>
          </ConnectWrap>
        </Empty>
      ) : null}

      {vm.state === 'loading' ? (
        <Grid aria-busy="true" aria-label="Loading finished farms" data-testid="farms-finished-loading">
          {[0, 1, 2].map((i) => (
            <Item key={i}>
              <Skeleton data-testid="farms-finished-skeleton" />
            </Item>
          ))}
        </Grid>
      ) : null}

      {vm.state === 'empty' ? (
        <Empty data-testid="farms-finished-empty">
          <EmptyTitle>No finished farm positions</EmptyTitle>
          <EmptyDesc>You have no ended farming positions requiring action.</EmptyDesc>
          <ExploreLink href="#explore-farms">Explore Active Farms</ExploreLink>
        </Empty>
      ) : null}

      {vm.state === 'unavailable' ? (
        <Empty data-testid="farms-finished-unavailable">
          <EmptyTitle>Finished farms are temporarily unavailable</EmptyTitle>
          <EmptyDesc>Your historical positions are not represented as zero.</EmptyDesc>
          <Retry type="button" onClick={() => window.location.reload()}>
            Retry
          </Retry>
        </Empty>
      ) : null}

      {vm.state === 'ready' || vm.state === 'partial' || vm.state === 'stale' ? (
        <Grid data-testid="farms-finished-grid">
          {vm.positions.map((position) => (
            <Item key={position.positionId}>
              <FarmsFinishedFarmCard position={position} />
            </Item>
          ))}
        </Grid>
      ) : null}

      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Module>
  )
}

export default FarmsFinishedFarmsModule
