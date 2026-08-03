/**
 * LIQUIDITY_MODULE_002_ACTIONS — primary workspace (IA redesign).
 * Two 50/50 expanded action surfaces: Add Liquidity form + AI Liquidity Builder.
 * Presentation composition only — reuses existing mint runtime + LB card.
 * P0: AI Liquidity Builder is BETA / BNB Chain only — hidden on unsupported chains.
 */
import React from 'react'
import styled from 'styled-components'
import { LiquidityAddModule } from './LiquidityAddModule'
import { LiquidityBuildingCard } from '../onePage/LiquidityBuildingCard'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { LIQUIDITY_ACTIONS_COPY, liquidityActions } from './liquidityActionsTokens'

const LB_SUPPORTED_CHAIN_ID = 56

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityActions.contentMax};
  margin: ${liquidityActions.gapAfterHero} auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding: 0;

  @media (max-width: ${liquidityActions.tabletBreak}) {
    padding: 0 16px;
  }
`

const Grid = styled.div<{ $single?: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ $single }) => ($single ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)')};
  column-gap: ${liquidityActions.columnGap};
  row-gap: ${liquidityActions.columnGap};
  align-items: stretch;
  min-width: 0;

  @media (max-width: ${liquidityActions.twoColMin}) {
    grid-template-columns: 1fr;
  }
`

const Pane = styled.article`
  width: 100%;
  max-width: ${liquidityActions.cardW};
  min-height: ${liquidityActions.cardMinH};
  height: 100%;
  box-sizing: border-box;
  margin: 0;
  border-radius: ${liquidityActions.cardRadius};
  border: ${liquidityActions.cardBorder};
  background: ${liquidityActions.cardBg};
  padding: ${liquidityActions.cardPad};
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
`

const PaneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  flex: 0 0 auto;
`

const PaneTitle = styled.h2`
  margin: 0;
  font-size: ${liquidityActions.titleSize};
  line-height: ${liquidityActions.titleLine};
  font-weight: ${liquidityActions.titleWeight};
  color: ${liquidityActions.titleColor};
  letter-spacing: -0.02em;
`

const BadgeRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
`

/** Compact purple BETA — replaces NEW for release-readiness P0. */
const BetaBadge = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 14px;
  padding: 0 5px;
  border-radius: 999px;
  background: ${uxRebuildColors.newViolet};
  color: #ffffff;
  font-size: 8px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`

const ChainBadge = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 14px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(243, 186, 47, 0.18);
  color: #f3ba2f;
  font-size: 8px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
`

const FormSlot = styled.div`
  min-width: 0;
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;

  /* Collapse nested Add module chrome so the pane is the card. */
  [data-liquidity-module='004-add-liquidity'] {
    margin: 0 !important;
    max-width: none !important;
    padding: 0 !important;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }

  /* Builder fills the right pane without fixed 672 desktop lock. */
  [data-testid='liq-building-card'] {
    width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    max-height: none !important;
    flex: 1 1 auto;
  }
`

export const LiquidityActionsModule: React.FC = () => {
  const { chainId } = useActiveChainId()
  const lbSupported = (chainId ?? LB_SUPPORTED_CHAIN_ID) === LB_SUPPORTED_CHAIN_ID

  return (
    <Shell
      data-testid="liquidity-actions-module"
      data-liquidity-module="002-actions"
      data-liquidity-module-002="mounted"
      data-liquidity-actions-ia="expanded-workspace"
      data-lb-chain-gated={lbSupported ? 'bnb' : 'hidden'}
      aria-label={LIQUIDITY_ACTIONS_COPY.sectionLabel}
    >
      <Grid
        data-testid="liquidity-actions-grid"
        data-liquidity-actions-geometry={lbSupported ? '1376-24-50-50' : 'single-manual'}
        $single={!lbSupported}
      >
        <Pane data-testid="liquidity-actions-manual" data-liquidity-action="manual">
          <PaneHeader>
            <PaneTitle>{LIQUIDITY_ACTIONS_COPY.manual.title}</PaneTitle>
          </PaneHeader>
          <FormSlot data-testid="liquidity-actions-manual-form">
            <LiquidityAddModule embedded />
          </FormSlot>
        </Pane>

        {lbSupported ? (
          <Pane data-testid="liquidity-actions-ai" data-liquidity-action="ai-builder">
            <PaneHeader>
              <PaneTitle>{LIQUIDITY_ACTIONS_COPY.aiBuilder.title}</PaneTitle>
              <BadgeRow>
                <BetaBadge data-testid="liquidity-actions-ai-beta-badge">BETA</BetaBadge>
                <ChainBadge data-testid="liquidity-actions-ai-bnb-badge">BNB Chain only</ChainBadge>
              </BadgeRow>
            </PaneHeader>
            <FormSlot data-testid="liquidity-actions-ai-form">
              <LiquidityBuildingCard forceExpanded />
            </FormSlot>
          </Pane>
        ) : null}
      </Grid>
    </Shell>
  )
}

export default LiquidityActionsModule
