import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { runImportAnalysis } from '../buildImportAnalysis'
import { buildInfrastructureScore } from '../buildInfrastructureScore'
import { buildAiManifest } from '../buildManifest'
import { createBuildRuntimeError } from '../buildRuntimeErrors'

describe('buildRuntime', () => {
  const projects = getAllProjects().map(enrichProject)
  const project = projects[0]
  const token = project.resources.tokens[0]

  it('runs import analysis for known contract', () => {
    const result = runImportAnalysis(token.address, 'bnb')
    expect(result.found).toBe(true)
    expect(result.score.score).toBeGreaterThan(0)
    expect(result.detections.some((d) => d.label === 'Ticker' && d.available)).toBe(true)
  })

  it('returns PROJECT_NOT_FOUND for unknown contract', () => {
    const result = runImportAnalysis('0x0000000000000000000000000000000000000001', 'bnb')
    expect(result.found).toBe(false)
    expect(result.errors[0].code).toBe('PROJECT_NOT_FOUND')
  })

  it('builds infrastructure score with reason', () => {
    const score = buildInfrastructureScore(project)
    expect(score.score).toBeLessThanOrEqual(100)
    expect(score.reason).toContain('Infrastructure')
  })

  it('generates manifest from runtime', () => {
    const manifest = buildAiManifest(project, token.address)
    expect(manifest.schema).toContain('build-manifest')
    expect(manifest.configuration.contract).toBe(token.address)
  })

  it('exposes error catalog', () => {
    const err = createBuildRuntimeError('INFRASTRUCTURE_INCOMPLETE')
    expect(err.code).toBe('INFRASTRUCTURE_INCOMPLETE')
  })
})
