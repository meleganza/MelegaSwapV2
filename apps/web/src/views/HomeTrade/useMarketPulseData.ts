import { useMemo } from 'react'
import useSWR from 'swr'
import { ChainId } from '@pancakeswap/sdk'
import { formatUnits } from '@ethersproject/units'
import { useCurrentBlock } from 'state/block/hooks'
import { useGasPrice } from 'state/user/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'

export interface MarketPulseCell {
  id: string
  label: string
  value?: string
  meta?: string
  status?: 'gold' | 'green' | 'neutral'
}

interface CoinGeckoGlobal {
  market_cap_percentage?: { btc?: number }
  total_market_cap?: { usd?: number }
}

interface FearGreedEntry {
  value?: string
  value_classification?: string
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

const formatMarketCap = (usd?: number): string | undefined => {
  if (!usd || usd <= 0) return undefined
  if (usd >= 1e12) return `$${(usd / 1e12).toFixed(2)}T`
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`
  return `$${(usd / 1e6).toFixed(0)}M`
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

export const useMarketPulseData = () => {
  const chainId = useActiveChainId()
  const block = useCurrentBlock()
  const gasRaw = useGasPrice()

  const { data: globalData } = useSWR('market-pulse-coingecko-global', fetchGlobal, {
    refreshInterval: 120_000,
    revalidateOnFocus: false,
  })

  const { data: fngData } = useSWR('market-pulse-fear-greed', fetchFearGreed, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  })

  const cells = useMemo((): MarketPulseCell[] => {
    const onBsc = chainId === ChainId.BSC
    const btcDom = globalData?.market_cap_percentage?.btc
    const mcap = formatMarketCap(globalData?.total_market_cap?.usd)
    const gas = formatGasGwei(gasRaw)
    const fngValue = fngData?.value
    const fngLabel = fngData?.value_classification

    return [
      {
        id: 'chain',
        label: 'BNB Chain',
        value: onBsc ? 'Active' : 'Indexing',
        meta: onBsc ? 'Primary network' : undefined,
        status: onBsc ? 'gold' : 'neutral',
      },
      {
        id: 'block',
        label: 'Latest block',
        value: block > 0 ? block.toLocaleString() : undefined,
        meta: block > 0 ? 'Live' : undefined,
        status: block > 0 ? 'green' : 'neutral',
      },
      {
        id: 'gas',
        label: 'Gas',
        value: gas,
        meta: gas ? 'Network fee' : undefined,
        status: gas ? 'green' : 'neutral',
      },
      {
        id: 'btc-dom',
        label: 'BTC Dominance',
        value: btcDom != null ? `${btcDom.toFixed(1)}%` : undefined,
        status: btcDom != null ? 'gold' : 'neutral',
      },
      {
        id: 'mcap',
        label: 'Crypto Market Cap',
        value: mcap,
        status: mcap ? 'neutral' : 'neutral',
      },
      {
        id: 'fng',
        label: 'Fear & Greed',
        value: fngValue,
        meta: fngLabel,
        status: fngValue ? 'gold' : 'neutral',
      },
    ]
  }, [block, chainId, fngData, gasRaw, globalData])

  return {
    cells,
    fearGreed: {
      value: fngData?.value,
      classification: fngData?.value_classification,
    },
  }
}

export default useMarketPulseData
