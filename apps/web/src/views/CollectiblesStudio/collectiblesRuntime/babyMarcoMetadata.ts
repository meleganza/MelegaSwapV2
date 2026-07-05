import {
  type BabyMarcoRarityKey,
  type BabyMarcoRarityTierConfig,
  getBabyMarcoImageUri,
  getBabyMarcoMetadataUri,
  getBabyMarcoTierByMetadataLabel,
  getBabyMarcoTierByTokenId,
} from 'registry/collectibles/babymarco-genesis-identity.config'

export interface BabyMarcoTokenMetadata {
  name: string
  description: string
  image?: string
  attributes?: Array<{ trait_type: string; value: string | number }>
  rarityLabel: string | null
  rarityKey: BabyMarcoRarityKey | null
  tier: BabyMarcoRarityTierConfig | null
}

export function parseRarityLabelFromDescription(description?: string): string | null {
  if (!description) return null
  const match = description.match(/Rarity:\s*(.+)/i)
  return match ? match[1].trim() : null
}

export function resolveRarityFromMetadata(
  description: string | undefined,
  tokenId?: string | number,
): { label: string | null; key: BabyMarcoRarityKey | null; tier: BabyMarcoRarityTierConfig | null } {
  const label = parseRarityLabelFromDescription(description)
  if (label) {
    const tier = getBabyMarcoTierByMetadataLabel(label)
    return { label: tier?.metadataLabels[0] ?? label, key: tier?.key ?? null, tier }
  }
  if (tokenId != null) {
    const tier = getBabyMarcoTierByTokenId(tokenId)
    return {
      label: tier?.metadataLabels[0] ?? null,
      key: tier?.key ?? null,
      tier,
    }
  }
  return { label: null, key: null, tier: null }
}

export function normalizeBabyMarcoMetadata(
  raw: Record<string, unknown>,
  tokenId: string | number,
): BabyMarcoTokenMetadata {
  const description = typeof raw.description === 'string' ? raw.description : ''
  const name = typeof raw.name === 'string' ? raw.name : `Identity #${tokenId}`
  const image =
    typeof raw.image === 'string' ? raw.image : getBabyMarcoImageUri(tokenId)
  const attributes = Array.isArray(raw.attributes)
    ? raw.attributes
        .filter((a): a is { trait_type: string; value: string | number } =>
          Boolean(a && typeof a === 'object' && 'trait_type' in a),
        )
        .map((a) => ({
          trait_type: String((a as { trait_type: unknown }).trait_type),
          value: (a as { value: string | number }).value,
        }))
    : undefined

  const { label, key, tier } = resolveRarityFromMetadata(description, tokenId)

  return {
    name,
    description,
    image,
    attributes,
    rarityLabel: label,
    rarityKey: key,
    tier,
  }
}

export async function fetchBabyMarcoTokenMetadata(
  tokenId: string | number,
  fetchImpl: typeof fetch = fetch,
): Promise<BabyMarcoTokenMetadata> {
  const uri = getBabyMarcoMetadataUri(tokenId)
  const res = await fetchImpl(uri)
  if (!res.ok) {
    throw new Error(`BabyMARCO metadata fetch failed (${res.status}) for token ${tokenId}`)
  }
  const raw = (await res.json()) as Record<string, unknown>
  return normalizeBabyMarcoMetadata(raw, tokenId)
}
