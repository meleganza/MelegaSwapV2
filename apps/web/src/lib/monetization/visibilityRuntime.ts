import type { CommercialServiceId, CommercialPaymentAsset } from 'views/shared/monetization/commercialCheckoutTypes'

export type VisibilityRuntimeCapability = {
  live: boolean
  reason: string | null
}

/** Paid M-Credits may settle only where a real placement consumer already exists. */
export const MCREDITS_FULFILLABLE_SERVICES = ['featured', 'trend-boost'] as const
export type MCreditsFulfillableService = (typeof MCREDITS_FULFILLABLE_SERVICES)[number]

export const VISIBILITY_RUNTIME: Record<string, VisibilityRuntimeCapability> = {
  featured: { live: true, reason: null },
  'trend-boost': { live: true, reason: null },
  'sponsored-research': {
    live: false,
    reason: 'Featured Research settlement and placement fulfillment are awaiting production activation.',
  },
  'featured-farm': {
    live: false,
    reason: 'Featured Farm settlement and hero rotation fulfillment are awaiting production activation.',
  },
  'featured-pool': {
    live: false,
    reason: 'Featured Pool settlement and hero rotation fulfillment are awaiting production activation.',
  },
  M_CREDITS: {
    live: true,
    reason: null,
  },
  referral: {
    live: false,
    reason:
      'Permanent referral attribution and 50% payout settlement require the referral ledger backend. The historical ratified policy is 10%, so the new split also requires an explicit economic-policy migration.',
  },
  projectPublisher: {
    live: false,
    reason: 'Project Page ownership proof and publishing must be backed by a server-side registry before checkout.',
  },
}

export function isMCreditsFulfillableService(service: string | null | undefined): service is MCreditsFulfillableService {
  return service === 'featured' || service === 'trend-boost'
}

export function visibilityCheckoutBlocker(args: {
  service: CommercialServiceId | null
  payment: CommercialPaymentAsset
  projectPageReady: boolean
  hasReferral: boolean
  hasFeaturedAddOns: boolean
}): string | null {
  if (!args.projectPageReady) return VISIBILITY_RUNTIME.projectPublisher.reason
  if (!args.service) return 'Choose a visibility service.'
  const service = VISIBILITY_RUNTIME[args.service]
  if (!service?.live) return service?.reason ?? 'This service is not enabled for production checkout.'
  if (args.payment === 'M_CREDITS' && !VISIBILITY_RUNTIME.M_CREDITS.live) {
    return VISIBILITY_RUNTIME.M_CREDITS.reason ?? 'M-Credits are not enabled for production checkout.'
  }
  if (args.hasReferral) return VISIBILITY_RUNTIME.referral.reason
  if (args.hasFeaturedAddOns) return 'Featured Farm/Pool bundle settlement is awaiting production activation.'
  return null
}
