import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const previewRoot = join(__dirname, '..')
const viewsRoot = join(__dirname, '../../../..')
const srcRoot = join(__dirname, '../../../../..')

describe('SMART_SWAP_FINAL_PIXEL_PERFECTION presentation', () => {
  it('TradeCockpit uses single header row without subtitle', () => {
    const src = readFileSync(join(viewsRoot, 'Trade/TradeCockpit.tsx'), 'utf8')
    expect(src).toMatch(/data-single-header-row/)
    expect(src).not.toMatch(/Trade instantly on Melega DEX/)
    expect(src).not.toMatch(/Optimized route/)
  })

  it('HomeSwapPanelShell has no large internal title', () => {
    const src = readFileSync(join(viewsRoot, 'HomeTrade/HomeSwapPanelShell.tsx'), 'utf8')
    expect(src).not.toMatch(/Trade instantly on Melega DEX/)
    expect(src).toMatch(/data-single-header-row/)
  })

  it('HomeSwapPanel puts Instant|Smart in the header row', () => {
    const src = readFileSync(join(viewsRoot, 'HomeTrade/HomeSwapPanel.tsx'), 'utf8')
    expect(src).toMatch(/headerLeading/)
    expect(src).toMatch(/TradeModeSelector/)
    expect(src).not.toMatch(/ModeWrap/)
  })

  it('visual route idle copy is soft, not Route unavailable', () => {
    const src = readFileSync(join(previewRoot, 'SmartSwapVisualRoute.tsx'), 'utf8')
    expect(src).toMatch(/Enter amount to preview route/)
    expect(src).not.toMatch(/Route unavailable/)
  })

  it('trade terminal CSS hides form Show details accordion', () => {
    const src = readFileSync(join(viewsRoot, 'Trade/TradeTerminalGlobalStyle.tsx'), 'utf8')
    expect(src).toMatch(/Hide form "Show details"/)
    expect(src).toMatch(/\.trade-terminal-swap \[data-execution-details-accordion\]/)
    expect(src).toMatch(/display: none !important/)
  })

  it('trending empty copy is Market activity unavailable', () => {
    const ribbon = readFileSync(join(viewsRoot, 'HomeTrade/TrendingRibbon.tsx'), 'utf8')
    const ticker = readFileSync(
      join(srcRoot, 'design-system/melega/components/Ticker/MelegaTicker.tsx'),
      'utf8',
    )
    expect(ribbon).toMatch(/Market activity unavailable/)
    expect(ribbon).not.toMatch(/Trending unavailable/)
    expect(ticker).toMatch(/Market activity unavailable/)
    expect(ticker).not.toMatch(/Trending unavailable/)
  })
})
