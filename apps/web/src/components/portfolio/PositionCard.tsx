/**
 * Universal Command Center position card renderer (R791D.4D experience polish).
 *
 * Consumes MyPositionCardModel only — no Liquidity/Farm/Pool UI branches.
 * Hierarchy: Header → Value → Actions → Footer. No fake economics.
 */

import type { ReactNode } from 'react'
import styled from 'styled-components'
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

const Card = styled.article`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(20, 22, 28, 0.92);
  color: #f5f5f5;

  &[data-variant='compact'],
  &[data-compact='true'] {
    padding: 12px 14px;
    gap: 10px;
  }
`

const Header = styled.header`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px 12px;
  align-items: start;
  min-width: 0;
`

const Icon = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
`

const TitleBlock = styled.div`
  min-width: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  word-break: break-word;
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.72;
  word-break: break-word;
`

const IdentityRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  min-width: 0;
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  word-break: break-word;
`

const LifecycleChip = styled(Chip)`
  border-color: rgba(212, 175, 55, 0.45);
  color: #f0d78c;
`

const AttentionChip = styled(Chip)`
  border-color: rgba(255, 120, 80, 0.5);
  color: #ffb199;
`

const ValueArea = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  min-width: 0;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
`

const ValueCell = styled.div`
  min-width: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
`

const ValueLabel = styled.div`
  font-size: 11px;
  opacity: 0.7;
  margin-bottom: 4px;
`

const ValueAmount = styled.div`
  font-size: 15px;
  font-weight: 700;
  word-break: break-word;
`

const ClaimableBanner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 10px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  background: rgba(212, 175, 55, 0.08);
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  @media (min-width: 480px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
`

const PrimaryAction = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  max-width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  background: #d4af37;
  color: #1a1408;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  word-break: break-word;
`

const PrimaryButton = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  max-width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.5);
  background: rgba(212, 175, 55, 0.18);
  color: #f0d78c;
  font-size: 14px;
  font-weight: 800;
  cursor: not-allowed;
  opacity: 0.75;
  word-break: break-word;
`

const SecondaryAction = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f5f5f5;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  word-break: break-word;
`

const SecondaryButton = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: #f5f5f5;
  font-size: 12px;
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.7;
  word-break: break-word;
`

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  min-width: 0;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`

const NavLink = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: #d4af37;
  text-decoration: none;
  word-break: break-word;
`

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

  if (kind === 'primary') {
    if (action.route && !disabled) {
      return (
        <PrimaryAction {...common} href={action.route} data-testid="position-primary-action">
          {label}
        </PrimaryAction>
      )
    }
    return (
      <PrimaryButton type="button" {...common} disabled={disabled} aria-disabled={disabled} data-testid="position-primary-action">
        {label}
        {disabled && action.reasonDisabled ? (
          <span data-testid="action-disabled-reason"> — {action.reasonDisabled}</span>
        ) : null}
      </PrimaryButton>
    )
  }

  if (action.route && !disabled) {
    return (
      <SecondaryAction {...common} href={action.route}>
        {label}
      </SecondaryAction>
    )
  }

  return (
    <SecondaryButton type="button" {...common} disabled={disabled} aria-disabled={disabled}>
      {label}
      {disabled && action.reasonDisabled ? (
        <span data-testid="action-disabled-reason"> — {action.reasonDisabled}</span>
      ) : null}
    </SecondaryButton>
  )
}

function NavigationFooter({ navigation }: { navigation: MyPositionCardNavigation }) {
  // Mission order: Manage → Analytics → Open (routes from model only).
  const items: Array<{ key: string; href: string; label: string }> = []
  if (navigation.manageRoute) items.push({ key: 'manage', href: navigation.manageRoute, label: 'Manage' })
  if (navigation.analyticsRoute) {
    items.push({ key: 'analytics', href: navigation.analyticsRoute, label: 'Analytics' })
  }
  if (navigation.openRoute) items.push({ key: 'open', href: navigation.openRoute, label: 'Open' })
  if (items.length === 0) return null

  return (
    <Footer data-section="footer" aria-label="Position navigation" data-testid="position-nav-footer">
      {items.map((item) => (
        <NavLink key={item.key} href={item.href} aria-label={item.label} data-nav={item.key}>
          {item.label}
        </NavLink>
      ))}
    </Footer>
  )
}

