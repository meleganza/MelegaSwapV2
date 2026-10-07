/* eslint-disable consistent-return */
import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import { useToast } from '@pancakeswap/uikit'
import { useCallback, useMemo } from 'react'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { ConnectorNames } from 'config/wallet'
import { useAccount, useSwitchNetwork as useSwitchNetworkWallet } from 'wagmi'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { useSessionChainId } from './useSessionChainId'
import { useSwitchNetworkLoading } from './useSwitchNetworkLoading'

export function useSwitchNetworkLocal() {
  const [, setSessionChainId] = useSessionChainId()
  return useCallback(
    (chainId: number) => {
      setSessionChainId(chainId)
      replaceBrowserHistory('chain', chainId === ChainId.BSC ? null : CHAIN_QUERY_NAME[chainId])
    },
    [setSessionChainId],
  )
}

export function useSwitchNetwork() {
  const [loading, setLoading] = useSwitchNetworkLoading()
  const {
    switchNetworkAsync: _switchNetworkAsync,
    isLoading: _isLoading,
    switchNetwork: _switchNetwork,
    ...switchNetworkArgs
  } = useSwitchNetworkWallet()
  const { t } = useTranslation()
  const { toastError } = useToast()
  const { isConnected, connector } = useAccount()

  const switchNetworkLocal = useSwitchNetworkLocal()
  const isLoading = _isLoading || loading

  const switchNetworkAsync = useCallback(
    async (chainId: number): Promise<boolean> => {
      if (isConnected && typeof _switchNetworkAsync === 'function') {
        // A switch is already in flight. Resolving false keeps awaiters from
        // continuing into a transaction on the previous chain.
        if (isLoading) return false
        setLoading(true)
        try {
          await _switchNetworkAsync(chainId)
          // well token pocket
          if (window.ethereum?.isTokenPocket === true) {
            switchNetworkLocal(chainId)
            window.location.reload()
          }
          return true
        } catch {
          // Wallet rejection must not look like success to awaiters.
          toastError(t('Error connecting, please retry and confirm in wallet!'))
          return false
        } finally {
          setLoading(false)
        }
      }
      switchNetworkLocal(chainId)
      // A connected wallet without a programmatic switch did not change chains.
      // Disconnected session switching is the whole operation and did complete.
      return !isConnected
    },
    [isConnected, _switchNetworkAsync, isLoading, setLoading, toastError, t, switchNetworkLocal],
  )

  const switchNetwork = useCallback(
    (chainId: number) => {
      if (isConnected && typeof _switchNetwork === 'function') {
        return _switchNetwork(chainId)
      }
      return switchNetworkLocal(chainId)
    },
    [_switchNetwork, isConnected, switchNetworkLocal],
  )

  const canSwitch = useMemo(
    () =>
      isConnected
        ? !!_switchNetworkAsync &&
          connector.id !== ConnectorNames.WalletConnect &&
          !(
            typeof window !== 'undefined' &&
            // @ts-ignore // TODO: add type later
            (window.ethereum?.isSafePal || window.ethereum?.isMathWallet)
          )
        : true,
    [_switchNetworkAsync, isConnected, connector],
  )

  return {
    ...switchNetworkArgs,
    switchNetwork,
    switchNetworkAsync,
    isLoading,
    canSwitch,
  }
}
