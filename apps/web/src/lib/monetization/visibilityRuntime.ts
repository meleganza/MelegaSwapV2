import type { CommercialServiceId, CommercialPaymentAsset } from 'views/shared/monetization/commercialCheckoutTypes'

export type VisibilityRuntimeCapability = {
  live: boolean
  reason: string | null
}

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
    return VISIBILITY_RUNTIME.M_CREDITS.reason
  }
  if (args.payment === 'M_CREDITS' && !canAcceptMCreditsPayment(args.service)) {
    return service.reason ?? 'This service is not enabled for production checkout.'
  }
  if (args.hasReferral) return VISIBILITY_RUNTIME.referral.reason
  if (args.hasFeaturedAddOns) return 'Featured Farm/Pool bundle settlement is awaiting production activation.'
  return null
}

const MCREDITS_FULFILLABLE_SERVICES = new Set(['featured', 'trend-boost'])

/** M-Credits may charge only when the selected service has a real fulfillment pipeline. */
export function canAcceptMCreditsPayment(service: string | null): boolean {
  if (!service) return false
  if (!VISIBILITY_RUNTIME.M_CREDITS.live) return false
  if (!VISIBILITY_RUNTIME[service]?.live) return false
  return MCREDITS_FULFILLABLE_SERVICES.has(service)
}
