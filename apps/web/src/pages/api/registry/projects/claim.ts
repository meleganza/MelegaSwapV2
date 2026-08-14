import type { NextApiHandler } from 'next'
import { ethers } from 'ethers'
import {
  buildProjectClaimMessage,
  getProjectClaimByContract,
  normalizeClaimMetadata,
  persistProjectClaim,
  resolveContractAuthorities,
  toPublicProjectClaim,
  type ProjectClaimMessageInput,
  type ProjectClaimRecord,
} from 'lib/project-claims'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const chainId = Number(req.query.chainId ?? 56)
    const contract = String(req.query.contract ?? '')
    const claim = ethers.utils.isAddress(contract) ? await getProjectClaimByContract(chainId, contract) : null
    return res.status(200).json({ ok: true, claim: claim ? toPublicProjectClaim(claim) : null })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ ok: false, reason: 'Method not allowed' })
  }

  let body: Record<string, any>
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return res.status(400).json({ ok: false, code: 'INVALID_JSON', reason: 'Invalid request payload.' })
  }
  const action = body.action === 'publish' ? 'publish' : 'preflight'
  const chainId = Number(body.chainId ?? 56)
  const contract = String(body.contract ?? '').trim()
  const claimant = String(body.claimant ?? '').trim()

  if (!ethers.utils.isAddress(contract) || !ethers.utils.isAddress(claimant)) {
    return res.status(400).json({ ok: false, code: 'INVALID_IDENTITY', reason: 'Valid contract and wallet required.' })
  }

  const authorities = await resolveContractAuthorities(chainId, contract)
  if (!authorities.length) {
    return res.status(409).json({
      ok: false,
      code: 'AUTHORITY_UNRESOLVED',
      reason: 'This contract does not expose a verifiable owner and no deployer proof is available. Claim is blocked.',
    })
  }
  const authority = authorities.find((candidate) => candidate.address.toLowerCase() === claimant.toLowerCase())
  if (!authority) {
    return res.status(403).json({
      ok: false,
      code: 'WALLET_NOT_AUTHORIZED',
      reason: 'Connected wallet is not the contract owner or original deployer.',
    })
  }

  if (action === 'preflight') {
    return res.status(200).json({ ok: true, authorized: true, authorityType: authority.type })
  }

  const issuedAt = String(body.issuedAt ?? '')
  const signature = String(body.signature ?? '')
  const metadata = normalizeClaimMetadata(body.metadata || {})
  if (!metadata.handle || !metadata.name || !metadata.symbol || !metadata.description) {
    return res.status(400).json({ ok: false, code: 'INCOMPLETE_PROFILE', reason: 'Project identity is incomplete.' })
  }
  const issuedMs = Date.parse(issuedAt)
  if (!Number.isFinite(issuedMs) || Math.abs(Date.now() - issuedMs) > 10 * 60_000) {
    return res.status(400).json({ ok: false, code: 'EXPIRED_PROOF', reason: 'Ownership proof expired. Sign again.' })
  }

  const messageInput: ProjectClaimMessageInput = { chainId, contract, claimant, metadata, issuedAt }
  const message = buildProjectClaimMessage(messageInput)
  let recovered: string
  try {
    recovered = ethers.utils.verifyMessage(message, signature)
  } catch {
    return res.status(400).json({ ok: false, code: 'INVALID_SIGNATURE', reason: 'Wallet signature is invalid.' })
  }
  if (recovered.toLowerCase() !== claimant.toLowerCase()) {
    return res.status(403).json({ ok: false, code: 'SIGNER_MISMATCH', reason: 'Signature does not match wallet.' })
  }

  const record: ProjectClaimRecord = {
    schema: 'melega.project-claim.v1',
    chainId,
    contract: ethers.utils.getAddress(contract),
    claimant: ethers.utils.getAddress(claimant),
    authorityType: authority.type,
    slug: metadata.handle,
    metadata,
    signature,
    message,
    publishedAt: new Date().toISOString(),
  }
  try {
    await persistProjectClaim(record)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    const message =
      reason === 'HANDLE_ALREADY_CLAIMED'
        ? 'This project handle is already assigned.'
        : reason === 'DURABLE_PROJECT_CLAIMS_STORAGE_UNAVAILABLE'
        ? 'Secure project publication storage is not configured. Claim was not published.'
        : 'Project publication could not be persisted.'
    return res
      .status(reason === 'HANDLE_ALREADY_CLAIMED' ? 409 : 503)
      .json({ ok: false, code: reason, reason: message })
  }
  return res
    .status(201)
    .json({ ok: true, published: true, claim: toPublicProjectClaim(record), projectHref: `/@${record.slug}/` })
}

export default handler
