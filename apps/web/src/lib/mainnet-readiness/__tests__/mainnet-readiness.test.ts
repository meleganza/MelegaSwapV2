import { describe, expect, it } from 'vitest'
import {
  BLOCKERS,
  MISSION_BRANCH_LINEAGE,
  RECOMMENDED_MERGE_ORDER,
  resolveMainnetReadinessGate,
  SURFACE_READINESS,
} from '../mainnet-readiness-data'
import { serializeMainnetReadinessManifest } from '../mainnet-readiness-serializer'

describe('mainnet readiness gate', () => {
  it('defines branch lineage from Organ 01 through Mission 18', () => {
    expect(MISSION_BRANCH_LINEAGE).toHaveLength(16)
    expect(MISSION_BRANCH_LINEAGE[0].id).toBe('organ01')
    expect(MISSION_BRANCH_LINEAGE.at(-1)?.id).toBe('mission18')
    expect(RECOMMENDED_MERGE_ORDER.at(-1)).toBe('mission18-navigation-surface-map')
  })

  it('classifies all audited public routes', () => {
    const routes = SURFACE_READINESS.map((surface) => surface.route)
    expect(routes).toContain('/trade')
    expect(routes).toContain('/ilo')
    expect(routes).toContain('/map')
    expect(routes).toContain('/collectibles')
  })

  it('marks core DEX as production_safe and ILO as retired', () => {
    const swap = SURFACE_READINESS.find((surface) => surface.id === 'swap')!
    const ilo = SURFACE_READINESS.find((surface) => surface.id === 'ilo')!
    expect(swap.classification).toBe('production_safe')
    expect(ilo.classification).toBe('retired')
  })

  it('reports conditional_go with blockers and next mission', () => {
    const gate = resolveMainnetReadinessGate()
    expect(gate.verdict).toBe('conditional_go')
    expect(gate.audit_type).toBe('read_only')
    expect(BLOCKERS.length).toBeGreaterThan(0)
    expect(gate.next_mission).toContain('Mission 20')
  })

  it('confirms forbidden files untouched in missions 09–18', () => {
    const gate = resolveMainnetReadinessGate()
    const exchange = gate.forbidden_files.find((file) => file.path.includes('exchange.ts'))!
    expect(exchange.status).toBe('unchanged')
    const wagmi = gate.forbidden_files.find((file) => file.path.includes('wagmi.ts'))!
    expect(wagmi.status).toBe('pre_mission_change')
  })

  it('serializes machine manifest', () => {
    const manifest = serializeMainnetReadinessManifest()
    expect(manifest.manifest).toContain('mainnet-readiness-gate')
    expect(manifest.registry_manifests).toContain('/registry/readiness/mainnet-gate.json')
    expect(manifest.routes_added).toContain('/identity')
  })
})
