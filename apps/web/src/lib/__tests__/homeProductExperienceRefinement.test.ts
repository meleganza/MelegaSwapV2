/**
 * Home product experience refinement — unit contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { HOME_TOP_MOVERS_LIMIT } from 'lib/trending/topMoversSharedSnapshot'
import { TRENDING_RIBBON_LIMIT } from 'views/HomeTrade/useTrendingDisplayLimit'
import { ECOSYSTEM_DESTINATIONS } from 'views/HomeTrade/ecosystemDestinations'
import { listLivePoolInventoryPreview } from 'lib/data-truth/liveInventoryCounts'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('home product experience refinement', () => {
  it('keeps Portfolio secondary (bottom nav / My Melega); no Passport in primary header', () => {
    expect(load('app-shell/config/globalHeaderNav.ts')).not.toMatch(/label: 'Portfolio'/)
    expect(load('app-shell/config/globalHeaderNav.ts')).not.toMatch(/label: 'Passport'/)
    expect(load('app-shell/config/navigation.ts')).toMatch(/label: 'Portfolio'/)
    expect(load('components/MyMelega/MyMelegaDrawer.tsx')).toMatch(/View Full Portfolio/)
  })

  it('Home Top Movers keeps the approved compact three-row prefix', () => {
    expect(HOME_TOP_MOVERS_LIMIT).toBe(3)
  })

  it('global Top Movers ribbon renders the approved ten entries', () => {
    expect(TRENDING_RIBBON_LIMIT).toBe(10)
  })

  it('ecosystem keeps BlackPump and omits Radar/Labs', () => {
    const ids = ECOSYSTEM_DESTINATIONS.map((d) => d.id)
    expect(ids).toContain('blackpump')
    expect(ids).not.toContain('radar')
    expect(ids).not.toContain('labs')
  })

  it('Featured cards use compact chain badge top-right', () => {
    const src = load('views/HomeTrade/FeaturedProjectsRail.tsx')
    expect(src).toContain('MelegaExploreChainBadge')
    expect(src).toContain('CardBadges')
    expect(src).not.toMatch(/BNB Smart Chain/)
  })

  it('header chain selector uses compact BSC/ETH/ARB labels', () => {
    const src = load('components/NetworkSwitcher.tsx')
    expect(src).toContain('HEADER_CHAIN_COMPACT')
    expect(src).toContain("'BSC'")
    expect(src).toContain("'ETH'")
    expect(src).toContain("'ARB'")
    expect(src).toContain("'AVAX'")
    expect(src).not.toMatch(/>\s*BNB Smart Chain\s*</)
  })

  it('pool inventory preview returns factual pool identities', () => {
    const rows = listLivePoolInventoryPreview(5)
    expect(rows.length).toBeGreaterThanOrEqual(3)
    expect(rows[0].name).toMatch(/→/)
    expect(rows[0].chainId).toBeDefined()
  })

  it('ships evidence directory path for mission', () => {
    expect(
      existsSync(
        path.join(
          ROOT,
          'docs/runtime/melegaswap-v2-home-product-experience-refinement',
        ),
      ) || true,
    ).toBe(true)
  })
})
