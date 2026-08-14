import React, { useCallback, useEffect, useRef } from 'react'
import BigNumber from 'bignumber.js'
import { useModal } from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'
import { useLiveCurrencyBalance, useTokenBalance } from 'state/wallet/hooks'
import StakeModal from 'views/Pools/components/Modals/StakeModal'
import VaultStakeModal from 'views/Pools/components/CakeVaultCard/VaultStakeModal'
import { CollectModalContainer, type PoolTxSuccessPayload } from 'views/Pools/components/Modals/CollectModal'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { usePoolsRuntime } from './PoolsRuntimeContext'

/**
 * Bridges Studio requestModal → Pancake useModal.
 * Critical: updateOnPropsChange must stay false. Clearing modalRequest must never
 * replace an open dialog with <></> (orphan purple overlay).
 */
export const PoolsActionHost: React.FC = () => {
  const { modalRequest, clearModal } = usePoolsRuntime()
  const { address: account } = useAccount()
  const presentedKeyRef = useRef<string | null>(null)

  const pool = modalRequest?.pool.rawPool
  const action = modalRequest?.action
  const requestKey = pool && action ? `${pool.sousId}:${action}:${pool.vaultKey ? 'vault' : 'std'}` : null

  const legacyWalletBalance = useTokenBalance(account ?? undefined, pool?.stakingToken)
  const liveWalletBalance = useLiveCurrencyBalance(account ?? undefined, pool?.stakingToken)
  const walletBalance = liveWalletBalance.balance ?? legacyWalletBalance
  // StakeModal expects the raw token-unit BigNumber and applies decimals itself.
  // Converting to a JS number here caused the balance to be scaled twice and could
  // surface as NaN for large balances.
  const stakingTokenBalance = walletBalance?.quotient
    ? new BigNumber(walletBalance.quotient.toString())
    : pool?.userData?.stakingTokenBalance ?? BIG_ZERO
  const stakeBalanceResolved = Boolean(walletBalance || liveWalletBalance.error || !account)
  const isBnbPool = pool?.stakingToken?.symbol === 'BNB'
  const pendingReward = pool?.userData?.pendingReward ?? BIG_ZERO
  const pendingRewardDisplay = pool
    ? getFullDisplayBalance(pendingReward, pool.earningToken.decimals, Math.min(pool.earningToken.decimals, 8))
    : '0'
  const pendingRewardUsd = pool ? new BigNumber(pendingRewardDisplay).times(pool.earningTokenPrice || 0).toNumber() : 0

  const handlePoolTxSuccess = useCallback((payload: PoolTxSuccessPayload) => {
    if (payload.action === 'stake') {
      emitCivilizationEvent('pool_staked', 'pools', { sousId: payload.sousId, txHash: payload.txHash })
      return
    }
    if (payload.action === 'unstake') {
      emitCivilizationEvent('pool_unstaked', 'pools', { sousId: payload.sousId, txHash: payload.txHash })
      return
    }
    emitCivilizationEvent('pool_claimed', 'pools', { sousId: payload.sousId, txHash: payload.txHash })
  }, [])

  const stakeNode =
    pool && action === 'stake' && !pool.vaultKey ? (
      <StakeModal
        isBnbPool={isBnbPool}
        pool={pool}
        stakingTokenBalance={stakingTokenBalance}
        stakingTokenPrice={pool.stakingTokenPrice}
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : null

  const vaultStakeNode =
    pool && action === 'stake' && pool.vaultKey ? (
      <VaultStakeModal stakingMax={stakingTokenBalance} pool={pool} onTxSuccess={handlePoolTxSuccess} />
    ) : null

  const unstakeNode =
    pool && action === 'unstake' && !pool.vaultKey ? (
      <StakeModal
        isBnbPool={isBnbPool}
        pool={pool}
        stakingTokenBalance={stakingTokenBalance}
        stakingTokenPrice={pool.stakingTokenPrice}
        isRemovingStake
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : null

  const vaultUnstakeNode =
    pool && action === 'unstake' && pool.vaultKey ? (
      <VaultStakeModal
        stakingMax={pool.userData?.stakedBalance ?? BIG_ZERO}
        pool={pool}
        isRemovingStake
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : null

  const claimNode =
    pool && action === 'claim' ? (
      <CollectModalContainer
        earningTokenSymbol={pool.earningToken.symbol}
        fullBalance={pendingRewardDisplay}
        formattedBalance={pendingRewardDisplay}
        earningsDollarValue={Number.isFinite(pendingRewardUsd) ? pendingRewardUsd : 0}
        sousId={pool.sousId}
        isBnbPool={isBnbPool}
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : null

  // updateOnPropsChange=false — never swap open dialog for null/empty after clearModal
  const [onPresentStake] = useModal(stakeNode ?? <StakeModalPlaceholder />, true, false, 'poolsStudioStake')
  const [onPresentVaultStake] = useModal(
    vaultStakeNode ?? <StakeModalPlaceholder />,
    true,
    false,
    'poolsStudioVaultStake',
  )
  const [onPresentUnstake] = useModal(unstakeNode ?? <StakeModalPlaceholder />, true, false, 'poolsStudioUnstake')
  const [onPresentVaultUnstake] = useModal(
    vaultUnstakeNode ?? <StakeModalPlaceholder />,
    true,
    false,
    'poolsStudioVaultUnstake',
  )
  const [onPresentClaim] = useModal(claimNode ?? <StakeModalPlaceholder />, true, false, 'poolsStudioClaim')

  useEffect(() => {
    if (!requestKey || !pool || !action) return
    if (presentedKeyRef.current === requestKey) return

    if (action === 'stake') {
      if (!stakeBalanceResolved) return
      if (pool.vaultKey) {
        if (!vaultStakeNode) return
        onPresentVaultStake()
      } else {
        if (!stakeNode) return
        onPresentStake()
      }
    } else if (action === 'unstake') {
      if (pool.vaultKey) {
        if (!vaultUnstakeNode) return
        onPresentVaultUnstake()
      } else {
        if (!unstakeNode) return
        onPresentUnstake()
      }
    } else if (action === 'claim') {
      if (!claimNode) return
      onPresentClaim()
    } else {
      return
    }

    presentedKeyRef.current = requestKey
    // Clear request so inventory re-renders do not re-fire; do not touch open modal node.
    clearModal()
  }, [
    requestKey,
    pool,
    action,
    stakeNode,
    vaultStakeNode,
    unstakeNode,
    vaultUnstakeNode,
    claimNode,
    onPresentStake,
    onPresentVaultStake,
    onPresentUnstake,
    onPresentVaultUnstake,
    onPresentClaim,
    clearModal,
    stakeBalanceResolved,
  ])

  useEffect(() => {
    if (!modalRequest) {
      // Allow a fresh open of the same pool/action after dismiss + new request
      const t = window.setTimeout(() => {
        presentedKeyRef.current = null
      }, 300)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [modalRequest])

  return null
}

/** Never presented — satisfies useModal's ReactNode when idle. */
const StakeModalPlaceholder = () => null

export default PoolsActionHost
