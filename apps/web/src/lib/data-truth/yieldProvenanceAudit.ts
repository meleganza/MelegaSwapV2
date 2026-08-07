/**
 * Config-first provenance audit for Farms / Pools ACTIVE inventory.
 * Excludes uncertified / cross-chain-mismatched entries. Never invents deployments.
 */
import { getMasterChefAddress } from 'utils/addressHelpers'
import {
  LIVE_YIELD_CHAIN_IDS,
  listNormalizedFarms,
  type NormalizedFarmInventoryRow,
} from './globalYieldInventory'
import { listGeneratedLivePools } from './poolConfigPreviewCards'

export type ProvenanceVerdict = 'include' | 'exclude'

export type FarmProvenanceRow = {
  identity: string
  chainId: number
  masterChef: string
  pid: number
  lpAddress: string
  token0Symbol: string
  token1Symbol: string
  token0ChainId: number | null
  token1ChainId: number | null
  source: string
  verdict: ProvenanceVerdict
  reasons: string[]
}

export type PoolProvenanceRow = {
  identity: string
  chainId: number
  contractAddress: string
  stakeSymbol?: string
  rewardSymbol?: string
  source: string
  verdict: ProvenanceVerdict
  reasons: string[]
}

function isAddr(v?: string | null): boolean {
  return Boolean(v && /^0x[a-fA-F0-9]{40}$/i.test(v))
}

function auditFarmRow(row: NormalizedFarmInventoryRow): FarmProvenanceRow {
  const reasons: string[] = []
  const mc = (row.masterChef || getMasterChefAddress(row.chainId) || '').toLowerCase()
  if (!isAddr(mc) || mc === '0x0000000000000000000000000000000000000000') {
    reasons.push('missing_or_zero_masterchef')
  }
  if (!isAddr(row.lpAddress)) reasons.push('invalid_lp_address')
  if (row.pid == null || row.pid === 0) reasons.push('pid_zero_or_missing')
  if (String(row.multiplier ?? '').toUpperCase() === '0X') reasons.push('zero_multiplier')

  const t0 = row.config?.token
  const t1 = row.config?.quoteToken
  const t0Chain = t0?.chainId != null ? Number(t0.chainId) : null
  const t1Chain = t1?.chainId != null ? Number(t1.chainId) : null
  if (t0Chain != null && t0Chain !== row.chainId) reasons.push('token0_chain_mismatch')
  if (t1Chain != null && t1Chain !== row.chainId) reasons.push('token1_chain_mismatch')
  if (!row.token0Symbol || !row.token1Symbol) reasons.push('missing_pair_symbols')

  // Symbol-only identity is forbidden as sole key — require chain+mc+pid
  if (!row.identity.startsWith(`${row.chainId}:`)) reasons.push('identity_not_chain_scoped')

  return {
    identity: row.identity,
    chainId: row.chainId,
    masterChef: mc,
    pid: row.pid,
    lpAddress: row.lpAddress,
    token0Symbol: row.token0Symbol,
    token1Symbol: row.token1Symbol,
    token0ChainId: t0Chain,
    token1ChainId: t1Chain,
    source: row.source,
    verdict: reasons.length ? 'exclude' : 'include',
    reasons,
  }
}

export function auditFarmProvenance(): {
  pipeline: 'melega-global-data-truth-v1'
  chains: number[]
  rows: FarmProvenanceRow[]
  included: number
  excluded: number
  byChain: Record<number, { included: number; excluded: number }>
} {
  const rows = listNormalizedFarms().map(auditFarmRow)
  const byChain: Record<number, { included: number; excluded: number }> = {}
  for (const id of LIVE_YIELD_CHAIN_IDS) byChain[id] = { included: 0, excluded: 0 }
  for (const r of rows) {
    if (!byChain[r.chainId]) byChain[r.chainId] = { included: 0, excluded: 0 }
    if (r.verdict === 'include') byChain[r.chainId].included += 1
    else byChain[r.chainId].excluded += 1
  }
  return {
    pipeline: 'melega-global-data-truth-v1',
    chains: [...LIVE_YIELD_CHAIN_IDS],
    rows,
    included: rows.filter((r) => r.verdict === 'include').length,
    excluded: rows.filter((r) => r.verdict === 'exclude').length,
    byChain,
  }
}

export function auditPoolProvenance(): {
  pipeline: 'melega-global-data-truth-v1'
  chains: number[]
  rows: PoolProvenanceRow[]
  included: number
  excluded: number
  byChain: Record<number, { included: number; excluded: number }>
} {
  const generated = listGeneratedLivePools()
  const rows: PoolProvenanceRow[] = generated.map((p) => {
    const reasons: string[] = []
    const addr = String(p.contractAddress ?? '').toLowerCase()
    const chainId = Number(p.chainId)
    const identity = `${chainId}:${addr}`
    if (!LIVE_YIELD_CHAIN_IDS.includes(chainId as (typeof LIVE_YIELD_CHAIN_IDS)[number])) {
      reasons.push('chain_not_live')
    }
    if (!isAddr(addr)) reasons.push('invalid_contract')
    if (!p.stakeSymbol || !p.rewardSymbol) reasons.push('missing_token_symbols')
    return {
      identity,
      chainId,
      contractAddress: addr,
      stakeSymbol: p.stakeSymbol,
      rewardSymbol: p.rewardSymbol,
      source: `poolsLiveInventory.generated.json/${chainId}`,
      verdict: reasons.length ? 'exclude' : 'include',
      reasons,
    }
  })
  const byChain: Record<number, { included: number; excluded: number }> = {}
  for (const id of LIVE_YIELD_CHAIN_IDS) byChain[id] = { included: 0, excluded: 0 }
  for (const r of rows) {
    if (!byChain[r.chainId]) byChain[r.chainId] = { included: 0, excluded: 0 }
    if (r.verdict === 'include') byChain[r.chainId].included += 1
    else byChain[r.chainId].excluded += 1
  }
  return {
    pipeline: 'melega-global-data-truth-v1',
    chains: [...LIVE_YIELD_CHAIN_IDS],
    rows,
    included: rows.filter((r) => r.verdict === 'include').length,
    excluded: rows.filter((r) => r.verdict === 'exclude').length,
    byChain,
  }
}

/** ACTIVE farm identities that pass provenance (for inventory filters). */
export function certifiedFarmIdentities(): Set<string> {
  return new Set(auditFarmProvenance().rows.filter((r) => r.verdict === 'include').map((r) => r.identity))
}
