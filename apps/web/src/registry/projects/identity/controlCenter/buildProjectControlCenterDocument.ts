import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack } from '../evidence/types'
import { resolveProjectBySlug } from '../resolveProject'
import { loadProjectEvidencePack } from '../evidence'
import { normalizeEvmAddress } from '../caip'
import { listAuditRecords } from './audit.store'
import {
  CONTROL_CENTER_LIMITATIONS,
  CONTROL_CENTER_RESOLVER_REVISION,
  CONTROL_CENTER_SECTIONS,
  PROJECT_CONTROL_CENTER_SCHEMA_VERSION,
  PROJECT_PAGE_CONTROL_CENTER_SUMMARY_EXTENSION,
  permissionsForRoles,
  type ClaimState,
  type OwnerRole,
  type OwnerVerificationState,
} from './schema'
import { buildControlCenterRevision, buildOwnerId, buildOwnerRevision } from './ids'
import { getClaimRecordForSlug, listOwnersForSlug } from './registry.data'
import { stagingSnapshot } from './mutations'
import type {
  CompletionGap,
  ControlCenterSummaryForProjectApi,
  PendingAction,
  ProjectControlCenterDocument,
  ProjectOwner,
} from './types'

function buildOwners(projectId: string, slug: string): ProjectOwner[] {
  return listOwnersForSlug(slug)
    .map((row) => {
      const roles = [...row.roles] as OwnerRole[]
      const ownerId = buildOwnerId({
        projectId,
        stableKey: row.stableKey,
        identityType: row.identityType,
      })
      return {
        ownerId,
        projectId,
        identityType: row.identityType,
        identityLabel: row.identityLabel,
        walletAddress: row.walletAddress ? normalizeEvmAddress(row.walletAddress) : null,
        verificationState: row.verificationState,
        roles,
        permissions: permissionsForRoles(roles),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        revision: buildOwnerRevision({
          ownerId,
          verificationState: row.verificationState,
          roles,
          updatedAt: row.updatedAt,
        }),
        stableKey: row.stableKey,
      }
    })
    .sort((a, b) => a.ownerId.localeCompare(b.ownerId))
}

function aggregateOwnerVerification(owners: ProjectOwner[]): OwnerVerificationState {
  if (owners.some((o) => o.verificationState === 'VERIFIED' && o.roles.includes('OWNER'))) {
    return 'VERIFIED'
  }
  if (owners.some((o) => o.verificationState === 'PENDING')) return 'PENDING'
  if (owners.some((o) => o.verificationState === 'SUSPENDED')) return 'SUSPENDED'
  if (owners.length === 0) return 'UNAVAILABLE'
  return 'UNVERIFIED'
}

