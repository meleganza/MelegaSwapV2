import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { LB_SUCCESS_FEE_BPS, LB_BPS } from 'lib/liquidity-building-runtime/types'
import { liquidityStudioModeFromView } from '../liquidityRuntime/liquidityStudioView'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('DS001.3 Liquidity Studio home (compat) + UX rebuild dense studio', () => {
  it('default /liquidity-studio uses dense chrome; legacy two-card home at ?view=home', () => {
    const screen = load('LiquidityStudioScreen.tsx')
    const home = load('components/LiquidityStudioHome.tsx')
    const chrome = load('components/LiquidityStudioChrome.tsx')
    expect(screen).toContain('LiquidityStudioChrome')
    expect(screen).toContain('isLegacyHomeView')
    expect(screen).toContain('LiquidityStudioHome')
    expect(chrome).toContain('Positions')
    expect(chrome).toContain('Liquidity Building')
    expect(home).toContain('data-testid="ls-card-add-liquidity"')
    expect(home).toContain('data-testid="ls-card-liquidity-building"')
    expect(home.match(/data-testid="ls-card-/g)?.length).toBe(2)
  })

  it('legacy marketing home remains free of old page tabs', () => {
    const home = load('components/LiquidityStudioHome.tsx')
    expect(home).not.toContain('ls-mode-tabs')
    expect(home).not.toContain('Explore Liquidity')
    expect(home).not.toContain('My Positions')
    expect(home).not.toContain('YourLiquidityPositionsSection')
    expect(home).not.toContain('MarketIntelligencePanel')
    expect(home).not.toContain('AILiquidityAdvisorPanel')
    expect(home).not.toContain('Liquidity Activity')
  })

  it('primary CTAs route to certified deep links', () => {
    const home = load('components/LiquidityStudioHome.tsx')
    expect(home).toContain('href="/liquidity-studio?view=add"')
    expect(home).toContain('href="/liquidity-studio?view=building"')
    expect(home).toContain('href="/liquidity-studio?view=positions"')
    expect(home).toContain('data-testid="ls-cta-program-status"')
    expect(home).toMatch(/view=building" data-testid="ls-cta-program-status"/)
  })

  it('view query mapping preserves deep links; null view defaults in screen to positions', () => {
    expect(liquidityStudioModeFromView(undefined)).toBeNull()
    expect(liquidityStudioModeFromView('add')).toBe('Add Liquidity')
    expect(liquidityStudioModeFromView('explore')).toBe('Add Liquidity')
    expect(liquidityStudioModeFromView('building')).toBe('Liquidity Building')
    expect(liquidityStudioModeFromView('positions')).toBe('My Positions')
    expect(liquidityStudioModeFromView('remove')).toBe('Remove Liquidity')
    expect(liquidityStudioModeFromView('simulation')).toBe('Simulation')
    const screen = load('LiquidityStudioScreen.tsx')
    expect(screen).toContain("'My Positions'")
  })

  it('studio chrome exposes segmented navigation', () => {
    const chrome = load('components/LiquidityStudioChrome.tsx')
    const screen = load('LiquidityStudioScreen.tsx')
    expect(chrome).toContain('ls-mode-tabs')
    expect(chrome).toContain('ls-seg-positions')
    expect(chrome).toContain('ls-seg-explore')
    expect(chrome).toContain('ls-seg-add')
    expect(chrome).toContain('ls-seg-building')
    expect(screen).toContain('LiquidityStudioChrome')
  })

  it('trust strip fee uses canonical LB success fee bps', () => {
    const home = load('components/LiquidityStudioHome.tsx')
    const pct = (LB_SUCCESS_FEE_BPS / LB_BPS) * 100
    expect(home).toContain('LB_SUCCESS_FEE_BPS')
    expect(pct).toBe(5)
    expect(home).not.toContain('$24.56M')
    expect(home).not.toContain('$0.0004')
  })

  it('overview metrics fall back to em dash when unavailable', () => {
    const home = load('components/LiquidityStudioHome.tsx')
    expect(home).toContain("'—'")
    expect(home).toContain('formatUsd')
  })

  it('content max width follows UX rebuild container', () => {
    const screen = load('LiquidityStudioScreen.tsx')
    expect(screen).toContain('uxRebuildLayout.contentMax')
  })
})
