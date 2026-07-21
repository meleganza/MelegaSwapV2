/**
 * UX001 — Mobile-first Project Page & Home experience.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  findCrossProjectContractCollisions,
  loadProjectMachineDocument,
  resolveProjectBySlug,
  resolveProjectByTokenSymbol,
  resolveProjectByContractAddress,
} from '../index'
import { buildProjectTokenomicsDocument } from '../tokenomics/buildProjectTokenomicsDocument'
import { buildProjectRoadmapDocument } from '../roadmap/buildProjectRoadmapDocument'
import { loadProjectMarketsDocument } from '../markets'
import { humanChainName, humanEnumLabel, looksLikeMachineId } from 'views/ProjectPage/presentation/humanLabels'

const ROOT = path.join(__dirname, '../../../../')
const CONSUMER = path.join(ROOT, 'views/ProjectPage/consumer')

describe('UX001 identity separation', () => {
  it('1–4. /@marco and /@melega-dex are distinct immutable identities', () => {
    const marco = resolveProjectBySlug('marco')
    const dex = resolveProjectBySlug('melega-dex')
    expect(marco.ok && dex.ok).toBe(true)
    if (marco.ok && dex.ok) {
      expect(marco.project.upi).toBe('upi://melega/project/marco@1')
      expect(dex.project.upi).toBe('upi://melega/project/melega-dex@1')
      expect(marco.project.upi).not.toBe(dex.project.upi)
      expect(marco.project.displayName).toBe('MARCO')
      expect(dex.project.displayName).toBe('Melega DEX')
      expect(marco.project.aliases ?? []).not.toContain('marco')
      expect(dex.project.aliases ?? []).toContain('melega')
      expect(dex.project.aliases ?? []).not.toContain('marco')
    }
  })

  it('4. MARCO contract maps to marco project', () => {
    const addr = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
    expect(resolveProjectByContractAddress(addr)?.slug).toBe('marco')
    expect(resolveProjectByTokenSymbol('MARCO')?.slug).toBe('marco')
    expect(findCrossProjectContractCollisions()).toEqual([])
  })

  it('5. MARCO logo is registered (no MD placeholder required)', () => {
    const marco = resolveProjectBySlug('marco')
    expect(marco.ok).toBe(true)
    if (marco.ok) {
      expect(marco.project.logoUrl).toContain('melega.png')
    }
  })
})

describe('UX001 human presentation adapters', () => {
  it('6–9. human chain/enum labels; machine IDs detected', () => {
    expect(humanChainName(56)).toBe('BNB Smart Chain')
    expect(humanEnumLabel('VENUE_REGISTRY')).toBe('Melega DEX market')
    expect(humanEnumLabel('PROJECT_ATTESTED')).toBe('Declared by the project')
    expect(looksLikeMachineId('upi://melega/project/marco@1')).toBe(true)
    expect(looksLikeMachineId('BNB Smart Chain')).toBe(false)
  })

  it('10. consumer shell has no public owner diagnostic card', () => {
    const shell = readFileSync(path.join(CONSUMER, 'ProjectConsumerShell.tsx'), 'utf8')
    expect(shell).not.toContain('ProjectManageEntry')
    expect(shell).not.toContain('Owner access')
    expect(shell).toContain('ProjectTransparencySummary')
  })
})

describe('UX001 Project Page consumer surfaces', () => {
  it('11–13. sticky nav, hero, swap modules exist', () => {
    expect(existsSync(path.join(CONSUMER, 'ProjectStickyNav.tsx'))).toBe(true)
    expect(existsSync(path.join(CONSUMER, 'ProjectHero.tsx'))).toBe(true)
    expect(existsSync(path.join(CONSUMER, 'ProjectSwapCard.tsx'))).toBe(true)
    const nav = readFileSync(path.join(CONSUMER, 'ProjectStickyNav.tsx'), 'utf8')
    expect(nav).toMatch(/Overview|Chart|Swap|Tokenomics|Roadmap|Earn|Updates|More/)
    expect(nav).toContain('44px')
    const hero = readFileSync(path.join(CONSUMER, 'ProjectHero.tsx'), 'utf8')
    expect(hero).toMatch(/Buy|Swap/)
    expect(hero).not.toContain('Owner access')
    expect(hero).not.toContain('upi://')
  })

  it('14–15. personalized swap reuses SmartSwapForm (no second router)', () => {
    const swap = readFileSync(path.join(CONSUMER, 'ProjectSwapCard.tsx'), 'utf8')
    expect(swap).toContain('SmartSwapForm')
    expect(swap).toContain('views/Swap/SmartSwap')
    expect(swap).not.toMatch(/createRouter|second.?router/i)
    expect(swap).toMatch(/0x963556de0eb8138E97A85F0A86eE0acD159D210b|MARCO/)
  })

  it('16–18. chart uses indexer candles; unavailable path present', () => {
    const chart = readFileSync(path.join(CONSUMER, 'ProjectChartPanel.tsx'), 'utf8')
    expect(chart).toContain('useIndexerCandles')
    expect(chart).toMatch(/unavailable|Unavailable/i)
    expect(chart).not.toMatch(/synthetic|fabricat/i)
  })

  it('19–22. tokenomics and roadmap honest unpublished states', () => {
    const tok = buildProjectTokenomicsDocument('marco', '2026-07-21T00:00:00.000Z')
    expect(tok).not.toBeNull()
    expect(tok!.published).toBe(false)
    expect(tok!.unpublishedReason).toMatch(/not published/i)
    expect(tok!.facts.some((f) => f.id === 'symbol' && f.value === 'MARCO')).toBe(true)
    expect(tok!.allocationCategories).toEqual([])

    const road = buildProjectRoadmapDocument('marco', '2026-07-21T00:00:00.000Z')
    expect(road).not.toBeNull()
    expect(road!.published).toBe(false)
    expect(road!.milestones).toEqual([])
  })

  it('23–28. community, earn, updates, transparency modules', () => {
    for (const file of [
      'ProjectCommunitySection.tsx',
      'ProjectEarnSection.tsx',
      'ProjectUpdatesPreview.tsx',
      'ProjectTransparencySummary.tsx',
      'ProjectMoreSection.tsx',
      'ProjectUtilitiesSection.tsx',
    ]) {
      expect(existsSync(path.join(CONSUMER, file))).toBe(true)
    }
    const updates = readFileSync(path.join(CONSUMER, 'ProjectUpdatesPreview.tsx'), 'utf8')
    expect(updates).toMatch(/PREVIEW_COUNT\s*=\s*[23]|slice\(0,\s*PREVIEW_COUNT\)/)
    const trust = readFileSync(path.join(CONSUMER, 'ProjectTransparencySummary.tsx'), 'utf8')
    expect(trust).toMatch(/technical transparency|View technical/i)
  })
})

describe('UX001 Home + chrome', () => {
  it('31–36. Home swap shell and app shell safe-area fixes', () => {
    const swapShell = readFileSync(path.join(ROOT, 'views/HomeTrade/HomeSwapPanelShell.tsx'), 'utf8')
    expect(swapShell).toContain('flex-wrap')
    expect(swapShell).not.toContain('max-width: calc(100% - 100px)')
    const home = readFileSync(path.join(ROOT, 'views/HomeTrade/HomeTradeScreen.tsx'), 'utf8')
    expect(home).toContain('avoid double stacking')
    const shell = readFileSync(path.join(ROOT, 'app-shell/MelegaAppShell.tsx'), 'utf8')
    expect(shell).toContain('safe-area-inset-top')
    expect(shell).toContain('safe-area-inset-bottom')
    const cinematic = readFileSync(
      path.join(ROOT, 'design-system/melega/components/CinematicPanel/MelegaCinematicPanel.tsx'),
      'utf8',
    )
    expect(cinematic).toContain('font-size: 28px')
  })
})

describe('UX001 API / Project OS regression', () => {
  it('41–42. machine contracts remain loadable for both projects', () => {
    const marco = loadProjectMachineDocument('marco', '2026-07-21T00:00:00.000Z')
    const dex = loadProjectMachineDocument('melega-dex', '2026-07-21T00:00:00.000Z')
    expect(marco?.projectId).toBe('upi://melega/project/marco@1')
    expect(dex?.projectId).toBe('upi://melega/project/melega-dex@1')
    expect(marco?.schemaVersion).toBe(dex?.schemaVersion)
  })

  it('49. search index still uses /@{slug}/; trade links to /@marco/', () => {
    const search = readFileSync(path.join(ROOT, 'lib/global-search/buildGlobalSearchIndex.ts'), 'utf8')
    expect(search).toContain('/@${project.slug}/')
    const trade = readFileSync(path.join(ROOT, 'views/Trade/components/TradePageHeader.tsx'), 'utf8')
    expect(trade).toContain('/@marco/')
  })

  it('markets load for both identities', () => {
    const marcoMarkets = loadProjectMarketsDocument('marco', { generatedAt: '2026-07-21T00:00:00.000Z' })
    const dexMarkets = loadProjectMarketsDocument('melega-dex', { generatedAt: '2026-07-21T00:00:00.000Z' })
    expect(marcoMarkets?.projectId).toBe('upi://melega/project/marco@1')
    expect(dexMarkets?.projectId).toBe('upi://melega/project/melega-dex@1')
    expect(marcoMarkets?.markets.length ?? 0).toBeGreaterThan(0)
    expect(dexMarkets?.markets.length ?? 0).toBeGreaterThan(0)
  })
})

describe('UX001 page wiring', () => {
  it('project-hq page renders ProjectConsumerShell', () => {
    const page = readFileSync(path.join(ROOT, 'pages/project-hq/[slug].tsx'), 'utf8')
    expect(page).toContain('ProjectConsumerShell')
    expect(page).toContain('buildProjectTokenomicsDocument')
    expect(page).toContain('buildProjectRoadmapDocument')
  })
})
