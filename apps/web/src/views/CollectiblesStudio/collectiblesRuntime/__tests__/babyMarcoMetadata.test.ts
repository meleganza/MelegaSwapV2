import {
  BABYMARCO_GENESIS_RARITY_TIERS,
  getBabyMarcoTierByMetadataLabel,
  getBabyMarcoTierByTokenId,
} from 'registry/collectibles/babymarco-genesis-identity.config'
import {
  normalizeBabyMarcoMetadata,
  parseRarityLabelFromDescription,
  resolveRarityFromMetadata,
} from '../babyMarcoMetadata'

describe('babyMarcoMetadata', () => {
  it('parses rarity label from IPFS metadata description', () => {
    expect(parseRarityLabelFromDescription('Rarity: Normal')).toBe('Normal')
    expect(parseRarityLabelFromDescription('Rarity: Super Super Rare')).toBe('Super Super Rare')
    expect(parseRarityLabelFromDescription('Rarity: rare')).toBe('rare')
  })

  it('resolves rarity tier from metadata label without hardcoding display strings in components', () => {
    const tier = getBabyMarcoTierByMetadataLabel('Super Rare')
    expect(tier?.key).toBe('super_rare')
    expect(tier?.supply).toBe(130)
  })

  it('falls back to token id range when metadata description is missing', () => {
    const resolved = resolveRarityFromMetadata(undefined, 850)
    expect(resolved.key).toBe('super_rare')
    expect(resolved.label).toBe('Super Rare')
  })

  it('normalizes raw IPFS JSON into identity token metadata', () => {
    const meta = normalizeBabyMarcoMetadata(
      {
        description: 'Rarity: Normal',
        name: 'dog #1',
        attributes: [{ trait_type: 'Background', value: 'Blue' }],
      },
      1,
    )
    expect(meta.name).toBe('dog #1')
    expect(meta.rarityKey).toBe('normal')
    expect(meta.tier?.priceMarco).toBe(25_000)
  })

  it('exposes canonical supply tiers from configuration', () => {
    const total = BABYMARCO_GENESIS_RARITY_TIERS.reduce((sum, t) => sum + t.supply, 0)
    expect(total).toBe(1000)
    expect(getBabyMarcoTierByTokenId(950)?.key).toBe('super_super_rare')
  })

  it('reads live metadata from IPFS gateway', async () => {
    const { fetchBabyMarcoTokenMetadata } = await import('../babyMarcoMetadata')
    const meta = await fetchBabyMarcoTokenMetadata(1)
    expect(meta.rarityLabel).toBe('Normal')
    expect(meta.name).toMatch(/dog #1/i)
  }, 15000)
})
