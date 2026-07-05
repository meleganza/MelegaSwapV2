import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import type { DataReasonCode } from 'lib/data-policy/dataReasonCodes'
import type { TokenData } from 'state/info/types'

export interface TradeMarketSource {
  id: string
  label: string
  href?: string
  status: 'ready' | 'link' | 'unavailable'
}

export interface TradeMarketContext {
  sources: TradeMarketSource[]
  canonicalPair: boolean
  missingReason: 'pair_not_indexed' | 'subgraph_empty' | 'explorer_missing' | 'route_not_configured' | null
  missingReasonDetail?: string
  publicDataAvailable: boolean
}

const MARCO_PUBLIC_SOURCES: TradeMarketSource[] = [
  {
    id: 'dexscreener',
    label: 'DexScreener',
    href: `https://dexscreener.com/bsc/${MARCO_BSC_ADDRESS}`,
    status: 'link',
  },
  {
    id: 'geckoterminal',
    label: 'GeckoTerminal',
    href: `https://www.geckoterminal.com/bsc/pools/${MARCO_BSC_ADDRESS}`,
    status: 'link',
  },
  {
    id: 'coingecko',
    label: 'CoinGecko',
    href: `https://www.coingecko.com/en/coins/bsc/contract/${MARCO_BSC_ADDRESS}`,
    status: 'link',
  },
  {
    id: 'explorer',
    label: 'BscScan',
    href: `https://bscscan.com/token/${MARCO_BSC_ADDRESS}`,
    status: 'link',
  },
]

export function resolveTradeMarketContext(input: {
  outputAddress?: string
  tokenData?: TokenData
  hasPairPrices: boolean
  hasSwaps: boolean
  routeConfigured: boolean
}): TradeMarketContext {
  const isMarco =
    input.outputAddress?.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase() || !input.outputAddress

  if (!input.routeConfigured) {
    return {
      sources: [],
      canonicalPair: isMarco,
      missingReason: 'route_not_configured',
      missingReasonDetail: 'Output token route not configured',
      publicDataAvailable: false,
    }
  }

  const sources = isMarco ? MARCO_PUBLIC_SOURCES : []
  const subgraphReady =
    input.tokenData?.exists && (input.tokenData.volumeUSD > 0 || input.tokenData.liquidityUSD > 0)
  const publicDataAvailable = subgraphReady || input.hasPairPrices || input.hasSwaps || isMarco

  let missingReason: TradeMarketContext['missingReason'] = null
  let missingReasonDetail: string | undefined

  if (!subgraphReady && !input.hasPairPrices && !input.hasSwaps) {
    if (input.tokenData && !input.tokenData.exists) {
      missingReason = 'pair_not_indexed'
      missingReasonDetail = isMarco
        ? 'MARCO/BNB pair not indexed in subgraph — public chart sources available below'
        : 'Pair not indexed in subgraph'
    } else {
      missingReason = 'subgraph_empty'
      missingReasonDetail = isMarco
        ? 'Subgraph empty — open DexScreener, GeckoTerminal, or CoinGecko for live MARCO data'
        : 'Subgraph returned no candles or swap events'
    }
  }

  return {
    sources,
    canonicalPair: isMarco,
    missingReason,
    missingReasonDetail,
    publicDataAvailable,
  }
}

export function tradeReasonFromContext(ctx: TradeMarketContext): Partial<Record<string, DataReasonCode>> {
  if (ctx.publicDataAvailable && !ctx.missingReason) return {}
  if (ctx.missingReason === 'pair_not_indexed') return { volume: 'PAIR_NOT_INDEXED', liquidity: 'PAIR_NOT_INDEXED' }
  if (ctx.missingReason === 'subgraph_empty') return { volume: 'NO_EVENTS_INDEXED', transactions: 'NO_EVENTS_INDEXED' }
  return {}
}
