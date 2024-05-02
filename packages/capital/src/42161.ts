import { ChainId, ERC20Token } from '@pancakeswap/sdk'
import { arbitrumTokens } from '@pancakeswap/tokens'
import { BondConfigBaseProps } from './types'

const getLPBondToken = (address: string) => {
  return new ERC20Token(
    ChainId.ARBITRUM,
    address,
    18,
    'Meleta-LP',
    'Meleta LPs',
  )
}

const bonds: BondConfigBaseProps[] = [
  {
    id: 0,
    name: "usdc",
    displayName: "USDC",
    lpBond: false,
    stableBond: true,
    bondToken: arbitrumTokens.usdc,
    token0: arbitrumTokens.usdc,
    token1: arbitrumTokens.usdc,
    bondAddress: "0x972c3cf752C4e68458e9EE8d73E9c70c136DE2Ca"
  },
  {
    id: 1,
    name: "usdt",
    displayName: "USDT",
    lpBond: false,
    stableBond: true,
    bondToken: arbitrumTokens.usdt,
    token0: arbitrumTokens.usdt,
    token1: arbitrumTokens.usdt,
    bondAddress: "0x261504D65eEE0036E8b600394f59B50716932e9D"
  },
  {
    id: 2,
    name: "frax",
    displayName: "FRAX",
    lpBond: false,
    stableBond: true,
    bondToken: arbitrumTokens.frax,
    token0: arbitrumTokens.frax,
    token1: arbitrumTokens.frax,
    bondAddress: "0x74860d4d485B9d2eeE729F82338Fd5b12cb6fCB5"
  },
  {
    id: 3,
    name: "dai",
    displayName: "DAI",
    lpBond: false,
    stableBond: true,
    bondToken: arbitrumTokens.dai,
    token0: arbitrumTokens.dai,
    token1: arbitrumTokens.dai,
    bondAddress: "0xAd672dbDDE47a7503E213d0810cB38494e1f514A"
  },
].map((b) => ({ ...b, bondToken: b.bondToken.serialize, token0: b.token0.serialize, token1: b.token1.serialize }))

export default bonds
