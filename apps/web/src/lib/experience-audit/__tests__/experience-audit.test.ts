import { describe, expect, it } from 'vitest'
import {
  CRITICAL_FINDINGS,
  EXPERIENCE_AUDIT_SCORES,
  SURFACE_EXPERIENCE_AUDITS,
  resolveAiAgentExperienceAudit,
} from '../experience-audit-data'
import { serializeAiAgentExperienceManifest } from '../experience-audit-serializer'

describe('ai agent experience audit', () => {
  it('audits all required public surfaces', () => {
    const ids = SURFACE_EXPERIENCE_AUDITS.map((surface) => surface.id)
    expect(ids).toContain('projects')
    expect(ids).toContain('map')
    expect(ids).toContain('ilo')
    expect(ids).toContain('nft_legacy')
    expect(ids).toContain('swap')
    expect(SURFACE_EXPERIENCE_AUDITS.length).toBeGreaterThanOrEqual(19)
  })

  it('scores D87 dimensions with overall below production-ready threshold', () => {
    expect(EXPERIENCE_AUDIT_SCORES.overallD87).toBe(60)
    expect(EXPERIENCE_AUDIT_SCORES.navigation).toBeLessThan(50)
    expect(EXPERIENCE_AUDIT_SCORES.machineReadability).toBeGreaterThan(70)
  })

  it('flags launch menu misroute as critical', () => {
    expect(CRITICAL_FINDINGS.some((finding) => finding.includes('/ilo'))).toBe(true)
    const launch = SURFACE_EXPERIENCE_AUDITS.find((surface) => surface.id === 'launch')!
    expect(launch.navigationRecommendation).toBe('alias')
  })

  it('promotes map as primary orientation surface', () => {
    const map = SURFACE_EXPERIENCE_AUDITS.find((surface) => surface.id === 'map')!
    expect(map.betterPromoted).toBe(true)
    expect(map.aiUnderstanding).toBeGreaterThanOrEqual(95)
  })

  it('defines four persona journeys', () => {
    const audit = resolveAiAgentExperienceAudit()
    expect(audit.journeys).toHaveLength(4)
    expect(audit.journeys.map((journey) => journey.persona)).toContain('AI Agent')
  })

  it('serializes machine manifest', () => {
    const manifest = serializeAiAgentExperienceManifest()
    expect(manifest.manifest).toContain('ai-agent-experience-audit')
    expect(manifest.audit_type).toBe('read_only')
    expect(manifest.recommendedMission22).toContain('Mission 22')
  })
})
