import { describe, expect, it } from 'vitest'
import { canAcceptMCreditsPayment, visibilityCheckoutBlocker, VISIBILITY_RUNTIME } from '../visibilityRuntime'

describe('M-Credits visibility binding', () => {
  it('activates M-Credits only for fulfillable Featured and Trend Boost', () => {
    expect(VISIBILITY_RUNTIME.M_CREDITS.live).toBe(true)
    expect(canAcceptMCreditsPayment('featured')).toBe(true)
    expect(canAcceptMCreditsPayment('trend-boost')).toBe(true)
    expect(canAcceptMCreditsPayment('featured-pool')).toBe(false)
    expect(canAcceptMCreditsPayment('featured-farm')).toBe(false)
    expect(canAcceptMCreditsPayment('sponsored-research')).toBe(false)
  })

  it('keeps blocked services fail-closed even when M-Credits is selected', () => {
    expect(
      visibilityCheckoutBlocker({
        service: 'featured-pool',
        payment: 'M_CREDITS',
        projectPageReady: true,
        hasReferral: false,
        hasFeaturedAddOns: false,
      }),
    ).toMatch(/awaiting production activation/)
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
})
