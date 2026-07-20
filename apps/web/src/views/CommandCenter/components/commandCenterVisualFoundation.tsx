/**
 * R791D.4F — Command Center premium visual system foundation.
 *
 * Defines hierarchy, spacing, information priority, and composition primitives.
 * Not a final visual polish — no animations, no global design-system rewrite.
 */

import React, { type ReactNode } from 'react'
import styled from 'styled-components'
import {
  CC_FONT_BODY,
  commandCenterColors,
  commandCenterLayout,
  commandCenterType,
} from '../commandCenterTokens'

/** Canonical page centers — Wallet Operating Center structure. */
export const COMMAND_CENTER_HIERARCHY = [
  'PORTFOLIO_HERO',
  'ACTION_CENTER',
  'INTELLIGENCE_CENTER',
  'POSITIONS_CENTER',
  'SECONDARY',
] as const

export type CommandCenterCenter = (typeof COMMAND_CENTER_HIERARCHY)[number]

/** Visual information priority (1 = highest). */
export const VISUAL_PRIORITY = {
  PORTFOLIO_HERO: 1,
  ACTION_CENTER: 2,
  INTELLIGENCE_CENTER: 2,
  POSITIONS_CENTER: 3,
  SECONDARY: 4,
} as const

export type VisualPriorityLevel = 1 | 2 | 3 | 4

/**
 * Spacing system — reusable tokens only.
 * Exact pixel polish is deferred to R791D.4G.
 */
export const CC_VISUAL_SPACING = {
  pageGap: commandCenterLayout.sectionGap,
  pageGapMobile: commandCenterLayout.sectionGapMobile,
  sectionGap: commandCenterLayout.cardGap,
  sectionGapTight: '12px',
  cardGap: '12px',
  cardPadding: '14px 16px',
  headerMarginBottom: '12px',
} as const

/** Premium card language — shared principles, not product-specific chrome. */
export const CC_CARD_LANGUAGE = {
  ownership: 'clear ownership',
  status: 'clear status',
  action: 'clear action',
  avoid: [
    'dashboard boxes everywhere',
    'dense technical panels',
    'duplicate information',
    'technical debug language',
  ],
} as const

/**
 * Visual states — existing portfolio/operating states only.
 * Do not invent new state machines here.
 */
export const CC_VISUAL_STATES = [
  'CONNECTED',
  'EMPTY',
  'DISCONNECTED',
  'PARTIAL',
  'UNAVAILABLE',
  'HISTORICAL',
  'ATTENTION',
] as const

export type CcVisualState = (typeof CC_VISUAL_STATES)[number]

export const CC_RESPONSIVE = {
  desktopBreakpoint: '1024px',
  tabletBreakpoint: '768px',
  desktop: {
    hero: 'full-width',
    actions: 'horizontal',
    positions: 'grid',
  },
  mobile: {
    layout: 'single-column',
    priorityOrderPreserved: true,
    noHorizontalScroll: true,
  },
} as const

const Shell = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${CC_VISUAL_SPACING.pageGapMobile};

  @media (min-width: ${CC_RESPONSIVE.desktopBreakpoint}) {
    gap: ${CC_VISUAL_SPACING.pageGap};
  }
`

const SectionRoot = styled.section<{ $priority: VisualPriorityLevel }>`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  /* Priority is structural (DOM + data-visual-priority). Pixel weight deferred to 4G. */
  flex-shrink: 0;
`

const HeaderRoot = styled.header`
  margin: 0 0 ${CC_VISUAL_SPACING.headerMarginBottom};
  min-width: 0;
`

const HeaderTitle = styled.h3`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.sectionTitle};
  font-weight: 700;
  color: ${commandCenterColors.white};
  line-height: 1.3;
`

const HeaderSubtitle = styled.p`
  margin: 6px 0 0;
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  color: ${commandCenterColors.muted};
  line-height: 1.4;
`

const MetricRoot = styled.div`
  min-width: 0;
  padding: ${CC_VISUAL_SPACING.cardPadding};
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

