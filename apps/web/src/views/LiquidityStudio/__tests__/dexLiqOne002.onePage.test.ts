/**
 * DEX-LIQ-ONE-002 — unified Liquidity one-page composition guards.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { liquidityStudioModeFromView } from '../liquidityRuntime/liquidityStudioView'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('DEX-LIQ-ONE-002 Liquidity one-page final', () => {
  it('default studio mounts UnifiedLiquidityPage without public tab rail', () => {
    const screen = load('LiquidityStudioScreen.tsx')
    expect(screen).toContain('UnifiedLiquidityPage')
    expect(screen).toContain('data-liquidity-one-page')
    expect(screen).not.toContain('LiquidityStudioChrome')
    expect(screen).not.toContain('ls-mode-tabs')
  })

  it('unified page composes required sections', () => {
    const page = load('onePage/UnifiedLiquidityPage.tsx')
    expect(page).toContain('LiquidityPageHeader')
    expect(page).toContain('LiquidityBuildingCard')
    expect(page).toContain('AddLiquidityCard')
    expect(page).toContain('DexLiquiditySnapshot')
    expect(page).toContain('WalletLiquidityOverview')
    expect(page).toContain('LiquidityPositions')
    expect(page).toContain('LiquidityEducationRail')
    expect(page).not.toContain('View Old Liquidity Building')
    expect(page).not.toContain('View Pools')
  })

  it('explore deep link redirects to /pools', () => {
    const page = load('onePage/UnifiedLiquidityPage.tsx')
    expect(page).toContain("router.replace('/pools')")
    expect(liquidityStudioModeFromView('explore')).toBe('Add Liquidity')
  })

  it('Add Liquidity card only anchors to positions', () => {
    const add = load('onePage/AddLiquidityCard.tsx')
    expect(add).toContain('View Your Positions')
    expect(add).not.toContain('View Pools')
    expect(add).toContain('LiquidityBuilderPanel')
  })

  it('DEX snapshot refuses fabricated TVL', () => {
    const snap = load('onePage/DexLiquiditySnapshot.tsx')
    expect(snap).toContain('useProtocolDataSWR')
    expect(snap).toContain('Liquidity data awaiting indexer')
    expect(snap).not.toContain('$58.74M')
    expect(snap).not.toContain('Top 50 Pairs')
  })

  it('overview uses Total LP Value label and truthful fee unavailable', () => {
    const overview = load('onePage/WalletLiquidityOverview.tsx')
    expect(overview).toContain('Total LP Value')
    expect(overview).not.toMatch(/>\s*TVL\s*</)
    expect(overview).toContain('Fee accrual unavailable')
  })

  it('LB lifecycle remains inside the Liquidity Building card shell', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('useLiquidityBuildingCard')
    expect(card).toContain('data-liquidity-building-panel')
    expect(card).toContain('liq-one-building-card')
  })

  it('education rail uses approved non-overclaiming copy', () => {
    const rail = load('onePage/LiquidityEducationRail.tsx')
    expect(rail).toContain('How Liquidity Works')
    expect(rail).toContain('Always Non-Custodial')
    expect(rail).toContain('Security First')
    expect(rail).not.toContain('guaranteed returns')
  })
})
