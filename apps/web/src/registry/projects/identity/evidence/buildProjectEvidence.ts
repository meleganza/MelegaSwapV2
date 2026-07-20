import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import { detectEvidenceConflicts } from './conflict'
import { createEvidenceRecord } from './createEvidence'
import { validateDerivedEvidence } from './derive'
import { applyFreshnessToRecord } from './freshness'
import { PROJECT_EVIDENCE_SCHEMA_VERSION } from './schema'
import type { EvidenceClaimView, ProjectEvidencePack, ProjectEvidenceRecord, ProjectEvidenceSummary } from './types'

function projectSubject(projectId: string, fieldPath: string | null = null) {
  return {
    subjectType: 'PROJECT' as const,
    projectId,
    subjectId: projectId,
    fieldPath,
  }
}

/**
 * Build the PP002 evidence pack from the PP001 normalized document + registry record.
 * Production data only — no injected conflicts. Fixtures supply conflict/stale/etc. in tests.
 */
export function buildProjectEvidencePack(
  document: CanonicalProjectDocument,
  project: StaticProjectRecord,
  options?: { generatedAt?: string; asOf?: string },
): ProjectEvidencePack {
  const generatedAt = options?.generatedAt ?? document.generatedAt
  const asOf = options?.asOf ?? generatedAt
  const projectId = document.projectId
  const asOfDate = project.asOf
  const records: ProjectEvidenceRecord[] = []

  const push = (record: ProjectEvidenceRecord | null) => {
    if (record) records.push(record)
  }

  push(
    createEvidenceRecord({
      projectId,
      subject: projectSubject(projectId, 'identity.projectId'),
      claimType: 'PROJECT_IDENTITY',
      claimValue: projectId,
      sourceType: 'MELEGA_VERIFIED',
      sourceSubtype: 'REGISTRY_REVIEW',
      sourceReference: project.upi,
      status: project.isCanonical ? 'VERIFIED' : 'OBSERVED',
      verificationLevel: project.isCanonical ? 'MELEGA_VERIFIED' : 'SOURCE_CONFIRMED',
      observedAt: asOfDate,
      updatedAt: asOfDate,
      reasonCode: 'REGISTRY_LISTING',
    }),
  )

  push(
    createEvidenceRecord({
      projectId,
      subject: projectSubject(projectId, 'identity.displayName'),
      claimType: 'PROJECT_NAME',
      claimValue: document.identity.displayName,
      sourceType: 'PROJECT_ATTESTED',
      sourceSubtype: 'REGISTRY_DECLARATION',
      sourceReference: `registry://projects/${project.slug}#displayName`,
      status: 'ASSERTED',
      verificationLevel: 'SOURCE_CONFIRMED',
      observedAt: asOfDate,
      updatedAt: asOfDate,
    }),
  )

  if (document.identity.shortPurpose.meta.availability === 'AVAILABLE' && document.identity.shortPurpose.value) {
    push(
      createEvidenceRecord({
        projectId,
        subject: projectSubject(projectId, 'identity.shortPurpose'),
        claimType: 'PROJECT_PURPOSE',
        claimValue: document.identity.shortPurpose.value,
        sourceType: 'PROJECT_ATTESTED',
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: `registry://projects/${project.slug}#tagline`,
        status: 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
      }),
    )
  }

  if (document.identity.projectType.meta.availability === 'AVAILABLE' && document.identity.projectType.value) {
    push(
      createEvidenceRecord({
        projectId,
        subject: projectSubject(projectId, 'identity.projectType'),
        claimType: 'PROJECT_TYPE',
        claimValue: document.identity.projectType.value,
        sourceType: document.identity.projectType.meta.source,
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: `registry://projects/${project.slug}#projectType`,
        status: 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
      }),
    )
  }

  if (document.identity.lifecycleStatus.meta.availability === 'AVAILABLE' && document.identity.lifecycleStatus.value) {
    push(
      createEvidenceRecord({
        projectId,
        subject: projectSubject(projectId, 'identity.lifecycleStatus'),
        claimType: 'PROJECT_LIFECYCLE_STATUS',
        claimValue: document.identity.lifecycleStatus.value,
        sourceType: document.identity.lifecycleStatus.meta.source,
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: `registry://projects/${project.slug}#lifecycleStatus`,
        status: document.identity.lifecycleStatus.meta.source === 'MELEGA_VERIFIED' ? 'OBSERVED' : 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
      }),
    )
  }

  for (const category of document.identity.categories) {
    push(
      createEvidenceRecord({
        projectId,
        subject: projectSubject(projectId, 'identity.categories'),
        claimType: 'PROJECT_CATEGORY',
        claimValue: category,
        sourceType: 'PROJECT_ATTESTED',
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: `registry://projects/${project.slug}#sectorTags`,
        status: 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
      }),
    )
  }

  if (document.identity.logoUrl.meta.availability === 'UNAVAILABLE') {
    push(
      createEvidenceRecord({
        projectId,
        subject: projectSubject(projectId, 'identity.logoUrl'),
        claimType: 'PROJECT_LOGO',
        claimValue: null,
        sourceType: 'UNKNOWN',
        sourceReference: `registry://projects/${project.slug}#logoUrl`,
        status: 'UNRESOLVED',
        verificationLevel: 'NONE',
        observedAt: null,
        updatedAt: null,
        availability: 'UNAVAILABLE',
        reasonCode: 'EVIDENCE_UNAVAILABLE',
        notes: 'No logo URL in registry',
      }),
    )
  }

  for (const resource of document.resources) {
    const claimType =
      resource.resourceType === 'website'
        ? 'OFFICIAL_WEBSITE'
        : resource.resourceType === 'documentation'
        ? 'OFFICIAL_DOCUMENTATION'
        : resource.resourceType === 'github'
        ? 'OFFICIAL_REPOSITORY'
        : resource.resourceType === 'social'
        ? 'OFFICIAL_SOCIAL'
        : null
    if (!claimType) continue
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'RESOURCE',
          projectId,
          subjectId: `${resource.resourceType}:${resource.url}`,
          fieldPath: 'url',
        },
        claimType,
        claimValue: resource.url,
        sourceType: resource.provenance.source,
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: resource.url,
        status: 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: resource.provenance.observedAt,
        updatedAt: resource.provenance.updatedAt,
        notes: resource.label,
      }),
    )
  }

  for (const chain of document.chains) {
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'DEPLOYMENT',
          projectId,
          subjectId: chain.caip2,
          fieldPath: 'supportedChains',
        },
        claimType: 'SUPPORTED_CHAIN',
        claimValue: chain.caip2,
        sourceType: 'PROJECT_ATTESTED',
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: `registry://projects/${project.slug}#supportedChains`,
        status: 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
      }),
    )
  }

  for (const deployment of document.deployments) {
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'DEPLOYMENT',
          projectId,
          subjectId: deployment.deploymentId,
          fieldPath: null,
        },
        claimType: 'DEPLOYMENT_IDENTITY',
        claimValue: deployment.caip2,
        sourceType: 'PROJECT_ATTESTED',
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: deployment.deploymentId,
        status: 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: deployment.observedAt,
        updatedAt: deployment.updatedAt,
      }),
    )
  }

  for (const asset of document.assets) {
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'ASSET',
          projectId,
          subjectId: asset.assetId,
          fieldPath: null,
        },
        claimType: 'ASSET_IDENTITY',
        claimValue: asset.assetId,
        sourceType: 'PROJECT_ATTESTED',
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: asset.assetId,
        status: 'ASSERTED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
      }),
    )
  }

  for (const contract of document.contracts) {
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'CONTRACT',
          projectId,
          subjectId: contract.contractId,
          fieldPath: null,
        },
        claimType: 'CONTRACT_IDENTITY',
        claimValue: contract.caip10,
        sourceType: 'PROJECT_ATTESTED',
        sourceSubtype: 'REGISTRY_DECLARATION',
        sourceReference: contract.caip10,
        status: 'OBSERVED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
      }),
    )
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'CONTRACT',
          projectId,
          subjectId: contract.contractId,
          fieldPath: 'classification',
        },
        claimType: 'CONTRACT_CLASSIFICATION',
        claimValue: contract.classification,
        sourceType: 'DERIVED',
        sourceSubtype: 'NORMALIZED_IDENTIFIER',
        sourceReference: contract.caip10,
        status: 'OBSERVED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
        derivedFromEvidenceIds: [], // filled after CONTRACT_IDENTITY IDs known
        derivationMethod: 'TOKEN_REF_CLASSIFICATION',
        reasonCode: 'CLASSIFIED_FROM_REGISTRY_TOKEN',
      }),
    )
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'CONTRACT',
          projectId,
          subjectId: contract.contractId,
          fieldPath: 'sourceVerification',
        },
        claimType: 'CONTRACT_SOURCE_VERIFICATION',
        claimValue: null,
        sourceType: 'UNKNOWN',
        sourceReference: contract.caip10,
        status: 'UNRESOLVED',
        verificationLevel: 'NONE',
        observedAt: null,
        updatedAt: null,
        availability: 'UNAVAILABLE',
        reasonCode: 'SOURCE_VERIFICATION_UNAVAILABLE',
        notes: 'Contract source verification not asserted by PP002',
      }),
    )
  }

  // Wire classification derivation inputs to matching CONTRACT_IDENTITY evidence
  const identityByContract = new Map(
    records.filter((r) => r.claimType === 'CONTRACT_IDENTITY').map((r) => [r.subject.subjectId, r.evidenceId]),
  )
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i]
    if (record.claimType !== 'CONTRACT_CLASSIFICATION' || record.sourceType !== 'DERIVED') continue
    const parentId = identityByContract.get(record.subject.subjectId)
    if (!parentId) continue
    records[i] = {
      ...record,
      derivedFromEvidenceIds: [parentId],
    }
  }

  push(
    createEvidenceRecord({
      projectId,
      subject: {
        subjectType: 'VERIFICATION',
        projectId,
        subjectId: projectId,
        fieldPath: 'verificationState',
      },
      claimType: 'MELEGA_VERIFICATION',
      claimValue: document.identity.verificationState.value,
      sourceType: 'MELEGA_VERIFIED',
      sourceSubtype: 'REGISTRY_REVIEW',
      sourceReference: project.upi,
      status: project.verificationStatus === 'observed' ? 'OBSERVED' : 'ASSERTED',
      verificationLevel: project.trustBadges.includes('canonical') ? 'MELEGA_VERIFIED' : 'SOURCE_CONFIRMED',
      observedAt: asOfDate,
      updatedAt: asOfDate,
      notes: 'Registry identity observation — not a safety rating',
    }),
  )

  push(
    createEvidenceRecord({
      projectId,
      subject: {
        subjectType: 'VERIFICATION',
        projectId,
        subjectId: `${projectId}#control`,
        fieldPath: 'projectControl',
      },
      claimType: 'PROJECT_CONTROL',
      claimValue: null,
      sourceType: 'UNKNOWN',
      sourceReference: `registry://projects/${project.slug}#control`,
      status: 'UNRESOLVED',
      verificationLevel: 'NONE',
      observedAt: null,
      updatedAt: null,
      availability: 'UNAVAILABLE',
      reasonCode: 'NO_PUBLIC_CONTROL_EVIDENCE',
      notes: 'No public control evidence',
    }),
  )

  if (document.identity.readiness.meta.availability === 'AVAILABLE' && document.identity.readiness.value) {
    const readinessInputs = records
      .filter((r) => r.claimType === 'PROJECT_IDENTITY' || r.claimType === 'MELEGA_VERIFICATION')
      .map((r) => r.evidenceId)
    push(
      createEvidenceRecord({
        projectId,
        subject: {
          subjectType: 'READINESS',
          projectId,
          subjectId: projectId,
          fieldPath: 'civilizationReadiness',
        },
        claimType: 'READINESS_INPUT',
        claimValue: String(document.identity.readiness.value.score),
        sourceType: 'DERIVED',
        sourceSubtype: 'READINESS_COMPONENT',
        sourceReference: 'discovery.computeCivilizationReadiness',
        status: 'OBSERVED',
        verificationLevel: 'SOURCE_CONFIRMED',
        observedAt: asOfDate,
        updatedAt: asOfDate,
        derivedFromEvidenceIds: readinessInputs,
        derivationMethod: 'CIVILIZATION_READINESS_V1',
        notes: document.identity.readiness.value.disclaimer,
      }),
    )
  }

  // Validate derived records; drop invalid derived rows safely
  const catalog = new Map(records.map((r) => [r.evidenceId, r]))
  const validated: ProjectEvidenceRecord[] = []
  for (const record of records) {
    if (record.sourceType !== 'DERIVED') {
      validated.push(record)
      continue
    }
    const result = validateDerivedEvidence(record, catalog)
    if (!result.ok) continue
    validated.push({ ...record, verificationLevel: result.verificationLevel })
  }

  const withFreshness = validated.map((record) => applyFreshnessToRecord(record, { asOf }))
  const { records: withConflicts, conflicts } = detectEvidenceConflicts(withFreshness)
  const publicRecords = withConflicts
    .filter((r) => r.visibility === 'PUBLIC')
    .sort((a, b) => a.evidenceId.localeCompare(b.evidenceId))

  const claims = buildClaimViews(publicRecords)
  const summary = buildSummary(publicRecords, conflicts.length)

  const sourcesPresent = Array.from(new Set(publicRecords.map((r) => r.sourceType))).sort()
  const notes: string[] = []
  if (summary.controlEvidenceAvailable === false) notes.push('No public control evidence')
  if (summary.staleEvidenceCount > 0) notes.push('Stale evidence present')
  if (summary.activeConflictCount > 0) notes.push('Unresolved conflicts present')
  if (!publicRecords.some((r) => r.claimType === 'CONTRACT_SOURCE_VERIFICATION' && r.availability === 'AVAILABLE')) {
    notes.push('Source verification unavailable')
  }

  return {
    schemaVersion: PROJECT_EVIDENCE_SCHEMA_VERSION,
    projectId,
    slug: document.slug,
    canonicalUrl: document.canonicalUrl,
    projectRevision: document.revision,
    generatedAt,
    asOf,
    summary,
    claims,
    evidence: publicRecords,
    conflicts,
    freshness: {
      staleCount: publicRecords.filter((r) => r.freshnessState === 'STALE').length,
      expiredCount: publicRecords.filter((r) => r.freshnessState === 'EXPIRED').length,
      currentCount: publicRecords.filter((r) => r.freshnessState === 'CURRENT').length,
      noneCount: publicRecords.filter((r) => r.freshnessState === 'NONE').length,
    },
    availability: summary.availability,
    provenance: {
      sourcesPresent,
      notes,
    },
  }
}

