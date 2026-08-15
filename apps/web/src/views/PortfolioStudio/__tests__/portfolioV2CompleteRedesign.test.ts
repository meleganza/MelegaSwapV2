import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildAssetsSummary, buildClaimables, buildHeroCtas } from '../runtime/buildPortfolioViewModel'
import { resolvePortfolioSurfaceState } from '../runtime/portfolioState'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Portfolio V2 complete redesign', () => {
  it('shell has required sections and no identity enrollment language', () => {
    const shell = load('PortfolioStudioScreen.tsx')
    expect(shell).toContain('portfolio-studio-screen')
    expect(shell).toContain('portfolio-section-hero')
    expect(shell).toContain('portfolio-section-assets')
    expect(shell).toContain('portfolio-section-positions')
    expect(shell).toContain('portfolio-section-rewards')
    expect(shell).toContain('portfolio-section-activity')
    expect(shell).toContain('Portfolio Performance')
    expect(shell).toContain('portfolio-four-donuts')
    expect(shell).toContain("['liquidity', 'farms', 'pools']")
    expect(shell).toContain('portfolio-donut-${domain}')
    expect(shell).toContain('portfolio-donut-chains')
    expect(shell).toContain('By Chain')
    expect(shell).toContain('No synthetic historical values are generated')
    expect(shell).toContain('<span>Portfolio</span>')
    expect(shell).toContain('Rewards')
    expect(shell).not.toContain('<KpiStack>')
    expect(shell).not.toContain('usePassportHeroIdentity')
    expect(shell).not.toContain('Guest')
    expect(shell).not.toContain('VERIFICATION')
    expect(shell).not.toContain('data-passport')
  })

  it('runtime has no identity enrollment hooks or passport surface states', () => {
    const runtime = load('runtime/usePortfolioRuntime.ts')
    expect(runtime).toContain('usePortfolioRuntime')
    expect(runtime).not.toContain('usePassportHeroIdentity')
    expect(runtime).not.toContain('passportExists')
    expect(runtime).not.toContain('verificationState')

    const state = load('runtime/portfolioState.ts')
    expect(state).not.toContain('CONNECTED_NO_PASSPORT')
    expect(state).not.toContain('CONNECTED_PASSPORT')
    expect(
      resolvePortfolioSurfaceState(false, {
        walletLoading: false,
        liquidityLoading: false,
        farmsLoading: false,
        poolsLoading: false,
        anyDomainError: false,
        anyDomainPartial: false,
        hasLastGoodPositions: false,
        hasAnyFactualPositions: false,
      }),
    ).toBe('DISCONNECTED')
  })

  it('assets summary excludes controlled projects metric', () => {
    const summary = buildAssetsSummary({
      walletConnected: true,
      liquidity: [],
      farms: [],
      pools: [],
      claimables: [],
      domains: { liquidityLoading: false, farmsLoading: false, poolsLoading: false },
    })
    expect(summary.metrics.map((m) => m.id)).toEqual(['portfolio', 'liquidity', 'farms', 'pools', 'rewards'])
    expect(summary.metrics.find((m) => m.id === 'projects')).toBeUndefined()
  })

  it('hero CTAs are wallet/product only — no verify or manage passport', () => {
    const disconnected = buildHeroCtas(false)
    expect(disconnected[0].kind).toBe('connect')
    const connected = buildHeroCtas(true)
    expect(connected.every((c) => ['farms', 'pools', 'liquidity'].includes(c.kind))).toBe(true)
    expect(connected.some((c) => /passport|verify|identity/i.test(c.label))).toBe(false)
  })

  it('claimables builder only includes non-zero rewards', () => {
    const rows = buildClaimables({
      farms: [
        {
          positionId: 'f1',
          pendingFormatted: '0',
          rewardToken: { symbol: 'MARCO' },
          title: 'A',
          lpToken: { symbol: 'LP', address: null },
          masterChef: null,
          chainId: 56,
        } as any,
        {
          positionId: 'f2',
          pendingFormatted: '12.5 MARCO',
          pendingValue: '$1.00',
          rewardToken: { symbol: 'MARCO' },
          title: 'B',
          lpToken: { symbol: 'LP', address: null },
          masterChef: null,
          chainId: 56,
        } as any,
      ],
      pools: [],
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toContain('f2')
  })

  it('pages and nav point Portfolio to /portfolio', () => {
    const portfolioPage = readFileSync(path.resolve(__dirname, '../../../pages/portfolio/index.tsx'), 'utf8')
    expect(portfolioPage).toContain('PortfolioStudioScreen')
    const passportPage = readFileSync(path.resolve(__dirname, '../../../pages/passport/index.tsx'), 'utf8')
    expect(passportPage).toContain("replace('/portfolio')")
    const nav = readFileSync(path.resolve(__dirname, '../../../app-shell/config/navigation.ts'), 'utf8')
    expect(nav).toContain("href: '/portfolio'")
  })
})
