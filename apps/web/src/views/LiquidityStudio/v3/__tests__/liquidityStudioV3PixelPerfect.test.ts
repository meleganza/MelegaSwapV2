/**
 * MELEGASWAP_V2_LIQUIDITY_STUDIO_V3_PIXEL_PERFECT — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_LIQUIDITY_STUDIO_V3_PIXEL_PERFECT', () => {
  const page = load('pages/liquidity.tsx')
  const shell = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
  const tokens = load('views/LiquidityStudio/v3/liquidityV3Tokens.ts')
  const positions = load('views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx')
  const posTokens = load('views/LiquidityStudio/modules/liquidityMyPositionsTokens.ts')
  const add = load('views/LiquidityStudio/modules/LiquidityAddModule.tsx')
  const lbHook = load('views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts')

  it('page mounts V3 shell', () => {
    expect(page).toContain('LiquidityStudioV3Shell')
    expect(existsSync(path.join(WEB, 'views/LiquidityStudio/v3/index.ts'))).toBe(true)
  })

  it('route stability guards remain valid', () => {
    expect(add).toContain("Do NOT call setMode('Add Liquidity') on mount")
    expect(lbHook).toContain('Never force view=building from the dual-pane Liquidity Studio home')
    expect(lbHook).toContain("if (currentView !== 'building' && phase === 'intro') return")
  })

  it('tabs: My Liquidity | Add | AI Liquidity Builder', () => {
    expect(shell).toContain('liquidity-v3-tab-positions')
    expect(shell).toContain('liquidity-v3-tab-add')
    expect(shell).toContain('liquidity-v3-tab-ai')
    expect(tokens).toContain("tabPositions: 'My Liquidity'")
    expect(tokens).toContain("tabAi: 'AI Liquidity Builder · BETA'")
  })

  it('Farms/Pools-parity hero + snapshot truth source on single page', () => {
    expect(shell).toContain('liquidity-v3-hero')
    expect(shell).toContain('min-height: ${liqV3.heroMaxH}')
    expect(shell).toContain('LiquidityHeroArtwork')
    expect(shell).toContain('LiquidityHeroTrustPanel')
    expect(shell).toContain('liquidity-v3-tabs')
    expect(shell).toContain('liquidity-v3-snapshot')
    expect(shell).toContain('GLOBAL_DATA_TRUTH_PIPELINE')
    expect(shell).toContain('useLiquidityMarketSnapshot')
    expect(shell).toContain('truthDash')
    expect(shell).not.toContain('Source not configured')
    expect(tokens).toContain("positionsCta: 'My Liquidity'")
  })

  it('compact empty state + deposited value primary', () => {
    expect(positions).toContain('max-height: 120px')
    expect(posTokens).toContain("emptyConnected: 'No liquidity positions yet.'")
    expect(positions).toContain('liquidity-my-positions-empty-add')
    expect(positions).toContain('data-primary-metric="deposited-value"')
    expect(positions).toContain('data-secondary-metric="lp-amount"')
  })

  it('cross-chain execution gate uses MelegaModal dialog', () => {
    expect(positions).toContain('ChainSwitchConfirmDialog')
    expect(positions).toContain('Switch network to continue')
    expect(add).toContain('ChainSwitchConfirmDialog')
  })

  it('new pair state + advanced collapsed + preview workspace', () => {
    expect(add).toContain('liquidity-add-new-pair')
    expect(add).toContain('New liquidity pool')
    expect(add).toContain('Create Pool & Add Liquidity')
    expect(add).toContain('liquidity-add-advanced')
    expect(add).toContain('<summary>Advanced</summary>')
    expect(add).toContain('58-42-workspace')
    expect(add).toContain('liquidity-add-pool-state')
  })

  it('remove percentages + deposited primary', () => {
    const remove = load('views/LiquidityStudio/v3/LiquidityRemovePanel.tsx')
    expect(remove).toContain('liquidity-remove-percents')
    expect(remove).toContain('liquidity-remove-pct-${p}')
    expect(remove).toContain("PERCENTS = ['25', '50', '75', '100']")
    expect(remove).toContain('data-primary-metric="deposited-value"')
    expect(remove).toContain('data-secondary-metric="lp-amount"')
    expect(shell).toContain('LiquidityRemovePanel')
  })

  it('AI LB BNB-only badge + separate from Add', () => {
    expect(shell).toContain('liquidity-v3-ai-beta')
    expect(tokens).toContain("aiBeta: 'BETA · BNB only'")
    expect(shell).toContain('liquidity-v3-ai-entry')
    expect(shell).toContain('LiquidityBuildingCard')
  })

  it('no duplicate TVL calculation in V3 shell', () => {
    expect(shell).toContain('useLiquidityMarketSnapshot')
    expect(shell).not.toContain('estimateReserveTvlUsd')
    expect(shell).not.toContain('useProtocolDataSWR')
  })
})
