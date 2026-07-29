/**
 * MELEGA_DEX_V1_PROJECT_PAGE_ZERO_REBUILD — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

const V1 = path.resolve(__dirname, '..')
const ARCHIVED = path.resolve(__dirname, '../../_archived_wave04_consumer')
const HQ = path.resolve(__dirname, '../../../../pages/project-hq/[slug].tsx')

describe('Project Page Zero Rebuild V1', () => {
  it('archives prior consumer and mounts v1 shell from project-hq', () => {
    expect(existsSync(path.join(ARCHIVED, 'consumer/ProjectConsumerShell.tsx'))).toBe(true)
    expect(existsSync(path.join(V1, 'ProjectPageV1Shell.tsx'))).toBe(true)
    const page = readFileSync(HQ, 'utf8')
    expect(page).toContain('ProjectPageV1Shell')
    expect(page).not.toContain('ProjectConsumerShell')
    expect(page).not.toMatch(/views\/ProjectPage\/consumer/)
  })

  it('is one long page with no tabs or anchor navigation', () => {
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    const trading = readFileSync(path.join(V1, 'ProjectTradingEmbed.tsx'), 'utf8')
    const charts = readFileSync(path.join(V1, 'ProjectCharts.tsx'), 'utf8')
    expect(shell).toContain('data-project-nav="none"')
    expect(shell).toContain('data-project-rebuild="zero-rebuild-v1"')
    expect(shell).not.toMatch(/ProjectStickyNav|role="tablist"|Overview.*Markets.*Farms/)
    for (const section of [
      'identity-hero',
      'live-market',
      'project',
      'liquidity',
      'farms',
      'pools',
      'featured-promotion',
      'developer',
      'transparency',
    ]) {
      expect(shell).toContain(`data-project-section="${section}"`)
    }
    expect(trading).toContain('data-project-section="trading"')
    expect(charts).toContain('data-project-section="charts"')
  })

  it('featured promotion discloses 99 USD / 7 days / assets / GET FEATURED', () => {
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    expect(shell).toContain('99 USD')
    expect(shell).toContain('7 days')
    expect(shell).toContain('GET FEATURED')
    expect(shell).toContain('BNB')
    expect(shell).toContain('USDT')
    expect(shell).toContain('USDC')
    expect(shell).toContain('MARCO')
    expect(shell).toContain('5% M-Credits Cashback')
  })

  it('Unavailable path present for missing metrics', () => {
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    expect(shell).toContain('Unavailable')
    expect(shell).toContain('UNAVAILABLE')
  })

  it('embeds SmartSwap without modifying Swap sources', () => {
    const trade = readFileSync(path.join(V1, 'ProjectTradingEmbed.tsx'), 'utf8')
    expect(trade).toContain('SmartSwapForm')
    expect(trade).toContain("views/Swap/SmartSwap")
  })

  it('charts use indexed candles only', () => {
    const charts = readFileSync(path.join(V1, 'ProjectCharts.tsx'), 'utf8')
    expect(charts).toContain('useIndexerCandles')
    expect(charts).toMatch(/not available yet|Unavailable/i)
  })
})
