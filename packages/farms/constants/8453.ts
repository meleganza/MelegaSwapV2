import { baseTokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'MARCO',
    lpAddress: '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
    token: baseTokens.syrup,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 1,
    lpSymbol: 'MARCO-WETH LP',
    lpAddress: '0x19A122BCbB58586beE2C6aabD1601D96b386FbFC',
    token: baseTokens.cake,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 2,
    lpSymbol: 'USDC-WETH LP',
    lpAddress: '0xf2157F527Ad7572691d25371838cbE040e93cDD3',
    token: baseTokens.weth,
    quoteToken: baseTokens.usdc,
  },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
