import { useMemo } from 'react'
import useSWR from 'swr'
import { BLOCKS_PER_DAY } from 'config'
import { useFarms } from 'state/farms/hooks'
import { MELEGA_PRODUCTION_CONTRACTS } from './ontology'
import {
  resolveMasterChefStatus,
  type MasterChefEmissionDiagnostics,
  type MasterChefEmissionStatus,
} from './masterChefEmissionMath'

export interface MasterChefEmission extends MasterChefEmissionDiagnostics {
  perDayLabel: string
}

type ApiEmissionPayload = MasterChefEmissionDiagnostics & {
  error?: string
  masterChefAddress?: string
  emissionMethod?: string
  rawEmissionPerBlock?: string
  normalizedEmissionPerBlock?: number
  totalDailyEmission?: number
  multiplier?: number
}

function mapApiPayload(json: ApiEmissionPayload): MasterChefEmissionDiagnostics | null {
  if (json.error) return null
  const perBlock = json.normalizedEmissionPerBlock ?? json.perBlock ?? NaN
  const perDay = json.totalDailyEmission ?? json.perDay ?? 0
  const readError = json.status === 'unavailable' ? json.reason ?? json.readError : undefined
  const status: MasterChefEmissionStatus =
    json.status ?? resolveMasterChefStatus({ perBlock, perDay, readError }).status

  if (status === 'unavailable' && !perBlock) return null

  return {
    status,
    contract: json.masterChefAddress ?? json.contract ?? MELEGA_PRODUCTION_CONTRACTS.masterChef,
    method: json.emissionMethod ?? json.method ?? 'dexTokenPerBlock',
    rawPerBlockHex: json.rawEmissionPerBlock ?? json.rawPerBlockHex ?? '',
    rawPerBlockWei: json.rawPerBlockWei ?? '',
    perBlock: Number.isFinite(perBlock) ? perBlock : 0,
    rewardToken: json.rewardToken ?? '',
    rewardDecimals: json.decimals ?? json.rewardDecimals ?? 18,
    totalAllocPoint: json.totalAllocPoint ?? 0,
    poolLength: json.poolLength ?? 0,
    bonusMultiplier: json.multiplier ?? json.bonusMultiplier ?? 1,
    blocksPerDay: json.blocksPerDay ?? BLOCKS_PER_DAY,
    perDay,
    currentBlock: json.currentBlock ?? 0,
    poolAllocations: json.poolAllocations ?? {},
    readError,
    reason: json.reason,
    source: json.source ?? 'masterchef-rpc',
  }
}

async function fetchMasterChefEmission(pids?: number[]): Promise<MasterChefEmissionDiagnostics | null> {
  const qs = pids?.length ? `?pids=${pids.join(',')}` : ''
  const res = await fetch(`/api/masterchef/emission${qs}`)
  if (!res.ok) return null
  const json = (await res.json()) as ApiEmissionPayload
  return mapApiPayload(json)
}

/** Canonical MARCO emission from MasterChef dexTokenPerBlock (API-first, Redux fallback for APR only). */
export function useMasterChefEmission(farmPids?: number[]): MasterChefEmission {
  const { regularCakePerBlock } = useFarms()
  const swrKey = farmPids?.length ? `masterchef-emission-${farmPids.join(',')}` : 'masterchef-emission-api'
  const { data: apiEmission, error: swrError } = useSWR(swrKey, () => fetchMasterChefEmission(farmPids), {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })

  return useMemo(() => {
    const mapped = apiEmission ?? null
    const apiReady = mapped?.status === 'ready' && mapped.perBlock > 0
    const perBlock = apiReady ? mapped!.perBlock : regularCakePerBlock > 0 ? regularCakePerBlock : 0
    const bonusMultiplier = mapped?.bonusMultiplier ?? 1
    const blocksPerDay = mapped?.blocksPerDay ?? BLOCKS_PER_DAY
    const perDay = mapped?.perDay ?? (perBlock > 0 ? perBlock * blocksPerDay * bonusMultiplier : 0)
    const readError =
      mapped?.readError ??
      (swrError instanceof Error
        ? swrError.message
        : !apiReady && perBlock <= 0
          ? 'dexTokenPerBlock unavailable from MasterChef API and Redux'
          : undefined)
    const status = mapped?.status ?? resolveMasterChefStatus({ perBlock, perDay, readError }).status

    return {
      status,
      contract: mapped?.contract ?? MELEGA_PRODUCTION_CONTRACTS.masterChef,
      method: mapped?.method ?? 'dexTokenPerBlock',
      rawPerBlockHex: mapped?.rawPerBlockHex ?? '',
      rawPerBlockWei: mapped?.rawPerBlockWei ?? '',
      perBlock,
      rewardToken: mapped?.rewardToken ?? '',
      rewardDecimals: mapped?.rewardDecimals ?? 18,
      totalAllocPoint: mapped?.totalAllocPoint ?? 0,
      poolLength: mapped?.poolLength ?? 0,
      bonusMultiplier,
      blocksPerDay,
      perDay,
      currentBlock: mapped?.currentBlock ?? 0,
      poolAllocations: mapped?.poolAllocations ?? {},
      readError,
      reason: mapped?.reason ?? readError,
      source: apiReady ? mapped!.source : regularCakePerBlock > 0 ? 'redux-farms-fallback' : 'unavailable',
      perDayLabel: status === 'ready' && perDay > 0 ? `${perDay.toLocaleString(undefined, { maximumFractionDigits: 2 })} MARCO` : '',
    }
  }, [regularCakePerBlock, apiEmission, swrError])
}
