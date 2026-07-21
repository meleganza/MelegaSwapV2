import type { NextApiHandler } from 'next'
import {
  fetchErc20OnChainIdentity,
  getCanonicalPromotionRule,
  getPendingProjectRegistry,
  resolveProjectRegistryLookup,
  serializePendingProjectProfile,
  serializePendingRegistryIndex,
} from 'registry/projects/pending'
import { enrichProject } from 'registry/projects/discovery'
import { serializeProjectManifest } from 'registry/projects/intelligence'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const registry = getPendingProjectRegistry()
    return res.status(200).json(serializePendingRegistryIndex(registry.getAll()))
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body ?? {}
  const contract = typeof body.contract === 'string' ? body.contract.trim() : ''
  const chainId = Number(body.chainId ?? body.chain ?? 56)

  if (!contract || !contract.startsWith('0x')) {
    return res.status(400).json({
      ok: false,
      machine_code: 'INVALID_CONTRACT',
      reason: 'A valid contract address is required.',
    })
  }

  const bodyOnChain =
    typeof body.onChain === 'object' && body.onChain
      ? {
          name: typeof body.onChain.name === 'string' ? body.onChain.name : null,
          symbol: typeof body.onChain.symbol === 'string' ? body.onChain.symbol : null,
        }
      : undefined

  // Always attempt on-chain identity for verified discovery honesty.
  const onChainIdentity = await fetchErc20OnChainIdentity(chainId, contract)
  const onChain = {
    name: bodyOnChain?.name ?? onChainIdentity.name,
    symbol: bodyOnChain?.symbol ?? onChainIdentity.symbol,
  }

  const lookup = resolveProjectRegistryLookup(contract, chainId, onChain)

  if (lookup.tier === 'canonical' && lookup.canonical) {
    const enriched = enrichProject(lookup.canonical)
    return res.status(200).json({
      ok: true,
      tier: 'canonical',
      is_canonical: true,
      project: lookup.canonical,
      machine: serializeProjectManifest(lookup.canonical),
      enriched,
      onChain: {
        ...onChainIdentity,
        name: onChain.name,
        symbol: onChain.symbol,
      },
      promotion: getCanonicalPromotionRule(),
    })
  }

  if (lookup.tier === 'pending' && lookup.pending) {
    const reason =
      onChainIdentity.reasonUnavailable ??
      (!lookup.pending.name.available && !lookup.pending.symbol.available
        ? 'On-chain ERC-20 metadata was not available; pending profile created without a display name.'
        : null)
    return res.status(lookup.pendingCreated ? 201 : 200).json({
      ok: true,
      tier: 'pending',
      is_canonical: false,
      pending_created: Boolean(lookup.pendingCreated),
      profile: lookup.pending,
      machine: lookup.machine ?? serializePendingProjectProfile(lookup.pending),
      summary: lookup.summary,
      onChain: {
        ...onChainIdentity,
        name: onChain.name,
        symbol: onChain.symbol,
      },
      discoveryReason: reason,
      promotion: getCanonicalPromotionRule(),
    })
  }

  return res.status(500).json({
    ok: false,
    machine_code: 'REGISTRY_LOOKUP_FAILED',
    reason: onChainIdentity.reasonUnavailable ?? 'Registry lookup failed.',
    onChain: onChainIdentity,
  })
}

export default handler
