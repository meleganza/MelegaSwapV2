import { polygonTokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'MARCO',
    lpAddress: '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
    quoteToken: polygonTokens.wmatic,
    token: polygonTokens.cake,
    isTokenOnly: true,
  },
  {
    pid: 1,
    lpSymbol: 'MARCO-MATIC LP',
    lpAddress: '0xD072576d3FD16f7112d11E4c7DA394939eC8c970',
    quoteToken: polygonTokens.wmatic,
    token: polygonTokens.cake,
  },
  {
    pid: 2,
    lpSymbol: 'USDT-MATIC LP',
    lpAddress: '0x762a784E1906E5d630d8C46883eA03c0cbF486A8',
    quoteToken: polygonTokens.weth,
    token: polygonTokens.usdc,
  },
  // {
  //   pid: 3,
  //   lpSymbol: 'MARCO-USDC LP',
  //   lpAddress: '0xe924882796a7F66E1DeE79078494c2955Df39D45',
  //   quoteToken: polygonTokens.usdc,
  //   token: polygonTokens.cake,
  // },
  // {
  //   pid: 4,
  //   lpSymbol: 'MARCO-DAI LP',
  //   lpAddress: '0x4BD111b7197AdEcb36E89B473D3159dE462C26a6',
  //   quoteToken: polygonTokens.dai,
  //   token: polygonTokens.cake,
  // },
  // {
  //   pid: 5,
  //   lpSymbol: 'MATIC-USDT LP',
  //   lpAddress: '0x6D65adF782C202788b1814E39cad2221547C1900',
  //   quoteToken: polygonTokens.wmatic,
  //   token: polygonTokens.usdt,
  // },
  // {
  //   pid: 6,
  //   lpSymbol: 'MATIC-USDC LP',
  //   lpAddress: '0xD80A78f512829458b25A503737cf78d2e0Dc301B',
  //   quoteToken: polygonTokens.wmatic,
  //   token: polygonTokens.usdc,
  // },
  // {
  //   pid: 7,
  //   lpSymbol: 'USDT-USDC LP',
  //   lpAddress: '0xFc345B2Ea902A96A0638a3AfB5864FA61054D6cC',
  //   quoteToken: polygonTokens.usdt,
  //   token: polygonTokens.usdc,
  // },
  // {
  //   pid: 8,
  //   lpSymbol: 'USDC-DAI LP',
  //   lpAddress: '0x57B4bE69034273ce6c2E1252CB070110315FD408',
  //   quoteToken: polygonTokens.usdc,
  //   token: polygonTokens.dai,
  // },
  // {
  //   pid: 9,
  //   lpSymbol: 'WBTC-USDT LP',
  //   lpAddress: '0x51529Fb7d4624F36F222f29656C52e3192CA80eE',
  //   quoteToken: polygonTokens.usdt,
  //   token: polygonTokens.wbtc,
  // },
  // {
  //   pid: 10,
  //   lpSymbol: 'WBTC-DAI LP',
  //   lpAddress: '0x97442C8Ab7B867599F0Db2ECAfa631b127bd3901',
  //   quoteToken: polygonTokens.wbtc,
  //   token: polygonTokens.dai,
  // },
  // {
  //   pid: 11,
  //   lpSymbol: 'MATIC-WETH LP',
  //   lpAddress: '0x4aCF5B2b270aa80460413C808F6f1F0B7d881dBa',
  //   quoteToken: polygonTokens.wmatic,
  //   token: polygonTokens.weth,
  // },
  // {
  //   pid: 12,
  //   lpSymbol: 'USDC-WETH LP',
  //   lpAddress: '0xF921863DC132122873fc78109cC6D491b6bE30ef',
  //   quoteToken: polygonTokens.usdc,
  //   token: polygonTokens.weth,
  // },
  // {
  //   pid: 13,
  //   lpSymbol: 'USDT-WETH LP',
  //   lpAddress: '0xC2bbd56962933a6150C954Ce7655F36EC77be164',
  //   quoteToken: polygonTokens.usdt,
  //   token: polygonTokens.weth,
  // },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
