import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  guardPrivateControlCenter,
  loadProjectControlCenterDocument,
  stageUpdatePublication,
} from 'registry/projects/identity/controlCenter'

/** POST /api/private/projects/{slug}/control-center/updates — stages PP008-shaped update. */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const guard = guardPrivateControlCenter(req, res, { mutation: true })
  if (!guard.ok) return

  const body = typeof req.body === 'object' && req.body ? req.body : {}
  const result = stageUpdatePublication({
    projectId: guard.projectId,
    slug: guard.slug,
    auth: guard.auth,
    payload: {
      stableKey: String(body.stableKey ?? ''),
      version: String(body.version ?? '1.0.0'),
      title: String(body.title ?? ''),
      summary: String(body.summary ?? ''),
      content: String(body.content ?? ''),
      category: String(body.category ?? ''),
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
      note: 'Staged only — frozen PP008 public registry is not mutated.',
    }),
  )
}

export default handler
