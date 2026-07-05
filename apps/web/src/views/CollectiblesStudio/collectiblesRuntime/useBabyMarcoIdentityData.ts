import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BABYMARCO_GENESIS_CANONICAL_SUPPLY,
  BABYMARCO_GENESIS_COLLECTION_ID,
  BABYMARCO_GENESIS_DISPLAY_NAME,
  BABYMARCO_GENESIS_RARITY_TIERS,
  formatMarcoPrice,
  type BabyMarcoRarityKey,
} from 'registry/collectibles/babymarco-genesis-identity.config'
import {
  IDENTITY_HUB_COLLECTIONS,
} from 'registry/collectibles/identity-hub-collections.config'
import { usePriceCakeBusd } from 'state/farms/hooks'
import {
  fetchBabyMarcoTokenMetadata,
  type BabyMarcoTokenMetadata,
  resolveRarityFromMetadata,
} from './babyMarcoMetadata'
import {
  buildGenesisIdentityPrivileges,
  buildIdentityCapabilityCards,
  buildIdentityLevels,
  resolveCurrentIdentity,
  type CurrentIdentityKind,
  type IdentityCapabilityCard,
  type IdentityLevelRow,
  type IdentityPrivilege,
} from './identityCapabilities'
import { getCollectibleBySlug } from 'registry/collectibles/getCollectibleBySlug'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export interface GenesisTierRuntimeRow {
  key: BabyMarcoRarityKey
  label: string
  supply: number
  owned: number
  mintAvailability: string
  priceMarco: number
  priceMarcoLabel: string
  priceUsdApprox: string | null
}

export interface YourIdentityViewModel {
  currentIdentity: CurrentIdentityKind
  walletConnected: boolean
  walletAddress: string | null
  ownedGenesis: boolean
  primaryTokenId: string | null
  artworkUrl: string | null
  identityBadge: string
  rarityLabel: string | null
  mintDate: string | null
  collectionName: string
  privileges: IdentityPrivilege[]
  metadata: BabyMarcoTokenMetadata | null
  metadataLoading: boolean
}