function ValueRow({
  label,
  displayLabel,
  value,
  testId,
}: {
  label: string
  displayLabel: string
  value: string | null | undefined
  testId?: string
}) {
  if (!isPresentValue(value)) return null
  return (
    <ValueCell data-field={label} data-testid={testId}>
      <ValueLabel>{displayLabel}</ValueLabel>
      <ValueAmount>{value}</ValueAmount>
    </ValueCell>
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
  const protocolLabel = position.identity?.protocol ?? null
  const typeLabel = position.positionType
  const hasClaimable = position.claimables?.hasClaimable === true

  const identityChips: ReactNode[] = []
  if (protocolLabel) {
    identityChips.push(
      <Chip key="protocol" data-testid="position-protocol" data-protocol={protocolLabel}>
        {protocolLabel}
      </Chip>,
    )
  }
  if (typeLabel) {
    identityChips.push(
      <Chip key="type" data-testid="position-type-chip" data-type-label={typeLabel}>
        {typeLabel}
      </Chip>,
    )
  }
  if (lifecycleStatus) {
    identityChips.push(
      <LifecycleChip
        key="lifecycle"
        data-lifecycle={lifecycleStatus}
        data-testid="position-lifecycle"
        aria-label={`Lifecycle ${lifecycleStatus}`}
      >
        {lifecycleStatus}
      </LifecycleChip>,
    )
  }
  for (const tag of tags) {
    identityChips.push(
      <Chip key={`tag-${tag}`} data-tag={tag}>
        {tag}
      </Chip>,
    )
  }
  for (const b of badges) {
    identityChips.push(
      <Chip key={`badge-${b}`} data-badge={b}>
        {b}
      </Chip>,
    )
  }

  return (
    <Card
      data-testid="position-card"
      data-position-id={position.positionId}
      data-position-type={position.positionType}
      data-variant={resolvedVariant}
      data-compact={compact ? 'true' : 'false'}
      data-experience="r791d-4d"
      aria-label={position.title || 'Position'}
    >
      <Header data-section="header">
        {position.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Icon src={position.icon} alt="" aria-hidden="true" data-testid="position-icon" />
        ) : (
          <span data-testid="position-icon-spacer" aria-hidden="true" style={{ width: 40 }} />
        )}
        <TitleBlock>
          <Title>{position.title}</Title>
          {position.subtitle ? <Subtitle>{position.subtitle}</Subtitle> : null}
          <IdentityRow data-testid="header-meta" aria-label="Position metadata">
            {identityChips}
            {requiresAttention ? (
              <AttentionChip
                data-testid="attention-indicator"
                data-field="attention"
                role="status"
                aria-label={attentionReason ? `Needs attention: ${attentionReason}` : 'Needs attention'}
              >
                Attention
                {attentionReason ? <span data-testid="attention-reason"> · {attentionReason}</span> : null}
              </AttentionChip>
            ) : null}
          </IdentityRow>
        </TitleBlock>
      </Header>

      <ValueArea data-section="value" data-testid="position-value-area">
        <ValueRow
          label="currentValueUsd"
          displayLabel="Current value"
          value={position.value?.currentValueUsd}
          testId="position-current-value"
        />
        {hasClaimable ? (
          <ClaimableBanner data-field="claimables" data-testid="claimable-indicator" data-has-claimable="true">
            <ValueLabel>Claimable</ValueLabel>
            {isPresentValue(position.claimables?.valueUsd) ? (
              <ValueAmount data-testid="claimable-value">{position.claimables.valueUsd}</ValueAmount>
            ) : (
              <ValueAmount data-testid="claimable-flag">Available</ValueAmount>
            )}
          </ClaimableBanner>
        ) : null}
        <ValueRow
          label="balance"
          displayLabel="Balance"
          value={position.value?.balanceFormatted}
          testId="position-balance"
        />
        {/* Compatibility: lifecycle also exposed for prior status queries */}
        {lifecycleStatus ? (
          <div data-field="status" data-testid="position-status" hidden aria-hidden="true">
            {lifecycleStatus}
          </div>
        ) : null}
      </ValueArea>

      <Actions data-section="actions" aria-label="Position actions" data-testid="position-actions">
        {primary ? <ActionControl action={primary} kind="primary" /> : null}
        {secondary.map((action, index) => (
          <ActionControl
            key={`${action.type}-${action.label}-${index}`}
            action={action}
            kind="secondary"
          />
        ))}
      </Actions>

      <NavigationFooter
        navigation={
          position.navigation ?? {
            productRoute: null,
            openRoute: null,
            manageRoute: null,
            analyticsRoute: null,
          }
        }
      />
    </Card>
  )
}

export default PositionCard
