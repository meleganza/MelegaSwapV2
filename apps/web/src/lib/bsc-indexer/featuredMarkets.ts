/**
 * Founder Featured Project market observations from Melega Factory pairs + durable index.
 * No third-party prices presented as Melega DEX activity.
 */
import { resolveFounderFeaturedProjects } from 'views/HomeTrade/featuredProjectsCatalog'
import { resolveOnchainRegistry } from './registry/store'
import { resolveIndexerStorageForSlug } from './storage'
import { slugFromPairAddress } from './v2/pairSlug'
import { FEATURED_PAIR_SLUG } from './v2/paths'
import { MARCO_WBNB_PAIR_BSC } from './constants'
import { computeValid24hPriceChange } from 'lib/data-truth/compute24hPriceChange'
import { FOUNDER_WBNB_PAIR_ADDRESSES } from './founderWbnbPairs'
import {
  fullyDilutedValueUsd,
  quoteVolumeToUsd,
  tokenUsdFromWbnbQuote,
} from './usdValuation'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { fetchBnbUsd as fetchBnbUsdShared } from 'lib/market-data/bnbUsd'
import { rpcCall } from './rpc/chunkedLogs'

export { FOUNDER_WBNB_PAIR_ADDRESSES }

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const SECONDS_24H = 86_400

export type FeaturedMarketStatus =
  | 'LOADING'
  | 'LIVE'
  | 'STALE'
  | 'NO_RECENT_TRADES'
  | 'UNAVAILABLE'

export type FeaturedCapLabel = 'Market Cap' | 'Fully Diluted Value' | 'Unavailable'

export type FeaturedMarketRow = {
  slug: string
  symbol: string
  tokenAddress: string
  pairAddress?: string
  status: FeaturedMarketStatus
  latestPriceQuote?: number
  /** Primary human-facing USD price when BNB/USD is available. */
  latestPriceUsd?: number
  changePct?: number
  periodLabel: '24H' | string
  volume24hQuote?: number
  volume24hUsd?: number
  /** Approximate WBNB-side liquidity (2× quote reserve when pair is token/WBNB). */
  liquidityQuote?: number
  liquidityUsd?: number
  /** Market cap in WBNB when circulating supply is known — omitted when unavailable. */
  marketCapQuote?: number
  marketCapUsd?: number
  /** Honest label — never call FDV “Market Cap”. */
  marketCapLabel?: FeaturedCapLabel
  bnbUsd?: number
  tradeCount24h?: number
  lastTradeTimestamp?: number
  quoteSymbol: 'WBNB'
  source: 'melega-dex-index' | 'melega-factory-reserves' | 'none'
}

async function fetchBnbUsd(): Promise<number | undefined> {
  const { usd } = await fetchBnbUsdShared()
  return usd
}

/** On-chain totalSupply → human units using tokenlist decimals (default 18). */
async function fetchTotalSupplyHuman(tokenAddress: string): Promise<number | undefined> {
  try {
    const addr = tokenAddress.toLowerCase()
    const entry = ((defaultTokenList.tokens ?? []) as Array<{
      chainId?: number
      address?: string
      decimals?: number
    }>).find((t) => t.chainId === 56 && t.address?.toLowerCase() === addr)
    const decimals = entry?.decimals ?? 18
    // totalSupply() selector
    const raw = await rpcCall<string>('eth_call', [{ to: addr, data: '0x18160ddd' }, 'latest'])
    if (!raw || raw === '0x') return undefined
    const supply = BigInt(raw)
    if (supply <= 0n) return undefined
    const denom = 10n ** BigInt(decimals)
    // Keep precision for large supplies via string split
    const whole = supply / denom
    const frac = supply % denom
    const human = Number(whole) + Number(frac) / Number(denom)
    return Number.isFinite(human) && human > 0 ? human : undefined
  } catch {
    return undefined
  }
}

function pairSlug(pairAddress: string, token0: string, token1: string): string {
  if (pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase()) return FEATURED_PAIR_SLUG
  return slugFromPairAddress(pairAddress, token0, token1)
}

