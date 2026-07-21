import stringify from 'fast-json-stable-stringify'
import { isSafeHttpUrl, sanitizePlainText } from '../urlSafety'
import { isUpdateCategory } from '../updates/schema'
import { fingerprint } from '../evidence/evidenceId'
import { appendAuditRecord } from './audit.store'
import { buildAuditId, buildStagingRevision } from './ids'
import type { AuditAction, ControlCenterSection, OwnerPermission } from './schema'
import {
  getStagingBucket,
  listStagedDeveloper,
  listStagedEcosystem,
  listStagedResources,
  listStagedUpdates,
} from './staging.store'
import type {
  ControlCenterAuthContext,
  ControlCenterMutationError,
  ControlCenterMutationResult,
  ProjectOwner,
  StagedDeveloperDraft,
  StagedEcosystemDraft,
  StagedProfileDraft,
  StagedResourceDraft,
  StagedUpdateDraft,
} from './types'

function writeAudit(input: {
  projectId: string
  slug: string
  owner: ProjectOwner
  action: AuditAction
  section: ControlCenterSection
  summary: string
  beforeRevision: string | null
  afterRevision: string
  changeFingerprint: string
  createdAt: string
}): string {
  const auditId = buildAuditId({
    projectId: input.projectId,
    actorOwnerId: input.owner.ownerId,
    action: input.action,
    createdAt: input.createdAt,
    changeFingerprint: input.changeFingerprint,
  })
  appendAuditRecord({
    auditId,
    projectId: input.projectId,
    projectSlug: input.slug,
    actorOwnerId: input.owner.ownerId,
    action: input.action,
    section: input.section,
    summary: input.summary,
    beforeRevision: input.beforeRevision,
    afterRevision: input.afterRevision,
    createdAt: input.createdAt,
    changeFingerprint: input.changeFingerprint,
  })
  return auditId
}

function requireVerified(owner: ProjectOwner): ControlCenterMutationError | null {
  if (owner.verificationState !== 'VERIFIED') {
    return {
      ok: false,
      reasonCode: 'MUTATION_REQUIRES_VERIFICATION',
      message: 'Verified owner identity required for mutations.',
    }
  }
  return null
}

function requirePermission(owner: ProjectOwner, permission: OwnerPermission): ControlCenterMutationError | null {
  const verified = requireVerified(owner)
  if (verified) return verified
  if (!owner.permissions.includes(permission)) {
    return {
      ok: false,
      reasonCode: 'INVALID_PERMISSION',
      message: `Missing permission ${permission}.`,
    }
  }
  return null
}

