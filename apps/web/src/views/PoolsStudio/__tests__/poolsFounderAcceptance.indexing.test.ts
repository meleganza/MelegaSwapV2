/**
 * Founder Acceptance — pool indexing source contracts (no Redux collect path).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../')

describe('Pools Founder Acceptance indexing', () => {
  it('open-ended emission is treated as funded/rewarding in lifecycle', () => {
    const src = readFileSync(path.join(WEB, 'lib/data-truth/poolLifecycle.ts'), 'utf8')
    expect(src).toContain('openEnded')
    expect(src).toContain('bonusEndBlock <= 0')
    expect(src).toContain('rewarding = active && rewardPerBlockPositive && funded')
    // Regression: endBlock=0 must not mark pools ended via currentBlock > 0
    expect(src).toContain('!openEnded &&')
    expect(src).toContain('getPoolBlockInfo treats endBlock=0 as not started')
  })

  it('remaining runway treats endBlock <= 0 as open-ended', () => {
    const src = readFileSync(path.join(ROOT, 'poolsRuntime/formatPoolPresentation.ts'), 'utf8')
    expect(src).toContain('endBlock <= 0')
    expect(src).toContain('Number.POSITIVE_INFINITY')
  })

  it('classification requires an on-chain reward balance before a pool is funded', () => {
    const src = readFileSync(path.join(WEB, 'lib/bsc-indexer/registry/discoverSmartChefOnChain.ts'), 'utf8')
    expect(src).toContain('const isFunded = rewardBalance > 0n')
    expect(src).toContain('if (pool.active || pool.rewarding) active += 1')
  })

  it('featured selection source prefers highest TVL active SmartChef', () => {
    const fmt = readFileSync(path.join(ROOT, 'poolsRuntime/formatPoolsRuntime.ts'), 'utf8')
    expect(fmt).toContain('highest-TVL active SmartChef pool')
    expect(fmt).toContain("p.id.startsWith('amm-')")
  })

  it('KPI rewarding merges live SmartChef lifecycle with classification', () => {
    const kpi = readFileSync(path.join(ROOT, 'modules/usePoolsOverviewKpis.ts'), 'utf8')
    expect(kpi).toContain('Math.max(classified, liveCount)')
    expect(kpi).toContain('Live SmartChef lifecycle')
  })
})
