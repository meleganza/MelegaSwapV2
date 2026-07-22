/**
 * UX rebuild — Home mobile section order (presentation markers only).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { HOME_MOBILE_SECTION_ORDER } from '../homeMobileSections'

const ROOT = path.join(__dirname, '../')

describe('UX rebuild home mobile section order', () => {
  it('exports canonical mobile section sequence', () => {
    expect(HOME_MOBILE_SECTION_ORDER).toEqual([
      'hero',
      'swap',
      'kpi',
      'quick-actions',
      'discovery',
      'builder',
      'passport',
      'trust',
    ])
  })

  it('DexHomeScreen mounts sections in mobile order via data-home-section markers', () => {
    const screen = readFileSync(path.join(ROOT, 'DexHomeScreen.tsx'), 'utf8')
    const markerPositions = HOME_MOBILE_SECTION_ORDER.map((id) => {
      const needle = `data-home-section="${id}"`
      const index = screen.indexOf(needle)
      expect(index, `missing ${needle}`).toBeGreaterThan(-1)
      return index
    })

    for (let i = 1; i < markerPositions.length; i += 1) {
      expect(markerPositions[i]).toBeGreaterThan(markerPositions[i - 1])
    }
  })

  it('HomeTradeScreen re-exports DexHomeScreen with Instant Swap hero', () => {
    const entry = readFileSync(path.join(ROOT, 'HomeTradeScreen.tsx'), 'utf8')
    const dex = readFileSync(path.join(ROOT, 'DexHomeScreen.tsx'), 'utf8')
    expect(entry).toMatch(/DexHomeScreen/)
    expect(dex).toContain('Instant Swap')
    expect(dex).toContain('data-home-section="hero"')
  })
})
