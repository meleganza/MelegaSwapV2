/**
 * POOLS_MODULE_005 — Finished Pools (wallet-scoped ended archive).
 * Does not modify Modules 001–004. Does not mount Modules 006–010.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { poolsFinished } from './poolsFinishedPoolsTokens'
import { usePoolsFinishedPools } from './usePoolsFinishedPools'
import { PoolsFinishedPoolCard } from './PoolsFinishedPoolCard'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${poolsFinished.contentMax};
  margin-top: -16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsFinished.mobileBreak}) {
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
  gap: 10px;
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
  color: ${poolsFinished.gold};
  font-size: 11px;
  font-weight: 700;
`

const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${poolsFinished.cardGap};
  min-width: 0;

  @media (max-width: ${poolsFinished.tabletBreak}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${poolsFinished.mobileBreak}) {
    grid-template-columns: 1fr;
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
  max-width: ${poolsFinished.cardW};
  height: ${poolsFinished.cardH};
  border-radius: ${poolsFinished.cardRadius};
  border: ${poolsFinished.cardBorder};
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

const ConnectWrap = styled.div`
  button {
    min-height: ${poolsFinished.touchMin};
    height: 40px;
    padding: 0 18px;
    border-radius: 10px;
    border: 1px solid rgba(244, 196, 48, 0.45) !important;
    background: rgba(244, 196, 48, 0.16) !important;
    color: ${poolsFinished.gold} !important;
    font-weight: 700;
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

export const PoolsFinishedPoolsModule: React.FC = () => {
  const vm = usePoolsFinishedPools()

  return (
    <Module
      data-testid="pools-finished-pools-module"
      data-pools-module="005"
      data-pools-module-005="mounted"
      data-module-state={vm.state}
      aria-labelledby="pools-finished-pools-title"
    >
      <Header>
        <Title id="pools-finished-pools-title">Finished Pools</Title>
        {vm.showCountBadge && vm.totalCount != null ? (
          <Count aria-label={`${vm.totalCount} finished positions`}>{vm.totalCount}</Count>
        ) : null}
      </Header>

      {vm.state === 'disconnected' ? (
        <Empty data-testid="pools-finished-disconnected">
          <EmptyTitle>Connect your wallet to view finished pool positions</EmptyTitle>
          <ConnectWrap>
            <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton>
          </ConnectWrap>
        </Empty>
      ) : null}

      {vm.state === 'loading' ? (
        <Grid aria-busy="true" aria-label="Loading finished pools" data-testid="pools-finished-loading">
          {[0, 1, 2].map((i) => (
            <Item key={i}>
              <Skeleton data-testid="pools-finished-skeleton" />
            </Item>
          ))}
        </Grid>
      ) : null}

      {vm.state === 'empty' ? (
        <Empty data-testid="pools-finished-empty">
          <EmptyTitle>No finished pool positions</EmptyTitle>
          <EmptyDesc>You have no historical staking positions requiring action.</EmptyDesc>
        </Empty>
      ) : null}

      {vm.state === 'unavailable' ? (
        <Empty data-testid="pools-finished-unavailable">
          <EmptyTitle>Finished pools are temporarily unavailable</EmptyTitle>
          <EmptyDesc>Your funds are not represented as zero. Try again later.</EmptyDesc>
        </Empty>
      ) : null}

      {vm.state === 'ready' ? (
        <Grid data-testid="pools-finished-grid">
          {vm.pools.map((pool) => (
            <Item key={pool.positionId}>
              <PoolsFinishedPoolCard pool={pool} />
            </Item>
          ))}
        </Grid>
      ) : null}

      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Module>
  )
}

export default PoolsFinishedPoolsModule