export function useBabyMarcoIdentityData(
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
  account?: string,
) {
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const genesisRecord = useMemo(() => getCollectibleBySlug(BABYMARCO_GENESIS_COLLECTION_ID), [])
  const genesisOwnership = ownershipBySlug[BABYMARCO_GENESIS_COLLECTION_ID]
  const [primaryMetadata, setPrimaryMetadata] = useState<BabyMarcoTokenMetadata | null>(null)
  const [metadataLoading, setMetadataLoading] = useState(false)
  const [ownedByTier, setOwnedByTier] = useState<Record<BabyMarcoRarityKey, number>>({
    normal: 0,
    rare: 0,
    super_rare: 0,
    super_super_rare: 0,
  })

  const currentIdentity = useMemo(() => resolveCurrentIdentity(ownershipBySlug), [ownershipBySlug])
  const ownedGenesis = genesisOwnership?.status === 'Owned'
  const primaryTokenId = genesisOwnership?.tokenIds[0] ?? null

  const loadOwnedMetadata = useCallback(async () => {
    const tokenIds = genesisOwnership?.tokenIds ?? []
    if (!tokenIds.length) {
      setPrimaryMetadata(null)
      setOwnedByTier({ normal: 0, rare: 0, super_rare: 0, super_super_rare: 0 })
      return
    }

    setMetadataLoading(true)
    const tierCounts: Record<BabyMarcoRarityKey, number> = {
      normal: 0,
      rare: 0,
      super_rare: 0,
      super_super_rare: 0,
    }

    try {
      const results = await Promise.all(
        tokenIds.map(async (id) => {
          try {
            return await fetchBabyMarcoTokenMetadata(id)
          } catch {
            const fallback = resolveRarityFromMetadata(undefined, id)
            return {
              name: `Identity #${id}`,
              description: fallback.label ? `Rarity: ${fallback.label}` : '',
              image: undefined,
              rarityLabel: fallback.label,
              rarityKey: fallback.key,
              tier: fallback.tier,
            } satisfies BabyMarcoTokenMetadata
          }
        }),
      )

      results.forEach((meta) => {
        if (meta.rarityKey) tierCounts[meta.rarityKey] += 1
      })

      setPrimaryMetadata(results[0] ?? null)
      setOwnedByTier(tierCounts)
    } finally {
      setMetadataLoading(false)
    }
  }, [genesisOwnership?.tokenIds])

  useEffect(() => {
    loadOwnedMetadata()
  }, [loadOwnedMetadata])

  const marcoUsd = marcoPrice && !marcoPrice.isZero() ? marcoPrice.toNumber() : null

  const genesisTiers: GenesisTierRuntimeRow[] = useMemo(
    () =>
      BABYMARCO_GENESIS_RARITY_TIERS.map((tier) => {
        const usd =
          marcoUsd != null ? `≈ $${(tier.priceMarco * marcoUsd).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : null
        return {
          key: tier.key,
          label: tier.metadataLabels[0],
          supply: tier.supply,
          owned: ownedByTier[tier.key],
          mintAvailability: genesisRecord?.mint.status === 'indexed' ? 'Legacy mint surface' : 'Not indexed',
          priceMarco: tier.priceMarco,
          priceMarcoLabel: formatMarcoPrice(tier.priceMarco),
          priceUsdApprox: usd,
        }
      }),
    [ownedByTier, marcoUsd, genesisRecord?.mint.status],
  )

  const privileges = useMemo(() => {
    if (!genesisRecord) return []
    return buildGenesisIdentityPrivileges(
      genesisRecord,
      genesisOwnership ?? {
        slug: BABYMARCO_GENESIS_COLLECTION_ID,
        balance: 0,
        status: 'Not owned',
        transferable: true,
        tokenIds: [],
      },
    )
  }, [genesisRecord, genesisOwnership])

  const capabilities = useMemo(
    () => buildIdentityCapabilityCards(ownershipBySlug),
    [ownershipBySlug],
  )

  const identityLevels = useMemo(() => buildIdentityLevels(currentIdentity), [currentIdentity])

  const yourIdentity: YourIdentityViewModel = useMemo(
    () => ({
      currentIdentity,
      walletConnected: Boolean(account),
      walletAddress: account ?? null,
      ownedGenesis,
      primaryTokenId,
      artworkUrl: primaryMetadata?.image ?? null,
      identityBadge: ownedGenesis ? 'Genesis Identity' : currentIdentity === 'None' ? 'No Identity' : `${currentIdentity} Identity`,
      rarityLabel: primaryMetadata?.rarityLabel ?? null,
      mintDate: ownedGenesis ? 'Wallet verified' : null,
      collectionName: BABYMARCO_GENESIS_DISPLAY_NAME,
      privileges: privileges.filter((p) => p.status === 'ACTIVE' || p.status === 'COMING SOON'),
      metadata: primaryMetadata,
      metadataLoading,
    }),
    [
      currentIdentity,
      account,
      ownedGenesis,
      primaryTokenId,
      primaryMetadata,
      privileges,
      metadataLoading,
    ],
  )

  return {
    collectionId: BABYMARCO_GENESIS_COLLECTION_ID,
    collectionName: BABYMARCO_GENESIS_DISPLAY_NAME,
    canonicalSupply: BABYMARCO_GENESIS_CANONICAL_SUPPLY,
    identityCollections: IDENTITY_HUB_COLLECTIONS,
    currentIdentity,
    yourIdentity,
    genesisTiers,
    privileges,
    capabilities,
    identityLevels,
    primaryMetadata,
    metadataLoading,
    ownedByTier,
    genesisRecord,
    genesisOwnership,
  }
}

export type BabyMarcoIdentityData = ReturnType<typeof useBabyMarcoIdentityData>