export function stageProfileMutation(input: {
  projectId: string
  slug: string
  auth: ControlCenterAuthContext
  payload: Partial<{
    displayName: string
    summary: string
    categories: string[]
    tags: string[]
    websiteUrl: string | null
    docsUrl: string | null
    logoUrl: string | null
    socialLinks: { type: string; url: string }[]
  }>
  now?: string
}): ControlCenterMutationResult<StagedProfileDraft> | ControlCenterMutationError {
  const denied = requirePermission(input.auth.owner, 'EDIT_PROFILE')
  if (denied) return denied

  const createdAt = input.now ?? new Date().toISOString()
  const bucket = getStagingBucket(input.slug)
  const beforeRevision = bucket.profile?.revision ?? null

  const displayName = input.payload.displayName
    ? sanitizePlainText(input.payload.displayName, 120)
    : bucket.profile?.displayName ?? null
  const summary = input.payload.summary
    ? sanitizePlainText(input.payload.summary, 500)
    : bucket.profile?.summary ?? null

  let websiteUrl =
    input.payload.websiteUrl !== undefined ? input.payload.websiteUrl : bucket.profile?.websiteUrl ?? null
  let docsUrl = input.payload.docsUrl !== undefined ? input.payload.docsUrl : bucket.profile?.docsUrl ?? null
  let logoUrl = input.payload.logoUrl !== undefined ? input.payload.logoUrl : bucket.profile?.logoUrl ?? null

  for (const [label, url] of [
    ['websiteUrl', websiteUrl],
    ['docsUrl', docsUrl],
    ['logoUrl', logoUrl],
  ] as const) {
    if (url && !isSafeHttpUrl(url)) {
      return { ok: false, reasonCode: 'UNSAFE_URL', message: `Unsafe ${label}.` }
    }
  }

  const socialLinks = (input.payload.socialLinks ?? bucket.profile?.socialLinks ?? [])
    .map((link) => ({
      type: sanitizePlainText(link.type, 32) ?? 'other',
      url: link.url.trim(),
    }))
    .filter((link) => isSafeHttpUrl(link.url))

  const categories = (input.payload.categories ?? bucket.profile?.categories ?? [])
    .map((c) => sanitizePlainText(c, 40))
    .filter((c): c is string => Boolean(c))
    .slice(0, 12)
  const tags = (input.payload.tags ?? bucket.profile?.tags ?? [])
    .map((t) => sanitizePlainText(t, 40))
    .filter((t): t is string => Boolean(t))
    .slice(0, 24)

  const revision = buildStagingRevision([
    displayName ?? '',
    summary ?? '',
    categories.join(','),
    tags.join(','),
    websiteUrl ?? '',
    docsUrl ?? '',
    logoUrl ?? '',
    stringify(socialLinks),
    createdAt,
  ])

  const draft: StagedProfileDraft = {
    displayName,
    summary,
    categories,
    tags,
    websiteUrl,
    docsUrl,
    logoUrl,
    socialLinks,
    updatedAt: createdAt,
    revision,
  }
  bucket.profile = draft

  const auditId = writeAudit({
    projectId: input.projectId,
    slug: input.slug,
    owner: input.auth.owner,
    action: 'PROFILE_STAGE',
    section: 'PROFILE',
    summary: 'Staged profile registry draft.',
    beforeRevision,
    afterRevision: revision,
    changeFingerprint: fingerprint(stringify(draft)),
    createdAt,
  })

  return { ok: true, data: draft, auditId, revision }
}

export function stageResourceMutation(input: {
  projectId: string
  slug: string
  auth: ControlCenterAuthContext
  payload: {
    resourceKey: string
    kind: string
    title: string
    url: string | null
    summary: string
  }
  now?: string
}): ControlCenterMutationResult<StagedResourceDraft> | ControlCenterMutationError {
  const denied = requirePermission(input.auth.owner, 'EDIT_RESOURCES')
  if (denied) return denied

  const createdAt = input.now ?? new Date().toISOString()
  const resourceKey = sanitizePlainText(input.payload.resourceKey, 80)
  const kind = sanitizePlainText(input.payload.kind, 40)
  const title = sanitizePlainText(input.payload.title, 160)
  const summary = sanitizePlainText(input.payload.summary, 500)
  if (!resourceKey || !kind || !title || !summary) {
    return { ok: false, reasonCode: 'INVALID_PAYLOAD', message: 'Invalid resource payload.' }
  }
  if (input.payload.url && !isSafeHttpUrl(input.payload.url)) {
    return { ok: false, reasonCode: 'UNSAFE_URL', message: 'Unsafe resource URL.' }
  }

  const bucket = getStagingBucket(input.slug)
  const beforeRevision = bucket.resources.get(resourceKey)?.revision ?? null
  const revision = buildStagingRevision([resourceKey, kind, title, summary, input.payload.url ?? '', createdAt])
  const draft: StagedResourceDraft = {
    resourceKey,
    kind,
    title,
    url: input.payload.url,
    summary,
    updatedAt: createdAt,
    revision,
  }
  bucket.resources.set(resourceKey, draft)

  const auditId = writeAudit({
    projectId: input.projectId,
    slug: input.slug,
    owner: input.auth.owner,
    action: 'RESOURCE_STAGE',
    section: 'RESOURCES',
    summary: `Staged resource ${resourceKey}.`,
    beforeRevision,
    afterRevision: revision,
    changeFingerprint: fingerprint(stringify(draft)),
    createdAt,
  })

  return { ok: true, data: draft, auditId, revision }
}

