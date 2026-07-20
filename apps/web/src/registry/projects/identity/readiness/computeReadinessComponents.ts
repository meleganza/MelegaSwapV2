import {
  CIVILIZATION_READINESS_CALCULATION_REVISION,
  CIVILIZATION_READINESS_WEIGHTS,
  computeCivilizationReadinessBreakdown,
  type CivilizationReadinessComponentKey,
} from '../../discovery'
import type { StaticProjectRecord } from '../../types'
import type { ProjectEvidencePack } from '../evidence/types'
import {
  READINESS_COMPONENT_IDS,
  READINESS_COMPONENT_LABELS,
  READINESS_COMPONENT_TO_WEIGHT_KEY,
  readinessStateFromScore,
  type ReadinessCheckResult,
  type ReadinessComponentId,
} from './schema'
import type { ReadinessCheck, ReadinessComponentResult, ReadinessOverview } from './types'

function check(
  checkId: string,
  description: string,
  pointContribution: number,
  result: ReadinessCheckResult,
  opts: {
    availability?: ReadinessCheck['availability']
    sourceFields?: string[]
    evidenceIds?: string[]
    reasonCode: string
    required?: boolean
  },
): ReadinessCheck {
  return {
    checkId,
    description,
    pointContribution,
    result,
    availability: opts.availability ?? 'AVAILABLE',
    sourceFields: opts.sourceFields ?? [],
    evidenceIds: opts.evidenceIds ?? [],
    reasonCode: opts.reasonCode,
    required: opts.required ?? true,
  }
}

function identityChecks(project: StaticProjectRecord): ReadinessCheck[] {
  const fields: Array<{ id: string; label: string; ok: boolean; path: string }> = [
    { id: 'ID_DISPLAY_NAME', label: 'Display name', ok: Boolean(project.displayName), path: 'displayName' },
    { id: 'ID_DESCRIPTION', label: 'Description', ok: Boolean(project.description), path: 'description' },
    { id: 'ID_TAGLINE', label: 'Tagline', ok: Boolean(project.tagline), path: 'tagline' },
    { id: 'ID_WEBSITE', label: 'Website URL', ok: Boolean(project.websiteUrl), path: 'websiteUrl' },
    { id: 'ID_DOCS', label: 'Docs URL', ok: Boolean(project.docsUrl), path: 'docsUrl' },
    { id: 'ID_SPACE', label: 'Space profile URL', ok: Boolean(project.spaceProfileUrl), path: 'spaceProfileUrl' },
    {
      id: 'ID_SOCIALS',
      label: 'Social links',
      ok: Boolean(project.socialLinks?.length),
      path: 'socialLinks',
    },
    {
      id: 'ID_SECTOR_TAGS',
      label: 'Sector tags',
      ok: Boolean(project.sectorTags?.length),
      path: 'sectorTags',
    },
    { id: 'ID_UPI', label: 'UPI', ok: Boolean(project.upi), path: 'upi' },
  ]
  const each = 15 / fields.length
  return fields.map((f) =>
    check(f.id, f.label, f.ok ? each : 0, f.ok ? 'SATISFIED' : 'UNSATISFIED', {
      sourceFields: [f.path],
      reasonCode: f.ok ? 'FIELD_PRESENT' : 'FIELD_MISSING',
      required: f.id === 'ID_DISPLAY_NAME' || f.id === 'ID_UPI',
    }),
  )
}

function capabilityChecks(project: StaticProjectRecord): ReadinessCheck[] {
  const entries = Object.entries(project.capabilities)
  const eachMax = 30 / entries.length
  return entries.map(([key, cell]) => {
    const status = cell.status
    let result: ReadinessCheckResult = 'UNSATISFIED'
    let points = 0
    if (status === 'live') {
      result = 'SATISFIED'
      points = eachMax
    } else if (status === 'partial') {
      result = 'PARTIALLY_SATISFIED'
      points = eachMax * 0.5
    } else if (status === 'none') {
      result = 'NOT_APPLICABLE'
      points = 0
    } else if (status === 'planned' || status === 'scheduled') {
      result = 'UNAVAILABLE'
      points = 0
    }
    return check(`CAP_${key.toUpperCase()}`, `Capability ${key}`, points, result, {
      sourceFields: [`capabilities.${key}.status`],
      reasonCode: `CAPABILITY_${status.toUpperCase()}`,
      required: false,
      availability: status === 'none' ? 'NOT_APPLICABLE' : 'AVAILABLE',
    })
  })
}

