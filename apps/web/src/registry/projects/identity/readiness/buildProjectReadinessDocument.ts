import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack } from '../evidence/types'
import { fingerprint } from '../evidence/evidenceId'
import { loadProjectEvidencePack } from '../evidence/loadEvidence'
import { resolveProjectBySlug } from '../resolveProject'
import {
  PROJECT_PAGE_READINESS_EXTENSION,
  PROJECT_PAGE_TRUST_SNAPSHOT_EXTENSION,
  PROJECT_READINESS_SCHEMA_VERSION,
  READINESS_LIMITATIONS,
  READINESS_SNAPSHOT_REVISION,
} from './schema'
import { computeReadinessComponents } from './computeReadinessComponents'
import { buildTrustLayer } from './buildTrustSnapshot'
import { buildReadinessMethodology } from './methodology'
import type {
  ProjectReadinessDocument,
  ReadinessSummaryForProjectApi,
  TrustSnapshotSummaryForProjectApi,
} from './types'

export function evidenceRevisionFromPack(pack: ProjectEvidencePack): string {
  const ids = pack.evidence
    .filter((e) => e.visibility === 'PUBLIC')
    .map((e) => e.evidenceId)
    .sort()
  return fingerprint([pack.projectId, pack.schemaVersion, ...ids, String(pack.summary.activeConflictCount)].join('|'))
}

export function buildProjectReadinessDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  generatedAt?: string
}): ProjectReadinessDocument {
  const generatedAt = input.generatedAt ?? input.document.generatedAt
  const { overview, components } = computeReadinessComponents(
    input.project,
    input.evidencePack,
    generatedAt,
  )
  const { trustSnapshot, trustDimensions, warnings } = buildTrustLayer(
    input.document,
    input.evidencePack,
  )
  const methodology = buildReadinessMethodology()

  return {
    schemaVersion: PROJECT_READINESS_SCHEMA_VERSION,
    projectId: input.document.projectId,
    slug: input.document.slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    evidenceRevision: evidenceRevisionFromPack(input.evidencePack),
    calculationRevision: overview.calculationRevision,
    snapshotRevision: READINESS_SNAPSHOT_REVISION,
    generatedAt,
    readiness: overview,
    components,
    trustSnapshot,
    trustDimensions: trustDimensions.filter((d) => d.availability !== 'NOT_APPLICABLE' || d.dimensionId === 'CONFLICTS' || d.dimensionId === 'DATA_FRESHNESS'),
    warnings,
    limitations: READINESS_LIMITATIONS,
    methodology,
    availability: input.evidencePack.availability,
    provenance: {
      formulaSource: 'discovery.computeCivilizationReadinessBreakdown',
      evidenceSource: 'identity.evidence.buildProjectEvidencePack',
      notes: [
        'Readiness score reuses Organ 01 Civilization Readiness without a second formula.',
        'Trust Snapshot is derived from PP002 public evidence only.',
      ],
    },
  }
}

export function toReadinessSummaryForProjectApi(
  doc: ProjectReadinessDocument,
): ReadinessSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_READINESS_EXTENSION,
    score: doc.readiness.score,
    maxScore: doc.readiness.maxScore,
    state: doc.readiness.state,
    components: doc.components.map((c) => ({
      componentId: c.componentId,
      achievedPoints: c.achievedPoints,
      maxPoints: c.maxPoints,
      status: c.status,
    })),
    trustEvidenceAvailability: doc.availability,
    staleEvidenceCount: doc.trustSnapshot.freshnessSummary.staleCount,
    unresolvedConflictCount: doc.trustSnapshot.conflictSummary.activeConflictCount,
    warningCountBySeverity: doc.trustSnapshot.materialWarningSummary.bySeverity,
    readinessApiPath: `/api/public/projects/${doc.slug}/readiness/`,
    calculationRevision: doc.calculationRevision,
    calculatedAt: doc.readiness.lastCalculatedAt,
  }
}

export function toTrustSnapshotSummaryForProjectApi(
  doc: ProjectReadinessDocument,
): TrustSnapshotSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_TRUST_SNAPSHOT_EXTENSION,
    availability: doc.availability,
    staleEvidenceCount: doc.trustSnapshot.freshnessSummary.staleCount,
    unresolvedConflictCount: doc.trustSnapshot.conflictSummary.activeConflictCount,
    warningCount: doc.warnings.length,
    evidenceCoverageRatio: doc.trustSnapshot.evidenceCoverageRatio,
    readinessApiPath: `/api/public/projects/${doc.slug}/readiness/`,
  }
}

export function loadProjectReadinessDocument(
  slug: string,
  options?: { generatedAt?: string; origin?: string },
): ProjectReadinessDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const loaded = loadProjectEvidencePack(resolved.slug, {
    generatedAt: options?.generatedAt,
    origin: options?.origin,
  })
  if (!loaded) return null
  return buildProjectReadinessDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt: options?.generatedAt ?? loaded.document.generatedAt,
  })
}
