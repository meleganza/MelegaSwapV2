import { getFarmsPriceHelperLpFiles } from '@pancakeswap/farms/constants/priceHelperLps/getFarmsPriceHelperLpFiles'
import { ChainId } from '@pancakeswap/sdk'
import PoolsEthereumPriceHelper from './pools/1'
import PoolsGoerliPriceHelper from './pools/5'
import PoolsBscPriceHelper from './pools/56'
import PoolsBscTestnetPriceHelper from './pools/97'
import PoolsBasePriceHelper from './pools/8435'

export { getFarmsPriceHelperLpFiles }

export const getPoolsPriceHelperLpFiles = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.BSC:
      return PoolsBscPriceHelper
      case ChainId.ETHEREUM:
        return PoolsEthereumPriceHelper
    case ChainId.BASE:
      return PoolsBasePriceHelper
    case ChainId.POLYGON:
      return PoolsGoerliPriceHelper
    default:
      return []
  }
}
