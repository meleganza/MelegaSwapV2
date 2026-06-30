/** Read-only types for Melega DEX UX Renaissance Constitution v1.2 */

export const UX_CONSTITUTION_VERSION = '1.2' as const
export const UX_CONSTITUTION_STATUS = 'approved' as const
export const UX_CONSTITUTION_AUTHORITY = 'canonical_design_authority' as const
export const UX_CONSTITUTION_MANIFEST_URI =
  '/registry/design/melega-dex-ux-constitution-v1-2.json' as const

export type UxConstitutionStatus = typeof UX_CONSTITUTION_STATUS
export type UxConstitutionAuthority = typeof UX_CONSTITUTION_AUTHORITY

export interface UxConstitutionSummary {
  documentVersion: typeof UX_CONSTITUTION_VERSION
  status: UxConstitutionStatus
  authority: UxConstitutionAuthority
  brand: string
  forbiddenPublicLabel: string
  humanNav: readonly string[]
  aiModeSeparated: boolean
  homepageModel: string
  listingCta: string
  recommendedStakingTemplate: string
  realDataOnly: boolean
  noFakeMetrics: boolean
  manifestUri: typeof UX_CONSTITUTION_MANIFEST_URI
}
