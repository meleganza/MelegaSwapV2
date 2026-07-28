/**
 * FARMS_MODULE_001 — Hero lock, freeze guards, destinations, no mock KPIs.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { FARMS_HERO_COPY, farmsHero } from '../modules/farmsHeroTokens'
import { FARMS_FOUNDER_MOCKUP, FARMS_MODULE_PLAN } from '../farmsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

describe('FARMS_MODULE_001 Hero', () => {
  it('keeps Architecture 000 Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(sha).toBe(farmsHero.mockupSha256)
    expect(bytes.length).toBe(FARMS_FOUNDER_MOCKUP.bytes)
  })

  it('locks Hero geometry contracts (1376×260 / 440+48+480+48+360)', () => {
    expect(farmsHero.heroW).toBe('1376px')
    expect(farmsHero.heroH).toBe('260px')
    expect(farmsHero.topAfterTrending).toBe('24px')
    expect(farmsHero.leftW).toBe('440px')
    expect(farmsHero.artworkW).toBe('480px')
    expect(farmsHero.trustW).toBe('360px')
    expect(farmsHero.columnGap).toBe('48px')
    expect(farmsHero.trustBoxW).toBe('360px')
    expect(farmsHero.trustBoxH).toBe('230px')
    const sum =
      parseInt(farmsHero.leftW, 10) +
      parseInt(farmsHero.columnGap, 10) +
      parseInt(farmsHero.artworkW, 10) +
      parseInt(farmsHero.columnGap, 10) +
      parseInt(farmsHero.trustW, 10)
    expect(sum).toBe(1376)
  })

  it('ships locked factual copy without runtime KPIs or forbidden claims', () => {
    expect(FARMS_HERO_COPY.title).toBe('Farms')
    expect(FARMS_HERO_COPY.description).toBe('Stake LP tokens.\nEarn farming rewards.\nGrow liquidity.')
    expect(FARMS_HERO_COPY.primaryCta).toBe('Explore Farms')
    expect(FARMS_HERO_COPY.trustTitle).toBe('Why Farm on Melega DEX?')
    expect(FARMS_HERO_COPY.trustItems).toHaveLength(4)
    expect(FARMS_HERO_COPY.trustItems.map((i) => i.title)).toEqual([
      'LP-Powered Yield',
      'Transparent Rewards',
      'Flexible Management',
      'On-Chain Ownership',
    ])

    const uiSrc = [
      load('modules/FarmsHeroModule.tsx'),
      load('modules/FarmsHeroTrustPanel.tsx'),
      load('modules/FarmsHeroArtwork.tsx'),
      JSON.stringify(FARMS_HERO_COPY),
    ].join('\n')
    const tokensSrc = load('modules/farmsHeroTokens.ts')

    expect(uiSrc).not.toMatch(/\$\d/)
    expect(uiSrc).not.toMatch(/\bAPR\b/)
    expect(uiSrc).not.toMatch(/\bTVL\b/)
    expect(uiSrc).not.toContain('useFarmsStakingRuntime')
    expect(uiSrc).not.toContain('useAccount')
    expect(tokensSrc).not.toContain('useFarmsStakingRuntime')
    expect(tokensSrc).not.toContain('useAccount')
    // Forbidden marketing claims must not appear in shipped copy/UI (list itself lives in tokens).
    for (const claim of ['Guaranteed rewards', 'Highest APR', 'Risk-free farming']) {
      expect(uiSrc.toLowerCase()).not.toContain(claim.toLowerCase())
    }
  })

  it('mounts Module 001 on live screen while preserving legacy body and page entry', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/farms/index.tsx'), 'utf8')
    expect(page).toContain('FarmsStudioScreen')
    expect(page).not.toContain('FarmsArchitectureShell')

    const screen = load('FarmsStudioScreen.tsx')
    expect(screen).toContain('FarmsHeroModule')
    expect(screen).toContain('data-farms-module-001="mounted"')
    expect(screen).toContain('FarmsMyFarmsModule')
    expect(screen).toContain('FarmsYieldAdvisorModule')
    expect(screen).not.toContain('AIYieldAdvisorPanel')
    expect(screen).not.toContain('FarmsStudioPageHeader')
    // Modules 002–008 may mount after Hero; Modules 009+ remain forbidden here.
    expect(screen).not.toContain('data-farms-module="009"')
    expect(screen).not.toContain('FarmsIntegrationModule')
  })

  it('uses Module 004 Explore Farms anchor and omits How Farming Works without a factual destination', () => {
    expect(farmsHero.exploreFarmsHref).toBe('#explore-farms')
    expect(farmsHero.exploreFarmsLegacyFallback).toContain('/farms')
    expect(farmsHero.howFarmingWorksRendered).toBe(false)
    expect(farmsHero.howFarmingWorksHref).toBeNull()

    const mod = load('modules/FarmsHeroModule.tsx')
    expect(mod).toContain('explore-farms')
    expect(mod).toContain('farms-hero-explore-farms')
    expect(mod).not.toContain('farms-hero-how-farming-works')
    expect(mod).not.toContain('How Farming Works')

    const explore = load('modules/FarmsExploreFarmsModule.tsx')
    expect(explore).toContain('id="explore-farms"')
  })

  it('keeps Modules 009–010 unmounted (Modules 002–008 may follow Hero)', () => {
    const screen = load('FarmsStudioScreen.tsx')
    expect(screen).toContain('FarmsHeroModule')
    for (const id of ['009', '010']) {
      expect(screen).not.toContain(`data-farms-module="${id}"`)
    }
    expect(FARMS_MODULE_PLAN.find((m) => m.id === '001-hero')).toBeTruthy()
  })

  it('ownership map records Module 001 file assignment', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/FARMS_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('FarmsHeroModule.tsx')
    expect(map).toContain('farmsHeroTokens.ts')
    expect(map).toContain('LEGACY_IMPLEMENTATION')
    expect(map).toContain('farms-module-001-hero')
  })

  it('artwork communicates LP Pair → Farm → Reward Token without fake numbers', () => {
    const art = load('modules/FarmsHeroArtwork.tsx')
    expect(art).toContain('LP Pair')
    expect(art).toContain('Farm')
    expect(art).toContain('Reward Token')
    expect(art).not.toContain('PoolsStudio')
    expect(art).toContain('aria-hidden')
    // Ban readable fake yield figures (CSS % units are allowed).
    expect(art).not.toMatch(/\b\d{1,3}\.\d+%\b/)
    expect(art).not.toMatch(/\$\d/)
  })
})
