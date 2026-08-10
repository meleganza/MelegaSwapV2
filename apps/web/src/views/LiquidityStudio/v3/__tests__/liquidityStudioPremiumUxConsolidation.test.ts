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
  const trust = load('views/LiquidityStudio/modules/LiquidityHeroTrustPanel.tsx')

  it('Farms-parity hero geometry (440 / 480 / 360)', () => {
    expect(tokens).toContain("leftW: '440px'")
    expect(tokens).toContain("artworkW: '480px'")
    expect(tokens).toContain("trustW: '360px'")
    expect(tokens).toContain("heroMaxH: '220px'")
    expect(tokens).toContain("gold: '#F4C430'")
    expect(shell).toContain('LiquidityHeroArtwork')
    expect(shell).toContain('LiquidityHeroTrustPanel')
    expect(trust).toContain('min-height: 190px')
  })

  it('single-surface tabs stay mounted without route remount flash', () => {
    expect(shell).toContain('data-liquidity-panels="mounted"')
    expect(shell).toContain("display: ${({ $active }) => ($active ? 'block' : 'none')}")
    expect(shell).toContain("syncUrl: false")
  })

  it('snapshot: 5 equal cards + mobile horizontal scroll', () => {
    expect(tokens).toContain("total: 'Total Liquidity'")
    expect(tokens).toContain("chains: 'Chains'")
    expect(shell).toContain('liquidity-v3-snapshot')
    expect(shell).toContain('overflow-x: auto')
  })

  it('AI builder is horizontal product card with Start Builder', () => {
    expect(shell).toContain('data-ai-layout="horizontal"')
    expect(shell).toContain('liquidity-v3-ai-steps')
    expect(tokens).toContain("aiOpen: 'Start Builder'")
    expect(tokens).toContain("aiStep1: 'Setup'")
    expect(tokens).toContain("aiStep3: 'Activate'")
  })

  it('Add Liquidity confirm uses MelegaModal V3 (not legacy pancake modal)', () => {
    expect(existsSync(path.join(WEB, 'views/LiquidityStudio/v3/LiquidityAddConfirmModal.tsx'))).toBe(true)
    expect(runtime).toContain('LiquidityAddConfirmModal')
    expect(runtime).toContain('addConfirmModal')
    expect(runtime).not.toContain('ConfirmAddLiquidityModal')
    expect(runtime).not.toContain("useModal(")
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

  it('Add Liquidity keeps two-column workspace', () => {
    expect(add).toContain('50-50-workspace')
    expect(add).toContain('minmax(0, 1fr) minmax(0, 1fr)')
  })
})
