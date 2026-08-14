/**
 * MELEGASWAP_V2_PROJECT_PAGE_V6_FOUNDER_PIXEL_PERFECT
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { listNormalizedFarms } from 'lib/data-truth/globalYieldInventory'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_PROJECT_PAGE_V6_FOUNDER_PIXEL_PERFECT', () => {
  const shell = load('views/ProjectPage/v6/ProjectPageV6Shell.tsx')
  const page = load('pages/project-hq/[slug].tsx')
  const economy = load('views/ProjectPage/v6/useProjectEconomyByToken.ts')
  const match = load('views/ProjectPage/v6/matchProjectYieldByToken.ts')
  const charts = load('views/ProjectPage/v1/ProjectCharts.tsx')
  const embed = load('views/ProjectPage/v1/ProjectTradingEmbed.tsx')

  it('mounts V6 shell from project-hq', () => {
    expect(page).toContain('ProjectPageV6Shell')
    expect(page).toContain("from 'views/ProjectPage/v6/ProjectPageV6Shell'")
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v6/index.ts'))).toBe(true)
    expect(shell).toContain('data-project-page="v6"')
    expect(shell).toContain('data-testid="project-page-v6"')
  })

  it('canonical hierarchy markers in order', () => {
    const order = [
      'project-v6-hero',
      'project-v6-market',
      'project-v6-economy',
      'project-v6-intel',
      'project-v6-boost',
      'project-v6-community-react',
      'project-v6-about',
      'project-v6-related',
    ]
    let last = -1
    for (const id of order) {
      const idx = shell.indexOf(id)
      expect(idx).toBeGreaterThan(last)
      last = idx
    }
  })

  it('removes Technical Transparency, Buy Token CTA, sticky buy', () => {
    expect(shell).not.toContain('Technical Transparency')
    expect(shell).not.toContain('Buy Token')
    expect(shell).not.toContain('sticky-buy')
    expect(shell).not.toContain('Pipeline ·')
    expect(shell).not.toContain('Markets registered')
  })

  it('hero has identity + integrated terminal (chart + swap)', () => {
    expect(shell).toContain('project-v6-terminal')
    expect(shell).toContain('project-v6-chart')
    expect(shell).toContain('project-v6-swap')
    expect(shell).toContain('0.34fr')
    expect(shell).toContain('0.66fr')
    expect(shell).toContain('project-v6-contract')
    expect(shell).not.toContain('project-v6-buy')
  })

  it('chart reclaim + compact empty state', () => {
    expect(charts).toContain('onHistoryAvailability')
    expect(charts).toContain('data-chart-empty="compact"')
    expect(charts).toContain('No chart history')
    expect(shell).toContain('onHistoryAvailability={setChartHistory}')
    expect(shell).toContain('$chartless')
  })

  it('Smart Swap hero hides nested title chrome', () => {
    expect(embed).toContain('VisuallyHiddenTitle')
    expect(embed).toContain("hero ? (")
  })

  it('economy matches by chainId + token address', () => {
    expect(match).toContain('listNormalizedFarms')
    expect(match).toContain('matchFarmsByToken')
    expect(match).toContain('matchPoolsByToken')
    expect(economy).toContain('resolveFarmAprPercent')
    expect(economy).toContain('resolvePoolTvlUsd')
    expect(economy).not.toContain('getVenuesByProjectSlug')
    expect(match).not.toContain('getVenuesByProjectSlug')
  })

  it('farm inventory can be filtered by chainId + token address (no slug)', () => {
    const farms = listNormalizedFarms().filter((f) => f.chainId === 56)
    expect(farms.length).toBeGreaterThan(0)
    const sample = farms[0]
    const addr = normalizeEvmAddress(sample.token0Address)
    const matched = farms.filter(
      (f) => f.token0Address === addr || f.token1Address === addr || f.lpAddress === addr,
    )
    expect(matched.length).toBeGreaterThan(0)
    expect(match).toContain('normalizeEvmAddress')
    expect(match).toContain('livePools56')
  })

  it('boost console + commercial modals preserved', () => {
    expect(shell).toContain('CommercialCheckoutModal')
    expect(shell).toContain('ClaimProjectWizardModal')
    expect(shell).toContain('project-v6-boost-console')
    expect(shell).toContain('openBoost(tile.id)')
    expect(shell).toContain('featured')
    expect(shell).toContain('trend-boost')
  })

  it('community reactions report missing persistence', () => {
    expect(shell).toContain('persistence unavailable')
    expect(shell).toContain('project-v6-react-${id}')
    expect(shell).toContain("['like', '👍 Like']")
  })

  it('progressive below-fold + no full-page spinner', () => {
    expect(shell).toContain('afterFirstPaint')
    expect(shell).toContain('belowFold')
    expect(shell).not.toContain('FullPageSpinner')
    expect(shell).toContain('dynamic(() => import(')
  })
})
