import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const SRC = path.resolve(__dirname, '../..')

const load = (relativePath: string) => readFileSync(path.join(SRC, relativePath), 'utf8')

describe('Home-referenced page padding uniformity', () => {
  it('keeps Swap and Projects on the Home desktop/mobile rhythm', () => {
    const swap = load('views/Trade/TradeTerminalScreen.tsx')
    const projects = load('views/ProjectsStudio/ProjectsStudioScreen.tsx')

    for (const source of [swap, projects]) {
      expect(source).toContain('gap: 20px;')
      expect(source).toContain('gap: 14px;')
    }
    expect(swap).toContain('padding: 16px 0 ${tradeLayout.mobileBottomPad};')
    expect(projects).toContain('padding: 12px 0 ${projectsStudioLayout.mobileBottomPad};')
  })

  it('uses a local 1380px shell and 32px desktop inset for Farms and Pools', () => {
    const farms = load('views/FarmsStudio/FarmsStudioScreen.tsx')
    const pools = load('views/PoolsStudio/PoolsStudioScreen.tsx')

    for (const source of [farms, pools]) {
      expect(source).toContain('max-width: 1380px;')
      expect(source).toMatch(/padding: 0 32px \$\{[^}]+contentPaddingBottom\};/)
      expect(source).toMatch(/padding: 0 0 \$\{[^}]+mobileBottomPad\};/)
    }
    expect(farms).toContain('gap: 20px;')
    expect(pools).toContain('gap: 20px;')
  })

  it('scopes Home geometry to Liquidity and the canonical Project Page', () => {
    const liquidity = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
    const project = load('views/ProjectPage/v7/ProjectPageV7Shell.tsx')

    expect(liquidity).toContain('max-width: 1380px;')
    expect(liquidity).toContain('padding: ${liqV3.pagePadY} 32px 48px;')
    expect(liquidity).toContain('gap: 20px;')

    expect(project).toContain('const CanonicalPage = styled(Page)')
    expect(project).toContain('max-width: 1380px;')
    expect(project).toContain('padding-left: 32px;')
    expect(project).toContain('padding-right: 32px;')
    expect(project).toContain('margin-bottom: 20px;')
  })
})
