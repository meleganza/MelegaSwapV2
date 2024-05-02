import { ERC20Token, Token } from '@pancakeswap/sdk'
import { SerializedWrappedToken } from '@pancakeswap/token-lists'

export interface BondConfigBaseProps {
  id: number
  name: string
  displayName: string
  lpBond: boolean
  stableBond: boolean
  bondToken: SerializedWrappedToken
  token0: SerializedWrappedToken
  token1: SerializedWrappedToken
  bondAddress: string
}

export interface SerializedBondPublicData extends BondConfigBaseProps {
  discount?: string
  purchased?: string
  vestingTerm?: string
  marketPrice?: string
  maxBondPrice?: string
  bondPrice?: string
  bondPriceInUSD?: string
}

export interface SerializedBondCalcPublicData extends SerializedBondPublicData {
  lpPrice?: string
  totalLpValue?: string
  totalLpSupply?: string
}

export interface SerializedBondUserData {
  allowance: string
  balance: string
  interestDue: string
  bondMaturationBlock: string
  pendingPayout: string
}

export interface SerializedBond extends SerializedBondCalcPublicData {
  userData?: SerializedBondUserData
}

export interface SerializedVaultPublicData {
  currentIndex?: string
  totalSupply?: string
  marketCap?: string
  circSupply?: string
  fiveDayRate?: string
  stakingAPY?: string
  stakingTVL?: string
  stakingRebase?: string
  marketPrice?: string
  currentBlock?: string
  currentBlockTime?: number
  nextRebase?: string
  rfv?: string
  runway?: string
}

export interface SerializedVaultUserData {
  dcp: {
    balance: string
    allowance: string
  }
  sdcp: {
    balance: string
    allowance: string
  }
}

export interface SerializedVault extends SerializedVaultPublicData {
  userData?: SerializedVaultUserData
}

// export interface SerializedVaultUserData {
//   allowance: string
//   balance: string
//   interestDue: string
//   bondMaturationBlock: string
//   pendingPayout: string
// }

// export interface SerializedVault extends SerializedVaultPublicData {
//   userData?: SerializedVaultUserData
// }

export interface SerializedCapitalState {
  bonds: SerializedBond[]
  vault: SerializedVault
  chainId?: number
  userDataLoaded: boolean
  loadingKeys?: Record<string, boolean>
}