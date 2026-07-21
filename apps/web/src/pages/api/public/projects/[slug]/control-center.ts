import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  loadProjectControlCenterDocument,
  normalizeProjectSlugInput,
  toControlCenterSummaryForProjectApi,
} from 'registry/projects/identity'

/**
 * GET /api/public/projects/{slug}/control-center/
 * Public-safe claim/verification only — nothing private.
 */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const raw =
    typeof req.query.slug === 'string' ? req.query.slug : Array.isArray(req.query.slug) ? req.query.slug[0] : ''
  const slug = normalizeProjectSlugInput(raw)
  if (!slug) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Malformed or unknown project slug' })
  }

  const doc = loadProjectControlCenterDocument(slug, new Date().toISOString())
  if (!doc) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Unknown project slug' })
  }

  const summary = toControlCenterSummaryForProjectApi(doc)
  const body = {
    schemaVersion: doc.schemaVersion,
    projectId: doc.projectId,
    slug: doc.slug,
    revision: summary.revision,
    generatedAt: doc.generatedAt,
    claimState: summary.claimState,
    ownerVerification: summary.ownerVerification,
    limitations: [
      'Public endpoint exposes claim state and owner verification only.',
      'Private Control Center mutations require authenticated operator access.',
    ],
  }

  const payload = stringify(body)
  const etag = `"${doc.projectRevision}:${summary.revision}:public"`
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.setHeader('ETag', etag)
  if (req.headers['if-none-match'] === etag) return res.status(304).end()
  return res.status(200).send(payload)
}

export default handler
