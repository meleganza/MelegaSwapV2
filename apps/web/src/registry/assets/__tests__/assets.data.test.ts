import { describe, expect, it } from 'vitest'
import { getProjectBySlug } from '../../projects/getProjectBySlug'
import { STATIC_ASSETS } from '../assets.data'
import { getAllAssets } from '../getAllAssets'
import { getAssetBySlug, getAssetsByProjectSlug } from '../getAssetBySlug'
import { serializeAssetManifest, serializeAssetRegistryIndex } from '../manifest'

describe('assets.data', () => {
  it('derives MARCO assets from Organ 01 token refs', () => {
    const project = getProjectBySlug('melega-dex')
    expect(STATIC_ASSETS).toHaveLength(project?.resources.tokens.length ?? 0)
    STATIC_ASSETS.forEach((asset, index) => {
      const token = project!.resources.tokens[index]
      expect(asset.legacyRef).toBe(token.ref)
      expect(asset.contractAddress).toBe(token.address)
      expect(asset.chainId).toBe(token.chainId)
      expect(asset.projectBinding.projectUpi).toBe(project!.upi)
    })
  })

  it('uses honest observed lifecycle — no fake verified', () => {
    STATIC_ASSETS.forEach((asset) => {
      expect(asset.lifecycle).toBe('observed')
      expect(asset.trust.verificationStatus).toBe('observed')
      expect(asset.trust.badges).not.toContain('verified')
    })
  })

  it('has unique slugs and UAIs', () => {
    const slugs = STATIC_ASSETS.map((a) => a.slug)
    const uais = STATIC_ASSETS.map((a) => a.uai)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(uais).size).toBe(uais.length)
  })

  it('primary slug marco maps to BSC deployment', () => {
    const marco = getAssetBySlug('marco')
    expect(marco?.chainId).toBe(56)
    expect(marco?.symbol).toBe('MARCO')
  })

  it('relationships are not indexed in MVP', () => {
    STATIC_ASSETS.forEach((asset) => {
      expect(asset.relationships.relationshipStatus).toBe('not_indexed')
      expect(asset.relationships.liquidityPools).toHaveLength(0)
    })
  })
})

describe('manifest', () => {
  it('serializes asset manifest with required provenance fields', () => {
    const asset = getAssetBySlug('marco')!
    const manifest = serializeAssetManifest(asset)
    expect(manifest.$schema).toBe('https://melega.finance/schemas/asset/v1')
    expect(manifest.data_source).toBe('asset-registry-static')
    expect(manifest.as_of).toBeTruthy()
    expect(manifest.disclaimer).toContain('Listed ≠ audited')
    expect(manifest.legacy_ref).toBe(asset.legacyRef)
  })

  it('serializes registry index with all assets', () => {
    const index = serializeAssetRegistryIndex()
    expect(index.api_version).toBe('0.1.0')
    expect((index.assets as unknown[]).length).toBe(getAllAssets().length)
  })
})

describe('getAssetsByProjectSlug', () => {
  it('returns all MARCO assets for melega-dex', () => {
    expect(getAssetsByProjectSlug('melega-dex')).toHaveLength(4)
  })
})
