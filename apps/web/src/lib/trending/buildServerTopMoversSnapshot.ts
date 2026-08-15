import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { getCanonicalIndexedAssets } from 'lib/canonical-token-registry'
import { loadTierMetricsSnapshot } from 'lib/bsc-indexer/server/loadTierMetricsSnapshot'
import { format24hChangePct } from 'lib/data-truth/compute24hPriceChange'
import {
  isCredibleMoverChange,
  isQuoteTokenAddress,
  isTrendingTierStatus,
  pickTrendingBaseToken,
  trendingTickerAccent,
  type TierRankedAsset,
} from 'lib/trending/tierTrendingModel'
import {
  buildTopMoversSnapshotId,
  type TopMoverEntry,
  type TopMoversSharedSnapshot,
} from 'lib/trending/topMoversSharedSnapshot'
import { formatPaidPlacementRemaining } from 'lib/trending/paidTickerPlacements'
import { listActiveTrendBoostOrders, listTrendBoostOrdersDurably } from 'lib/monetization/trendBoostOrders'
import { getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { resolveCanonicalProjectHref } from 'lib/projects/canonicalProjectHref'

type TokenListEntry = { chainId?: number; address?: string; symbol?: string; name?: string }

type DexScreenerPair = {
  chainId?: string
  pairAddress?: string
  baseToken?: { address?: string; symbol?: string; name?: string }
  priceUsd?: string
  txns?: { h24?: { buys?: number; sells?: number } }
  volume?: { h24?: number }
  priceChange?: { h24?: number }
  liquidity?: { usd?: number }
}

const DEXSCREENER_BATCH_SIZE = 30
// Reject dust-pool volatility: these are factual minimums, not invented scores.
const MIN_LIVE_LIQUIDITY_USD = 1_000
const MIN_LIVE_VOLUME_24H_USD = 100

function chunks<T>(values: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size))
  return out
}

function finitePositive(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

/**
 * Fetch factual rolling-24h BSC pair metrics at request time. DexScreener is used as a
 * freshness authority; stale build-time index files are never promoted over these rows.
 */
async function loadLiveDexScreenerMovers(addresses: string[]): Promise<TierRankedAsset[]> {
  const requested = new Set(addresses.map((address) => address.toLowerCase()))
  const responses = await Promise.all(
    chunks([...requested], DEXSCREENER_BATCH_SIZE).map(async (batch) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 6_000)
      try {
        const response = await fetch(`https://api.dexscreener.com/tokens/v1/bsc/${batch.join(',')}`, {
          headers: { accept: 'application/json' },
          signal: controller.signal,
        })
        if (!response.ok) return []
        const payload = (await response.json()) as DexScreenerPair[]
        return Array.isArray(payload) ? payload : []
      } catch {
        return []
      } finally {
        clearTimeout(timeout)
      }
    }),
  )

  // One token may have many pools. Use its deepest liquid pool, then highest real 24h volume.
  const bestByAddress = new Map<string, DexScreenerPair>()
  for (const pair of responses.flat()) {
    if (pair.chainId?.toLowerCase() !== 'bsc') continue
    const address = pair.baseToken?.address?.toLowerCase()
    if (!address || !requested.has(address)) continue
    const change = Number(pair.priceChange?.h24)
    const volume = finitePositive(pair.volume?.h24)
    const liquidity = finitePositive(pair.liquidity?.usd)
    const trades = finitePositive(pair.txns?.h24?.buys) + finitePositive(pair.txns?.h24?.sells)
    if (
      !Number.isFinite(change) ||
      volume < MIN_LIVE_VOLUME_24H_USD ||
      liquidity < MIN_LIVE_LIQUIDITY_USD ||
      trades <= 0
    ) {
      continue
    }
    if (
      !isCredibleMoverChange({
        pct: change,
        tradeCount24h: 0,
        volume24h: 0,
        liquidityScore: liquidity,
        externalVolumeUsd: volume,
        hasExternalChange: true,
      })
    ) {
      continue
    }
    const previous = bestByAddress.get(address)
    const previousLiquidity = finitePositive(previous?.liquidity?.usd)
    const previousVolume = finitePositive(previous?.volume?.h24)
    if (!previous || liquidity > previousLiquidity || (liquidity === previousLiquidity && volume > previousVolume)) {
      bestByAddress.set(address, pair)
    }
  }

  return [...bestByAddress.entries()]
    .map(([address, pair]) => {
      const meta = displayMeta(address)
      const pct = Number(pair.priceChange?.h24)
      const volume24h = finitePositive(pair.volume?.h24)
      const liquidityScore = finitePositive(pair.liquidity?.usd)
      const tradeCount24h = finitePositive(pair.txns?.h24?.buys) + finitePositive(pair.txns?.h24?.sells)
      const priceUsd = finitePositive(pair.priceUsd)
      return {
        symbol: meta.symbol,
        slug: meta.slug,
        pairSlug: pair.pairAddress?.toLowerCase() ?? meta.slug,
        address,
        chainId: meta.chainId,
        displayName: meta.displayName,
        tierStatus: 'READY' as const,
        priceUsd: priceUsd || undefined,
        change24h: format24hChangePct(pct),
        volume24h,
        liquidityScore,
        tradeCount24h,
        rankingSignals: ['dexScreenerLive', 'trades24h', 'volume24hUsd', 'liquidityUsd', 'change24h'],
      }
    })
    .sort((a, b) => {
      const byMove = Math.abs(b.change24h!.pct) - Math.abs(a.change24h!.pct)
      if (byMove !== 0) return byMove
      if (b.tradeCount24h !== a.tradeCount24h) return b.tradeCount24h - a.tradeCount24h
      if (b.volume24h !== a.volume24h) return b.volume24h - a.volume24h
      return b.liquidityScore - a.liquidityScore
    })
}

