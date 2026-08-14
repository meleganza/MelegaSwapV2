/**
 * UX rebuild — Home mobile section order (presentation markers only).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { HOME_MOBILE_SECTION_ORDER } from '../homeMobileSections'

const ROOT = path.join(__dirname, '../')

function loadHomeComposition(): string {
  return [
    'DexHomeScreen.tsx',
    'FeaturedProjectsRail.tsx',
    'ExploreMelegaEcosystem.tsx',
    'MelegaDexFooter.tsx',
  ]
    .map((f) => readFileSync(path.join(ROOT, f), 'utf8'))
    .join('\n')
}

describe('UX rebuild home mobile section order', () => {
  it('exports canonical mobile section sequence', () => {
    expect(HOME_MOBILE_SECTION_ORDER).toEqual([
      'hero',
      'swap',
      'featured-projects',
      'kpi',
      'discovery',
      'ecosystem',
      'footer',
    ])
  })

  it('DexHomeScreen mounts sections in mobile order via data-home-section markers', () => {
    const screen = loadHomeComposition()
    const markerPositions = HOME_MOBILE_SECTION_ORDER.map((id) => {
      const needle = `data-home-section="${id}"`
      const index = screen.indexOf(needle)
      expect(index, `missing ${needle}`).toBeGreaterThan(-1)
      return index
    })

    // Within DexHomeScreen host, Featured mounts before KPI.
    const host = readFileSync(path.join(ROOT, 'DexHomeScreen.tsx'), 'utf8')
    expect(host.indexOf('<FeaturedProjectsRail')).toBeLessThan(host.indexOf('dex-home-kpi-rail'))
    expect(host.indexOf('dex-home-kpi-rail')).toBeLessThan(host.indexOf('dex-home-discovery'))
    expect(host.indexOf('<ExploreMelegaEcosystem')).toBeGreaterThan(host.indexOf('dex-home-discovery'))
    // Global footer moved to MelegaAppShell — still present via MelegaDexFooter composition marker.
    const footer = readFileSync(path.join(ROOT, 'MelegaDexFooter.tsx'), 'utf8')
    expect(footer).toContain('data-home-section="footer"')
    const shell = readFileSync(path.resolve(ROOT, '../../app-shell/MelegaAppShell.tsx'), 'utf8')
    expect(shell).toContain('MelegaDexFooter')

    for (const id of HOME_MOBILE_SECTION_ORDER) {
      expect(markerPositions.find((_, i) => HOME_MOBILE_SECTION_ORDER[i] === id)).toBeDefined()
    }
  })

  it('HomeTradeScreen re-exports DexHomeScreen with Smart-only swap panel', () => {
    const entry = readFileSync(path.join(ROOT, 'HomeTradeScreen.tsx'), 'utf8')
    const dex = readFileSync(path.join(ROOT, 'DexHomeScreen.tsx'), 'utf8')
    const panel = readFileSync(path.join(ROOT, 'HomeSwapPanel.tsx'), 'utf8')
    expect(entry).toMatch(/DexHomeScreen/)
    expect(dex).toContain('data-testid="dex-home-instant-swap"')
    expect(dex).not.toContain('dex-home-start-trading')
    expect(dex).not.toContain('Trade Terminal')
    expect(dex).not.toContain('Instant Swap')
    expect(dex).toContain('data-home-section="hero"')
    expect(panel).toContain("experience: SwapExperienceMode = 'smart'")
    expect(panel).toContain('SmartSwapForm')
    expect(panel).not.toContain('TradeModeSelector')
  })
})
