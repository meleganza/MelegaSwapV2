import { avaxTokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

/**
 * Avalanche farms — factual MasterChef 0x2541DBEa… poolLength=1.
 * pid 0: MARCO token-only stake (lpToken = MARCO).
 */
const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'MARCO',
    lpAddress: '0x8C880e839f3CAcf60F11612087BAbd3307A33720',
    quoteToken: avaxTokens.weth,
    token: avaxTokens.marco,
    isTokenOnly: true,
  },
]

export default farms
