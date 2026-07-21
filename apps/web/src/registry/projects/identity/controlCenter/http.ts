import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateControlCenterRequest, assertSafeMutationOrigin, listControlCenterOperatorSecrets } from './auth'
import { checkRateLimit } from './rateLimit'
import { loadProjectControlCenterDocument } from './buildProjectControlCenterDocument'
import { resolveProjectBySlug, normalizeProjectSlugInput } from '../resolveProject'
import type { ControlCenterAuthContext } from './types'

export function resolveSlug(req: NextApiRequest): string | null {
  const raw =
    typeof req.query.slug === 'string' ? req.query.slug : Array.isArray(req.query.slug) ? req.query.slug[0] : ''
  return normalizeProjectSlugInput(raw)
}

export function clientKey(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : Array.isArray(forwarded)
      ? forwarded[0]
      : req.socket?.remoteAddress ?? 'unknown'
  return `${ip}:${extractPath(req)}`
}

function extractPath(req: NextApiRequest): string {
  return typeof req.url === 'string' ? req.url.split('?')[0] ?? 'cc' : 'cc'
}

export function guardPrivateControlCenter(
  req: NextApiRequest,
  res: NextApiResponse,
  options?: { mutation?: boolean },
):
  | {
      ok: true
      slug: string
      projectId: string
      auth: ControlCenterAuthContext
    }
  | { ok: false } {
  if (listControlCenterOperatorSecrets().length === 0) {
    res.status(503).json({
      ok: false,
      reasonCode: 'UNAUTHORIZED',
      message: 'Control Center operator secret is not configured.',
    })
    return { ok: false }
  }

  const slug = resolveSlug(req)
  if (!slug) {
    res.status(404).json({ ok: false, reasonCode: 'PROJECT_NOT_FOUND', message: 'Unknown project slug.' })
    return { ok: false }
  }

  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) {
    res.status(404).json({ ok: false, reasonCode: 'PROJECT_NOT_FOUND', message: 'Unknown project slug.' })
    return { ok: false }
  }

  const rate = checkRateLimit({
    key: clientKey(req),
    limit: options?.mutation ? 30 : 120,
    windowMs: 60_000,
  })
  if (rate.allowed !== true) {
    res.setHeader('Retry-After', String(Math.ceil(rate.retryAfterMs / 1000)))
    res.status(429).json({ ok: false, reasonCode: 'RATE_LIMITED', message: 'Rate limit exceeded.' })
    return { ok: false }
  }

  if (options?.mutation && !assertSafeMutationOrigin(req)) {
    res.status(403).json({
      ok: false,
      reasonCode: 'FORBIDDEN',
      message: 'Cross-site mutation rejected.',
    })
    return { ok: false }
  }

  const loaded = loadProjectEvidenceProjectId(resolved.slug)
  if (!loaded) {
    res.status(404).json({ ok: false, reasonCode: 'PROJECT_NOT_FOUND', message: 'Unknown project slug.' })
    return { ok: false }
  }

  const auth = authenticateControlCenterRequest({
    req,
    projectId: loaded.projectId,
    slug: resolved.slug,
  })
  if (auth.authorized !== true) {
    res.status(auth.reasonCode === 'UNAUTHORIZED' ? 401 : 403).json({
      ok: false,
      reasonCode: auth.reasonCode,
      message: auth.message,
    })
    return { ok: false }
  }

  return {
    ok: true,
    slug: resolved.slug,
    projectId: loaded.projectId,
    auth,
  }
}

function loadProjectEvidenceProjectId(slug: string): { projectId: string } | null {
  const doc = loadProjectControlCenterDocument(slug)
  if (!doc) return null
  return { projectId: doc.projectId }
}
