/**
 * Certified Control Center seed — PP012.
 * Platform operator ownership for melega-dex; no invented wallet claims.
 */
import type { RegistryClaimRecord, RegistryProjectOwnerRecord } from './types'

const UPDATED = '2026-07-21T00:00:00.000Z'

export const PROJECT_OWNER_RECORDS: RegistryProjectOwnerRecord[] = [
  {
    stableKey: 'melega-dex.owner.platform-operator',
    projectSlug: 'melega-dex',
    identityType: 'OPERATOR',
    identityLabel: 'Melega Platform Operator',
    walletAddress: null,
    verificationState: 'VERIFIED',
    roles: ['OWNER'],
    createdAt: UPDATED,
    updatedAt: UPDATED,
  },
  {
    stableKey: 'melega-dex.owner.auditor',
    projectSlug: 'melega-dex',
    identityType: 'OPERATOR',
    identityLabel: 'Melega Platform Auditor',
    walletAddress: null,
    verificationState: 'VERIFIED',
    roles: ['AUDITOR'],
    createdAt: UPDATED,
    updatedAt: UPDATED,
  },
]

export const PROJECT_CLAIM_RECORDS: RegistryClaimRecord[] = [
  {
    projectSlug: 'melega-dex',
    claimState: 'CLAIMED',
    notes:
      'Melega DEX is platform-claimed for Control Center staging. Wallet-based project claims remain unavailable until PP002 PROJECT_CONTROL evidence exists. No automatic verification.',
    updatedAt: UPDATED,
  },
]

export function listOwnersForSlug(slug: string): RegistryProjectOwnerRecord[] {
  return PROJECT_OWNER_RECORDS.filter((r) => r.projectSlug === slug)
}

export function getClaimRecordForSlug(slug: string): RegistryClaimRecord | null {
  return PROJECT_CLAIM_RECORDS.find((r) => r.projectSlug === slug) ?? null
}
