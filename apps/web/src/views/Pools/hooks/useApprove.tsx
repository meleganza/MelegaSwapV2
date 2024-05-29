import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import { ethers, Contract } from 'ethers'
import BigNumber from 'bignumber.js'
import { useAppDispatch } from 'state'
import { updateUserAllowance } from 'state/actions'
import { useTranslation } from '@pancakeswap/localization'
import { useCake, useSousChef, useCakeVaultContract } from 'hooks/useContract'
import { useToast } from '@pancakeswap/uikit'
import useLastUpdated from './useLastUpdated'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useAccount } from 'wagmi'
import { ToastDescriptionWithTx } from 'components/Toast'
import { MaxUint256 } from '@ethersproject/constants'
import useCakeApprove from 'hooks/useCakeApprove'
import { useActiveChainId } from 'hooks/useActiveChainId'

// export const useApprovePool = (lpContract: Contract, sousId, earningTokenSymbol) => {
//   const [requestedApproval, setRequestedApproval] = useState(false)
//   const { toastSuccess, toastError } = useToast()
//   const { t } = useTranslation()
//   const dispatch = useAppDispatch()
//   const { account } = useWeb3React()
//   const sousChefContract = useSousChef(sousId)

//   const handleApprove = useCallback(async () => {
//     try {
//       setRequestedApproval(true)
//       const tx = await lpContract.approve(sousChefContract.address, ethers.constants.MaxUint256)
//       const receipt = await tx.wait()

//       dispatch(updateUserAllowance(sousId, account))
//       if (receipt.status) {
//         toastSuccess(
//           t('Contract Enabled'),
//           t('You can now stake in the %symbol% pool!', { symbol: earningTokenSymbol }),
//         )
//         setRequestedApproval(false)
//       } else {
//         // user rejected tx or didn't go thru
//         toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
//         setRequestedApproval(false)
//       }
//     } catch (e) {
//       console.error(e)
//       toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
//     }
//   }, [account, dispatch, lpContract, sousChefContract, sousId, earningTokenSymbol, t, toastError, toastSuccess])

//   return { handleApprove, requestedApproval }
// }

export const useApprovePool = (lpContract: Contract, sousId, earningTokenSymbol) => {
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()
  const { address: account } = useAccount()
  const sousChefContract = useSousChef(sousId, chainId)

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256])
    })
    if (receipt?.status) {
      toastSuccess(
        t('Contract Enabled'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You can now stake in the %symbol% pool!', { symbol: earningTokenSymbol })}
        </ToastDescriptionWithTx>,
      )
      dispatch(updateUserAllowance({ sousId, account }))
    }
  }, [
    account,
    dispatch,
    lpContract,
    sousChefContract,
    sousId,
    earningTokenSymbol,
    t,
    toastSuccess,
    callWithGasPrice,
    fetchWithCatchTxError,
  ])

  return { handleApprove, pendingTx }
}

// Approve MARCO auto pool
export const useVaultApprove = (setLastUpdated: () => void) => {
  const vaultPoolContract = useCakeVaultContract()
  const { t } = useTranslation()

  return useCakeApprove(
    setLastUpdated,
    vaultPoolContract?.address,
    t('You can now stake in the %symbol% vault!', { symbol: 'CAKE' }),
  )
}

export const useCheckVaultApprovalStatus = () => {
  const [isVaultApproved, setIsVaultApproved] = useState(false)
  const { account } = useWeb3React()
  // const cakeContract = useCake()
  const { reader: cakeContract } = useCake()
  const cakeVaultContract = useCakeVaultContract()
  const { lastUpdated, setLastUpdated } = useLastUpdated()
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const response = await cakeContract.allowance(account, cakeVaultContract.address)
        const currentAllowance = new BigNumber(response.toString())
        setIsVaultApproved(currentAllowance.gt(0))
      } catch (error) {
        setIsVaultApproved(false)
      }
    }

    checkApprovalStatus()
  }, [account, cakeContract, cakeVaultContract, lastUpdated])
  
  return { isVaultApproved, setLastUpdated }
}
