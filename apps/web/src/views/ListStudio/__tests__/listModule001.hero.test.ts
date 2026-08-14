/**
 * LIST Wave 04A hero — Melega orbit, no KPI cards, no corrupted artwork.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { formatListHeroStat } from '../useListHeroStats'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Wave 04A Hero', () => {
  it('uses Melega orbit animation without KPI cards or corrupted artwork', () => {
    const hero = load('ListPageHero.tsx')
    expect(hero).toContain('List, Launch,')
    expect(hero).toContain('and Grow')
    expect(hero).toContain('<Gold>Melega.</Gold>')
    expect(hero).toContain('melega-orbit')
    expect(hero).toContain('list-hero-orbit-bnb')
    expect(hero).toContain('list-hero-orbit-usdt')
    expect(hero).toContain('MELEGA_LOGO_URI')
    expect(hero).toContain('LIST_HERO_BNB_LOGO')
    expect(hero).toContain('LIST_HERO_USDT_LOGO')

    expect(hero).not.toContain('list-hero-stats')
    expect(hero).not.toContain('useListHeroStats')
    expect(hero).not.toContain('LIST_HERO_ART')
    expect(hero).not.toContain('LIST_HERO_BG')
  })

  it('does not hardcode fake statistics helpers', () => {
    const stats = load('useListHeroStats.ts')
    expect(stats).not.toMatch(/2341|847|184\.7/)
    expect(formatListHeroStat(null)).toBe('—')
  })

  it('preserves Melega brand logo asset', () => {
    const logo = path.join(WEB, 'public/images/melega.png')
    expect(existsSync(logo)).toBe(true)
  })
})
