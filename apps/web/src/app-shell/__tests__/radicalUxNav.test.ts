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
  it('public header is exactly Trade, Earn, Portfolio, Explore', () => {
    expect(GLOBAL_HEADER_NAV.map((item) => item.label)).toEqual(['Trade', 'Earn', 'Portfolio', 'Explore'])
    expect(GLOBAL_HEADER_NAV).toHaveLength(4)
    const trade = GLOBAL_HEADER_NAV.find((item) => item.id === 'trade')
    const earn = GLOBAL_HEADER_NAV.find((item) => item.id === 'earn')
    expect(trade?.kind).toBe('link')
    expect(earn?.kind).toBe('link')
    if (trade?.kind === 'link') {
      expect(trade.href).toBe('/swap')
      expect(trade.items?.map((item) => item.label)).toEqual(['Swap', 'Bridge MARCO'])
      expect(trade.items?.find((item) => item.id === 'bridge-marco')?.href).toBe('/bridge')
      expect(trade.match('/swap')).toBe(true)
      expect(trade.match('/bridge')).toBe(true)
      expect(trade.match('/')).toBe(false)
      expect(trade.match('/projects')).toBe(false)
    }
    if (earn?.kind === 'link') {
      expect(earn.href).toBe('/farms')
      expect(earn.items?.map((item) => [item.label, item.href])).toEqual([
        ['Farms', '/farms'],
        ['Pools', '/pools'],
        ['Liquidity Yield', '/liquidity'],
      ])
      expect(earn.match('/farms')).toBe(true)
      expect(earn.match('/pools')).toBe(true)
      expect(earn.match('/liquidity')).toBe(true)
      expect(earn.match('/liquidity-studio')).toBe(true)
      expect(earn.match('/swap')).toBe(false)
    }
    const portfolio = GLOBAL_HEADER_NAV.find((item) => item.id === 'portfolio')
    const explore = GLOBAL_HEADER_NAV.find((item) => item.id === 'explore')
    expect(portfolio?.kind === 'link' && portfolio.href).toBe('/portfolio')
    expect(explore?.kind === 'link' && explore.href).toBe('/projects')
    if (explore?.kind === 'link') {
      expect(explore.match('/projects')).toBe(true)
      expect(explore.match('/@marco')).toBe(true)
      expect(explore.match('/explore')).toBe(true)
      expect(explore.match('/swap')).toBe(false)
    }
  })

  it('mobile bottom navigation uses the same four labels and groups Earn', () => {
    expect(shellBottomNavItems.map((item) => item.label)).toEqual(['Trade', 'Earn', 'Portfolio', 'Explore'])
    expect(shellBottomNavItems.find((item) => item.id === 'trade')?.href).toBe('/swap')
    expect(shellBottomNavItems.find((item) => item.id === 'earn')?.menu?.map((item) => item.href)).toEqual([
      '/farms',
      '/pools',
      '/liquidity',
    ])
    expect(shellBottomNavItems.find((item) => item.id === 'explore')?.href).toBe('/projects')
  })

  it('Advanced Console keeps Create Pool unavailable and links existing tools', () => {
    const pool = ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'create-pool')
    expect(pool?.unavailable).toBe(true)
    expect(pool?.href).toBeUndefined()
    expect(pool?.reason).toMatch(/unavailable/i)
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'create-token')?.href).toBe('/list?intent=create-token')
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'create-farm')?.href).toBe('/farms?create=1')
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'trend-boost')?.href).toBe('/list#trend-boost')
    expect(ADVANCED_CONSOLE_ITEMS.find((item) => item.id === 'fees')?.href).toBe('/pricing-fees')
    const menu = readFileSync(path.join(WEB, 'app-shell/components/AdvancedConsoleMenu.tsx'), 'utf8')
    expect(menu).toContain('aria-label="Advanced Console"')
    expect(menu).toContain('aria-haspopup="menu"')
    expect(menu).toContain('data-disabled-reason')
    expect(menu).not.toContain('href="#"')
    expect(menu).not.toContain('href="/pools?create=1"')
  })

  it('homepage keeps Swap primary and does not start hidden farm, pool, or indexer producers', () => {
    const page = readFileSync(path.join(WEB, 'pages/index.tsx'), 'utf8')
    const home = readFileSync(path.join(WEB, 'views/HomeTrade/RadicalHomeScreen.tsx'), 'utf8')
    expect(page).toContain('RadicalHomeScreen')
    expect(page).not.toContain('HomeTradeScreen')
    expect(home).toContain('<HomeSwapPanel />')
    expect(home).toContain('data-testid="dex-home-instant-swap"')
    expect(home).toContain('href="/bridge"')
    expect(home).toContain('href="/liquidity"')
    expect(home).toContain('href="/list#trend-boost"')
    expect(home).toContain('href="/list"')
    expect(home).toContain('href="/projects"')
    expect(home).toContain('href="/liquidity-studio?view=remove"')
    expect(home).toContain('href="/farms?view=my"')
    expect(home).toContain('href="/pools?view=positions"')
    expect(home).not.toContain('HomeTradeDataProvider')
    expect(home).not.toContain('useHomeTradeData')
    expect(home).not.toContain('FeaturedProjectsRail')
    expect(home).not.toContain('useAmmPairRegistry')
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
