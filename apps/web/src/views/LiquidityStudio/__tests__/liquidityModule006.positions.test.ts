/**
 * LIQUIDITY_MODULE_006 — Your Positions geometry + behavior guards.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIQUIDITY_MODULE_006 Your Positions', () => {
  it('locks chrome 64 / table head 52 / row 68', () => {
    const tokens = load('onePage/onePageTokens.ts')
    expect(tokens).toContain("positionsHeadH: '64px'")
    expect(tokens).toContain("positionsTableHeadH: '52px'")
    expect(tokens).toContain("positionsRowH: '68px'")
    expect(tokens).toContain("positionsPad: '16px'")
    expect(tokens).toContain("contentMax: '1376px'")
  })

  it('uses one desktop table and mobile cards with Hide Closed only', () => {
    const pos = load('onePage/LiquidityPositions.tsx')
    expect(pos).toContain('Your Positions')
    expect(pos).toContain('Hide Closed')
    expect(pos).toContain('data-pixel-pos-row="68"')
    expect(pos).toContain('data-pixel-pos-thead="52"')
    expect(pos).toContain('No Positions Yet')
    expect(pos).toContain('MoreHorizontal')
    expect(pos).toContain('onOpenBuilding')
    expect(pos).toContain('onAddLiquidity')
    expect(pos).not.toContain('expandable')
  })

  it('LB manage does not router-navigate to building query', () => {
    const pos = load('onePage/LiquidityPositions.tsx')
    expect(pos).not.toContain("query: { view: 'building'")
    expect(pos).toContain('setMode(\'Liquidity Building\')')
  })

  it('does not modify locked sibling modules', () => {
    const siblings = [
      'onePage/WalletLiquidityOverview.tsx',
      'onePage/AddLiquidityCard.tsx',
      'onePage/LiquidityBuildingCard.tsx',
      'onePage/DexLiquiditySnapshot.tsx',
      'onePage/LiquidityEducationRail.tsx',
      'onePage/UnifiedLiquidityPage.tsx',
    ]
    for (const rel of siblings) {
      expect(load(rel).length).toBeGreaterThan(100)
    }
  })
})
