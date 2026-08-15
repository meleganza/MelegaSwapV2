import { useClient, useConnect } from 'wagmi'
import { useEffect } from 'react'
import { getPersistedWalletConnectorId, loadWalletConnector } from 'utils/wagmi'

const SAFE_ID = 'safe'
let eagerConnectPromise: Promise<unknown> | null = null

const useEagerConnect = () => {
  const client = useClient()
  const { connectAsync } = useConnect()
  useEffect(() => {
    if (eagerConnectPromise || typeof window === 'undefined') return
    const restoreSession = async () => {
      const persistedConnectorId = getPersistedWalletConnectorId()
      if (!persistedConnectorId && window.parent === window) return
      if (persistedConnectorId) await loadWalletConnector(persistedConnectorId)
      const connectorInstance = client.connectors.find((c) => c.id === SAFE_ID && c.ready)
      if (
        connectorInstance &&
        // @ts-ignore
        !window.cy
      ) {
        try {
          await connectAsync({ connector: connectorInstance })
          return
        } catch {
          // Safe apps may not be ready during the first paint. Fall back to
          // wagmi's persisted connector without treating the wallet as lost.
        }
      }
      if (persistedConnectorId === 'metaMask' || persistedConnectorId === 'injected') {
        const provider = (
          window as Window & {
            ethereum?: { request?: (args: { method: string }) => Promise<unknown> }
          }
        ).ethereum
        if (!provider?.request) return
        const accounts = await provider.request({ method: 'eth_accounts' }).catch(() => [])
        // eth_accounts is passive and never opens a permission dialog. If the
        // browser has no previously authorised account, leave reconnection to
        // an explicit MARCO Connect / Connect Wallet interaction.
        if (!Array.isArray(accounts) || accounts.length === 0) return
      }
      await client.autoConnect()
    }

    eagerConnectPromise = restoreSession().catch(() => {
      // A provider can be temporarily unavailable while a mobile wallet or
      // browser extension wakes up. Allow a later remount to retry cleanly.
      eagerConnectPromise = null
    })
  }, [client, connectAsync])
}

export default useEagerConnect
