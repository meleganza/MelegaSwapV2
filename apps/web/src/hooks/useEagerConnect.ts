import { useClient, useConnect } from 'wagmi'
import { useEffect } from 'react'
import { loadExtendedWalletConnectors, requiresExtendedWalletSession } from 'utils/wagmi'
import { restoreEagerWalletSession } from './restoreEagerWalletSession'

const SAFE_ID = 'safe'
let eagerConnectPromise: Promise<unknown> | null = null

const useEagerConnect = () => {
  const client = useClient()
  const { connectAsync } = useConnect()
  useEffect(() => {
    if (eagerConnectPromise || typeof window === 'undefined') return
    const restoreSession = async () => {
      if (requiresExtendedWalletSession()) {
        try {
          await loadExtendedWalletConnectors()
        } catch {
          // Core injected/MetaMask restore must still proceed without WalletConnect/Safe SDKs.
        }
      }
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
      await restoreEagerWalletSession({
        autoConnect: () => client.autoConnect(),
      })
    }

    eagerConnectPromise = restoreSession().catch(() => undefined)
  }, [client, connectAsync])
}

export default useEagerConnect