function reservePriceTokenInWbnb(params: {
  token: string
  token0: string
  token1: string
  reserve0: string
  reserve1: string
}): number | undefined {
  const token = params.token.toLowerCase()
  const t0 = params.token0.toLowerCase()
  const t1 = params.token1.toLowerCase()
  const r0 = Number(params.reserve0) / 1e18
  const r1 = Number(params.reserve1) / 1e18
  if (!(r0 > 0) || !(r1 > 0)) return undefined
  if (token === t0 && t1 === WBNB) return r1 / r0
  if (token === t1 && t0 === WBNB) return r0 / r1
  return undefined
}

/** Token/WBNB pair liquidity ≈ 2 × WBNB reserve (honest AMM approximation). */
function liquidityQuoteWbnb(params: {
  token0: string
  token1: string
  reserve0: string
  reserve1: string
}): number | undefined {
  const t0 = params.token0.toLowerCase()
  const t1 = params.token1.toLowerCase()
  const r0 = Number(params.reserve0) / 1e18
  const r1 = Number(params.reserve1) / 1e18
  if (!(r0 > 0) || !(r1 > 0)) return undefined
  if (t0 === WBNB) return r0 * 2
  if (t1 === WBNB) return r1 * 2
  return undefined
}

function pickCanonicalWbnbPair(
  token: string,
  pairs: Array<{
    pairAddress: string
    token0?: string
    token1?: string
    reserve0?: string
    reserve1?: string
  }>,
) {
  const tokenLc = token.toLowerCase()
  const candidates = pairs.filter((p) => {
    const t0 = p.token0?.toLowerCase()
    const t1 = p.token1?.toLowerCase()
    return (t0 === tokenLc || t1 === tokenLc) && (t0 === WBNB || t1 === WBNB)
  })
  if (!candidates.length) return undefined
  return candidates.sort((a, b) => {
    const la = Number(a.reserve0 ?? 0) + Number(a.reserve1 ?? 0)
    const lb = Number(b.reserve0 ?? 0) + Number(b.reserve1 ?? 0)
    return lb - la
  })[0]
}

