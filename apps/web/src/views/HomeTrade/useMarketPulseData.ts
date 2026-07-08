import { useMemo } from 'react'
import useSWR from 'swr'
import { formatUnits } from '@ethersproject/units'
import { formatCompactNumber } from 'design-system/melega/utils/formatCompactNumber'
import { useCurrentBlock } from 'state/block/hooks'
import { useGasPrice } from 'state/user/hooks'

export interface MarketPulseMetric {
  label: string
  value?: string
  change?: string
  changePositive?: boolean
  unavailableReason?: string
}

export interface MarketPulseDiagnostic {
  source: string
  indexer: string
  lastAttempt: string
  reason: string
}

interface CoinGeckoGlobal {
  market_cap_percentage?: { btc?: number }
  total_market_cap?: { usd?: number }
  total_volume?: { usd?: number }
  market_cap_change_percentage_24h_usd?: number
}

interface FearGreedEntry {
  value?: string
  value_classification?: string
}

interface BnbPriceEntry {
  binancecoin?: {
    usd?: number
    usd_24h_change?: number
  }
}

const fetchGlobal = async (): Promise<CoinGeckoGlobal | null> => {
  const res = await fetch('https://api.coingecko.com/api/v3/global')
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? null
}

const fetchFearGreed = async (): Promise<FearGreedEntry | null> => {
  const res = await fetch('https://api.alternative.me/fng/?limit=1')
  if (!res.ok) return null
  const json = await res.json()
  return json?.data?.[0] ?? null
}

const fetchBnbPrice = async (): Promise<BnbPriceEntry | null> => {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_24hr_change=true',
  )
  if (!res.ok) return null
  return res.json()
}

const formatUsdCompact = (usd?: number): string | undefined => {
  if (!usd || usd <= 0) return undefined
  if (usd >= 1e12) return `$${(usd / 1e12).toFixed(2)}T`
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`
  return `$${usd.toFixed(2)}`
}

const formatGasGwei = (raw?: string): string | undefined => {
  if (!raw) return undefined
  try {
    const n = Number(raw)
    if (!Number.isFinite(n) || n <= 0) return undefined
    const gwei = n > 1_000 ? Number(formatUnits(raw, 'gwei')) : n
    if (!Number.isFinite(gwei) || gwei <= 0) return undefined
    return `${gwei.toFixed(1)} Gwei`
  } catch {
    return undefined
  }
}

const formatChange = (pct?: number): { text?: string; positive?: boolean } => {
  if (pct == null || !Number.isFinite(pct)) return {}
  const sign = pct >= 0 ? '+' : ''
  return { text: `${sign}${pct.toFixed(2)}%`, positive: pct >= 0 }
}

export const useMarketPulseData = () => {
  const block = useCurrentBlock()
  const gasRaw = useGasPrice()

  const {
    data: globalData,
    error: globalError,
    isLoading: globalLoading,
  } = useSWR('market-pulse-coingecko-global', fetchGlobal, {
    refreshInterval: 120_000,
    revalidateOnFocus: false,
  })

  const { data: fngData } = useSWR('market-pulse-fear-greed', fetchFearGreed, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  })

  const {
    data: bnbData,
    error: bnbError,
    isLoading: bnbLoading,
  } = useSWR('market-pulse-bnb-price', fetchBnbPrice, {
    refreshInterval: 120_000,
    revalidateOnFocus: false,
  })

  const cryptoMarket = useMemo((): MarketPulseMetric[] => {
    const mcap = formatUsdCompact(globalData?.total_market_cap?.usd)
    const mcapChange = formatChange(globalData?.market_cap_change_percentage_24h_usd)
    const volume = formatUsdCompact(globalData?.total_volume?.usd)
    const btcDom = globalData?.market_cap_percentage?.btc
    const unavailableReason = globalLoading
      ? 'Waiting for CoinGecko global market data'
      : globalError || globalData === null
        ? 'CoinGecko global market data unavailable'
        : undefined

    return [
      {
        label: 'Crypto Market Cap',
        value: mcap,
        change: mcapChange.text,
        changePositive: mcapChange.positive,
        unavailableReason,
      },
      {
        label: '24H Crypto Volume',
        value: volume,
        unavailableReason,
      },
      {
        label: 'Bitcoin Dominance',
        value: btcDom != null ? `${btcDom.toFixed(1)}%` : undefined,
        unavailableReason,
      },
    ]
  }, [globalData, globalError, globalLoading])

  const bnbChain = useMemo((): MarketPulseMetric[] => {
    const bnbUsd = bnbData?.binancecoin?.usd
    const bnbChange = formatChange(bnbData?.binancecoin?.usd_24h_change)
    const gas = formatGasGwei(gasRaw)
    const priceReason = bnbLoading
      ? 'Waiting for CoinGecko BNB price'
      : bnbError || bnbData === null
        ? 'CoinGecko BNB price unavailable'
        : undefined

    return [
      {
        label: 'BNB Price',
        value: bnbUsd != null ? `$${bnbUsd.toFixed(2)}` : undefined,
        change: bnbChange.text,
        changePositive: bnbChange.positive,
        unavailableReason: priceReason,
      },
      {
        label: 'Gas',
        value: gas,
        unavailableReason: gas ? undefined : 'On-chain gas price unavailable',
      },
      {
        label: 'Latest Block',
        value: block > 0 ? formatCompactNumber(block) : undefined,
        unavailableReason: block > 0 ? undefined : 'Waiting for BNB Chain block height',
      },
    ]
  }, [block, bnbData, bnbError, bnbLoading, gasRaw])

  const diagnostic = useMemo((): MarketPulseDiagnostic | undefined => {
    if (globalLoading || bnbLoading) {
      return {
        source: 'coingecko',
        indexer: 'market-pulse-external',
        lastAttempt: new Date().toISOString(),
        reason: 'External market APIs loading',
      }
    }
    if (globalError || bnbError || globalData === null || bnbData === null) {
      return {
        source: 'coingecko',
        indexer: 'market-pulse-external',
        lastAttempt: new Date().toISOString(),
        reason: 'External market API request failed or returned empty payload',
      }
    }
    return undefined
  }, [globalLoading, bnbLoading, globalError, bnbError, globalData, bnbData])

  return {
    cryptoMarket,
    bnbChain,
    fearGreed: {
      value: fngData?.value,
      classification: fngData?.value_classification,
    },
    diagnostic,
  }
}

export default useMarketPulseData
