import { describe, expect, it } from 'vitest'
import { getProjectBySlug } from '../getProjectBySlug'
import { getAllProjects } from '../getAllProjects'
import {
  buildSearchableText,
  computeCivilizationReadiness,
  computeDiscoverySummary,
  discoverProjects,
  enrichProject,
  filterProjects,
  getProjectTickers,
  serializeMachineDiscovery,
  sortProjects,
} from '../discovery'

describe('discovery', () => {
  const project = getProjectBySlug('melega-dex')!
  const enriched = enrichProject(project)

  it('extracts tickers from registry tokens only', () => {
    expect(getProjectTickers(project)).toEqual(['MARCO'])
  })

  it('builds searchable text from registry fields', () => {
    const text = buildSearchableText(project)
    expect(text).toContain('melega-dex')
    expect(text).toContain('marco')
    expect(text).toContain('smartdrop')
    expect(text).toContain('treasury')
  })

  it('computes civilization readiness as ecosystem integration score', () => {
    const score = computeCivilizationReadiness(project)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
    expect(enriched.civilizationReadiness).toBe(score)
  })

  it('filters by full-text query', () => {
    const all = getAllProjects().map(enrichProject)
    expect(filterProjects(all, { query: 'marco' })).toHaveLength(1)
    expect(filterProjects(all, { query: 'nonexistent-project' })).toHaveLength(0)
  })

  it('filters by chain and capability chips', () => {
    const all = getAllProjects().map(enrichProject)
    expect(filterProjects(all, { chains: [56] })).toHaveLength(1)
    expect(filterProjects(all, { capabilities: ['tradable', 'farm'] })).toHaveLength(1)
    expect(filterProjects(all, { capabilities: ['treasuryCompatible'] })).toHaveLength(0)
  })

  it('filters machine manifest and treasury status honestly', () => {
    const all = getAllProjects().map(enrichProject)
    expect(filterProjects(all, { machineManifest: 'live' })).toHaveLength(1)
    expect(filterProjects(all, { treasury: 'partial_or_live' })).toHaveLength(0)
    expect(filterProjects(all, { treasury: 'planned' })).toHaveLength(1)
  })

  it('sorts projects deterministically', () => {
    const all = getAllProjects().map(enrichProject)
    const alpha = sortProjects(all, 'alphabetical')
    expect(alpha[0].slug).toBe('melega-dex')
    const readiness = sortProjects(all, 'civilization_readiness')
    expect(readiness[0].civilizationReadiness).toBeGreaterThan(0)
  })

  it('computes discovery summary from registry data only', () => {
    const results = discoverProjects()
    const summary = computeDiscoverySummary(getAllProjects(), results)
    expect(summary.totalProjects).toBe(1)
    expect(summary.matchingProjects).toBe(1)
    expect(summary.uniqueChains).toBe(4)
    expect(summary.machineReadyProjects).toBe(1)
    expect(summary.treasuryCompatibleProjects).toBe(0)
    expect(summary.liveCapabilityTypes).toBeGreaterThan(0)
  })

  it('serializes machine discovery index', () => {
    const payload = serializeMachineDiscovery()
    expect(payload.api_version).toBe('0.1.0')
    expect(payload.civilization_readiness_formula).toBeDefined()
    expect(Array.isArray(payload.projects)).toBe(true)
    expect((payload.projects as unknown[]).length).toBe(1)
    expect((payload.summary as { machine_ready_projects: number }).machine_ready_projects).toBe(1)
  })
})
