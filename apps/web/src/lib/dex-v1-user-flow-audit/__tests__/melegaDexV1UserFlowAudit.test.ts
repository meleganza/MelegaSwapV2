/**
 * MELEGA_DEX_V1_COMPLETE_USER_FLOW_AUDIT_AND_UX_CONSOLIDATION
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../../../')

function load(rel: string) {
  return readFileSync(path.join(WEB, 'src', rel), 'utf8')
}

describe('MELEGA_DEX_V1_USER_FLOW_AUDIT', () => {
  it('consolidates Home to a single Swap entry over one SmartSwapForm', () => {
    const home = load('views/HomeTrade/DexHomeScreen.tsx')
    const panel = load('views/HomeTrade/HomeSwapPanel.tsx')
    expect(home).toContain('data-testid="dex-home-start-trading"')
    expect(home).toMatch(/dex-home-start-trading[\s\S]{0,120}Swap/)
    expect(home).not.toContain('Trade Terminal')
    expect(home).not.toContain('dex-home-smart-swap')
    expect(home).not.toContain('Instant Swap')
    expect(panel).toContain('TradeModeSelector')
    expect(panel).toContain('SmartSwapForm')
    expect(panel).toContain('showSmartTransparency')
  })

  it('routes Smart mode only through Instant|Smart tabs (hero scrolls to cockpit)', () => {
    const hero = load('views/SmartSwapStudio/modules/smartSwapHeroTokens.ts')
    expect(hero).toContain("primaryCta: 'Go to Swap'")
    expect(hero).not.toContain("primaryCta: 'Start Smart Swap'")
    expect(hero).toContain('tabs')
    const cockpit = load('views/Trade/TradeCockpit.tsx')
    expect(cockpit).toContain('TradeModeSelector')
    expect(cockpit).toContain('SmartSwapForm')
  })

  it('removes duplicate Pools How it Works CTA and List Coming Soon create-token card', () => {
    const pools = load('views/PoolsStudio/modules/poolsHeroTokens.ts')
    expect(pools).toContain('howItWorksReserved: false')
    const list = load('views/ListStudio/ListActionCards.tsx')
    expect(list).toContain('CARDS.filter((def) => def.available)')
  })

  it('keeps canonical header destinations for primary journeys', () => {
    const nav = load('app-shell/config/globalHeaderNav.ts')
    expect(nav).toContain("href: '/'")
    expect(nav).toContain('/liquidity-studio')
    expect(nav).toContain('/farms')
    expect(nav).toContain('/pools')
    expect(nav).toContain('/list')
    expect(nav).toContain('/passport')
  })

  it('does not modify SmartSwapForm / Router / economics', () => {
    const form = load('views/Swap/SmartSwap/index.tsx')
    expect(form).toContain('SmartSwapForm')
    const status = require('child_process')
      .execSync('git status --porcelain', { cwd: path.resolve(WEB, '../..') })
      .toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/melega-smart-router\/smartRouterAdapter/)
    expect(status).not.toMatch(/d87-pricing\//)
  })
})