const ActionRoot = styled.li`
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
  list-style: none;
`

const ActionTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  color: ${commandCenterColors.white};
`

const ActionMeta = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};
`

const ActionHref = styled.a`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${commandCenterColors.gold};
  text-decoration: none;
`

const IntelligenceRoot = styled.li`
  padding: 10px 12px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 10px;
  background: ${commandCenterColors.cardBg};
  min-width: 0;
  list-style: none;
`

const IntelligenceTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${commandCenterColors.white};
  word-break: break-word;
`

const IntelligenceMeta = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};
  margin-top: 4px;
  word-break: break-word;
`

const PositionGroupRoot = styled.div<{ $grid?: boolean }>`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${CC_VISUAL_SPACING.sectionGap};

  ${({ $grid }) =>
    $grid
      ? `
    @media (min-width: ${CC_RESPONSIVE.tabletBreakpoint}) {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: ${CC_VISUAL_SPACING.sectionGap};
    }
  `
      : ''}
`

const ActionsLayout = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${CC_VISUAL_SPACING.cardGap};
  min-width: 0;

  @media (min-width: ${CC_RESPONSIVE.desktopBreakpoint}) {
    flex-direction: row;
    flex-wrap: wrap;
  }
`

const MetricsLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${CC_VISUAL_SPACING.cardGap};
  min-width: 0;

  @media (min-width: ${CC_RESPONSIVE.tabletBreakpoint}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: ${CC_RESPONSIVE.desktopBreakpoint}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const SecondaryLayout = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${CC_VISUAL_SPACING.pageGapMobile};

  @media (min-width: ${CC_RESPONSIVE.desktopBreakpoint}) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${CC_VISUAL_SPACING.pageGap};
    align-items: start;
  }
`

export function CommandCenterVisualShell({
  children,
  walletConnected,
  visualState,
  activePositions,
  pendingActions,
}: {
  children: ReactNode
  walletConnected: boolean
  visualState?: CcVisualState
  activePositions?: number
  pendingActions?: number
}) {
  const state: CcVisualState =
    visualState ?? (walletConnected ? 'CONNECTED' : 'DISCONNECTED')

  return (
    <Shell
      data-testid="portfolio-dashboard"
      data-wallet-operating-center="true"
      data-cc-r791d-4c
      data-cc-r791d-4e
      data-cc-r791d-4f="visual-foundation"
      data-visual-hierarchy={COMMAND_CENTER_HIERARCHY.join('|')}
      data-visual-state={state}
      data-wallet-connected={walletConnected ? 'true' : 'false'}
      data-responsive="stack-mobile-columns-desktop"
      data-responsive-mobile={CC_RESPONSIVE.mobile.layout}
      data-no-horizontal-scroll={CC_RESPONSIVE.mobile.noHorizontalScroll ? 'true' : 'false'}
      data-active-positions={activePositions}
      data-pending-actions={pendingActions}
    >
      {children}
    </Shell>
  )
}

export function PortfolioSection({
  center,
  children,
  testId,
  state,
  'data-cc-r791d-4e': dataCcR791d4e,
}: {
  center: CommandCenterCenter
  children: ReactNode
  testId?: string
  state?: string
  'data-cc-r791d-4e'?: boolean | string
}) {
  const priority = VISUAL_PRIORITY[center] as VisualPriorityLevel
  return (
    <SectionRoot
      $priority={priority}
      data-testid={testId}
      data-cc-center={center}
      data-visual-priority={priority}
      data-state={state}
      data-composition={center.toLowerCase().replace(/_/g, '-')}
      data-cc-r791d-4e={dataCcR791d4e}
    >
      {children}
    </SectionRoot>
  )
}

export function SectionHeader({
  title,
  subtitle,
  testId,
}: {
  title: string
  subtitle?: string
  testId?: string
}) {
  return (
    <HeaderRoot data-testid={testId} data-cc-primitive="section-header">
      <HeaderTitle>{title}</HeaderTitle>
      {subtitle ? <HeaderSubtitle>{subtitle}</HeaderSubtitle> : null}
    </HeaderRoot>
  )
}

