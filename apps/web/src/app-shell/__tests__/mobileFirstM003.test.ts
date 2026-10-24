/**
 * M003 mobile-first acceptance — phone layout contracts only.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../..')
const read = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('M003 mobile-first phone acceptance', () => {
  it('keeps the viewport safe-area aware and the bottom nav clear of the home keyboard', () => {
    const doc = read('pages/_document.tsx')
    expect(doc).toContain('viewport-fit=cover')
    expect(doc).toContain('interactive-widget=resizes-content')
    const shell = read('app-shell/MelegaAppShell.tsx')
    expect(shell).toContain('safe-area-inset-bottom')
    expect(shell).toContain('safe-area-inset-top')
    const home = read('views/HomeTrade/HomeTradeGlobalStyle.tsx')
    expect(home).toContain('scroll-margin-bottom: calc(96px + env(safe-area-inset-bottom, 0px))')
    expect(home).toContain("button[aria-label='Edit slippage tolerance']")
    expect(home).toContain('min-height: 44px')
  })

  it('gives Swap and MARCO Bridge a full row on a 320px phone', () => {
    const shell = read('views/HomeTrade/HomeSwapPanelShell.tsx')
    expect(shell).toContain('flex-direction: column')
    expect(shell).toContain('@media (max-width: 380px)')
    expect(shell).toContain('min-width: 44px')
    expect(shell).toContain('min-height: 44px')
    const tabs = read('views/SmartSwapStudio/SmartSwapProductActions.tsx')
    expect(tabs).toContain('aria-label="Trade actions"')
    expect(tabs).toContain('text-overflow: ellipsis')
    expect(tabs).toContain('min-height: 42px')
    const panel = read('views/HomeTrade/HomeSwapPanel.tsx')
    expect(panel).toContain('bridgeLabel="MARCO Bridge"')
  })

  it('keeps Advanced Console on-screen and the four phone destinations at least 44px', () => {
    const menu = read('app-shell/components/AdvancedConsoleMenu.tsx')
    expect(menu).toContain('position: fixed')
    expect(menu).toContain('left: 12px')
    expect(menu).toContain('aria-label="Tools"')
    const bottom = read('design-system/melega/components/BottomNavigation/MelegaBottomNavigation.tsx')
    expect(bottom).toContain('min-height: 48px')
    expect(bottom).toContain('min-width: 48px')
    expect(bottom).toContain('safe-area-inset-bottom')
    const brand = read('design-system/melega/components/BrandLockup/MelegaBrandLockup.tsx')
    expect(brand).toContain("size === 'mobile' ? 44 : 42")
    expect(brand).toContain('&:focus-visible')
  })
})