export type ServerTopMoversPayload = {
  snapshot: TopMoversSharedSnapshot
  rankedAssets: TierRankedAsset[]
  indexedRibbonAssets: Array<{
    slug: string
    symbol: string
    address: string
    chainId: number
    displayName: string
  }>
  indexerScopeNote?: string
  liveMarketAuthority: boolean
}

function displayMeta(address: string) {
  const key = address.toLowerCase()
  const canonical = getCanonicalIndexedAssets().find((asset) => asset.address?.toLowerCase() === key)
  if (canonical?.address && canonical.symbol) {
    return {
      symbol: canonical.symbol,
      slug: canonical.registrySlug ?? canonical.id,
      displayName: canonical.name ?? canonical.symbol,
      chainId: canonical.chainId,
    }
  }
  const listed = ((defaultTokenList.tokens ?? []) as TokenListEntry[]).find(
    (token) => token.chainId === 56 && token.address?.toLowerCase() === key && token.symbol,
  )
  if (listed?.symbol) {
    return {
      symbol: listed.symbol,
      slug: listed.symbol.toLowerCase(),
      displayName: listed.name ?? listed.symbol,
      chainId: 56,
    }
  }
  return {
    symbol: `${key.slice(0, 6)}…${key.slice(-4)}`,
    slug: key,
    displayName: `${key.slice(0, 6)}…${key.slice(-4)}`,
    chainId: 56,
  }
}

/**
 * Lightweight factual Top Movers producer. It consumes the server index once and sends a compact,
 * cacheable snapshot to browsers; no client chain hooks, CoinGecko fan-out or duplicate subscriptions.
 */
