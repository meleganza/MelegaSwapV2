import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  buildProjectParticipationContextualDocument,
  disconnectedObservation,
  loadProjectEvidencePack,
  normalizeProjectSlugInput,
  normalizeWalletAccountInput,
  resolveProjectBySlug,
  walletAccountFromAddressAndChain,
  type LiveWalletObservation,
} from 'registry/projects/identity'

/**
 * GET /api/projects/{slug}/participation/?account={caip10}
 *
 * Contextual participation document — private / no-store.
 * Live position amounts require client PP004 readers; this endpoint validates
 * project+account and returns shared opportunities plus PP004-mapped relationships
 * with LIVE_READ_CLIENT_REQUIRED when observation is unavailable server-side.
 */
const handler: NextApiHandler = (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const rawSlug =
    typeof req.query.slug === 'string' ? req.query.slug : Array.isArray(req.query.slug) ? req.query.slug[0] : ''
  const slug = normalizeProjectSlugInput(rawSlug)
  if (!slug) {
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Malformed or unknown project slug' })
  }

  const generatedAt = new Date().toISOString()
  const projectResolved = resolveProjectBySlug(slug)
  if (!projectResolved.ok) {
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Unknown project slug' })
  }

  const loaded = loadProjectEvidencePack(projectResolved.slug, { generatedAt })
  if (!loaded) {
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Unknown project slug' })
  }

  const rawAccount =
    typeof req.query.account === 'string'
      ? req.query.account
      : Array.isArray(req.query.account)
        ? req.query.account[0]
        : undefined

  if (!rawAccount) {
    const body = buildProjectParticipationContextualDocument({
      project: projectResolved.project,
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      observation: disconnectedObservation(generatedAt),
      generatedAt,
    })
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).send(stringify(body))
  }

  let walletAccount = normalizeWalletAccountInput(rawAccount)
  if (!walletAccount) {
    const chainRaw =
      typeof req.query.chainId === 'string'
        ? req.query.chainId
        : Array.isArray(req.query.chainId)
          ? req.query.chainId[0]
          : undefined
    const chainId = chainRaw ? Number(chainRaw) : NaN
    if (Number.isInteger(chainId) && chainId > 0) {
      walletAccount = walletAccountFromAddressAndChain(rawAccount, chainId)
    }
  }

  if (!walletAccount) {
    return res.status(400).json({
      ok: false,
      reason: 'ACCOUNT_INVALID',
      message: 'Provide a CAIP-10 account or address with chainId.',
    })
  }

  const observation: LiveWalletObservation = {
    walletAccountCaip10: walletAccount,
    connectionState: 'CONNECTED',
    activeChainId: Number(walletAccount.split(':')[1]) || null,
    observedAt: generatedAt,
    assetBalances: null,
    assetBalanceAvailability: 'UNAVAILABLE',
    assetBalanceReason: 'LIVE_READ_CLIENT_REQUIRED',
    liquidityPositions: null,
    liquidityAvailability: 'UNAVAILABLE',
    liquidityReason: 'LIVE_READ_CLIENT_REQUIRED',
    farmPositions: null,
    farmAvailability: 'UNAVAILABLE',
    farmReason: 'LIVE_READ_CLIENT_REQUIRED',
    poolPositions: null,
    poolAvailability: 'UNAVAILABLE',
    poolReason: 'LIVE_READ_CLIENT_REQUIRED',
  }

  const body = buildProjectParticipationContextualDocument({
    project: projectResolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    observation,
    generatedAt,
  })

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(200).send(stringify(body))
}

export default handler
