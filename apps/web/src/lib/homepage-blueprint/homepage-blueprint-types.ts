export type HomepageTier = 'core' | 'secondary' | 'advanced' | 'legacy'

export type SurfacePromotion = 'promote' | 'demote' | 'keep' | 'remove_from_home' | 'legacy_compat'

export interface HomepageSurfaceSlot {
  id: string
  label: string
  route: string
  tier: HomepageTier
  promotion: SurfacePromotion
  humanPurpose: string
  agentPurpose: string
  manifestUri?: string
  notes: string
}

export interface HomepageSection {
  id: string
  label: string
  order: number
  description: string
  surfaces: string[]
  required: boolean
}

export interface HomepageJourney {
  persona: string
  entryRoute: string
  steps: { label: string; route: string; priority: HomepageTier }[]
  successCriteria: string
}

export interface HomepageBlueprint {
  manifest: string
  api_version: string
  phase: string
  as_of: string
  audit_type: 'read_only_blueprint'
  branch_basis: string
  verdict: string
  disclaimer: string
  purpose: string
  constitutional: {
    canonicalChain: string
    canonicalAsset: string
    status: string
    framing: string
  }
  hierarchy: Record<HomepageTier, HomepageSurfaceSlot[]>
  sections: HomepageSection[]
  journeys: HomepageJourney[]
  removeFromHomepage: string[]
  promoteOnHomepage: string[]
  staySecondary: string[]
  legacyCompatible: string[]
  copywritingDirection: string[]
  machineReadableRequirements: string[]
  mission22Plan: string[]
  surfacesPromoted: string[]
  surfacesDemoted: string[]
}
