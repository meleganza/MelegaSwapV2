/**
 * Universal Command Center position card renderer (R791D.3G).
 *
 * Consumes MyPositionCardModel only — no Liquidity/Farm/Pool UI branches.
 * Foundation renderer: no Command Center wiring, no CSS system changes.
 */

import type { ReactNode } from 'react'
import type {
  MyPositionCardModel,
  MyPositionCardNavigation,
} from 'lib/wallet-portfolio/myPositionCardModel'
import type { PortfolioPositionAction } from 'lib/wallet-portfolio/contracts'

export type PositionCardVariant = 'default' | 'compact' | 'dense'

export interface PositionCardProps {
  position: MyPositionCardModel | null | undefined
  compact?: boolean
  variant?: PositionCardVariant
}

function isPresentValue(value: string | null | undefined): value is string {
  return value != null && String(value).trim() !== ''
}

function ActionControl({
  action,
  kind,
}: {
  action: PortfolioPositionAction
  kind: 'primary' | 'secondary'
}) {
  const label = action.label || action.type
  const disabled = action.enabled !== true
  const title = disabled && action.reasonDisabled ? action.reasonDisabled : label
  const common = {
    'data-action-type': action.type,
    'data-action-kind': kind,
    'aria-label': label,
    title,
  } as const

  if (action.route && !disabled) {
    return (
      <a {...common} href={action.route}>
        {label}
      </a>
    )
  }

  return (
    <button type="button" {...common} disabled={disabled} aria-disabled={disabled}>
      {label}
      {disabled && action.reasonDisabled ? (
        <span data-testid="action-disabled-reason"> {action.reasonDisabled}</span>
      ) : null}
    </button>
  )
}

function NavigationFooter({ navigation }: { navigation: MyPositionCardNavigation }) {
  const items: Array<{ key: string; href: string; label: string }> = []
  if (navigation.openRoute) items.push({ key: 'open', href: navigation.openRoute, label: 'Open' })
  if (navigation.manageRoute) items.push({ key: 'manage', href: navigation.manageRoute, label: 'Manage' })
  if (navigation.analyticsRoute) {
    items.push({ key: 'analytics', href: navigation.analyticsRoute, label: 'Analytics' })
  }
  if (navigation.productRoute) {
    items.push({ key: 'product', href: navigation.productRoute, label: 'Product' })
  }
  if (items.length === 0) return null

  return (
    <footer data-section="footer" aria-label="Position navigation">
      {items.map((item) => (
        <a key={item.key} href={item.href} aria-label={item.label} data-nav={item.key}>
          {item.label}
        </a>
      ))}
    </footer>
  )
}

function ValueRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!isPresentValue(value)) return null
  return (
    <div data-field={label}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/**
 * Universal Position Card — model decides content; renderer does not branch on positionType.
 */
export function PositionCard({ position, compact = false, variant = 'default' }: PositionCardProps) {
  if (!position) return null

  const resolvedVariant: PositionCardVariant = compact ? 'compact' : variant
  const lifecycleStatus = position.lifecycle?.status ?? position.status
  const badges = Array.isArray(position.badge) ? position.badge : []
  const tags = Array.isArray(position.tags) ? position.tags : []
  const primary = position.actions?.primaryAction
  const secondary = Array.isArray(position.actions?.secondaryActions)
    ? position.actions.secondaryActions
    : []
  const requiresAttention = position.requiresAttention === true || position.attention?.requiresAttention === true
  const attentionReason = position.attention?.attentionReason ?? null

  const headerMeta: ReactNode[] = []
  if (lifecycleStatus) {
    headerMeta.push(
      <span key="lifecycle" data-lifecycle={lifecycleStatus} aria-label={`Lifecycle ${lifecycleStatus}`}>
        {lifecycleStatus}
      </span>,
    )
  }
  for (const tag of tags) {
    headerMeta.push(
      <span key={`tag-${tag}`} data-tag={tag}>
        {tag}
      </span>,
    )
  }
  for (const b of badges) {
    headerMeta.push(
      <span key={`badge-${b}`} data-badge={b}>
        {b}
      </span>,
    )
  }

  return (
    <article
      data-testid="position-card"
      data-position-id={position.positionId}
      data-position-type={position.positionType}
      data-variant={resolvedVariant}
      data-compact={compact ? 'true' : 'false'}
      aria-label={position.title || 'Position'}
    >
      <header data-section="header">
        {position.icon ? (
          // Icon URL/string from model — decorative when title labels the card.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={position.icon} alt="" aria-hidden="true" data-testid="position-icon" />
        ) : null}
        <div>
          <h3>{position.title}</h3>
          {position.subtitle ? <p>{position.subtitle}</p> : null}
        </div>
        <div data-testid="header-meta" aria-label="Position metadata">
          {headerMeta}
        </div>
      </header>

      <div data-section="body">
        <ValueRow label="currentValueUsd" value={position.value?.currentValueUsd} />
        <ValueRow label="principalValueUsd" value={position.value?.principalValueUsd} />
        {position.claimables?.hasClaimable || isPresentValue(position.claimables?.valueUsd) ? (
          <div data-field="claimables">
            <span>claimables</span>
            {isPresentValue(position.claimables?.valueUsd) ? (
              <span data-testid="claimable-value">{position.claimables.valueUsd}</span>
            ) : null}
          </div>
        ) : null}
        {lifecycleStatus ? (
          <div data-field="status" data-testid="position-status">
            <span>status</span>
            <span>{lifecycleStatus}</span>
          </div>
        ) : null}
        {requiresAttention ? (
          <div
            data-testid="attention-indicator"
            data-field="attention"
            role="status"
            aria-label={attentionReason ? `Needs attention: ${attentionReason}` : 'Needs attention'}
          >
            Attention
            {attentionReason ? <span data-testid="attention-reason"> {attentionReason}</span> : null}
          </div>
        ) : null}
      </div>

      <div data-section="actions" aria-label="Position actions">
        {primary ? <ActionControl action={primary} kind="primary" /> : null}
        {secondary.map((action, index) => (
          <ActionControl
            key={`${action.type}-${action.label}-${index}`}
            action={action}
            kind="secondary"
          />
        ))}
      </div>

      <NavigationFooter navigation={position.navigation ?? {
        productRoute: null,
        openRoute: null,
        manageRoute: null,
        analyticsRoute: null,
      }} />
    </article>
  )
}

export default PositionCard
