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
    expect(shell).toContain('data-melega-shell-no-sidebar')
    expect(shell).not.toMatch(/<MelegaSidebar[\s/>]/)
    expect(shell).toContain('MELEGA_APP_HEADER_HEIGHT')
    expect(shell).toContain('ds001Layout.contentMaxWidth')
  })

  it('Liquidity dropdown contains all six required destinations including Liquidity Building', () => {
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

  it('Farms and Pools dropdowns contain only live destinations', () => {
    expect(FARMS_DROPDOWN_ITEMS.map((i) => i.href)).toEqual(['/farms', '/farms?view=my', '/farms?view=explore'])
    expect(POOLS_DROPDOWN_ITEMS.map((i) => i.href)).toEqual([
      '/pools',
      '/pools?view=positions',
      '/pools?view=explore',
    ])
    expect(POOLS_DROPDOWN_ITEMS.some((i) => /My Pools/i.test(i.label))).toBe(false)
  })

  it('primary navigation includes Trade through More with Analytics label', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual([
      'Trade',
      'Liquidity',
      'Farms',
      'Pools',
      'Projects',
      'Analytics',
      'More',
    ])
    const analytics = GLOBAL_HEADER_NAV.find((i) => i.id === 'analytics')
    expect(analytics?.kind).toBe('link')
    if (analytics?.kind === 'link') expect(analytics.href).toBe('/radar')
  })

  it('More menu includes secondary surfaces', () => {
    expect(MORE_DROPDOWN_ITEMS.map((i) => i.label)).toEqual([
      'Trending',
      'DEX Intelligence',
      'Identity Hub',
      'Identity Console',
      'Build Studio',
      'Command Center',
    ])
  })

  it('GlobalHeader implements keyboard-accessible menu semantics', () => {
    const header = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )
    const dropdown = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/HeaderNavDropdown.tsx'),
      'utf8',
    )
    expect(header).toContain('aria-haspopup="menu"')
    expect(header).toContain('aria-expanded')
    expect(header).toContain('aria-label="Primary navigation"')
    expect(dropdown).toContain('role="menu"')
    expect(dropdown).toContain("Escape")
    expect(dropdown).toContain('ArrowDown')
  })

  it('sidebar component stays permanently hidden', () => {
    const sidebar = readFileSync(
      path.join(ROOT, 'design-system/melega/components/Sidebar/MelegaSidebar.tsx'),
      'utf8',
    )
    expect(sidebar).toContain('display: none !important')
  })
})
