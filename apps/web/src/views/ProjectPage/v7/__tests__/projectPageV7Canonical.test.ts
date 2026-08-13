/**
 * MELEGASWAP_V2_CANONICAL_PROJECT_PAGE_V7
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  canonicalTokenPath,
  resolveCanonicalProjectHref,
  chainIdFromPath,
  chainPathForId,
} from 'lib/projects/canonicalProjectHref'
import { listNormalizedFarms } from 'lib/data-truth/globalYieldInventory'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'
import { buildGlobalSearchIndex } from 'lib/global-search/buildGlobalSearchIndex'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_CANONICAL_PROJECT_PAGE_V7', () => {
  const shell = load('views/ProjectPage/v7/ProjectPageV7Shell.tsx')
  const page = load('pages/project-hq/[slug].tsx')
  const tokenPage = load('pages/token/[chain]/[address].tsx')
  const hrefHelper = load('lib/projects/canonicalProjectHref.ts')

  it('mounts V7 shell from project-hq and token route', () => {
    expect(page).toContain('ProjectPageV7Shell')
    expect(page).toContain("from 'views/ProjectPage/v7/ProjectPageV7Shell'")
    expect(tokenPage).toContain('mode="unclaimed"')
    expect(tokenPage).toContain('resolveClaimedSlugForToken')
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v7/index.ts'))).toBe(true)
    expect(shell).toContain('data-project-page="v7"')
    expect(shell).toContain('data-testid="project-page-v7"')
  })

  it('canonical hierarchy markers in order', () => {
    const order = [
      'data-testid="project-v7-hero"',
      'data-testid="project-v7-about"',
      'data-testid="project-v7-community-react"',
      'data-testid="project-v7-market"',
      'data-testid="project-v7-economy"',
      'data-testid="project-v7-intel"',
      'data-testid="project-v7-boost"',
      'data-testid="project-v7-related"',
    ]
    let last = -1
    for (const id of order) {
      const idx = shell.indexOf(id)
      expect(idx).toBeGreaterThan(last)
      last = idx
    }
  })

  it('uses a dense verified hero followed immediately by chart and canonical Smart Swap', () => {
    expect(shell).toContain('1.28fr')
    expect(shell).toContain('0.72fr')
    expect(shell).toContain('project-v7-market-first-workspace')
    expect(shell).not.toContain('project-v7-smart-swap-cta')
    expect(shell).toContain('project-v7-claim-cta')
    expect(shell).toContain('project-v7-verified')
    expect(shell).toContain('project-v7-handle')
    expect(shell).not.toContain('project-v7-nav')
    expect(shell).not.toContain('Official project')
    expect(shell).not.toContain('Buy Token')
    expect(shell).not.toContain('Technical Transparency')
    expect(shell).not.toContain('Machine Interface')
    expect(shell).not.toContain('Trust & Verification')
    expect(shell).not.toContain('Due Diligence')
    expect(shell).not.toContain('Trade {symbol')
    expect(shell).toContain('project-v7-attestation-${item.id}')
  })

  it('keeps indexed analytics inside the chart workspace without a duplicate market band', () => {
    expect(shell).toContain('<MarketStrip data-testid="project-v7-market"')
    expect(shell).toContain('project-v7-multi-dex')
    expect(shell).toContain('dexMarket?.liquidityUsd')
    expect(shell).not.toContain('All DEX Markets')
    expect(shell).not.toContain('Loading multi-DEX markets')
    expect(shell).not.toContain('<strong>⚡ Smart Swap</strong>')
  })

  it('related projects remain compact and do not render unavailable market metrics', () => {
    expect(shell).toContain('RelatedCard')
    expect(shell).toContain('Indexed project')
    expect(shell).not.toContain('ProjectCard project={card}')
    expect(shell).not.toContain("from 'views/ProjectsStudio/components/ProjectGridCard'")
    expect(shell).toContain('project-v7-related-grid')
  })

  it('resolveCanonicalProjectHref routes claimed vs unclaimed', () => {
    const marco = resolveCanonicalProjectHref({
      slug: 'marco',
      chainId: 56,
      address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    })
    expect(marco).toMatch(/^\/@marco\/?/)

    const anonymous = resolveCanonicalProjectHref({
      chainId: 56,
      address: '0x00000000000000000000000000000000000000aa',
    })
    expect(anonymous).toBe(canonicalTokenPath(56, '0x00000000000000000000000000000000000000aa'))
    expect(anonymous).toMatch(/^\/token\/bsc\/0x/)
    expect(chainIdFromPath('bsc')).toBe(56)
    expect(chainPathForId(8453)).toBe('base')
    expect(hrefHelper).toContain('Never invents')
  })

  it('economy matchers filter by chainId + token address', () => {
    const farms = listNormalizedFarms().filter((f) => f.chainId === 56)
    expect(farms.length).toBeGreaterThan(0)
    const sample = farms[0]
    const addr = normalizeEvmAddress(sample.token0Address)
    expect(addr).toBeTruthy()
    const matched = farms.filter((f) => f.token0Address === addr || f.token1Address === addr || f.lpAddress === addr)
    expect(matched.length).toBeGreaterThan(0)
    const matchSrc = load('views/ProjectPage/v7/matchProjectYieldByToken.ts')
    expect(matchSrc).toContain('normalizeEvmAddress')
    expect(matchSrc).toContain('matchFarmsByToken')
    expect(matchSrc).toContain('matchPoolsByToken')
    expect(matchSrc).not.toContain('getVenuesByProjectSlug')
  })

  it('entry points open canonical project pages; Trade stays /swap', () => {
    const featured = load('views/HomeTrade/FeaturedProjectsRail.tsx')
    expect(featured).toContain('href={p.href}')
    expect(featured).toContain('`/swap?${q.toString()}`')

    const search = load('lib/global-search/buildGlobalSearchIndex.ts')
    expect(search).toContain('resolveCanonicalProjectHref')
    expect(search).not.toMatch(/href = `\/swap\?outputCurrency=\$\{token\.address\}`/)

    const index = buildGlobalSearchIndex()
    const marcoToken = index.find(
      (e) => e.category === 'token' && e.label.toUpperCase().includes('MARCO') && e.chainId === 56,
    )
    expect(marcoToken?.href).toMatch(/^\/@/)
    const tradeAction = marcoToken?.actions?.find((a) => a.label === 'Trade')
    expect(tradeAction?.href).toMatch(/^\/swap\?/)
  })

  it('progressive below-fold + no full-page spinner', () => {
    expect(shell).toContain('afterFirstPaint')
    expect(shell).toContain('belowFold')
    expect(shell).not.toContain('FullPageSpinner')
    expect(shell).toContain("data-project-mode={isUnclaimed ? 'unclaimed' : 'claimed'}")
  })
})
