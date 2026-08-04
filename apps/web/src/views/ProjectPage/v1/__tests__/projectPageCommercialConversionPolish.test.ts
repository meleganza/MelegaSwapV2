/**
 * MELEGASWAP_V2_PROJECT_PAGE_COMMERCIAL_CONVERSION_POLISH — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const V1 = path.resolve(__dirname, '..')
const SHELL = path.join(V1, 'ProjectPageV1Shell.tsx')

describe('Project Page Commercial Conversion Polish', () => {
  const shell = readFileSync(SHELL, 'utf8')

  it('hero identity exposes logo, name, symbol, chain, verified, contract, explorer', () => {
    expect(shell).toContain('MelegaTokenAvatar')
    expect(shell).toContain('HeroName')
    expect(shell).toContain('Ticker')
    expect(shell).toContain('MelegaExploreChainBadge')
    expect(shell).toContain('project-v1-verified')
    expect(shell).toContain('project-v1-copy-contract')
    expect(shell).toContain('project-v1-explorer')
  })

  it('action hierarchy is Buy → Add Wallet → Trade → Farm → Pool → Liquidity', () => {
    const buy = shell.indexOf('data-testid="project-v1-buy"')
    const wallet = shell.indexOf('data-testid="project-v1-add-wallet-secondary"')
    const trade = shell.indexOf('data-testid="project-v1-trade"')
    const farm = shell.indexOf('data-testid="project-v1-next-farm"')
    const pool = shell.indexOf('data-testid="project-v1-next-pool"')
    const liq = shell.indexOf('data-testid="project-v1-liquidity"')
    expect(buy).toBeGreaterThan(-1)
    expect(wallet).toBeGreaterThan(buy)
    expect(trade).toBeGreaterThan(wallet)
    expect(farm).toBeGreaterThan(trade)
    expect(pool).toBeGreaterThan(farm)
    expect(liq).toBeGreaterThan(pool)
    expect(shell).toContain('Buy Token')
  })

  it('claim flow explains ownership and verification steps', () => {
    expect(shell).toContain('project-v1-claim-block')
    expect(shell).toContain('Are you the project owner?')
    expect(shell).toContain('Claim this page to manage your information.')
    expect(shell).toContain('Connect wallet')
    expect(shell).toContain('Ownership verification')
    expect(shell).toContain('Customize logo, description, website, socials')
    expect(shell).toContain('No arbitrary editing')
    expect(shell).toContain('data-testid="project-v1-claim"')
  })

  it('market section is compact and factual with Unavailable path', () => {
    expect(shell).toContain('project-v1-market')
    expect(shell).toContain('label="Price"')
    expect(shell).toContain('label="24h change"')
    expect(shell).toContain('label="Volume"')
    expect(shell).toContain('label="Liquidity"')
    expect(shell).toContain('label="Holders"')
    expect(shell).toContain('label="Chain"')
    expect(shell).toContain('Unavailable')
    expect(shell).not.toMatch(/label="Price USD"/)
  })

  it('farm / pool / liquidity rows carry chain badges and stay chain-scoped', () => {
    expect(shell).toContain('filterParticipationByChain')
    expect(shell).toContain('project-v1-farm-row')
    expect(shell).toContain('project-v1-pool-row')
    expect(shell).toContain('project-v1-liquidity-row')
    expect(shell).toContain('Farm available')
    expect(shell).toContain('Pool available')
    expect(shell).toContain('DenseIdentity')
  })

  it('Featured and Boosted monetization labels are honest', () => {
    expect(shell).toContain('placement-label-featured')
    expect(shell).toContain('placement-label-boosted')
    expect(shell).toContain('Paid placement')
    expect(shell).toContain('never presented as')
    expect(shell).toContain('organic')
    expect(shell).toContain('project-trend-boost-promotion')
    expect(shell).toContain('GET FEATURED')
  })

  it('Grow Your Project CTA links Create Token / Liquidity / Farm / Featured / Trend Boost', () => {
    expect(shell).toContain('project-v1-grow-cta')
    expect(shell).toContain('Grow Your Project')
    expect(shell).toContain('project-v1-grow-create-token')
    expect(shell).toContain('project-v1-grow-liquidity')
    expect(shell).toContain('project-v1-grow-farm')
    expect(shell).toContain('project-v1-grow-featured')
    expect(shell).toContain('project-v1-grow-trend-boost')
  })

  it('mobile hero actions stack without fixed wide columns', () => {
    expect(shell).toContain('@media (max-width: 479px)')
    expect(shell).toContain('flex-direction: column')
    expect(shell).toContain('overflow-x: hidden')
  })
})
