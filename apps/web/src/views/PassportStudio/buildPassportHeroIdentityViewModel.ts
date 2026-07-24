/**
 * Pure builder for PassportHeroIdentityViewModel.
 * Production path: no Passport profile API exists — guest or wallet-only only.
 * Test/cert fixtures may pass partial overrides (test-only).
 */
import {
  VERIFICATION_LABELS,
  formatConnectedWalletsLabel,
  shortenWalletAddress,
  type PassportAccountType,
  type PassportHeroIdentityViewModel,
  type PassportIdentityAction,
  type PassportVerificationState,
} from './passportHeroIdentityTypes'

export type PassportHeroIdentityInput = {
  address?: string | null
  /** Explicit fixture override — production never supplies Passport profile rows. */
  fixture?: Partial<PassportHeroIdentityViewModel> | null
  /**
   * When true, treat identity profile source as unreachable (STATE F).
   * Distinct from “no Passport yet” (wallet-only).
   */
  sourceUnavailable?: boolean
  loading?: boolean
}

function resolveAction(args: {
  passportExists: boolean
  walletConnected: boolean
  managementRoute: string | null
  sourceAvailable: boolean
}): PassportIdentityAction {
  if (!args.sourceAvailable) {
    return { label: 'View Identity', href: '/passport', kind: 'view' }
  }
  if (args.passportExists && args.managementRoute) {
    return { label: 'Manage Passport', href: args.managementRoute, kind: 'manage' }
  }
  // No Create Passport route exists in the product today — do not invent one.
  if (args.walletConnected && !args.passportExists) {
    return null
  }
  return null
}

/**
 * Build a factual view model. Never defaults verification to verified.
 * Never invents ENS, member-since, account type, or Passport IDs.
 */
export function buildPassportHeroIdentityViewModel(
  input: PassportHeroIdentityInput = {},
): PassportHeroIdentityViewModel {
  if (input.fixture) {
    const base = buildFromLive({
      address: input.address,
      sourceUnavailable: input.sourceUnavailable,
      loading: input.loading,
    })
    const merged: PassportHeroIdentityViewModel = { ...base, ...input.fixture }
    merged.verificationLabel =
      input.fixture.verificationLabel ?? VERIFICATION_LABELS[merged.verificationState]
    merged.connectedWalletsLabel =
      input.fixture.connectedWalletsLabel ?? formatConnectedWalletsLabel(merged.connectedWalletCount)
    merged.handleDisplay = input.fixture.handleDisplay ?? resolveHandleDisplay(merged)
    return merged
  }

  return buildFromLive({
    address: input.address,
    sourceUnavailable: input.sourceUnavailable,
    loading: input.loading,
  })
}

function resolveHandleDisplay(vm: Pick<PassportHeroIdentityViewModel, 'handle' | 'passportExists' | 'walletConnected' | 'sourceAvailable'>): string {
  if (!vm.sourceAvailable) return 'Identity source unavailable'
  if (vm.handle) return vm.handle
  if (vm.passportExists) return 'Handle unavailable'
  if (vm.walletConnected) return 'No MARCO Passport yet'
  return 'Create or connect your MARCO Passport'
}

function buildFromLive(args: {
  address?: string | null
  sourceUnavailable?: boolean
  loading?: boolean
}): PassportHeroIdentityViewModel {
  const loading = Boolean(args.loading)
  const address = args.address ?? null
  const walletConnected = Boolean(address)
  const shortenedWallet = address ? shortenWalletAddress(address) : null

  // No Passport identity profile product exists — never claim PassportExists.
  const passportExists = false
  const sourceAvailable = !args.sourceUnavailable

  if (!sourceAvailable) {
    const count = walletConnected ? 1 : 0
    return {
      loading,
      sourceAvailable: false,
      passportExists: false,
      walletConnected,
      displayName: shortenedWallet ?? 'Guest',
      handle: null,
      handleDisplay: 'Identity source unavailable',
      verificationState: 'unavailable',
      verificationLabel: VERIFICATION_LABELS.unavailable,
      memberSince: '—',
      accountType: 'Unavailable',
      connectedWalletCount: count,
      connectedWalletsLabel: formatConnectedWalletsLabel(count),
      passportIdentifier: null,
      shortenedWallet,
      primaryIdentityAction: resolveAction({
        passportExists: false,
        walletConnected,
        managementRoute: null,
        sourceAvailable: false,
      }),
      managementRoute: null,
    }
  }

  if (!walletConnected) {
    return {
      loading,
      sourceAvailable: true,
      passportExists: false,
      walletConnected: false,
      displayName: 'Guest',
      handle: null,
      handleDisplay: 'Create or connect your MARCO Passport',
      verificationState: 'unavailable',
      verificationLabel: VERIFICATION_LABELS.unavailable,
      memberSince: '—',
      accountType: 'Guest',
      connectedWalletCount: 0,
      connectedWalletsLabel: formatConnectedWalletsLabel(0),
      passportIdentifier: null,
      shortenedWallet: null,
      primaryIdentityAction: null,
      managementRoute: null,
    }
  }

  // Wallet connected, no Passport profile — STATE B
  return {
    loading,
    sourceAvailable: true,
    passportExists: false,
    walletConnected: true,
    displayName: shortenedWallet ?? 'Guest',
    handle: null,
    handleDisplay: 'No MARCO Passport yet',
    verificationState: 'not_verified',
    verificationLabel: VERIFICATION_LABELS.not_verified,
    memberSince: '—',
    accountType: 'Guest',
    connectedWalletCount: 1,
    connectedWalletsLabel: formatConnectedWalletsLabel(1),
    passportIdentifier: null,
    shortenedWallet,
    primaryIdentityAction: null,
    managementRoute: null,
  }
}

/** Test-only helpers to construct certified state fixtures without shipping mock production data. */
export function fixturePassportIdentity(
  partial: Partial<PassportHeroIdentityViewModel> & {
    verificationState?: PassportVerificationState
    accountType?: PassportAccountType
  },
): PassportHeroIdentityViewModel {
  return buildPassportHeroIdentityViewModel({
    address: partial.walletConnected === false ? null : partial.shortenedWallet ? '0xabcdef0123456789abcdef0123456789abcdef01' : '0x8f1234567890abcdef1234567890abcdef7a3B',
    fixture: partial,
  })
}
