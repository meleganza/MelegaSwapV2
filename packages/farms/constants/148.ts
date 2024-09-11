import { shimmer2Tokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'MARCO',
    lpAddress: '0xC33FEdB84EE8aD97141eF6647D305c9FFBdC7cd6',
    quoteToken: shimmer2Tokens.usdt,
    token: shimmer2Tokens.gtoken,
    isTokenOnly: true
  },
  {
    pid: 1,
    lpSymbol: 'SMR-MARCO LP',
    lpAddress: '0x83bf65b04df6dfc1200d9878a23e27822e2945ca',
    quoteToken: shimmer2Tokens.smr,
    token: shimmer2Tokens.gtoken,
  },
  {
    pid: 2,
    lpSymbol: 'MARCO-USDT LP',
    lpAddress: '0x0fcc9cf18d95baed02ac827a97eba737884a1329',
    quoteToken: shimmer2Tokens.usdt,
    token: shimmer2Tokens.gtoken,
  },
  {
    pid: 3,
    lpSymbol: 'SMR-USDT LP',
    lpAddress: '0x4fc33da508423be75becb7dc735811169d748bb6',
    quoteToken: shimmer2Tokens.usdt,
    token: shimmer2Tokens.smr,
  },
  {
    pid: 4,
    lpSymbol: 'SMR-ETH LP',
    lpAddress: '0xca0d2dca83530c154350193830e7f44d5ab2098e',
    quoteToken: shimmer2Tokens.eth,
    token: shimmer2Tokens.smr,
  },
  {
    pid: 5,
    lpSymbol: 'SMR-WBTC LP',
    lpAddress: '0x81d91016d640be64d5ce5048488767304d505893',
    quoteToken: shimmer2Tokens.wbtc,
    token: shimmer2Tokens.smr,
  },
  {
    pid: 6,
    lpSymbol: 'SMR-BNB LP',
    lpAddress: '0xb2e551ab52b0735722df78e8bf2a1188e8f81ba2',
    quoteToken: shimmer2Tokens.bnb,
    token: shimmer2Tokens.smr,
  },
  {
    pid: 7,
    lpSymbol: 'SMR-USDC LP',
    lpAddress: '0x6a23dafe93b27d0fd91c858df2a878bd2b8f2d6a',
    quoteToken: shimmer2Tokens.usdc,
    token: shimmer2Tokens.smr,
  },
  {
    pid: 8,
    lpSymbol: 'SMR-MATIC LP',
    lpAddress: '0x2bf1298b55258776c08eb1ca233df10a7e1dc89b',
    quoteToken: shimmer2Tokens.matic,
    token: shimmer2Tokens.smr,
  },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
