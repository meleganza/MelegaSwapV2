import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../..')

describe('Smart Swap wallet controls layout', () => {
  it('uses one canonical in-field wallet row with token tools and MAX', () => {
    const panel = readFileSync(path.join(WEB, 'components/CurrencyInputPanel/index.tsx'), 'utf8')

    expect(panel).toContain('data-compact-wallet-controls')
    expect(panel).toContain('data-wallet-token-actions')
    expect(panel).toContain('data-wallet-max-button')
    expect(panel).toContain("{t('Max')}")
    expect(panel).toContain('<CopyButton')
    expect(panel).toContain('<AddToWalletButton')
    expect(panel).toContain('{!compactWalletControls ? (')
  })

  it('keeps balances inside both swap surfaces', () => {
    const tradeStyle = readFileSync(path.join(WEB, 'views/Trade/TradeTerminalGlobalStyle.tsx'), 'utf8')
    const homeStyle = readFileSync(path.join(WEB, 'views/HomeTrade/HomeTradeGlobalStyle.tsx'), 'utf8')

    expect(tradeStyle).toContain('bottom: 8px !important')
    expect(tradeStyle).not.toContain('top: -20px !important')
    expect(homeStyle).toContain('Canonical in-field wallet controls shared with /swap')
    expect(homeStyle).toContain('bottom: 5px !important')
    expect(tradeStyle).toContain('top: 31px !important')
  })

  it('keeps the market column independent when cockpit Details expands', () => {
    const screen = readFileSync(path.join(WEB, 'views/Trade/TradeTerminalScreen.tsx'), 'utf8')
    const center = readFileSync(path.join(WEB, 'views/Trade/TradeCenterPanel.tsx'), 'utf8')

    expect(screen).toContain('align-items: start')
    expect(screen).toContain('align-self: start')
    expect(screen).not.toContain('grid-area: cockpit;\n  ${stretchColumn}')
    expect(center).toContain('gap: ${tradeLayout.verticalRhythm}')
  })
})
