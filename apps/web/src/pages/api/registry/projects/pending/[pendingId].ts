import type { NextApiHandler } from 'next'
import {
  getPendingProjectRegistry,
  serializePendingProjectProfile,
} from 'registry/projects/pending'
import type { PendingProjectStatus } from 'registry/projects/pending/types'

const handler: NextApiHandler = async (req, res) => {
  const pendingId = typeof req.query.pendingId === 'string' ? decodeURIComponent(req.query.pendingId) : ''

  if (!pendingId) {
    return res.status(400).json({ ok: false, reason: 'pendingId is required' })
  }

  const registry = getPendingProjectRegistry()
  const record = registry.getById(pendingId)

  if (!record) {
    return res.status(404).json({ ok: false, machine_code: 'PENDING_PROJECT_NOT_FOUND' })
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      tier: 'pending',
      is_canonical: false,
      profile: record,
      machine: serializePendingProjectProfile(record),
    })
  }

  if (req.method === 'PATCH') {
    const body = req.body ?? {}
    const status = body.status as PendingProjectStatus | undefined
    const allowed: PendingProjectStatus[] = [
      'discovered',
      'pending_review',
      'approved',
      'rejected',
      'archived',
    ]

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        ok: false,
        machine_code: 'INVALID_REVIEW_STATUS',
        reason: 'status must be a valid pending review state (not canonical — manual promotion only).',
      })
    }

    if (status === 'canonical') {
      return res.status(400).json({
        ok: false,
        machine_code: 'AUTO_CANONICAL_FORBIDDEN',
        reason: 'Canonical promotion requires manual STATIC_PROJECTS merge — not API auto-write.',
      })
    }

    const updated = registry.updateStatus(pendingId, status, {
      reviewed_by: typeof body.reviewed_by === 'string' ? body.reviewed_by : 'reviewer',
      review_notes: typeof body.review_notes === 'string' ? body.review_notes : undefined,
    })

    return res.status(200).json({
      ok: true,
      profile: updated,
      machine: updated ? serializePendingProjectProfile(updated) : null,
    })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ error: 'Method not allowed' })
}

export default handler
