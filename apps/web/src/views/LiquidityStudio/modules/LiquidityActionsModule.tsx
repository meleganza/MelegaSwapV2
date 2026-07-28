/**
 * LIQUIDITY_MODULE_002_ACTIONS — primary workspace (IA redesign).
 * Two 50/50 expanded action surfaces: Add Liquidity form + AI Liquidity Builder.
 * Presentation composition only — reuses existing mint runtime + LB card.
 */
import React from 'react'
import styled from 'styled-components'
import { LiquidityAddModule } from './LiquidityAddModule'
import { LiquidityBuildingCard } from '../onePage/LiquidityBuildingCard'
import { LIQUIDITY_ACTIONS_COPY, liquidityActions } from './liquidityActionsTokens'

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

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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

const NewBadge = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f4c430 0%, #ffd34d 100%);
  color: #111;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
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

export const LiquidityActionsModule: React.FC = () => (
  <Shell
    data-testid="liquidity-actions-module"
    data-liquidity-module="002-actions"
    data-liquidity-module-002="mounted"
    data-liquidity-actions-ia="expanded-workspace"
    aria-label={LIQUIDITY_ACTIONS_COPY.sectionLabel}
  >
    <Grid data-testid="liquidity-actions-grid" data-liquidity-actions-geometry="1376-24-50-50">
      <Pane data-testid="liquidity-actions-manual" data-liquidity-action="manual">
        <PaneHeader>
          <PaneTitle>{LIQUIDITY_ACTIONS_COPY.manual.title}</PaneTitle>
        </PaneHeader>
        <FormSlot data-testid="liquidity-actions-manual-form">
          <LiquidityAddModule embedded />
        </FormSlot>
      </Pane>

      <Pane data-testid="liquidity-actions-ai" data-liquidity-action="ai-builder">
        <PaneHeader>
          <PaneTitle>{LIQUIDITY_ACTIONS_COPY.aiBuilder.title}</PaneTitle>
          <NewBadge data-testid="liquidity-actions-ai-new-badge">New</NewBadge>
        </PaneHeader>
        <FormSlot data-testid="liquidity-actions-ai-form">
          <LiquidityBuildingCard forceExpanded />
        </FormSlot>
      </Pane>
    </Grid>
  </Shell>
)

export default LiquidityActionsModule
