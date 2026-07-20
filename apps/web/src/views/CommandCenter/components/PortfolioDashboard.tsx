/**
 * Command Center Portfolio Dashboard composition (R791D.4A).
 *
 * Information architecture only — consumes WalletPortfolio + My Positions props.
 * No product root arrays. No manual economics. No fetch.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import styled from 'styled-components'
import type {
  PortfolioActivityItem,
  PortfolioClaimableItem,
  PortfolioPosition,
  PortfolioPositionAction,
  PortfolioQuickAction,
  PortfolioSummary,
  WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
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

/** Action types allowed in Today's Priorities — must already exist on the position. */
const PRIORITY_ACTION_TYPES = new Set([
  'CLAIM',
  'HARVEST',
  'WITHDRAW',
  'REMOVE_LIQUIDITY',
  'APPROVE',
])

export interface PortfolioDashboardProps {
  portfolio: WalletPortfolio
  myPositions: MyPositionsSectionProps
  walletConnected: boolean
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

function formatUsd(value: string | null | undefined): string {
  if (value == null || String(value).trim() === '') return 'Unavailable'
  return String(value)
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

export interface PriorityItem {
  id: string
  positionId: string
  title: string
  action: PortfolioPositionAction
  requiresAttention: boolean
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
 * Canonical portfolio dashboard order:
 * Summary → Priorities → My Positions → Claimables → Quick Actions → Activity
 */
export function PortfolioDashboard({ portfolio, myPositions, walletConnected }: PortfolioDashboardProps) {
  const emptyPortfolio =
    walletConnected &&
    Array.isArray(portfolio.positions) &&
    portfolio.positions.length === 0 &&
    (!portfolio.claimables || portfolio.claimables.length === 0)

  return (
    <div data-testid="portfolio-dashboard" data-wallet-connected={walletConnected ? 'true' : 'false'}>
      {emptyPortfolio ? (
        <EmptyState data-testid="portfolio-dashboard-empty" style={{ marginBottom: 20 }}>
          Portfolio empty.
        </EmptyState>
      ) : null}

      <DashboardSectionBoundary section="summary">
        <PortfolioSummarySection summary={portfolio.summary} walletConnected={walletConnected} />
      </DashboardSectionBoundary>

      <div style={{ height: commandCenterLayout.sectionGap }} aria-hidden="true" />

      <DashboardSectionBoundary section="priorities">
        <TodaysPrioritiesSection positions={portfolio.positions} walletConnected={walletConnected} />
      </DashboardSectionBoundary>

      <div style={{ height: commandCenterLayout.sectionGap }} aria-hidden="true" />

      <DashboardSectionBoundary section="my-positions">
        <MyPositionsSection {...myPositions} />
      </DashboardSectionBoundary>

      <div style={{ height: commandCenterLayout.sectionGap }} aria-hidden="true" />

      <DashboardSectionBoundary section="claimables">
        <ClaimablesSection claimables={portfolio.claimables} walletConnected={walletConnected} />
      </DashboardSectionBoundary>

      <div style={{ height: commandCenterLayout.sectionGap }} aria-hidden="true" />

      <DashboardSectionBoundary section="quick-actions">
        <QuickActionsSection quickActions={portfolio.quickActions} walletConnected={walletConnected} />
      </DashboardSectionBoundary>

      <div style={{ height: commandCenterLayout.sectionGap }} aria-hidden="true" />

      <DashboardSectionBoundary section="activity">
        <PortfolioActivitySection
          recentActivity={portfolio.recentActivity}
          walletConnected={walletConnected}
        />
      </DashboardSectionBoundary>
    </div>
  )
}

export default PortfolioDashboard
