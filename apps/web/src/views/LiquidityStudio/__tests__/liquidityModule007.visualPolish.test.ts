/**
 * LIQUIDITY_MODULE_007 — visual polish guards (no geometry drift).
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIQUIDITY_MODULE_007 Visual Polish', () => {
  it('freezes geometry tokens from MODULE_002–006', () => {
    const tokens = load('onePage/onePageTokens.ts')
    expect(tokens).toContain("col: '672px'")
    expect(tokens).toContain("mainRowH: '860px'")
    expect(tokens).toContain("addH: '520px'")
    expect(tokens).toContain("snapH: '324px'")
    expect(tokens).toContain("overviewH: '180px'")
    expect(tokens).toContain("positionsHeadH: '64px'")
    expect(tokens).toContain("positionsTableHeadH: '52px'")
    expect(tokens).toContain("positionsRowH: '68px'")
    expect(tokens).toContain("lbHeaderExpanded: '210px'")
    expect(tokens).toContain("lbFooterH: '160px'")
    expect(tokens).toContain("contentMax: '1376px'")
  })

  it('adds polish style without layout/business logic', () => {
    const polish = load('onePage/LiquidityOnePagePolishStyle.tsx')
    expect(polish).toContain('0 16px 40px rgba(0, 0, 0, 0.35)')
    expect(polish).toContain('rgba(255, 255, 255, 0.03)')
    expect(polish).toContain('120ms')
    expect(polish).toContain('scrollbar')
    expect(polish).toContain('[data-liquidity-one-page]')
    /* Geometry locks stay in component tokens; polish may size scrollbar chrome only */
    const withoutScrollbar = polish.replace(/@media[\s\S]*scrollbar[\s\S]*\}\s*\}/, '')
    expect(withoutScrollbar).not.toContain('min-height')
    expect(withoutScrollbar).not.toContain('padding:')
    expect(withoutScrollbar).not.toContain('margin:')
    expect(withoutScrollbar).not.toContain('grid-template')
    expect(withoutScrollbar).not.toMatch(/\b(height|width|max-height|max-width|min-width):\s*\d/)
  })

  it('mounts polish style on unified page', () => {
    const page = load('onePage/UnifiedLiquidityPage.tsx')
    expect(page).toContain('LiquidityOnePagePolishStyle')
  })

  it('restrains gold saturation in tokens', () => {
    const tokens = load('onePage/onePageTokens.ts')
    expect(tokens).toContain("gold: '#C9A84A'")
    expect(tokens).toContain("cardShadow: '0 16px 40px rgba(0,0,0,0.35)'")
    expect(tokens).toContain("transitionMs: '120ms'")
  })
})
