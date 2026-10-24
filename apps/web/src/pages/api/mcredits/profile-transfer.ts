import type { NextApiHandler } from 'next'
import { ethers } from 'ethers'
import { readDexMcreditsProfile } from 'lib/mcredits/profileLedger'
import { transferDexProfileMcredits } from 'lib/mcredits/profileTransfer'
import { buildDexMcreditsBalanceMessage } from 'lib/mcredits/profileTransferMessage'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const wallet = String(req.query.wallet ?? '').toLowerCase()
    if (!/^0x[a-f0-9]{40}$/.test(wallet)) return res.status(400).json({ ok: false, gate: 'INVALID_WALLET' })
    const issuedAt = String(req.query.issuedAt ?? '')
    const signature = String(req.query.signature ?? '')
    const issuedMs = Date.parse(issuedAt)
    if (!Number.isFinite(issuedMs) || Math.abs(Date.now() - issuedMs) > 5 * 60_000) {
      return res.status(401).json({ ok: false, gate: 'WALLET_PROOF_EXPIRED' })
    }
    try {
      const recovered = ethers.utils.verifyMessage(buildDexMcreditsBalanceMessage(wallet, issuedAt), signature)
      if (recovered.toLowerCase() !== wallet) return res.status(403).json({ ok: false, gate: 'WALLET_SIGNER_MISMATCH' })
    } catch {
      return res.status(401).json({ ok: false, gate: 'INVALID_WALLET_SIGNATURE' })
    }
    try {
      const profile = await readDexMcreditsProfile(wallet)
      return res.status(200).json({ ok: true, profile: profile ? { wallet: profile.wallet, balanceMinor: profile.balanceMinor } : null })
    } catch {
      return res.status(503).json({ ok: false, gate: 'STORAGE_UNAVAILABLE' })
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ ok: false, gate: 'METHOD_NOT_ALLOWED' })
  }
  let body: Record<string, unknown>
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {} } catch {
    return res.status(400).json({ ok: false, gate: 'INVALID_JSON' })
  }
  const direction = body.direction === 'PASSPORT_TO_APP' || body.direction === 'APP_TO_PASSPORT'
    ? body.direction
    : null
  if (!direction) return res.status(400).json({ ok: false, gate: 'INVALID_DIRECTION' })
  const result = await transferDexProfileMcredits({
    wallet: String(body.wallet ?? ''), signature: String(body.signature ?? ''), issuedAt: String(body.issuedAt ?? ''),
    direction, amountMinor: String(body.amountMinor ?? ''), externalReference: String(body.externalReference ?? ''),
    customerAuthorization: String(body.customerAuthorization ?? ''), passportSubject: String(body.passportSubject ?? ''),
  })
  return res.status(result.ok ? 200 : result.gate === 'PASSPORT_TRANSFER_UNREACHABLE' ? 503 : 400).json(result)
}

export default handler
