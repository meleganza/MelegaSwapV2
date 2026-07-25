import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import { normalizeProjectSlugInput, resolveProjectBySlug } from 'registry/projects/identity'
import { resolveProjectSpaceProfessionalProfile } from 'lib/space-professional-profile'

/**
 * GET /api/public/projects/{slug}/space-professional-profile
 * Read-only SPACE relationship summary. Authority: SPACE.
 */
const handler: NextApiHandler = async (req, res) => {
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

  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Unknown project slug' })
  }

  const { snapshot, summary, linkReason } = await resolveProjectSpaceProfessionalProfile(resolved.project)
  const body = {
    schemaVersion: 'melega.project-space-professional-profile.v1',
    ok: true,
    authority: 'SPACE' as const,
    slug: resolved.slug,
    projectId: resolved.project.upi,
    linkReason,
    spaceProfessionalProfile: summary,
    profile: snapshot.status === 'NO_CANONICAL_LINK' || snapshot.status === 'SPACE_UNAVAILABLE' ? null : snapshot,
  }

  const payload = stringify(body)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  res.setHeader('ETag', `"${Buffer.from(payload).toString('base64url').slice(0, 32)}"`)
  return res.status(200).send(payload)
}

export default handler
