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
import { buildDexAssetIndex } from 'lib/dex-asset-index/buildDexAssetIndex'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { bscTokens } from '@pancakeswap/tokens'
import { getProjectClaimByContract, toPublicProjectClaim } from 'lib/project-claims'

type ListedTokenEntry = {
  chainId: number
  address: string
  name?: string
  symbol?: string
  logoURI?: string
}

function resolveDexListing(contract: string, chainId: number) {
  const normalized = contract.toLowerCase()
  const tokenListEntry = (defaultTokenList.tokens as ListedTokenEntry[]).find(
    (token) => token.chainId === chainId && token.address.toLowerCase() === normalized,
  )
  const asset = buildDexAssetIndex().find(
    (candidate) =>
      candidate.chainId === chainId &&
      Boolean(candidate.address) &&
      candidate.address?.toLowerCase() === normalized &&
      candidate.surfaces.trade,
  )
  const packageToken =
    chainId === 56 ? Object.values(bscTokens).find((token) => token?.address?.toLowerCase() === normalized) : undefined
  const legacyProjectLink =
    typeof packageToken?.name === 'string' && /^https?:\/\//i.test(packageToken.name) ? packageToken.name : null

  if (!asset) {
    return {
      listed: false,
      projectClaimed: false,
      registrySlug: null,
      // A token-list identity is useful metadata even when the token does not
      // have a live Melega DEX trade surface yet. Keep `listed` honest while
      // still returning the chain-scoped logo used by the onboarding funnel.
      name: tokenListEntry?.name ?? null,
      symbol: tokenListEntry?.symbol ?? null,
      logo: tokenListEntry?.logoURI ?? null,
      website: null,
      surfaces: null,
    }
  }

  return {
    listed: true,
    projectClaimed: Boolean(asset.registrySlug),
    registrySlug: asset.registrySlug ?? null,
    name: tokenListEntry?.name ?? asset.name ?? null,
    symbol: tokenListEntry?.symbol ?? asset.symbol,
    // Prefer the normalized local asset path; legacy token-list URLs may omit the chain segment.
    logo: asset.logo ?? tokenListEntry?.logoURI ?? null,
    website: packageToken?.projectLink ?? legacyProjectLink,
    surfaces: asset.surfaces,
  }
}

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

  if (!/^0x[a-fA-F0-9]{40}$/.test(contract) || !Number.isInteger(chainId)) {
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
  const detectedDex = resolveDexListing(contract, chainId)
  const publishedClaim = await getProjectClaimByContract(chainId, contract)
  const publicClaim = publishedClaim ? toPublicProjectClaim(publishedClaim) : null
  const dex = {
    ...detectedDex,
    projectClaimed: Boolean(publishedClaim) || detectedDex.projectClaimed,
    registrySlug: publishedClaim?.slug ?? detectedDex.registrySlug,
    name: publishedClaim?.metadata.name ?? detectedDex.name,
    symbol: publishedClaim?.metadata.symbol ?? detectedDex.symbol,
    logo: publishedClaim?.metadata.logo ?? detectedDex.logo,
  }

  if (!onChainIdentity.verifiedDeployment || !onChain.name?.trim() || !onChain.symbol?.trim()) {
    return res.status(422).json({
      ok: false,
      machine_code: 'TOKEN_IDENTITY_UNVERIFIED',
      reason:
        onChainIdentity.reasonUnavailable ??
        'The selected chain did not return verifiable ERC-20 name and symbol metadata for this contract.',
      onChain: onChainIdentity,
      dex,
      claim: publicClaim,
    })
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
      dex,
      claim: publicClaim,
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
        name: onChain.name ?? dex.name,
        symbol: onChain.symbol ?? dex.symbol,
      },
      dex,
      claim: publicClaim,
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
