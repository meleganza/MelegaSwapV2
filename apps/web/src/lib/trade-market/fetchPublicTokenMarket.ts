import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'

export interface PublicTokenMarketSnapshot {
  holders?: number
  marketCapUsd?: number
  fdvUsd?: number
  circulatingSupply?: number
  totalSupply?: number
  priceUsd?: number
  volume24hUsd?: number
  source: 'coingecko' | 'unavailable'
}

interface CoinGeckoTokenResponse {
  market_data?: {
    current_price?: { usd?: number }
    market_cap?: { usd?: number }
    fully_diluted_valuation?: { usd?: number }
    total_volume?: { usd?: number }
    circulating_supply?: number
    total_supply?: number
  }
}

export async function fetchCoinGeckoBscToken(address: string): Promise<PublicTokenMarketSnapshot | null> {
  const normalized = address.toLowerCase()
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/${normalized}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return null
    const json = (await res.json()) as CoinGeckoTokenResponse
    const md = json.market_data
    if (!md) return null
    const priceUsd = md.current_price?.usd
    const totalSupply = md.total_supply
    const computedFdv =
      priceUsd != null &&
      Number.isFinite(priceUsd) &&
      priceUsd > 0 &&
      totalSupply != null &&
      Number.isFinite(totalSupply) &&
      totalSupply > 0
        ? priceUsd * totalSupply
        : undefined
    return {
      priceUsd,
      marketCapUsd: md.market_cap?.usd,
      fdvUsd: md.fully_diluted_valuation?.usd ?? computedFdv,
      volume24hUsd: md.total_volume?.usd,
      circulatingSupply: md.circulating_supply,
      totalSupply,
      source: 'coingecko',
    }
  } catch {
    return null
  }
}

export async function fetchMarcoPublicMarket(): Promise<PublicTokenMarketSnapshot | null> {
  return fetchCoinGeckoBscToken(MARCO_BSC_ADDRESS)
}
