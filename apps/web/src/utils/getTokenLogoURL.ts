import { getAddress } from '@ethersproject/address'
import memoize from 'lodash/memoize'
import { ChainId, Token } from '@pancakeswap/sdk'

const mapping = {
  [ChainId.ARBITRUM]: 'arbitrum',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.BSC]: 'smartchain',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.SHIMMER2]: 'shimmerevm',
}

const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (token && mapping[token.chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[token.chainId]}/assets/${getAddress(
        token.address,
      )}/logo.png`
    }
    return null
  },
  (t) => `${t.chainId}#${t.address}`,
)

export const getTokenLogoPosition = memoize(
  (token?: Token) => {
    if (token) {
      return `/images/${token.chainId}/tokens/${getAddress(token.address)}.png`
    }
    return null
  },
  (t) => `${t.chainId}#${t.address}`,
)

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => {
    if (address && chainId && mapping[chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${getAddress(address)}/logo.png`
    }
    return null
  },
  (address, chainId) => `${chainId}#${address}`,
)

export default getTokenLogoURL
