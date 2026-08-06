/**
 * MELEGASWAP_V2_PROJECT_PAGE_V3_PREMIUM_CONVERSION — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_PROJECT_PAGE_V3_PREMIUM_CONVERSION', () => {
  const shell = load('views/ProjectPage/v3/ProjectPageV3Shell.tsx')
  const charts = load('views/ProjectPage/v1/ProjectCharts.tsx')
  const page = load('pages/project-hq/[slug].tsx')
  const theme = load('views/ProjectPage/v1/theme.ts')

  it('project-hq mounts V4 shell (V3 retained in tree)', () => {
    expect(page).toContain('ProjectPageV4Shell')
    expect(page).toContain("from 'views/ProjectPage/v4/ProjectPageV4Shell'")
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v3/index.ts'))).toBe(true)
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v3/ProjectPageV3Shell.tsx'))).toBe(true)
  })

  it('hero is 40/60 identity | chart+swap with hero chart variant', () => {
    expect(shell).toContain('project-v3-hero')
    expect(shell).toContain('project-v3-hero-left')
    expect(shell).toContain('project-v3-hero-right')
    expect(shell).toContain('grid-template-columns: minmax(0, 0.4fr) minmax(0, 0.6fr)')
    expect(shell).toContain('variant="hero"')
    expect(shell).toContain('ProjectCharts')
    expect(shell).toContain('ProjectTradingEmbed')
    expect(shell).toContain('project-v3-swap')
    expect(shell).toContain('id="project-v3-swap"')
  })

  it('charts expose hero + ALL timeframe + elegant placeholder', () => {
    expect(charts).toContain("'full' | 'compact' | 'hero'")
    expect(charts).toContain("id: 'ALL'")
    expect(charts).toContain('ElegantPlaceholder')
    expect(charts).toContain('useIndexerCandles')
    expect(charts).toContain('TradeChartPanel')
    expect(charts).toContain('project-v4-chart-placeholder')
    expect(charts).toContain('project-v4-chart-panel')
  })

  it('market strip labels are dense and complete', () => {
    for (const label of [
      'Price',
      '24H',
      'Liquidity',
      'Volume',
      'Market Cap',
      'FDV',
      'Holders',
      'Age',
      'Chain',
      'Updated',
    ]) {
      expect(shell).toContain(`'${label}'`)
    }
    expect(shell).toContain('project-v3-market')
  })

  it('action bar owns conversion CTAs', () => {
    expect(shell).toContain('project-v3-actions')
    expect(shell).toContain('project-v3-buy')
    expect(shell).toContain('project-v3-trade')
    expect(shell).toContain('AddToWalletButton')
    expect(shell).toContain('project-v3-liquidity')
    expect(shell).toContain('project-v3-farm')
    expect(shell).toContain('project-v3-pool')
    expect(shell).toContain('project-v3-claim-action')
    expect(shell).toContain('getBuyTokenHref')
    expect(shell).toContain('/liquidity-studio?view=add')
    expect(shell).toContain('/farms?create=1')
    expect(shell).toContain('/pools?create=1')
  })

  it('Project Economy has three cards with muted spark stubs (no fake series)', () => {
    expect(shell).toContain('project-v3-economy-liquidity')
    expect(shell).toContain('project-v3-economy-farm')
    expect(shell).toContain('project-v3-economy-pool')
    expect(shell).toContain('<MiniSpark values={[]} />')
    expect(shell).not.toMatch(/trendPositive[\s\S]*return \[[0-9]/)
  })

  it('Boost Your Project Growth Hub has six commercial cards', () => {
    expect(shell).toContain('Boost Your Project')
    expect(shell).toContain('Increase visibility. Grow liquidity. Acquire holders.')
    expect(shell).toContain('project-v3-grow-featured')
    expect(shell).toContain('project-v3-grow-trend')
    expect(shell).toContain('project-v3-grow-liquidity')
    expect(shell).toContain('project-v3-grow-farm')
    expect(shell).toContain('project-v3-grow-pool')
    expect(shell).toContain('project-v3-grow-claim')
    expect(shell).toContain('CommercialCheckoutModal')
    expect(shell).toContain('ClaimProjectWizardModal')
    expect(shell).toContain("getTrendBoostPackage('trend_6h')")
  })

  it('Claim is compact; About is conditional; Transparency is details drawer', () => {
    expect(shell).toContain('project-v3-claim')
    expect(shell).toContain('Claim this Project')
    expect(shell).toContain('hasAbout ?')
    expect(shell).toContain('project-v3-about')
    expect(shell).toContain('TransparencyDetails')
    expect(shell).toContain('project-v3-transparency')
    expect(shell).toContain('<summary>')
  })

  it('never renders Developer or Machine sections', () => {
    expect(shell).not.toContain('data-project-section="developer"')
    expect(shell).not.toContain('data-project-section="machine"')
    expect(shell).not.toMatch(/ProjectDeveloperSection|ProjectMachineSection/)
    expect(shell).not.toMatch(/views\/Swap\/SmartSwap/)
  })

  it('theme tokens are densified', () => {
    expect(theme).toContain('padding: 6px 8px 36px')
    expect(theme).toContain('padding: 7px 10px 6px')
  })
})
