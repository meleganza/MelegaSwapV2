import { bscTestnetTokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

/** BNB Testnet farms — populated after LP + MasterChef deployment on chain 97. */
const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'WBNB-USDT LP',
    lpAddress: '0x5F52Ad4bD4f519AE79999400ad8B83A3D002fD92',
    token: bscTestnetTokens.usdt,
    quoteToken: bscTestnetTokens.wbnb,
  },
]

export default farms
