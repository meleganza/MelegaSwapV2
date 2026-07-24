/**
 * Pure builder for Passport Security trust summary.
 * Identity + wallet presence from factual session; sessions/recovery/alerts unavailable.
 */
import type { PassportVerificationState } from './passportHeroIdentityTypes'
import { shortenWalletAddress } from './passportHeroIdentityTypes'
import type {
  PassportSecurityBadge,
  PassportSecurityBadgeTone,
  PassportSecurityRow,
  PassportSecurityViewModel,
} from './passportSecurityTypes'

export type PassportSecurityInput = {
  address?: string | null
  loading?: boolean
  forceDisconnected?: boolean
  /** From Module 001 identity model when available — never invent Verified. */
  verificationState?: PassportVerificationState | null
  connectorName?: string | null
  /** Test/cert only. */
  fixtureRows?: readonly PassportSecurityRow[] | null
}

function identityRow(state: PassportVerificationState | null | undefined): PassportSecurityRow {
  const s = state ?? 'unavailable'
  let badge: PassportSecurityBadge = 'Unavailable'
  let badgeTone: PassportSecurityBadgeTone = 'neutral'
  let description = 'Passport identity verification status is not available.'

  if (s === 'verified') {
    badge = 'Verified'
    badgeTone = 'positive'
    description = 'Identity verification is confirmed for this Passport.'
  } else if (s === 'pending') {
    badge = 'Pending'
    badgeTone = 'warning'
    description = 'Identity verification is awaiting review.'
  } else if (s === 'review_required') {
    badge = 'Review'
    badgeTone = 'attention'
    description = 'Identity verification requires your attention.'
  } else if (s === 'not_verified') {
    badge = 'Not Configured'
    badgeTone = 'neutral'
    description = 'Identity verification has not started for this Passport.'
  } else {
    badge = 'Unavailable'
    badgeTone = 'neutral'
    description = 'Identity verification source is unavailable.'
  }

  return {
    id: 'identity',
    title: 'Identity Verification',
    description,
    iconMark: 'ID',
    badge,
    badgeTone,
    actionLabel: null,
    actionHref: null,
    actionAriaLabel: null,
    sourceAvailable: s !== 'unavailable',
  }
}

function walletsRow(address: string | null | undefined, connectorName: string | null | undefined): PassportSecurityRow {
  if (!address) {
    return {
      id: 'wallets',
      title: 'Connected Wallets',
      description: 'No trusted wallet connected.',
      iconMark: 'WL',
      badge: 'Not Configured',
      badgeTone: 'neutral',
      actionLabel: null,
      actionHref: null,
      actionAriaLabel: null,
      sourceAvailable: true,
    }
  }
  const short = shortenWalletAddress(address)
  const via = connectorName ? ` via ${connectorName}` : ''
  return {
    id: 'wallets',
    title: 'Connected Wallets',
    description: `1 trusted wallet · Primary ${short}${via}`,
    iconMark: 'WL',
    badge: 'Healthy',
    badgeTone: 'positive',
    actionLabel: null,
    actionHref: null,
    actionAriaLabel: null,
    sourceAvailable: true,
  }
}

function unavailableRow(
  id: PassportSecurityRow['id'],
  title: string,
  iconMark: string,
  description: string,
): PassportSecurityRow {
  return {
    id,
    title,
    description,
    iconMark,
    badge: 'Unavailable',
    badgeTone: 'neutral',
    actionLabel: null,
    actionHref: null,
    actionAriaLabel: null,
    sourceAvailable: false,
  }
}

export function buildPassportSecurityViewModel(
  input: PassportSecurityInput = {},
): PassportSecurityViewModel {
  const loading = Boolean(input.loading)

  if (input.forceDisconnected || (!input.address && !input.fixtureRows)) {
    return {
      loading: false,
      walletConnected: false,
      state: 'disconnected',
      rows: [],
    }
  }

  if (input.fixtureRows) {
    const connected = !input.forceDisconnected
    if (!connected) {
      return { loading: false, walletConnected: false, state: 'disconnected', rows: [] }
    }
    return {
      loading,
      walletConnected: true,
      state: 'ready',
      rows: [...input.fixtureRows],
    }
  }

  // Production: factual identity + wallet presence; sessions/recovery/alerts unavailable.
  const rows: PassportSecurityRow[] = [
    identityRow(input.verificationState ?? (input.address ? 'not_verified' : 'unavailable')),
    walletsRow(input.address ?? null, input.connectorName ?? null),
    unavailableRow(
      'sessions',
      'Active Sessions',
      'SS',
      'Session inventory is not available for Passport.',
    ),
    unavailableRow(
      'recovery',
      'Recovery Methods',
      'RC',
      'Recovery configuration is not available.',
    ),
    unavailableRow(
      'alerts',
      'Security Alerts',
      'AL',
      'No Passport security alert feed is available.',
    ),
  ]

  return {
    loading,
    walletConnected: Boolean(input.address),
    state: 'ready',
    rows,
  }
}
