/**
 * POOLS_MODULE_001 — Hero lock, freeze guards, destinations, no mock KPIs.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  POOLS_HERO_COPY,
  POOLS_HERO_COPY_DEVIATIONS,
  poolsHero,
} from '../modules/poolsHeroTokens'
import { POOLS_FOUNDER_MOCKUP, POOLS_MODULE_PLAN } from '../poolsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

describe('POOLS_MODULE_001 Hero', () => {
  it('keeps Architecture 000 Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(sha).toBe(poolsHero.mockupSha256)
    expect(bytes.length).toBe(POOLS_FOUNDER_MOCKUP.bytes)
  })

  it('locks Hero geometry contracts (1376×260 / 440+48+480+48+360)', () => {
    expect(poolsHero.heroW).toBe('1376px')
    expect(poolsHero.heroH).toBe('260px')
    expect(poolsHero.topAfterTrending).toBe('24px')
    expect(poolsHero.leftW).toBe('440px')
    expect(poolsHero.artworkW).toBe('480px')
    expect(poolsHero.trustW).toBe('360px')
    expect(poolsHero.columnGap).toBe('48px')
    const sum =
      parseInt(poolsHero.leftW, 10) +
      parseInt(poolsHero.columnGap, 10) +
      parseInt(poolsHero.artworkW, 10) +
      parseInt(poolsHero.columnGap, 10) +
      parseInt(poolsHero.trustW, 10)
    expect(sum).toBe(1376)
  })

  it('ships locked factual copy without mockup KPI numbers', () => {
    expect(POOLS_HERO_COPY.title).toBe('Pools')
    expect(POOLS_HERO_COPY.description).toBe('Stake tokens. Earn rewards. On your terms.')
    expect(POOLS_HERO_COPY.primaryCta).toBe('Create Pool')
    expect(POOLS_HERO_COPY.trustTitle).toBe('Why Stake on Melega DEX?')
    expect(POOLS_HERO_COPY_DEVIATIONS.length).toBeGreaterThan(0)

    const uiSrc = [
      load('modules/PoolsHeroModule.tsx'),
      load('modules/PoolsHeroTrustPanel.tsx'),
      load('modules/PoolsHeroArtwork.tsx'),
      JSON.stringify(POOLS_HERO_COPY),
    ].join('\n')
    expect(uiSrc).not.toContain('202.4')
    expect(uiSrc).not.toContain('128.45')
    expect(uiSrc).not.toContain('$53.21')
    expect(uiSrc).not.toContain('guaranteed')
    expect(uiSrc).not.toContain('maximum returns')
    expect(uiSrc).not.toContain('risk-free')
    expect(uiSrc).not.toContain('Melega Labs')
  })

  it('mounts Module 001 on live screen while preserving legacy body and page entry', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/pools/index.tsx'), 'utf8')
    expect(page).toContain('PoolsStudioScreen')
    expect(page).not.toContain('PoolsArchitectureShell')

    const screen = load('PoolsStudioScreen.tsx')
    expect(screen).toContain('PoolsHeroModule')
    expect(screen).toContain('data-pools-module-001="mounted"')
    expect(screen).toContain('CreatePoolCta')
    expect(screen).not.toContain('PoolsStudioPageHeader')
    // Modules 002–006 may mount after Hero; Modules 007+ remain forbidden here.
    expect(screen).not.toContain('data-pools-module="007"')
  })

  it('uses factual Create Pool destination and reserved How it Works behavior', () => {
    expect(poolsHero.createPoolHref).toBe('#create-pool')
    expect(poolsHero.createPoolFallback).toContain('build-studio')
    expect(poolsHero.howItWorksReserved).toBe(true)
    const mod = load('modules/PoolsHeroModule.tsx')
    expect(mod).toContain('create-pool')
    expect(mod).toContain('pools-hero-how-it-works')
  })

  it('keeps Modules 007–010 unmounted (Modules 002–006 may follow Hero)', () => {
    const screen = load('PoolsStudioScreen.tsx')
    expect(screen).toContain('PoolsHeroModule')
    expect(screen).not.toContain('data-pools-module="007"')
    expect(screen).not.toContain('data-pools-module="009"')
    expect(POOLS_MODULE_PLAN.find((m) => m.id === '001-hero')).toBeTruthy()
  })

  it('ownership map records Module 001 file assignment', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/POOLS_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('PoolsHeroModule.tsx')
    expect(map).toContain('poolsHeroTokens.ts')
    expect(map).toContain('LEGACY_IMPLEMENTATION')
  })
})
