import { ChainId } from '@pancakeswap/sdk'
import { BondConfigBaseProps } from './types'

let logged = false

export const supportedChainId = [ChainId.ARBITRUM]

export const getBondConfig = async (chainId: ChainId) => {
  try {
    let chainId_ = chainId;
    if (!supportedChainId.includes(chainId)) chainId_ = ChainId.ARBITRUM
    return (await import(`/${chainId_}.ts`)).default.filter(
      (b: BondConfigBaseProps) => b.id !== null,
    ) as BondConfigBaseProps[]
  } catch (error) {
    if (!logged) {
      console.error('Cannot get bond config', error, chainId)
      logged = true
    }
    return []
  }
}

export * from './types'
