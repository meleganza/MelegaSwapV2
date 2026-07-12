import { useMemo } from 'react'
import useSWR from 'swr'
import { BLOCKS_PER_DAY } from 'config'
import { useFarms } from 'state/farms/hooks'
import { MELEGA_PRODUCTION_CONTRACTS } from './ontology'

export interface MasterChefEmission {
  perBlock: number
  perDay: number
  perDayLabel: string
  source: string
  contract: string
  readError?: string
}

async function fetchMasterChefEmission(): Promise<{ perBlock: number; perDay: number; source: string } | null> {
  const res = await fetch('/api/masterchef/emission')
  if (!res.ok) return null
  const json = (await res.json()) as { perBlock?: number; perDay?: number; source?: string }
  if (json.perBlock == null || json.perBlock <= 0) return null
  return {
    perBlock: json.perBlock,
    perDay: json.perDay ?? json.perBlock * BLOCKS_PER_DAY,
    source: json.source ?? 'MasterChef API',
  }
}

/** Canonical MARCO emission from MasterChef dexTokenPerBlock with Redux + API fallback. */
export function useMasterChefEmission(): MasterChefEmission {
  const { regularCakePerBlock } = useFarms()
  const { data: apiEmission } = useSWR('masterchef-emission-api', fetchMasterChefEmission, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })

  return useMemo(() => {
    const perBlock =
      regularCakePerBlock > 0
        ? regularCakePerBlock
        : apiEmission?.perBlock != null && apiEmission.perBlock > 0
          ? apiEmission.perBlock
          : 0
    const perDay = perBlock > 0 ? perBlock * BLOCKS_PER_DAY : apiEmission?.perDay ?? 0
    const source =
      regularCakePerBlock > 0
        ? 'MasterChef dexTokenPerBlock via Redux farms state'
        : apiEmission?.perBlock
          ? apiEmission.source
          : 'unavailable'
    return {
      perBlock,
      perDay,
      perDayLabel: perBlock > 0 ? `${perDay.toLocaleString(undefined, { maximumFractionDigits: 2 })} MARCO` : '',
      source,
      contract: MELEGA_PRODUCTION_CONTRACTS.masterChef,
      readError: perBlock <= 0 ? 'dexTokenPerBlock unavailable from Redux and API' : undefined,
    }
  }, [regularCakePerBlock, apiEmission])
}
