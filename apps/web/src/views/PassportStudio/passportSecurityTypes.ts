/**
 * PASSPORT_MODULE_007 — Security trust-summary contracts.
 * Never invents scores, risk, sessions, recovery, or alerts.
 */

export const SECURITY_BADGES = [
  'Verified',
  'Pending',
  'Healthy',
  'Attention',
  'Unavailable',
  'Configured',
  'Not Configured',
  'Review',
] as const
export type PassportSecurityBadge = (typeof SECURITY_BADGES)[number]

export type PassportSecurityBadgeTone = 'positive' | 'warning' | 'neutral' | 'attention'

export type PassportSecurityRowId =
  | 'identity'
  | 'wallets'
  | 'sessions'
  | 'recovery'
  | 'alerts'

export type PassportSecurityRow = {
  id: PassportSecurityRowId
  title: string
  description: string
  iconMark: string
  badge: PassportSecurityBadge
  badgeTone: PassportSecurityBadgeTone
  actionLabel: string | null
  actionHref: string | null
  actionAriaLabel: string | null
  sourceAvailable: boolean
}

export type PassportSecurityViewModel = {
  loading: boolean
  walletConnected: boolean
  state: 'disconnected' | 'ready'
  rows: PassportSecurityRow[]
}

declare global {
  interface Window {
    __PASSPORT_MODULE_007_FIXTURE__?: {
      walletConnected?: boolean
      rows?: PassportSecurityRow[]
    }
  }
}
