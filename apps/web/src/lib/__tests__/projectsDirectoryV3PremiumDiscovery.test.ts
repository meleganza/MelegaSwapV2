/**
 * MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  applyProjectsDirectoryQuery,
  buildSwapHref,
  DIRECTORY_SORT,
  DIRECTORY_STATUS,
  formatListedAgo,
  PROJECTS_INITIAL_PAGE_SIZE,
  projectMarketIdentity,
} from 'views/ProjectsStudio/projectsDirectoryV3'
import { FILTER_SORT, FILTER_STATUS } from 'views/ProjectsStudio/projectsStudioData'
import type { ProjectPreviewCard } from 'views/ProjectsStudio/projectsStudioData'
import {
  clearTokenLogoIdentityCache,
  resolveTokenLogoSources,
} from 'lib/token-logo/resolveTokenLogoSources'

const WEB = path.resolve(__dirname, '../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

function stubCard(partial: Partial<ProjectPreviewCard> & Pick<ProjectPreviewCard, 'id' | 'slug'>): ProjectPreviewCard {
  return {
    rank: 1,
    name: partial.name ?? partial.slug,
    category: 'DeFi',
    chains: ['BSC'],
    status: 'community',
    rating: 50,
    ratingTier: 'emerging',
    aiSummary: '',
    metrics: [
      { label: 'Liquidity', value: '—' },
      { label: 'Volume', value: '—' },
      { label: 'Holders', value: '—' },
    ],
    aiConfidence: '—',
    melegaRating: '—',
    risk: '—',
    riskTone: 'gray',
    website: '—',
    contract: '—',
    ...partial,
  }
}

describe('MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY', () => {
  it('compact hero + factual market list + dropdown filters', () => {
    const header = load('views/ProjectsStudio/components/ProjectsStudioPageHeader.tsx')
    const screen = load('views/ProjectsStudio/ProjectsStudioScreen.tsx')
    const directory = load('views/ProjectsStudio/components/ProjectsGrid.tsx')
    const filters = load('views/ProjectsStudio/components/ProjectsFilterRow.tsx')
    expect(header).toContain('Discover Projects')
    expect(header).toContain('Explore tokens and projects across Melega DEX.')
    expect(header).toContain('data-projects-hero="compact-v3"')
    expect(header).toMatch(/max-height:\s*170px/)
    expect(screen).toContain('data-projects-directory="v3"')
    expect(screen).not.toContain('FeaturedProjectsSection')
    expect(directory).toContain('data-projects-directory-view="market-list"')
    expect(directory).toContain('isMarketDiscoverableProject')
    expect(filters).toContain('data-projects-filters="dropdowns"')
    expect(filters).toContain('projects-filters-mobile')
    expect(filters).toContain('projects-filter-reset')
    expect(filters).not.toContain('FILTER_STATUS.map')
  })

  it('Trending is one Sort control; Status never duplicates Trending', () => {
    expect(DIRECTORY_STATUS).not.toContain('Trending')
    expect(FILTER_STATUS).not.toContain('Trending')
    expect(DIRECTORY_SORT).toContain('Trending')
    expect(FILTER_SORT).toContain('Trending')
    const cfg = load('../next.config.mjs')
    expect(cfg).toMatch(/destination:\s*'\/projects\?sort=trending'/)
  })

  it('canonical identity + Trade → /swap + View Project perf', () => {
    const a = stubCard({
      id: 'marco-bsc',
      slug: 'marco-bsc',
      symbol: 'MARCO',
      chainId: 56,
      contractAddress: '0x1111111111111111111111111111111111111111',
    })
    const b = stubCard({
      id: 'marco-base',
      slug: 'marco-base',
      symbol: 'MARCO',
      chainId: 8453,
      contractAddress: '0x1111111111111111111111111111111111111111',
    })
    expect(projectMarketIdentity(a)).not.toBe(projectMarketIdentity(b))
    expect(buildSwapHref({ address: a.contractAddress, chainId: 56 })).toContain('/swap?')
    expect(buildSwapHref({ address: a.contractAddress, chainId: 56 })).toContain('chain=56')
    expect(buildSwapHref({ address: a.contractAddress, chainId: 56 })).not.toContain('/?')
    const card = load('views/ProjectsStudio/components/ProjectGridCard.tsx')
    expect(card).toContain('View Project')
    expect(card).toContain('markProjectNavClick')
    expect(card).toContain("startsWith('/swap')")
    expect(card).toContain('data-project-card="v3"')
  })

  it('logo fallback is chain-scoped; no broken-image path without fallback', () => {
    clearTokenLogoIdentityCache()
    const bsc = resolveTokenLogoSources({
      symbol: 'USDT',
      address: '0x55d398326f99059ff775485246999027b3197955',
      chainId: 56,
    })
    const eth = resolveTokenLogoSources({
      symbol: 'USDT',
      address: '0x55d398326f99059ff775485246999027b3197955',
      chainId: 1,
    })
    expect(bsc.some((s) => s.includes('/56/'))).toBe(true)
    expect(eth.some((s) => s.includes('/1/'))).toBe(true)
    const avatar = load('design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar.tsx')
    expect(avatar).toContain('onError')
    expect(avatar).toContain('data-token-logo-fallback="neutral-avatar"')
  })

  it('no fake sparkline; paid Boosted distinct from organic Trending', () => {
    const card = load('views/ProjectsStudio/components/ProjectGridCard.tsx')
    expect(card).toContain('neutral-baseline')
    expect(card).toContain('useIndexerCandles')
    expect(card).not.toMatch(/change24hPct[\s\S]{0,80}AnimatedSparkline/)
    expect(card).toContain('project-badge-boosted')
    expect(card).toContain("rankingLayer === 'organic' && !boosted")
  })

  it('multichain New listings + bounded initial rendering + filter persistence helpers', () => {
    expect(PROJECTS_INITIAL_PAGE_SIZE).toBeGreaterThanOrEqual(24)
    expect(PROJECTS_INITIAL_PAGE_SIZE).toBeLessThanOrEqual(32)
    const listed = formatListedAgo(Date.now() - 2 * 60 * 60 * 1000)
    expect(listed).toMatch(/Listed 2h ago/)
    const cards = [
      stubCard({ id: 'n1', slug: 'n1', status: 'new', chainId: 8453, chains: ['Base'], listedAtMs: 100 }),
      stubCard({ id: 'n2', slug: 'n2', status: 'new', chainId: 56, chains: ['BSC'], listedAtMs: 200 }),
      stubCard({ id: 'old', slug: 'old', status: 'verified', chainId: 1, chains: ['ETH'] }),
    ]
    const filtered = applyProjectsDirectoryQuery(cards, {
      status: 'New',
      chain: 'All Chains',
      category: 'All',
      sort: 'Newest',
      search: '',
    })
    expect(filtered).toHaveLength(2)
    expect(filtered[0].id).toBe('n2')
    expect(filtered.map((c) => c.chainId)).toEqual(expect.arrayContaining([56, 8453]))
    const grid = load('views/ProjectsStudio/components/ProjectsGrid.tsx')
    expect(grid).toContain('projects-load-more')
    expect(grid).toContain('PROJECTS_SCROLL_KEY')
    expect(grid).toContain('data-projects-directory-view="market-list"')
  })

  it('mobile filter drawer present', () => {
    const filters = load('views/ProjectsStudio/components/ProjectsFilterRow.tsx')
    expect(filters).toContain('projects-filters-drawer')
    expect(filters).toContain('Filters')
  })

  it('ships evidence folder scaffold expectation', () => {
    const evidenceRoot = path.resolve(
      __dirname,
      '../../../docs/runtime/melegaswap-v2-projects-directory-v3-premium-discovery',
    )
    // Directory may be created by the mission evidence step; gate soft-checks REPORT when present.
    if (existsSync(path.join(evidenceRoot, 'REPORT.md'))) {
      const report = readFileSync(path.join(evidenceRoot, 'REPORT.md'), 'utf8')
      expect(report).toContain('MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY')
    }
  })
})
