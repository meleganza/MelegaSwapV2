import { ethers } from 'ethers'
import { getProjectRpcUrls } from 'registry/projects/pending/fetchErc20OnChainIdentity'

const OWNER_ABI = ['function owner() view returns (address)', 'function getOwner() view returns (address)']

export type ContractAuthority = {
  address: string
  type: 'owner' | 'getOwner' | 'deployer'
}

export type ProjectAuthorityState = 'LIVE_OWNER' | 'RENOUNCED_OR_DEAD' | 'UNKNOWN' | 'NO_OWNERSHIP_INTERFACE'

export type ProjectAuthorityDecision = {
  state: ProjectAuthorityState
  ownerAddress: string | null
  authorities: ContractAuthority[]
}

export type PageClaimDecision = {
  allowed: boolean
  authorityType: ContractAuthority['type'] | 'public_registration' | null
  ownerSignatureRequired: boolean
}

export function decidePageClaimAuthority(
  decision: ProjectAuthorityDecision,
  claimant: string,
  existingClaimant?: string | null,
): PageClaimDecision {
  if (existingClaimant && existingClaimant.toLowerCase() !== claimant.toLowerCase()) {
    return { allowed: false, authorityType: null, ownerSignatureRequired: false }
  }
  if (decision.state === 'RENOUNCED_OR_DEAD') {
    return { allowed: true, authorityType: 'public_registration', ownerSignatureRequired: false }
  }
  const authority = decision.authorities.find(
    (candidate) => candidate.address.toLowerCase() === claimant.toLowerCase(),
  )
  return {
    allowed: Boolean(authority),
    authorityType: authority?.type ?? null,
    ownerSignatureRequired: Boolean(authority),
  }
}

const CANONICAL_DEAD_OWNERS = new Set([
  ethers.constants.AddressZero.toLowerCase(),
  '0x000000000000000000000000000000000000dead',
])

export function classifyProjectOwner(value: unknown): ProjectAuthorityDecision | null {
  if (!ethers.utils.isAddress(String(value ?? ''))) return null
  const address = ethers.utils.getAddress(String(value))
  if (CANONICAL_DEAD_OWNERS.has(address.toLowerCase())) {
    return { state: 'RENOUNCED_OR_DEAD', ownerAddress: address, authorities: [] }
  }
  return { state: 'LIVE_OWNER', ownerAddress: address, authorities: [{ address, type: 'owner' }] }
}

async function readExplorerDeployer(chainId: number, contract: string): Promise<string | null> {
  const apiKey = process.env.ETHERSCAN_API_KEY || process.env.BSCSCAN_API_KEY
  if (!apiKey) return null
  try {
    const url = new URL('https://api.etherscan.io/v2/api')
    url.searchParams.set('chainid', String(chainId))
    url.searchParams.set('module', 'contract')
    url.searchParams.set('action', 'getcontractcreation')
    url.searchParams.set('contractaddresses', contract)
    url.searchParams.set('apikey', apiKey)
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(7_000) })
    if (!response.ok) return null
    const payload = await response.json()
    const creator = payload?.result?.[0]?.contractCreator
    return ethers.utils.isAddress(creator) ? ethers.utils.getAddress(creator) : null
  } catch {
    return null
  }
}

export async function resolveProjectAuthority(chainId: number, contract: string): Promise<ProjectAuthorityDecision> {
  if (!ethers.utils.isAddress(contract)) return { state: 'UNKNOWN', ownerAddress: null, authorities: [] }
  const urls = getProjectRpcUrls(chainId)
  let ownershipInterfaceObserved = false

  for (const rpcUrl of urls) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
      const code = await provider.getCode(contract)
      if (!code || code === '0x') continue
      const token = new ethers.Contract(contract, OWNER_ABI, provider)
      for (const method of ['owner', 'getOwner'] as const) {
        try {
          const value = await token[method]()
          const decision = classifyProjectOwner(value)
          if (!decision) continue
          ownershipInterfaceObserved = true
          if (decision.state === 'RENOUNCED_OR_DEAD') return decision
          return { ...decision, authorities: decision.authorities.map((authority) => ({ ...authority, type: method })) }
        } catch {
          // Many ERC-20 contracts expose only one ownership convention.
        }
      }
      break
    } catch {
      // Try the next canonical RPC.
    }
  }

  const deployer = await readExplorerDeployer(chainId, contract)
  if (deployer) {
    return {
      state: ownershipInterfaceObserved ? 'UNKNOWN' : 'NO_OWNERSHIP_INTERFACE',
      ownerAddress: null,
      authorities: [{ address: deployer, type: 'deployer' }],
    }
  }
  return {
    state: ownershipInterfaceObserved ? 'UNKNOWN' : 'NO_OWNERSHIP_INTERFACE',
    ownerAddress: null,
    authorities: [],
  }
}

export async function resolveContractAuthorities(chainId: number, contract: string): Promise<ContractAuthority[]> {
  return (await resolveProjectAuthority(chainId, contract)).authorities
}
