import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const viewsRoot = join(__dirname, '../../../..')

describe('SMART_SWAP_FINAL_DOM_AND_TRENDING_REPAIR', () => {
  const moduleSrc = readFileSync(join(__dirname, '../SmartSwapExecutionPreviewModule.tsx'), 'utf8')
  const homeCss = readFileSync(join(viewsRoot, 'HomeTrade/HomeTradeGlobalStyle.tsx'), 'utf8')
  const tradeCss = readFileSync(join(viewsRoot, 'Trade/TradeTerminalGlobalStyle.tsx'), 'utf8')
  const shellSrc = readFileSync(join(viewsRoot, 'HomeTrade/HomeSwapPanelShell.tsx'), 'utf8')
  const routeSrc = readFileSync(join(__dirname, '../SmartSwapVisualRoute.tsx'), 'utf8')
  const dropdownSrc = readFileSync(
    join(viewsRoot, 'Swap/components/AdvancedSwapDetailsDropdown.tsx'),
    'utf8',
  )
  const trendingSrc = readFileSync(join(viewsRoot, 'HomeTrade/useDexTrendingRankings.ts'), 'utf8')

  it('Instant/Smart modes keep Details label only (no Show details)', () => {
    expect(moduleSrc).toMatch(/>Details</)
    expect(moduleSrc).not.toMatch(/Show details/)
    expect(dropdownSrc).not.toMatch(/Show details/)
    expect(dropdownSrc).toMatch(/t\('Details'\)/)
  })

  it('Home CSS places transparency stack after Swap button (order 5)', () => {
    expect(homeCss).toMatch(/\[data-smart-transparency-stack\]/)
    expect(homeCss).toMatch(/order:\s*5/)
  })

  it('Home swap shell remains responsive', () => {
    expect(shellSrc).toMatch(/max-width:\s*560px|max-width:\s*100%|calc\(100vw/)
  })

  it('route card is centered, no scrollbar, logos aligned', () => {
    expect(routeSrc).toMatch(/justify-content:\s*center/)
    expect(routeSrc).toMatch(/overflow:\s*hidden/)
    expect(routeSrc).toMatch(/align-self:\s*center/)
    expect(routeSrc).toMatch(/data-smart-route-card/)
  })

  it('trending ranking uses Factory/Router swap pipeline', () => {
    expect(trendingSrc).toMatch(/TRENDING_DEX_FACTORY/)
    expect(trendingSrc).toMatch(/0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C|MELEGA_FACTORY_BSC/)
    expect(trendingSrc).toMatch(/MELEGA_ROUTER_BSC/)
    expect(trendingSrc).toMatch(/fetchIndexerSwapEvents/)
    expect(trendingSrc).toMatch(/fetchProtocolActivity/)
    expect(trendingSrc).not.toMatch(/Market activity unavailable/)
  })

  it('does not hide Smart Details accordion via blanket data-execution-details-accordion rule', () => {
    expect(tradeCss).not.toMatch(
      /\.trade-terminal-swap \[data-execution-details-accordion\]\s*\{[^}]*display:\s*none/,
    )
  })

  it('blue Fee transparency panel is not mounted in Smart intel stack', () => {
    expect(moduleSrc).not.toMatch(/SmartSwapFeeTransparencyPanel/)
    expect(moduleSrc).toMatch(/data-execution-model-note/)
  })
})
