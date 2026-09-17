import { describe, expect, it } from 'vitest'
import {
  isMCreditsFulfillableService,
  MCREDITS_FULFILLABLE_SERVICES,
  visibilityCheckoutBlocker,
  VISIBILITY_RUNTIME,
} from '../visibilityRuntime'

describe('M-Credits activation gates', () => {
  it('activates M-Credits only for Featured and Trend Boost fulfillment', () => {
    expect(VISIBILITY_RUNTIME.M_CREDITS.live).toBe(true)
    expect(VISIBILITY_RUNTIME.featured.live).toBe(true)
    expect(VISIBILITY_RUNTIME['trend-boost'].live).toBe(true)
    expect(MCREDITS_FULFILLABLE_SERVICES).toEqual(['featured', 'trend-boost'])
    expect(isMCreditsFulfillableService('featured')).toBe(true)
    expect(isMCreditsFulfillableService('trend-boost')).toBe(true)
  })

  it('keeps services without a paid placement binding closed', () => {
    expect(VISIBILITY_RUNTIME['featured-pool'].live).toBe(false)
    expect(VISIBILITY_RUNTIME['featured-farm'].live).toBe(false)
    expect(VISIBILITY_RUNTIME['sponsored-research'].live).toBe(false)
    expect(isMCreditsFulfillableService('featured-pool')).toBe(false)
    expect(isMCreditsFulfillableService('featured-farm')).toBe(false)
    expect(isMCreditsFulfillableService('sponsored-research')).toBe(false)
    expect(VISIBILITY_RUNTIME['featured-pool'].reason).toMatch(/hero rotation fulfillment/)
  })

  it('unblocks Review and pay for fulfillable M-Credits checkouts', () => {
    expect(
      visibilityCheckoutBlocker({
        service: 'featured',
        payment: 'M_CREDITS',
        projectPageReady: true,
        hasReferral: false,
        hasFeaturedAddOns: false,
      }),
    ).toBeNull()
    expect(
      visibilityCheckoutBlocker({
        service: 'trend-boost',
        payment: 'M_CREDITS',
        projectPageReady: true,
        hasReferral: false,
        hasFeaturedAddOns: false,
      }),
    ).toBeNull()
  })

  it('still blocks Featured Pool at review even when M-Credits is the selected rail', () => {
    expect(
      visibilityCheckoutBlocker({
        service: 'featured-pool',
        payment: 'M_CREDITS',
        projectPageReady: true,
        hasReferral: false,
        hasFeaturedAddOns: false,
      }),
    ).toMatch(/Featured Pool settlement and hero rotation fulfillment/)
  })
})
