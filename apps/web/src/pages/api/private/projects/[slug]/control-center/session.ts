import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  appendAuditRecord,
  buildAuditId,
  guardPrivateControlCenter,
  loadProjectControlCenterDocument,
} from 'registry/projects/identity/controlCenter'
import { fingerprint } from 'registry/projects/identity/evidence'

/**
 * GET /api/private/projects/{slug}/control-center/session
 * Authenticated session probe — never public.
 */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const guard = guardPrivateControlCenter(req, res)
  if (!guard.ok) return

  const createdAt = new Date().toISOString()
  const doc = loadProjectControlCenterDocument(guard.slug, createdAt)
  if (!doc) {
    return res.status(404).json({ ok: false, reasonCode: 'PROJECT_NOT_FOUND', message: 'Unknown project.' })
  }

  const changeFingerprint = fingerprint(`${guard.auth.owner.ownerId}|SESSION_OPEN|${createdAt}`)
  const auditId = buildAuditId({
    projectId: guard.projectId,
    actorOwnerId: guard.auth.owner.ownerId,
    action: 'SESSION_OPEN',
    createdAt,
    changeFingerprint,
  })
  appendAuditRecord({
    auditId,
    projectId: guard.projectId,
    projectSlug: guard.slug,
    actorOwnerId: guard.auth.owner.ownerId,
    action: 'SESSION_OPEN',
    section: 'OVERVIEW',
    summary: 'Opened authenticated Control Center session.',
    beforeRevision: null,
    afterRevision: doc.revision,
    createdAt,
    changeFingerprint,
  })

  const body = {
    ok: true as const,
    authenticated: true,
    authorized: true,
    verified: guard.auth.verified,
    claimState: doc.claimState,
    owner: {
      ownerId: guard.auth.owner.ownerId,
      identityType: guard.auth.owner.identityType,
      identityLabel: guard.auth.owner.identityLabel,
      verificationState: guard.auth.owner.verificationState,
      roles: guard.auth.owner.roles,
      permissions: guard.auth.owner.permissions,
      revision: guard.auth.owner.revision,
    },
    managePath: `/project-hq/${guard.slug}/manage`,
    auditId,
    revision: doc.revision,
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(stringify(body))
}

export default handler
