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
    lpAddress: '0x170442A83Fa4837Df61D9C4296732bF45AA9030C',
    token: baseTokens.cake,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 2,
    lpSymbol: 'USDC-WETH LP',
    lpAddress: '0xf2157F527Ad7572691d25371838cbE040e93cDD3',
    token: baseTokens.usdc,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 3,
    lpSymbol: 'YUP-WETH LP',
    lpAddress: '0x6B1D4A9746339a982bAb0461D1c16107C39463B8',
    token: baseTokens.yup,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 4,
    lpSymbol: 'AERO-WETH LP',
    lpAddress: '0x4dA3210d0525604B3fF9f90FA76d7290cdD23541',
    token: baseTokens.aero,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 5,
    lpSymbol: 'BRETT-WETH LP',
    lpAddress: '0x23B1861c1Dc8424db47530b6C25068d14957c74F',
    token: baseTokens.brett,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 6,
    lpSymbol: 'ZRO-RETH LP',
    lpAddress: '0x2fe120a5BC2f0451241c6440b8987eD380935F9E',
    token: baseTokens.clonezro,
    quoteToken: baseTokens.clonereth,
  },
  {
    pid: 7,
    lpSymbol: 'RETH-WETH LP',
    lpAddress: '0x9d6846E66A8F9477331209f8eab1106277d3d663',
    token: baseTokens.clonereth,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 8,
    lpSymbol: 'ZRO-WETH LP',
    lpAddress: '0xBCDd8c9b779125cDA2359B58Dc5044D9F797FF2E',
    token: baseTokens.clonezro,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 9,
    lpSymbol: 'NPC-WETH LP',
    lpAddress: '0x3E1D630670Ca58D320C33979ED640a7333d0A156',
    token: baseTokens.npc,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 10,
    lpSymbol: 'DEGEN-WETH LP',
    lpAddress: '0xBaEadE4e24e58345E688821435d11e5d2d9C6CF7',
    token: baseTokens.degen,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 11,
    lpSymbol: 'RSR-WETH LP',
    lpAddress: '0x0EB9F0583B7Ba30FDa12AB53625d6f362A555515',
    token: baseTokens.rsr,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 12,
    lpSymbol: 'HOE-WETH LP',
    lpAddress: '0xB9CEE7762FA48A00B1855D1b81Fdc91c749906cB',
    token: baseTokens.hoe,
    quoteToken: baseTokens.weth,
  },
  {
    pid: 13,
    lpSymbol: 'YUP-MARCO LP',
    lpAddress: '0xEDdD1EF0062aA6F263dD8dc3be8f38f19125E7BA',
    token: baseTokens.yup,
    quoteToken: baseTokens.cake,
  },
  {
    pid: 14,
    lpSymbol: 'HOE-MARCO LP',
    lpAddress: '0xCDbf73D31CEB9c696155a9843607EAdd96aFAf75',
    token: baseTokens.hoe,
    quoteToken: baseTokens.cake,
  },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
