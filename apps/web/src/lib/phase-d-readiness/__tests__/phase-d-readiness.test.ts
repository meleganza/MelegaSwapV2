import { describe, expect, it } from 'vitest'
import {
  PHASE_D_FORBIDDEN_FILES,
  PHASE_D_MANIFESTS,
  PHASE_D_MISSION_LINEAGE,
  PHASE_D_MISSION_TEST_PATHS,
  PHASE_D_ROUTES,
  resolvePhaseDConsolidationGate,
} from '../phase-d-readiness-data'
import { serializePhaseDConsolidationManifest } from '../phase-d-readiness-serializer'

const validation = {
  mission_tests: 'passed',
  build: 'passed',
  routes: 'verified',
  manifests: 'verified',
  forbidden_files: 'unchanged',
} as const

describe('phase d consolidation gate', () => {
  it('defines mission 22 through 31 lineage', () => {
    expect(PHASE_D_MISSION_LINEAGE).toHaveLength(10)
    expect(PHASE_D_MISSION_LINEAGE[0].mission).toBe(22)
    expect(PHASE_D_MISSION_LINEAGE.at(-1)?.mission).toBe(31)
    expect(PHASE_D_MISSION_LINEAGE.map((m) => m.id)).toEqual([
      'mission22',
      'mission23',
      'mission24',
      'mission25',
      'mission26',
      'mission27',
      'mission28',
      'mission29',
      'mission30',
      'mission31',
    ])
  })

  it('lists all required routes', () => {
    const routes = PHASE_D_ROUTES.map((r) => r.route)
    expect(routes).toContain('/')
    expect(routes).toContain('/pipeline')
    expect(routes).toContain('/dry-run')
    expect(routes).toContain('/swap')
    expect(routes).toContain('/pools')
    expect(PHASE_D_ROUTES).toHaveLength(14)
  })

  it('lists all required manifests', () => {
    const uris = PHASE_D_MANIFESTS.map((m) => m.uri)
    expect(uris).toContain('/registry/homepage/index.json')
    expect(uris).toContain('/registry/dry-runs/civilization-dry-run.json')
    expect(uris).toContain('/registry/readiness/phase-d-consolidation.json')
    expect(PHASE_D_MANIFESTS).toHaveLength(11)
  })

  it('audits forbidden files as unchanged from safe base', () => {
    PHASE_D_FORBIDDEN_FILES.forEach((file) => {
      expect(file.unchangedFromBase).toBe(true)
      expect(file.baseCommit).toBe('24f480d')
    })
  })

  it('defines mission test paths for phase d stack', () => {
    expect(PHASE_D_MISSION_TEST_PATHS).toHaveLength(11)
    expect(PHASE_D_MISSION_TEST_PATHS).toContain('src/lib/civilization-dry-run')
  })

  it('resolves release_candidate verdict with read-only gate', () => {
    const gate = resolvePhaseDConsolidationGate(validation)
    expect(gate.verdict).toBe('release_candidate')
    expect(gate.read_only).toBe(true)
    expect(gate.execution_enabled).toBe(false)
    expect(gate.registry_mutation_enabled).toBe(false)
  })

  it('serializes public consolidation manifest', () => {
    const manifest = serializePhaseDConsolidationManifest(validation)
    expect(manifest.gate).toContain('phase-d-consolidation')
    expect(manifest.lineage).toHaveLength(10)
    expect(manifest.validation.mission_tests).toBe('passed')
  })
})
