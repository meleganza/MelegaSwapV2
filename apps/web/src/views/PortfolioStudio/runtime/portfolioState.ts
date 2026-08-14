/**
 * Portfolio surface state — wallet + domains only. No Passport / identity / verification.
 */

export type PortfolioSurfaceState =
  | 'DISCONNECTED'
  | 'LOADING'
  | 'READY'
  | 'PARTIAL'
  | 'ERROR_WITH_LAST_GOOD'

export type PortfolioDomainLoad = {
  walletLoading: boolean
  liquidityLoading: boolean
  farmsLoading: boolean
  poolsLoading: boolean
  anyDomainError: boolean
  anyDomainPartial: boolean
  hasLastGoodPositions: boolean
  hasAnyFactualPositions: boolean
}

export function resolvePortfolioSurfaceState(
  walletConnected: boolean,
  domains: PortfolioDomainLoad,
): PortfolioSurfaceState {
  if (!walletConnected) return 'DISCONNECTED'
  if (domains.walletLoading) return 'LOADING'
  if (domains.anyDomainError && domains.hasLastGoodPositions) return 'ERROR_WITH_LAST_GOOD'
  if (domains.anyDomainPartial) return 'PARTIAL'
  if (domains.hasAnyFactualPositions) return 'READY'
  return 'READY'
}

export type CacheScope = {
  chainId: number | null
  wallet: string | null
  domain: string
}

export function portfolioCacheKey(scope: CacheScope): string {
  const wallet = scope.wallet?.toLowerCase() ?? 'none'
  const chain = scope.chainId ?? 'none'
  return `${chain}:${wallet}:${scope.domain}`
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
