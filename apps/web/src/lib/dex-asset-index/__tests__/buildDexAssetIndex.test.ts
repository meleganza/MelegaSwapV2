import { describe, expect, it } from 'vitest'
import { buildDexAssetIndex, buildDexAssetIndexPayload } from '../buildDexAssetIndex'
import { dexIndexToEnrichedProjects, buildDexTokenIndex } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'

describe('buildDexAssetIndex R730A', () => {
  it('indexes more project-surface assets than the legacy 3-token cap', () => {
    const payload = buildDexAssetIndexPayload()
    expect(payload.assetCount).toBeGreaterThan(3)
    expect(payload.projectSurfaceCount).toBeGreaterThan(3)
    expect(payload.trendingSurfaceCount).toBeGreaterThan(3)
  })

  it('includes canonical MARCO with logo fallback metadata', () => {
    const marco = buildDexAssetIndex().find((a) => a.symbol === 'MARCO' && a.chainId === 56)
    expect(marco).toBeDefined()
    expect(marco?.sources).toContain('canonical')
    expect(marco?.logoFallback).toBe('initials')
    expect(marco?.surfaces.project).toBe(true)
  })

  it('feeds expanded enriched projects for radar/trending/projects runtimes', () => {
    const enriched = dexIndexToEnrichedProjects(buildDexTokenIndex())
    expect(enriched.length).toBeGreaterThan(3)
  })
})
