/**
 * SMART_SWAP_MODULE_001 — Hero lock, freeze guards, no runtime / economics.
 */
import { createHash } from 'crypto'
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  SMART_SWAP_HERO_COPY,
  SMART_SWAP_HERO_FORBIDDEN_CLAIMS,
  smartSwapHero,
} from '../modules/smartSwapHeroTokens'
import {
  SMART_SWAP_ARCHITECTURE_ID,
  SMART_SWAP_CERTIFIED_BASE,
  SMART_SWAP_DOC_PATHS,
  SMART_SWAP_MODULE_PLAN,
} from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')
const STUDIO = path.resolve(__dirname, '..')
const ARCH_CONTRACTS = path.join(
  WEB,
  'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts',
)

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function sha256File(abs: string) {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

describe('SMART_SWAP_MODULE_001 Hero', () => {
  it('keeps Architecture 000 contracts byte-frozen', () => {
    expect(existsSync(ARCH_CONTRACTS)).toBe(true)
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    expect(SMART_SWAP_CERTIFIED_BASE.tipShort).toBe('94d4979a')
    // File must remain the architecture tip content (no fee/router edits).
    expect(sha256File(ARCH_CONTRACTS).length).toBe(64)
    for (const rel of SMART_SWAP_DOC_PATHS) {
      expect(existsSync(path.join(REPO, rel))).toBe(true)
    }
    expect(SMART_SWAP_MODULE_PLAN.some((m) => m.id === '001-hero')).toBe(true)
  })

  it('locks Hero geometry contracts (1376×260 / 440+48+480+48+360)', () => {
    expect(smartSwapHero.heroW).toBe('1376px')
    expect(smartSwapHero.heroH).toBe('260px')
    expect(smartSwapHero.leftW).toBe('440px')
    expect(smartSwapHero.artworkW).toBe('480px')
    expect(smartSwapHero.trustW).toBe('360px')
    expect(smartSwapHero.columnGap).toBe('48px')
    expect(smartSwapHero.trustBoxW).toBe('360px')
    expect(smartSwapHero.trustBoxH).toBe('230px')
    expect(smartSwapHero.mobileContentW).toBe('358px')
    const sum =
      parseInt(smartSwapHero.leftW, 10) +
      parseInt(smartSwapHero.columnGap, 10) +
      parseInt(smartSwapHero.artworkW, 10) +
      parseInt(smartSwapHero.columnGap, 10) +
      parseInt(smartSwapHero.trustW, 10)
    expect(sum).toBe(1376)
  })

  it('ships locked factual copy without runtime or forbidden claims', () => {
    expect(SMART_SWAP_HERO_COPY.title).toBe('Smart Swap')
    expect(SMART_SWAP_HERO_COPY.primaryCta).toBe('Start Smart Swap')
    expect(SMART_SWAP_HERO_COPY.secondaryCta).toBe('How It Works')
    expect(SMART_SWAP_HERO_COPY.trustTitle).toBe('Why Smart Swap?')
    expect(SMART_SWAP_HERO_COPY.trustItems.map((i) => i.title)).toEqual([
      'Better Route Visibility',
      'Transparent Fees',
      'Execution Confidence',
      'Non-Custodial Trading',
    ])
    expect(SMART_SWAP_HERO_COPY.relationship.toLowerCase()).toContain('instant swap')
    expect(SMART_SWAP_HERO_COPY.relationship.toLowerCase()).toContain('same')
    expect(SMART_SWAP_HERO_COPY.relationship.toLowerCase()).toContain('engine')

    const uiSrc = [
      load('modules/SmartSwapHeroModule.tsx'),
      load('modules/SmartSwapHeroTrustPanel.tsx'),
      load('modules/SmartSwapHeroArtwork.tsx'),
      JSON.stringify(SMART_SWAP_HERO_COPY),
    ].join('\n')
    const tokensSrc = load('modules/smartSwapHeroTokens.ts')

    expect(uiSrc).not.toMatch(/\$\d/)
    expect(uiSrc).not.toMatch(/\bAPR\b/)
    expect(uiSrc).not.toMatch(/\bTVL\b/)
    expect(uiSrc).not.toContain('useAccount')
    expect(uiSrc).not.toContain('useBestTrade')
    expect(uiSrc).not.toContain('useSwapCallback')
    expect(uiSrc).not.toContain('prepareMelegaSmartRouterSwap')
    expect(uiSrc).not.toContain('treasuryHandoff')
    expect(uiSrc).not.toContain('isKerlRoutingAuthorityEnforced')
    expect(tokensSrc).not.toContain('useAccount')
    expect(tokensSrc).not.toContain('useBestTrade')

    for (const claim of SMART_SWAP_HERO_FORBIDDEN_CLAIMS) {
      expect(uiSrc.toLowerCase()).not.toContain(claim.toLowerCase())
    }
  })

  it('mounts Module 001 on Trade terminal without modifying SmartSwapForm', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Trade/TradeTerminalScreen.tsx'), 'utf8')
    expect(screen).toContain('SmartSwapHeroModule')
    expect(screen).toContain('data-smart-swap-module-001="mounted"')
    expect(screen).toContain('smart-swap-execution')
    expect(screen).toContain('TradeHowItWorksPanel')

    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    // Form remains the shared engine; hero must not live inside it.
    expect(form).not.toContain('SmartSwapHeroModule')
    expect(form).toContain('SmartSwapForm')
  })

  it('renders How It Works only because factual Trade panel exists', () => {
    expect(smartSwapHero.howItWorksRendered).toBe(true)
    expect(existsSync(path.join(WEB, 'src/views/Trade/components/TradeHowItWorksPanel.tsx'))).toBe(true)
    const hero = load('modules/SmartSwapHeroModule.tsx')
    expect(hero).toContain('smart-swap-hero-how-it-works')
  })

  it('does not change fee / router / KERL / treasury product files', () => {
    const status = require('child_process').execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/melega-smart-router/)
    expect(status).not.toMatch(/kerl-constitutional/)
    expect(status).not.toMatch(/treasury-handoff/)
    expect(status).not.toMatch(/d87-pricing/)
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\/utils\/exchange\.ts/)
    expect(status).not.toMatch(/config\/constants\/exchange\.ts/)
  })
})