function ecosystemChecks(project: StaticProjectRecord): ReadinessCheck[] {
  const keys = ['smartdrop', 'radar', 'space', 'labs', 'treasuryCompatible'] as const
  const eachMax = 25 / keys.length
  return keys.map((key) => {
    const status = project.capabilities[key].status
    let result: ReadinessCheckResult = 'UNSATISFIED'
    let points = 0
    if (status === 'live') {
      result = 'SATISFIED'
      points = eachMax
    } else if (status === 'partial') {
      result = 'PARTIALLY_SATISFIED'
      points = eachMax * 0.5
    } else if (status === 'none') {
      result = 'NOT_APPLICABLE'
    } else {
      result = 'UNAVAILABLE'
    }
    return check(`ECO_${key.toUpperCase()}`, `Ecosystem surface ${key}`, points, result, {
      sourceFields: [`capabilities.${key}.status`],
      reasonCode: `ECOSYSTEM_${status.toUpperCase()}`,
      required: false,
      availability: status === 'none' ? 'NOT_APPLICABLE' : 'AVAILABLE',
    })
  })
}

function machineChecks(project: StaticProjectRecord): ReadinessCheck[] {
  const manifest = project.capabilities.machineManifest.status
  const ai = project.capabilities.aiReport.status
  const manifestPts =
    manifest === 'live' ? 15 * 0.7 : manifest === 'partial' ? 15 * 0.7 * 0.5 : 0
  const aiPts = ai === 'live' ? 15 * 0.3 : ai === 'partial' ? 15 * 0.3 * 0.5 : 0
  return [
    check(
      'MACHINE_MANIFEST',
      'Machine manifest capability',
      manifestPts,
      manifest === 'live' ? 'SATISFIED' : manifest === 'partial' ? 'PARTIALLY_SATISFIED' : 'UNAVAILABLE',
      {
        sourceFields: ['capabilities.machineManifest.status'],
        reasonCode: `MACHINE_MANIFEST_${manifest.toUpperCase()}`,
      },
    ),
    check(
      'AI_REPORT',
      'AI report capability',
      aiPts,
      ai === 'live' ? 'SATISFIED' : ai === 'partial' ? 'PARTIALLY_SATISFIED' : 'UNAVAILABLE',
      {
        sourceFields: ['capabilities.aiReport.status'],
        reasonCode: `AI_REPORT_${ai.toUpperCase()}`,
        required: false,
      },
    ),
  ]
}

function multiChainChecks(project: StaticProjectRecord): ReadinessCheck[] {
  const unique = [...new Set(project.supportedChains)]
  const ratio = Math.min(1, unique.length / 4)
  const points = 10 * ratio
  return [
    check(
      'CHAIN_COVERAGE',
      'Unique supported chains vs platform coverage (4)',
      points,
      unique.length >= 4 ? 'SATISFIED' : unique.length > 0 ? 'PARTIALLY_SATISFIED' : 'UNSATISFIED',
      {
        sourceFields: ['supportedChains'],
        reasonCode: unique.length ? 'CHAINS_REGISTERED' : 'NO_CHAINS',
      },
    ),
  ]
}

function trustSignalChecks(project: StaticProjectRecord, pack: ProjectEvidencePack): ReadinessCheck[] {
  const checks: ReadinessCheck[] = [
    check(
      'TRUST_BADGE_CANONICAL',
      'Canonical trust badge',
      project.trustBadges.includes('canonical') ? 2 : 0,
      project.trustBadges.includes('canonical') ? 'SATISFIED' : 'UNSATISFIED',
      {
        sourceFields: ['trustBadges'],
        reasonCode: project.trustBadges.includes('canonical') ? 'BADGE_CANONICAL' : 'BADGE_NOT_CANONICAL',
      },
    ),
    check(
      'TRUST_VERIFICATION_OBSERVED',
      'Verification status observed',
      project.verificationStatus === 'observed' ? 1.5 : 0,
      project.verificationStatus === 'observed' ? 'SATISFIED' : 'UNSATISFIED',
      {
        sourceFields: ['verificationStatus'],
        reasonCode:
          project.verificationStatus === 'observed' ? 'VERIFICATION_OBSERVED' : 'VERIFICATION_UNVERIFIED',
      },
    ),
    check(
      'TRUST_REGISTRY_LISTED',
      'Registry status listed',
      project.registryStatus === 'listed' ? 1.5 : 0,
      project.registryStatus === 'listed' ? 'SATISFIED' : 'UNSATISFIED',
      {
        sourceFields: ['registryStatus'],
        reasonCode: project.registryStatus === 'listed' ? 'REGISTRY_LISTED' : 'REGISTRY_NOT_LISTED',
      },
    ),
  ]
  // Public PP002 evidence presence is informational — does not alter Organ 01 points.
  const publicEvidence = pack.evidence.filter((e) => e.visibility === 'PUBLIC')
  checks.push(
    check(
      'TRUST_PUBLIC_EVIDENCE_PRESENT',
      'Public trust evidence registered (informational; not additive to Organ 01 score)',
      0,
      publicEvidence.length > 0 ? 'SATISFIED' : 'UNAVAILABLE',
      {
        evidenceIds: publicEvidence.slice(0, 5).map((e) => e.evidenceId),
        reasonCode: publicEvidence.length ? 'PUBLIC_EVIDENCE_PRESENT' : 'PUBLIC_EVIDENCE_ABSENT',
        required: false,
        availability: publicEvidence.length ? 'AVAILABLE' : 'UNAVAILABLE',
      },
    ),
  )
  return checks
}

