import type { NextApiHandler } from 'next'
import { loadProjectEvidencePack, normalizeProjectSlugInput, stableEvidencePayload } from 'registry/projects/identity'

/**
 * GET /api/public/projects/{slug}/evidence
 * PP002 machine-readable evidence pack (schema melega.project-evidence.v1).
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

  const loaded = loadProjectEvidencePack(slug, {
    generatedAt: new Date().toISOString(),
  })
  if (!loaded) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Unknown project slug' })
  }

  const payload = stableEvidencePayload(loaded.evidencePack)
  const etag = `"${loaded.evidencePack.projectRevision}-ev"`

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.setHeader('ETag', etag)

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end()
  }

  return res.status(200).send(payload)
}

export default handler
