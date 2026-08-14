import { ethers } from 'ethers'
import { getProjectRpcUrls } from 'registry/projects/pending/fetchErc20OnChainIdentity'

const OWNER_ABI = ['function owner() view returns (address)', 'function getOwner() view returns (address)']

export type ContractAuthority = {
  address: string
  type: 'owner' | 'getOwner' | 'deployer'
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

export async function resolveContractAuthorities(chainId: number, contract: string): Promise<ContractAuthority[]> {
  if (!ethers.utils.isAddress(contract)) return []
  const urls = getProjectRpcUrls(chainId)
  const found = new Map<string, ContractAuthority>()

  for (const rpcUrl of urls) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
      const code = await provider.getCode(contract)
      if (!code || code === '0x') continue
      const token = new ethers.Contract(contract, OWNER_ABI, provider)
      for (const method of ['owner', 'getOwner'] as const) {
        try {
          const value = await token[method]()
          if (ethers.utils.isAddress(value) && value !== ethers.constants.AddressZero) {
            const address = ethers.utils.getAddress(value)
            found.set(address.toLowerCase(), { address, type: method })
          }
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
  if (deployer) found.set(deployer.toLowerCase(), { address: deployer, type: 'deployer' })
  return [...found.values()]
}
