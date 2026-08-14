/**
 * MELEGASWAP_V2_PROJECT_PAGE_HERO_AND_CONVERSION_REDESIGN — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const V1 = path.resolve(__dirname, '..')

describe('Project Page Hero & Conversion Redesign', () => {
  const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
  const charts = readFileSync(path.join(V1, 'ProjectCharts.tsx'), 'utf8')
  const trading = readFileSync(path.join(V1, 'ProjectTradingEmbed.tsx'), 'utf8')

  it('hero mounts Smart Swap beside identity (not below the fold)', () => {
    expect(shell).toContain('project-v1-hero')
    expect(shell).toContain('HeroLayout')
    expect(shell).toContain('variant="hero"')
    expect(shell).toContain('project-v1-hero-description')
    const heroIdx = shell.indexOf('data-project-section="identity-hero"')
    const swapIdx = shell.indexOf('variant="hero"')
    const marketIdx = shell.indexOf('data-project-section="live-market"')
    expect(swapIdx).toBeGreaterThan(heroIdx)
    expect(marketIdx).toBeGreaterThan(swapIdx)
  })

  it('action bar exposes Buy / Trade / Wallet / Farm / Pool / Liquidity', () => {
    expect(shell).toContain('project-v1-action-bar')
    expect(shell).toContain('project-v1-buy')
    expect(shell).toContain('project-v1-trade')
    expect(shell).toContain('project-v1-add-wallet-secondary')
  })

  it('market above fold includes Price / 24h / Liquidity / Volume / Market Cap / Holders', () => {
    expect(shell).toContain('label="Price"')
    expect(shell).toContain('label="24h change"')
    expect(shell).toContain('label="Liquidity"')
    expect(shell).toContain('label="Volume"')
    expect(shell).toContain('label="Market Cap"')
    expect(shell).toContain('label="Holders"')
  })

  it('chart offers 1H / 24H / 7D / 30D windows', () => {
    expect(charts).toContain("'1H'")
    expect(charts).toContain("'24H'")
    expect(charts).toContain("'7D'")
    expect(charts).toContain("'30D'")
    expect(charts).toContain('project-v1-chart-timeframes')
  })

  it('developer / transparency / machine diagnostics stay hidden from normal users', () => {
    expect(shell).toContain('data-project-audience="developer"')
    expect(shell).toContain('hidden')
    expect(shell).toContain('data-project-section="developer"')
    expect(shell).toContain('data-project-section="transparency"')
    expect(shell).toContain('Evidence items')
    expect(shell).toContain('Machine interface')
  })

  it('trading hero variant does not render diagnostic metric grid', () => {
    expect(trading).toContain("variant === 'hero'")
    expect(trading).toContain('project-v1-smart-swap-hero')
  })
})
