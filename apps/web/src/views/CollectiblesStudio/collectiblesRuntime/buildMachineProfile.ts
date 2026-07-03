import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import { buildCollectibleHealth } from './buildCollectibleHealth'
import { buildCollectiblePrivileges } from './buildCollectiblePrivileges'
import { buildMembershipStatus } from './buildMembershipStatus'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export interface CollectiblesMachineProfile {
  schema: string
  generatedAt: string
  wallet: string | null
  chainId?: number
  version: string
  collections: Array<{
    slug: string
    collectibleId: string
    ownership: string
    balance: number
    membership: ReturnType<typeof buildMembershipStatus>
    privileges: ReturnType<typeof buildCollectiblePrivileges>
    health: ReturnType<typeof buildCollectibleHealth>
  }>
  capabilities: {
    totalIndexed: number
    totalOwned: number
    builderLevel: number
    validatorStatus: string
    aiPassport: string
  }
}

export function buildMachineProfile(input: {
  account?: string
  chainId?: number
  records: StaticCollectibleRecord[]
  ownershipBySlug: Record<string, WalletCollectibleOwnership>
  totalOwned: number
}): CollectiblesMachineProfile {
  const collections = input.records.map((record) => {
    const ownership = input.ownershipBySlug[record.slug] ?? {
      slug: record.slug,
      balance: 0,
      status: 'Not owned' as const,
      transferable: null,
      tokenIds: [],
    }
    return {
      slug: record.slug,
      collectibleId: record.collectibleId,
      ownership: ownership.status,
      balance: ownership.balance,
      membership: buildMembershipStatus(record, ownership),
      privileges: buildCollectiblePrivileges(record, ownership),
      health: buildCollectibleHealth(record, ownership),
    }
  })

  const ownedGenesis = collections.find((c) => c.slug === 'babymarco-genesis' && c.ownership === 'Owned')

  return {
    schema: 'melega.collectibles-identity.v1',
    generatedAt: new Date().toISOString(),
    wallet: input.account ?? null,
    chainId: input.chainId,
    version: '1.0.0',
    collections,
    capabilities: {
      totalIndexed: input.records.length,
      totalOwned: input.totalOwned,
      builderLevel: ownedGenesis ? 1 : 0,
      validatorStatus: ownedGenesis ? 'Candidate' : 'Unavailable',
      aiPassport: collections.some((c) => c.membership.tier === 'AI Passport' && c.ownership === 'Owned')
        ? 'Active'
        : 'Unavailable',
    },
  }
}
