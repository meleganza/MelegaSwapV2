export type ProjectClaimMetadata = {
  name: string
  symbol: string
  handle: string
  description: string
  logo: string | null
  website: string | null
  x: string | null
  telegram: string | null
  discord: string | null
}

export type ProjectClaimRecord = {
  schema: 'melega.project-claim.v1'
  chainId: number
  contract: string
  claimant: string
  authorityType: 'owner' | 'getOwner' | 'deployer'
  slug: string
  metadata: ProjectClaimMetadata
  signature: string
  message: string
  publishedAt: string
}

export type PublicProjectClaim = Omit<ProjectClaimRecord, 'claimant' | 'authorityType' | 'signature' | 'message'>

export type ProjectClaimMessageInput = {
  chainId: number
  contract: string
  claimant: string
  metadata: ProjectClaimMetadata
  issuedAt: string
}
