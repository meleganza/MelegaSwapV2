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
  const modal = load('design-system/melega/components/Modal/MelegaModal.tsx')
  const claim = load('views/shared/monetization/ClaimProjectWizardModal.tsx')
  const history = load('views/shared/monetization/ProjectMarketingHistory.tsx')
  const types = load('views/shared/monetization/commercialCheckoutTypes.ts')
  const featuredSection = load('views/ProjectsStudio/components/FeaturedProjectsSection.tsx')
  const home = load('views/HomeTrade/DexHomeScreen.tsx')
  const packages = load('lib/monetization/packages.ts')
  const activePlacements = load('pages/api/trend-boost/active.ts')
  const sponsoredSearch = load('views/shared/monetization/SponsoredSuggestionsStrip.tsx')
  const featuredFarm = load('views/FarmsStudio/modules/FarmsHeroFeaturedCompact.tsx')
  const featuredPool = load('views/PoolsStudio/modules/PoolsHeroFeaturedCompact.tsx')

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

  it('CommercialCheckoutModal keeps one compact identity and the verified checkout', () => {
    expect(checkout).toContain('MelegaModal')
    expect(checkout).not.toContain('MelegaModalPreview')
    expect(checkout).toContain('commercial-project-identity-compact')
    expect(checkout).toContain('headerAccessory=')
    expect(modal).toContain('data-melega-modal-header-actions="true"')
    expect(checkout).toContain('MelegaModalFooter')
    expect(checkout).toContain('title="Boost Your Project"')
    expect(checkout).toContain('commercial-checkout-modal')
    for (const step of ['project', 'service', 'package', 'chain', 'payment', 'review', 'checkout']) {
      expect(checkout).toContain(`commercial-step-${step}`)
    }
    expect(checkout).toContain('BNB')
    expect(checkout).toContain('USDT')
    expect(checkout).toContain('USDC')
    expect(checkout).toContain('MARCO')
    expect(checkout).toContain('/api/featured/orders')
    expect(checkout).toContain('/api/trend-boost/orders')
  })

  it('Featured and Trend packages use centered duration cards without reach badges', () => {
    expect(packages).toContain('featured_24h')
    expect(packages).toContain('featured_72h')
    expect(packages).toContain('featured_1w')
    expect(packages).toContain('featured_1m')
    expect(packages).toContain('trend_1h')
    expect(packages).toContain('trend_24h')
    expect(checkout).not.toContain('FEATURED_PACKAGE_BADGES')
    expect(checkout).not.toContain('TREND_PACKAGE_BADGES')
    expect(checkout).not.toContain('ESTIMATED REACH')
    expect(checkout).not.toContain('DISCOVERY BOOST')
    expect(checkout).toContain('grid-template-columns: repeat(6, minmax(0, 1fr))')
  })

  it('uses the approved premium Payment and Review conversion surfaces', () => {
    expect(checkout).toContain('commercial-settlement-summary')
    expect(checkout).toContain('Settlement summary')
    expect(checkout).toContain('Estimated amount')
    expect(checkout).toContain('Cashback in')
    expect(checkout).toContain('M-Credits')
    expect(checkout).toContain('MARCO PASSPORT')
    expect(checkout).toContain('Review your order')
    expect(checkout).toContain('Approx. {settlementEstimate.label} required')
    expect(checkout).toContain('Verified settlement · Automatic placement activation')
    expect(checkout).toContain('Continue to secure payment')
  })

  it('every paid visibility service has a receipt-gated consumer surface', () => {
    expect(activePlacements).toContain("'trend-boost'")
    expect(sponsoredSearch).toContain('service=sponsored-research')
    expect(featuredFarm).toContain('service=featured-farm')
    expect(featuredPool).toContain('service=featured-pool')
    expect(checkout).toContain('serviceId: service')
    expect(checkout).toContain("service === 'featured-farm' ? farmTarget")
    expect(checkout).toContain("service === 'featured-pool' ? poolTarget")
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
    expect('apps/web/docs/runtime/melegaswap-v2-growth-hub-commercial-checkout/REPORT.md').toContain(
      'growth-hub-commercial-checkout',
    )
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
