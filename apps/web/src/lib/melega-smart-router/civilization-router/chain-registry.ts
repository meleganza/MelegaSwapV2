import { readKerlMarcoToken, getKerlRegistryVersion, readKerlTreasuryCollector } from '../registry/kerlRegistry'
import { readTreasuryRuntimeCollector, getTreasuryRuntimeRegistryVersion } from '../registry/runtimeRegistry'
import { readSmartRouterChainProfile, getSmartRouterRegistryVersion } from '../registry/smartRouterRegistry'
import { getUnderlyingRouterEntry } from '../underlyingRouterRegistry'
import type { ChainRegistryEntry } from './types'

const ENV_MARCO_KEYS: Record<number, string> = {
  56: 'NEXT_PUBLIC_MARCO_TOKEN_BSC',
  97: 'NEXT_PUBLIC_MARCO_TOKEN_BSC_TESTNET',
}

const ENV_COLLECTOR_KEYS: Record<number, string> = {
  56: 'NEXT_PUBLIC_TREASURY_COLLECTOR_BSC',
  97: 'NEXT_PUBLIC_TREASURY_COLLECTOR_BSC_TESTNET',
}

function readEnvAddress(key: string | undefined): string | null {
  if (!key) return null
  const value = process.env[key]?.trim()
  return value && value.startsWith('0x') ? value : null
}

/**
 * Phase 6 — canonical registry resolution order:
 * 1. KERL Registry
 * 2. Treasury Runtime Registry
 * 3. Smart Router Registry
 * 4. env fallback (development only)
 */
export function resolveMarcoAddressKerlFirst(chainId: number): {
  address: string | null
  source: 'kerl' | 'treasury-runtime' | 'smart-router' | 'env' | 'missing'
} {
  const kerl = readKerlMarcoToken(chainId)
  if (kerl.available && kerl.marcoTokenAddress) {
    return { address: kerl.marcoTokenAddress, source: 'kerl' }
  }

  const profile = readSmartRouterChainProfile(chainId)
  if (profile?.registryVersion && kerl.available && kerl.marcoTokenAddress) {
    return { address: kerl.marcoTokenAddress, source: 'smart-router' }
  }

  const envAddress = readEnvAddress(ENV_MARCO_KEYS[chainId])
  if (envAddress && process.env.NODE_ENV !== 'production') {
    return { address: envAddress, source: 'env' }
  }

  return { address: null, source: 'missing' }
}

export function resolveCollectorKerlFirst(chainId: number): {
  address: string | null
  source: 'kerl' | 'treasury-runtime' | 'smart-router' | 'env' | 'missing'
} {
  const kerl = readKerlTreasuryCollector(chainId)
  if (kerl.available && kerl.collectorAddress) {
    return { address: kerl.collectorAddress, source: 'kerl' }
  }

  const runtime = readTreasuryRuntimeCollector(chainId)
  if (runtime.available && runtime.collectorAddress) {
    return { address: runtime.collectorAddress, source: 'treasury-runtime' }
  }

  return { address: null, source: 'missing' }
}

export function getKerlIntegrationStatus() {
  return {
    registryVersion: getKerlRegistryVersion(),
    mode: 'read-only-static-json',
    writable: false,
    resolutionOrder: ['KERL Registry', 'Treasury Runtime Registry', 'Smart Router Registry', 'env (dev only)'],
    treasuryCollectorPublished: false,
    marcoChainsIndexed: [56, 1, 137, 8453],
  }
}

export function buildChainRegistryEntry(chainId: number): ChainRegistryEntry {
  const profile = readSmartRouterChainProfile(chainId)
  const router = getUnderlyingRouterEntry(chainId)

  const kerlMarco = readKerlMarcoToken(chainId)
  const runtimeMarco = kerlMarco.available ? kerlMarco.marcoTokenAddress ?? null : null

  const runtimeCollector = readTreasuryRuntimeCollector(chainId)
  const collectorAddress = runtimeCollector.available ? runtimeCollector.collectorAddress ?? null : null

  const wrapperAddress = profile?.wrapperAddress ?? null
  const underlyingRouter = router.routerAddress ?? profile?.executionRouter ?? null

  const swapRoutes = ['STANDARD_SWAP', 'BUY_MARCO', 'SELL_MARCO'] as const
  const blockedRoutes = [
    'NARRATIVE_TRADE',
    'AI_SERVICE',
    'MARKETPLACE_SERVICE',
    'MARKETPLACE_SETTLEMENT',
    'TREASURY_TRANSFER',
    'INTERNAL_ROUTING',
    'REFERRAL',
    'PROPAGATION',
  ] as const

  const blockers: string[] = []
  if (!wrapperAddress) blockers.push('BLOCKED_WRAPPER_NOT_DEPLOYED')
  if (!underlyingRouter) blockers.push('BLOCKED_UNDERLYING_ROUTER_MISSING')
  if (!runtimeMarco) blockers.push('BLOCKED_CONFIG_MARCO_TOKEN_MISSING')
  if (!collectorAddress) blockers.push('BLOCKED_TREASURY_COLLECTOR_MISSING')
  if (!profile) blockers.push('BLOCKED_CHAIN_NOT_INDEXED')

  let status: ChainRegistryEntry['status'] = 'blocked'
  if (blockers.length === 0) status = 'active'
  else if (underlyingRouter && runtimeMarco) status = chainId === 56 ? 'partial' : 'blocked'

  const chainNames: Record<number, string> = {
    56: 'BNB Chain',
    97: 'BNB Testnet',
  }

  return {
    chainId,
    chainName: profile?.chainName ?? chainNames[chainId] ?? `Chain ${chainId}`,
    wrapperAddress,
    underlyingRouter,
    MARCO: runtimeMarco,
    treasuryCollector: collectorAddress,
    KERLRegistry: `/registry/kerl/index.json (${getKerlRegistryVersion()})`,
    TreasuryRuntime: `/registry/treasury/index.json (${getTreasuryRuntimeRegistryVersion()})`,
    supportedAssets: chainId === 56 ? ['MARCO', 'MXMX', 'WBNB'] : [],
    supportedRouteTypes: [...swapRoutes, ...blockedRoutes],
    status,
    blockerReason: blockers.length ? blockers.join('; ') : null,
    lastVerifiedAt: new Date().toISOString().slice(0, 10),
    version: getSmartRouterRegistryVersion(),
  }
}

export function buildChainRegistry(): Record<string, ChainRegistryEntry> {
  return {
    '56': buildChainRegistryEntry(56),
    '97': buildChainRegistryEntry(97),
  }
}
