/**
 * M003 phase 1 — four public destinations, Advanced Console, and deep-link aliases.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { GLOBAL_HEADER_NAV } from '../config/globalHeaderNav'
import { shellBottomNavItems, shellNavigation } from '../config/navigation'
import { ADVANCED_CONSOLE_ITEMS } from '../config/advancedConsole'

const WEB = path.resolve(__dirname, '../..')

describe('M003 radical navigation', () => {
  it('immediate actions are Swap, MARCO Bridge, and Earn', () => {
    expect(GLOBAL_HEADER_NAV.map((item) => item.label)).toEqual(['Swap', 'MARCO Bridge', 'Earn'])
    expect(GLOBAL_HEADER_NAV).toHaveLength(3)
    const swap = GLOBAL_HEADER_NAV.find((item) => item.id === 'swap')
    const bridge = GLOBAL_HEADER_NAV.find((item) => item.id === 'bridge')
    const earn = GLOBAL_HEADER_NAV.find((item) => item.id === 'earn')
    expect(swap?.kind).toBe('link')
    expect(bridge?.kind).toBe('link')
    expect(earn?.kind).toBe('link')
    if (swap?.kind === 'link') {
      expect(swap.href).toBe('/')
      expect(swap.match('/')).toBe(true)
      expect(swap.match('/swap')).toBe(true)
      expect(swap.match('/projects')).toBe(false)
    }
    if (bridge?.kind === 'link') expect(bridge.href).toBe('/bridge')
    if (earn?.kind === 'link') {
      expect(earn.href).toBe('/earn')
      expect(earn.match('/farms')).toBe(true)
      expect(earn.match('/pools')).toBe(true)
      expect(earn.match('/liquidity')).toBe(true)
    }
    expect(GLOBAL_HEADER_NAV.some((item) => item.label === 'Portfolio')).toBe(false)
    expect(GLOBAL_HEADER_NAV.some((item) => item.label === 'Explore')).toBe(false)
  })

  it('mobile bottom navigation is Swap, Bridge, and Earn in one tap', () => {
    expect(shellBottomNavItems.map((item) => item.label)).toEqual(['Swap', 'Bridge', 'Earn'])
    expect(shellBottomNavItems.find((item) => item.id === 'swap')?.href).toBe('/')
    expect(shellBottomNavItems.find((item) => item.id === 'bridge')?.href).toBe('/bridge')
    expect(shellBottomNavItems.find((item) => item.id === 'earn')?.href).toBe('/earn')
    expect(shellBottomNavItems.every((item) => !item.menu?.length)).toBe(true)
  })

  it('Tools keeps Boost and positions, and does not offer Create Farm or Create Pool', () => {
    expect(ADVANCED_CONSOLE_ITEMS.some((item) => item.id === 'create-pool' || item.id === 'create-farm')).toBe(false)
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'trend-boost')?.href).toBe('/list#trend-boost')
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'melega-space')?.href).toBe('/projects')
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'portfolio')?.href).toBe('/portfolio')
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'withdraw-farms')?.href).toBe('/farms?view=my')
    const menu = readFileSync(path.join(WEB, 'app-shell/components/AdvancedConsoleMenu.tsx'), 'utf8')
    expect(menu).toContain('aria-label="Tools"')
    expect(menu).toContain('aria-haspopup="menu"')
    expect(menu).not.toContain('Create Farm')
    expect(menu).not.toContain('Create Pool')
    expect(menu).not.toContain('href="#"')
  })

  it('homepage is only the swap panel and does not start hidden farm, pool, or indexer producers', () => {
    const page = readFileSync(path.join(WEB, 'pages/index.tsx'), 'utf8')
    const home = readFileSync(path.join(WEB, 'views/HomeTrade/RadicalHomeScreen.tsx'), 'utf8')
    const earn = readFileSync(path.join(WEB, 'views/Earn/SimpleEarn.tsx'), 'utf8')
    expect(page).toContain('RadicalHomeScreen')
    expect(page).not.toContain('HomeTradeScreen')
    expect(home).toContain('<HomeSwapPanel />')
    expect(home).toContain('data-testid="dex-home-instant-swap"')
    expect(home).not.toContain('href="/bridge"')
    expect(home).not.toContain('href="/list#trend-boost"')
    expect(home).not.toContain('FeaturedProjectsRail')
    expect(home).not.toContain('Top Farms')
    expect(earn).toContain('href="/liquidity"')
    expect(earn).toContain('href="/pools"')
    expect(earn).toContain('href="/farms"')
    expect(earn).toContain('href="/liquidity-studio?view=remove"')
    expect(earn).toContain('href="/farms?view=my"')
    expect(earn).toContain('href="/pools?view=positions"')
    expect(earn).toContain('External opportunities are not available yet')
    expect(home).not.toContain('HomeTradeDataProvider')
    expect(home).not.toContain('useHomeTradeData')
    expect(home).not.toContain('FeaturedProjectsRail')
    expect(home).not.toContain('useAmmPairRegistry')
    const preview = readFileSync(
      path.join(WEB, 'views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx'),
      'utf8',
    )
    expect(preview).toContain('{!compact || !idle ? <SmartSwapCompactMetrics items={metrics} /> : null}')
    const document = readFileSync(path.join(WEB, 'pages/_document.tsx'), 'utf8')
    expect(document).toContain('/fonts/inter/inter-v12-latin-regular.woff2')
    expect(document).not.toContain('rel="preload"\n            href="/fonts/relative/relative-book-pro.woff2"')
    const footer = readFileSync(path.join(WEB, 'views/HomeTrade/MelegaDexFooter.tsx'), 'utf8')
    expect(footer).toContain('isQuietPrimaryRoute')
    expect(home).not.toContain('useFarms')
    expect(home).not.toContain('usePools')
  })

  it('preserves legacy URLs with redirects or live pages', () => {
    const cfg = readFileSync(path.join(WEB, '../next.config.mjs'), 'utf8')
    expect(cfg).toMatch(/source:\s*'\/explore'/)
    expect(cfg).toMatch(/destination:\s*'\/projects'/)
    expect(cfg).toMatch(/source:\s*'\/trade'/)
    expect(cfg).toMatch(/destination:\s*'\/swap'/)
    expect(cfg).toMatch(/source:\s*'\/launch'/)
    expect(cfg).toMatch(/destination:\s*'\/list'/)
    const pages = [
      'pages/swap/index.tsx',
      'pages/bridge/index.tsx',
      'pages/liquidity.tsx',
      'pages/liquidity-studio.tsx',
      'pages/farms/index.tsx',
      'pages/pools/index.tsx',
      'pages/portfolio/index.tsx',
      'pages/projects/index.tsx',
      'pages/list/index.tsx',
      'pages/explore/index.tsx',
      'pages/remove/[[...currency]].tsx',
      'pages/earn/index.tsx',
      'pages/pricing-fees/index.tsx',
    ]
    for (const rel of pages) {
      expect(readFileSync(path.join(WEB, rel), 'utf8').length).toBeGreaterThan(0)
    }
    const explore = readFileSync(path.join(WEB, 'pages/explore/index.tsx'), 'utf8')
    expect(explore).toContain("'/projects'")
  })

  it('names header and bottom controls for assistive tech', () => {
    const header = readFileSync(
      path.join(WEB, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )
    const bottom = readFileSync(
      path.join(WEB, 'design-system/melega/components/BottomNavigation/MelegaBottomNavigation.tsx'),
      'utf8',
    )
    expect(header).toContain('aria-label="Primary navigation"')
    expect(header).toContain('aria-label={`Open ${item.label} menu`}')
    expect(header).toContain('aria-haspopup="menu"')
    expect(bottom).toContain('aria-label="Main navigation"')
    expect(bottom).toContain('aria-haspopup="menu"')
    expect(bottom).toContain('role="menuitem"')
    const labels = shellNavigation.flatMap((section) => section.items.filter((item) => !item.hidden).map((item) => item.label))
    expect(labels).toEqual(
      expect.arrayContaining(['Swap', 'Bridge MARCO', 'Farms', 'Pools', 'Liquidity Yield', 'Portfolio', 'Explore']),
    )
  })
})
