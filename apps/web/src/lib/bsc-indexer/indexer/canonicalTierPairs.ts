import { bscTokens } from '@pancakeswap/tokens'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { MELEGA_FACTORY_BSC, MARCO_WBNB_PAIR_BSC } from '../constants'
import { rpcCall } from '../rpc/chunkedLogs'
import { FEATURED_PAIR_SLUG } from '../v2/paths'
import type { TierPairWatch } from './tierInventory'

const WBNB = bscTokens.wbnb.address.toLowerCase()
const USDT = bscTokens.usdt.address.toLowerCase()
const USDC = bscTokens.usdc.address.toLowerCase()
const CAKE = bscTokens.cake.address.toLowerCase()
const MARCO = MARCO_BSC_ADDRESS.toLowerCase()

/** R786 — explicit Tier 1 candidates; only included when Factory + reserves prove the pair. */
const TIER1_SYMBOL_PAIRS: Array<[string, string]> = [
  ['MARCO', 'WBNB'],
  ['MARCO', 'USDT'],
  ['MARCO', 'USDC'],
  ['MARCO', 'CAKE'],
  ['MARCO', 'ASTER'],
  ['WBNB', 'USDT'],
  ['WBNB', 'USDC'],
  ['CAKE', 'WBNB'],
]

const SYMBOL_ADDRESS: Record<string, string> = {
  MARCO,
  WBNB,
  USDT,
  USDC,
  CAKE,
  ASTER: '0x000ae314e9b79e1f9de9d5e6a1f165a830881d62',
}

function encodeAddress(addr: string): string {
  return addr.toLowerCase().replace('0x', '').padStart(64, '0')
}

function decodeAddress(hex: string): string {
  return `0x${hex.slice(-40)}`
}

function decodeUint(hex: string): bigint {
  const normalized = hex.startsWith('0x') ? hex : `0x${hex}`
  return BigInt(normalized)
}

async function factoryGetPair(tokenA: string, tokenB: string): Promise<string | null> {
  const [a, b] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
  const data = `0xe6a43903${encodeAddress(a)}${encodeAddress(b)}`
  const raw = await rpcCall<string>('eth_call', [{ to: MELEGA_FACTORY_BSC, data }, 'latest'])
  const pair = decodeAddress(raw)
  if (pair === '0x0000000000000000000000000000000000000000') return null
  return pair.toLowerCase()
}

async function pairReserves(pair: string): Promise<{ reserve0: bigint; reserve1: bigint } | null> {
  try {
    const raw = await rpcCall<string>('eth_call', [{ to: pair, data: '0x0902f1ac' }, 'latest'])
    return {
      reserve0: decodeUint(raw.slice(2, 66)),
      reserve1: decodeUint(raw.slice(66, 130)),
    }
  } catch {
    return null
  }
}

async function pairTokens(pair: string): Promise<{ token0: string; token1: string } | null> {
  try {
    const [t0, t1] = await Promise.all([
      rpcCall<string>('eth_call', [{ to: pair, data: '0x0dfe1681' }, 'latest']),
      rpcCall<string>('eth_call', [{ to: pair, data: '0xd21220a7' }, 'latest']),
    ])
    return { token0: decodeAddress(t0).toLowerCase(), token1: decodeAddress(t1).toLowerCase() }
  } catch {
    return null
  }
}

function pairSlug(token0: string, token1: string): string {
  if (
    (token0 === MARCO && token1 === WBNB) ||
    (token0 === WBNB && token1 === MARCO) ||
    token0 === MARCO_WBNB_PAIR_BSC.toLowerCase()
  ) {
    return FEATURED_PAIR_SLUG
  }
  const t0 = token0.slice(2, 8)
  const t1 = token1.slice(2, 8)
  return `${t0}-${t1}`.toLowerCase()
}

export async function resolveCanonicalTier1Pairs(): Promise<TierPairWatch[]> {
  const out: TierPairWatch[] = []
  const seen = new Set<string>()

  for (const [symA, symB] of TIER1_SYMBOL_PAIRS) {
    const tokenA = SYMBOL_ADDRESS[symA]
    const tokenB = SYMBOL_ADDRESS[symB]
    if (!tokenA || !tokenB) continue

    const pairAddress = await factoryGetPair(tokenA, tokenB)
    if (!pairAddress || seen.has(pairAddress)) continue

    const reserves = await pairReserves(pairAddress)
    if (!reserves || (reserves.reserve0 <= 0n && reserves.reserve1 <= 0n)) continue

    const tokens = await pairTokens(pairAddress)
    if (!tokens) continue

    seen.add(pairAddress)
    out.push({
      tier: 'TIER_1',
      slug: pairSlug(tokens.token0, tokens.token1),
      pairAddress,
      token0: tokens.token0,
      token1: tokens.token1,
      liquidityScore: reserves.reserve0 + reserves.reserve1,
    })
  }

  return out
}
