import { useClient, useConnect } from 'wagmi'
import { useEffect } from 'react'
import { loadExtendedWalletConnectors, requiresExtendedWalletSession } from 'utils/wagmi'

const SAFE_ID = 'safe'
let eagerConnectPromise: Promise<unknown> | null = null

const useEagerConnect = () => {
  const client = useClient()
  const { connectAsync } = useConnect()
  useEffect(() => {
    if (eagerConnectPromise || typeof window === 'undefined') return
    const restoreSession = async () => {
      if (requiresExtendedWalletSession()) await loadExtendedWalletConnectors()
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