function buildGaps(input: {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  claimState: ClaimState
  staging: ReturnType<typeof stagingSnapshot>
}): { gaps: CompletionGap[]; pending: PendingAction[]; evidenceGaps: string[] } {
  const gaps: CompletionGap[] = []
  const pending: PendingAction[] = []
  const evidenceGaps: string[] = []

  if (input.document.identity.logoUrl.meta.availability !== 'AVAILABLE') {
    gaps.push({
      id: 'gap.logo',
      section: 'PROFILE',
      label: 'Logo URL unavailable in canonical registry.',
      requiresVerification: false,
    })
  }
  if (!input.document.resources.some((r) => r.resourceType === 'github' || r.label.toLowerCase().includes('github'))) {
    gaps.push({
      id: 'gap.github',
      section: 'RESOURCES',
      label: 'GitHub resource not registered.',
      requiresVerification: false,
    })
  }

  const controlEvidence = input.evidencePack.evidence.filter((e) => e.claimType === 'PROJECT_CONTROL')
  if (
    controlEvidence.length === 0 ||
    controlEvidence.every((e) => e.availability === 'UNAVAILABLE' || e.claimValue == null)
  ) {
    evidenceGaps.push('PROJECT_CONTROL evidence unavailable — wallet owner claims cannot be verified.')
    gaps.push({
      id: 'gap.project-control',
      section: 'VERIFICATION',
      label: 'Project control evidence missing.',
      requiresVerification: true,
    })
  }

  const govEvidence = input.evidencePack.evidence.filter((e) => e.claimType === 'OFFICIAL_GOVERNANCE')
  if (govEvidence.every((e) => e.availability === 'UNAVAILABLE' || !e.claimValue)) {
    evidenceGaps.push('OFFICIAL_GOVERNANCE evidence unavailable.')
  }

  if (input.claimState === 'CLAIMED' || input.claimState === 'VERIFIED') {
    pending.push({
      id: 'action.review-staged',
      label: 'Review staged registry drafts before git promotion.',
      permission: 'EDIT_PROFILE',
      requiresVerification: true,
    })
  } else if (input.claimState === 'UNCLAIMED') {
    pending.push({
      id: 'action.claim',
      label: 'Project remains unclaimed — claim workflow required.',
      permission: 'MANAGE_TEAM',
      requiresVerification: true,
    })
  }

  if (input.staging.updates.length > 0) {
    pending.push({
      id: 'action.promote-updates',
      label: `${input.staging.updates.length} staged update(s) awaiting canonical registry merge.`,
      permission: 'PUBLISH_UPDATE',
      requiresVerification: true,
    })
  }

  return {
    gaps: gaps.sort((a, b) => a.id.localeCompare(b.id)),
    pending: pending.sort((a, b) => a.id.localeCompare(b.id)),
    evidenceGaps: evidenceGaps.sort(),
  }
}

export function buildProjectControlCenterDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  generatedAt?: string
}): ProjectControlCenterDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const slug = input.document.slug
  const projectId = input.document.projectId
  const claim = getClaimRecordForSlug(slug)
  const claimState: ClaimState = claim?.claimState ?? 'UNCLAIMED'
  const owners = buildOwners(projectId, slug)
  const ownerVerification = aggregateOwnerVerification(owners)
  const staging = stagingSnapshot(slug)
  const { gaps, pending, evidenceGaps } = buildGaps({
    document: input.document,
    evidencePack: input.evidencePack,
    claimState,
    staging,
  })
  const audit = listAuditRecords(slug)

  const revision = buildControlCenterRevision([
    input.document.revision,
    claimState,
    ownerVerification,
    ...owners.map((o) => `${o.ownerId}:${o.revision}`),
    staging.profile?.revision ?? '',
    ...staging.resources.map((r) => r.revision),
    ...staging.updates.map((u) => u.revision),
    ...staging.ecosystem.map((e) => e.revision),
    ...staging.developer.map((d) => d.revision),
    ...audit.map((a) => a.auditId),
  ])

  return {
    schemaVersion: PROJECT_CONTROL_CENTER_SCHEMA_VERSION,
    projectId,
    slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    revision,
    resolverRevision: CONTROL_CENTER_RESOLVER_REVISION,
    generatedAt,
    claimState,
    owners,
    overview: {
      claimState,
      ownerVerification,
      completionGaps: gaps,
      pendingActions: pending,
      evidenceGaps,
      stagedCounts: {
        profile: staging.profile ? 1 : 0,
        resources: staging.resources.length,
        updates: staging.updates.length,
        ecosystem: staging.ecosystem.length,
        developer: staging.developer.length,
      },
    },
    stagedProfile: staging.profile,
    stagedResources: staging.resources,
    stagedUpdates: staging.updates,
    stagedEcosystem: staging.ecosystem,
    stagedDeveloper: staging.developer,
    audit,
    sections: [...CONTROL_CENTER_SECTIONS],
    limitations: CONTROL_CENTER_LIMITATIONS,
  }
}

export function toControlCenterSummaryForProjectApi(
  doc: ProjectControlCenterDocument,
): ControlCenterSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_CONTROL_CENTER_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    claimState: doc.claimState,
    ownerVerification: doc.overview.ownerVerification,
    revision: doc.revision,
  }
}

export function loadProjectControlCenterDocument(
  slug: string,
  generatedAt?: string,
): ProjectControlCenterDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt: at })
  if (!loaded) return null
  return buildProjectControlCenterDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt: at,
  })
}
