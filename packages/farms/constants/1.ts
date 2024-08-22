import { ethereumTokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'MARCO',
    lpAddress: '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
    token: ethereumTokens.syrup,
    quoteToken: ethereumTokens.weth,
    isTokenOnly: true,
  },
  {
    pid: 1,
    lpSymbol: 'MARCO-MATIC LP',
    lpAddress: '0xD072576d3FD16f7112d11E4c7DA394939eC8c970',
    token: ethereumTokens.cake,
    quoteToken: ethereumTokens.weth,
  },
  {
    pid: 2,
    lpSymbol: 'USDT-MATIC LP',
    lpAddress: '0x762a784E1906E5d630d8C46883eA03c0cbF486A8',
    token: ethereumTokens.usdt,
    quoteToken: ethereumTokens.weth,
   },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
