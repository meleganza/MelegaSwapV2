import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { DAI_POLYGON, CAKE, USDC, USDT, WBTC_POLYGON } from '@pancakeswap/tokens'

export const polygonTokens = {
  wmatic: WETH9[ChainId.POLYGON],
  usdt: USDT[ChainId.POLYGON],
  usdc: USDC[ChainId.POLYGON],
  wbtc: WBTC_POLYGON,
  dai: DAI_POLYGON,
  syrup: new ERC20Token(
    ChainId.BASE,
    '0x83A2af056bd05758d5BC704a6Cc7166769E9c939',
    18,
    'MRT',
    'MARCO Reward Token',
    'https://melega.finance/',
  ),
  weth: new ERC20Token(
    ChainId.POLYGON,
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  cake: CAKE[ChainId.POLYGON],
  xoxo: new ERC20Token(
    ChainId.POLYGON,
    '0x0d15DCEe3923AaaB74aAF7E1f70Fd964FC2a0deB',
    18,
    'XOXO',
    'XOXO'
  ),
  dc4: new ERC20Token(
    ChainId.POLYGON,
    '0x07287971C67c5FD87B9421D17e12162f2b952Cc5',
    18,
    '4DC',
    '4DC'
  ),
  teddy: new ERC20Token(
    ChainId.POLYGON,
    '0x9f673304965ce717a068f2361bDBf0e81443038d',
    18,
    'BEAR',
    'TEDDY'
  ),
  nexo: new ERC20Token(
    ChainId.POLYGON,
    '0x41b3966B4FF7b427969ddf5da3627d6AEAE9a48E',
    18,
    'NEXO',
    'Nexo'
  ),
  enj: new ERC20Token(
    ChainId.POLYGON,
    '0xE17d93138442c6Ea22Fc55758FCe6FD765D07Acd',
    18,
    'ENJ',
    'Enjincoin'
  ),
  cro: new ERC20Token(
    ChainId.POLYGON,
    '0xAdA58DF0F643D959C2A47c9D4d4c1a4deFe3F11C',
    8,
    'CRO',
    'Cronos'
  ),
  ixt: new ERC20Token(
    ChainId.POLYGON,
    '0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE',
    18,
    'IXT',
    'PlanetIX'
  ),
  stg: new ERC20Token(
    ChainId.POLYGON,
    '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    18,
    'STG',
    'StargateToken'
  ),
  polydoge: new ERC20Token(
    ChainId.POLYGON,
    '0x8A953CfE442c5E8855cc6c61b1293FA648BAE472',
    18,
    'Polydoge',
    'Polydoge'
  ),
  sand: new ERC20Token(
    ChainId.POLYGON,
    '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
    18,
    'SAND',
    'SAND'
  ),
  edx: new ERC20Token(
    ChainId.POLYGON,
    '0x45a1E48dAF3f6a55efBbD067380f4601300baA7A',
    18,
    'EDX',
    'EADX Token'
  ),
  jonky: new ERC20Token(
    ChainId.POLYGON,
    '0x580C887178A6dcFc323afB8D204651125BAc6712',
    18,
    'JONKY',
    'Call me Jonky'
  ),
  mega: new ERC20Token(
    ChainId.POLYGON,
    '0x2F6B84B7293Be28A5e81D120e3971F020aaf5Eb9',
    18,
    'MEGA',
    'M.E.G.A.'
  ),
  dogelon: new ERC20Token(
    ChainId.POLYGON,
    '0xE0339c80fFDE91F3e20494Df88d4206D86024cdF',
    18,
    'ELON',
    'Dogelon'
  ),
  naka: new ERC20Token(
    ChainId.POLYGON,
    '0x311434160D7537be358930def317AfB606C0D737',
    18,
    'NAKA',
    'Nakamoto Games'
  ),
  dimo: new ERC20Token(
    ChainId.POLYGON,
    '0xE261D618a959aFfFd53168Cd07D12E37B26761db',
    18,
    'DIMO',
    'Dimo'
  ),
  trump: new ERC20Token(
    ChainId.POLYGON,
    '0x5D71Eb13f59FfcBcEC79a676c43BCB2440242e47',
    18,
    'TRUMP',
    'OFFICIAL TRUMP'
  )
}