export function MetricBlock({
  label,
  value,
  testId,
}: {
  label: string
  value: ReactNode
  testId?: string
}) {
  return (
    <MetricRoot data-testid={testId} data-cc-primitive="metric-block">
      <MetricLabel>{label}</MetricLabel>
      <MetricValue>{value}</MetricValue>
    </MetricRoot>
  )
}

export function MetricBlockRow({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <MetricsLayout data-testid={testId} data-cc-layout="metric-row" data-desktop="hero-full-width">
      {children}
    </MetricsLayout>
  )
}

export function ActionItem({
  title,
  meta,
  href,
  actionLabel,
  attention,
  testId,
  positionId,
  actionType,
}: {
  title: string
  meta?: string
  href?: string | null
  actionLabel?: string
  attention?: boolean
  testId?: string
  positionId?: string
  actionType?: string
}) {
  return (
    <ActionRoot
      data-testid={testId}
      data-cc-primitive="action-item"
      data-position-id={positionId}
      data-action-type={actionType}
      data-attention={attention ? 'true' : 'false'}
    >
      <div>
        <ActionTitle>{title}</ActionTitle>
        {meta ? <ActionMeta>{meta}</ActionMeta> : null}
      </div>
      {href && actionLabel ? (
        <ActionHref href={href} aria-label={actionLabel}>
          {actionLabel}
        </ActionHref>
      ) : actionLabel ? (
        <ActionMeta>{actionLabel}</ActionMeta>
      ) : null}
    </ActionRoot>
  )
}

export function ActionItemRow({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <ActionsLayout data-testid={testId} data-cc-layout="action-row" data-desktop="actions-horizontal">
      {children}
    </ActionsLayout>
  )
}

export function IntelligenceItem({
  title,
  meta,
  href,
  actionLabel,
  testId,
  kind,
  source,
  positionId,
  actionType,
}: {
  title: string
  meta?: string
  href?: string | null
  actionLabel?: string
  testId?: string
  kind?: string
  source?: string
  positionId?: string
  actionType?: string
}) {
  return (
    <IntelligenceRoot
      data-testid={testId}
      data-cc-primitive="intelligence-item"
      data-health-kind={kind}
      data-source={source}
      data-position-id={positionId}
      data-action-type={actionType}
    >
      <IntelligenceTitle>{title}</IntelligenceTitle>
      {meta ? <IntelligenceMeta>{meta}</IntelligenceMeta> : null}
      {href && actionLabel ? (
        <ActionHref href={href} aria-label={actionLabel} style={{ display: 'inline-block', marginTop: 6 }}>
          {actionLabel}
        </ActionHref>
      ) : null}
    </IntelligenceRoot>
  )
}

export function PositionGroup({
  children,
  testId,
  grid = false,
}: {
  children: ReactNode
  testId?: string
  /** When true, desktop/tablet uses a card grid. Default column preserves selector + list stacks. */
  grid?: boolean
}) {
  return (
    <PositionGroupRoot
      $grid={grid}
      data-testid={testId}
      data-cc-primitive="position-group"
      data-desktop={grid ? 'positions-grid' : 'positions-stack'}
      data-mobile="single-column"
    >
      {children}
    </PositionGroupRoot>
  )
}

export function SecondaryRail({
  children,
  testId,
}: {
  children: ReactNode
  testId?: string
}) {
  return (
    <SecondaryLayout data-testid={testId} data-composition="portfolio-secondary" data-visual-priority={4}>
      {children}
    </SecondaryLayout>
  )
}

export function isProductSpecificSectionName(name: string): boolean {
  const n = name.toLowerCase()
  return (
    n.includes('farmssection') ||
    n.includes('poolssection') ||
    n.includes('liquiditysection') ||
    n === 'farms' ||
    n === 'pools' ||
    n === 'liquidity'
  )
}
