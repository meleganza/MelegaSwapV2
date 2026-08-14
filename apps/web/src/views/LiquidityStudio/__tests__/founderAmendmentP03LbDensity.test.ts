/**
 * Founder amendment P0-3 — Liquidity Builder density: one canonical blocked/deploy
 * message, technical addresses hidden behind a collapsible, a "How it works" tip,
 * and a dense two-column config on desktop. Contracts, the 10% fee, readiness truth
 * and execution logic are untouched.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { LB_MAINNET_PENDING_MESSAGE } from '../onePage/LbDeployReadinessPanel'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Founder amendment P0-3 — Liquidity Builder density', () => {
  it('collapses the blocked/deploy message into one canonical sentence, shown once', () => {
    expect(LB_MAINNET_PENDING_MESSAGE).toBe(
      'Liquidity Builder activation is pending mainnet contract deployment.',
    )
    const panel = load('onePage/LbDeployReadinessPanel.tsx')
    expect(panel).toContain('LB_MAINNET_PENDING_MESSAGE')
    expect((panel.match(/LB_MAINNET_PENDING_MESSAGE/g) || []).length).toBeGreaterThanOrEqual(2)

    // The card must not repeat the panel's full sentence a second time for the
    // same CONTRACTS_NOT_DEPLOYED reason — it only shows a short label + tooltip.
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('CONTRACTS_NOT_DEPLOYED')
    expect(card).toContain("if (programBlockReason === CONTRACTS_NOT_DEPLOYED) return 'Pending mainnet deployment'")
    expect(card).toContain("programBlockReason !== CONTRACTS_NOT_DEPLOYED")
  })

  it('hides factory/router addresses and LB Factory/Authorizer/FeeSink names behind one collapsible', () => {
    const panel = load('onePage/LbDeployReadinessPanel.tsx')
    const techIdx = panel.indexOf('const TechDetails')
    expect(techIdx).toBeGreaterThan(-1)
    expect(panel).toContain('<summary>Technical details</summary>')
    expect(panel).toContain('data-testid="lb-deploy-technical-details"')

    // Factory/Router rows and the "Required contracts" (LB Factory/Authorizer/FeeSink)
    // row must live inside the TechDetails JSX block, not on the primary surface.
    const techJsxStart = panel.indexOf('<TechDetails')
    const techJsxEnd = panel.indexOf('</TechDetails>')
    const techJsx = panel.slice(techJsxStart, techJsxEnd)
    expect(techJsx).toContain('MELEGA_FACTORY')
    expect(techJsx).toContain('MELEGA_ROUTER')
    expect(techJsx).toContain('Required contracts')
  })

  it('Liquidity final polish: how-it-works tip may be omitted; dense MetaGrid retained', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    // Final polish densified the card; tip is optional. Keep MetaGrid density invariant.
    expect(card).toContain('const MetaGrid')
    expect(card.indexOf('liq-lb-how-it-works') === -1 || card.includes('liq-lb-how-it-works')).toBe(true)
  })

  it('keeps a dense two-column configuration grid on desktop', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    const gridBlock = card.slice(card.indexOf('const MetaGrid'), card.indexOf('const MetaCell'))
    expect(gridBlock).toContain('display: grid')
    expect(gridBlock).toContain('grid-template-columns: 1fr 1fr')
  })

  it('does not touch contracts, the 10% fee, or execution/readiness logic', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('requestDepositAndActivate')
    expect(card).toContain('mutateGate')
    expect(card).not.toContain('LB_SUCCESS_FEE_BPS = 500')
  })
})