function componentStatus(checks: ReadinessCheck[]): ReadinessCheckResult {
  if (checks.some((c) => c.result === 'CONFLICTED')) return 'CONFLICTED'
  if (checks.some((c) => c.result === 'STALE')) return 'STALE'
  const material = checks.filter((c) => c.availability !== 'NOT_APPLICABLE' && c.required)
  if (material.length && material.every((c) => c.result === 'SATISFIED')) return 'SATISFIED'
  if (checks.some((c) => c.result === 'SATISFIED' || c.result === 'PARTIALLY_SATISFIED')) {
    return 'PARTIALLY_SATISFIED'
  }
  if (checks.every((c) => c.availability === 'NOT_APPLICABLE')) return 'NOT_APPLICABLE'
  if (checks.some((c) => c.result === 'UNAVAILABLE')) return 'UNAVAILABLE'
  return 'UNSATISFIED'
}

function buildComponent(
  componentId: ReadinessComponentId,
  weightKey: CivilizationReadinessComponentKey,
  checks: ReadinessCheck[],
  achievedPoints: number,
  maxPoints: number,
  calculatedAt: string,
  evidenceIds: string[],
): ReadinessComponentResult {
  return {
    componentId,
    label: READINESS_COMPONENT_LABELS[componentId],
    maxPoints,
    achievedPoints,
    normalizedPercentage: maxPoints > 0 ? Math.round((achievedPoints / maxPoints) * 100) : 0,
    status: componentStatus(checks),
    checks,
    unmetCheckIds: checks.filter((c) => c.result === 'UNSATISFIED').map((c) => c.checkId),
    unavailableCheckIds: checks.filter((c) => c.result === 'UNAVAILABLE').map((c) => c.checkId),
    evidenceIds,
    calculationRevision: CIVILIZATION_READINESS_CALCULATION_REVISION,
    lastCalculatedAt: calculatedAt,
  }
}

export function computeReadinessComponents(
  project: StaticProjectRecord,
  pack: ProjectEvidencePack,
  calculatedAt: string,
): { overview: ReadinessOverview; components: ReadinessComponentResult[] } {
  const breakdown = computeCivilizationReadinessBreakdown(project)
  const checkMap: Record<ReadinessComponentId, ReadinessCheck[]> = {
    IDENTITY: identityChecks(project),
    CAPABILITIES: capabilityChecks(project),
    ECOSYSTEM: ecosystemChecks(project),
    MACHINE_READINESS: machineChecks(project),
    MULTI_CHAIN: multiChainChecks(project),
    TRUST_EVIDENCE: trustSignalChecks(project, pack),
  }

  const readinessEvidenceIds = pack.evidence
    .filter((e) => e.claimType === 'READINESS_INPUT' && e.visibility === 'PUBLIC')
    .map((e) => e.evidenceId)

  const components = READINESS_COMPONENT_IDS.map((componentId) => {
    const weightKey = READINESS_COMPONENT_TO_WEIGHT_KEY[componentId]
    return buildComponent(
      componentId,
      weightKey,
      checkMap[componentId],
      breakdown.achievedPoints[weightKey],
      breakdown.pointCaps[weightKey],
      calculatedAt,
      componentId === 'TRUST_EVIDENCE' ? readinessEvidenceIds : [],
    )
  })

  const state = readinessStateFromScore(breakdown.totalScore)
  const overview: ReadinessOverview = {
    score: breakdown.totalScore,
    maxScore: breakdown.maxScore,
    state,
    stateLabel: state.charAt(0) + state.slice(1).toLowerCase().replace(/_/g, ' '),
    explanation:
      'This reflects identity completeness, available capabilities, ecosystem resources, machine readability, chain coverage and registered trust signals. It is not a safety or investment rating.',
    calculationRevision: CIVILIZATION_READINESS_CALCULATION_REVISION,
    lastCalculatedAt: calculatedAt,
    methodologyPath: `#methodology`,
  }

  // Sanity: component achieved sum (exact) rounds to total
  const exactSum = components.reduce((s, c) => s + c.achievedPoints, 0)
  if (Math.round(exactSum) !== breakdown.totalScore) {
    // Should never happen — mirrors discovery arithmetic
    overview.score = Math.round(exactSum)
  }

  // Weights referenced to keep config/methodology parity with discovery
  void CIVILIZATION_READINESS_WEIGHTS

  return { overview, components }
}
