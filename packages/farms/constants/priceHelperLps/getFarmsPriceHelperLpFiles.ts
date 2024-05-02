import { ChainId } from '@pancakeswap/sdk'
import FarmsBscPriceHelper from './56'
import FarmsEthereumPriceHelper from './1'

export const getFarmsPriceHelperLpFiles = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.BSC:
      return FarmsBscPriceHelper
    case ChainId.ETHEREUM:
      return FarmsEthereumPriceHelper
    case ChainId.ARBITRUM:
      return FarmsEthereumPriceHelper
    default:
      return []
  }
}
