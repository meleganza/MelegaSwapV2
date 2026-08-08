/**
 * MELEGASWAP_V2_PROJECT_PAGE_V5_PIXEL_PERFECT_REBUILD — structural + perf contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_PROJECT_PAGE_V5_PIXEL_PERFECT', () => {
  const shell = load('views/ProjectPage/v5/ProjectPageV5Shell.tsx')
  const page = load('pages/project-hq/[slug].tsx')
  const charts = load('views/ProjectPage/v1/ProjectCharts.tsx')
  const embed = load('views/ProjectPage/v1/ProjectTradingEmbed.tsx')
  const island = load('views/ProjectPage/v1/ProjectSwapFormIsland.tsx')
  const rail = load('views/HomeTrade/FeaturedProjectsRail.tsx')
  const perf = load('views/ProjectPage/v5/projectPagePerf.ts')
  const market = load('views/ProjectPage/v1/useProjectLiveMarket.ts')

  it('project V5 shell retained; public mount is V6', () => {
    expect(page).toContain('ProjectPageV6Shell')
    expect(page).toContain("from 'views/ProjectPage/v6/ProjectPageV6Shell'")
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v5/index.ts'))).toBe(true)
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v6/index.ts'))).toBe(true)
    expect(shell).toContain('data-testid="project-page-v5"')
    expect(shell).toContain('data-project-page="v5"')
  })

  it('no public duplicate modules in primary flow', () => {
    // Single hero buy / claim / chart / swap / market / economy / boost / about / transparency / related
    expect(shell.match(/data-testid="project-v5-buy"/g)?.length).toBe(1)
    expect(shell.match(/data-testid="project-v5-chart"/g)?.length).toBe(1)
    expect(shell.match(/data-testid="project-v5-swap"/g)?.length).toBe(1)
    expect(shell.match(/data-testid="project-v5-market"/g)?.length).toBe(1)
    expect(shell.match(/data-testid="project-v5-economy"/g)?.length).toBe(1)
    expect(shell.match(/data-testid="project-v5-boost"/g)?.length).toBe(1)
    expect(shell.match(/Boost Your Project/g)?.length).toBe(1)
    expect(shell).not.toContain('FeaturedProjectsSection')
    expect(shell).not.toContain('project-v4-actions')
    expect(shell).not.toContain('Marketing History')
    expect(shell).not.toContain('Machine Interface')
    expect(shell).not.toContain('project-v4-dev-stack')
  })

  it('hero Smart Swap exists inside integrated workspace with Chart', () => {
    expect(shell).toContain('project-v5-trade-workspace')
    expect(shell).toContain('project-v5-chart')
    expect(shell).toContain('project-v5-swap')
    expect(shell).toContain('ProjectTradingEmbed')
    expect(shell).toContain('ProjectCharts')
    expect(shell).toContain("variant=\"hero\"")
    expect(shell).toContain('dynamic(() => import(')
    // Chart not a separate giant band below hero
    expect(shell).not.toContain('data-project-section="charts"')
  })

  it('Chart is inside hero with compact empty state (V6 reclaim)', () => {
    expect(charts).toContain('data-chart-variant="hero"')
    expect(charts).toContain('No chart history')
    expect(charts).toContain('project-v5-chart-placeholder')
    expect(charts).toContain('data-chart-empty="compact"')
    expect(charts).not.toContain('height: 320px')
  })

  it('market strip compact — max 8 metrics, dash honesty', () => {
    expect(shell).toContain('project-v5-market')
    for (const label of ['Price', '24h', 'Liquidity', 'Volume 24h', 'Market Cap', 'FDV', 'Holders', 'Transactions']) {
      expect(shell).toContain(`'${label}'`)
    }
    expect(shell).not.toContain("'Last update'")
    expect(shell).toContain('truthDash')
    expect(shell).not.toContain('Source not configured')
    expect(shell).not.toMatch(/['"]Unavailable['"]/)
  })

  it('economy exactly three primary cards', () => {
    expect(shell).toContain('project-v5-economy-liquidity')
    expect(shell).toContain('project-v5-economy-farms')
    expect(shell).toContain('project-v5-economy-pools')
    expect(shell).toContain('View Liquidity')
    expect(shell).toContain('View Farms')
    expect(shell).toContain('View Pools')
    expect(shell.match(/data-testid="project-v5-economy-liquidity"/g)?.length).toBe(1)
    expect(shell.match(/data-testid="project-v5-economy-farms"/g)?.length).toBe(1)
    expect(shell.match(/data-testid="project-v5-economy-pools"/g)?.length).toBe(1)
  })

  it('commercial CTAs wired to checkout / claim', () => {
    expect(shell).toContain('CommercialCheckoutModal')
    expect(shell).toContain('ClaimProjectWizardModal')
    expect(shell).toContain('data-testid={`project-v5-boost-${tile.id}`}')
    expect(shell).toContain('data-growth-service={tile.id}')
    expect(shell).toContain('COMMERCIAL_SERVICES')
    expect(shell).toContain('openBoost(tile.id)')
    expect(shell).toContain("service === 'claim-project'")
    expect(shell).not.toContain('window.location.href = meta.externalHref')
  })

  it('claimed/unclaimed states', () => {
    expect(shell).toContain('isClaimed')
    expect(shell).toContain('Official Project Page')
    expect(shell).toContain('project-v5-claim-strip')
    expect(shell).toContain('Are you the project owner?')
  })

  it('transparency collapsed by default', () => {
    expect(shell).toContain('project-v5-transparency')
    expect(shell).toContain('<Accordion')
    expect(shell).toContain('Technical Transparency')
    expect(shell).toContain('Expand')
  })

  it('related rail capped at 4', () => {
    expect(shell).toContain('project-v5-related')
    expect(shell).toContain('.slice(0, 4)')
    expect(shell).toContain('Discover other projects')
  })

  it('progressive loading — shell first, defer holders/chart/swap/below-fold', () => {
    expect(shell).toContain('markProjectShellRender')
    expect(shell).toContain('tradeReady')
    expect(shell).toContain('belowFold')
    expect(shell).toContain('afterFirstPaint')
    expect(shell).toContain('deferHoldersMs: 1500')
    expect(market).toContain('deferHoldersMs')
    expect(shell).not.toContain('countNormalizedFarmsByChain')
  })

  it('canonical project chain + slim pageProps', () => {
    expect(page).toContain('marketsDocument')
    expect(page).toContain('participationDocument')
    expect(page).toContain('revalidate: 120')
    expect(page).not.toContain('buildProjectMachineDocument')
    expect(page).not.toContain('buildProjectDeveloperDocument')
    expect(shell).toContain('projectChainId={chainId}')
  })

  it('no public technical jargon / no Treasury address', () => {
    expect(shell).not.toContain('Treasury')
    expect(shell).not.toContain('HANDOFF')
    expect(shell).not.toContain('execution intent')
    expect(shell).not.toContain('Machine Interface')
    expect(shell).not.toContain('Developer')
    expect(shell).not.toContain('data-testid="project-v4-developer"')
    expect(embed).toContain('ProjectSwapFormIsland')
    expect(island).toContain('SmartSwapForm')
    expect(embed).not.toMatch(/import \{ SmartSwapForm \}/)
  })

  it('mobile ordering + sticky buy', () => {
    expect(shell).toContain('project-v5-sticky-buy')
    expect(shell).toContain('@media (min-width: 768px)')
    expect(shell).toContain('display: none')
  })

  it('View Project client navigation uses /@slug + prefetch false + perf mark', () => {
    expect(rail).toContain('href={`/@${p.slug}`}')
    expect(rail).toContain('prefetch={false}')
    expect(rail).toContain('markProjectNavClick')
    expect(rail).toContain('/swap?')
  })

  it('Trade client navigation remains real Swap shell', () => {
    expect(rail).toContain("source: 'featured-home'")
    expect(rail).toContain('router.push(href)')
  })

  it('navigation performance guard helpers', () => {
    expect(perf).toContain('PROJECT_PAGE_ROUTE_BUDGET_MS = 1000')
    expect(perf).toContain('PROJECT_PAGE_HERO_BUDGET_MS = 2000')
    expect(perf).toContain('markProjectNavClick')
    expect(perf).toContain('markProjectShellRender')
    expect(perf).toContain('markProjectMarketHydrated')
    expect(perf).toContain('markProjectChartReady')
    expect(perf).toContain('markProjectSwapReady')
  })

  it('hero CTAs are Buy / Add Wallet / Claim — not Trade/Farm/Pool giants', () => {
    expect(shell).toContain('Buy Token')
    expect(shell).toContain('Claim Project')
    expect(shell).toContain('AddToWalletButton')
    expect(shell).not.toContain('project-v4-trade')
    expect(shell).not.toContain('project-v4-farm')
  })

  it('Data Truth pipeline tagged', () => {
    expect(shell).toContain('GLOBAL_DATA_TRUTH_PIPELINE')
    expect(shell).toContain('data-truth-pipeline=')
  })
})
