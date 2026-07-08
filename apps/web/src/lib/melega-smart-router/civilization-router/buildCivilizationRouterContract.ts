import wrapperAbi from '../wrapper/MelegaSmartRouterWrapper.abi.json'
import { MELEGA_SMART_ROUTER_ADAPTER_VERSION, MELEGA_SMART_ROUTER_ARCHITECTURE, MELEGA_SMART_ROUTER_PHASE } from '../types'
import { WRAPPER_SPEC_VERSION } from '../wrapper/spec'
import { getKerlRegistryVersion } from '../registry/kerlRegistry'
import { getTreasuryRuntimeRegistryVersion } from '../registry/runtimeRegistry'
import { getSmartRouterRegistryVersion } from '../registry/smartRouterRegistry'
import { buildBlockerAuditTable } from './blocker-audit'
import { buildChainRegistry, getKerlIntegrationStatus } from './chain-registry'
import {
  getAIServiceRoutingStatus,
  getBnbMainnetReadiness,
  getBnbTestnetReadiness,
  getNarrativeTradeStatus,
  buildRouteTypeMatrix,
} from './route-matrix'
import { getTreasuryRuntimeIntegrationStatus } from './treasury-integration'
import { CIVILIZATION_ROUTER_SCHEMA, CIVILIZATION_ROUTER_VERSION } from './types'

export const CIVILIZATION_ROUTER_CONTRACT_SCHEMA = 'melega.civilization-router-contract.v1' as const

/** Phase 10 — machine-readable civilization router contract. */
export function buildCivilizationRouterContract(asOf = new Date().toISOString().slice(0, 10)) {
  const chains = buildChainRegistry()
  const blockers = buildBlockerAuditTable().filter((r) => r.status === 'BLOCKED')
  const wrapperAddress = chains['56']?.wrapperAddress ?? null

  return {
    schema: CIVILIZATION_ROUTER_CONTRACT_SCHEMA,
    schemaVersion: CIVILIZATION_ROUTER_VERSION,
    routerVersion: CIVILIZATION_ROUTER_VERSION,
    wrapperAddress,
    wrapperStatus: wrapperAddress ? 'active' : 'BLOCKED_WRAPPER_NOT_DEPLOYED',
    adapterVersion: MELEGA_SMART_ROUTER_ADAPTER_VERSION,
    architecture: {
      current: MELEGA_SMART_ROUTER_ARCHITECTURE,
      target: MELEGA_SMART_ROUTER_PHASE.target,
    },
    ABI: {
      draftPath: 'apps/web/src/lib/melega-smart-router/wrapper/MelegaSmartRouterWrapper.abi.json',
      deployed: false,
      entries: wrapperAbi.length,
    },
    supportedChains: chains,
    supportedAssets: {
      '56': {
        MARCO: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
        registryRef: '/registry/assets/marco.json',
      },
      '97': null,
    },
    supportedRouteTypes: buildRouteTypeMatrix(),
    treasuryRouting: getTreasuryRuntimeIntegrationStatus(),
    D90: { status: 'NOT_DEFINED_IN_DEX', owner: 'Treasury Runtime', required: true },
    D99: { status: 'NOT_DEFINED_IN_DEX', owner: 'Treasury Runtime', required: true },
    KERLVersion: getKerlRegistryVersion(),
    KERLIntegration: getKerlIntegrationStatus(),
    TreasuryRuntimeVersion: getTreasuryRuntimeRegistryVersion(),
    CivilizationVersion: 'KIRI-CIVILIZATION-PHASE2',
    capabilities: {
      swapAdapter: MELEGA_SMART_ROUTER_ARCHITECTURE === 'ADAPTER',
      wrapperDeployed: Boolean(wrapperAddress),
      narrativeTrade: false,
      aiServiceRouting: false,
      multichainCanonical: false,
    },
    policies: {
      pricing: 'D87_DEX_PRICING_RATIFIED',
      treasury: 'FSC-01',
      referral: 'SRD-01',
      lpFee: 'unaffected-separate-from-protocol-fee',
    },
    phases: {
      bnbTestnet: getBnbTestnetReadiness(),
      bnbMainnet: getBnbMainnetReadiness(),
      narrativeTrade: getNarrativeTradeStatus(),
      aiServiceRouting: getAIServiceRoutingStatus(),
    },
    blockers,
    labsBinding: {
      smart_router_status: 'ADAPTER_PHASE1_PARTIAL',
      router_contract_status: 'BLOCKED_BY_MISSING_ROUTER_CONTRACT',
      narrative_trade_support: false,
      integrationContract: '/registry/smart-router/labs-integration-contract.json',
    },
    registries: {
      smartRouter: '/registry/smart-router/index.json',
      civilizationRouter: '/registry/smart-router/civilization-router-contract.json',
      treasury: '/registry/treasury/index.json',
      kerl: '/registry/kerl/index.json',
    },
    smartRouterRegistryVersion: getSmartRouterRegistryVersion(),
    wrapperSpecVersion: WRAPPER_SPEC_VERSION,
    lastVerifiedAt: asOf,
    disclaimer:
      'Constitutional economic router contract. No fake routing, placeholder addresses, or simulated execution. Wrapper address null until deployed and verified.',
  }
}

export function getCivilizationRouterVerdict(): string {
  const contract = buildCivilizationRouterContract()
  if (contract.wrapperAddress && contract.capabilities.narrativeTrade) {
    return 'CIVILIZATION_SMART_ROUTER_IMPLEMENTED'
  }
  if (contract.capabilities.swapAdapter) {
    return 'CIVILIZATION_SMART_ROUTER_PARTIAL'
  }
  return 'CIVILIZATION_SMART_ROUTER_BLOCKED'
}
