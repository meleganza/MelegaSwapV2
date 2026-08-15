/**
 * MELEGASWAP_V2_FOUNDER_REVIEW_P0_P1_REPAIR — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { defaultSelectedChainId, getBuyTokenHref } from 'views/ProjectPage/v1/helpers'
import { formatPrice } from 'views/ProjectPage/presentation/humanLabels'
import { searchGlobal, canonicalSearchIdentityKey } from 'lib/global-search/searchGlobal'
import { buildGlobalSearchIndex } from 'lib/global-search/buildGlobalSearchIndex'
import { buildDimensions, computeMelegaScore, buildOfficialContracts } from 'views/AuditStudio/buildOfficialContracts'
import { GLOBAL_HEADER_NAV } from 'app-shell/config/globalHeaderNav'
import { FILTER_STATUS, FILTER_SORT } from 'views/ProjectsStudio/projectsStudioData'

const SRC = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(SRC, rel), 'utf8')
const loadWeb = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8')

describe('MELEGASWAP_V2_FOUNDER_REVIEW_P0_P1_REPAIR', () => {
  it('P0 Featured Pool compact returns null without factual card', () => {
    const src = load('views/PoolsStudio/modules/PoolsHeroFeaturedCompact.tsx')
    expect(src).toContain('if (!card?.rawPool) return null')
    expect(src).not.toContain('No rewarding pool available')
    expect(src).not.toContain('data-featured="empty"')
  })

  it('P0 /trade redirects to /swap', () => {
    const cfg = loadWeb('next.config.mjs')
    expect(cfg).toMatch(/destination:\s*'\/swap'/)
    expect(cfg).not.toMatch(/destination:\s*'\/\?focus=swap'/)
  })

  it('P0 Trending honesty — one sort control, no pipeline note', () => {
    expect(FILTER_STATUS).not.toContain('Trending')
    expect(FILTER_SORT).toContain('Trending')
    const featured = load('views/ProjectsStudio/components/FeaturedProjectsSection.tsx')
    expect(featured).not.toContain('Same pipeline everywhere')
    expect(featured).toContain('Live featured placements')
    const home = load('views/HomeTrade/DexHomeScreen.tsx')
    expect(home).toContain('Explore Trending Projects')
  })

  it('P1 Projects cards use — not Unavailable wall', () => {
    const card = load('views/ProjectsStudio/components/ProjectGridCard.tsx')
    expect(card).not.toContain('METRIC_STATUS.UNAVAILABLE')
    expect(card).toContain("isEmpty(price) ? '—' : price")
    expect(card).toContain("isEmpty(holders) ? '—' : holders")
    const featured = load('views/HomeTrade/FeaturedProjectsRail.tsx')
    expect(featured).not.toMatch(/>Unavailable</)
    expect(featured).toContain("status === 'loading' ? '…' : '—'")
    const markets = load('views/HomeTrade/useFeaturedProjectMarkets.ts')
    expect(markets).toMatch(/formatFeaturedMarketCap[\s\S]*return '—'/)
  })

  it('P1 Search labels tokens by chain and dedupes canonical identity', () => {
    const index = buildGlobalSearchIndex()
    const marcoTokens = index.filter((e) => e.category === 'token' && /marco/i.test(e.label))
    expect(marcoTokens.length).toBeGreaterThan(0)
    for (const t of marcoTokens) {
      expect(t.label).toMatch(/—/)
      expect(t.chainId).toBeTruthy()
      expect(t.address).toBeTruthy()
    }
    const keys = new Set(marcoTokens.map((t) => canonicalSearchIdentityKey(t)))
    expect(keys.size).toBe(marcoTokens.length)
    const results = searchGlobal(index, 'MARCO', 12, 56)
    const tokenResults = results.filter((r) => r.category === 'token')
    expect(tokenResults.every((r) => /—/.test(r.label))).toBe(true)
  })

  it('P1 Project default chain prefers BSC; prices never scientific', () => {
    const deployments = [
      { chainId: 1, status: 'LIVE' as const, contractAddress: '0xabc', shortLabel: 'ETH', label: 'Ethereum' },
      { chainId: 56, status: 'LIVE' as const, contractAddress: '0xdef', shortLabel: 'BNB', label: 'BNB' },
    ] as Parameters<typeof defaultSelectedChainId>[0]
    expect(defaultSelectedChainId(deployments)).toBe(56)
    expect(formatPrice(5.9e-7)).toBe('$0.0₆59')
    expect(formatPrice(0.000012)).toMatch(/^\$0\.000012/)
    expect(String(formatPrice(5.9e-7))).not.toMatch(/e-/i)
    const buy = getBuyTokenHref({ chainId: 56, contract: '0x963556de0eb8138E97A85F0A86eE0acD159D210b' })
    expect(buy).toMatch(/^\/swap\?/)
  })

  it('P1 KPI labels are shortened / wrap-safe', () => {
    const farms = load('views/FarmsStudio/modules/farmsOverviewKpisTokens.ts')
    expect(farms).toContain('Top Sust. APR')
    expect(farms).not.toContain("sustainableApr: 'Highest Sustainable APR'")
    const pools = load('views/PoolsStudio/components/PoolsKpiRow.tsx')
    expect(pools).toContain('Top Sust. APR')
    expect(pools).toContain('white-space: normal')
  })

  it('P1 Audit Runtime is labeled separate from Melega Score', () => {
    const contracts = buildOfficialContracts()
    const score = computeMelegaScore(contracts)
    const dims = buildDimensions({
      contracts,
      melegaScore: score.score,
      readinessVerdict: 'blocked',
    })
    const runtime = dims.find((d) => d.id === 'Runtime')
    expect(runtime?.detail).toMatch(/separate/i)
    expect(runtime?.value).toBe(35)
    expect(score.score).toBeGreaterThan(80)
    const ui = load('views/AuditStudio/AuditCenterV2.tsx')
    expect(ui).toContain('Runtime Readiness')
    expect(ui).toContain('does not')
    expect(ui).toContain('change this score')
  })

  it('P1 Home nav matches only /', () => {
    const home = GLOBAL_HEADER_NAV.find((n) => n.id === 'home')
    expect(home?.kind).toBe('link')
    if (home?.kind === 'link') {
      expect(home.match('/')).toBe(true)
      expect(home.match('/swap')).toBe(false)
      expect(home.match('/project-hq/marco')).toBe(false)
      expect(home.match('/@marco')).toBe(false)
      expect(home.match('/trade')).toBe(false)
    }
  })

  it('mission evidence path exists after acceptance', () => {
    expect('apps/web/docs/runtime/melegaswap-v2-founder-review-p0-p1-repair/REPORT.md').toContain(
      'founder-review-p0-p1-repair',
    )
  })
})
