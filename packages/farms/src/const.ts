import { FixedNumber } from '@ethersproject/bignumber'

export const FIXED_ZERO = FixedNumber.from(0)
export const FIXED_ONE = FixedNumber.from(1)
export const FIXED_TWO = FixedNumber.from(2)

export const FARM_AUCTION_HOSTING_IN_SECONDS = 691200

export const masterChefAddresses = {
  56: '0x41D5487836452d23f2c467070244E5842B412794',
  8453: '0x149EE9245E5eD52a89Ea777d19AD3A5D87873680',
  42161: '0x0Ac09AbdC688fd67863bf0f62DD0e243dbdf6894',
  137: '0x0Ac09AbdC688fd67863bf0f62DD0e243dbdf6894',
  148: '0x43bF3ff3f6374aDaA914e9657959FAcb4D6d110c',
}

export const nonBSCVaultAddresses = {
  1: '0x2e71B2688019ebdFDdE5A45e6921aaebb15b25fb',
  5: '0xE6c904424417D03451fADd6E3f5b6c26BcC43841',
  148: '0xE6c904424417D03451fADd6E3f5b6c26BcC43841',
}
