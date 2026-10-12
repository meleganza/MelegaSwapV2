/**
 * Melega DEX Complete UX Rebuild — navigation IA contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { GLOBAL_HEADER_NAV, LIQUIDITY_DROPDOWN_ITEMS } from '../config/globalHeaderNav'
import { shellBottomNavItems } from '../config/navigation'

const ROOT = path.resolve(__dirname, '../..')

describe('DEX UX Rebuild navigation', () => {
  it('primary header is Trade, Earn, Portfolio, and Explore', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual(['Trade', 'Earn', 'Portfolio', 'Explore'])
    const trade = GLOBAL_HEADER_NAV.find((i) => i.id === 'trade')
    expect(trade?.kind).toBe('link')
    if (trade?.kind === 'link') expect(trade.href).toBe('/swap')
    const explore = GLOBAL_HEADER_NAV.find((i) => i.id === 'explore')
    expect(explore?.kind).toBe('link')
    if (explore?.kind === 'link') expect(explore.href).toBe('/projects')
  })

  it('mobile bottom nav exposes the four public destinations', () => {
    expect(shellBottomNavItems.map((i) => i.label)).toEqual(['Trade', 'Earn', 'Portfolio', 'Explore'])
    expect(shellBottomNavItems.find((i) => i.id === 'trade')?.href).toBe('/swap')
    expect(shellBottomNavItems.find((i) => i.id === 'earn')?.menu?.map((item) => item.href)).toEqual([
      '/farms',
      '/pools',
      '/liquidity',
    ])
  })

  it('Trade is Swap-only for the home route, and Explore owns project pages', () => {
    const trade = GLOBAL_HEADER_NAV.find((i) => i.id === 'trade')
    const explore = GLOBAL_HEADER_NAV.find((i) => i.id === 'explore')
    expect(trade?.kind).toBe('link')
    expect(explore?.kind).toBe('link')
    if (trade?.kind !== 'link' || explore?.kind !== 'link') return
    expect(trade.match('/')).toBe(false)
    expect(trade.match('/swap')).toBe(true)
    expect(trade.match('/project-hq/marco')).toBe(false)
    expect(trade.match('/@marco')).toBe(false)
    expect(explore.match('/projects')).toBe(true)
    expect(explore.match('/@marco')).toBe(true)
    expect(explore.match('/project-hq/marco')).toBe(true)
    expect(explore.match('/swap')).toBe(false)

    const bottomTrade = shellBottomNavItems.find((i) => i.id === 'trade')
    expect(bottomTrade?.match('/swap')).toBe(true)
    expect(bottomTrade?.match('/')).toBe(false)
    expect(bottomTrade?.match('/@marco/')).toBe(false)
  })

  it('Liquidity Building deep links remain available', () => {
    expect(LIQUIDITY_DROPDOWN_ITEMS.find((i) => i.id === 'liquidity-building')?.href).toBe(
      '/liquidity-studio?view=building',
    )
  })

  it('Home route uses the swap-first screen and HomeSwapPanel', () => {
    const page = readFileSync(path.join(ROOT, 'pages/index.tsx'), 'utf8')
    const home = readFileSync(path.join(ROOT, 'views/HomeTrade/RadicalHomeScreen.tsx'), 'utf8')
    expect(page).toMatch(/RadicalHomeScreen/)
    expect(home).toMatch(/HomeSwapPanel/)
    expect(home).toMatch(/dex-home-instant-swap/)
    expect(home).not.toMatch(/home-investor-journey|JourneyGuideRail|PageNextAction|Founder Path/)
    expect(home).not.toMatch(/\$24\.58M|128\.45%|2,891/)
  })

  it('redirects /trade to /swap; trending into Projects discovery', () => {
    const cfg = readFileSync(path.join(ROOT, '../next.config.mjs'), 'utf8')
    expect(cfg).toMatch(/source:\s*'\/trade'/)
    expect(cfg).toMatch(/destination:\s*'\/swap'/)
    expect(cfg).not.toMatch(/destination:\s*'\/\?focus=swap'/)
    expect(cfg).toMatch(/source:\s*'\/trending'/)
    expect(cfg).toMatch(/destination:\s*'\/projects\?sort=trending'/)
    expect(cfg).not.toMatch(/destination:\s*'\/\?focus=projects'/)
  })

  it('List and Passport routes exist', () => {
    expect(readFileSync(path.join(ROOT, 'pages/list/index.tsx'), 'utf8')).toMatch(/ListStudioScreen/)
    expect(readFileSync(path.join(ROOT, 'pages/passport/index.tsx'), 'utf8')).toMatch(/\/portfolio|PassportRedirect/)
    expect(readFileSync(path.join(ROOT, 'views/ListStudio/ListStudioScreen.tsx'), 'utf8')).toMatch(/ListPageHero/)
    expect(readFileSync(path.join(ROOT, 'pages/portfolio/index.tsx'), 'utf8')).toMatch(
      /PortfolioStudio|PassportV1Shell|Portfolio/,
    )
  })

  it('Liquidity Studio uses one-page surface without a page-level TrendingRibbon', () => {
    const screen = readFileSync(path.join(ROOT, 'views/LiquidityStudio/LiquidityStudioScreen.tsx'), 'utf8')
    const shell = readFileSync(path.join(ROOT, 'app-shell/MelegaAppShell.tsx'), 'utf8')
    expect(screen).toMatch(/UnifiedLiquidityPage/)
    expect(screen).not.toMatch(/TrendingRibbon/)
    expect(shell).toMatch(/GlobalTrendingBar/)
  })

  it('Farms and Pools drop Open Project Page chrome clutter', () => {
    const farms = readFileSync(path.join(ROOT, 'views/FarmsStudio/components/FarmsStudioPageHeader.tsx'), 'utf8')
    const pools = readFileSync(path.join(ROOT, 'views/PoolsStudio/components/PoolsStudioPageHeader.tsx'), 'utf8')
    expect(farms).not.toMatch(/Open Project Page/)
    expect(pools).not.toMatch(/Open Project Page/)
    expect(farms).toMatch(/Earn rewards from active Melega DEX farms/)
    expect(pools).toMatch(/Explore pools, manage positions/)
  })
})
