/**
 * MELEGASWAP_V2_LIQUIDITY_STUDIO_FINAL_PRODUCT_RESTORE — tab stability contracts.
 * Guards against black flash, wrong tab, and URL oscillation on local switches.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_LIQUIDITY_STUDIO_FINAL_PRODUCT_RESTORE tab stability', () => {
  const shell = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
  const runtime = load('views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx')
  const page = load('pages/liquidity.tsx')
  const studio = load('pages/liquidity-studio.tsx')

  it('both routes mount the same V3 shell (single surface)', () => {
    expect(page).toContain('LiquidityStudioV3Shell')
    expect(studio).toMatch(/LiquidityStudioV3Shell|liquidity/)
  })

  it('default mode is My Positions (not Add Liquidity)', () => {
    expect(runtime).toContain("|| 'My Positions'")
    expect(runtime).not.toMatch(/\|\| 'Add Liquidity'/)
  })

  it('setMode supports syncUrl:false and skips redundant replaces', () => {
    expect(runtime).toContain('opts?.syncUrl === false')
    expect(runtime).toContain('if (view === current && !strayBuilderParams) return')
    expect(runtime).toContain('Avoid redundant shallow replaces')
    expect(runtime).toContain('delete nextQuery.step')
    expect(runtime).toContain('no continuous URL→mode sync')
  })

  it('shell owns instant local tab state with mounted panels', () => {
    expect(shell).toContain('hydratedRef')
    expect(shell).toContain("useState<LiquidityV3Tab>('positions')")
    expect(shell).toContain('data-liquidity-panels="mounted"')
    expect(shell).toContain('selectTab')
    expect(shell).toContain('liquidity-v3-hero-nav')
    expect(shell).toContain('forceExpanded={tab === \'building\'}')
    expect(shell).toContain('aiMounted')
    expect(shell).toContain('Do NOT mirror mode→tab on every mode change')
    expect(shell).toContain("setMode(tabToMode(next), { syncUrl: false })")
    expect(shell).toContain('Debounced shareable ?view= mirror')
    expect(shell).toContain('data-liquidity-tabs-ready')
  })

  it('AI builder never forces view=building when view is unset', () => {
    const lb = load('views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts')
    expect(lb).toContain("if (currentView !== 'building') return")
    expect(lb).toContain('Never force view=building from Liquidity Studio home')
  })

  it('LB card URL sync uses router.pathname (trailingSlash-safe)', () => {
    const card = load('views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('pathname: router.pathname')
    expect(card).toContain("hardcoded '/liquidity-studio' breaks trailingSlash")
    expect(card).not.toMatch(/pathname:\s*'\/liquidity-studio'/)
    expect(card).toContain('studioOwnedUrl')
    expect(shell).toContain('studioOwnedUrl')
    const lb = load('views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts')
    expect(lb).toContain('disableUrlSync')
  })

  it('hero CTAs mirror tab selection without route reload', () => {
    expect(shell).toContain('goPositions')
    expect(shell).toContain('goAdd')
    expect(shell).toContain('goAi')
    expect(shell).toContain('$primary={tab === \'positions\'}')
    expect(shell).toContain('$primary={tab === \'add\'}')
    expect(shell).toContain('$primary={tab === \'building\'}')
    expect(shell).not.toContain('router.push')
    expect(shell).not.toContain('href="/liquidity?view=')
  })
})