export async function buildFeaturedProjectMarkets(): Promise<{
  generatedAt: string
  chainId: 56
  rows: FeaturedMarketRow[]
  bnbUsd?: number
}> {
  const projects = resolveFounderFeaturedProjects()
  const [{ registry }, bnbUsd] = await Promise.all([resolveOnchainRegistry(), fetchBnbUsd()])
  const pairs = registry?.amm?.pairs ?? []
  const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
  const rows: FeaturedMarketRow[] = []

  for (const project of projects) {
    if (!project.address) {
      rows.push({
        slug: project.slug,
        symbol: project.symbol,
        tokenAddress: '',
        status: 'UNAVAILABLE',
        periodLabel: '24H',
        quoteSymbol: 'WBNB',
        source: 'none',
      })
      continue
    }

    const pair = pickCanonicalWbnbPair(project.address, pairs)
    if (!pair?.token0 || !pair?.token1 || !pair.reserve0 || !pair.reserve1) {
      rows.push({
        slug: project.slug,
        symbol: project.symbol,
        tokenAddress: project.address.toLowerCase(),
        status: 'UNAVAILABLE',
        periodLabel: '24H',
        quoteSymbol: 'WBNB',
        source: 'none',
      })
      continue
    }

    const latestFromReserves = reservePriceTokenInWbnb({
      token: project.address,
      token0: pair.token0,
      token1: pair.token1,
      reserve0: pair.reserve0,
      reserve1: pair.reserve1,
    })

    const slug = pairSlug(pair.pairAddress, pair.token0, pair.token1)
    const storage = resolveIndexerStorageForSlug(slug)
    const [candles, events, health] = await Promise.all([
      storage.listCandles(pair.pairAddress, '1H', 48),
      storage.listEvents({ pairAddress: pair.pairAddress, limit: 500 }),
      storage.loadHealth(),
    ])

    const swaps = events.filter((e) => e.eventType === 'Swap')
    const recentSwaps = swaps.filter((e) => e.blockTimestamp >= cutoff)
    const change = computeValid24hPriceChange(candles)
    const volume24hQuote = candles
      .filter((c) => c.bucketTimestamp >= cutoff)
      .reduce((sum, c) => sum + (c.quoteVolume ?? 0), 0)
    const lastTradeTimestamp = swaps.reduce(
      (max, e) => Math.max(max, e.blockTimestamp || 0),
      0,
    )

    let status: FeaturedMarketStatus = 'UNAVAILABLE'
    let source: FeaturedMarketRow['source'] = 'none'
    let latestPriceQuote = latestFromReserves
    let periodLabel: FeaturedMarketRow['periodLabel'] = '24H'

    if (change != null && recentSwaps.length > 0) {
      status = 'LIVE'
      source = 'melega-dex-index'
      periodLabel = '24H'
    } else if (recentSwaps.length > 0) {
      status = 'LIVE'
      source = 'melega-dex-index'
      if (change == null) {
        const oldest = Math.min(...recentSwaps.map((e) => e.blockTimestamp))
        const hours = Math.max(1, Math.round((Date.now() / 1000 - oldest) / 3600))
        periodLabel = hours < 24 ? `${hours}H` : '24H'
      }
    } else if (latestFromReserves != null && latestFromReserves > 0) {
      status = lastTradeTimestamp > 0 ? 'NO_RECENT_TRADES' : 'STALE'
      source = 'melega-factory-reserves'
    } else if (health?.status === 'syncing') {
      status = 'LOADING'
      source = 'none'
    }

    const lag = health?.indexingLag ?? 0
    if (status === 'LIVE' && lag > 5_000) status = 'STALE'

    const liquidityQuote = liquidityQuoteWbnb({
      token0: pair.token0,
      token1: pair.token1,
      reserve0: pair.reserve0,
      reserve1: pair.reserve1,
    })

    const latestPriceUsd =
      latestPriceQuote != null && bnbUsd != null
        ? tokenUsdFromWbnbQuote(latestPriceQuote, bnbUsd)
        : undefined
    const volume24hUsd =
      volume24hQuote > 0 && bnbUsd != null ? quoteVolumeToUsd(volume24hQuote, bnbUsd) : undefined
    const liquidityUsd =
      liquidityQuote != null && liquidityQuote > 0 && bnbUsd != null
        ? quoteVolumeToUsd(liquidityQuote, bnbUsd)
        : undefined

    const supplyHuman = await fetchTotalSupplyHuman(project.address)
    const marketCapUsd =
      supplyHuman != null && latestPriceUsd != null
        ? fullyDilutedValueUsd(supplyHuman, latestPriceUsd)
        : undefined
    const marketCapLabel: FeaturedCapLabel =
      marketCapUsd != null ? 'Fully Diluted Value' : 'Unavailable'

    rows.push({
      slug: project.slug,
      symbol: project.symbol,
      tokenAddress: project.address.toLowerCase(),
      pairAddress: pair.pairAddress.toLowerCase(),
      status,
      latestPriceQuote,
      latestPriceUsd,
      changePct: change?.pct,
      periodLabel,
      volume24hQuote: volume24hQuote > 0 ? volume24hQuote : undefined,
      volume24hUsd,
      liquidityQuote: liquidityQuote != null && liquidityQuote > 0 ? liquidityQuote : undefined,
      liquidityUsd,
      marketCapUsd,
      marketCapLabel,
      bnbUsd,
      // Zero is factual information: keep it so every consumer can distinguish
      // a confirmed empty 24H window from an unavailable observation.
      tradeCount24h: recentSwaps.length,
      lastTradeTimestamp: lastTradeTimestamp || undefined,
      quoteSymbol: 'WBNB',
      source,
    })
  }

  return { generatedAt: new Date().toISOString(), chainId: 56, rows, bnbUsd }
}
