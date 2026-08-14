/**
 * Passport V1 explicit surface state machine (pure).
 */

export type PassportSurfaceState =
  | 'DISCONNECTED'
  | 'CONNECTED_NO_PASSPORT'
  | 'CONNECTED_PASSPORT_UNVERIFIED'
  | 'CONNECTED_PASSPORT_VERIFIED'
  | 'LOADING_CURRENT_WALLET'
  | 'PARTIAL_WITH_FACTUAL_DATA'
  | 'SUCCESS'
  | 'ERROR_WITH_LAST_GOOD'

export type PassportIdentityFacts = {
  walletConnected: boolean
  walletLoading: boolean
  passportExists: boolean
  verificationState: 'verified' | 'pending' | 'not_verified' | 'review_required' | 'unavailable'
  sourceAvailable: boolean
  walletAddress: string | null
}

export type PassportDomainLoad = {
  identityLoading: boolean
  liquidityLoading: boolean
  farmsLoading: boolean
  poolsLoading: boolean
  projectsLoading: boolean
  anyDomainError: boolean
  anyDomainPartial: boolean
  hasLastGoodPositions: boolean
  hasAnyFactualPositions: boolean
}

export function resolvePassportSurfaceState(
  identity: PassportIdentityFacts,
  domains: PassportDomainLoad,
): PassportSurfaceState {
  if (!identity.walletConnected) return 'DISCONNECTED'
  if (identity.walletLoading || domains.identityLoading) return 'LOADING_CURRENT_WALLET'

  if (domains.anyDomainError && domains.hasLastGoodPositions) return 'ERROR_WITH_LAST_GOOD'
  if (domains.anyDomainPartial || domains.hasAnyFactualPositions) {
    if (domains.anyDomainPartial) return 'PARTIAL_WITH_FACTUAL_DATA'
  }

  if (identity.passportExists) {
    if (identity.verificationState === 'verified') {
      return domains.anyDomainPartial ? 'PARTIAL_WITH_FACTUAL_DATA' : 'CONNECTED_PASSPORT_VERIFIED'
    }
    if (
      identity.verificationState === 'not_verified' ||
      identity.verificationState === 'pending' ||
      identity.verificationState === 'review_required'
    ) {
      return 'CONNECTED_PASSPORT_UNVERIFIED'
    }
  }

  if (!identity.passportExists && identity.sourceAvailable) {
    if (domains.anyDomainPartial) return 'PARTIAL_WITH_FACTUAL_DATA'
    if (domains.hasAnyFactualPositions) return 'SUCCESS'
    return 'CONNECTED_NO_PASSPORT'
  }

  if (!identity.sourceAvailable && domains.hasAnyFactualPositions) {
    return 'PARTIAL_WITH_FACTUAL_DATA'
  }

  if (domains.hasAnyFactualPositions && !domains.anyDomainPartial) return 'SUCCESS'
  return 'CONNECTED_NO_PASSPORT'
}

export type CacheScope = {
  chainId: number | null
  wallet: string | null
  domain: string
  registryVersion?: string | null
}

export function passportCacheKey(scope: CacheScope): string {
  const wallet = scope.wallet?.toLowerCase() ?? 'none'
  const chain = scope.chainId ?? 'none'
  const reg = scope.registryVersion ?? '0'
  return `${chain}:${wallet}:${scope.domain}:v${reg}`
}

export function shouldRejectStaleResponse(args: {
  requestWallet: string | null
  requestChainId: number | null
  currentWallet: string | null
  currentChainId: number | null
  requestGeneration: number
  currentGeneration: number
}): boolean {
  if (args.requestGeneration !== args.currentGeneration) return true
  if ((args.requestWallet ?? '').toLowerCase() !== (args.currentWallet ?? '').toLowerCase()) return true
  if (args.requestChainId !== args.currentChainId) return true
  return false
}

export function clearOnWalletChange(args: {
  previousWallet: string | null
  nextWallet: string | null
}): boolean {
  const prev = args.previousWallet?.toLowerCase() ?? null
  const next = args.nextWallet?.toLowerCase() ?? null
  return prev !== next
}
