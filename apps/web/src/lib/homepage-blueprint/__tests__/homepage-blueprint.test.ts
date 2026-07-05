import { describe, expect, it } from 'vitest'
import {
  CORE_SURFACES,
  MISSION_22_PLAN,
  REMOVE_FROM_HOMEPAGE,
  resolveHomepageBlueprint,
} from '../homepage-blueprint-data'
import { serializeHomepageBlueprintManifest } from '../homepage-blueprint-serializer'

describe('homepage blueprint', () => {
  it('defines CORE four as Swap Workspace Launch Map', () => {
    expect(CORE_SURFACES.map((surface) => surface.id)).toEqual(['swap', 'workspace', 'launch', 'map'])
    expect(CORE_SURFACES.every((surface) => surface.tier === 'core')).toBe(true)
  })

  it('requires removal of NFT mint and ILO carousel from homepage', () => {
    expect(REMOVE_FROM_HOMEPAGE.some((item) => item.includes('NFT mint'))).toBe(true)
    expect(REMOVE_FROM_HOMEPAGE.some((item) => item.includes('ILO carousel'))).toBe(true)
  })

  it('places launch at /launch not /ilo', () => {
    const launch = CORE_SURFACES.find((surface) => surface.id === 'launch')!
    expect(launch.route).toBe('/build-studio#build-import')
    expect(launch.notes).toContain('NOT point to /ilo')
  })

  it('keeps legacy surfaces compatible but demoted', () => {
    const blueprint = resolveHomepageBlueprint()
    const ilo = blueprint.hierarchy.legacy.find((surface) => surface.id === 'ilo')!
    expect(ilo.promotion).toBe('legacy_compat')
    const nft = blueprint.hierarchy.legacy.find((surface) => surface.id === 'nft_mint')!
    expect(nft.promotion).toBe('remove_from_home')
  })

  it('defines constitutional MARCO framing', () => {
    const blueprint = resolveHomepageBlueprint()
    expect(blueprint.constitutional.canonicalAsset).toBe('MARCO')
    expect(blueprint.constitutional.canonicalChain).toBe('BNB Chain')
  })

  it('serializes machine blueprint manifest', () => {
    const manifest = serializeHomepageBlueprintManifest()
    expect(manifest.manifest).toContain('homepage-entry-point-blueprint')
    expect(manifest.mission22Plan).toEqual(MISSION_22_PLAN)
    expect(manifest.surfacesPromoted).toContain('map')
  })
})
