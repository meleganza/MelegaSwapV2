import { describe, expect, it, beforeEach } from 'vitest'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { enrichProject } from 'registry/projects/discovery'
import { resetPendingProjectRegistryForTests } from 'registry/projects/pending'
import { runImportAnalysis } from 'views/BuildStudio/buildRuntime/buildImportAnalysis'
import { buildAiManifest } from 'views/BuildStudio/buildRuntime/buildManifest'

describe('importExistingTokenRuntime', () => {
  const project = enrichProject(getAllProjects()[0])
  const token = project.resources.tokens[0]

  beforeEach(() => {
    resetPendingProjectRegistryForTests()
  })

  it('rejects empty contract input', () => {
    const result = runImportAnalysis('', 'bnb')
    expect(result.errors.some((e) => e.code === 'NO_CONTRACT')).toBe(true)
    expect(result.found).toBe(false)
  })

  it('resolves known contract to canonical project', () => {
    const result = runImportAnalysis(token.address, 'bnb')
    expect(result.found).toBe(true)
    expect(result.project?.slug).toBe(project.slug)
    expect(result.detections.some((d) => d.label === 'Contract' && d.available)).toBe(true)
  })

  it('creates pending profile for unknown contract', () => {
    const result = runImportAnalysis('0x0000000000000000000000000000000000000001', 'bnb')
    expect(result.pending).toBe(true)
    expect(result.pendingProject?.is_canonical).toBe(false)
    expect(result.score.reason).toMatch(/pending/i)
  })

  it('does not fabricate unavailable detections as available for pending', () => {
    const result = runImportAnalysis('0x0000000000000000000000000000000000000001', 'bnb')
    const liquidity = result.detections.find((d) => d.label === 'Liquidity')
    expect(liquidity?.available).toBe(false)
  })

  it('generates machine manifest from analysis', () => {
    const result = runImportAnalysis(token.address, 'bnb')
    const manifest = buildAiManifest(result.project, token.address)
    expect(manifest.schema).toContain('build-manifest')
    expect(manifest.status).toMatch(/ready|incomplete|pending/)
  })
})
