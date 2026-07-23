import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  FARMS_DROPDOWN_ITEMS,
  GLOBAL_HEADER_NAV,
  LIQUIDITY_DROPDOWN_ITEMS,
  MORE_DROPDOWN_ITEMS,
  POOLS_DROPDOWN_ITEMS,
} from '../config/globalHeaderNav'
import { ds001Layout } from 'design-system/melega/tokens/ds001'

const ROOT = path.resolve(__dirname, '../..')

describe('DS001.2 global header shell contracts', () => {
  it('exports 72px header height from DS001 layout and GlobalHeader source', () => {
    expect(ds001Layout.headerHeight).toBe('72px')
    const header = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )
    expect(header).toContain('export const MELEGA_APP_HEADER_HEIGHT = ds001Layout.headerHeight')
  })

  it('shell mounts MelegaGlobalHeader and removes desktop sidebar mount', () => {
    const shell = readFileSync(path.join(ROOT, 'app-shell/MelegaAppShell.tsx'), 'utf8')
    expect(shell).toContain('MelegaGlobalHeader')
    expect(shell).toContain('GlobalTrendingBar')
    expect(shell).toContain('data-melega-shell-no-sidebar')
    expect(shell).not.toMatch(/<MelegaSidebar[\s/>]/)
    expect(shell).toContain('MELEGA_APP_HEADER_HEIGHT')
    expect(shell).toContain('ds001Layout.contentMaxWidth')
  })

  it('Liquidity deep-link destinations including Liquidity Building remain available', () => {
    expect(LIQUIDITY_DROPDOWN_ITEMS).toHaveLength(6)
    const labels = LIQUIDITY_DROPDOWN_ITEMS.map((i) => i.label)
    expect(labels).toEqual([
      'Liquidity Studio',
      'Add Liquidity',
      'Liquidity Building',
      'My Positions',
      'Remove Liquidity',
      'Simulation',
    ])
    const building = LIQUIDITY_DROPDOWN_ITEMS.find((i) => i.id === 'liquidity-building')
    expect(building?.href).toBe('/liquidity-studio?view=building')
    expect(building?.badge).toBe('NEW')
  })

  it('Farms and Pools deep-link destinations remain live', () => {
    expect(FARMS_DROPDOWN_ITEMS.map((i) => i.href)).toEqual(['/farms', '/farms?view=my', '/farms?view=explore'])
    expect(POOLS_DROPDOWN_ITEMS.map((i) => i.href)).toEqual([
      '/pools',
      '/pools?view=positions',
      '/pools?view=explore',
    ])
    expect(POOLS_DROPDOWN_ITEMS.some((i) => /My Pools/i.test(i.label))).toBe(false)
  })

  it('primary navigation is the Complete UX Rebuild IA (no top-level Trade/Projects)', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual([
      'Home',
      'Liquidity',
      'Farms',
      'Pools',
      'List',
      'Passport',
    ])
  })

  it('secondary surfaces remain available via More overflow destinations', () => {
    expect(MORE_DROPDOWN_ITEMS.map((i) => i.label)).toEqual([
      'Trending',
      'DEX Intelligence',
      'Identity Hub',
      'Identity Console',
      'Build Studio',
    ])
  })

  it('GlobalSearch placeholder matches approved mockup', () => {
    const search = readFileSync(path.join(ROOT, 'app-shell/components/GlobalSearch.tsx'), 'utf8')
    expect(search).toMatch(/Search tokens, projects, pools\.\.\./)
  })

  it('header height remains sticky 72px contract', () => {
    expect(ds001Layout.headerHeight).toBe('72px')
  })
})
