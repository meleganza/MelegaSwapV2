/**
 * MELEGA_DEX_V1_SMART_SWAP_SINGLE_EXPERIENCE_AND_KERL_DECOMMISSION
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { isKerlRoutingAuthorityEnforced, KERL_ROUTING_AUTHORITY_DECOMMISSIONED } from 'lib/kerl-constitutional/authority'
import { CANONICAL_SWAP_EXPERIENCE, parseSwapExperience } from 'views/Trade/swapExperience'
import { resolveExecutionSourceLabel } from 'views/SmartSwapStudio/modules/SmartSwapExecutionPreview/resolveExecutionSourceLabel'

const WEB = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('MELEGA_DEX_V1_SMART_SWAP_SINGLE_EXPERIENCE_AND_KERL_DECOMMISSION', () => {
  it('Instant Swap is not visible in public UX', () => {
    const panel = load('src/views/HomeTrade/HomeSwapPanel.tsx')
    const dex = load('src/views/HomeTrade/DexHomeScreen.tsx')
    const selector = load('src/views/Trade/components/TradeModeSelector.tsx')
    const docs = load('src/pages/docs/index.tsx')

    expect(panel).not.toContain('TradeModeSelector')
    expect(panel).toContain('mode="smart"')
    expect(dex).not.toContain('Instant Swap')
    expect(dex).toContain('dex-home-swap-terminal')
    expect(selector).toContain('return null')
    expect(docs).not.toContain("title: 'Instant Swap'")
    expect(docs).toContain("title: 'Smart Swap'")
  })

  it('Smart Swap is the single canonical experience', () => {
    expect(CANONICAL_SWAP_EXPERIENCE).toBe('smart')
    expect(parseSwapExperience(null)).toBe('smart')
    expect(parseSwapExperience('instant')).toBe('smart')
    expect(parseSwapExperience('smart')).toBe('smart')

    const cockpit = load('src/views/Trade/TradeCockpit.tsx')
    expect(cockpit).toContain('SmartSwapForm')
    expect(cockpit).toContain('best route across Melega liquidity')
    expect(cockpit).not.toContain('multichain')
  })

  it('product truth rejects multi-DEX / external aggregation claims', () => {
    const routeBox = load('src/views/Trade/components/TradeSmartRouteBox.tsx')
    const header = load('src/views/Trade/components/TradePageHeader.tsx')
    const hero = load('src/views/SmartSwapStudio/modules/smartSwapHeroTokens.ts')
    const source = load(
      'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/resolveExecutionSourceLabel.ts',
    )

    expect(routeBox).toContain('Best Melega route')
    expect(routeBox).not.toContain('Best Route Found')
    expect(header).toContain('Melega liquidity')
    expect(header).not.toContain('multichain')
    expect(hero).toContain('Melega liquidity')
    expect(hero).not.toMatch(/all DEX|All DEX|external DEX/i)
    expect(source).not.toContain('External liquidity source')
    expect(source).not.toContain("'external_liquidity'")
  })

  it('KERL is not enforced on any chain (active path decommissioned)', () => {
    expect(KERL_ROUTING_AUTHORITY_DECOMMISSIONED).toBe(true)
    expect(isKerlRoutingAuthorityEnforced(56)).toBe(false)
    expect(isKerlRoutingAuthorityEnforced(97)).toBe(false)
    expect(isKerlRoutingAuthorityEnforced(undefined)).toBe(false)

    const authority = load('src/lib/kerl-constitutional/authority.ts')
    expect(authority).toContain('KERL_ROUTING_AUTHORITY_DECOMMISSIONED')
    expect(authority).toMatch(/return false/)
  })

  it('route preview labeling stays Melega-scoped', () => {
    const idle = resolveExecutionSourceLabel(null)
    expect(idle.kind).toBe('idle')
    expect(idle.label).toBe('')
  })

  it('Treasury Runtime active references remain zero in swap UX surfaces', () => {
    const panel = load('src/views/HomeTrade/HomeSwapPanel.tsx')
    const form = load('src/views/Swap/SmartSwap/index.tsx')
    const cockpit = load('src/views/Trade/TradeCockpit.tsx')
    const joined = `${panel}\n${form}\n${cockpit}`
    expect(joined).not.toMatch(/treasury\.melega\.ai/i)
    expect(joined).not.toMatch(/Treasury Runtime/)
    expect(joined).not.toMatch(/treasuryRuntime/)
  })
})
