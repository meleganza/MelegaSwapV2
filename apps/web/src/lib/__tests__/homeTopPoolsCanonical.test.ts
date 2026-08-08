/**
 * Founder Review V4 — Home Top Pools must share Pools Studio canonical helpers.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { resolvePoolAprPercent, resolvePoolTvlUsd } from 'lib/data-truth/yieldMetricHelpers'
import { GLOBAL_DATA_TRUTH_PIPELINE } from 'lib/data-truth'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('Home Top Pools canonical selector', () => {
  it('Home and Pools Explore use resolvePoolTvlUsd / resolvePoolAprPercent family', () => {
    const home = load('views/HomeTrade/useHomeTradeData.ts')
    const top = load('views/Home/hooks/useGetTopPoolsByApr.tsx')
    const explore = load('views/PoolsStudio/modules/buildPoolsExplorePools.ts')
    expect(home).toContain('resolvePoolTvlUsd')
    expect(top).toContain('resolvePoolTvlUsd')
    expect(top).toContain('resolvePoolAprPercent')
    expect(explore).toContain('resolveTvl')
    expect(explore).toContain('resolveApr')
    expect(GLOBAL_DATA_TRUTH_PIPELINE).toBe('melega-global-data-truth-v1')
  })

  it('Home never pads Top Pools with inventory-only names', () => {
    const home = load('views/HomeTrade/useHomeTradeData.ts')
    expect(home).not.toContain('listLivePoolInventoryPreview')
    expect(home).toContain('Never pad with inventory-only names')
    expect(home).toContain('Certified economics only')
  })

  it('Home farm price prefetch expands earn-token farms like Pools Studio', () => {
    const top = load('views/Home/hooks/useGetTopPoolsByApr.tsx')
    expect(top).toContain('livePoolEarnAddresses')
    expect(top).toContain('earnSet.has')
  })

  it('Pools Studio getActiveFarms includes WBNB helpers like Home price PIDs', () => {
    const hooks = load('state/pools/hooks.ts')
    expect(hooks).toContain("quoteToken.symbol === 'WBNB'")
    expect(hooks).toContain("token.symbol === 'WBNB'")
    expect(hooks).toContain('earnSet')
  })

  it('canonical helpers return non-negative numbers (no invention)', () => {
    expect(typeof resolvePoolTvlUsd).toBe('function')
    expect(typeof resolvePoolAprPercent).toBe('function')
  })
})
