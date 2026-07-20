/**
 * Command Center Portfolio Dashboard — Wallet Operating Center (R791D.4C–4G).
 *
 * Hierarchy: Hero → Action Center → Intelligence Center → Positions Center → Secondary.
 * Premium UI implements foundation — no product-specific section roots.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import styled from 'styled-components'
import type {
  PortfolioActivityItem,
  PortfolioClaimableItem,
  PortfolioPosition,
  PortfolioQuickAction,
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
import type { MyPositionsSectionProps } from './MyPositionsSection'
import type { PortfolioViewSelectorModel } from '../commandCenterRuntime/commandCenterPortfolioCutover'
import {
  PortfolioActions,
  PortfolioHero,
  PortfolioViewSelector,
  PositionsCenter,
  buildTodaysPriorities,
  type PriorityItem,
} from './portfolioComposition'
import { PortfolioIntelligenceSection } from './PortfolioIntelligenceSection'
import { buildPortfolioIntelligence } from '../commandCenterRuntime/portfolioIntelligence'
import {
  CommandCenterVisualShell,
  PortfolioSection,
  SecondaryRail,
} from './commandCenterVisualFoundation'

export { buildTodaysPriorities, type PriorityItem }
export { PortfolioViewSelector, PortfolioHero, PortfolioActions, PositionsCenter }
export { buildPortfolioIntelligence }

export interface PortfolioDashboardProps {
  portfolio: WalletPortfolio
  myPositions: MyPositionsSectionProps
  walletConnected: boolean
  viewSelector?: PortfolioViewSelectorModel
  onSelectView?: (view: PortfolioViewType) => void
}

const Section = styled.section`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
`

const Grid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(${({ $cols = 2 }) => Math.min($cols, 3)}, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(${({ $cols = 2 }) => $cols}, minmax(0, 1fr));
  }
`

const Cell = styled.div`
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  box-sizing: border-box;
`

const Label = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.label};
  color: ${commandCenterColors.label};
  margin-bottom: 6px;
`

const Value = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 18px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  line-height: 1.2;
  word-break: break-word;
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

const EmptyState = styled.div`
  padding: 20px 16px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: ${commandCenterLayout.cardRadius};
  background: ${commandCenterColors.cardBg};
  color: ${commandCenterColors.body};
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
`

const Fallback = styled.div`
  padding: 16px;
  border: 1px dashed ${commandCenterColors.cardBorder};
  border-radius: 12px;
  color: ${commandCenterColors.muted};
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
`

const ActionLink = styled.a`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${commandCenterColors.gold};
  text-decoration: none;
`

const SecondaryColumn = styled.div`
  min-width: 0;
  overflow-x: hidden;
`

function formatUsd(value: string | null | undefined): string {
  if (value == null || String(value).trim() === '') return 'Unavailable'
  return String(value)
}

interface BoundaryState {
  hasError: boolean
}

/** Section isolation — one section failure must not take down the dashboard. */
export class DashboardSectionBoundary extends Component<
  { section: string; children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[PortfolioDashboard] section unavailable', this.props.section, error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Fallback data-testid={`dashboard-section-unavailable-${this.props.section}`} role="status">
          Section unavailable
        </Fallback>
      )
    }
    return this.props.children
  }
}

/** @deprecated Prefer PortfolioHero — retained for focused legacy tests. */
export function PortfolioSummarySection({
  summary,
  walletConnected,
}: {
  summary: PortfolioSummary
  walletConnected: boolean
}) {
  if (!walletConnected) {
    return (
      <Section data-testid="portfolio-summary-section" data-state="WALLET_NOT_CONNECTED">
        <SectionHeading>Portfolio Summary</SectionHeading>
        <EmptyState data-testid="portfolio-summary-empty">Wallet not connected.</EmptyState>
      </Section>
    )
  }

  return (
    <Section data-testid="portfolio-summary-section" data-state="READY">
      <SectionHeading>Portfolio Summary</SectionHeading>
      <Grid $cols={5} data-testid="portfolio-summary-grid">
        <Cell>
          <Label>Net Value</Label>
          <Value data-testid="summary-net-value">{formatUsd(summary.netValueUsd)}</Value>
        </Cell>
        <Cell>
          <Label>Claimable Value</Label>
          <Value data-testid="summary-claimable-value">{formatUsd(summary.claimableValueUsd)}</Value>
        </Cell>
        <Cell>
          <Label>Active Positions</Label>
          <Value data-testid="summary-active-positions">{summary.activePositionCount}</Value>
        </Cell>
        <Cell>
          <Label>Historical Positions</Label>
          <Value data-testid="summary-historical-positions">{summary.historicalPositionCount}</Value>
        </Cell>
        <Cell>
          <Label>Pending Actions</Label>
          <Value data-testid="summary-pending-actions">{summary.pendingActionCount}</Value>
        </Cell>
      </Grid>
    </Section>
  )
}

