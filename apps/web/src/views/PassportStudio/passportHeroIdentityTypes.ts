/**
 * PASSPORT_MODULE_001 — normalized identity view model (presentation contract).
 * Production never fabricates Passport profile fields.
 */

export type PassportVerificationState =
  | 'verified'
  | 'pending'
  | 'not_verified'
  | 'review_required'
  | 'unavailable'

export type PassportAccountType =
  | 'Individual'
  | 'Business'
  | 'Organization'
  | 'Guest'
  | 'Unavailable'

export type PassportIdentityActionKind = 'manage' | 'view' | 'create' | 'none'

export type PassportIdentityAction = {
  label: string
  href: string
  kind: PassportIdentityActionKind
} | null

export type PassportHeroIdentityViewModel = {
  loading: boolean
  /** False when the Passport identity profile source cannot be reached. */
  sourceAvailable: boolean
  passportExists: boolean
  walletConnected: boolean
  displayName: string
  handle: string | null
  /** Resolved one-line handle / fallback copy shown under the name. */
  handleDisplay: string
  verificationState: PassportVerificationState
  verificationLabel: string
  memberSince: string
  accountType: PassportAccountType
  connectedWalletCount: number
  connectedWalletsLabel: string
  passportIdentifier: string | null
  shortenedWallet: string | null
  primaryIdentityAction: PassportIdentityAction
  managementRoute: string | null
}

export const VERIFICATION_LABELS: Record<PassportVerificationState, string> = {
  verified: 'ID VERIFIED',
  pending: 'PENDING',
  not_verified: 'NOT VERIFIED',
  review_required: 'REVIEW REQUIRED',
  unavailable: 'UNAVAILABLE',
}

export function shortenWalletAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function formatConnectedWalletsLabel(count: number): string {
  if (count <= 0) return '0 wallets'
  if (count === 1) return '1 wallet'
  return `${count} wallets`
}
