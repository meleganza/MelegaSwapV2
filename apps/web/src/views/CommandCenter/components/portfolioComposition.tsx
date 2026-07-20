/**
 * Command Center visual portfolio composition foundation (R791D.4C).
 *
 * Information hierarchy only — Wallet Operating Center structure.
 * No font/color/shadow/spacing polish. No card redesign.
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
import {
  CC_FONT_BODY,
  commandCenterColors,
  commandCenterLayout,
  commandCenterType,
} from '../commandCenterTokens'
import { SectionHeading } from './canonical/commandCenterSpecPrimitives'
import {
  MyPositionsSection,
  type MyPositionsSectionProps,
} from './MyPositionsSection'
import {
  PORTFOLIO_VIEW_LABEL,
  type PortfolioViewSelectorModel,
} from '../commandCenterRuntime/commandCenterPortfolioCutover'

/** Action types allowed in Today's Actions — must already exist on the position. */
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
      })
    }
  }
  return items
}

const HeroShell = styled.section`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
`

const HeroIdentity = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.label};
  color: ${commandCenterColors.label};
  margin-bottom: 8px;
`

const HeroWallet = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
  color: ${commandCenterColors.muted};
  margin-bottom: 12px;
  word-break: break-all;
`

const HeroMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const HeroMetric = styled.div`
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  box-sizing: border-box;
`

const MetricLabel = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.label};
  color: ${commandCenterColors.label};
  margin-bottom: 6px;
`

const MetricValue = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 18px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  line-height: 1.2;
  word-break: break-word;
`

const EmptyState = styled.div`
  padding: 20px 16px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: ${commandCenterLayout.cardRadius};
  background: ${commandCenterColors.cardBg};
  color: ${commandCenterColors.body};
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
`

const ActionsRow = styled.section`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const ListItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  min-width: 0;
`

const ItemTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  color: ${commandCenterColors.white};
`

const ItemMeta = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};
`

const ActionLink = styled.a`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${commandCenterColors.gold};
  text-decoration: none;
`

const PositionsShell = styled.section`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
`

const PositionsGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FilterShell = styled.div`
  width: 100%;
  min-width: 0;
`

const FilterPrompt = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};
  margin-bottom: 10px;
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

/** 1. Portfolio Hero — identity from walletPortfolio.summary (+ wallet). */
export function PortfolioHero({
  portfolio,
  walletConnected,
}: {
  portfolio: WalletPortfolio
  walletConnected: boolean
}) {
  const summary: PortfolioSummary = portfolio.summary

  if (!walletConnected) {
    return (
      <HeroShell data-testid="portfolio-hero" data-composition="portfolio-hero" data-state="WALLET_NOT_CONNECTED">
        <section data-testid="portfolio-summary-section" data-state="WALLET_NOT_CONNECTED">
          <SectionHeading>Portfolio</SectionHeading>
          <EmptyState data-testid="portfolio-hero-empty">Wallet not connected.</EmptyState>
          <EmptyState data-testid="portfolio-summary-empty">Wallet not connected.</EmptyState>
        </section>
      </HeroShell>
    )
  }

  return (
    <HeroShell data-testid="portfolio-hero" data-composition="portfolio-hero" data-state="READY">
      <section data-testid="portfolio-summary-section" data-state="READY">
        <SectionHeading>Portfolio</SectionHeading>
        <HeroIdentity data-testid="portfolio-hero-label">PORTFOLIO</HeroIdentity>
        <HeroWallet data-testid="portfolio-hero-wallet">
          {portfolio.wallet ? shortenWallet(portfolio.wallet) : 'Wallet unavailable'}
        </HeroWallet>
        <HeroMetrics data-testid="portfolio-summary-grid" data-composition="hero-metrics">
          <HeroMetric>
            <MetricLabel>Portfolio value</MetricLabel>
            <MetricValue data-testid="summary-net-value">{formatUsd(summary.netValueUsd)}</MetricValue>
          </HeroMetric>
          <HeroMetric>
            <MetricLabel>Claimables</MetricLabel>
            <MetricValue data-testid="summary-claimable-value">{formatUsd(summary.claimableValueUsd)}</MetricValue>
          </HeroMetric>
          <HeroMetric>
            <MetricLabel>Active positions</MetricLabel>
            <MetricValue data-testid="summary-active-positions">{summary.activePositionCount}</MetricValue>
          </HeroMetric>
          <HeroMetric>
            <MetricLabel>Actions required</MetricLabel>
            <MetricValue data-testid="summary-pending-actions">{summary.pendingActionCount}</MetricValue>
          </HeroMetric>
        </HeroMetrics>
        <span data-testid="summary-historical-positions" hidden aria-hidden="true">
          {summary.historicalPositionCount}
        </span>
      </section>
    </HeroShell>
  )
}

/**
 * 2. Command Actions — Today's Actions from PortfolioPosition.actions / requiresAttention.
 * Only canonical types: Claim, Harvest, Withdraw, Remove Liquidity, Approve.
 */
export function PortfolioActions({
  positions,
  walletConnected,
}: {
  positions: readonly PortfolioPosition[]
  walletConnected: boolean
}) {
  const items = walletConnected ? buildTodaysPriorities(positions) : []

  return (
    <ActionsRow
      data-testid="portfolio-actions"
      data-composition="portfolio-actions"
      data-state={!walletConnected ? 'WALLET_NOT_CONNECTED' : items.length ? 'READY' : 'EMPTY'}
    >
      {/* Compatibility alias for prior priorities section tests */}
      <section
        data-testid="todays-priorities-section"
        data-state={!walletConnected ? 'WALLET_NOT_CONNECTED' : items.length ? 'READY' : 'EMPTY'}
      >
        <SectionHeading>Today&apos;s Actions</SectionHeading>
        {!walletConnected ? (
          <EmptyState>Wallet not connected.</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState data-testid="todays-priorities-empty">No priorities right now.</EmptyState>
        ) : (
          <List data-testid="todays-priorities-list">
            {items.map((item) => (
              <ListItem key={item.id} data-testid="priority-item" data-position-id={item.positionId} data-action-type={item.action.type}>
                <div>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemMeta>
                    {item.action.type}
                    {item.requiresAttention ? ' · attention' : ''}
                  </ItemMeta>
                </div>
                {item.action.route ? (
                  <ActionLink href={item.action.route} aria-label={item.action.label}>
                    {item.action.label}
                  </ActionLink>
                ) : (
                  <ItemMeta>{item.action.label}</ItemMeta>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </section>
    </ActionsRow>
  )
}

/** 4. Portfolio view selector — primary + secondary chips (not product page tabs). */
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

/** 3. Positions Center — dominant My Positions via PositionCard groups. */
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
    <PositionsShell data-testid="positions-center" data-composition="positions-center">
      <PositionsGrid data-testid="positions-center-grid">
        {viewSelector ? <PortfolioViewSelector model={viewSelector} onSelectView={onSelectView} /> : null}
        {walletConnected && viewSelector?.empty ? (
          <section data-testid="my-positions-section" data-state="EMPTY" data-view={viewSelector.currentView}>
            <SectionHeading>My Positions</SectionHeading>
            <EmptyState data-testid="portfolio-view-empty" data-view={viewSelector.currentView}>
              {viewSelector.emptyMessage}
            </EmptyState>
          </section>
        ) : (
          <MyPositionsSection {...myPositions} />
        )}
      </PositionsGrid>
    </PositionsShell>
  )
}
