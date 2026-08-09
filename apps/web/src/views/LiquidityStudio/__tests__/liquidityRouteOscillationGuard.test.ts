import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '..')

describe('Liquidity Studio route oscillation guard', () => {
  it('Add Liquidity module does not force view=add on mount', () => {
    const src = readFileSync(path.join(ROOT, 'modules/LiquidityAddModule.tsx'), 'utf8')
    expect(src).not.toMatch(/useEffect\(\(\)\s*=>\s*\{\s*setMode\('Add Liquidity'\)/)
    expect(src).toContain('Do NOT call setMode(\'Add Liquidity\') on mount')
  })

  it('Liquidity Building card does not force view=building on dual-pane home', () => {
    const src = readFileSync(path.join(ROOT, 'liquidityBuilding/useLiquidityBuildingCard.ts'), 'utf8')
    expect(src).toContain("currentView !== 'building'")
    expect(src).toContain('Never force view=building from Liquidity Studio home')
    expect(src).toContain("if (currentView !== 'building') return")
  })
})
