export type DexScreenerPair = {
  chainId?: string
  dexId?: string
  url?: string
  pairAddress?: string
  baseToken?: { address?: string; symbol?: string }
  quoteToken?: { address?: string; symbol?: string }
  volume?: { h24?: number }
  liquidity?: { usd?: number }
  txns?: { h24?: { buys?: number; sells?: number } }
  priceUsd?: string
  priceChange?: { h24?: number }
  marketCap?: number
  fdv?: number
}

export type ProjectDexVenue = {
  dexId: string
  pairCount: number
  liquidityUsd: number | null
  volume24hUsd: number | null
  transactions24h: number | null
}

export type ProjectDexPairBreakdown = {
  pairAddress: string
  dexId: string
  label: string
  liquidityUsd: number | null
  liquiditySharePct: number | null
}

export type ProjectDexAnalytics = {
  pairCount: number
  dexCount: number
  liquidityUsd: number | null
  volume24hUsd: number | null
  transactions24h: number | null
  priceUsd: number | null
  priceChange24h: number | null
  marketCapUsd: number | null
  fdvUsd: number | null
  primaryPairAddress: string | null
  venues: ProjectDexVenue[]
  pairs: ProjectDexPairBreakdown[]
}

function finiteNonNegative(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/** Aggregate only fields actually returned by the provider; missing never becomes zero. */
export function aggregateProjectDexPairs(rows: DexScreenerPair[], projectAddress?: string): ProjectDexAnalytics {
  const venues = new Map<string, { pairCount: number; liquidity: number[]; volume: number[]; transactions: number[] }>()

  for (const row of rows) {
    const dexId = row.dexId?.trim()
    if (!dexId || !row.pairAddress) continue
    const venue = venues.get(dexId) ?? { pairCount: 0, liquidity: [], volume: [], transactions: [] }
    venue.pairCount += 1
    const liquidity = finiteNonNegative(row.liquidity?.usd)
    const volume = finiteNonNegative(row.volume?.h24)
    const buys = finiteNonNegative(row.txns?.h24?.buys)
    const sells = finiteNonNegative(row.txns?.h24?.sells)
    if (liquidity != null) venue.liquidity.push(liquidity)
    if (volume != null) venue.volume.push(volume)
    if (buys != null && sells != null) venue.transactions.push(buys + sells)
    venues.set(dexId, venue)
  }

  const mapped = [...venues.entries()]
    .map(([dexId, venue]) => ({
      dexId,
      pairCount: venue.pairCount,
      liquidityUsd: venue.liquidity.length ? venue.liquidity.reduce((sum, value) => sum + value, 0) : null,
      volume24hUsd: venue.volume.length ? venue.volume.reduce((sum, value) => sum + value, 0) : null,
      transactions24h: venue.transactions.length ? venue.transactions.reduce((sum, value) => sum + value, 0) : null,
    }))
    .sort((a, b) => (b.liquidityUsd ?? -1) - (a.liquidityUsd ?? -1))

  const sumKnown = (values: Array<number | null>) => {
    const known = values.filter((value): value is number => value != null)
    return known.length ? known.reduce((sum, value) => sum + value, 0) : null
  }

  // Headline price/valuation must come from one real market, never from an
  // average across venues. The most liquid observed pair is the canonical
  // headline because it is the least sensitive to thin-pair noise.
  const primary = rows
    .filter((row) => row.pairAddress)
    .slice()
    .sort((a, b) => (finiteNonNegative(b.liquidity?.usd) ?? -1) - (finiteNonNegative(a.liquidity?.usd) ?? -1))[0]
  const parsedPrice = primary?.priceUsd == null ? null : Number(primary.priceUsd)
  const totalPairLiquidity = rows
    .map((row) => finiteNonNegative(row.liquidity?.usd))
    .filter((value): value is number => value != null)
    .reduce((sum, value) => sum + value, 0)
  const normalizedProject = projectAddress?.toLowerCase()
  const pairs = rows
    .filter((row) => Boolean(row.pairAddress && row.dexId))
    .map((row) => {
      const liquidityUsd = finiteNonNegative(row.liquidity?.usd)
      const baseAddress = row.baseToken?.address?.toLowerCase()
      const quoteAddress = row.quoteToken?.address?.toLowerCase()
      const counterpart =
        normalizedProject && baseAddress === normalizedProject
          ? row.quoteToken?.symbol
          : normalizedProject && quoteAddress === normalizedProject
          ? row.baseToken?.symbol
          : row.quoteToken?.symbol || row.baseToken?.symbol
      const projectSymbol =
        normalizedProject && baseAddress === normalizedProject
          ? row.baseToken?.symbol
          : normalizedProject && quoteAddress === normalizedProject
          ? row.quoteToken?.symbol
          : row.baseToken?.symbol
      return {
        pairAddress: row.pairAddress!,
        dexId: row.dexId!,
        label: [projectSymbol, counterpart].filter(Boolean).join(' / ') || row.pairAddress!,
        liquidityUsd,
        liquiditySharePct:
          liquidityUsd != null && totalPairLiquidity > 0 ? (liquidityUsd / totalPairLiquidity) * 100 : null,
      }
    })
    .sort((a, b) => (b.liquidityUsd ?? -1) - (a.liquidityUsd ?? -1))

  return {
    pairCount: mapped.reduce((sum, venue) => sum + venue.pairCount, 0),
    dexCount: mapped.length,
    liquidityUsd: sumKnown(mapped.map((venue) => venue.liquidityUsd)),
    volume24hUsd: sumKnown(mapped.map((venue) => venue.volume24hUsd)),
    transactions24h: sumKnown(mapped.map((venue) => venue.transactions24h)),
    priceUsd: finiteNonNegative(parsedPrice),
    priceChange24h:
      typeof primary?.priceChange?.h24 === 'number' && Number.isFinite(primary.priceChange.h24)
        ? primary.priceChange.h24
        : null,
    marketCapUsd: finiteNonNegative(primary?.marketCap),
    fdvUsd: finiteNonNegative(primary?.fdv),
    primaryPairAddress: primary?.pairAddress ?? null,
    venues: mapped,
    pairs,
  }
}
