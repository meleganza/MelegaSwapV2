import type { NextApiHandler } from 'next'
import { ethers } from 'ethers'
import {
  PROJECT_REACTION_IDS,
  PROJECT_REACTION_SIGNATURE_MAX_AGE_MS,
  buildProjectReactionMessage,
  type ProjectReactionId,
} from 'lib/project-reactions/contract'
import { loadProjectReactionSnapshot, setProjectReaction } from 'lib/project-reactions/store'
import { normalizeProjectSlugInput } from 'registry/projects/identity'

function accountFrom(value: unknown): string | null {
  if (typeof value !== 'string' || !ethers.utils.isAddress(value)) return null
  return value.toLowerCase()
}

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const rawSlug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug
  const slug = normalizeProjectSlugInput(rawSlug || '')
  if (!slug) return res.status(404).json({ ok: false, reason: 'PROJECT_NOT_FOUND' })

  if (req.method === 'GET') {
    const account = accountFrom(Array.isArray(req.query.account) ? req.query.account[0] : req.query.account)
    try {
      return res.status(200).json({ ok: true, ...(await loadProjectReactionSnapshot(slug, account)) })
    } catch {
      return res.status(503).json({ ok: false, reason: 'REACTIONS_TEMPORARILY_UNAVAILABLE' })
    }
  }

  if (req.method === 'POST') {
    const account = accountFrom(req.body?.account)
    const reaction = req.body?.reaction as ProjectReactionId
    const active = req.body?.active
    const signature = typeof req.body?.signature === 'string' ? req.body.signature : ''
    const signedAt = typeof req.body?.signedAt === 'string' ? req.body.signedAt : ''
    if (!account) return res.status(400).json({ ok: false, reason: 'WALLET_REQUIRED' })
    if (!PROJECT_REACTION_IDS.includes(reaction)) {
      return res.status(400).json({ ok: false, reason: 'REACTION_INVALID' })
    }
    if (typeof active !== 'boolean') return res.status(400).json({ ok: false, reason: 'ACTIVE_INVALID' })
    const signedAtMs = Date.parse(signedAt)
    if (!Number.isFinite(signedAtMs) || Math.abs(Date.now() - signedAtMs) > PROJECT_REACTION_SIGNATURE_MAX_AGE_MS) {
      return res.status(401).json({ ok: false, reason: 'SIGNATURE_EXPIRED' })
    }
    const message = buildProjectReactionMessage({ slug, account, reaction, active, signedAt })
    let recovered = ''
    try {
      recovered = ethers.utils.verifyMessage(message, signature).toLowerCase()
    } catch {
      return res.status(401).json({ ok: false, reason: 'SIGNATURE_INVALID' })
    }
    if (recovered !== account) return res.status(401).json({ ok: false, reason: 'SIGNATURE_INVALID' })
    try {
      return res.status(200).json({
        ok: true,
        ...(await setProjectReaction({ slug, account, reaction, active })),
      })
    } catch {
      return res.status(503).json({ ok: false, reason: 'REACTIONS_TEMPORARILY_UNAVAILABLE' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
}

export default handler
