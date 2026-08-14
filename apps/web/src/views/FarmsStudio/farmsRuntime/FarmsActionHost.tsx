import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from '@pancakeswap/localization'
import { Farm as FarmUI, useModal, useToast } from '@pancakeswap/uikit'
import { TransactionResponse } from '@ethersproject/providers'
import { ChainId } from '@pancakeswap/sdk'
import { ToastDescriptionWithTx } from 'components/Toast'
import { BASE_ADD_LIQUIDITY_URL, DEFAULT_TOKEN_DECIMAL } from 'config'
import { useWeb3React } from '@pancakeswap/wagmi'
import useCatchTxError from 'hooks/useCatchTxError'
import { useERC20 } from 'hooks/useContract'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync } from 'state/farms'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { pickFarmTransactionTx } from 'state/global/actions'
import { FarmTransactionStatus, NonBscFarmStepType } from 'state/transactions/actions'
import { useTransactionAdder } from 'state/transactions/hooks'
import { formatLpBalance, getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import useApproveFarm from 'views/Farms/hooks/useApproveFarm'
import useHarvestFarm from 'views/Farms/hooks/useHarvestFarm'
import useStakeFarms from 'views/Farms/hooks/useStakeFarms'
import useUnstakeFarms from 'views/Farms/hooks/useUnstakeFarms'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { useFarmsRuntime } from './FarmsRuntimeContext'
import FarmHarvestConfirmModal from './FarmHarvestConfirmModal'

const ERC20_PLACEHOLDER = '0x0000000000000000000000000000000000000000'

const IdlePlaceholder = () => null

/**
 * Bridges Studio requestModal → Pancake useModal.
 * updateOnPropsChange must stay false — clearing modalRequest must never
 * replace an open dialog with <></> (orphan purple overlay).
 */
export const FarmsActionHost: React.FC = () => {
  const { modalRequest, clearModal } = useFarmsRuntime()
  const farm = modalRequest?.farm.rawFarm
  const action = modalRequest?.action
  const displayApr = modalRequest?.farm.displayApr
  const farmLabel = modalRequest?.farm.label ?? farm?.lpSymbol ?? 'Farm'
  const requestKey = farm && action ? `${farm.pid}:${action}` : null
  const presentedKeyRef = useRef<string | null>(null)

  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const dispatch = useAppDispatch()
  const addTransaction = useTransactionAdder()
  const cakePrice = usePriceCakeBusd()
  const { fetchWithCatchTxError, fetchTxResponse, loading: pendingTx } = useCatchTxError()

  const pid = farm?.pid ?? 0
  const lpAddress = farm?.lpAddress ?? ''
  const lpContract = useERC20(lpAddress && lpAddress.length >= 42 ? lpAddress : ERC20_PLACEHOLDER)
  const { onStake } = useStakeFarms(pid, chainId ?? 56)
  const { onUnstake } = useUnstakeFarms(pid, chainId ?? 56)
  const { onApprove } = useApproveFarm(lpContract, chainId ?? 56)
  const { onReward } = useHarvestFarm(pid, chainId ?? 56)

  const onDone = useCallback(() => {
    if (account && chainId && pid) {
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid], chainId }))
    }
  }, [account, chainId, pid, dispatch])

  const userData = farm?.userData
  const tokenBalance = userData?.tokenBalance
  const stakedBalance = userData?.stakedBalance
  const allowance = userData?.allowance
  const earnings = userData?.earnings

  const liquidityUrlPathParts = useMemo(() => {
    if (!farm?.quoteToken?.address || !farm?.token?.address || !chainId) return ''
    return getLiquidityUrlPathParts({
      quoteTokenAddress: farm.quoteToken.address,
      tokenAddress: farm.token.address,
      chainId,
    })
  }, [farm, chainId])

  const addLiquidityUrl = liquidityUrlPathParts ? `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}` : '/add'
  const isTokenOnly = farm?.isTokenOnly

  const handleStake = useCallback(
    async (amount: string) => {
      const receipt = await fetchWithCatchTxError(() => onStake(amount))
      if (receipt?.status) {
        toastSuccess(
          `${t('Staked')}!`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {isTokenOnly ? t('Your funds have been staked in the pool') : t('Your funds have been staked in the farm')}
          </ToastDescriptionWithTx>,
        )
        onDone()
        emitCivilizationEvent('farm_staked', 'farms', { pid, txHash: receipt.transactionHash })
      }
    },
    [fetchWithCatchTxError, onStake, toastSuccess, t, isTokenOnly, onDone, pid],
  )

  const handleUnstake = useCallback(
    async (amount: string) => {
      if (farm?.vaultPid) {
        const receipt = await fetchTxResponse(() => onUnstake(amount))
        const amountAsBigNumber = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL)
        const amountLabel = formatLpBalance(new BigNumber(amountAsBigNumber), 18)
        if (receipt) {
          addTransaction(receipt, {
            type: 'non-bsc-farm',
            translatableSummary: {
              text: 'Unstake %amount% %lpSymbol% Token',
              data: { amount: amountLabel, lpSymbol: farm.lpSymbol },
            },
            nonBscFarm: {
              type: NonBscFarmStepType.UNSTAKE,
              status: FarmTransactionStatus.PENDING,
              amount: amountLabel,
              lpSymbol: farm.lpSymbol,
              lpAddress,
              steps: [
                { step: 1, chainId: chainId!, tx: receipt.hash, status: FarmTransactionStatus.PENDING },
                { step: 2, chainId: ChainId.BSC, tx: '', status: FarmTransactionStatus.PENDING },
                { step: 3, chainId: chainId!, tx: '', status: FarmTransactionStatus.PENDING },
              ],
            },
          })
          dispatch(pickFarmTransactionTx({ tx: receipt.hash, chainId: chainId! }))
          onDone()
        }
        return
      }
      const receipt = await fetchWithCatchTxError(() => onUnstake(amount))
      if (receipt?.status) {
        toastSuccess(
          `${t('Unstaked')}!`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Your earnings have also been harvested to your wallet')}
          </ToastDescriptionWithTx>,
        )
        onDone()
        emitCivilizationEvent('farm_withdrawn', 'farms', { pid, txHash: receipt.transactionHash })
      }
    },
    [
      farm,
      fetchTxResponse,
      onUnstake,
      addTransaction,
      lpAddress,
      chainId,
      dispatch,
      onDone,
      fetchWithCatchTxError,
      toastSuccess,
      t,
      pid,
    ],
  )

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => onApprove())
    if (receipt?.status) {
      toastSuccess(t('Contract Enabled'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      onDone()
    }
  }, [onApprove, t, toastSuccess, fetchWithCatchTxError, onDone])

  const handleHarvest = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => onReward() as Promise<TransactionResponse>)
    if (receipt?.status) {
      toastSuccess(
        `${t('Harvested')}!`,
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'MARCO' })}
        </ToastDescriptionWithTx>,
      )
      onDone()
      emitCivilizationEvent('farm_claimed', 'farms', { pid, txHash: receipt.transactionHash })
    }
  }, [fetchWithCatchTxError, onReward, toastSuccess, t, onDone, pid])

  const claimableLabel = useMemo(() => {
    if (!earnings) return '—'
    return `${getBalanceNumber(earnings).toFixed(4)} MARCO`
  }, [earnings])

  const claimableUsdLabel = useMemo(() => {
    if (!earnings || !cakePrice || cakePrice.isNaN() || cakePrice.isZero()) return null
    const usd = getBalanceNumber(earnings) * cakePrice.toNumber()
    if (!Number.isFinite(usd)) return null
    return `$${usd.toFixed(2)}`
  }, [earnings, cakePrice])

  const depositNode =
    farm && action === 'stake' ? (
      <FarmUI.DepositModal
        account={account}
        pid={pid}
        lpTotalSupply={farm.lpTotalSupply}
        max={tokenBalance}
        stakedBalance={stakedBalance}
        tokenName={farm.lpSymbol}
        multiplier={farm.multiplier}
        lpPrice={farm.lpTokenPrice}
        lpLabel={farm.lpSymbol}
        apr={farm.apr}
        displayApr={displayApr}
        addLiquidityUrl={isTokenOnly ? `/swap?outputCurrency=${farm.token.address}` : `/add/${addLiquidityUrl}`}
        cakePrice={cakePrice}
        showCrossChainFarmWarning={chainId !== ChainId.BSC}
        decimals={18}
        allowance={allowance}
        enablePendingTx={pendingTx}
        onConfirm={handleStake}
        handleApprove={handleApprove}
        isTokenOnly={isTokenOnly}
      />
    ) : null

  const withdrawNode =
    farm && action === 'unstake' ? (
      <FarmUI.WithdrawModal
        max={stakedBalance}
        onConfirm={handleUnstake}
        lpPrice={farm.lpTokenPrice}
        tokenName={farm.lpSymbol}
        showCrossChainFarmWarning={chainId !== ChainId.BSC}
        decimals={18}
        isTokenOnly={isTokenOnly}
      />
    ) : null

  const harvestNode =
    farm && action === 'claim' ? (
      <FarmHarvestConfirmModal
        farmLabel={farmLabel}
        rewardSymbol="MARCO"
        claimableLabel={claimableLabel}
        claimableUsdLabel={claimableUsdLabel}
        onConfirm={handleHarvest}
      />
    ) : null

  const [onPresentDeposit] = useModal(depositNode ?? <IdlePlaceholder />, true, false, 'farmsStudioDeposit')
  const [onPresentWithdraw] = useModal(withdrawNode ?? <IdlePlaceholder />, true, false, 'farmsStudioWithdraw')
  const [onPresentHarvest] = useModal(harvestNode ?? <IdlePlaceholder />, true, false, 'farmsStudioHarvest')

  useEffect(() => {
    if (!requestKey || !farm || !action) return
    if (presentedKeyRef.current === requestKey) return

    if (action === 'stake') {
      if (!depositNode) return
      onPresentDeposit()
    } else if (action === 'unstake') {
      if (!withdrawNode) return
      onPresentWithdraw()
    } else if (action === 'claim') {
      if (!harvestNode) return
      onPresentHarvest()
    } else {
      return
    }

    presentedKeyRef.current = requestKey
    clearModal()
  }, [
    requestKey,
    farm,
    action,
    depositNode,
    withdrawNode,
    harvestNode,
    onPresentDeposit,
    onPresentWithdraw,
    onPresentHarvest,
    clearModal,
  ])

  useEffect(() => {
    if (!modalRequest) {
      const t = window.setTimeout(() => {
        presentedKeyRef.current = null
      }, 300)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [modalRequest])

  return null
}

export default FarmsActionHost
