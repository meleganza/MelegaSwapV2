import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const previewRoot = join(__dirname, '..')
const viewsRoot = join(__dirname, '../../../..')

describe('SMART_SWAP_FINAL_PIXEL_PERFECTION presentation', () => {
  it('TradeCockpit is a single Smart Swap experience without Instant mode', () => {
    const src = readFileSync(join(viewsRoot, 'Trade/TradeCockpit.tsx'), 'utf8')
    expect(src).toContain('SmartSwapForm')
    expect(src).toContain('best route across Melega liquidity')
    expect(src).not.toContain('TradeModeSelector')
    expect(src).not.toContain('multichain')
    expect(src).not.toMatch(/Trade instantly on Melega DEX/)
  })

  it('HomeSwapPanelShell has no large internal title', () => {
    const src = readFileSync(join(viewsRoot, 'HomeTrade/HomeSwapPanelShell.tsx'), 'utf8')
    expect(src).not.toMatch(/Trade instantly on Melega DEX/)
    expect(src).toMatch(/data-single-header-row/)
  })

  it('HomeSwapPanel is single Smart Swap without Instant|Smart tabs', () => {
    const src = readFileSync(join(viewsRoot, 'HomeTrade/HomeSwapPanel.tsx'), 'utf8')
    expect(src).toMatch(/headerLeading/)
    expect(src).not.toMatch(/TradeModeSelector/)
    expect(src).toMatch(/mode="smart"/)
    expect(src).toMatch(/CANONICAL_SWAP_EXPERIENCE/)
    expect(src).not.toMatch(/ModeWrap/)
  })

  it('visual route idle copy is soft, not Route unavailable', () => {
    const src = readFileSync(join(previewRoot, 'SmartSwapVisualRoute.tsx'), 'utf8')
    expect(src).toMatch(/Enter amount to preview route/)
    expect(src).not.toMatch(/Route unavailable/)
  })

  it('trade terminal CSS keeps swap terminal presentation rules', () => {
    const src = readFileSync(join(viewsRoot, 'Trade/TradeTerminalGlobalStyle.tsx'), 'utf8')
    expect(src.length).toBeGreaterThan(100)
    expect(src).toMatch(/trade-terminal|TradeTerminal/i)
  })
})
