import BigNumber from 'bignumber.js'
import { multicallv2, multicallv3 } from 'utils/multicall'
import erc20Abi from 'config/abi/erc20.json'
import cakeAbi from 'config/abi/cake.json'
import cakeVaultAbi from 'config/abi/cakeVaultV2.json'
import { getCakeVaultAddress, getCakeFlexibleSideVaultAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { ChainId } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { convertSharesToCake } from '@pancakeswap/uikit/src/widgets/Pool/helpers/getCakeVaultEarnings'

const cakeVaultV2 = getCakeVaultAddress()
const cakeFlexibleSideVaultV2 = getCakeFlexibleSideVaultAddress()
// export const fetchPublicVaultData = async (cakeVaultAddress = cakeVaultV2) => {
//   try {
//     const calls = ['getPricePerFullShare', 'totalShares', 'totalLockedAmount'].map((method) => ({
//       abi: cakeVaultAbi,
//       address: cakeVaultAddress,
//       name: method,
//     }))

//     const cakeBalanceOfCall = {
//       abi: cakeAbi,
//       address: CAKE[ChainId.BSC].address,
//       name: 'balanceOf',
//       params: [cakeVaultV2],
//     }

//     const [[sharePrice], [shares], totalLockedAmount, [totalDexTokenInVault]] = await multicallv3({
//       calls: [...calls, cakeBalanceOfCall],
//       allowFailure: true,
//     })

//     const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
//     const totalLockedAmountAsBigNumber = totalLockedAmount ? new BigNumber(totalLockedAmount[0].toString()) : BIG_ZERO
//     const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
//     return {
//       totalShares: totalSharesAsBigNumber.toJSON(),
//       totalLockedAmount: totalLockedAmountAsBigNumber.toJSON(),
//       pricePerFullShare: sharePriceAsBigNumber.toJSON(),
//       totalDexTokenInVault: new BigNumber(totalDexTokenInVault.toString()).toJSON(),
//     }
//   } catch (error) {
//     return {
//       totalShares: null,
//       totalLockedAmount: null,
//       pricePerFullShare: null,
//       totalDexTokenInVault: null,
//     }
//   }
// }

export const fetchPublicVaultData = async (chainId: number) => {
  try {
    const calls = [
      'getPricePerFullShare',
      'totalShares',
      'calculateHarvestDexTokenRewards',
      'calculateTotalPendingDexTokenRewards',
    ].map((method) => ({
      address: getCakeVaultAddress(chainId),
      name: method,
    }))
    const [[sharePrice], [shares], [estimatedDexTokenBountyReward], [totalPendingDexTokenHarvest]] = await multicallv2({
      chainId,
      abi: cakeVaultAbi, 
      calls 
    })
    const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
    const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
    const totalDexTokenInVaultEstimate = convertSharesToCake(totalSharesAsBigNumber, sharePriceAsBigNumber)
    console.log("totalDexTokenInVaultEstimate", totalDexTokenInVaultEstimate)
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalDexTokenInVault: totalDexTokenInVaultEstimate.cakeAsBigNumber.toJSON(),
      estimatedDexTokenBountyReward: new BigNumber(estimatedDexTokenBountyReward.toString()).toJSON(),
      totalPendingDexTokenHarvest: new BigNumber(totalPendingDexTokenHarvest.toString()).toJSON(),
    }
  } catch (error) {
    return {
      totalShares: null,
      pricePerFullShare: null,
      totalDexTokenInVault: null,
      estimatedDexTokenBountyReward: null,
      totalPendingDexTokenHarvest: null,
    }
  }
}

export const fetchPublicFlexibleSideVaultData = async (chainId: number) => {
  try {
    const calls = ['getPricePerFullShare', 'totalShares'].map((method) => ({
      address: getCakeVaultAddress(chainId),
      name: method,
    }))

    const cakeBalanceOfCall = {
      address: CAKE[chainId].address,
      name: 'balanceOf',
      params: [getCakeVaultAddress(chainId)],
    }

    const [[sharePrice], [shares]] = await multicallv2({
      chainId,
      abi: cakeVaultAbi, 
      calls 
    })

    const [[totalDexTokenInVault]] = await multicallv2({
      chainId,
      abi: erc20Abi, 
      calls: [cakeBalanceOfCall]
    })

    // const [[sharePrice], [shares], [totalDexTokenInVault]] = await multicallv3({
    //   chainId,
    //   calls: [...calls, cakeBalanceOfCall],
    //   allowFailure: true,
    // })

    const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
    const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalDexTokenInVault: new BigNumber(totalDexTokenInVault.toString()).toJSON(),
    }
  } catch (error) {
    console.log(error)
    return {
      totalShares: null,
      pricePerFullShare: null,
      totalDexTokenInVault: null,
    }
  }
}

export const fetchVaultFees = async (cakeVaultAddress = cakeVaultV2) => {
  try {
    const calls = ['performanceFee', 'callFee', 'withdrawFee', 'withdrawFeePeriod'].map((method) => ({
      address: cakeVaultAddress,
      name: method,
    }))

    const [[performanceFee], [callFee], [withdrawalFee], [withdrawalFeePeriod]] = await multicallv2({ abi: cakeVaultAbi, calls })

    return {
      performanceFee: performanceFee.toNumber(),
      callFee: callFee.toNumber(),
      withdrawalFee: withdrawalFee.toNumber(),
      withdrawalFeePeriod: withdrawalFeePeriod.toNumber(),
    }
  } catch (error) {
    return {
      performanceFee: null,
      callFee: null,
      withdrawalFee: null,
      withdrawalFeePeriod: null,
    }
  }
}

export default fetchPublicVaultData
