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
    lpSymbol: 'MARCO-WETH LP',
    lpAddress: '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E',
    token: ethereumTokens.cake,
    quoteToken: ethereumTokens.weth,
  },
  {
    pid: 2,
    lpSymbol: 'USDC-WETH LP',
    lpAddress: '0x15F6b6B609Cc2e3d8E4a355c76C99B3956954664',
    token: ethereumTokens.usdc,
    quoteToken: ethereumTokens.weth,
  },
  {
    pid: 3,
    lpSymbol: 'LOCO-WETH LP',
    lpAddress: '0x2ee39e16735B194006739C79785EF6F20ADBB007',
    token: ethereumTokens.loco,
    quoteToken: ethereumTokens.weth,
  },
  {
    pid: 4,
    lpSymbol: 'RKIT-WETH LP',
    lpAddress: '0xD3871eDa34472Dd428B24d9A5051f9665D73E1C5',
    token: ethereumTokens.rkit,
    quoteToken: ethereumTokens.weth,
   },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
