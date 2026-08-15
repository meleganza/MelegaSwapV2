import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const tradeRoot = path.resolve(__dirname, '..')
const terminalSource = fs.readFileSync(path.join(tradeRoot, 'TradeTerminalScreen.tsx'), 'utf8')
const heroSource = fs.readFileSync(path.join(tradeRoot, 'components/TradeSwapHero.tsx'), 'utf8')
const cockpitSource = fs.readFileSync(path.join(tradeRoot, 'TradeCockpit.tsx'), 'utf8')

describe('Founder Step 2 — approved Swap page contract', () => {
  it('uses the canonical hero size and four-card factual Featured feed', () => {
    expect(heroSource).toContain('height: 216px')
    expect(heroSource).toContain('<Title>Swap</Title>')
    expect(heroSource).toContain('<FeaturedProjectsRail />')
    expect(heroSource).toContain('data-canonical-hero-height="216"')
    expect(heroSource).toContain('padding: 4px 0;')
    expect(heroSource).toContain('max-height: 100%;')
  })

  it('lifts the Swap/Bridge state to the one-page terminal', () => {
    expect(terminalSource).toContain("React.useState<SmartSwapProductAction>('swap')")
    expect(terminalSource).toContain('productAction={productAction}')
    expect(cockpitSource).toContain('onProductActionChange: (action: SmartSwapProductAction) => void')
    expect(cockpitSource).toContain('bridgeLabel="MARCO Bridge"')
    expect(cockpitSource).toContain('showBridgeNewBadge')
    expect(cockpitSource).not.toContain("useState<SmartSwapProductAction>('swap')")
  })

  it('removes Available routes in Bridge and keeps recent swaps under the left market stack', () => {
    expect(terminalSource).toContain("productAction === 'bridge'")
    expect(terminalSource).toContain("data-bridge-recent-swaps={productAction === 'bridge'")
    expect(terminalSource).toContain("productAction === 'swap'")
    expect(terminalSource).toContain('<TradeRouterPanel />')
    expect(terminalSource).toContain('<RightWorkspace>')
    expect(terminalSource).toContain('<LeftWorkspace>')
    expect(terminalSource).not.toContain('BottomGrid')
    expect(terminalSource).toContain('align-items: start')
  })

  it('keeps only the five non-redundant analytics cards', () => {
    const centerSource = fs.readFileSync(path.join(tradeRoot, 'TradeCenterPanel.tsx'), 'utf8')
    const statsSource = fs.readFileSync(path.join(tradeRoot, 'components/TradePairStats.tsx'), 'utf8')
    expect(centerSource).toContain("['liquidity', 'volume', 'transactions', 'fdv', 'holders']")
    expect(centerSource).not.toContain("price: 'Price'")
    expect(statsSource).toContain('repeat(5, minmax(0, 1fr))')
  })
})
