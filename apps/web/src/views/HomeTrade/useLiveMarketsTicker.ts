import { useMemo } from 'react'
import useSWR from 'swr'
import { formatUnits } from '@ethersproject/units'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useGasPrice } from 'state/user/hooks'
import type { MelegaTickerItem } from 'design-system/melega'

interface SimplePrices {
  binancecoin?: { usd?: number; usd_24h_change?: number }
  bitcoin?: { usd?: number; usd_24h_change?: number }
  ethereum?: { usd?: number; usd_24h_change?: number }
}

interface FearGreedEntry {
  value?: string
  value_classification?: string
}

interface CoinGeckoGlobal {
  total_volume?: { usd?: number }
}

const fetchPrices = async (): Promise<SimplePrices | null> => {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
  )
  if (!res.ok) return null
  return res.json()
}

const fetchGlobal = async (): Promise<CoinGeckoGlobal | null> => {
  const res = await fetch('https://api.coingecko.com/api/v3/global')
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? null
}

const formatVolume = (usd?: number): string | undefined => {
  if (!usd || usd <= 0) return undefined
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`
  return undefined
}

const fetchFearGreed = async (): Promise<FearGreedEntry | null> => {
  const res = await fetch('https://api.alternative.me/fng/?limit=1')
  if (!res.ok) return null
  const json = await res.json()
  return json?.data?.[0] ?? null
}

const fmtPrice = (n?: number): string | undefined => {
  if (n == null || !Number.isFinite(n) || n <= 0) return undefined
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(4)}`
}

const fmtChange = (n?: number): string | undefined => {
  if (n == null || !Number.isFinite(n)) return undefined
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
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

export const useLiveMarketsTicker = (): MelegaTickerItem[] => {
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const gasRaw = useGasPrice()

  const { data: prices } = useSWR('live-markets-prices', fetchPrices, {
    refreshInterval: 120_000,
    revalidateOnFocus: false,
  })

  const { data: globalData } = useSWR('live-markets-global', fetchGlobal, {
    refreshInterval: 120_000,
    revalidateOnFocus: false,
  })

  const { data: fng } = useSWR('live-markets-fng', fetchFearGreed, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  })

  return useMemo(() => {
    const items: MelegaTickerItem[] = []
    const bnb = prices?.binancecoin
    const btc = prices?.bitcoin
    const eth = prices?.ethereum
    const marco = marcoPrice && !marcoPrice.isZero() ? marcoPrice.toNumber() : undefined
    const gas = formatGasGwei(gasRaw)

    if (bnb?.usd) {
      items.push({
        id: 'bnb',
        primary: 'BNB',
        secondary: fmtPrice(bnb.usd),
        accent: fmtChange(bnb.usd_24h_change),
      })
    }

    if (btc?.usd) {
      items.push({
        id: 'btc',
        primary: 'BTC',
        secondary: fmtPrice(btc.usd),
        accent: fmtChange(btc.usd_24h_change),
      })
    }

    if (eth?.usd) {
      items.push({
        id: 'eth',
        primary: 'ETH',
        secondary: fmtPrice(eth.usd),
        accent: fmtChange(eth.usd_24h_change),
      })
    }

    if (marco && marco > 0) {
      items.push({
        id: 'melega',
        primary: 'MELEGA',
        secondary: fmtPrice(marco),
      })
    }

    const volume = formatVolume(globalData?.total_volume?.usd)
    if (volume) {
      items.push({
        id: 'volume',
        primary: '24H Volume',
        secondary: volume,
      })
    }

    if (gas) {
      items.push({
        id: 'gas',
        primary: 'Gas',
        secondary: gas,
      })
    }

    if (fng?.value) {
      items.push({
        id: 'fng',
        primary: 'Fear & Greed',
        secondary: fng.value,
        accent: fng.value_classification,
      })
    }

    return items
  }, [fng, gasRaw, globalData, marcoPrice, prices])
}

export default useLiveMarketsTicker
