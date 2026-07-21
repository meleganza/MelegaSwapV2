import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  guardPrivateControlCenter,
  loadProjectControlCenterDocument,
  stageResourceMutation,
} from 'registry/projects/identity/controlCenter'

/** POST /api/private/projects/{slug}/control-center/resources */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const guard = guardPrivateControlCenter(req, res, { mutation: true })
  if (!guard.ok) return

  const body = typeof req.body === 'object' && req.body ? req.body : {}
  const result = stageResourceMutation({
    projectId: guard.projectId,
    slug: guard.slug,
    auth: guard.auth,
    payload: {
      resourceKey: String(body.resourceKey ?? ''),
      kind: String(body.kind ?? ''),
      title: String(body.title ?? ''),
      url: body.url === null || typeof body.url === 'string' ? body.url : null,
      summary: String(body.summary ?? ''),
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
