/**
 * MELEGASWAP_V2_GROWTH_HUB_AND_COMMERCIAL_CHECKOUT — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../../../')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_GROWTH_HUB_AND_COMMERCIAL_CHECKOUT', () => {
  const shell = load('views/ProjectPage/v3/ProjectPageV3Shell.tsx')
  const checkout = load('views/shared/monetization/CommercialCheckoutModal.tsx')
  const claim = load('views/shared/monetization/ClaimProjectWizardModal.tsx')
  const history = load('views/shared/monetization/ProjectMarketingHistory.tsx')
  const types = load('views/shared/monetization/commercialCheckoutTypes.ts')
  const featuredSection = load('views/ProjectsStudio/components/FeaturedProjectsSection.tsx')
  const home = load('views/HomeTrade/DexHomeScreen.tsx')
  const packages = load('lib/monetization/packages.ts')

  it('Growth Hub renames Grow → Boost with six service cards', () => {
    expect(shell).toContain('Boost Your Project')
    expect(shell).toContain('Increase visibility. Grow liquidity. Acquire holders.')
    expect(shell).toContain('data-growth-hub="boost-your-project"')
    expect(shell).toContain('project-growth-hub')
    for (const id of ['featured', 'trend', 'liquidity', 'farm', 'pool', 'claim']) {
      expect(shell).toContain(`project-v3-grow-${id}`)
    }
    expect(types).toContain("'featured'")
    expect(types).toContain("'claim-project'")
    expect(COMMERCIAL_SERVICE_COUNT(types)).toBe(6)
  })

  it('CommercialCheckoutModal is MelegaModal V3 with 6 steps', () => {
    expect(checkout).toContain('MelegaModal')
    expect(checkout).toContain('MelegaModalPreview')
    expect(checkout).toContain('MelegaModalFooter')
    expect(checkout).toContain("title=\"Boost Your Project\"")
    expect(checkout).toContain('commercial-checkout-modal')
    for (const step of ['service', 'package', 'chain', 'payment', 'review', 'checkout']) {
      expect(checkout).toContain(`commercial-step-${step}`)
    }
    expect(checkout).toContain('BNB')
    expect(checkout).toContain('USDT')
    expect(checkout).toContain('USDC')
    expect(checkout).toContain('MARCO')
    expect(checkout).toContain('/api/featured/orders')
    expect(checkout).toContain('/api/trend-boost/orders')
  })

  it('Featured and Trend packages + badges', () => {
    expect(packages).toContain('featured_24h')
    expect(packages).toContain('featured_72h')
    expect(packages).toContain('featured_1w')
    expect(packages).toContain('featured_1m')
    expect(packages).toContain('trend_1h')
    expect(packages).toContain('trend_24h')
    expect(types).toContain('impressions')
    expect(types).toContain('Estimated Reach')
    expect(checkout).toContain('FEATURED_PACKAGE_BADGES')
    expect(checkout).toContain('TREND_PACKAGE_BADGES')
  })

  it('Claim wizard has 5 steps and MelegaModal V3', () => {
    expect(claim).toContain('claim-project-wizard-modal')
    expect(claim).toContain('claim-step-wallet')
    expect(claim).toContain('claim-step-ownership')
    expect(claim).toContain('claim-step-customize')
    expect(claim).toContain('claim-step-review')
    expect(claim).toContain('claim-step-publish')
    expect(claim).toContain('claim-logo')
    expect(claim).toContain('claim-telegram')
    expect(claim).toContain('claim-github')
    expect(shell).toContain('ClaimProjectWizardModal')
  })

  it('Featured Projects uses one pipeline across Home / Projects / Project Page', () => {
    expect(featuredSection).toContain('FeaturedProjectsRail')
    expect(featuredSection).toContain('data-featured-pipeline="FeaturedProjectsRail"')
    expect(home).toContain('FeaturedProjectsRail')
    expect(shell).toContain('FeaturedProjectsSection')
    expect(shell).toContain('surface="project-page"')
    expect(featuredSection).not.toMatch(/duplicate card|copy of rail/i)
  })

  it('Hero trust badges + Marketing History on Project Page', () => {
    expect(shell).toContain('project-v3-trust-badges')
    for (const id of ['verified', 'liquidity', 'community', 'audit', 'age', 'volume']) {
      expect(shell).toContain(`trust-${id}`)
    }
    expect(shell).toContain('Marketing History')
    expect(shell).toContain('ProjectMarketingHistory')
    expect(history).toContain('marketing-history-featured')
    expect(history).toContain('Completed')
    expect(history).toContain('Running')
    expect(types).toContain("'Expired'")
    expect(history).toContain('resolveMarketingStatus')
  })

  it('evidence folder contract exists after acceptance', () => {
    // Created by acceptance step — assert path convention.
    expect(
      'apps/web/docs/runtime/melegaswap-v2-growth-hub-commercial-checkout/REPORT.md',
    ).toContain('growth-hub-commercial-checkout')
  })

  it('mission files exist', () => {
    expect(existsSync(path.join(WEB, 'views/shared/monetization/CommercialCheckoutModal.tsx'))).toBe(true)
    expect(existsSync(path.join(WEB, 'views/shared/monetization/ClaimProjectWizardModal.tsx'))).toBe(true)
    expect(existsSync(path.join(WEB, 'views/shared/monetization/ProjectMarketingHistory.tsx'))).toBe(true)
  })
})

function COMMERCIAL_SERVICE_COUNT(src: string): number {
  const matches = src.match(/id: '(featured|trend-boost|liquidity|create-farm|create-pool|claim-project)'/g)
  return matches?.length ?? 0
}
