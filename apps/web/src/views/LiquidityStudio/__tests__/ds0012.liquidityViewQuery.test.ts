import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const RUNTIME = path.resolve(__dirname, '../liquidityRuntime/useLiquidityMintRuntime.tsx')
const SCREEN = path.resolve(__dirname, '../LiquidityStudioScreen.tsx')

describe('DS001.2 / DS001.3 Liquidity Studio view query wiring', () => {
  it('maps certified view query values to studio modes including building', () => {
    const src = readFileSync(RUNTIME, 'utf8')
    expect(src).toContain("building: 'Liquidity Building'")
    expect(src).toContain("add: 'Add Liquidity'")
    expect(src).toContain("positions: 'My Positions'")
    expect(src).toContain("remove: 'Remove Liquidity'")
    expect(src).toContain("simulation: 'Simulation'")
    expect(src).toContain('router.query.view')
  })

  it('renders the restored Liquidity Building product surface for view=building', () => {
    const src = readFileSync(SCREEN, 'utf8')
    const card = readFileSync(
      path.resolve(__dirname, '../onePage/LiquidityBuildingCard.tsx'),
      'utf8',
    )
    expect(src).toContain('UnifiedLiquidityPage')
    expect(card).toContain('LiquidityBuildingPanel')
    expect(src).not.toContain('ls-liquidity-building-discovery')
  })
})
