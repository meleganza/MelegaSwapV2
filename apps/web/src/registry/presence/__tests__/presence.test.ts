import { describe, expect, it } from 'vitest'
import { getAllPresence } from '../getAllPresence'
import { getCanonicalPresence, getPresenceByAssetSlug, getPresenceBySlug } from '../getPresenceBySlug'
import {
  serializePresenceManifest,
  serializePresenceRegistryIndex,
  serializePresenceWellKnown,
} from '../presence-manifest'
import { STATIC_PRESENCE_RECORDS } from '../presence.data'
import {
  CONSTITUTIONAL_CANONICAL_ASSET,
  CONSTITUTIONAL_CANONICAL_CHAIN,
  MARCO_CANONICAL_UAI,
} from '../presence-constants'

describe('presence.data', () => {
  it('seeds five presence records including canonical and planned', () => {
    expect(STATIC_PRESENCE_RECORDS).toHaveLength(5)
    expect(getPresenceBySlug('marco-bnb-canonical')).toBeDefined()
    expect(getPresenceBySlug('solana-melega-planned')).toBeDefined()
  })

  it('marks MARCO on BNB Chain as canonical LIVE presence', () => {
    const canonical = getCanonicalPresence()
    expect(canonical?.chainLabel).toBe('BNB Chain')
    expect(canonical?.status).toBe('LIVE')
    expect(canonical?.isCanonical).toBe(true)
    expect(canonical?.liquidityConfidence).toBe('canonical')
    expect(canonical?.canonicalAssetUai).toBe(MARCO_CANONICAL_UAI)
  })

  it('marks non-BNB records as not canonical with warnings', () => {
    const ethereum = getPresenceBySlug('marco-ethereum-presence')!
    expect(ethereum.isCanonical).toBe(false)
    expect(ethereum.liquidityConfidence).toBe('low')
    expect(ethereum.warnings.some((warning) => warning.includes('NOT CANONICAL'))).toBe(true)
  })

  it('uses confidence labels only — no fake liquidity numbers', () => {
    getAllPresence().forEach((record) => {
      expect(['canonical', 'observed', 'low', 'planned', 'not_indexed']).toContain(
        record.liquidityConfidence,
      )
      expect(record.description).not.toMatch(/\$|USD|TVL|liquidity:\s*\d/i)
    })
  })

  it('links presence records to assets graph query and execution where applicable', () => {
    const canonical = getPresenceBySlug('marco-bnb-canonical')!
    expect(canonical.links.asset).toBe('/assets/marco')
    expect(canonical.links.graph).toBe('/graph')
    expect(canonical.links.query).toBe('/query')
    expect(canonical.links.execution).toBe('/execution')
  })

  it('maps asset slugs to presence records', () => {
    const marcoPresence = getPresenceByAssetSlug('marco')
    expect(marcoPresence).toHaveLength(1)
    expect(marcoPresence[0].slug).toBe('marco-bnb-canonical')
  })
})

describe('presence manifest', () => {
  it('serializes presence manifest with constitutional fields', () => {
    const record = getPresenceBySlug('marco-bnb-canonical')!
    const manifest = serializePresenceManifest(record)
    expect(manifest.$schema).toBe('https://melega.finance/schemas/presence/v1')
    expect(manifest.is_canonical).toBe(true)
    expect(manifest.canonical_asset_uai).toBe(MARCO_CANONICAL_UAI)
    expect((manifest.constitutional as { canonical_asset: string }).canonical_asset).toBe(
      CONSTITUTIONAL_CANONICAL_ASSET,
    )
    expect((manifest.constitutional as { canonical_chain: string }).canonical_chain).toBe(
      CONSTITUTIONAL_CANONICAL_CHAIN,
    )
  })

  it('serializes registry index with all slugs', () => {
    const index = serializePresenceRegistryIndex()
    expect(index.manifest).toContain('presence-registry')
    expect((index.presence as unknown[]).length).toBe(5)
  })

  it('serializes well-known discovery document', () => {
    const wellKnown = serializePresenceWellKnown()
    expect(wellKnown.index).toBe('/registry/presence/index.json')
    expect((wellKnown.constitutional as { note: string }).note).toContain('NOT Canonical')
  })
})