export async function buildServerTopMoversSnapshot(limit = 40): Promise<ServerTopMoversPayload> {
  await listTrendBoostOrdersDurably()
  const tier = await loadTierMetricsSnapshot()
  const internalMeasured = tier.rows
    .filter((row) => isTrendingTierStatus(row.status))
    .filter((row) => row.priceChange24h != null && Number.isFinite(row.priceChange24h))
    .filter((row) => row.tradeCount24h > 0 || row.volume24hWbnb > 0)
    .filter((row) =>
      isCredibleMoverChange({
        pct: row.priceChange24h!,
        tradeCount24h: row.tradeCount24h,
        volume24h: row.volume24hWbnb,
        liquidityScore: 0,
      }),
    )
    .map((row) => {
      const address = pickTrendingBaseToken(row.token0, row.token1)
      return { row, address, meta: displayMeta(address) }
    })
    .sort((a, b) => {
      const byMove = Math.abs(b.row.priceChange24h!) - Math.abs(a.row.priceChange24h!)
      if (byMove !== 0) return byMove
      if (b.row.tradeCount24h !== a.row.tradeCount24h) return b.row.tradeCount24h - a.row.tradeCount24h
      return b.row.volume24hWbnb - a.row.volume24hWbnb
    })
    .slice(0, limit)

  const internalRankedAssets: TierRankedAsset[] = internalMeasured.map(({ row, address, meta }) => ({
    symbol: meta.symbol,
    slug: meta.slug,
    pairSlug: row.slug,
    address,
    chainId: meta.chainId,
    displayName: meta.displayName,
    tierStatus: isTrendingTierStatus(row.status) ? row.status : 'SYNCING',
    change24h: format24hChangePct(row.priceChange24h!),
    // The server has WBNB notional, not a certified USD conversion. Keep USD volume unavailable.
    volume24h: 0,
    liquidityScore: 0,
    tradeCount24h: row.tradeCount24h,
    rankingSignals: [
      'serverTierMetrics',
      ...(row.tradeCount24h > 0 ? ['trades24h'] : []),
      ...(row.volume24hWbnb > 0 ? ['wbnbVolume24h'] : []),
      'change24h',
    ],
  }))

  const liveUniverse = new Set<string>()
  for (const row of tier.rows) {
    const address = pickTrendingBaseToken(row.token0, row.token1)
    if (address && !liveUniverse.has(address.toLowerCase())) liveUniverse.add(address.toLowerCase())
  }
  for (const asset of getCanonicalIndexedAssets()) {
    if (asset.chainId === 56 && asset.address && !isQuoteTokenAddress(asset.address)) {
      liveUniverse.add(asset.address.toLowerCase())
    }
  }
  const externalRankedAssets = await loadLiveDexScreenerMovers([...liveUniverse])
  // A non-empty live response is authoritative. Internal index rows are an honest outage fallback only.
  const organicRankedAssets = (externalRankedAssets.length > 0 ? externalRankedAssets : internalRankedAssets).slice(
    0,
    limit,
  )

  const activeBoosts = listActiveTrendBoostOrders().filter(
    (order) => (order.serviceId ?? 'trend-boost') === 'trend-boost',
  )
  const paidEntries: TopMoverEntry[] = activeBoosts.flatMap((order) => {
    const project = order.projectSlug ? getProjectBySlug(order.projectSlug) : undefined
    const projectToken = project?.resources.tokens.find((token) => token.chainId === order.chainId)
    const address = order.projectContract || projectToken?.address || null
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return []
    const meta = displayMeta(address)
    const remaining = formatPaidPlacementRemaining(order.scheduledEnd)
    return [
      {
        id: `paid-boosted-${order.chainId}-${order.orderId}`,
        symbol: projectToken?.symbol || meta.symbol,
        address: address.toLowerCase(),
        chainId: order.chainId,
        changeLabel: remaining,
        changePct: null,
        accentPositive: true,
        href: resolveCanonicalProjectHref({
          slug: project?.slug ?? order.projectSlug,
          chainId: order.chainId,
          address,
        }),
      },
    ]
  })
  const paidAddresses = new Set(paidEntries.map((entry) => entry.address?.toLowerCase()).filter(Boolean))
  const visibleOrganicAssets = organicRankedAssets.filter((asset) => !paidAddresses.has(asset.address.toLowerCase()))
  const paidRankedAssets: TierRankedAsset[] = paidEntries.map((entry) => {
    const symbol = entry.symbol
    return {
      symbol,
      slug: entry.id,
      pairSlug: entry.id,
      address: entry.address || '',
      chainId: entry.chainId ?? 56,
      displayName: symbol,
      tierStatus: 'READY',
      volume24h: 0,
      liquidityScore: 0,
      tradeCount24h: 0,
      rankingSignals: ['paidTrendBoost'],
    }
  })
  const rankedAssets = [...paidRankedAssets, ...visibleOrganicAssets]

  const organicEntries: TopMoverEntry[] = visibleOrganicAssets.map((asset) => {
    const { accent, accentPositive } = trendingTickerAccent(asset)
    return {
      id: `trade-asset-${asset.slug}`,
      symbol: asset.symbol,
      address: asset.address.toLowerCase(),
      chainId: asset.chainId,
      changeLabel: accent ?? null,
      changePct: asset.change24h?.pct ?? null,
      accentPositive,
      href: `/swap?outputCurrency=${asset.address}`,
    }
  })
  const entries = [...paidEntries, ...organicEntries]
  const generatedAt = paidEntries.length > 0 ? new Date().toISOString() : tier.generatedAt
  const snapshot: TopMoversSharedSnapshot = {
    schema: 'melega.top-movers.shared-snapshot.v1',
    snapshotId: buildTopMoversSnapshotId(entries, generatedAt),
    generatedAt,
    sourceBlock: null,
    fromDurable: false,
    entries,
  }

  return {
    snapshot,
    rankedAssets,
    liveMarketAuthority: externalRankedAssets.length > 0,
    indexedRibbonAssets: rankedAssets
      .map((asset) => ({
        slug: asset.slug,
        symbol: asset.symbol,
        address: asset.address,
        chainId: asset.chainId,
        displayName: asset.displayName,
      }))
      .filter((asset) => Boolean(asset.address)),
    indexerScopeNote: entries.length
      ? externalRankedAssets.length > 0
        ? 'Live BSC DEX markets · rolling 24h snapshot'
        : 'Indexed Melega DEX activity · rolling 24h snapshot'
      : undefined,
  }
}
