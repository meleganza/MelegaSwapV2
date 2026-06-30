import { CollectibleCategory, CollectibleStatus } from './collectible-types'

export const COLLECTIBLES_REGISTRY_API_VERSION = '0.1.0'

export const COLLECTIBLES_REGISTRY_AS_OF = '2026-06-28'

export const COLLECTIBLES_REGISTRY_DISCLAIMER =
  'Civilization Collectibles read model only. No ownership counts, mint buttons, or on-chain writes on /collectibles. Legacy mint flows remain on their original routes.'

export const MELEGA_DEX_UPI = 'upi://melega/dex/melega-dex@1'

/** Detected from apps/web/src/config/constants/contracts.ts — read-only reference, not modified. */
export const DETECTED_BABYMARCO_GENESIS_NFT_BSC = '0x2A0356b52d33c5e359eF289B8Da37eD73A6C9CE5'

/** Detected Pinata gateway + CID from legacy NFT pages (viewNFTs, nftmarket, buy/sell). */
export const DETECTED_BABYMARCO_PINATA_GATEWAY =
  'https://red-wonderful-stork-305.mypinata.cloud/ipfs/QmRqb3TUnbxjLPzJqhgKkzpysfFmdsvSdiUBqVYFCKSYxb'

export const DETECTED_BABYMARCO_IMAGE_PATTERN = 'DOG{tokenId}.png'

export const DETECTED_NFT_ROUTES = {
  mint: '/nft/',
  wallet: '/viewNFTs/',
  market: '/nftmarket/',
} as const

export const COLLECTIBLE_STATUS_LABELS: Record<CollectibleStatus, string> = {
  live_or_legacy_existing: 'Live (Legacy Existing)',
  planned_or_external: 'Planned / External',
  planned: 'Planned',
}

export const COLLECTIBLE_CATEGORY_LABELS: Record<CollectibleCategory, string> = {
  mascot_ecosystem: 'Mascot / Ecosystem Collectible',
  identity: 'Identity Collectible',
  participation_proof: 'Participation / Proof',
  ai_agent_identity: 'AI Agent Identity',
}

export const buildCollectibleId = (slug: string): string =>
  `collectible://melega/civilization/${slug}@0.1.0`
