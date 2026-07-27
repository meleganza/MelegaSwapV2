/**
 * LIST hero — premium dark/gold rebuild + real counters.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { formatListHeroStat } from '../useListHeroStats'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST_MODULE_001 Hero (data-truth rebuild)', () => {
  it('uses premium CSS hero without blurry banner assets', () => {
    const hero = load('ListPageHero.tsx')
    expect(hero).toContain('List, Launch,')
    expect(hero).toContain('and Grow')
    expect(hero).toContain('<Gold>Melega.</Gold>')
    expect(hero).toContain('data-list-hero-premium')
    expect(hero).toContain('Melega DEX')
    expect(hero).not.toContain('LIST_HERO_BG')
    expect(hero).not.toContain('LIST_HERO_ART')
    expect(hero).not.toContain('list-hero-background.png')
    expect(hero).toContain('Listed Tokens')
    expect(hero).toContain('Projects')
    expect(hero).toContain('Markets')
    expect(hero).toContain('Networks')
  })

  it('wires real registry / market counters — never fake showcase numbers', () => {
    const stats = load('useListHeroStats.ts')
    expect(stats).toContain('getAllProjects')
    expect(stats).toContain('pancake-default.tokenlist')
    expect(stats).toContain('/api/indexer/pairs')
    expect(stats).toContain('SUPPORT_MULTI_CHAINS')
    expect(stats).not.toMatch(/2341|847|184\.7/)
    expect(formatListHeroStat(null)).toBe('—')
    expect(formatListHeroStat(undefined)).toBe('—')
    expect(formatListHeroStat('')).toBe('—')
    expect(formatListHeroStat('273')).toBe('273')
  })

  it('mounts hero from ListStudioScreen', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('ListPageHero')
  })
})
