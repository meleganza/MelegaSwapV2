import { describe, expect, it } from 'vitest'
import { getAllCollectibles } from '../getAllCollectibles'
import { getCollectibleBySlug, getLiveCollectibles } from '../getCollectibleBySlug'
import {
  serializeCollectibleManifest,
  serializeCollectiblesRegistryIndex,
  serializeCollectiblesWellKnown,
} from '../collectible-manifest'
import { STATIC_COLLECTIBLE_RECORDS } from '../collectibles.data'
import {
  DETECTED_BABYMARCO_GENESIS_NFT_BSC,
  DETECTED_NFT_ROUTES,
} from '../collectible-constants'

describe('collectibles.data', () => {
  it('seeds three civilization collectible records', () => {
    expect(STATIC_COLLECTIBLE_RECORDS).toHaveLength(3)
    expect(getCollectibleBySlug('babymarco-genesis')).toBeDefined()
    expect(getCollectibleBySlug('masterm-identity')).toBeDefined()
    expect(getCollectibleBySlug('achievement-collectibles')).toBeDefined()
  })

  it('indexes BabyMarco Genesis as live legacy with detected contract and mint route', () => {
    const babyMarco = getCollectibleBySlug('babymarco-genesis')!
    expect(babyMarco.status).toBe('live_or_legacy_existing')
    expect(babyMarco.category).toBe('mascot_ecosystem')
    expect(babyMarco.contract.address).toBe(DETECTED_BABYMARCO_GENESIS_NFT_BSC)
    expect(babyMarco.mint.route).toBe(DETECTED_NFT_ROUTES.mint)
    expect(babyMarco.metadata.status).toBe('pinata_ipfs')
    expect(babyMarco.supply.mintedCountIndexed).toBe(false)
  })

  it('does not fake MasterM contract or mint route', () => {
    const masterM = getCollectibleBySlug('masterm-identity')!
    expect(masterM.status).toBe('planned_or_external')
    expect(masterM.contract.indexed).toBe(false)
    expect(masterM.contract.address).toBeUndefined()
    expect(masterM.mint.status).toBe('not_indexed')
    expect(masterM.mint.route).toBeUndefined()
  })

  it('marks achievement collectibles as planned with no fake supply', () => {
    const achievements = getCollectibleBySlug('achievement-collectibles')!
    expect(achievements.status).toBe('planned')
    expect(achievements.supply.mode).toBe('planned_collection')
    expect(achievements.supply.statedMaxSupply).toBeUndefined()
    expect(achievements.warnings.some((warning) => warning.includes('Planned'))).toBe(true)
  })

  it('uses supply source from UI copy only for BabyMarco — no fake minted counts', () => {
    const babyMarco = getCollectibleBySlug('babymarco-genesis')!
    expect(babyMarco.supply.statedMaxSupply).toBe(1000)
    expect(babyMarco.supply.supplySource).toBe('ui_marketing_copy')
    getAllCollectibles().forEach((record) => {
      expect(record.supply.mintedCountIndexed).toBe(false)
    })
  })

  it('links live collectibles to legacy routes without duplicating mint logic', () => {
    const live = getLiveCollectibles()
    expect(live).toHaveLength(1)
    expect(live[0].links.mint).toBe('/nft/')
    expect(live[0].relatedRoutes).toContain('/viewNFTs/')
    expect(live[0].relatedRoutes).toContain('/nftmarket/')
  })
})

describe('collectibles manifest', () => {
  it('serializes collectible manifest with schema', () => {
    const record = getCollectibleBySlug('babymarco-genesis')!
    const manifest = serializeCollectibleManifest(record)
    expect(manifest.$schema).toBe('https://melega.finance/schemas/collectibles/v1')
    expect(manifest.collectible_id).toContain('babymarco-genesis')
    expect((manifest.mint as { route: string }).route).toBe('/nft/')
  })

  it('serializes registry index with all slugs', () => {
    const index = serializeCollectiblesRegistryIndex()
    expect(index.manifest).toContain('collectibles-registry')
    expect((index.collectibles as unknown[]).length).toBe(3)
    expect(index.framing).toContain('Civilization Collectibles')
  })

  it('serializes well-known discovery document with legacy routes', () => {
    const wellKnown = serializeCollectiblesWellKnown()
    expect(wellKnown.index).toBe('/registry/collectibles/index.json')
    expect((wellKnown.legacy_nft_routes as { mint: string }).mint).toBe('/nft/')
    expect(wellKnown.ui).toBe('/collectibles')
  })
})
