import { describe, expect, it } from 'vitest'
import { getProjectBySlug } from '../getProjectBySlug'
import {
  computeHealthMetrics,
  computeIdentityCompleteness,
  getConnectedChainLabels,
  mapCapabilityToDisplayStatus,
  serializeProjectManifest,
} from '../intelligence'

describe('intelligence', () => {
  const project = getProjectBySlug('melega-dex')!

  it('maps capability statuses to display states', () => {
    expect(mapCapabilityToDisplayStatus('live')).toBe('live')
    expect(mapCapabilityToDisplayStatus('partial')).toBe('connected')
    expect(mapCapabilityToDisplayStatus('planned')).toBe('planned')
    expect(mapCapabilityToDisplayStatus('finished')).toBe('deprecated')
    expect(mapCapabilityToDisplayStatus('none')).toBe('unavailable')
  })

  it('computes identity completeness from static fields', () => {
    const score = computeIdentityCompleteness(project)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns connected chain labels without fake data', () => {
    const chains = getConnectedChainLabels(project)
    expect(chains).toEqual(['BSC', 'Ethereum', 'Polygon', 'Base'])
  })

  it('health metrics use honest observability and treasury states', () => {
    const health = computeHealthMetrics(project)
    expect(health.observabilityReadiness).toBe('planned')
    expect(health.machineManifestAvailable).toBe(true)
    expect(health.treasuryCompatibility).toBe('planned')
  })

  it('serializes machine manifest with intelligence block', () => {
    const manifest = serializeProjectManifest(project)
    expect(manifest.upi).toBe(project.upi)
    expect(manifest.slug).toBe('melega-dex')
    expect(manifest.intelligence).toMatchObject({
      data_source: 'project-registry-static',
      observability_readiness: 'planned',
    })
    expect(manifest.capabilities).toEqual(project.capabilities)
  })
})
