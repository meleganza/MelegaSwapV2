import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import { guardPrivateControlCenter, loadProjectControlCenterDocument } from 'registry/projects/identity/controlCenter'

/**
 * GET /api/private/projects/{slug}/control-center
 * Full authenticated Control Center document.
 */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const guard = guardPrivateControlCenter(req, res)
  if (!guard.ok) return

  if (!guard.auth.verified) {
    return res.status(403).json({
      ok: false,
      reasonCode: 'MUTATION_REQUIRES_VERIFICATION',
      message: 'Verified owner identity required.',
    })
  }

  const doc = loadProjectControlCenterDocument(guard.slug)
  if (!doc) {
    return res.status(404).json({ ok: false, reasonCode: 'PROJECT_NOT_FOUND', message: 'Unknown project.' })
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(stringify(doc))
}

export default handler
