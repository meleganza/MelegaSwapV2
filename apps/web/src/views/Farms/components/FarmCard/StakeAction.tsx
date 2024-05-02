import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Button, Flex, IconButton, MinusIcon, useModal, useToast, Farm as FarmUI } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallback, useContext, useState, useMemo } from 'react'
import styled from 'styled-components'
import { TransactionResponse } from '@ethersproject/providers'
import { useRouter } from 'next/router'
import { usePriceCakeBusd, useFarmFromPid } from 'state/farms/hooks'
import { useAppDispatch } from 'state'
import { useWeb3React } from '@pancakeswap/wagmi'
import { ChainId, WNATIVE, NATIVE } from '@pancakeswap/sdk'
import BigNumber from 'bignumber.js'
import { useIsBloctoETH } from 'views/Farms'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { formatLpBalance } from '@pancakeswap/utils/formatBalance'
import { pickFarmTransactionTx } from 'state/global/actions'
import { useTransactionAdder, useNonBscFarmPendingTransaction } from 'state/transactions/hooks'
import { FarmTransactionStatus, NonBscFarmStepType } from 'state/transactions/actions'
import WalletModal, { WalletView } from 'components/Menu/UserMenu/WalletModal'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

interface FarmCardActionsProps extends FarmWithStakedValue {
  lpLabel?: string
  addLiquidityUrl?: string
  displayApr?: string
  onStake?: (value: string) => Promise<TransactionResponse>
  onUnstake?: (value: string) => Promise<TransactionResponse>
  onDone?: () => void
  onApprove?: () => Promise<TransactionResponse>
  isApproved?: boolean
  isTokenOnly?: boolean
}

const IconButtonWrapper = styled.div`
  display: flex;
  svg {
    width: 20px;
  }
`

