/**
 * Phase 1 homepage — Swap is the only above-fold action.
 * Does not mount farm, pool, or AMM indexer producers.
 * Bridge, liquidity, Boost, listing, projects, and withdrawal paths stay as links.
 */
import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { preserveEarlyNavigation } from 'lib/navigation/preserveEarlyNavigation'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import HomeSwapPanel from './HomeSwapPanel'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  min-width: 0;
`

const Content = styled.div`
  width: min(440px, 100%);
  margin: 0 auto;
  padding: 8px 0 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const VisuallyHidden = styled.h1`
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

const SwapStage = styled.section`
  min-width: 0;
`

const LinkRow = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`

const TextLink = styled(Link).attrs({ prefetch: false })`
  min-height: 44px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${uxRebuildColors.secondary};
  text-decoration: none;
  font-size: 13px;
  font-weight: 650;
  line-height: 1;

  &:hover,
  &:focus-visible {
    color: ${uxRebuildColors.text};
    border-color: rgba(221, 185, 47, 0.45);
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const WithdrawLabel = styled.p`
  margin: 0;
  text-align: center;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
`

const RadicalHomeScreen: React.FC = () => (
  <Root data-radical-home data-testid="radical-home">
    <PageMeta />
    <HomeTradeGlobalStyle />
    <Content>
      <VisuallyHidden>Swap</VisuallyHidden>
      <DataSurfaceErrorBoundary surface="Homepage Swap">
        <SwapStage id="swap" data-home-section="swap" data-testid="dex-home-instant-swap">
          <HomeSwapPanel />
        </SwapStage>
      </DataSurfaceErrorBoundary>
      <LinkRow aria-label="More ways to use Melega">
        <TextLink href="/bridge" data-testid="home-discover-bridge" onClick={(event) => preserveEarlyNavigation(event, '/bridge')}>
          Bridge MARCO
        </TextLink>
        <TextLink
          href="/liquidity"
          data-testid="home-discover-liquidity"
          onClick={(event) => preserveEarlyNavigation(event, '/liquidity')}
        >
          Liquidity
        </TextLink>
        <TextLink
          href="/list#trend-boost"
          data-testid="home-discover-boost"
          onClick={(event) => preserveEarlyNavigation(event, '/list#trend-boost')}
        >
          Boost
        </TextLink>
        <TextLink href="/list" data-testid="home-discover-list" onClick={(event) => preserveEarlyNavigation(event, '/list')}>
          List
        </TextLink>
        <TextLink
          href="/projects"
          data-testid="home-discover-projects"
          onClick={(event) => preserveEarlyNavigation(event, '/projects')}
        >
          Projects
        </TextLink>
      </LinkRow>
      <div>
        <WithdrawLabel>Withdraw</WithdrawLabel>
        <LinkRow aria-label="Withdrawal paths">
          <TextLink
            href="/liquidity-studio?view=remove"
            data-testid="home-withdraw-lp"
            onClick={(event) => preserveEarlyNavigation(event, '/liquidity-studio?view=remove')}
          >
            Remove liquidity
          </TextLink>
          <TextLink
            href="/farms?view=my"
            data-testid="home-withdraw-farms"
            onClick={(event) => preserveEarlyNavigation(event, '/farms?view=my')}
          >
            Farm positions
          </TextLink>
          <TextLink
            href="/pools?view=positions"
            data-testid="home-withdraw-pools"
            onClick={(event) => preserveEarlyNavigation(event, '/pools?view=positions')}
          >
            Pool positions
          </TextLink>
        </LinkRow>
      </div>
    </Content>
  </Root>
)

export default RadicalHomeScreen
