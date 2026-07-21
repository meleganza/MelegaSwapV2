import type { NextApiRequest } from 'next'
import { normalizeEvmAddress } from '../caip'
import { permissionsForRoles, type OwnerPermission, type OwnerRole } from './schema'
import { buildOwnerId, buildOwnerRevision } from './ids'
import { listOwnersForSlug } from './registry.data'
import type { ControlCenterAuthResult, ProjectOwner } from './types'

/** Resolve operator secrets supported by repository private-API conventions. */
export function listControlCenterOperatorSecrets(): string[] {
  return [process.env.PROJECT_CONTROL_OPERATOR_SECRET, process.env.CRON_SECRET, process.env.INDEXER_CRON_SECRET].filter(
    (value): value is string => Boolean(value && value.length >= 8),
  )
}

export function extractBearerToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization
  if (typeof auth !== 'string') return null
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim())
  return match?.[1]?.trim() || null
}

function toProjectOwner(projectId: string, slug: string, stableKey: string): ProjectOwner | null {
  const row = listOwnersForSlug(slug).find((r) => r.stableKey === stableKey)
  if (!row) return null
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
}

/**
 * Authenticate Control Center actor.
 * Repository supports operator Bearer secrets (indexer pattern), not SIWE.
 * Optional `x-melega-owner-key` selects a seeded operator identity (defaults to OWNER).
 */
export function authenticateControlCenterRequest(input: {
  req: NextApiRequest
  projectId: string
  slug: string
}): ControlCenterAuthResult {
  const token = extractBearerToken(input.req)
  const secrets = listControlCenterOperatorSecrets()
  if (!token || secrets.length === 0 || !secrets.includes(token)) {
    return {
      authorized: false,
      reasonCode: 'UNAUTHORIZED',
      message: 'Valid operator Bearer token required for Control Center access.',
    }
  }

  const requestedKey =
    typeof input.req.headers['x-melega-owner-key'] === 'string'
      ? input.req.headers['x-melega-owner-key']
      : 'melega-dex.owner.platform-operator'

  const owner = toProjectOwner(input.projectId, input.slug, requestedKey)
  if (!owner) {
    return {
      authorized: false,
      reasonCode: 'FORBIDDEN',
      message: 'Owner identity is not registered for this project.',
    }
  }

  if (owner.verificationState === 'SUSPENDED' || owner.verificationState === 'UNAVAILABLE') {
    return {
      authorized: false,
      reasonCode: 'FORBIDDEN',
      message: 'Owner identity is suspended or unavailable.',
    }
  }

  return {
    authorized: true,
    verified: owner.verificationState === 'VERIFIED',
    owner,
    permissions: owner.permissions,
    actorLabel: owner.identityLabel,
  }
}

export function assertPermission(
  auth: ControlCenterAuthResult,
  permission: OwnerPermission,
): { ok: true } | { ok: false; reasonCode: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_PERMISSION'; message: string } {
  if (auth.authorized !== true) {
    return {
      ok: false,
      reasonCode: auth.reasonCode === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'FORBIDDEN',
      message: auth.message,
    }
  }
  if (!auth.verified) {
    return {
      ok: false,
      reasonCode: 'FORBIDDEN',
      message: 'Verified owner identity required for mutations.',
    }
  }
  if (!auth.permissions.includes(permission)) {
    return {
      ok: false,
      reasonCode: 'INVALID_PERMISSION',
      message: `Missing permission ${permission}.`,
    }
  }
  return { ok: true }
}

/** CSRF mitigation for cookie-less Bearer APIs: reject cross-site browser form posts. */
export function assertSafeMutationOrigin(req: NextApiRequest): boolean {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true
  const secFetchSite = req.headers['sec-fetch-site']
  if (secFetchSite === 'cross-site') return false
  return true
}
