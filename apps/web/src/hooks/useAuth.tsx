import { useTranslation } from '@pancakeswap/localization'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { WalletConnectorNotFoundError, WalletSwitchChainError } from '@pancakeswap/ui-wallets/src/errors'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { ConnectorNames } from 'config/wallet'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { loadWalletConnector } from 'utils/wagmi'
import {
  ConnectorNotFoundError,
  SwitchChainError,
  SwitchChainNotSupportedError,
  useConnect,
  useDisconnect,
  useNetwork,
} from 'wagmi'
import { clearUserStates } from '../utils/clearUserStates'
import { useActiveChainId } from './useActiveChainId'
import { useSessionChainId } from './useSessionChainId'

let walletLoginInFlight: Promise<unknown> | null = null

const useAuth = () => {
  const dispatch = useAppDispatch()
  const { connectAsync, connectors } = useConnect()
  const { chain } = useNetwork()
  const { disconnectAsync } = useDisconnect()
  const { chainId } = useActiveChainId()
  const [, setSessionChainId] = useSessionChainId()
  const { t } = useTranslation()

  const login = useCallback(
    (connectorID: ConnectorNames) => {
      if (walletLoginInFlight) return walletLoginInFlight

      const attempt = (async () => {
        try {
          const findConnector =
            (await loadWalletConnector(connectorID)) ?? connectors.find((connector) => connector.id === connectorID)
          if (!findConnector) throw new ConnectorNotFoundError()
          const connected = await connectAsync({ connector: findConnector, chainId })
          if (!connected.chain.unsupported && connected.chain.id !== chainId) {
            replaceBrowserHistory('chain', CHAIN_QUERY_NAME[connected.chain.id])
            setSessionChainId(connected.chain.id)
          }
          return connected
        } catch (error) {
          if (error instanceof ConnectorNotFoundError) {
            throw new WalletConnectorNotFoundError()
          }
          if (error instanceof SwitchChainNotSupportedError || error instanceof SwitchChainError) {
            throw new WalletSwitchChainError(t('Unable to switch network. Please try it on your wallet'))
          }
          // The wallet modal owns the customer-facing error state. Propagating
          // provider errors is essential: swallowing them left MetaMask looking
          // unresponsive and encouraged duplicate permission requests.
          throw error
        }
      })()

      walletLoginInFlight = attempt.finally(() => {
        walletLoginInFlight = null
      })
      return walletLoginInFlight
    },
    [connectors, connectAsync, chainId, setSessionChainId, t],
  )

  const logout = useCallback(async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error(error)
    } finally {
      clearUserStates(dispatch, { chainId: chain?.id })
    }
  }, [disconnectAsync, dispatch, chain?.id])

  return { login, logout }
}

export default useAuth
