import { useMemo } from 'react'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { MELEGA_PRODUCTION_CONTRACTS } from './ontology'

export interface CanonicalMarcoPrice {
  usd?: number
  label?: string
  source: string
  contract: string
  asOf: string
}

/** Single canonical MARCO/USD price object for homepage, trade, trending, and stats. */
export function useCanonicalMarcoPrice(): CanonicalMarcoPrice {
  const price = usePriceCakeBusd({ forceMainnet: true })
  return useMemo(() => {
    const usd = price?.toNumber()
    const valid = usd != null && Number.isFinite(usd) && usd > 0
    return {
      usd: valid ? usd : undefined,
      label: valid ? `$${usd!.toFixed(4)}` : undefined,
      source: 'MARCO/USDT AMM pair reserves via usePriceCakeBusd',
      contract: MELEGA_PRODUCTION_CONTRACTS.factory,
      asOf: new Date().toISOString(),
    }
  }, [price])
}
