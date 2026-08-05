import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const VIEWS = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(VIEWS, rel), 'utf8')
}

describe('Project Page V2 — conversion audit', () => {
  const shell = load('ProjectPage/v2/ProjectPageV2Shell.tsx')
  const charts = load('ProjectPage/v1/ProjectCharts.tsx')
  const market = load('ProjectPage/v1/useProjectLiveMarket.ts')
  const list = load('ListStudio/ListWorkspace.tsx')
  const featuredSection = load('ProjectsStudio/components/FeaturedProjectsSection.tsx')
  const featuredRail = load('HomeTrade/FeaturedProjectsRail.tsx')

  it('hero keeps logo / name / symbol / chain / verified / socials / actions', () => {
    expect(shell).toContain('project-v2-hero')
    expect(shell).toContain('MelegaTokenAvatar')
    expect(shell).toContain('MelegaExploreChainBadge')
    expect(shell).toContain('Buy Token')
    expect(shell).toContain('Claim Project')
    expect(shell).toContain('project-v2-website')
    expect(shell).toContain('Website')
    expect(shell).toContain("'X'")
    expect(shell).toContain('Telegram')
  })

  it('hero right column is Smart Swap + compact chart', () => {
    expect(shell).toContain('ProjectTradingEmbed')
    expect(shell).toContain('variant="compact"')
    expect(shell).toContain('project-v2-chart')
  })

  it('market strip covers Price / 24H / Volume / Liquidity / Market Cap / Holders', () => {
    for (const label of ['Price', '24H', 'Volume', 'Liquidity', 'Market Cap', 'Holders']) {
      expect(shell).toContain(`label="${label}"`)
    }
  })

  it('live market prefers USD and never invents holders', () => {
    expect(market).toContain('formatFeaturedPrice')
    expect(market).toContain('formatFeaturedLiquidity')
    expect(market).toContain('useHolderCount')
    expect(market).toContain("'Unavailable'")
  })

  it('compact chart shows Unavailable instead of empty boxes', () => {
    expect(charts).toContain('project-v2-chart-unavailable')
    expect(charts).toContain('Unavailable')
    expect(charts).toContain("variant === 'compact'")
  })

  it('economy cards expose factual fields only', () => {
    expect(shell).toContain('TVL · {market.liquidity}')
    expect(shell).toContain('Volume · {market.volume24h}')
    expect(shell).toContain('Pools · {poolsCount}')
    expect(shell).toContain('APR · Unavailable')
    expect(shell).toContain('Rewards · Unavailable')
  })

  it('Grow CTAs complete to checkout / liquidity create / farm create', () => {
    expect(shell).toContain('#featured')
    expect(shell).toContain('#trend-boost')
    expect(shell).toContain('/liquidity-studio?view=add')
    expect(shell).toContain('/farms?create=1')
  })

  it('List claim workspace anchors Featured + Trend Boost and passes slug', () => {
    expect(list).toContain('id="featured"')
    expect(list).toContain('id="trend-boost"')
    expect(list).toContain('scrollIntoView')
    expect(list).toContain('projectSlug={claimSlug}')
    expect(list).toContain('router.query.slug')
  })

  it('directory Featured reuses Home FeaturedProjectsRail', () => {
    expect(featuredSection).toContain('FeaturedProjectsRail')
    expect(featuredSection).not.toContain('resolveFounderFeaturedProjects')
    expect(featuredRail).toContain('FeaturedMiniSpark')
    expect(featuredRail).toContain('useIndexerCandles')
  })

  it('claim card explains ownership verify + manage surfaces', () => {
    expect(shell).toContain('Claim ownership')
    expect(shell).toContain('verify the controlling wallet')
    expect(shell).toContain('Logo')
    expect(shell).toContain('Socials')
    expect(shell).toContain('Description')
    expect(shell).toContain('Official links')
  })
})
