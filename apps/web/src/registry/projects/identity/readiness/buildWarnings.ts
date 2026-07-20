import { fingerprint } from '../evidence/evidenceId'
import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack } from '../evidence/types'
import type { WarningCategory, WarningSeverity } from './schema'
import type { MaterialWarning, TrustDimensionResult } from './types'

function warningId(projectId: string, category: WarningCategory, subject: string): string {
  return `warn_${fingerprint([projectId, category, subject].join('\u001f'))}`
}

function warn(
  projectId: string,
  category: WarningCategory,
  severity: WarningSeverity,
  subjectReference: string,
  reasonCode: string,
  publicExplanation: string,
  evidenceIds: string[],
  firstObservedAt: string | null,
): MaterialWarning {
  return {
    warningId: warningId(projectId, category, subjectReference),
    category,
    severity,
    subjectReference,
    reasonCode,
    evidenceIds,
    firstObservedAt,
    status: 'ACTIVE',
    publicExplanation,
  }
}

/**
 * Warnings only from real evidence/document states.
 * Absence alone is not a security warning — only when expected for this project type.
 */
export function buildMaterialWarnings(
  document: CanonicalProjectDocument,
  pack: ProjectEvidencePack,
  dimensions: TrustDimensionResult[],
): MaterialWarning[] {
  const out: MaterialWarning[] = []
  const projectId = document.projectId
  const asOf = pack.asOf

  for (const conflict of pack.conflicts) {
    const category: WarningCategory =
      conflict.claimType === 'OFFICIAL_WEBSITE' || conflict.claimType.startsWith('OFFICIAL_')
        ? 'OFFICIAL_RESOURCE_CONFLICT'
        : conflict.claimType === 'CONTRACT_CLASSIFICATION' || conflict.claimType === 'CONTRACT_IDENTITY'
          ? 'CONTRACT_CLASSIFICATION_CONFLICT'
          : 'IDENTITY_CONFLICT'
    out.push(
      warn(
        projectId,
        category,
        'ATTENTION',
        conflict.conflictGroupId,
        conflict.reasonCode,
        `Registered sources disagree on ${conflict.claimType.replace(/_/g, ' ').toLowerCase()}.`,
        conflict.evidenceIds,
        asOf,
      ),
    )
  }

  for (const record of pack.evidence) {
    if (record.visibility !== 'PUBLIC') continue
    if (record.freshnessState !== 'STALE' && record.freshnessState !== 'EXPIRED') continue
    if (
      record.claimType === 'PROJECT_IDENTITY' ||
      record.claimType === 'PROJECT_NAME' ||
      record.claimType === 'PROJECT_PURPOSE'
    ) {
      out.push(
        warn(
          projectId,
          'STALE_IDENTITY_EVIDENCE',
          'NOTICE',
          record.evidenceId,
          'STALE_IDENTITY_EVIDENCE',
          'Identity evidence is stale relative to its freshness policy.',
          [record.evidenceId],
          record.updatedAt ?? record.observedAt,
        ),
      )
    }
    if (record.claimType.startsWith('CONTRACT_')) {
      out.push(
        warn(
          projectId,
          'STALE_CONTRACT_EVIDENCE',
          'NOTICE',
          record.evidenceId,
          'STALE_CONTRACT_EVIDENCE',
          'The latest contract evidence is stale.',
          [record.evidenceId],
          record.updatedAt ?? record.observedAt,
        ),
      )
    }
  }

  if (!pack.summary.controlEvidenceAvailable) {
    out.push(
      warn(
        projectId,
        'NO_PUBLIC_CONTROL_EVIDENCE',
        'NOTICE',
        'project-control',
        'NO_PUBLIC_CONTROL_EVIDENCE',
        'No public project-control evidence is registered.',
        [],
        asOf,
      ),
    )
  }
  void dimensions

  const contracts = dimensions.find((d) => d.dimensionId === 'CONTRACTS')
  const hasContractSource = pack.evidence.some(
    (e) =>
      e.visibility === 'PUBLIC' &&
      e.claimType === 'CONTRACT_SOURCE_VERIFICATION' &&
      e.availability === 'AVAILABLE',
  )
  if (contracts && contracts.availability !== 'NOT_APPLICABLE' && !hasContractSource) {
    out.push(
      warn(
        projectId,
        'NO_CONTRACT_VERIFICATION_EVIDENCE',
        'INFO',
        'contract-source-verification',
        'NO_CONTRACT_VERIFICATION_EVIDENCE',
        'Contract source-verification evidence is unavailable.',
        [],
        asOf,
      ),
    )
  }

  const melega = dimensions.find((d) => d.dimensionId === 'MELEGA_VERIFICATION')
  if (melega && (melega.status === 'UNRESOLVED' || melega.status === 'UNAVAILABLE')) {
    out.push(
      warn(
        projectId,
        'VERIFICATION_UNRESOLVED',
        'INFO',
        'melega-verification',
        melega.reasonCode,
        'Melega verification evidence is unresolved or unavailable.',
        melega.activeEvidenceIds,
        asOf,
      ),
    )
  }

  // Deduplicate by warningId
  const seen = new Set<string>()
  return out.filter((w) => {
    if (seen.has(w.warningId)) return false
    seen.add(w.warningId)
    return true
  })
}
