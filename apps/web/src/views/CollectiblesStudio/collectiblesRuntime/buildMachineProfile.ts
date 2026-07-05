import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import {
  BABYMARCO_GENESIS_COLLECTION_ID,
  BABYMARCO_GENESIS_DISPLAY_NAME,
  BABYMARCO_GENESIS_RARITY_TIERS,
  BABYMARCO_IMAGES_CID,
  BABYMARCO_METADATA_CID,
} from 'registry/collectibles/babymarco-genesis-identity.config'
import {
  IDENTITY_HUB_COLLECTIONS,
  IDENTITY_HUB_NAV_LABEL,
} from 'registry/collectibles/identity-hub-collections.config'
import { buildCollectiblePrivileges } from './buildCollectiblePrivileges'
import { buildCollectibleHealth } from './buildCollectibleHealth'
import {
  buildGenesisIdentityPrivileges,
  buildIdentityCapabilityCards,
  buildIdentityLevels,
  resolveCurrentIdentity,
  resolveIdentityLevelLabel,
  type CurrentIdentityKind,
  type IdentityCapabilityCard,
  type IdentityLevelRow,
  type IdentityPrivilege,
  type PrivilegeDisplayStatus,
} from './identityCapabilities'
import { buildMembershipStatus } from './buildMembershipStatus'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export const IDENTITY_MACHINE_SCHEMA = 'melega.identity.v1' as const

export interface IdentityMachineProfile {
  schema: typeof IDENTITY_MACHINE_SCHEMA
  generatedAt: string
  wallet: string | null
  chainId?: number
  version: string
  identity_hub: {
    label: string
    route: string
  }
  collections: typeof IDENTITY_HUB_COLLECTIONS
  active_collection: string
  wallet_identity: {
    currentIdentity: CurrentIdentityKind
    collection: string
    collectionId: string
    rarity: string | null
    level: string
  }
  rarity_tiers: Array<{
    key: string
    label: string
    supply: number
    priceMarco: number
  }>
  pricing_marco: Array<{
    tier: string
    amount: number
    currency: 'MARCO'
  }>
  privileges: IdentityPrivilege[]
  capabilities: IdentityCapabilityCard[]
  identity_levels: IdentityLevelRow[]
  ownership: {
    genesis: boolean
    builder: boolean
    validator: boolean
    tokenIds: string[]
    balance: number
  }
  ipfs_metadata: {
    imagesCid: string
    metadataCid: string
    primaryTokenId: string | null
    rarityLabel: string | null
  }
  registry_collections: Array<{
    slug: string
    collectibleId: string
    ownership: string
    balance: number
    membership: ReturnType<typeof buildMembershipStatus>
    privileges: Array<{ label: string; status: PrivilegeDisplayStatus }>
    health: ReturnType<typeof buildCollectibleHealth>
  }>
}

export function buildMachineProfile(input: {
  account?: string
  chainId?: number
  records: StaticCollectibleRecord[]
  ownershipBySlug: Record<string, WalletCollectibleOwnership>
  totalOwned: number
  primaryRarityLabel?: string | null
  primaryTokenId?: string | null
}): IdentityMachineProfile {
  const currentIdentity = resolveCurrentIdentity(input.ownershipBySlug)
  const genesisOwnership = input.ownershipBySlug[BABYMARCO_GENESIS_COLLECTION_ID]
  const genesisRecord = input.records.find((r) => r.slug === BABYMARCO_GENESIS_COLLECTION_ID)
  const levels = buildIdentityLevels(currentIdentity)
  const genesisPrivileges = genesisRecord
    ? buildGenesisIdentityPrivileges(
        genesisRecord,
        genesisOwnership ?? {
          slug: BABYMARCO_GENESIS_COLLECTION_ID,
          balance: 0,
          status: 'Not owned',
          transferable: true,
          tokenIds: [],
        },
      )
    : []

  const registryCollections = input.records.map((record) => {
    const ownership = input.ownershipBySlug[record.slug] ?? {
      slug: record.slug,
      balance: 0,
      status: 'Not owned' as const,
      transferable: null,
      tokenIds: [],
    }

    const privileges = buildCollectiblePrivileges(record, ownership)

    return {
      slug: record.slug,
      collectibleId: record.collectibleId,
      ownership: ownership.status,
      balance: ownership.balance,
      membership: buildMembershipStatus(record, ownership),
      privileges: privileges.map((p) => ({ label: p.label, status: p.status })),
      health: buildCollectibleHealth(record, ownership),
    }
  })

  return {
    schema: IDENTITY_MACHINE_SCHEMA,
    generatedAt: new Date().toISOString(),
    wallet: input.account ?? null,
    chainId: input.chainId,
    version: '1.0.0',
    identity_hub: {
      label: IDENTITY_HUB_NAV_LABEL,
      route: '/collectibles',
    },
    collections: IDENTITY_HUB_COLLECTIONS,
    active_collection: BABYMARCO_GENESIS_COLLECTION_ID,
    wallet_identity: {
      currentIdentity,
      collection: BABYMARCO_GENESIS_DISPLAY_NAME,
      collectionId: BABYMARCO_GENESIS_COLLECTION_ID,
      rarity: input.primaryRarityLabel ?? null,
      level: resolveIdentityLevelLabel(levels),
    },
    rarity_tiers: BABYMARCO_GENESIS_RARITY_TIERS.map((t) => ({
      key: t.key,
      label: t.metadataLabels[0],
      supply: t.supply,
      priceMarco: t.priceMarco,
    })),
    pricing_marco: BABYMARCO_GENESIS_RARITY_TIERS.map((t) => ({
      tier: t.metadataLabels[0],
      amount: t.priceMarco,
      currency: 'MARCO' as const,
    })),
    privileges: genesisPrivileges,
    capabilities: buildIdentityCapabilityCards(input.ownershipBySlug),
    identity_levels: levels,
    ownership: {
      genesis: genesisOwnership?.status === 'Owned',
      builder: input.ownershipBySlug['masterm-identity']?.status === 'Owned',
      validator: input.ownershipBySlug['achievement-collectibles']?.status === 'Owned',
      tokenIds: genesisOwnership?.tokenIds ?? [],
      balance: genesisOwnership?.balance ?? 0,
    },
    ipfs_metadata: {
      imagesCid: BABYMARCO_IMAGES_CID,
      metadataCid: BABYMARCO_METADATA_CID,
      primaryTokenId: input.primaryTokenId ?? genesisOwnership?.tokenIds[0] ?? null,
      rarityLabel: input.primaryRarityLabel ?? null,
    },
    registry_collections: registryCollections,
  }
}

/** @deprecated Use IdentityMachineProfile */
export type CollectiblesMachineProfile = IdentityMachineProfile
