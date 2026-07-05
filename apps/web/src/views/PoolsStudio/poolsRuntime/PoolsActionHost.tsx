import React, { useCallback, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { useModal } from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { useTokenBalance } from 'state/wallet/hooks'
import StakeModal from 'views/Pools/components/Modals/StakeModal'
import VaultStakeModal from 'views/Pools/components/CakeVaultCard/VaultStakeModal'
import { CollectModalContainer, type PoolTxSuccessPayload } from 'views/Pools/components/Modals/CollectModal'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { usePoolsRuntime } from './PoolsRuntimeContext'

export const PoolsActionHost: React.FC = () => {
  const { modalRequest, clearModal } = usePoolsRuntime()
  const { address: account } = useAccount()
  const pool = modalRequest?.pool.rawPool
  const action = modalRequest?.action

  const walletBalance = useTokenBalance(account ?? undefined, pool?.stakingToken)
  const stakingTokenBalance = walletBalance ? getBalanceNumber(walletBalance, pool?.stakingToken?.decimals) : 0
  const isBnbPool = pool?.stakingToken?.symbol === 'BNB'

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

  const [onPresentStake] = useModal(
    pool && action === 'stake' && !pool.vaultKey ? (
      <StakeModal
        isBnbPool={isBnbPool}
        pool={pool}
        stakingTokenBalance={new BigNumber(stakingTokenBalance)}
        stakingTokenPrice={pool.stakingTokenPrice}
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : (
      <></>
    ),
    true,
    true,
    'poolsStudioStake',
  )

  const [onPresentVaultStake] = useModal(
    pool && action === 'stake' && pool.vaultKey ? (
      <VaultStakeModal stakingMax={walletBalance ?? BIG_ZERO} pool={pool} onTxSuccess={handlePoolTxSuccess} />
    ) : (
      <></>
    ),
    true,
    true,
    'poolsStudioVaultStake',
  )

  const [onPresentUnstake] = useModal(
    pool && action === 'unstake' && !pool.vaultKey ? (
      <StakeModal
        isBnbPool={isBnbPool}
        pool={pool}
        stakingTokenBalance={new BigNumber(stakingTokenBalance)}
        stakingTokenPrice={pool.stakingTokenPrice}
        isRemovingStake
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : (
      <></>
    ),
    true,
    true,
    'poolsStudioUnstake',
  )

  const [onPresentVaultUnstake] = useModal(
    pool && action === 'unstake' && pool.vaultKey ? (
      <VaultStakeModal
        stakingMax={pool.userData?.stakedBalance ?? BIG_ZERO}
        pool={pool}
        isRemovingStake
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : (
      <></>
    ),
    true,
    true,
    'poolsStudioVaultUnstake',
  )

  const [onPresentClaim] = useModal(
    pool && action === 'claim' ? (
      <CollectModalContainer
        earningTokenSymbol={pool.earningToken.symbol}
        sousId={pool.sousId}
        isBnbPool={isBnbPool}
        onTxSuccess={handlePoolTxSuccess}
      />
    ) : (
      <></>
    ),
    true,
    true,
    'poolsStudioClaim',
  )

  useEffect(() => {
    if (!pool || !action) return
    if (action === 'stake') {
      if (pool.vaultKey) onPresentVaultStake()
      else onPresentStake()
    } else if (action === 'unstake') {
      if (pool.vaultKey) onPresentVaultUnstake()
      else onPresentUnstake()
    } else if (action === 'claim') {
      onPresentClaim()
    }
    clearModal()
  }, [
    pool,
    action,
    onPresentStake,
    onPresentVaultStake,
    onPresentUnstake,
    onPresentVaultUnstake,
    onPresentClaim,
    clearModal,
  ])

  return null
}

export default PoolsActionHost
