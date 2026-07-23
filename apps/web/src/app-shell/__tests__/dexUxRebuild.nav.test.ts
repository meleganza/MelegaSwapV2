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
  it('primary header is Home · Liquidity · Farms · Pools · List · Passport', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual([
      'Home',
      'Liquidity',
      'Farms',
      'Pools',
      'List',
      'Passport',
    ])
    expect(GLOBAL_HEADER_NAV.some((i) => i.label === 'Trade')).toBe(false)
    expect(GLOBAL_HEADER_NAV.some((i) => i.label === 'Projects')).toBe(false)
    const list = GLOBAL_HEADER_NAV.find((i) => i.id === 'list')
    expect(list?.kind).toBe('link')
    if (list?.kind === 'link') {
      expect(list.href).toBe('/list')
      expect(list.badge).toBe('NEW')
    }
  })

  it('mobile bottom nav matches canonical destinations', () => {
    expect(shellBottomNavItems.map((i) => i.label)).toEqual([
      'Home',
      'Liquidity',
      'Farms',
      'Pools',
      'Passport',
    ])
  })

  it('Liquidity Building deep links remain available', () => {
    expect(LIQUIDITY_DROPDOWN_ITEMS.find((i) => i.id === 'liquidity-building')?.href).toBe(
      '/liquidity-studio?view=building',
    )
  })

  it('Home uses DexHomeScreen and Instant Swap reuses HomeSwapPanel', () => {
    const home = readFileSync(path.join(ROOT, 'views/HomeTrade/HomeTradeScreen.tsx'), 'utf8')
    const dex = readFileSync(path.join(ROOT, 'views/HomeTrade/DexHomeScreen.tsx'), 'utf8')
    expect(home).toMatch(/DexHomeScreen/)
    expect(dex).toMatch(/HomeSwapPanel/)
    expect(dex).toMatch(/Instant Swap/)
    expect(dex).not.toMatch(/\$24\.58M|128\.45%|2,891/)
  })

  it('redirects consolidate trade and projects into Home', () => {
    const cfg = readFileSync(path.join(ROOT, '../next.config.mjs'), 'utf8')
    expect(cfg).toMatch(/source:\s*'\/trade'/)
    expect(cfg).toMatch(/destination:\s*'\/\?focus=swap'/)
    expect(cfg).toMatch(/source:\s*'\/projects'/)
    expect(cfg).toMatch(/destination:\s*'\/\?focus=projects'/)
  })

  it('List and Passport routes exist', () => {
    expect(readFileSync(path.join(ROOT, 'pages/list/index.tsx'), 'utf8')).toMatch(/ListStudioScreen/)
    expect(readFileSync(path.join(ROOT, 'pages/passport/index.tsx'), 'utf8')).toMatch(/PassportScreen/)
    expect(readFileSync(path.join(ROOT, 'views/ListStudio/ListStudioScreen.tsx'), 'utf8')).toMatch(
      /ListPageHero/,
    )
    expect(readFileSync(path.join(ROOT, 'views/Passport/PassportScreen.tsx'), 'utf8')).toMatch(
      /MARCO Passport/,
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
    const farms = readFileSync(
      path.join(ROOT, 'views/FarmsStudio/components/FarmsStudioPageHeader.tsx'),
      'utf8',
    )
    const pools = readFileSync(
      path.join(ROOT, 'views/PoolsStudio/components/PoolsStudioPageHeader.tsx'),
      'utf8',
    )
    expect(farms).not.toMatch(/Open Project Page/)
    expect(pools).not.toMatch(/Open Project Page/)
    expect(farms).toMatch(/Earn rewards from active Melega DEX farms/)
    expect(pools).toMatch(/Explore pools, manage positions/)
  })
})
