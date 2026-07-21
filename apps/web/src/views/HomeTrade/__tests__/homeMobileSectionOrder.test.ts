/**
 * UX002 — Home mobile section order (presentation markers only).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { HOME_MOBILE_SECTION_ORDER } from '../homeMobileSections'

const ROOT = path.join(__dirname, '../')

describe('UX002 home mobile section order', () => {
  it('exports canonical mobile section sequence', () => {
    expect(HOME_MOBILE_SECTION_ORDER).toEqual([
      'hero',
      'swap',
      'trending',
      'market',
      'quick-actions',
      'cinematic',
      'list-cta',
      'grow',
      'earn',
      'activity',
    ])
  })

  it('HomeTradeScreen mounts sections in mobile order via data-home-section markers', () => {
    const screen = readFileSync(path.join(ROOT, 'HomeTradeScreen.tsx'), 'utf8')
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

  it('HomeHeroStatement is mobile-only with display typography', () => {
    const hero = readFileSync(path.join(ROOT, 'HomeHeroStatement.tsx'), 'utf8')
    expect(hero).toContain('PREMIUM_FONT_DISPLAY')
    expect(hero).toContain('display: none')
    expect(hero).toContain('data-home-section="hero"')
  })
})