/** @deprecated Prefer PortfolioActions — retained for focused legacy tests. */
export function TodaysPrioritiesSection({
  positions,
  walletConnected,
}: {
  positions: readonly PortfolioPosition[]
  walletConnected: boolean
}) {
  if (!walletConnected) {
    return (
      <Section data-testid="todays-priorities-section" data-state="WALLET_NOT_CONNECTED">
        <SectionHeading>Today&apos;s Priorities</SectionHeading>
        <EmptyState>Wallet not connected.</EmptyState>
      </Section>
    )
  }

  const items = buildTodaysPriorities(positions)
  return (
    <Section data-testid="todays-priorities-section" data-state={items.length ? 'READY' : 'EMPTY'}>
      <SectionHeading>Today&apos;s Priorities</SectionHeading>
      {items.length === 0 ? (
        <EmptyState data-testid="todays-priorities-empty">No priorities right now.</EmptyState>
      ) : (
        <List data-testid="todays-priorities-list">
          {items.map((item) => (
            <ListItem key={item.id} data-testid="priority-item" data-position-id={item.positionId}>
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
    </Section>
  )
}

export function ClaimablesSection({
  claimables,
  walletConnected,
}: {
  claimables: readonly PortfolioClaimableItem[]
  walletConnected: boolean
}) {
  if (!walletConnected) {
    return (
      <Section data-testid="claimables-section" data-state="WALLET_NOT_CONNECTED">
        <SectionHeading>Claimables</SectionHeading>
        <EmptyState>Wallet not connected.</EmptyState>
      </Section>
    )
  }

  const rows = Array.isArray(claimables) ? claimables : []
  return (
    <Section data-testid="claimables-section" data-state={rows.length ? 'READY' : 'EMPTY'}>
      <SectionHeading>Claimables</SectionHeading>
      {rows.length === 0 ? (
        <EmptyState data-testid="claimables-empty">No claimables.</EmptyState>
      ) : (
        <List data-testid="claimables-list">
          {rows.map((item) => (
            <ListItem key={item.id} data-testid="claimable-item">
              <div>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemMeta>
                  {item.amount != null ? `Amount ${item.amount}` : 'Amount Unavailable'}
                  {item.valueUsd != null ? ` · ${item.valueUsd}` : ''}
                  {item.positionId ? ` · ${item.positionId}` : ''}
                  {item.sourceType ? ` · ${item.sourceType}` : ''}
                </ItemMeta>
              </div>
              {item.action?.route && item.action.enabled ? (
                <ActionLink href={item.action.route} aria-label={item.action.label}>
                  {item.action.label}
                </ActionLink>
              ) : null}
            </ListItem>
          ))}
        </List>
      )}
    </Section>
  )
}

export function QuickActionsSection({
  quickActions,
  walletConnected,
}: {
  quickActions: readonly PortfolioQuickAction[]
  walletConnected: boolean
}) {
  if (!walletConnected) {
    return (
      <Section data-testid="quick-actions-section" data-state="WALLET_NOT_CONNECTED">
        <SectionHeading>Quick Actions</SectionHeading>
        <EmptyState>Wallet not connected.</EmptyState>
      </Section>
    )
  }

  const rows = Array.isArray(quickActions) ? [...quickActions].sort((a, b) => a.frequencyRank - b.frequencyRank) : []
  return (
    <Section data-testid="quick-actions-section" data-state={rows.length ? 'READY' : 'EMPTY'}>
      <SectionHeading>Quick Actions</SectionHeading>
      {rows.length === 0 ? (
        <EmptyState data-testid="quick-actions-empty">No quick actions.</EmptyState>
      ) : (
        <List data-testid="quick-actions-list">
          {rows.map((item) => (
            <ListItem key={item.id} data-testid="quick-action-item">
              <ItemTitle>{item.label}</ItemTitle>
              <ActionLink href={item.href} aria-label={item.label}>
                {item.label}
              </ActionLink>
            </ListItem>
          ))}
        </List>
      )}
    </Section>
  )
}

export function PortfolioActivitySection({
  recentActivity,
  walletConnected,
}: {
  recentActivity: readonly PortfolioActivityItem[]
  walletConnected: boolean
}) {
  if (!walletConnected) {
    return (
      <Section data-testid="portfolio-activity-section" data-state="WALLET_NOT_CONNECTED">
        <SectionHeading>Portfolio Activity</SectionHeading>
        <EmptyState>Wallet not connected.</EmptyState>
      </Section>
    )
  }

  const rows = Array.isArray(recentActivity) ? recentActivity : []
  return (
    <Section data-testid="portfolio-activity-section" data-state={rows.length ? 'READY' : 'EMPTY'}>
      <SectionHeading>Portfolio Activity</SectionHeading>
      {rows.length === 0 ? (
        <EmptyState data-testid="portfolio-activity-empty">No recent activity.</EmptyState>
      ) : (
        <List data-testid="portfolio-activity-list">
          {rows.map((item) => (
            <ListItem key={item.id} data-testid="activity-item">
              <div>
                <ItemTitle>{item.label}</ItemTitle>
                <ItemMeta>
                  {item.kind} · {item.time}
                  {item.positionId ? ` · ${item.positionId}` : ''}
                </ItemMeta>
              </div>
              {item.href ? (
                <ActionLink href={item.href} aria-label={item.label}>
                  Open
                </ActionLink>
              ) : null}
            </ListItem>
          ))}
        </List>
      )}
    </Section>
  )
}

/**
 * Wallet Operating Center order (R791D.4F):
 * PORTFOLIO_HERO → ACTION_CENTER → INTELLIGENCE_CENTER → POSITIONS_CENTER → SECONDARY
 */
export function PortfolioDashboard({
  portfolio,
  myPositions,
  walletConnected,
  viewSelector,
  onSelectView,
}: PortfolioDashboardProps) {
  const emptyPortfolio =
    walletConnected &&
    Array.isArray(portfolio.positions) &&
    portfolio.positions.length === 0 &&
    (!portfolio.claimables || portfolio.claimables.length === 0)

  const intelligence = buildPortfolioIntelligence({ portfolio, walletConnected })

  let visualState: 'DISCONNECTED' | 'EMPTY' | 'CONNECTED' | 'ATTENTION' | 'PARTIAL' | 'UNAVAILABLE' | 'HISTORICAL' =
    'CONNECTED'
  if (!walletConnected) visualState = 'DISCONNECTED'
  else if (emptyPortfolio) visualState = 'EMPTY'
  else if (intelligence.summary.attentionCount > 0) visualState = 'ATTENTION'
  else if (intelligence.summary.unavailableCount > 0) visualState = 'UNAVAILABLE'
  else if (
    intelligence.summary.historicalCount > 0 &&
    intelligence.summary.activePositions === 0
  ) {
    visualState = 'HISTORICAL'
  } else if (
    Object.values(portfolio.sectionStatus).some((s) => s.status === 'PARTIAL')
  ) {
    visualState = 'PARTIAL'
  }

  return (
    <CommandCenterVisualShell
      walletConnected={walletConnected}
      visualState={visualState}
      activePositions={portfolio.summary.activePositionCount}
      pendingActions={portfolio.summary.pendingActionCount}
    >
      {emptyPortfolio ? (
        <EmptyState data-testid="portfolio-dashboard-empty">Portfolio empty.</EmptyState>
      ) : null}

      <DashboardSectionBoundary section="hero">
        <PortfolioHero
          portfolio={portfolio}
          walletConnected={walletConnected}
          intelligence={intelligence}
        />
      </DashboardSectionBoundary>

      <DashboardSectionBoundary section="actions">
        <PortfolioActions
          positions={portfolio.positions}
          walletConnected={walletConnected}
          actionItems={intelligence.actionItems}
        />
      </DashboardSectionBoundary>

      <DashboardSectionBoundary section="portfolio-intelligence">
        <PortfolioIntelligenceSection model={intelligence} walletConnected={walletConnected} />
      </DashboardSectionBoundary>

      <DashboardSectionBoundary section="positions-center">
        <PositionsCenter
          myPositions={myPositions}
          viewSelector={viewSelector}
          onSelectView={onSelectView}
          walletConnected={walletConnected}
        />
      </DashboardSectionBoundary>

      <DashboardSectionBoundary section="secondary">
        <PortfolioSection center="SECONDARY" testId="portfolio-secondary-center" data-cc-r791d-4g="secondary">
          <SecondaryRail testId="portfolio-secondary">
            <SecondaryColumn data-testid="portfolio-secondary-claimables">
              <ClaimablesSection claimables={portfolio.claimables} walletConnected={walletConnected} />
            </SecondaryColumn>
            <SecondaryColumn data-testid="portfolio-secondary-activity">
              <PortfolioActivitySection
                recentActivity={portfolio.recentActivity}
                walletConnected={walletConnected}
              />
            </SecondaryColumn>
            <SecondaryColumn data-testid="portfolio-secondary-quick-actions">
              <QuickActionsSection quickActions={portfolio.quickActions} walletConnected={walletConnected} />
            </SecondaryColumn>
          </SecondaryRail>
        </PortfolioSection>
      </DashboardSectionBoundary>
    </CommandCenterVisualShell>
  )
}

export default PortfolioDashboard
