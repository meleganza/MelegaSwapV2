/**
 * Verified live DEX handoffs. Paths were read from the canonical app and
 * checked with an ordinary GET against https://www.melega.finance on 2026-10-15.
 * This module does not quote, pay, bridge, or deploy.
 */

export const LIVE_DEX_ORIGIN = 'https://www.melega.finance'

export const LIVE_DEX_LINKS = {
  projects: `${LIVE_DEX_ORIGIN}/projects`,
  projectsTrending: `${LIVE_DEX_ORIGIN}/projects?sort=trending`,
  tokensBnb: `${LIVE_DEX_ORIGIN}/info/bsc`,
  bridge: `${LIVE_DEX_ORIGIN}/bridge`,
  createToken: `${LIVE_DEX_ORIGIN}/list?intent=create-token`,
  featured: `${LIVE_DEX_ORIGIN}/list?intent=create-project#featured`,
  trendBoost: `${LIVE_DEX_ORIGIN}/list?intent=create-project#trend-boost`,
  premiumProject: `${LIVE_DEX_ORIGIN}/list?intent=create-project`,
} as const

const NETWORKS = {
  bnb: { label: 'BNB Smart Chain', chainId: 56 },
  polygon: { label: 'Polygon', chainId: 137 },
  robinhood: { label: 'Robinhood Chain', chainId: 4663 },
  solana: { label: 'Solana', chainId: null },
  arc: { label: 'Arc', chainId: 5042 },
  base: { label: 'Base', chainId: 8453 },
} as const

type MarcoNetworkId = keyof typeof NETWORKS

/** Public pairs only. Mirrors MARCO_WAVE1_ROUTE_ACTIVATION entries that are true. */
const PUBLIC_MARCO_PAIRS: ReadonlyArray<readonly [MarcoNetworkId, MarcoNetworkId]> = [
  ['bnb', 'polygon'],
  ['polygon', 'bnb'],
  ['bnb', 'robinhood'],
  ['robinhood', 'bnb'],
  ['bnb', 'solana'],
  ['solana', 'bnb'],
  ['bnb', 'arc'],
  ['arc', 'bnb'],
]

export interface MarcoPublicPair {
  fromId: MarcoNetworkId
  toId: MarcoNetworkId
  fromLabel: string
  toLabel: string
  fromChainId: number | null
  toChainId: number | null
}

export function isPublicMarcoPair(from: string, to: string): boolean {
  return PUBLIC_MARCO_PAIRS.some(([left, right]) => left === from && right === to)
}

export function marcoPublicPairs(): MarcoPublicPair[] {
  return PUBLIC_MARCO_PAIRS.map(([fromId, toId]) => ({
    fromId,
    toId,
    fromLabel: NETWORKS[fromId].label,
    toLabel: NETWORKS[toId].label,
    fromChainId: NETWORKS[fromId].chainId,
    toChainId: NETWORKS[toId].chainId,
  }))
}

export function isLiveDexHref(href: string): boolean {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return false
  }
  return url.protocol === 'https:' && url.hostname === 'www.melega.finance' && url.username === '' && url.password === ''
}

const PROJECT_SLUG = /^[a-z0-9-]{1,80}$/
const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/
const TOKEN_CHAIN_PATH: Record<number, string> = {
  1: 'eth',
  56: 'bsc',
  137: 'polygon',
  8453: 'base',
}

export interface BoostPlacement {
  orderId: string
  projectSlug: string
  projectHref: string
  chainId: number
  tokenHref: string | null
  startsAt: string | null
  endsAt: string | null
}

function textOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function parsePlacement(row: unknown): BoostPlacement | null {
  if (!row || typeof row !== 'object') return null
  const record = row as Record<string, unknown>
  const orderId = textOrNull(record.orderId)
  const projectSlug = textOrNull(record.projectSlug)
  if (!orderId || !projectSlug || !PROJECT_SLUG.test(projectSlug)) return null
  if (typeof record.chainId !== 'number' || !Number.isFinite(record.chainId)) return null
  const projectHref = `${LIVE_DEX_ORIGIN}/@${projectSlug}/`
  if (!isLiveDexHref(projectHref)) return null
  let tokenHref: string | null = null
  const contract = record.projectContract
  const chainPath = TOKEN_CHAIN_PATH[record.chainId]
  if (typeof contract === 'string' && EVM_ADDRESS.test(contract) && chainPath) {
    const candidate = `${LIVE_DEX_ORIGIN}/token/${chainPath}/${contract}`
    tokenHref = isLiveDexHref(candidate) ? candidate : null
  }
  return {
    orderId,
    projectSlug,
    projectHref,
    chainId: record.chainId,
    tokenHref,
    startsAt: textOrNull(record.startsAt),
    endsAt: textOrNull(record.endsAt),
  }
}

export function parseTrendBoostActive(payload: unknown): { ok: true; placements: BoostPlacement[] } | { ok: false; placements: [] } {
  if (!payload || typeof payload !== 'object') return { ok: false, placements: [] }
  const body = payload as Record<string, unknown>
  if (body.schema !== 'melega.trend-boost-active.v1' || !Array.isArray(body.placements)) {
    return { ok: false, placements: [] }
  }
  return { ok: true, placements: body.placements.flatMap((row) => {
    const parsed = parsePlacement(row)
    return parsed ? [parsed] : []
  }) }
}
