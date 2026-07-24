/**
 * LIST_MODULE_001_HERO — geometry + asset + honesty guards.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { formatListHeroStat } from '../useListHeroStats'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function sha256(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

describe('LIST_MODULE_001 Hero', () => {
  it('locks desktop geometry tokens', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("contentMax: '1376px'")
    expect(tokens).toContain("heroH: '360px'")
    expect(tokens).toContain("heroW: '1376px'")
    expect(tokens).toContain("headlineW: '520px'")
    expect(tokens).toContain("headlineSize: '56px'")
    expect(tokens).toContain("headlineLh: '60px'")
    expect(tokens).toContain("descW: '480px'")
    expect(tokens).toContain("descTop: '20px'")
    expect(tokens).toContain("statW: '120px'")
    expect(tokens).toContain("statH: '72px'")
    expect(tokens).toContain("artW: '560px'")
    expect(tokens).toContain("artH: '320px'")
    expect(tokens).toContain('leftPct: 52')
    expect(tokens).toContain('rightPct: 48')
    expect(tokens).toContain("colGap: '24px'")
    expect(tokens).toContain("heroTop: '24px'")
  })

  it('implements exact three-line headline with gold Melega', () => {
    const hero = load('ListPageHero.tsx')
    expect(hero).toContain('List, Launch,')
    expect(hero).toContain('and Grow')
    expect(hero).toContain('Melega.')
    expect(hero).toContain('<Gold>Melega.</Gold>')
    expect(hero).toContain("height: ${listOne.heroH}")
    expect(hero).toContain('LIST_HERO_BG')
    expect(hero).toContain('LIST_HERO_ART')
    expect(hero).toContain('object-fit: contain')
    expect(hero).toContain('${listOne.leftPct}fr ${listOne.rightPct}fr')
    expect(hero).toContain('grid-template-columns: 1fr 1fr')
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("'/images/list/list-hero-background.png'")
    expect(tokens).toContain("'/images/list/list-hero-artwork.png'")
  })

  it('does not hardcode fake statistics', () => {
    const stats = load('useListHeroStats.ts')
    expect(stats).not.toMatch(/2341|847|184\.7/)
    expect(formatListHeroStat(null)).toBe('—')
    expect(formatListHeroStat(undefined)).toBe('—')
    expect(formatListHeroStat('')).toBe('—')
  })

  it('mounts hero only — no import/create/claim modules', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('ListPageHero')
    expect(screen).not.toMatch(/Import Existing Token|Create Project|Create Token|Claim Project|AI Assistant/i)
  })

  it('preserves founder assets under public/images/list', () => {
    const bg = path.join(WEB, 'public/images/list/list-hero-background.png')
    const art = path.join(WEB, 'public/images/list/list-hero-artwork.png')
    const source = path.join(WEB, 'docs/runtime/list-module-001-hero/approved-design-source.png')
    expect(existsSync(bg)).toBe(true)
    expect(existsSync(art)).toBe(true)
    expect(existsSync(source)).toBe(true)
    expect(sha256(bg).length).toBe(64)
    expect(sha256(art).length).toBe(64)
    expect(sha256(source)).toBe(
      '172ad3d5b78503f73103b3d6d829fca1939631b2b3d58d2773402972eed308c4',
    )
  })
})
