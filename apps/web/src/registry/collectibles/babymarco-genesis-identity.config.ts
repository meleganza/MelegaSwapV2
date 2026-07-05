/**
 * BabyMARCO Genesis — Civilization Identity configuration.
 * Pricing and supply tiers are canonical here; components must not hardcode values.
 */

export const BABYMARCO_GENESIS_COLLECTION_ID = 'babymarco-genesis'

export const BABYMARCO_GENESIS_DISPLAY_NAME = 'BabyMARCO Genesis'

export const BABYMARCO_GENESIS_CANONICAL_SUPPLY = 1000

export const BABYMARCO_IPFS_GATEWAY = 'https://red-wonderful-stork-305.mypinata.cloud/ipfs'

export const BABYMARCO_IMAGES_CID = 'QmRqb3TUnbxjLPzJqhgKkzpysfFmdsvSdiUBqVYFCKSYxb'

export const BABYMARCO_METADATA_CID = 'QmRhzvsUCMpPFmytBj9w5KYFS1CtrbpZUeM1qUcRCxw7XZ'

export const BABYMARCO_IMAGE_FILENAME_PATTERN = 'DOG{tokenId}.png'

export const BABYMARCO_PRICING_CURRENCY = 'MARCO' as const

export type BabyMarcoRarityKey = 'normal' | 'rare' | 'super_rare' | 'super_super_rare'

export interface BabyMarcoRarityTierConfig {
  key: BabyMarcoRarityKey
  /** Labels as they may appear in IPFS metadata description (e.g. "Rarity: Normal"). */
  metadataLabels: string[]
  supply: number
  priceMarco: number
  tokenIdStart: number
  tokenIdEnd: number
}

export const BABYMARCO_GENESIS_RARITY_TIERS: BabyMarcoRarityTierConfig[] = [
  {
    key: 'normal',
    metadataLabels: ['Normal', 'normal'],
    supply: 600,
    priceMarco: 25_000,
    tokenIdStart: 1,
    tokenIdEnd: 600,
  },
  {
    key: 'rare',
    metadataLabels: ['Rare', 'rare'],
    supply: 150,
    priceMarco: 75_000,
    tokenIdStart: 601,
    tokenIdEnd: 750,
  },
  {
    key: 'super_rare',
    metadataLabels: ['Super Rare', 'super rare'],
    supply: 130,
    priceMarco: 150_000,
    tokenIdStart: 751,
    tokenIdEnd: 880,
  },
  {
    key: 'super_super_rare',
    metadataLabels: ['Super Super Rare', 'super super rare'],
    supply: 120,
    priceMarco: 300_000,
    tokenIdStart: 881,
    tokenIdEnd: 1000,
  },
]

export function getBabyMarcoMetadataUri(tokenId: string | number): string {
  return `${BABYMARCO_IPFS_GATEWAY}/${BABYMARCO_METADATA_CID}/${tokenId}.json`
}

export function getBabyMarcoImageUri(tokenId: string | number): string {
  const file = BABYMARCO_IMAGE_FILENAME_PATTERN.replace('{tokenId}', String(tokenId))
  return `${BABYMARCO_IPFS_GATEWAY}/${BABYMARCO_IMAGES_CID}/${file}`
}

export function getBabyMarcoTierByKey(key: BabyMarcoRarityKey): BabyMarcoRarityTierConfig {
  const tier = BABYMARCO_GENESIS_RARITY_TIERS.find((t) => t.key === key)
  if (!tier) throw new Error(`Unknown BabyMARCO rarity key: ${key}`)
  return tier
}

export function getBabyMarcoTierByTokenId(tokenId: string | number): BabyMarcoRarityTierConfig | null {
  const id = Number(tokenId)
  if (!Number.isFinite(id)) return null
  return BABYMARCO_GENESIS_RARITY_TIERS.find((t) => id >= t.tokenIdStart && id <= t.tokenIdEnd) ?? null
}

export function getBabyMarcoTierByMetadataLabel(label: string): BabyMarcoRarityTierConfig | null {
  const normalized = label.trim().toLowerCase()
  return (
    BABYMARCO_GENESIS_RARITY_TIERS.find((t) =>
      t.metadataLabels.some((l) => l.trim().toLowerCase() === normalized),
    ) ?? null
  )
}

export function formatMarcoPrice(amount: number): string {
  return `${amount.toLocaleString('en-US')} ${BABYMARCO_PRICING_CURRENCY}`
}
