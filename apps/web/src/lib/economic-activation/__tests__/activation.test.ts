import { describe, expect, it } from 'vitest'
import {
  getConstitutionalCanonicalEconomy,
  resolveActivationForProject,
  resolveLabsActivationPreview,
  serializeActivationManifest,
} from '../index'

describe('economic activation read model', () => {
  it('exposes immutable constitutional canonical economy', () => {
    const canonical = getConstitutionalCanonicalEconomy()
    expect(canonical.canonicalChain).toBe('BNB Chain')
    expect(canonical.canonicalAsset).toBe('MARCO')
    expect(canonical.status).toBe('LIVE')
    expect(canonical.immutable).toBe(true)
  })

  it('returns labs preview pipeline without fake projects', () => {
    const preview = resolveLabsActivationPreview()
    expect(preview.mode).toBe('labs_preview')
    expect(preview.projectSlug).toBeUndefined()
    expect(preview.labsConnected).toBe(false)
    expect(preview.stages).toHaveLength(11)
    expect(preview.stages[0].id).toBe('narrative')
    expect(preview.stages[0].status).toBe('WAITING')
  })

  it('derives melega-dex activation from registry only', () => {
    const derived = resolveActivationForProject('melega-dex')
    expect(derived?.mode).toBe('project_derived')
    expect(derived?.stages.find((s) => s.id === 'project_registry')?.status).toBe('READY')
    expect(derived?.stages.find((s) => s.id === 'venue_activation')?.status).toBe('READY')
    expect(derived?.stages.find((s) => s.id === 'treasury_runtime')?.status).toBe('PLANNED')
  })

  it('serializes machine-readable manifest without undefined', () => {
    const manifest = serializeActivationManifest(resolveLabsActivationPreview())
    expect(manifest.manifest).toContain('economic-activation')
    expect(manifest.canonical_economy.canonicalAsset).toBe('MARCO')
    expect(manifest.pipeline.length).toBe(11)
  })

  it('includes solana as planned economic presence only', () => {
    const preview = resolveLabsActivationPreview()
    const solana = preview.presenceTargets.find((t) => t.chainId === 'solana')
    expect(solana?.role).toBe('presence')
    expect(solana?.status).toBe('PLANNED')
  })
})
