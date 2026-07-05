import { describe, expect, it } from 'vitest'
import { PLACEHOLDER_ADDRESS_SLUG } from '../identity-constants'
import { resolveEconomicIdentityReadModel } from '../identity-read-model'
import { computeAgentReadinessScore } from '../identity-scores'
import { serializeEconomicIdentityManifest } from '../identity-serializer'

describe('economic identity read model', () => {
  it('resolves read-only identity without social profile or KYC framing', () => {
    const model = resolveEconomicIdentityReadModel()
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
    expect(model.isSocialProfile).toBe(false)
    expect(model.isKyc).toBe(false)
    expect(model.isAccountCreation).toBe(false)
    expect(model.disclaimer).toContain('Not a social profile')
  })

  it('shows wallet_not_connected on default /identity surface', () => {
    const model = resolveEconomicIdentityReadModel()
    expect(model.wallet.status).toBe('wallet_not_connected')
    expect(model.wallet.address).toBeNull()
    expect(model.wallet.holdingsIndexed).toBe(false)
    expect(model.wallet.addressIndexed).toBe(false)
  })

  it('shows not_indexed for placeholder address route without fake reads', () => {
    const model = resolveEconomicIdentityReadModel({ addressParam: PLACEHOLDER_ADDRESS_SLUG })
    expect(model.wallet.status).toBe('not_indexed')
    expect(model.wallet.holdingsIndexed).toBe(false)
    expect(model.wallet.notes).toContain('Placeholder')
  })

  it('accepts EVM address shape as not_indexed only — no fake ownership', () => {
    const model = resolveEconomicIdentityReadModel({
      addressParam: '0x2A0356b52d33c5e359eF289B8Da37eD73A6C9CE5',
    })
    expect(model.wallet.status).toBe('not_indexed')
    expect(model.wallet.address).toBe('0x2A0356b52d33c5e359eF289B8Da37eD73A6C9CE5')
    expect(model.wallet.holdingsIndexed).toBe(false)
    expect(model.wallet.notes).toContain('No balances')
  })

  it('exposes all required identity sections', () => {
    const model = resolveEconomicIdentityReadModel()
    const sectionIds = model.sections.map((section) => section.id)
    expect(sectionIds).toContain('identity_role')
    expect(sectionIds).toContain('wallet')
    expect(sectionIds).toContain('workspace')
    expect(sectionIds).toContain('projects')
    expect(sectionIds).toContain('assets')
    expect(sectionIds).toContain('liquidity')
    expect(sectionIds).toContain('collectibles')
    expect(sectionIds).toContain('launch')
    expect(sectionIds).toContain('activation')
    expect(sectionIds).toContain('presence')
    expect(sectionIds).toContain('execution')
  })

  it('seeds seven identity archetypes', () => {
    const model = resolveEconomicIdentityReadModel()
    expect(model.archetypes).toHaveLength(7)
    expect(model.archetypes.map((archetype) => archetype.id)).toEqual(
      expect.arrayContaining([
        'human_operator',
        'ai_agent',
        'project_operator',
        'liquidity_provider',
        'collector',
        'launcher',
        'observer',
      ]),
    )
  })

  it('does not include fake balances or NFT holdings in section items', () => {
    const model = resolveEconomicIdentityReadModel()
    const serialized = JSON.stringify(model.sections)
    expect(serialized).not.toMatch(/balance:\s*\d|owns\s+\d|minted:\s*\d/i)
    expect(serialized).not.toMatch(/TVL:\s*\$\d/i)
  })

  it('computes illustrative agent-readiness from indexed surfaces', () => {
    const model = resolveEconomicIdentityReadModel()
    expect(model.agentReadiness.illustrative).toBe(true)
    expect(model.agentReadiness.score).toBeGreaterThanOrEqual(0)
    expect(model.agentReadiness.score).toBeLessThanOrEqual(100)
    expect(model.agentReadiness.dimensions.length).toBeGreaterThan(0)
  })

  it('links cross-surfaces to workspace launch and collectibles', () => {
    const model = resolveEconomicIdentityReadModel()
    expect(model.crossLinks.workspace).toBe('/command-center')
    expect(model.crossLinks.launch).toBe('/build-studio#build-import')
    expect(model.crossLinks.collectibles).toBe('/collectibles')
  })
})

describe('agent readiness score', () => {
  it('returns observer label for empty sections', () => {
    const score = computeAgentReadinessScore([])
    expect(score.score).toBe(0)
    expect(score.label).toBe('observer')
    expect(score.illustrative).toBe(true)
  })
})

describe('economic identity manifest', () => {
  it('serializes machine manifest as read-only', () => {
    const manifest = serializeEconomicIdentityManifest()
    expect(manifest.manifest).toContain('economic-identity')
    expect(manifest.read_only).toBe(true)
    expect(manifest.execution_enabled).toBe(false)
    expect(manifest.framing.is_social_profile).toBe(false)
    expect(manifest.framing.is_kyc).toBe(false)
    expect(manifest.sections.length).toBeGreaterThanOrEqual(11)
  })
})
