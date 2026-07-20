import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  buildWalletRelationshipDocument,
  disconnectedObservation,
  loadProjectEvidencePack,
  normalizeProjectSlugInput,
  normalizeWalletAccountInput,
  walletAccountFromAddressAndChain,
} from 'registry/projects/identity'
import type { LiveWalletObservation } from 'registry/projects/identity/walletRelationship'

/**
 * GET /api/projects/{slug}/wallet-relationship/?account={caip10}
 *
 * Contextual wallet relationship document (melega.project-wallet-relationship.v1).
 * Private / no-store — never publicly cached. Live balances are resolved client-side;
 * this endpoint validates project+account and returns the shared resolver document with
 * LIVE_READ_CLIENT_REQUIRED for categories that require wallet RPC.
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
  const loaded = loadProjectEvidencePack(slug, { generatedAt })
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
    const body = buildWalletRelationshipDocument({
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
    // Allow address+chainId query pair
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

  const body = buildWalletRelationshipDocument({
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    observation,
    generatedAt,
  })

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(200).send(stringify(body))
}

export default handler