function buildClaimViews(records: ProjectEvidenceRecord[]): EvidenceClaimView[] {
  const groups = new Map<string, ProjectEvidenceRecord[]>()
  for (const record of records) {
    const key = `${record.claimType}|${record.subject.subjectType}|${record.subject.subjectId}|${
      record.subject.fieldPath ?? ''
    }`
    const list = groups.get(key) ?? []
    list.push(record)
    groups.set(key, list)
  }
  const views: EvidenceClaimView[] = []
  for (const group of groups.values()) {
    const primary = group[0]
    const conflicted = group.some((g) => g.status === 'CONFLICTED')
    views.push({
      claimType: primary.claimType,
      subject: primary.subject,
      claimValue: conflicted ? null : primary.claimValue,
      availability: conflicted ? 'CONFLICTED' : primary.availability,
      status: conflicted ? 'CONFLICTED' : primary.status,
      verificationLevel: primary.verificationLevel,
      evidenceIds: group.map((g) => g.evidenceId).sort(),
      conflictGroupId: primary.conflictGroupId,
      freshnessState: primary.freshnessState,
    })
  }
  return views.sort((a, b) => a.claimType.localeCompare(b.claimType))
}

function buildSummary(records: ProjectEvidenceRecord[], conflictCount: number): ProjectEvidenceSummary {
  const has = (claim: ProjectEvidenceRecord['claimType'], available = true) =>
    records.some(
      (r) =>
        r.claimType === claim &&
        (available
          ? r.availability === 'AVAILABLE' ||
            r.status === 'VERIFIED' ||
            r.status === 'OBSERVED' ||
            r.status === 'ASSERTED'
          : true),
    )

  const identityEvidenceAvailable = has('PROJECT_IDENTITY') || has('PROJECT_NAME')
  const officialResourceEvidenceAvailable =
    has('OFFICIAL_WEBSITE') || has('OFFICIAL_DOCUMENTATION') || has('OFFICIAL_SOCIAL')
  const contractEvidenceAvailable = has('CONTRACT_IDENTITY')
  const controlEvidenceAvailable = records.some(
    (r) => r.claimType === 'PROJECT_CONTROL' && r.availability === 'AVAILABLE' && r.claimValue != null,
  )
  const melegaVerificationEvidenceAvailable = records.some(
    (r) => r.claimType === 'MELEGA_VERIFICATION' && r.availability !== 'UNAVAILABLE',
  )

  let availability: ProjectEvidenceSummary['availability'] = 'AVAILABLE'
  if (conflictCount > 0) availability = 'CONFLICTED'
  else if (records.some((r) => r.freshnessState === 'STALE' || r.freshnessState === 'EXPIRED')) {
    availability = 'STALE'
  } else if (!identityEvidenceAvailable) availability = 'UNAVAILABLE'

  return {
    publicEvidenceCount: records.length,
    activeConflictCount: conflictCount,
    staleEvidenceCount: records.filter((r) => r.freshnessState === 'STALE').length,
    expiredEvidenceCount: records.filter((r) => r.freshnessState === 'EXPIRED').length,
    identityEvidenceAvailable,
    officialResourceEvidenceAvailable,
    contractEvidenceAvailable,
    controlEvidenceAvailable,
    melegaVerificationEvidenceAvailable,
    availability,
  }
}

/** Compact summary for additive PP001 project JSON extension. */
export function toEvidenceSummaryForProjectApi(pack: ProjectEvidencePack): Record<string, unknown> {
  return {
    extension: 'evidenceSummary.v1',
    schemaVersion: pack.schemaVersion,
    availability: pack.summary.availability,
    publicEvidenceCount: pack.summary.publicEvidenceCount,
    activeConflictCount: pack.summary.activeConflictCount,
    staleEvidenceCount: pack.summary.staleEvidenceCount,
    expiredEvidenceCount: pack.summary.expiredEvidenceCount,
    identityEvidenceAvailable: pack.summary.identityEvidenceAvailable,
    officialResourceEvidenceAvailable: pack.summary.officialResourceEvidenceAvailable,
    contractEvidenceAvailable: pack.summary.contractEvidenceAvailable,
    controlEvidenceAvailable: pack.summary.controlEvidenceAvailable,
    melegaVerificationEvidenceAvailable: pack.summary.melegaVerificationEvidenceAvailable,
    evidenceApiPath: `/api/public/projects/${pack.slug}/evidence/`,
  }
}