const StakeAction: React.FC<React.PropsWithChildren<FarmCardActionsProps>> = ({
  pid,
  vaultPid,
  quoteToken,
  token,
  lpSymbol,
  lpTokenPrice,
  multiplier,
  apr,
  lpAddress,
  displayApr,
  addLiquidityUrl,
  lpLabel,
  lpTotalSupply,
  tokenAmountTotal,
  quoteTokenAmountTotal,
  userData,
  onStake,
  onUnstake,
  onDone,
  onApprove,
  isApproved,
  isTokenOnly,
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const addTransaction = useTransactionAdder()
  const { account, chainId } = useActiveWeb3React()
  const native = useNativeCurrency()
  const { tokenBalance, stakedBalance, allowance } = userData
  const cakePrice = usePriceCakeBusd()
  const router = useRouter()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, fetchTxResponse, loading: pendingTx } = useCatchTxError()
  const pendingFarm = useNonBscFarmPendingTransaction(lpAddress)
  const isBloctoETH = useIsBloctoETH()

  const isStakeReady = useMemo(() => {
    return ['history', 'archived'].some((item) => router.pathname.includes(item)) || pendingFarm.length > 0
  }, [pendingFarm, router])

  const handleStake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => onStake(amount))
    if (receipt?.status) {
      toastSuccess(
        `${t('Staked')}!`,
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Your funds have been staked in the farm')}
        </ToastDescriptionWithTx>,
      )
      onDone()
    }
  }

  const handleUnstake = async (amount: string) => {
    if (vaultPid) {
      await handleNonBscUnStake(amount)
    } else {
      const receipt = await fetchWithCatchTxError(() => onUnstake(amount))
      if (receipt?.status) {
        toastSuccess(
          `${t('Unstaked')}!`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Your earnings have also been harvested to your wallet')}
          </ToastDescriptionWithTx>,
        )
        onDone()
      }
    }
  }

  const handleNonBscUnStake = async (amountValue: string) => {
    const receipt = await fetchTxResponse(() => onUnstake(amountValue))
    const amountAsBigNumber = new BigNumber(amountValue).times(DEFAULT_TOKEN_DECIMAL)
    const amount = formatLpBalance(new BigNumber(amountAsBigNumber), 18)

    if (receipt) {
      addTransaction(receipt, {
        type: 'non-bsc-farm',
        translatableSummary: {
          text: 'Unstake %amount% %lpSymbol% Token',
          data: { amount, lpSymbol },
        },
        nonBscFarm: {
          type: NonBscFarmStepType.UNSTAKE,
          status: FarmTransactionStatus.PENDING,
          amount,
          lpSymbol,
          lpAddress,
          steps: [
            {
              step: 1,
              chainId,
              tx: receipt.hash,
              status: FarmTransactionStatus.PENDING,
            },
            {
              step: 2,
              chainId: ChainId.BSC,
              tx: '',
              status: FarmTransactionStatus.PENDING,
            },
            {
              step: 3,
              chainId,
              tx: '',
              status: FarmTransactionStatus.PENDING,
            },
          ],
        },
      })

      dispatch(pickFarmTransactionTx({ tx: receipt.hash, chainId }))
      onDone()
    }
  }

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove()
    })
    if (receipt?.status) {
      toastSuccess(t('Contract Enabled'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      onDone()
    }
  }, [onApprove, t, toastSuccess, fetchWithCatchTxError, onDone])

  const [onPresentDeposit] = useModal(
    <FarmUI.DepositModal
      account={account}
      pid={pid}
      lpTotalSupply={lpTotalSupply}
      max={tokenBalance}
      stakedBalance={stakedBalance}
      tokenName={lpSymbol}
      multiplier={multiplier}
      lpPrice={lpTokenPrice}
      lpLabel={lpLabel}
      apr={apr}
      displayApr={displayApr}
      addLiquidityUrl={isTokenOnly ? `/swap?outputCurrency=${token.address}` : `/add/${addLiquidityUrl}`}
      cakePrice={cakePrice}
      showCrossChainFarmWarning={chainId !== ChainId.BSC}
      // crossChainWarningText={crossChainWarningText}
      decimals={18}
      allowance={allowance}
      enablePendingTx={pendingTx}
      onConfirm={handleStake}
      handleApprove={handleApprove}
      isTokenOnly={isTokenOnly}
    />,
    true,
    true,
    `farm-deposit-modal-${pid}`,
  )

  const [onPresentWithdraw] = useModal(
    <FarmUI.WithdrawModal
      max={stakedBalance}
      onConfirm={handleUnstake}
      lpPrice={lpTokenPrice}
      tokenName={lpSymbol}
      showCrossChainFarmWarning={chainId !== ChainId.BSC}
      decimals={18}
      isTokenOnly={isTokenOnly}
    />,
  )

  const renderStakingButtons = () => {
    return stakedBalance.eq(0) ? (
      <Button onClick={onPresentDeposit} disabled={isStakeReady}>
        {isTokenOnly? t('Stake ') + {lpSymbol} : t('Stake LP')}
      </Button>
    ) : (
      <IconButtonWrapper>
        <IconButton mr="6px" variant="tertiary" disabled={pendingFarm.length > 0} onClick={onPresentWithdraw}>
          <MinusIcon color="primary" width="14px" />
        </IconButton>
        <IconButton variant="tertiary" onClick={onPresentDeposit} disabled={isStakeReady || isBloctoETH}>
          <AddIcon color="primary" width="14px" />
        </IconButton>
      </IconButtonWrapper>
    )
  }

  const [onPresentTransactionModal] = useModal(<WalletModal initialView={WalletView.TRANSACTIONS} />)

  const onClickLoadingIcon = () => {
    const { length } = pendingFarm
    if (length) {
      if (length > 1) {
        onPresentTransactionModal()
      } else {
        dispatch(pickFarmTransactionTx({ tx: pendingFarm[0].txid, chainId }))
      }
    }
  }

  // TODO: Move this out to prevent unnecessary re-rendered
  if (!isApproved) {
    return (
      <Button mt="8px" width="100%" disabled={pendingTx || isBloctoETH} onClick={handleApprove}>
        {t('Enable Contract')}
      </Button>
    )
  }

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <FarmUI.StakedLP
        decimals={18}
        stakedBalance={stakedBalance}
        quoteTokenSymbol={WNATIVE[chainId]?.symbol === quoteToken.symbol ? NATIVE[chainId]?.symbol : quoteToken.symbol}
        tokenSymbol={WNATIVE[chainId]?.symbol === token.symbol ? NATIVE[chainId]?.symbol : token.symbol}
        lpTotalSupply={lpTotalSupply}
        lpTokenPrice={lpTokenPrice}
        tokenAmountTotal={tokenAmountTotal}
        quoteTokenAmountTotal={quoteTokenAmountTotal}
        pendingFarmLength={pendingFarm.length}
        onClickLoadingIcon={onClickLoadingIcon}
        isTokenOnly={isTokenOnly}
      />
      {renderStakingButtons()}
    </Flex>
  )
}

export default StakeAction
