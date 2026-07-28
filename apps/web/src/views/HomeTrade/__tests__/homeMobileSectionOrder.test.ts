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
    expect(host.indexOf('<ExploreMelegaEcosystem')).toBeLessThan(host.indexOf('<MelegaDexFooter'))

    for (const id of HOME_MOBILE_SECTION_ORDER) {
      expect(markerPositions.find((_, i) => HOME_MOBILE_SECTION_ORDER[i] === id)).toBeDefined()
    }
  })

  it('HomeTradeScreen re-exports DexHomeScreen with single Swap entry + mode selector', () => {
    const entry = readFileSync(path.join(ROOT, 'HomeTradeScreen.tsx'), 'utf8')
    const dex = readFileSync(path.join(ROOT, 'DexHomeScreen.tsx'), 'utf8')
    const panel = readFileSync(path.join(ROOT, 'HomeSwapPanel.tsx'), 'utf8')
    expect(entry).toMatch(/DexHomeScreen/)
    expect(dex).toMatch(/dex-home-start-trading[\s\S]{0,120}Swap/)
    expect(dex).toContain('data-testid="dex-home-start-trading"')
    expect(dex).not.toContain('Trade Terminal')
    expect(dex).not.toContain('Instant Swap')
    expect(dex).not.toContain('Smart Swap')
    expect(dex).toContain('data-home-section="hero"')
    expect(panel).toContain('TradeModeSelector')
    expect(panel).toContain('SmartSwapForm')
  })
})
