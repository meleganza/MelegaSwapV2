import {
  DEX_CAPABILITY_AUDIT_AS_OF,
  DEX_CAPABILITY_AUDIT_DISCLAIMER,
  DEX_CAPABILITY_AUDIT_ENTRIES,
  DEX_CAPABILITY_AUDIT_VERSION,
} from './audit-data'
import { DexCapabilityAuditManifest } from './audit-types'

const REUSABLE_FLOWS = [
  '/add — add liquidity and implicit pool creation',
  '/remove — remove liquidity',
  '/swap — swap with V2 + Smart Router',
  '/farms — participate in MasterChef farms',
  '/pools — participate in syrup staking pools',
  '/ilo — BSC legacy IFO pad',
  '/launch — Mission 12 capability console',
  '/new-project — economic activation read model',
  '/presence — economic presence registry',
  'Token import by address — ImportToken local session',
]

const HIGHEST_RISK_GAPS = [
  'create_farm — no user deploy; MasterChef governance only',
  'create_staking_pool — no user deploy; pools.tsx static config',
  'token_list_management — remote lists disabled; governance undefined',
  'swap_routing / smart_router — production-critical; must not be modified by factory missions',
  'wallet_integration — production-critical; forbidden modification surface',
]

const RECOMMENDED_MISSION_14 =
  'Mission 14: DEX Factory Write Layer — wire Mission 12 capabilities to existing LIVE flows (/add, /remove, /swap) first; define governance ops path for farm/pool creation; do not duplicate router, MasterChef, or wallet surfaces.'

export const resolveDexCapabilityAudit = (): DexCapabilityAuditManifest => {
  const capabilities = DEX_CAPABILITY_AUDIT_ENTRIES

  return {
    manifest: 'manifest://melega/platform/dex-capability-audit@0.1.0',
    api_version: DEX_CAPABILITY_AUDIT_VERSION,
    phase: 'repository_audit',
    mission: 'MISSION_13',
    audit_only: true,
    as_of: DEX_CAPABILITY_AUDIT_AS_OF,
    disclaimer: DEX_CAPABILITY_AUDIT_DISCLAIMER,
    summary: {
      total: capabilities.length,
      live: capabilities.filter((entry) => entry.status === 'LIVE').length,
      config_only: capabilities.filter((entry) => entry.status === 'CONFIG_ONLY').length,
      partial: capabilities.filter((entry) => entry.status === 'PARTIAL').length,
      missing: capabilities.filter((entry) => entry.status === 'MISSING').length,
      deprecated: capabilities.filter((entry) => entry.status === 'DEPRECATED').length,
    },
    chain_support: {
      wagmi_chains: [1, 56, 137, 8453],
      multi_chain_features: ['swap', 'liquidity', 'farms', 'pools', 'add', 'remove'],
      bsc_only_features: ['ilo', 'nft_mint', 'zap', 'find'],
    },
    capabilities,
    recommended_mission_14: RECOMMENDED_MISSION_14,
    highest_risk_gaps: HIGHEST_RISK_GAPS,
    reusable_flows: REUSABLE_FLOWS,
  }
}

export const getDexCapabilityById = (id: string) =>
  DEX_CAPABILITY_AUDIT_ENTRIES.find((entry) => entry.id === id)
