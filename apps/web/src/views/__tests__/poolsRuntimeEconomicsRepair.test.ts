import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { evaluateTopPoolsAprEligibility, normalizeAprForDisplay } from 'views/PoolsStudio/poolsRuntime/poolsAprRules'

const STUDIO = path.resolve(__dirname, '../PoolsStudio')

describe('Pools runtime economics + Home market truth repair', () => {
  it('does not hard-cap APR to identical 50%', () => {
    expect(normalizeAprForDisplay(174.78).display).toBe('174.78%')
    expect(normalizeAprForDisplay(50).display).toBe('50.00%')
    expect(normalizeAprForDisplay(85).display).not.toBe('50.00%')
  })

  it('Top Pools display names use stake → earn in formatPoolsRuntime', () => {
    const src = readFileSync(path.join(STUDIO, 'poolsRuntime/formatPoolsRuntime.ts'), 'utf8')
    expect(src).toContain('${pool.stakingToken.symbol} → ${pool.earningToken.symbol}')
    expect(src).not.toContain("return 'MARCO Staking'")
  })

  it('orders eligible APRs descending numerically', () => {
    const rows = [
      { apr: 0.02, tvl: 100 },
      { apr: 9474.57, tvl: 5 },
      { apr: 174.78, tvl: 2000 },
      { apr: 124.87, tvl: 1500 },
    ]
      .map((r) => ({
        ...r,
        el: evaluateTopPoolsAprEligibility({
          rewarding: true,
          emissionActive: true,
          apr: r.apr,
          tvlUsd: r.tvl,
          rewardPriceUsd: 1,
          stakePriceUsd: 1,
        }),
      }))
      .filter((r) => r.el.eligible)
      .sort((a, b) => b.apr - a.apr || b.tvl - a.tvl)
    expect(rows[0].apr).toBe(174.78)
    expect(rows[0].apr).toBeGreaterThan(rows[rows.length - 1].apr)
    expect(rows.map((r) => r.apr)).not.toContain(9474.57)
  })

  it('Pools screen removes standalone Finished and Featured band below KPIs', () => {
    const src = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(src).not.toContain('PoolsFinishedPoolsModule')
    expect(src).not.toContain('PoolsFeaturedPoolBand')
    expect(src).toContain('PoolsHeroModule')
    expect(src).toContain('CreatePoolCta')
    expect(src).toContain('with-create-side')
  })

  it('Hero mounts compact Featured Pool instead of Why Stake panel', () => {
    const hero = readFileSync(path.join(STUDIO, 'modules/PoolsHeroModule.tsx'), 'utf8')
    expect(hero).toContain('PoolsHeroFeaturedCompact')
    expect(hero).not.toContain('PoolsHeroTrustPanel')
  })

  it('Manage is renamed to Stake More for active positions', () => {
    const src = readFileSync(path.join(STUDIO, 'modules/buildPoolsWalletPositions.ts'), 'utf8')
    expect(src).toContain("label: 'Stake More'")
    expect(src).toContain("label: 'Withdraw'")
  })

  it('Finished badge uses red token', () => {
    const card = readFileSync(path.join(STUDIO, 'modules/PoolsMyPositionCard.tsx'), 'utf8')
    expect(card).toContain("Finished' || $tone === 'Ended'")
    expect(card).toContain('#FF6B6B')
  })

  it('Overlay z-index no longer covers modal content', () => {
    const overlay = readFileSync(
      path.resolve(__dirname, '../../../../../packages/uikit/src/components/Overlay/Overlay.tsx'),
      'utf8',
    )
    expect(overlay).toMatch(/z-index:\s*0/)
    expect(overlay).not.toMatch(/z-index:\s*20/)
  })
})
