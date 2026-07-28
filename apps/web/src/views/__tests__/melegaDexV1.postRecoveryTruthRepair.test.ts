/**
 * MELEGA_DEX_V1_POST_RECOVERY — product truth + runtime stability gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildPoolsWalletPositionsViewModel } from '../PoolsStudio/modules/buildPoolsWalletPositions'
import {
  resolveDiscoverySymbol,
  toDiscoveryCard,
  sortDiscoveryCards,
} from '../LiquidityStudio/modules/liquidityPoolDiscoveryModel'
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'

/** Mirror of useDexTrendingRankings.isCredibleMoverChange (keep import-free for vitest). */
function isCredibleMoverChange(input: {
  pct: number
  tradeCount24h: number
  volume24h: number
  liquidityScore: number
}): boolean {
  const abs = Math.abs(input.pct)
  if (!Number.isFinite(abs) || abs <= 0.0001) return false
  if (input.tradeCount24h < 1 && input.volume24h <= 0) return false
  if (abs > 25 && input.tradeCount24h < 3) return false
  if (abs > 40 && input.liquidityScore <= 0) return false
  if (abs > 80) return false
  return true
}

const WEB = path.resolve(__dirname, '../../../')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

function pair(partial: Partial<ClassifiedAmmPair> = {}): ClassifiedAmmPair {
  return {
    pairAddress: '0x7286eE8dA7418B0461a4D1F6A9a7F6d5a0b0b0b0',
    token0: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol0: undefined,
    symbol1: undefined,
    active: true,
    classification: 'tradeable',
    reserve0: '1',
    reserve1: '1',
    ...partial,
  } as ClassifiedAmmPair
}

describe('Post-recovery Smart Swap labels', () => {
  it('uses Instant | Smart without STANDARD / SMARTSWAP NEW', () => {
    const sel = load('src/views/Trade/components/TradeModeSelector.tsx')
    expect(sel).toContain('Instant')
    expect(sel).toContain('Smart')
    expect(sel).not.toContain('STANDARD')
    expect(sel).not.toContain('SMARTSWAP')
    expect(sel).not.toContain('Finds the best available route')
    expect(load('src/views/Trade/swapExperience.ts')).toContain("'instant' | 'smart'")
  })
})

describe('Post-recovery Liquidity truth', () => {
  it('resolves symbols from canonical registry and never titles with addresses', () => {
    const marco = resolveDiscoverySymbol('0x963556de0eb8138E97A85F0A86eE0acD159D210b')
    expect(marco).not.toMatch(/^0x/)
    expect(resolveDiscoverySymbol('0x9804b647a4ca2032efcac920775276591def489d')).toBe('Unknown')
    const card = toDiscoveryCard(pair(), { tvlUsd: 1000, volumeUsd: 10 })
    expect(card?.pairName).toMatch(/\//)
    expect(card?.pairName).not.toMatch(/0x[a-fA-F0-9]/i)
  })

  it('default-sorts by market qualityScore (active/liquidity first)', () => {
    const a = toDiscoveryCard(pair({ pairAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', active: false, classification: 'inactive' }), {})!
    const b = toDiscoveryCard(pair({ pairAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }), { tvlUsd: 5000 })!
    const sorted = sortDiscoveryCards([a, b], 'market')
    expect(sorted[0]?.id).toBe(b.id)
  })
})

describe('Post-recovery Pools last-good', () => {
  it('uses module-scoped cache + generation abort (survives remount)', () => {
    const hook = load('src/views/PoolsStudio/modules/usePoolsWalletPositions.ts')
    expect(hook).toContain('lastGoodByScope')
    expect(hook).toContain('AbortController')
    expect(hook).toContain('do NOT clear module last-good cache')
  })

  it('does not treat zeroed refresh as authoritative empty when previous exists', () => {
    const previous = [
      {
        positionId: 'pool:56:0xabc:1',
        claimableFormatted: '12.5 MARCO',
        claimableRaw: '12500000000000000000',
        claimableValue: '($6.25)',
        stakedFormatted: '1 LP',
        positionStatus: 'ACTIVE',
      },
    ] as any
    const vm = buildPoolsWalletPositionsViewModel({
      account: '0xabc',
      chainId: 56,
      portfolioPools: [
        {
          id: '1',
          sousId: 1,
          userStaked: undefined,
          pendingReward: undefined,
          status: 'live',
          tokens: ['MARCO'],
          tvl: '—',
          rewardToken: 'MARCO',
          name: 'x',
        } as unknown as PoolPreviewCard,
      ],
      userDataLoaded: true,
      poolsLoading: false,
      previous,
      previousWallet: '0xabc',
      previousChainId: 56,
      generation: 2,
    })
    expect(vm.state).toBe('stale')
    expect(vm.positions.length).toBe(1)
    expect(vm.authoritativeEmpty).toBe(false)
  })
})

describe('Post-recovery Top Movers credibility', () => {
  it('rejects extreme unproven percentages', () => {
    const src = load('src/views/HomeTrade/useDexTrendingRankings.ts')
    expect(src).toContain('export function isCredibleMoverChange')
    expect(src).toContain('abs > 40 && input.liquidityScore <= 0')
    expect(src).not.toContain('full multi-day OHLCV history fallback')
    expect(
      isCredibleMoverChange({ pct: -49.1, tradeCount24h: 1, volume24h: 10, liquidityScore: 0 }),
    ).toBe(false)
    expect(
      isCredibleMoverChange({ pct: -4.2, tradeCount24h: 5, volume24h: 1000, liquidityScore: 1 }),
    ).toBe(true)
  })

  it('labels ribbon TOP MOVERS', () => {
    expect(load('src/views/HomeTrade/TrendingRibbon.tsx')).toContain('TOP MOVERS')
    expect(load('src/views/HomeTrade/TrendingRibbon.tsx')).not.toContain('🔥 TRENDING')
  })
})

describe('Post-recovery Hero composition', () => {
  it('mounts compact Featured Farm/Pool in Hero and avoids clipped fixed trust height', () => {
    expect(load('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')).toContain('FarmsHeroFeaturedCompact')
    expect(load('src/views/PoolsStudio/modules/PoolsHeroModule.tsx')).toContain('PoolsHeroFeaturedCompact')
    expect(load('src/views/FarmsStudio/modules/FarmsHeroTrustPanel.tsx')).toContain('height: auto')
    expect(load('src/views/PoolsStudio/modules/PoolsHeroTrustPanel.tsx')).toContain('height: auto')
    expect(load('src/views/PoolsStudio/modules/poolsOverviewKpisTokens.ts')).toContain('Total Pools')
  })
})
