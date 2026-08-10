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
      'project-v7-hero',
      'project-v7-market',
      'project-v7-economy',
      'project-v7-intel',
      'project-v7-boost',
      'project-v7-community-react',
      'project-v7-about',
      'project-v7-related',
    ]
    let last = -1
    for (const id of order) {
      const idx = shell.indexOf(id)
      expect(idx).toBeGreaterThan(last)
      last = idx
    }
  })

  it('hero is 40/60 with Smart Swap CTA and no Buy Token', () => {
    expect(shell).toContain('0.4fr')
    expect(shell).toContain('0.6fr')
    expect(shell).not.toContain('0.34fr')
    expect(shell).toContain('project-v7-smart-swap-cta')
    expect(shell).toContain('project-v7-claim-cta')
    expect(shell).not.toContain('Buy Token')
    expect(shell).not.toContain('Technical Transparency')
    expect(shell).not.toContain('Machine Interface')
  })

  it('related projects reuse ProjectCard V3', () => {
    expect(shell).toContain('ProjectCard')
    expect(shell).toContain("from 'views/ProjectsStudio/components/ProjectGridCard'")
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
    const matched = farms.filter(
      (f) => f.token0Address === addr || f.token1Address === addr || f.lpAddress === addr,
    )
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
