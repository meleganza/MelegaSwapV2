import { arbitrumTokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'MARCO',
    lpAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    quoteToken: arbitrumTokens.weth,
    token: arbitrumTokens.gtoken,
    isTokenOnly: true,
  },
  {
    pid: 1,
    lpSymbol: 'MARCO-ETH LP',
    lpAddress: '0xD658B8EA0175422a069358C388b9880a755055ad',
    quoteToken: arbitrumTokens.weth,
    token: arbitrumTokens.gtoken,
  },
  {
    pid: 2,
    lpSymbol: 'MARCO-USDT LP',
    lpAddress: '0xB5E5c1DCb79394422D2E4DD933867C17dab92fdf',
    quoteToken: arbitrumTokens.usdt,
    token: arbitrumTokens.gtoken,
  },
  {
    pid: 3,
    lpSymbol: 'MARCO-USDC LP',
    lpAddress: '0x1a2c48f37eADdff39A8FDA5Cb8234dCEFCff72DB',
    quoteToken: arbitrumTokens.usdc,
    token: arbitrumTokens.gtoken,
  },
  {
    pid: 4,
    lpSymbol: 'MARCO-DAI LP',
    lpAddress: '0xE47C73e6B09BEeA2757eF425b9B57728A7695F4E',
    quoteToken: arbitrumTokens.dai,
    token: arbitrumTokens.gtoken,
  },
  {
    pid: 5,
    lpSymbol: 'ETH-USDT LP',
    lpAddress: '0x5822a1DDD394172c201876938c5Fed459288554D',
    quoteToken: arbitrumTokens.weth,
    token: arbitrumTokens.usdt,
  },
  {
    pid: 6,
    lpSymbol: 'ETH-USDC LP',
    lpAddress: '0x06f2FEf98cFaC4Ce7D1d61226a50EBf727312291',
    quoteToken: arbitrumTokens.weth,
    token: arbitrumTokens.usdc,
  },
  {
    pid: 7,
    lpSymbol: 'USDT-USDC LP',
    lpAddress: '0x4Cac4361724C182AB9Fad90f2017c440C93454A9',
    quoteToken: arbitrumTokens.usdt,
    token: arbitrumTokens.usdc,
  },
  {
    pid: 8,
    lpSymbol: 'USDC-DAI LP',
    lpAddress: '0xE72D7c6bcfD60F2f4cD9eDEF82A2C1d5c5B3183E',
    quoteToken: arbitrumTokens.usdc,
    token: arbitrumTokens.dai,
  },
  {
    pid: 9,
    lpSymbol: 'WBTC-USDT LP',
    lpAddress: '0x06b04B8692B5C8212370462F2D2a49F1E0E47E16',
    quoteToken: arbitrumTokens.usdt,
    token: arbitrumTokens.wbtc,
  },
  {
    pid: 10,
    lpSymbol: 'WBTC-DAI LP',
    lpAddress: '0x9278734d8bF024Aef4f222C547Fb8A4bccCe9359',
    quoteToken: arbitrumTokens.wbtc,
    token: arbitrumTokens.dai,
  },
  {
    pid: 11,
    lpSymbol: 'ETH-ARB LP',
    lpAddress: '0x54Ca60312dEab72830440f683Ad340255a99E0c4',
    quoteToken: arbitrumTokens.weth,
    token: arbitrumTokens.arb,
  },
  {
    pid: 12,
    lpSymbol: 'USDC-ARB LP',
    lpAddress: '0xd43D76EaEefa76D0b569dd639D8DEBAe58F9F0D3',
    quoteToken: arbitrumTokens.usdc,
    token: arbitrumTokens.arb,
  },
  {
    pid: 13,
    lpSymbol: 'USDT-ARB LP',
    lpAddress: '0x115b2eee8399Df48d10E0A09af10Fe8E9Ed997DA',
    quoteToken: arbitrumTokens.usdt,
    token: arbitrumTokens.arb,
  },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
