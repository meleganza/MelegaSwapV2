import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { LB_SUCCESS_FEE_BPS, LB_BPS } from 'lib/liquidity-building-runtime/types'
import { liquidityStudioModeFromView } from '../liquidityRuntime/liquidityStudioView'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('DS001.3 Liquidity Studio home', () => {
  it('default /liquidity-studio renders home with exactly two primary product cards', () => {
    const screen = load('LiquidityStudioScreen.tsx')
    const home = load('components/LiquidityStudioHome.tsx')
    expect(screen).toContain('LiquidityStudioHome')
    expect(screen).toContain('isHome')
    expect(home).toContain('data-testid="ls-card-add-liquidity"')
    expect(home).toContain('data-testid="ls-card-liquidity-building"')
    expect(home).toContain('Add Liquidity')
    expect(home).toContain('Liquidity Building')
    expect(home.match(/data-testid="ls-card-/g)?.length).toBe(2)
  })

  it('old page tabs and positions grid are absent from Studio home', () => {
    const screen = load('LiquidityStudioScreen.tsx')
    const home = load('components/LiquidityStudioHome.tsx')
    expect(screen).not.toContain('LiquidityStudioPageHeader')
    expect(home).not.toContain('ls-mode-tabs')
    expect(home).not.toContain('Explore Liquidity')
    expect(home).not.toContain('My Positions')
    expect(home).not.toContain('YourLiquidityPositionsSection')
    expect(home).not.toContain('MarketIntelligencePanel')
    expect(home).not.toContain('AILiquidityAdvisorPanel')
    expect(home).not.toContain('Liquidity Activity')
    expect(home).not.toContain('Liquidity Builder')
  })

  it('primary CTAs route to certified deep links', () => {
    const home = load('components/LiquidityStudioHome.tsx')
    expect(home).toContain('href="/liquidity-studio?view=add"')
    expect(home).toContain('href="/liquidity-studio?view=building"')
    expect(home).toContain('href="/liquidity-studio?view=positions"')
    expect(home).toContain('data-testid="ls-cta-program-status"')
    expect(home).toMatch(/view=building" data-testid="ls-cta-program-status"/)
  })

  it('view query mapping preserves deep links and home has no view', () => {
    expect(liquidityStudioModeFromView(undefined)).toBeNull()
    expect(liquidityStudioModeFromView('add')).toBe('Add Liquidity')
    expect(liquidityStudioModeFromView('building')).toBe('Liquidity Building')
    expect(liquidityStudioModeFromView('positions')).toBe('My Positions')
    expect(liquidityStudioModeFromView('remove')).toBe('Remove Liquidity')
    expect(liquidityStudioModeFromView('simulation')).toBe('Simulation')
  })

  it('product views expose Back to Liquidity Studio without page tabs', () => {
    const header = load('components/LiquidityStudioProductHeader.tsx')
    const screen = load('LiquidityStudioScreen.tsx')
    expect(header).toContain('Back to Liquidity Studio')
    expect(header).toContain('href="/liquidity-studio"')
    expect(screen).toContain('LiquidityStudioProductHeader')
    expect(header).not.toContain('ls-mode-tabs')
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

  it('content max width follows DS001 container', () => {
    const screen = load('LiquidityStudioScreen.tsx')
    expect(screen).toContain('ds001Layout.contentMaxWidth')
  })
})
