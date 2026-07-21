export const PROJECT_TOKENOMICS_SCHEMA_VERSION = 'melega.project-tokenomics.v1'

export type TokenomicsFactProvenance = 'ON_CHAIN' | 'PROJECT_ATTESTED' | 'UNAVAILABLE'

export interface TokenomicsFact {
  id: string
  label: string
  value: string | null
  provenance: TokenomicsFactProvenance
  note?: string | null
}

export interface ProjectTokenomicsDocument {
  schemaVersion: string
  projectId: string
  slug: string
  published: boolean
  facts: TokenomicsFact[]
  allocationCategories: Array<{
    id: string
    label: string
    percent: number | null
    provenance: TokenomicsFactProvenance
  }>
  unpublishedReason: string | null
  generatedAt: string
}
