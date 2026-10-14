/**
 * Read-only BNB slice of Beefy's public catalog.
 * APY and TVL are copied from api.beefy.finance. Missing numbers stay null.
 */

export const EARN_CATALOG_SOURCE = 'https://api.beefy.finance'
export const EARN_CATALOG_CHAIN_ID = 56
export const EARN_CATALOG_LIMIT = 12
export const EARN_CATALOG_STALE_MS = 15 * 60 * 1000
export const EARN_CATALOG_TIMEOUT_MS = 8_000

const VAULT_ID = /^[a-z0-9-]{1,80}$/

const RISK_FLAGS = [
  'complex',
  'curated',
  'notAudited',
  'notBattleTested',
  'notCorrelated',
  'notTimelocked',
  'notVerified',
  'synthAsset',
] as const

export interface SourceRisk {
  updatedAt: string | null
  raised: string[]
}

export interface EarnOpportunity {
  id: string
  name: string
  assets: string[]
  protocol: 'PancakeSwap'
  chainId: 56
  apyDecimal: number | null
  tvlUsd: number | null
  source: typeof EARN_CATALOG_SOURCE
  updatedAt: null
  fetchedAt: string
  stale: boolean
  href: string
  receiptAddress: string | null
  receiptDecimals: number | null
  sourceRisk: SourceRisk | null
  feeNote: string
  /** Beefy does not return a net-of-fee yield. This stays null. */
  netYield: null
  withdrawalNote: 'This source did not return withdrawal conditions.'
  executable: false
  deposit: false
  withdraw: false
}

export interface EarnCatalog {
  ok: boolean
  code?: 'TIMEOUT' | 'UNAVAILABLE' | 'CHAIN_MISMATCH'
  schema: 'melega.next-gen.earn-catalog.v1'
  chainId: 56
  source: typeof EARN_CATALOG_SOURCE
  fetchedAt: string | null
  count: number
  opportunities: EarnOpportunity[]
  executable: false
  deposit: false
}

export function emptyCatalog(code: EarnCatalog['code'], fetchedAt: string | null = null): EarnCatalog {
  return {
    ok: false,
    code,
    schema: 'melega.next-gen.earn-catalog.v1',
    chainId: 56,
    source: EARN_CATALOG_SOURCE,
    fetchedAt,
    count: 0,
    opportunities: [],
    executable: false,
    deposit: false,
  }
}

export function formatReportedApy(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) return null
  return `${(value * 100).toFixed(2)}%`
}

export function formatReportedTvl(value: number | null): string | null {
  if (value === null || !Number.isFinite(value) || value < 0) return null
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function officialHref(id: string): string | null {
  if (!VAULT_ID.test(id)) return null
  return `https://app.beefy.com/vault/${id}`
}

function sourceRisk(value: unknown): SourceRisk | null {
  if (!value || typeof value !== 'object') return null
  const risks = value as Record<string, unknown>
  const updatedAt =
    typeof risks.updatedAt === 'number' && Number.isFinite(risks.updatedAt)
      ? new Date(risks.updatedAt * 1000).toISOString()
      : null
  return {
    updatedAt,
    raised: RISK_FLAGS.filter((flag) => risks[flag] === true),
  }
}

function receiptOf(vault: Record<string, unknown>): { address: string | null; decimals: number | null } {
  const address = typeof vault.earnedTokenAddress === 'string' && /^0x[0-9a-fA-F]{40}$/.test(vault.earnedTokenAddress) ? vault.earnedTokenAddress : null
  const decimals =
    typeof vault.tokenDecimals === 'number' && Number.isInteger(vault.tokenDecimals) && vault.tokenDecimals >= 0 && vault.tokenDecimals <= 36
      ? vault.tokenDecimals
      : null
  return { address, decimals }
}

function feeNote(vault: Record<string, unknown>): string {
  const fee = vault.withdrawalFee
  if (typeof fee === 'number' && Number.isFinite(fee)) return `Beefy withdrawalFee ${fee}`
  if (typeof fee === 'string' && fee.trim().length > 0) return `Beefy withdrawalFee ${fee.trim()}`
  return 'This source did not return a fee.'
}

export function buildEarnCatalog(input: {
  vaults: unknown
  apy: unknown
  tvl: unknown
  fetchedAt: string
  nowMs: number
}): EarnCatalog {
  const fetchedMs = Date.parse(input.fetchedAt)
  if (!Number.isFinite(fetchedMs)) return emptyCatalog('UNAVAILABLE')
  if (!Array.isArray(input.vaults)) return emptyCatalog('UNAVAILABLE', input.fetchedAt)
  const apyMap = input.apy && typeof input.apy === 'object' ? (input.apy as Record<string, unknown>) : {}
  const tvlRoot = input.tvl && typeof input.tvl === 'object' ? (input.tvl as Record<string, unknown>) : {}
  const bscTvl = tvlRoot['56'] && typeof tvlRoot['56'] === 'object' ? (tvlRoot['56'] as Record<string, unknown>) : {}
  const stale = input.nowMs - fetchedMs > EARN_CATALOG_STALE_MS
  const rows: EarnOpportunity[] = []
  input.vaults.forEach((value) => {
    if (!value || typeof value !== 'object') return
    const vault = value as Record<string, unknown>
    if (vault.chain !== 'bsc' || vault.status !== 'active' || vault.platformId !== 'pancakeswap') return
    if (typeof vault.id !== 'string') return
    const href = officialHref(vault.id)
    if (!href) return
    const assets = Array.isArray(vault.assets) ? vault.assets.filter((asset): asset is string => typeof asset === 'string' && asset.length > 0) : []
    if (assets.length === 0) return
    const name = typeof vault.name === 'string' && vault.name.length > 0 ? vault.name : assets.join(' / ')
    const receipt = receiptOf(vault)
    rows.push({
      id: vault.id,
      name,
      assets,
      protocol: 'PancakeSwap',
      chainId: 56,
      apyDecimal: finiteOrNull(apyMap[vault.id]),
      tvlUsd: finiteOrNull(bscTvl[vault.id]),
      source: EARN_CATALOG_SOURCE,
      updatedAt: null,
      fetchedAt: input.fetchedAt,
      stale,
      href,
      receiptAddress: receipt.address,
      receiptDecimals: receipt.decimals,
      sourceRisk: sourceRisk(vault.risks),
      feeNote: feeNote(vault),
      netYield: null,
      withdrawalNote: 'This source did not return withdrawal conditions.',
      executable: false,
      deposit: false,
      withdraw: false,
    })
  })
  rows.sort((left, right) => {
    if (left.tvlUsd === null && right.tvlUsd === null) return left.id < right.id ? -1 : 1
    if (left.tvlUsd === null) return 1
    if (right.tvlUsd === null) return -1
    if (left.tvlUsd !== right.tvlUsd) return right.tvlUsd - left.tvlUsd
    return left.id < right.id ? -1 : 1
  })
  const opportunities = rows.slice(0, EARN_CATALOG_LIMIT)
  return {
    ok: true,
    schema: 'melega.next-gen.earn-catalog.v1',
    chainId: 56,
    source: EARN_CATALOG_SOURCE,
    fetchedAt: input.fetchedAt,
    count: opportunities.length,
    opportunities,
    executable: false,
    deposit: false,
  }
}
