/**
 * MELEGASWAP_V2_LIQUIDITY_STUDIO_PREMIUM_UX_CONSOLIDATION — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_LIQUIDITY_STUDIO_PREMIUM_UX_CONSOLIDATION', () => {
  const shell = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
  const tokens = load('views/LiquidityStudio/v3/liquidityV3Tokens.ts')
  const runtime = load('views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx')
  const addModal = load('views/LiquidityStudio/v3/LiquidityAddConfirmModal.tsx')
  const removeModal = load('views/LiquidityStudio/v3/LiquidityRemoveConfirmModal.tsx')
  const add = load('views/LiquidityStudio/modules/LiquidityAddModule.tsx')
  const positions = load('views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx')
  const posTokens = load('views/LiquidityStudio/modules/liquidityMyPositionsTokens.ts')
  it('compact one-page hero keeps all liquidity journeys above the fold', () => {
    expect(tokens).toContain("gold: '#F4C430'")
    expect(shell).toContain('data-liquidity-hero-geometry="one-page-compact"')
    expect(shell).toContain('liquidity-v3-hero-positions')
    expect(shell).toContain('liquidity-v3-hero-add')
    expect(shell).toContain('liquidity-v3-hero-ai')
    expect(shell).toContain('liquidity-v3-explore-pools')
    expect(shell).not.toContain('LiquidityHeroArtwork')
    expect(shell).not.toContain('LiquidityHeroTrustPanel')
  })

  it('single-page surfaces stay mounted and addressable without route remount flash', () => {
    expect(shell).toContain('data-liquidity-panels="mounted"')
    expect(shell).toContain('id="liquidity-positions"')
    expect(shell).toContain('id="liquidity-add"')
    expect(shell).toContain('id="liquidity-builder"')
    expect(shell).toContain('display: block')
    expect(shell).toContain('syncUrl: false')
  })

  it('snapshot: 5 equal cards + mobile horizontal scroll', () => {
    expect(tokens).toContain("total: 'Total Liquidity'")
    expect(tokens).toContain("chains: 'Chains'")
    expect(shell).toContain('liquidity-v3-snapshot')
    expect(shell).toContain('overflow-x: auto')
  })

  it('AI builder opens directly without a duplicated Start Builder card', () => {
    expect(shell).toContain('setAiMounted(true)')
    expect(shell).toContain("<ProgressiveSurface force={tab === 'building'}")
    expect(shell).toContain('<LiquidityBuildingCard forceExpanded studioOwnedUrl />')
    expect(shell).not.toContain('data-ai-layout="horizontal"')
    expect(shell).not.toContain('liquidity-v3-ai-steps')
    expect(shell).not.toContain('setTimeout(() => setAiMounted(true)')
  })

  it('Add Liquidity confirm uses MelegaModal V3 (not legacy pancake modal)', () => {
    expect(existsSync(path.join(WEB, 'views/LiquidityStudio/v3/LiquidityAddConfirmModal.tsx'))).toBe(true)
    expect(runtime).toContain('LiquidityAddConfirmModal')
    expect(runtime).toContain('addConfirmModal')
    expect(runtime).not.toContain('ConfirmAddLiquidityModal')
    expect(runtime).not.toContain('useModal(')
    expect(addModal).toContain('MelegaModal')
    expect(addModal).toContain('Confirm Deposit')
    expect(add).toContain('addConfirmModal')
  })

  it('Remove Liquidity confirm remains MelegaModal V3', () => {
    expect(removeModal).toContain('MelegaModal')
    expect(runtime).toContain('LiquidityRemoveConfirmModal')
  })

  it('My Liquidity exposes Manage / Add More / Remove', () => {
    expect(posTokens).toContain("addMore: 'Add More'")
    expect(positions).toContain('liquidity-my-positions-add-more')
    expect(positions).toContain('liquidity-my-positions-manage')
    expect(positions).toContain('liquidity-my-positions-remove')
  })

  it('Add Liquidity uses one horizontal card with an integrated preview rail', () => {
    expect(add).toContain('single-card-horizontal')
    expect(add).toContain('liquidity-add-horizontal-workspace')
    expect(add).toContain('data-liquidity-preview="integrated"')
    expect(add).not.toContain('50-50-workspace')
  })
})
