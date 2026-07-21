import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  guardPrivateControlCenter,
  loadProjectControlCenterDocument,
  stageProfileMutation,
} from 'registry/projects/identity/controlCenter'

/**
 * PATCH /api/private/projects/{slug}/control-center/profile
 * Stages profile registry draft — does not mutate frozen public registry.
 */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const guard = guardPrivateControlCenter(req, res, { mutation: true })
  if (!guard.ok) return

  const body = typeof req.body === 'object' && req.body ? req.body : {}
  const result = stageProfileMutation({
    projectId: guard.projectId,
    slug: guard.slug,
    auth: guard.auth,
    payload: {
      displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
      summary: typeof body.summary === 'string' ? body.summary : undefined,
      categories: Array.isArray(body.categories) ? body.categories.map(String) : undefined,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      websiteUrl: body.websiteUrl === null || typeof body.websiteUrl === 'string' ? body.websiteUrl : undefined,
      docsUrl: body.docsUrl === null || typeof body.docsUrl === 'string' ? body.docsUrl : undefined,
      logoUrl: body.logoUrl === null || typeof body.logoUrl === 'string' ? body.logoUrl : undefined,
      socialLinks: Array.isArray(body.socialLinks)
        ? body.socialLinks
            .filter((l: unknown) => l && typeof l === 'object')
            .map((l: { type?: string; url?: string }) => ({
              type: String(l.type ?? 'other'),
              url: String(l.url ?? ''),
            }))
        : undefined,
    },
  })

  if (result.ok !== true) {
    const status =
      result.reasonCode === 'INVALID_PERMISSION' || result.reasonCode === 'MUTATION_REQUIRES_VERIFICATION' ? 403 : 400
    return res.status(status).json(result)
  }

  const doc = loadProjectControlCenterDocument(guard.slug)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(
    stringify({
      ok: true,
      draft: result.data,
      auditId: result.auditId,
      revision: result.revision,
      controlCenterRevision: doc?.revision ?? result.revision,
    }),
  )
}

export default handler