export function stageUpdatePublication(input: {
  projectId: string
  slug: string
  auth: ControlCenterAuthContext
  payload: {
    stableKey: string
    version: string
    title: string
    summary: string
    content: string
    category: string
  }
  now?: string
}): ControlCenterMutationResult<StagedUpdateDraft> | ControlCenterMutationError {
  const denied = requirePermission(input.auth.owner, 'PUBLISH_UPDATE')
  if (denied) return denied

  const createdAt = input.now ?? new Date().toISOString()
  const stableKey = sanitizePlainText(input.payload.stableKey, 120)
  const version = sanitizePlainText(input.payload.version, 32)
  const title = sanitizePlainText(input.payload.title, 200)
  const summary = sanitizePlainText(input.payload.summary, 500)
  const content = sanitizePlainText(input.payload.content, 4000)
  if (!stableKey || !version || !title || !summary || !content) {
    return { ok: false, reasonCode: 'INVALID_PAYLOAD', message: 'Invalid update payload.' }
  }
  if (!isUpdateCategory(input.payload.category)) {
    return { ok: false, reasonCode: 'INVALID_PAYLOAD', message: 'Invalid update category.' }
  }

  const bucket = getStagingBucket(input.slug)
  const beforeRevision = bucket.updates.get(stableKey)?.revision ?? null
  const revision = buildStagingRevision([
    stableKey,
    version,
    title,
    summary,
    content,
    input.payload.category,
    createdAt,
  ])

  // Canonical update object shape (PP008-compatible) — staged only; does not mutate frozen registry.
  const draft: StagedUpdateDraft = {
    stableKey,
    version,
    publishedAt: createdAt,
    title,
    summary,
    content,
    category: input.payload.category,
    authorType: 'PROJECT',
    authorIdentity: input.auth.owner.stableKey,
    status: 'STAGED',
    updatedAt: createdAt,
    revision,
  }
  bucket.updates.set(stableKey, draft)

  const auditId = writeAudit({
    projectId: input.projectId,
    slug: input.slug,
    owner: input.auth.owner,
    action: 'UPDATE_PUBLISH_STAGE',
    section: 'UPDATES',
    summary: `Staged update publication ${stableKey}.`,
    beforeRevision,
    afterRevision: revision,
    changeFingerprint: fingerprint(stringify(draft)),
    createdAt,
  })

  return { ok: true, data: draft, auditId, revision }
}

export function stageEcosystemMutation(input: {
  projectId: string
  slug: string
  auth: ControlCenterAuthContext
  payload: {
    serviceKey: string
    title: string
    summary: string
    route: string | null
    externalUrl: string | null
  }
  now?: string
}): ControlCenterMutationResult<StagedEcosystemDraft> | ControlCenterMutationError {
  const denied = requirePermission(input.auth.owner, 'MANAGE_ECOSYSTEM')
  if (denied) return denied

  const createdAt = input.now ?? new Date().toISOString()
  const serviceKey = sanitizePlainText(input.payload.serviceKey, 120)
  const title = sanitizePlainText(input.payload.title, 120)
  const summary = sanitizePlainText(input.payload.summary, 400)
  if (!serviceKey || !title || !summary) {
    return { ok: false, reasonCode: 'INVALID_PAYLOAD', message: 'Invalid ecosystem payload.' }
  }
  let route = input.payload.route ? sanitizePlainText(input.payload.route, 240) : null
  if (route && !route.startsWith('/')) {
    return { ok: false, reasonCode: 'UNSAFE_URL', message: 'Unsafe ecosystem route.' }
  }
  if (input.payload.externalUrl && !isSafeHttpUrl(input.payload.externalUrl)) {
    return { ok: false, reasonCode: 'UNSAFE_URL', message: 'Unsafe ecosystem URL.' }
  }

  const bucket = getStagingBucket(input.slug)
  const beforeRevision = bucket.ecosystem.get(serviceKey)?.revision ?? null
  const revision = buildStagingRevision([
    serviceKey,
    title,
    summary,
    route ?? '',
    input.payload.externalUrl ?? '',
    createdAt,
  ])
  const draft: StagedEcosystemDraft = {
    serviceKey,
    title,
    summary,
    route,
    externalUrl: input.payload.externalUrl,
    updatedAt: createdAt,
    revision,
  }
  bucket.ecosystem.set(serviceKey, draft)

  const auditId = writeAudit({
    projectId: input.projectId,
    slug: input.slug,
    owner: input.auth.owner,
    action: 'ECOSYSTEM_STAGE',
    section: 'ECOSYSTEM',
    summary: `Staged ecosystem service ${serviceKey}.`,
    beforeRevision,
    afterRevision: revision,
    changeFingerprint: fingerprint(stringify(draft)),
    createdAt,
  })

  return { ok: true, data: draft, auditId, revision }
}

