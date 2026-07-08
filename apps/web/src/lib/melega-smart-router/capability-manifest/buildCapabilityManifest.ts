import { getMarcoRegistryEntry } from '../marcoRegistry'
import { getTreasuryCollectorEntry } from '../treasuryCollectorRegistry'
import { getUnderlyingRouterEntry } from '../underlyingRouterRegistry'
import { readSmartRouterChainProfile } from '../registry/smartRouterRegistry'
import { MELEGA_SMART_ROUTER_ADAPTER_VERSION } from '../execution-manifest/types'
import {
  CAPABILITY_MANIFEST_SCHEMA,
  type CapabilityEntry,
  type CapabilityManifest,
} from './types'

function entry(
  id: CapabilityEntry['id'],
  state: 'supported' | 'planned' | 'blocked',
  reason: string,
  introducedIn: string,
  deprecatedIn: string | null = null,
): CapabilityEntry {
  return {
    id,
    supported: state === 'supported',
    planned: state === 'planned',
    blocked: state === 'blocked',
    reason,
    introducedIn,
    deprecatedIn,
  }
}

/** Build the full Smart Router capability manifest — optionally scoped to a chain. */
export function buildCapabilityManifest(chainId?: number): CapabilityManifest {
  const marco = chainId ? getMarcoRegistryEntry(chainId) : null
  const collector = chainId ? getTreasuryCollectorEntry(chainId) : null
  const router = chainId ? getUnderlyingRouterEntry(chainId) : null
  const profile = chainId ? readSmartRouterChainProfile(chainId) : null

  const marcoReady = marco?.status === 'active' && Boolean(marco.marcoTokenAddress)
  const collectorReady = collector?.status === 'active' && Boolean(collector?.collectorAddress)
  const routerReady = router?.status !== 'missing' && Boolean(router?.routerAddress)
  const chainRoutingReady = chainId ? marcoReady && collectorReady && routerReady : false

  return {
    schema: CAPABILITY_MANIFEST_SCHEMA,
    version: MELEGA_SMART_ROUTER_ADAPTER_VERSION,
    chainId,
    capabilities: [
      entry(
        'BUY_MARCO',
        marcoReady ? 'supported' : chainId ? 'blocked' : 'supported',
        marcoReady || !chainId
          ? 'Output token MARCO address triggers 20 bps protocol fee incentive per D87 pricing policy.'
          : 'MARCO registry entry missing for active chain.',
        '2.5.0',
      ),
      entry(
        'SELL_MARCO',
        marcoReady ? 'supported' : chainId ? 'blocked' : 'supported',
        marcoReady || !chainId
          ? 'Input token MARCO with non-MARCO output uses standard 30 bps protocol fee.'
          : 'MARCO registry entry missing for active chain.',
        '2.5.0',
      ),
      entry(
        'STANDARD_SWAP',
        chainRoutingReady ? 'supported' : chainId ? 'planned' : 'supported',
        chainRoutingReady || !chainId
          ? 'Exact-input swaps route through Pancake Smart Router via Phase 1 ADAPTER.'
          : 'Registry prerequisites incomplete for active chain.',
        '2.5.0',
      ),
      entry(
        'LP_SEPARATION',
        'supported',
        'LP fees remain with liquidity providers — never enter FSC-01 or protocol fee math.',
        '2.5.0',
      ),
      entry(
        'TREASURY_HANDOFF',
        collectorReady ? 'supported' : 'planned',
        collectorReady
          ? 'DEX forwards gross protocol fee metadata to Treasury Runtime post-confirmation.'
          : 'Treasury collector not yet published in Runtime registry.',
        '2.5.0',
      ),
      entry(
        'REGISTRY_LOOKUP',
        'supported',
        'MARCO, collector, and execution router resolved via Runtime → KERL → env waterfall.',
        '2.5.0',
      ),
      entry(
        'CHAIN_ROUTING',
        chainRoutingReady ? 'supported' : 'planned',
        chainRoutingReady
          ? `Chain ${chainId} has execution router, MARCO, and collector resolution.`
          : 'Per-chain registry publication pending.',
        '2.5.0',
      ),
      entry('EXACT_INPUT', 'supported', 'Only exact-input swaps are certified in Phase 1 ADAPTER.', '2.5.0'),
      entry(
        'EXACT_OUTPUT',
        'blocked',
        'Inverse fee math not certified — SMART_ROUTER_EXACT_OUTPUT_UNSUPPORTED.',
        '2.5.0',
      ),
      entry(
        'FEE_ON_TRANSFER',
        'blocked',
        'Fee-on-transfer tokens blocked until balance-delta verification certified.',
        '2.5.0',
      ),
      entry(
        'MULTICHAIN',
        'planned',
        'Multi-chain profiles indexed; mainnet readiness gated per chain in registry.',
        '2.5.0',
      ),
      entry(
        'WRAPPER',
        profile?.wrapperStatus === 'active' ? 'supported' : 'planned',
        profile?.wrapperStatus === 'active'
          ? 'Constitutional wrapper deployed and indexed in smart-router registry.'
          : 'Wrapper spec ratified — on-chain deployment pending audit.',
        '2.5.0',
      ),
      entry(
        'ADAPTER',
        'supported',
        'Current execution layer — economic metadata above Pancake Smart Router without contract mutation.',
        '2.5.0',
        profile?.wrapperStatus === 'active' ? '2.5.0' : null,
      ),
    ],
  }
}
