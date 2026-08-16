import type { CommercialServiceId, CommercialPaymentAsset } from 'views/shared/monetization/commercialCheckoutTypes'

export type VisibilityRuntimeCapability = {
  live: boolean
  reason: string | null
}

export const VISIBILITY_RUNTIME: Record<string, VisibilityRuntimeCapability> = {
  featured: { live: true, reason: null },
  'trend-boost': { live: true, reason: null },
  'sponsored-research': { live: true, reason: null },
  'featured-farm': { live: true, reason: null },
  'featured-pool': { live: true, reason: null },
  // Availability is resolved from MARCO's machine authority at runtime. The
  // checkout remains fail-closed until the signed Pay connection is green.
  M_CREDITS: { live: true, reason: null },
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
  if (args.hasReferral) return VISIBILITY_RUNTIME.referral.reason
  if (args.hasFeaturedAddOns) return 'Choose Featured Farm or Featured Pool as a dedicated service.'
  return null
}
