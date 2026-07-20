/**
 * Command Center premium portfolio composition (R791D.4C/4F/4G).
 *
 * Implements hierarchy with existing primitives + portfolio/intelligence data.
 * Premium clarity — no new visual language, no fabricated values.
 */

import React from 'react'
import styled from 'styled-components'
import type {
  PortfolioPosition,
  PortfolioPositionAction,
  PortfolioSummary,
  WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import type { PortfolioViewType } from 'lib/wallet-portfolio/viewEngine'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'
import type {
  PortfolioIntelligenceActionItem,
  PortfolioIntelligenceModel,
} from '../commandCenterRuntime/portfolioIntelligence'
import {
  ActionItem,
  ActionItemRow,
  MetricBlock,
  MetricBlockRow,
  PortfolioSection,
  PositionGroup,
  SectionHeader,
} from './commandCenterVisualFoundation'
import { MyPositionsSection, type MyPositionsSectionProps } from './MyPositionsSection'
import {
  PORTFOLIO_VIEW_LABEL,
  type PortfolioViewSelectorModel,
} from '../commandCenterRuntime/commandCenterPortfolioCutover'

/** Action types allowed in Action Center — must already exist on the position/intelligence. */
const PRIORITY_ACTION_TYPES = new Set([
  'CLAIM',
  'HARVEST',
  'WITHDRAW',
  'REMOVE_LIQUIDITY',
  'APPROVE',
])

export interface PriorityItem {
  id: string
  positionId: string
  title: string
  action: PortfolioPositionAction
  requiresAttention: boolean
  reason?: string | null
}

function collectPositionActions(position: PortfolioPosition): PortfolioPositionAction[] {
  const out: PortfolioPositionAction[] = []
  const push = (a: PortfolioPositionAction | null | undefined) => {
    if (!a || a.type === 'NONE') return
    out.push(a)
  }
  push(position.actions?.primary)
  for (const a of position.actions?.secondary ?? []) push(a)
  push(position.actions?.open)
  push(position.actions?.manage)
  push(position.actions?.analytics)
  push(position.recommendedAction)
  return out
}

/** Presentation prep — only surfaces canonical priority action types already on positions. */
export function buildTodaysPriorities(positions: readonly PortfolioPosition[]): PriorityItem[] {
  const items: PriorityItem[] = []
  for (const position of positions) {
    const seen = new Set<string>()
    const actions = collectPositionActions(position).filter((a) => {
      if (a.enabled !== true || !PRIORITY_ACTION_TYPES.has(a.type)) return false
      const key = `${a.type}:${a.label}:${a.route ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    if (!position.requiresAttention && actions.length === 0) continue
    for (const action of actions) {
      items.push({
        id: `${position.positionId}:${action.type}:${action.label}`,
        positionId: position.positionId,
        title: position.title,
        action,
        requiresAttention: position.requiresAttention === true,
        reason: position.reason,
      })
    }
  }
  return items
}

/** Prefer intelligence action items when provided — no invented actions. */
export function resolveActionCenterItems(
  positions: readonly PortfolioPosition[],
  actionItems?: readonly PortfolioIntelligenceActionItem[] | null,
): PriorityItem[] {
  if (actionItems && actionItems.length > 0) {
    return actionItems
      .filter((item) => PRIORITY_ACTION_TYPES.has(item.action.type) && item.action.enabled === true)
      .map((item) => ({
        id: item.id,
        positionId: item.positionId,
        title: item.positionTitle,
        action: item.action,
        requiresAttention: false,
        reason: item.reason,
      }))
  }
  return buildTodaysPriorities(positions)
}

const HeroIdentity = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${commandCenterColors.label};
  margin-bottom: 8px;
`

const HeroWallet = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  color: ${commandCenterColors.white};
  margin-bottom: 16px;
  word-break: break-all;
`

const StateRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 16px;
  min-width: 0;
`

const StateChip = styled.span<{ $tone?: 'attention' | 'claimable' | 'neutral' }>`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'attention'
        ? commandCenterColors.gold
        : $tone === 'claimable'
          ? commandCenterColors.green
          : commandCenterColors.cardBorder};
  background: ${commandCenterColors.cardBg};
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.white};
`

const ChipLabel = styled.span`
  color: ${commandCenterColors.muted};
`

const EmptyState = styled.div`
  padding: 24px 18px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  color: ${commandCenterColors.body};
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
`

const FilterShell = styled.div`
  width: 100%;
  min-width: 0;
  margin-bottom: 8px;
`

const FilterPrompt = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  color: ${commandCenterColors.muted};
  margin-bottom: 12px;
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
`

const ViewChip = styled.button<{ $active?: boolean }>`
  appearance: none;
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) => ($active ? commandCenterColors.gold : commandCenterColors.cardBorder)};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.12)' : commandCenterColors.cardBg)};
  color: ${commandCenterColors.white};
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
`

const CountMeta = styled.span`
  font-weight: 500;
  color: ${commandCenterColors.muted};
  margin-left: 4px;
`

function formatUsd(value: string | null | undefined): string {
  if (value == null || String(value).trim() === '') return 'Unavailable'
  return String(value)
}

function shortenWallet(wallet: string | null): string {
  if (!wallet) return ''
  const w = wallet.trim()
  if (w.length <= 12) return w
  return `${w.slice(0, 6)}…${w.slice(-4)}`
}

/** 1. Portfolio Hero — identity + summary + attention/claimable (LEVEL 1). */
export function PortfolioHero({
  portfolio,
  walletConnected,
  intelligence,
}: {
  portfolio: WalletPortfolio
  walletConnected: boolean
  intelligence?: PortfolioIntelligenceModel | null
}) {
  const summary: PortfolioSummary = portfolio.summary
  const attentionCount = intelligence?.summary.attentionCount ?? summary.attentionPositionCount
  const claimableCount = intelligence?.summary.claimableCount ?? 0
  const hasClaimableValue = summary.claimableValueUsd != null && String(summary.claimableValueUsd).trim() !== ''

  if (!walletConnected) {
    return (
      <PortfolioSection center="PORTFOLIO_HERO" testId="portfolio-hero" state="WALLET_NOT_CONNECTED">
        <div data-testid="portfolio-summary-section" data-state="WALLET_NOT_CONNECTED">
          <SectionHeader title="Portfolio" subtitle="Connect a wallet to see your positions." />
          <EmptyState data-testid="portfolio-hero-empty">Wallet not connected.</EmptyState>
          <span data-testid="portfolio-summary-empty" hidden aria-hidden="true" />
        </div>
      </PortfolioSection>
    )
  }

  return (
    <PortfolioSection
      center="PORTFOLIO_HERO"
      testId="portfolio-hero"
      state="READY"
      data-cc-r791d-4g="hero"
    >
      <div
        data-testid="portfolio-summary-section"
        data-state="READY"
        data-attention={attentionCount > 0 ? 'true' : 'false'}
      >
        <SectionHeader title="Portfolio" subtitle="Wallet operating summary" />
        <HeroIdentity data-testid="portfolio-hero-label">PORTFOLIO</HeroIdentity>
        <HeroWallet data-testid="portfolio-hero-wallet">
          {portfolio.wallet ? shortenWallet(portfolio.wallet) : 'Wallet unavailable'}
        </HeroWallet>

        <StateRow data-testid="portfolio-hero-states" aria-label="Portfolio states">
          <StateChip
            $tone={attentionCount > 0 ? 'attention' : 'neutral'}
            data-testid="portfolio-hero-attention"
            data-count={attentionCount}
          >
            <ChipLabel>Attention</ChipLabel>
            <span>{attentionCount}</span>
          </StateChip>
          <StateChip
            $tone={hasClaimableValue || claimableCount > 0 ? 'claimable' : 'neutral'}
            data-testid="portfolio-hero-claimable-state"
            data-count={claimableCount}
          >
            <ChipLabel>Claimable</ChipLabel>
            <span>{hasClaimableValue ? formatUsd(summary.claimableValueUsd) : claimableCount}</span>
          </StateChip>
        </StateRow>

        <MetricBlockRow testId="portfolio-summary-grid">
          <MetricBlock
            label="Portfolio value"
            value={<span data-testid="summary-net-value">{formatUsd(summary.netValueUsd)}</span>}
          />
          <MetricBlock
            label="Claimables"
            value={
              <span data-testid="summary-claimable-value">{formatUsd(summary.claimableValueUsd)}</span>
            }
          />
          <MetricBlock
            label="Active positions"
            value={<span data-testid="summary-active-positions">{summary.activePositionCount}</span>}
          />
          <MetricBlock
            label="Actions required"
            value={<span data-testid="summary-pending-actions">{summary.pendingActionCount}</span>}
          />
        </MetricBlockRow>
        <span data-testid="summary-historical-positions" hidden aria-hidden="true">
          {summary.historicalPositionCount}
        </span>
      </div>
    </PortfolioSection>
  )
}

/**
 * 2. Action Center — canonical operational actions (LEVEL 2).
 * Source preference: PortfolioIntelligenceModel.actionItems.
 */
export function PortfolioActions({
  positions,
  walletConnected,
  actionItems,
}: {
  positions: readonly PortfolioPosition[]
  walletConnected: boolean
  actionItems?: readonly PortfolioIntelligenceActionItem[] | null
}) {
  const items = walletConnected ? resolveActionCenterItems(positions, actionItems) : []
  const state = !walletConnected ? 'WALLET_NOT_CONNECTED' : items.length ? 'READY' : 'EMPTY'

  return (
    <PortfolioSection center="ACTION_CENTER" testId="portfolio-actions" state={state}>
      <div data-testid="todays-priorities-section" data-state={state} data-cc-r791d-4g="actions">
        <SectionHeader title="Today's Actions" subtitle="Canonical operations requiring attention" />
        {!walletConnected ? (
          <EmptyState>Wallet not connected.</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState data-testid="todays-priorities-empty">No priorities right now.</EmptyState>
        ) : (
          <ActionItemRow testId="todays-priorities-list">
            {items.map((item) => (
              <ActionItem
                key={item.id}
                testId="priority-item"
                positionId={item.positionId}
                actionType={item.action.type}
                title={item.title}
                meta={[item.action.type, item.reason, item.requiresAttention ? 'attention' : null]
                  .filter(Boolean)
                  .join(' · ')}
                href={item.action.route}
                actionLabel={item.action.label}
                attention={item.requiresAttention}
              />
            ))}
          </ActionItemRow>
        )}
      </div>
    </PortfolioSection>
  )
}

/** Portfolio view selector — primary + secondary chips (not product page tabs). */
export function PortfolioViewSelector({
  model,
  onSelectView,
}: {
  model: PortfolioViewSelectorModel
  onSelectView?: (view: PortfolioViewType) => void
}) {
  return (
    <FilterShell
      data-testid="portfolio-view-selector"
      data-current-view={model.currentView}
      data-composition="portfolio-view-selector"
    >
      <FilterPrompt>How do I want to see my wallet?</FilterPrompt>
      <ChipRow data-testid="portfolio-view-primary">
        {model.primaryViews.map((view) => (
          <ViewChip
            key={view}
            type="button"
            $active={model.currentView === view}
            data-testid={`portfolio-view-${view}`}
            data-active={model.currentView === view ? 'true' : 'false'}
            onClick={() => onSelectView?.(view)}
          >
            {PORTFOLIO_VIEW_LABEL[view]}
            <CountMeta>{view === model.currentView ? model.count : ''}</CountMeta>
          </ViewChip>
        ))}
      </ChipRow>
      <ChipRow data-testid="portfolio-view-secondary" style={{ marginTop: 8 }}>
        {model.secondaryViews.map((view) => (
          <ViewChip
            key={view}
            type="button"
            $active={model.currentView === view}
            data-testid={`portfolio-view-${view}`}
            data-active={model.currentView === view ? 'true' : 'false'}
            onClick={() => onSelectView?.(view)}
          >
            {PORTFOLIO_VIEW_LABEL[view]}
          </ViewChip>
        ))}
      </ChipRow>
    </FilterShell>
  )
}

/** 3. Positions Center — My Positions via PositionCard groups (LEVEL 3). */
export function PositionsCenter({
  myPositions,
  viewSelector,
  onSelectView,
  walletConnected,
}: {
  myPositions: MyPositionsSectionProps
  viewSelector?: PortfolioViewSelectorModel
  onSelectView?: (view: PortfolioViewType) => void
  walletConnected: boolean
}) {
  return (
    <PortfolioSection center="POSITIONS_CENTER" testId="positions-center">
      <PositionGroup testId="positions-center-grid">
        {viewSelector ? <PortfolioViewSelector model={viewSelector} onSelectView={onSelectView} /> : null}
        {walletConnected && viewSelector?.empty ? (
          <div data-testid="my-positions-section" data-state="EMPTY" data-view={viewSelector.currentView}>
            <SectionHeader title="My Positions" />
            <EmptyState data-testid="portfolio-view-empty" data-view={viewSelector.currentView}>
              {viewSelector.emptyMessage}
            </EmptyState>
          </div>
        ) : (
          <MyPositionsSection {...myPositions} />
        )}
      </PositionGroup>
    </PortfolioSection>
  )
}