export function stageDeveloperMutation(input: {
  projectId: string
  slug: string
  auth: ControlCenterAuthContext
  payload: {
    resourceKey: string
    title: string
    summary: string
    category: string
    url: string | null
    route: string | null
  }
  now?: string
}): ControlCenterMutationResult<StagedDeveloperDraft> | ControlCenterMutationError {
  const denied = requirePermission(input.auth.owner, 'MANAGE_DOCUMENTATION')
  if (denied) return denied

  const createdAt = input.now ?? new Date().toISOString()
  const resourceKey = sanitizePlainText(input.payload.resourceKey, 120)
  const title = sanitizePlainText(input.payload.title, 160)
  const summary = sanitizePlainText(input.payload.summary, 500)
  const category = sanitizePlainText(input.payload.category, 40)
  if (!resourceKey || !title || !summary || !category) {
    return { ok: false, reasonCode: 'INVALID_PAYLOAD', message: 'Invalid developer payload.' }
  }
  let route = input.payload.route ? sanitizePlainText(input.payload.route, 320) : null
  if (route && !route.startsWith('/')) {
    return { ok: false, reasonCode: 'UNSAFE_URL', message: 'Unsafe developer route.' }
  }
  if (input.payload.url && !isSafeHttpUrl(input.payload.url)) {
    return { ok: false, reasonCode: 'UNSAFE_URL', message: 'Unsafe developer URL.' }
  }

  const bucket = getStagingBucket(input.slug)
  const beforeRevision = bucket.developer.get(resourceKey)?.revision ?? null
  const revision = buildStagingRevision([
    resourceKey,
    title,
    summary,
    category,
    input.payload.url ?? '',
    route ?? '',
    createdAt,
  ])
  const draft: StagedDeveloperDraft = {
    resourceKey,
    title,
    summary,
    category,
    url: input.payload.url,
    route,
    updatedAt: createdAt,
    revision,
  }
  bucket.developer.set(resourceKey, draft)

  const auditId = writeAudit({
    projectId: input.projectId,
    slug: input.slug,
    owner: input.auth.owner,
    action: 'DEVELOPER_STAGE',
    section: 'DEVELOPER',
    summary: `Staged developer resource ${resourceKey}.`,
    beforeRevision,
    afterRevision: revision,
    changeFingerprint: fingerprint(stringify(draft)),
    createdAt,
  })

  return { ok: true, data: draft, auditId, revision }
}

export function stagingSnapshot(slug: string) {
  return {
    profile: getStagingBucket(slug).profile,
    resources: listStagedResources(slug),
    updates: listStagedUpdates(slug),
    ecosystem: listStagedEcosystem(slug),
    developer: listStagedDeveloper(slug),
  }
}
