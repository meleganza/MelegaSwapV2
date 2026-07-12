import { describe, expect, it } from 'vitest'
import {
  computePerFarmDailyMarco,
  computeTotalDailyMarco,
  decodePerBlockWei,
  formatTotalDailyEmissionKpi,
  resolveFarmEmissionState,
  resolveMasterChefStatus,
} from 'lib/data-truth/masterChefEmissionMath'
import type { MasterChefEmission } from 'lib/data-truth/useMasterChefEmission'
import { aggregateKpis, mapFarmToPreviewCard } from 'views/FarmsStudio/farmsRuntime/formatFarmsRuntime'
import fs from 'node:fs'
import path from 'node:path'

const WEI_5_MARCO = '5000000000000000000'

describe('masterChefEmissionMath', () => {
  it('normalizes 5 MARCO per block from wei', () => {
    expect(decodePerBlockWei(WEI_5_MARCO, 18)).toBe(5)
  })

  it('computes total daily emission with multiplier', () => {
    expect(computeTotalDailyMarco(5, 28800, 1)).toBe(144000)
  })

  it('returns zero daily for paused emission without NaN', () => {
    expect(computeTotalDailyMarco(0, 28800, 1)).toBe(0)
    expect(Number.isNaN(computeTotalDailyMarco(NaN, 28800, 1))).toBe(false)
  })

  it('handles zero totalAllocPoint safely', () => {
    expect(computePerFarmDailyMarco(144000, 10000, 0)).toBe(0)
  })

  it('computes per-farm allocation', () => {
    const daily = computePerFarmDailyMarco(144000, 10000, 478453)
    expect(daily).toBeGreaterThan(3000)
    expect(daily).toBeLessThan(3010)
    expect(Number.isFinite(daily)).toBe(true)
  })

  it('distinguishes unavailable from zero emission KPI formatting', () => {
    expect(formatTotalDailyEmissionKpi({ status: 'unavailable', perDay: 0, readError: 'rpc fail' })).toBe('—')
    expect(formatTotalDailyEmissionKpi({ status: 'paused', perDay: 0 })).toBe('0 MARCO')
    expect(formatTotalDailyEmissionKpi({ status: 'ready', perDay: 144000 })).toContain('MARCO')
  })

  it('resolveMasterChefStatus keeps paused distinct from unavailable', () => {
    expect(resolveMasterChefStatus({ perBlock: 0, perDay: 0 }).status).toBe('paused')
    expect(resolveMasterChefStatus({ perBlock: NaN, perDay: 0, readError: 'bad' }).status).toBe('unavailable')
  })

  it('resolveFarmEmissionState uses allocPoint not poolWeight', () => {
    const emission: MasterChefEmission = {
      status: 'ready',
      contract: '0x41D5487836452d23f2c467070244E5842B412794',
      method: 'dexTokenPerBlock',
      rawPerBlockHex: '0x',
      rawPerBlockWei: WEI_5_MARCO,
      perBlock: 5,
      rewardToken: '0x9635',
      rewardDecimals: 18,
      totalAllocPoint: 478453,
      poolLength: 387,
      bonusMultiplier: 1,
      blocksPerDay: 28800,
      perDay: 144000,
      currentBlock: 1,
      poolAllocations: { 1: 10000 },
      source: 'test',
      perDayLabel: '144000 MARCO',
    }
    const active = resolveFarmEmissionState(emission, 1)
    expect(active.state).toBe('active')
    expect(active.dailyMarco).toBeGreaterThan(0)
    const none = resolveFarmEmissionState(emission, 999)
    expect(none.state).toBe('no_allocation')
  })
})

describe('R783 farms regression', () => {
  it('useFarmsTerminalData is imported where referenced', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts'),
      'utf8',
    )
    expect(src).toMatch(/import\s+\{\s*useFarmsTerminalData\s*\}/)
    expect(src.includes('useFarmsTerminalData()')).toBe(true)
  })

  it('useMasterChefEmission module exports hook', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/lib/data-truth/useMasterChefEmission.ts'), 'utf8')
    expect(src).toMatch(/export function useMasterChefEmission/)
  })

  it('positive emission never formats as Unavailable in KPI', () => {
    const emission: MasterChefEmission = {
      status: 'ready',
      contract: '0x41',
      method: 'dexTokenPerBlock',
      rawPerBlockHex: '0x',
      rawPerBlockWei: WEI_5_MARCO,
      perBlock: 5,
      rewardToken: '0x9635',
      rewardDecimals: 18,
      totalAllocPoint: 478453,
      poolLength: 387,
      bonusMultiplier: 1,
      blocksPerDay: 28800,
      perDay: 144000,
      currentBlock: 1,
      poolAllocations: { 1: 10000 },
      source: 'test',
      perDayLabel: '144000 MARCO',
    }
    const kpis = aggregateKpis([], emission, 'MARCO / WBNB')
    const rewards = kpis.find((k) => k.id === 'rewards')
    expect(rewards?.value).not.toBe('—')
    expect(rewards?.value).toContain('MARCO')
  })
})
