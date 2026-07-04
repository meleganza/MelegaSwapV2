import type { NextApiHandler } from 'next'
import {
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

  const onChain =
    typeof body.onChain === 'object' && body.onChain
      ? {
          name: typeof body.onChain.name === 'string' ? body.onChain.name : null,
          symbol: typeof body.onChain.symbol === 'string' ? body.onChain.symbol : null,
        }
      : undefined

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
      promotion: getCanonicalPromotionRule(),
    })
  }

  if (lookup.tier === 'pending' && lookup.pending) {
    return res.status(lookup.pendingCreated ? 201 : 200).json({
      ok: true,
      tier: 'pending',
      is_canonical: false,
      pending_created: Boolean(lookup.pendingCreated),
      profile: lookup.pending,
      machine: lookup.machine ?? serializePendingProjectProfile(lookup.pending),
      summary: lookup.summary,
      promotion: getCanonicalPromotionRule(),
    })
  }

  return res.status(500).json({ ok: false, machine_code: 'REGISTRY_LOOKUP_FAILED' })
}

export default handler
