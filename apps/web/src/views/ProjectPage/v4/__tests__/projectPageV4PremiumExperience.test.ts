/**
 * MELEGASWAP_V2_PROJECT_PAGE_V4_PREMIUM_EXPERIENCE — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_PROJECT_PAGE_V4_PREMIUM_EXPERIENCE', () => {
  const shell = load('views/ProjectPage/v4/ProjectPageV4Shell.tsx')
  const charts = load('views/ProjectPage/v1/ProjectCharts.tsx')
  const page = load('pages/project-hq/[slug].tsx')
  const theme = load('views/ProjectPage/v1/theme.ts')

  it('V4 shell retained; project-hq mounts V5', () => {
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v4/index.ts'))).toBe(true)
    expect(page).toContain('ProjectPageV5Shell')
    expect(page).toContain("from 'views/ProjectPage/v5/ProjectPageV5Shell'")
  })

  it('hero is 40/60 identity | chart+swap with Buy Token + Claim Project', () => {
    expect(shell).toContain('project-v4-hero')
    expect(shell).toContain('project-v4-hero-left')
    expect(shell).toContain('project-v4-hero-right')
    expect(shell).toContain('grid-template-columns: minmax(0, 0.4fr) minmax(0, 0.6fr)')
    expect(shell).toContain('Buy Token')
    expect(shell).toContain('Claim Project')
    expect(shell).toContain('ProjectCharts')
    expect(shell).toContain('ProjectTradingEmbed')
    expect(shell).toContain('project-v4-swap')
    expect(shell).toContain('project-v4-chart')
  })

  it('chart lives in hero only — no separate Chart band title in hero variant', () => {
    expect(charts).toContain("data-chart-variant=\"hero\"")
    expect(charts).toContain('project-v5-chart-placeholder')
    expect(charts).toContain('max-height: 260px')
    // hero branch must not render a standalone Chart band title
    const heroIdx = charts.indexOf('if (hero)')
    const fullIdx = charts.indexOf("data-testid=\"project-v1-charts\"")
    expect(heroIdx).toBeGreaterThan(-1)
    expect(fullIdx).toBeGreaterThan(heroIdx)
    const heroBlock = charts.slice(heroIdx, fullIdx)
    expect(heroBlock).not.toContain('<BandTitle>Chart</BandTitle>')
  })

  it('market strip is dense and complete', () => {
    for (const label of [
      'Price',
      '24h',
      'Volume',
      'Liquidity',
      'Market Cap',
      'FDV',
      'Holders',
      'Transactions',
      'Last update',
    ]) {
      expect(shell).toContain(`'${label}'`)
    }
    expect(shell).toContain('project-v4-market')
  })

  it('Project Economy has Liquidity / Farms / Pools with factual dashes', () => {
    expect(shell).toContain('project-v4-economy-liquidity')
    expect(shell).toContain('project-v4-economy-farm')
    expect(shell).toContain('project-v4-economy-pool')
    expect(shell).toContain('Largest ·')
    expect(shell).toContain('<MiniSpark values={[]} />')
  })

  it('Growth Hub opens CommercialCheckoutModal / Claim wizard — no external skip', () => {
    expect(shell).toContain('Boost Your Project')
    expect(shell).toContain('project-v4-grow-featured')
    expect(shell).toContain('project-v4-grow-trend')
    expect(shell).toContain('project-v4-grow-liquidity')
    expect(shell).toContain('project-v4-grow-farm')
    expect(shell).toContain('project-v4-grow-pool')
    expect(shell).toContain('project-v4-grow-claim')
    expect(shell).toContain('CommercialCheckoutModal')
    expect(shell).toContain('ClaimProjectWizardModal')
    expect(shell).not.toContain('meta?.externalHref')
    expect(shell).not.toContain('window.location.href = meta.externalHref')
  })

  it('Claim card is compact; About is compact; developer stack is closed accordions', () => {
    expect(shell).toContain('Claim this project')
    expect(shell).toContain('Wallet verification')
    expect(shell).toContain('project-v4-about')
    expect(shell).toContain('AboutCompact')
    expect(shell).toContain('project-v4-developer')
    expect(shell).toContain('project-v4-machine')
    expect(shell).toContain('project-v4-evidence')
    expect(shell).toContain('project-v4-transparency')
    expect(shell).toContain('<Accordion')
    expect(shell).not.toMatch(/ProjectDeveloperSection|ProjectMachineSection/)
  })

  it('spacing is densified ~30%', () => {
    expect(theme).toContain('padding: 6px 8px 36px')
    expect(theme).toContain('padding: 7px 10px 6px')
    expect(shell).toContain('padding: 7px 10px')
  })

  it('does not import Smart Swap engine internals', () => {
    expect(shell).not.toMatch(/views\/Swap\/SmartSwap/)
  })
})
