import BigNumber from 'bignumber.js'
import { BLOCKS_PER_DAY } from 'config'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'

export type FarmEmissionState = 'active' | 'zero' | 'no_allocation' | 'paused' | 'unavailable'
export type MasterChefEmissionStatus = 'ready' | 'unavailable' | 'paused' | 'zero-emission'

export interface MasterChefEmissionDiagnostics {
  status: MasterChefEmissionStatus
  contract: string
  method: string
  rawPerBlockHex: string
  rawPerBlockWei: string
  perBlock: number
  rewardToken: string
  rewardDecimals: number
  totalAllocPoint: number
  poolLength: number
  bonusMultiplier: number
  blocksPerDay: number
  perDay: number
  currentBlock: number
  poolAllocations: Record<number, number>
  readError?: string
  reason?: string
  source: string
}

export function decodePerBlockWei(rawWei: string, decimals: number): number {
  if (!rawWei || rawWei === '0x') return NaN
  const n = getBalanceNumber(new BigNumber(rawWei), decimals)
  return Number.isFinite(n) ? n : NaN
}

export function computeTotalDailyMarco(
  perBlock: number,
  blocksPerDay = BLOCKS_PER_DAY,
  multiplier = 1,
): number {
  if (!Number.isFinite(perBlock) || perBlock <= 0) return 0
  if (!Number.isFinite(blocksPerDay) || blocksPerDay <= 0) return 0
  if (!Number.isFinite(multiplier) || multiplier <= 0) return 0
  const total = perBlock * blocksPerDay * multiplier
  return Number.isFinite(total) ? total : 0
}

export function computePerFarmDailyMarco(
  totalDailyMarco: number,
  allocPoint: number,
  totalAllocPoint: number,
): number {
  if (!Number.isFinite(totalDailyMarco) || totalDailyMarco <= 0) return 0
  if (!Number.isFinite(allocPoint) || allocPoint <= 0) return 0
  if (!Number.isFinite(totalAllocPoint) || totalAllocPoint <= 0) return 0
  const daily = (totalDailyMarco * allocPoint) / totalAllocPoint
  return Number.isFinite(daily) ? daily : 0
}

export function resolveMasterChefStatus(input: {
  perBlock: number
  perDay: number
  readError?: string
}): { status: MasterChefEmissionStatus; reason?: string } {
  if (input.readError) {
    return { status: 'unavailable', reason: input.readError }
  }
  if (!Number.isFinite(input.perBlock) || Number.isNaN(input.perBlock)) {
    return { status: 'unavailable', reason: 'Emission per block is NaN' }
  }
  if (input.perBlock <= 0) {
    return { status: 'paused', reason: 'MasterChef emission per block is zero (paused or ended)' }
  }
  if (!Number.isFinite(input.perDay) || input.perDay <= 0) {
    return { status: 'zero-emission', reason: 'Computed daily emission is zero' }
  }
  return { status: 'ready', reason: undefined }
}

export function resolveAllocPointForPid(
  emission: Pick<MasterChefEmissionDiagnostics, 'poolAllocations' | 'totalAllocPoint'>,
  pid: number,
  poolWeight?: number,
): number {
  const fromChain = emission.poolAllocations[pid]
  if (fromChain && fromChain > 0) return fromChain
  if (poolWeight && poolWeight > 0 && poolWeight <= 1 && emission.totalAllocPoint > 0) {
    const derived = poolWeight * emission.totalAllocPoint
    return Number.isFinite(derived) ? Math.round(derived) : 0
  }
  return 0
}

export function computePerFarmDailyFromPoolWeight(totalDailyMarco: number, poolWeight?: number): number {
  if (!Number.isFinite(totalDailyMarco) || totalDailyMarco <= 0) return 0
  if (!poolWeight || poolWeight <= 0 || poolWeight > 1) return 0
  const daily = totalDailyMarco * poolWeight
  return Number.isFinite(daily) ? daily : 0
}

export function resolveFarmEmissionState(
  emission: Pick<
    MasterChefEmissionDiagnostics,
    'status' | 'perBlock' | 'perDay' | 'poolAllocations' | 'readError' | 'totalAllocPoint'
  >,
  pid: number,
  poolWeight?: number,
): { dailyMarco: number; state: FarmEmissionState } {
  if (emission.status === 'unavailable' || emission.readError) {
    return { dailyMarco: 0, state: 'unavailable' }
  }
  if (emission.status === 'paused' || emission.perBlock <= 0) {
    return { dailyMarco: 0, state: 'paused' }
  }
  const allocPoint = resolveAllocPointForPid(emission, pid, poolWeight)
  let daily =
    allocPoint > 0
      ? computePerFarmDailyMarco(emission.perDay, allocPoint, emission.totalAllocPoint)
      : computePerFarmDailyFromPoolWeight(emission.perDay, poolWeight)
  if (daily <= 0) {
    if (poolWeight && poolWeight > 0) return { dailyMarco: 0, state: 'no_allocation' }
    return { dailyMarco: 0, state: 'no_allocation' }
  }
  return { dailyMarco: daily, state: 'active' }
}

/** Format total daily emission for KPI — never maps unknown to zero. */
export function formatTotalDailyEmissionKpi(emission: Pick<MasterChefEmissionDiagnostics, 'status' | 'perDay' | 'readError'>): string {
  if (emission.status === 'unavailable' || emission.readError) return '—'
  if (emission.status === 'paused') return '0 MARCO'
  if (emission.status === 'zero-emission' || emission.perDay <= 0) return '0 MARCO'
  return formatHumanMarcoAmount(emission.perDay)
}

export function formatHumanMarcoAmount(amount: number, symbol = 'MARCO'): string {
  if (!Number.isFinite(amount) || amount <= 0) return '—'
  const text =
    amount >= 1_000_000
      ? `${(amount / 1_000_000).toFixed(2)}M`
      : amount >= 1_000
        ? `${(amount / 1_000).toFixed(1)}K`
        : amount.toFixed(2)
  return `${text} ${symbol}`
}
