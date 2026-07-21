import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import { assertPermission, guardPrivateControlCenter, listAuditRecords } from 'registry/projects/identity/controlCenter'

/** GET /api/private/projects/{slug}/control-center/audit */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const guard = guardPrivateControlCenter(req, res)
  if (!guard.ok) return

  const denied = assertPermission(guard.auth, 'VIEW_AUDIT')
  if (denied.ok !== true) {
    // OWNER/ADMIN also have VIEW_AUDIT via role matrix; assertPermission covers it.
    return res.status(denied.reasonCode === 'UNAUTHORIZED' ? 401 : 403).json(denied)
  }

  const records = listAuditRecords(guard.slug)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(
    stringify({
      ok: true,
      projectSlug: guard.slug,
      count: records.length,
      audit: records,
    }),
  )
}

export default handler
